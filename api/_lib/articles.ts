import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool, isDuplicateEntryError, withTransaction } from './db';
import { HttpError } from './http';
import { deleteObjectsWithPrefix } from './s3';
import { articlePrefix } from './s3Keys';
import type { ArticleTag } from './validation';

export type ArticleStatus = 'draft' | 'processing' | 'ready' | 'published' | 'failed';

export interface ArticleRow extends RowDataPacket {
  id: string;
  slug: string | null;
  title: string | null;
  subtitle: string | null;
  category: string | null;
  tags: ArticleTag[] | null;
  featured: number; // MySQL BOOLEAN is TINYINT(1) — mysql2 returns 0/1, not a JS boolean.
  status: ArticleStatus;
  structured_content: unknown | null;
  source_pdf_s3_key: string | null;
  processing_error: string | null;
  processed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  scheduled_publish_at: Date | null;
  scheduled_unpublish_at: Date | null;
  first_published_at: Date | null;
}

export interface ImageRow extends RowDataPacket {
  id: string;
  article_id: string;
  s3_key: string;
  position: number;
  alt_text: string | null;
  caption: string | null;
  role: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function createDraftArticle(): Promise<ArticleRow> {
  const id = randomUUID();
  await getPool().query(`INSERT INTO news_articles (id, status) VALUES (:id, 'draft')`, { id });
  const article = await getArticleById(id);
  if (!article) throw new Error('Failed to read back newly created draft article');
  return article;
}

export async function getArticleById(id: string): Promise<ArticleRow | null> {
  const [rows] = await getPool().query<ArticleRow[]>(`SELECT * FROM news_articles WHERE id = :id LIMIT 1`, { id });
  return rows[0] ?? null;
}

/** Throws a clean 404 — the shared "load or fail" shape every handler that operates on an existing article needs. */
export async function getArticleOrThrow(id: string): Promise<ArticleRow> {
  const article = await getArticleById(id);
  if (!article) throw new HttpError(404, 'Article not found');
  return article;
}

export async function getArticleImages(articleId: string): Promise<ImageRow[]> {
  const [rows] = await getPool().query<ImageRow[]>(
    `SELECT * FROM news_article_images WHERE article_id = :articleId ORDER BY \`position\` ASC`,
    { articleId },
  );
  return rows;
}

/** Most-recently-updated first, capped at 100 — the internal review queue is not expected to grow past that for a long time; add real pagination if it ever does. */
export async function listArticles(): Promise<ArticleRow[]> {
  const [rows] = await getPool().query<ArticleRow[]>(`SELECT * FROM news_articles ORDER BY updated_at DESC LIMIT 100`);
  return rows;
}

export interface ArticleMetadataUpdate {
  title?: string | null;
  slug?: string | null;
  subtitle?: string | null;
  category?: string | null;
  tags?: ArticleTag[] | null;
  featured?: boolean;
  /** Pre-validated (via validateStructuredContent) by the caller — this function never validates, only persists. */
  structuredContent?: unknown;
  /** Pre-validated (via validateScheduleUpdate) by the caller — this function never validates, only persists. */
  scheduledPublishAt?: Date | null;
  scheduledUnpublishAt?: Date | null;
}

/** Throws HttpError(409) on a duplicate slug rather than a raw DB error. */
export async function updateArticleMetadata(id: string, update: ArticleMetadataUpdate): Promise<void> {
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  if ('title' in update) {
    fields.push('title = :title');
    params.title = update.title ?? null;
  }
  if ('slug' in update) {
    fields.push('slug = :slug');
    params.slug = update.slug ?? null;
  }
  if ('subtitle' in update) {
    fields.push('subtitle = :subtitle');
    params.subtitle = update.subtitle ?? null;
  }
  if ('category' in update) {
    fields.push('category = :category');
    params.category = update.category ?? null;
  }
  if ('tags' in update) {
    fields.push('tags = CAST(:tags AS JSON)');
    params.tags = update.tags ? JSON.stringify(update.tags) : null;
  }
  if ('featured' in update) {
    fields.push('featured = :featured');
    params.featured = update.featured ? 1 : 0;
  }
  if ('structuredContent' in update) {
    fields.push('structured_content = CAST(:structuredContent AS JSON)');
    params.structuredContent = JSON.stringify(update.structuredContent);
  }
  if ('scheduledPublishAt' in update) {
    fields.push('scheduled_publish_at = :scheduledPublishAt');
    params.scheduledPublishAt = update.scheduledPublishAt ?? null;
  }
  if ('scheduledUnpublishAt' in update) {
    fields.push('scheduled_unpublish_at = :scheduledUnpublishAt');
    params.scheduledUnpublishAt = update.scheduledUnpublishAt ?? null;
  }
  if (fields.length === 0) return;

  try {
    // mysql2's TS overloads don't model the `namedPlaceholders: true` object-params
    // shape cleanly for a dynamically-built field list — this works correctly at
    // runtime (verified against a real MySQL 8 instance; see the Phase 1 report).
    await getPool().query(`UPDATE news_articles SET ${fields.join(', ')} WHERE id = :id`, params as never);
  } catch (err) {
    if (isDuplicateEntryError(err)) throw new HttpError(409, 'That slug is already in use by another article');
    throw err;
  }
}

/**
 * Publish requirements (checked here, not just in the handler, so the rule
 * can never be bypassed by a future second caller): title, slug, and
 * structured_content must all be present, and status must already be
 * `ready` (first publish) or `published` (an idempotent re-publish after an
 * edit).
 *
 * `published_at` = start of the CURRENT publication period: stamped fresh
 * only on an actual ready->published transition. A redundant re-publish
 * call on an already-published article leaves it untouched — publishing
 * something that's already live isn't a new period starting.
 *
 * `first_published_at` = the first-ever successful publish, permanently —
 * `COALESCE(first_published_at, CURRENT_TIMESTAMP)` sets it exactly once
 * and is a no-op on every subsequent publish (redundant or a genuine
 * republish after an unpublish), since `unpublishArticle` never touches it.
 *
 * A manual publish always overrides any pending automatic one:
 * `scheduled_publish_at` is unconditionally cleared. A pending
 * `scheduled_unpublish_at`, if still in the future, is deliberately
 * preserved (publishing early doesn't cancel an intentionally-scheduled end
 * date) — but a past-due one (which should never really happen, but could
 * via a rare timing edge case) is cleared rather than left dangling.
 *
 * The transition itself is one atomic conditional UPDATE
 * (`WHERE status IN ('ready','published')`) rather than the previous
 * check-then-write — `affectedRows === 0` after the initial status check
 * passed means another request raced this one between the read and the
 * write, so it's surfaced as a 409 rather than silently doing nothing.
 */
export async function publishArticle(id: string): Promise<void> {
  const article = await getArticleOrThrow(id);
  if (article.status !== 'ready' && article.status !== 'published') {
    throw new HttpError(409, `Cannot publish an article with status "${article.status}": process it to "ready" first`);
  }
  if (!article.title) throw new HttpError(422, 'Article has no title');
  if (!article.slug) throw new HttpError(422, 'Article has no slug');
  if (!article.structured_content) throw new HttpError(422, 'Article has no structured content');

  // `published_at`'s CASE must be listed BEFORE `status = 'published'` in
  // this SET clause: MySQL evaluates a single UPDATE's SET assignments
  // left to right, and an expression referencing a column already
  // assigned earlier in the SAME statement sees that NEW value, not the
  // row's original one. With `status = 'published'` listed first, `CASE
  // WHEN status = 'ready'` would always see the already-updated
  // 'published' value and therefore never be true — silently leaving
  // published_at NULL forever on a real first publish. Caught only by a
  // real-MySQL integration test; a hand-written JS simulation of the
  // intended semantics (which checks `wasReady` before mutating) doesn't
  // reproduce this MySQL-specific evaluation-order behavior at all.
  const [result] = await getPool().query(
    `UPDATE news_articles
     SET published_at = CASE WHEN status = 'ready' THEN CURRENT_TIMESTAMP ELSE published_at END,
         first_published_at = COALESCE(first_published_at, CURRENT_TIMESTAMP),
         scheduled_publish_at = NULL,
         scheduled_unpublish_at = CASE
           WHEN scheduled_unpublish_at IS NOT NULL AND scheduled_unpublish_at > CURRENT_TIMESTAMP THEN scheduled_unpublish_at
           ELSE NULL
         END,
         status = 'published'
     WHERE id = :id AND status IN ('ready', 'published')`,
    { id },
  );
  if ((result as { affectedRows: number }).affectedRows === 0) {
    throw new HttpError(409, 'Article status changed before this publish could be applied: reload and try again');
  }
}

/**
 * published -> ready. `published_at` is cleared — `published_at` is
 * non-NULL if and only if the article is currently live, so "is this
 * published right now" is always a plain `status === 'published'` check.
 * `first_published_at` is never touched here (see its own field doc).
 *
 * Cancels `scheduled_unpublish_at` unconditionally — the article is being
 * withdrawn right now, so a pending automatic withdrawal is moot. Never
 * touches `scheduled_publish_at`: a currently-published article should
 * never have one set (setting one requires `status = 'ready'`), but if it
 * somehow did, leaving it alone is correct — this transition moves status
 * TO 'ready', which is exactly the precondition a valid future scheduled
 * publish needs to still fire correctly later.
 */
export async function unpublishArticle(id: string): Promise<void> {
  const article = await getArticleOrThrow(id);
  if (article.status !== 'published') {
    throw new HttpError(409, `Cannot unpublish an article with status "${article.status}": it is not currently published`);
  }
  const [result] = await getPool().query(
    `UPDATE news_articles
     SET status = 'ready', published_at = NULL, scheduled_unpublish_at = NULL
     WHERE id = :id AND status = 'published'`,
    { id },
  );
  if ((result as { affectedRows: number }).affectedRows === 0) {
    throw new HttpError(409, 'Article status changed before this unpublish could be applied: reload and try again');
  }
}

/**
 * Permanently deletes an article and everything it owns — draft, ready, or
 * published (allowed at any status; publish state changes nothing about
 * how deletion works, only how strongly the admin UI warns beforehand).
 *
 * Ordering: S3 cleanup runs FIRST, the RDS row delete LAST. This is
 * deliberately the opposite of "delete the DB row, then clean up S3" —
 * reasoned through explicitly because a partial failure is only ever safe
 * in one of those two orders:
 *   - S3-first (this function): if S3 cleanup fails, the RDS row is
 *     untouched, so the article stays visible in the admin queue (and, if
 *     published, live) and the whole delete can simply be retried — S3
 *     deleting an already-empty prefix is a harmless no-op, so a retry
 *     always converges to fully deleted.
 *   - DB-first (rejected): if the S3 cleanup step then failed, the
 *     article would already be gone from RDS — no admin UI row left to
 *     retry the delete from — leaving orphaned, unreferenced S3 objects
 *     with no article left to discover or recover them from. A real,
 *     silent storage leak.
 *
 * `news_article_images` rows are cascade-deleted by the existing
 * `fk_news_article_images_article ... ON DELETE CASCADE` foreign key
 * (migration 001) — no application-level image-row cleanup needed.
 * `structured_content`, `source_pdf_s3_key`, and every publishing/
 * scheduling field are plain columns on `news_articles` itself, so the
 * single row DELETE below covers all of them too. No new table, no new
 * column, no migration required for this feature.
 *
 * S3 deletion is prefix-scoped to this article's own `articlePrefix(id)`
 * (see s3Keys.ts) — structurally incapable of touching another article's
 * or any shared/global object, regardless of what's actually listed under
 * that prefix (including orphaned objects a past finalize call left
 * behind without ever getting a DB row).
 */
export async function deleteArticle(id: string): Promise<void> {
  await getArticleOrThrow(id); // 404s cleanly if the article doesn't exist

  try {
    await deleteObjectsWithPrefix(articlePrefix(id));
  } catch (err) {
    throw new HttpError(
      502,
      `Failed to delete this article's stored files (images/source PDF): ${(err as Error).message}. The article was NOT deleted — it is safe to try again.`,
    );
  }

  const [result] = await getPool().query(`DELETE FROM news_articles WHERE id = :id`, { id });
  if ((result as { affectedRows: number }).affectedRows === 0) {
    // Deleted by a concurrent request between the getArticleOrThrow above and here — the end
    // state (article gone) is exactly what was asked for, so this isn't treated as a failure.
    return;
  }
}

/** Idempotent — setting the same key again (a retried finalize) is a harmless no-op UPDATE, not a new row. */
export async function setArticlePdfKey(id: string, s3Key: string): Promise<void> {
  await getPool().query(`UPDATE news_articles SET source_pdf_s3_key = :s3Key WHERE id = :id`, { id, s3Key });
}

export interface UpsertImageInput {
  articleId: string;
  s3Key: string;
  position: number;
  altText?: string | null;
  caption?: string | null;
  role?: string | null;
}

/**
 * Keyed on the (article_id, position) unique index — re-finalizing the same
 * position (a retried/duplicate finalize call) updates the existing row
 * in place instead of inserting a duplicate.
 */
export async function upsertArticleImage(input: UpsertImageInput): Promise<void> {
  const id = randomUUID();
  await getPool().query(
    `INSERT INTO news_article_images (id, article_id, s3_key, \`position\`, alt_text, caption, role)
     VALUES (:id, :articleId, :s3Key, :position, :altText, :caption, :role)
     ON DUPLICATE KEY UPDATE
       s3_key = VALUES(s3_key),
       alt_text = VALUES(alt_text),
       caption = VALUES(caption),
       role = VALUES(role),
       updated_at = CURRENT_TIMESTAMP`,
    {
      id,
      articleId: input.articleId,
      s3Key: input.s3Key,
      position: input.position,
      altText: input.altText ?? null,
      caption: input.caption ?? null,
      role: input.role ?? null,
    },
  );
}

export interface ArticleImageMetaUpdate {
  altText?: string | null;
  caption?: string | null;
}

/** Alt-text/caption editing only — deliberately does not touch `s3_key`/`position` (unlike `upsertArticleImage`, which Phase 1's finalize flow owns), so an editor fixing a caption can never accidentally re-target which S3 object or ordering slot an image record points to. Scoped to `articleId` so one article's edit request can never touch another article's image row even given an arbitrary imageId. */
export async function updateArticleImageMeta(articleId: string, imageId: string, update: ArticleImageMetaUpdate): Promise<void> {
  const fields: string[] = [];
  const params: Record<string, unknown> = { articleId, imageId };

  if ('altText' in update) {
    fields.push('alt_text = :altText');
    params.altText = update.altText ?? null;
  }
  if ('caption' in update) {
    fields.push('caption = :caption');
    params.caption = update.caption ?? null;
  }
  if (fields.length === 0) return;

  const [result] = await getPool().query(
    `UPDATE news_article_images SET ${fields.join(', ')} WHERE id = :imageId AND article_id = :articleId`,
    params as never,
  );
  if ((result as { affectedRows: number }).affectedRows === 0) {
    throw new HttpError(404, 'Image not found on this article');
  }
}

/**
 * Reassigns `position` for every image on an article to match `orderedImageIds`'s
 * order (0-indexed) in one transaction. Two-phase (first bump every touched
 * row to a temporary position outside the real 0..n-1 range, then set the
 * real final positions) because `(article_id, position)` is a UNIQUE index —
 * writing final positions directly, one row at a time, would collide with
 * whatever row currently holds the position being written to (e.g. swapping
 * position 0 and 1 by updating row A to 1 fails immediately if row B is
 * still sitting on 1). The temporary positions start at 100000 + i rather
 * than a negative number — migration 001's `chk_news_article_images_position`
 * CHECK constraint requires `position >= 0`, so a negative temp value (the
 * first version of this function used one) fails that constraint instead of
 * the unique index; 100000+ is comfortably outside any real article's image
 * count while still satisfying `>= 0`. Rejects up front if
 * `orderedImageIds` doesn't exactly match the article's current image set —
 * a collision, a typo, or a stale client list should fail loudly, not
 * silently drop or duplicate an image.
 */
const REORDER_TEMP_POSITION_OFFSET = 100_000;

export async function reorderArticleImages(articleId: string, orderedImageIds: string[]): Promise<void> {
  await withTransaction(async (conn) => {
    const [rows] = await conn.query<ImageRow[]>(`SELECT id FROM news_article_images WHERE article_id = :articleId FOR UPDATE`, {
      articleId,
    });
    const currentIds = new Set(rows.map((r) => r.id));
    const requestedIds = new Set(orderedImageIds);
    if (currentIds.size !== requestedIds.size || [...currentIds].some((id) => !requestedIds.has(id))) {
      throw new HttpError(400, 'orderedImageIds must contain exactly this article\'s current set of image ids, each exactly once');
    }

    for (let i = 0; i < orderedImageIds.length; i++) {
      await conn.query(`UPDATE news_article_images SET \`position\` = :tempPosition WHERE id = :id`, {
        id: orderedImageIds[i],
        tempPosition: REORDER_TEMP_POSITION_OFFSET + i,
      });
    }
    for (let i = 0; i < orderedImageIds.length; i++) {
      await conn.query(`UPDATE news_article_images SET \`position\` = :position WHERE id = :id`, {
        id: orderedImageIds[i],
        position: i,
      });
    }
  });
}

export function serializeArticle(article: ArticleRow, images: ImageRow[]) {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    category: article.category,
    tags: article.tags ?? [],
    featured: Boolean(article.featured),
    status: article.status,
    structuredContent: article.structured_content,
    sourcePdf: article.source_pdf_s3_key ? { s3Key: article.source_pdf_s3_key } : null,
    processingError: article.processing_error,
    processedAt: article.processed_at,
    images: images.map((image) => ({
      id: image.id,
      s3Key: image.s3_key,
      position: image.position,
      altText: image.alt_text,
      caption: image.caption,
      role: image.role,
    })),
    createdAt: article.created_at,
    updatedAt: article.updated_at,
    publishedAt: article.published_at,
    // Admin-only fields — never part of the public serializer
    // (api/_lib/newsroom/publicArticles.ts), which has its own separate,
    // narrower PublicArticleSummary/PublicArticleDetail shapes.
    scheduledPublishAt: article.scheduled_publish_at,
    scheduledUnpublishAt: article.scheduled_unpublish_at,
    firstPublishedAt: article.first_published_at,
  };
}

/**
 * The three Phase 2 status transitions, each a single atomic UPDATE.
 * `markArticleReady` clears any stale `processing_error` from a prior
 * failed run so a retry that succeeds doesn't leave an old error visible
 * next to fresh, valid content.
 */
export async function markArticleProcessing(id: string): Promise<void> {
  await getPool().query(
    `UPDATE news_articles SET status = 'processing', processing_error = NULL WHERE id = :id`,
    { id },
  );
}

export async function markArticleReady(id: string, structuredContent: unknown): Promise<void> {
  await getPool().query(
    `UPDATE news_articles
     SET status = 'ready', structured_content = CAST(:structuredContent AS JSON), processing_error = NULL, processed_at = CURRENT_TIMESTAMP
     WHERE id = :id`,
    { id, structuredContent: JSON.stringify(structuredContent) },
  );
}

export async function markArticleFailed(id: string, errorMessage: string): Promise<void> {
  await getPool().query(
    `UPDATE news_articles SET status = 'failed', processing_error = :errorMessage WHERE id = :id`,
    { id, errorMessage: errorMessage.slice(0, 2000) },
  );
}

export interface ScheduleUpdateInput {
  /** `undefined` = not present in this PATCH (leave as-is); `null` = cancel; a string = a pre-format-validated (isValidScheduledAt) ISO-8601 datetime with an explicit Z/offset. */
  scheduledPublishAt?: string | null;
  scheduledUnpublishAt?: string | null;
}

export interface ScheduleUpdateResult {
  scheduledPublishAt?: Date | null;
  scheduledUnpublishAt?: Date | null;
}

/**
 * Business rules for PATCHing scheduledPublishAt/scheduledUnpublishAt,
 * centralized here rather than just in the route handler — same reasoning
 * as publishArticle/unpublishArticle's own preconditions: a rule checked
 * only in one HTTP handler can be bypassed by a future second caller.
 *
 * Cross-field validation (`scheduledUnpublishAt` must be later than
 * `scheduledPublishAt`) always considers the CURRENT stored value for
 * whichever field isn't present in this particular PATCH, not just the
 * field(s) actually included in the request body — editing only the end
 * date is validated against the existing (unchanged) start date, and vice
 * versa. Format validation (a well-formed ISO-8601 string with an explicit
 * Z/offset) is the route handler's job (`isValidScheduledAt`); this
 * function assumes that already happened and only checks the
 * business/lifecycle rules a well-formed timestamp still has to satisfy.
 *
 * No atomicity/locking here (unlike publishArticle/unpublishArticle):
 * setting a FUTURE timestamp can never race the scheduled worker, which
 * only ever touches rows where a scheduled column is already `<= NOW()`.
 */
export function validateScheduleUpdate(article: ArticleRow, input: ScheduleUpdateInput): ScheduleUpdateResult {
  const result: ScheduleUpdateResult = {};
  const now = new Date();

  if ('scheduledPublishAt' in input) {
    if (input.scheduledPublishAt === null) {
      result.scheduledPublishAt = null;
    } else {
      if (article.status !== 'ready') {
        throw new HttpError(409, `Cannot schedule a publish for an article with status "${article.status}": it must be "ready"`);
      }
      const when = new Date(input.scheduledPublishAt as string);
      if (when <= now) throw new HttpError(400, 'scheduledPublishAt must be in the future');
      result.scheduledPublishAt = when;
    }
  }

  if ('scheduledUnpublishAt' in input) {
    if (input.scheduledUnpublishAt === null) {
      result.scheduledUnpublishAt = null;
    } else {
      if (article.status !== 'ready' && article.status !== 'published') {
        throw new HttpError(409, `Cannot schedule an unpublish for an article with status "${article.status}": it must be "ready" or "published"`);
      }
      const when = new Date(input.scheduledUnpublishAt as string);
      if (when <= now) throw new HttpError(400, 'scheduledUnpublishAt must be in the future');
      result.scheduledUnpublishAt = when;
    }
  }

  const effectivePublishAt = 'scheduledPublishAt' in result ? result.scheduledPublishAt : article.scheduled_publish_at;
  const effectiveUnpublishAt = 'scheduledUnpublishAt' in result ? result.scheduledUnpublishAt : article.scheduled_unpublish_at;
  if (effectivePublishAt && effectiveUnpublishAt && effectiveUnpublishAt <= effectivePublishAt) {
    throw new HttpError(400, 'scheduledUnpublishAt must be later than scheduledPublishAt');
  }

  return result;
}

export interface ScheduledWorkerResult {
  published: number;
  unpublished: number;
}

/**
 * The scheduled-publishing worker's entire job, run once per minute by an
 * EventBridge Rule (see aws/template.yaml) invoking this Lambda directly —
 * RDS is the sole source of truth (no per-article AWS resource exists to
 * consult), so every tick simply re-evaluates current state fresh. Both
 * UPDATEs are conditional on current `status` in their own WHERE clause
 * (no separate SELECT-then-write), making a duplicate/retried invocation of
 * this whole function a guaranteed no-op the second time — nothing to
 * dedupe, nothing that can go "stale": an edited or cancelled schedule is
 * just a different (or absent) value the very next tick sees.
 *
 * Ordering matters and is deliberate: publish runs first, unpublish second.
 * Normally validation prevents `scheduled_unpublish_at <= scheduled_publish_at`,
 * so this never double-fires on a healthy schedule — but if the worker was
 * ever down long enough that BOTH a start and end time have already
 * elapsed, this ordering guarantees the article ends the tick unpublished
 * (transiently published_at gets set by the first UPDATE, then cleared by
 * the second, matching the schedule's actual effective state right now),
 * never left incorrectly published just because the worker was delayed.
 * `first_published_at` is unaffected either way — once set, nothing in
 * this function (or unpublishArticle) ever touches it again.
 */
export async function runScheduledPublishingWorker(): Promise<ScheduledWorkerResult> {
  const [publishResult] = await getPool().query(
    `UPDATE news_articles
     SET status = 'published',
         published_at = CURRENT_TIMESTAMP,
         first_published_at = COALESCE(first_published_at, CURRENT_TIMESTAMP),
         scheduled_publish_at = NULL
     WHERE status = 'ready'
       AND scheduled_publish_at IS NOT NULL
       AND scheduled_publish_at <= CURRENT_TIMESTAMP`,
  );

  const [unpublishResult] = await getPool().query(
    `UPDATE news_articles
     SET status = 'ready',
         published_at = NULL,
         scheduled_unpublish_at = NULL
     WHERE status = 'published'
       AND scheduled_unpublish_at IS NOT NULL
       AND scheduled_unpublish_at <= CURRENT_TIMESTAMP`,
  );

  return {
    published: (publishResult as { affectedRows: number }).affectedRows,
    unpublished: (unpublishResult as { affectedRows: number }).affectedRows,
  };
}
