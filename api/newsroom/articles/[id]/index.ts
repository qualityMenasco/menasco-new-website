import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ZodError } from 'zod';
import { requireNewsroomAuth } from '../../../_lib/auth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { deleteArticle, getArticleImages, getArticleOrThrow, serializeArticle, updateArticleMetadata, validateScheduleUpdate, type ArticleMetadataUpdate } from '../../../_lib/articles';
import { isValidCategory, isValidScheduledAt, isValidSlug, isValidSubtitle, isValidTags, isValidTitle, isValidUuid, normalizeSlug } from '../../../_lib/validation';
import { validateStructuredContent } from '../../../_lib/newsroom/structuredContent';

/**
 * GET  /api/newsroom/articles/:id — retrieve an article (metadata, status,
 *      structured_content, source-PDF key, images ordered by position).
 * PATCH /api/newsroom/articles/:id — editorial save. Every field is
 *      optional/independent (only supplied keys are touched); an edited
 *      `structuredContent` is re-validated against the same schema
 *      Phase 2 processing writes through (`validateStructuredContent`) —
 *      an editor can never persist a structurally invalid payload, whether
 *      the invalidity came from hand-editing or a client bug. This never
 *      changes `status` itself (see publish.ts/unpublish.ts for that).
 * DELETE /api/newsroom/articles/:id — permanently deletes the article and
 *      everything it owns (structured content, image metadata, uploaded
 *      images, source PDF — see deleteArticle's own doc comment for the
 *      ordering/transaction reasoning). Allowed at any status, including
 *      'published': a published article deleted this way immediately stops
 *      appearing in the public listing/detail/image routes, same as any
 *      other now-nonexistent row. Distinct from unpublish.ts, which keeps
 *      the article and its assets intact for later republishing.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, ['GET', 'PATCH', 'DELETE']);

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');

    if (req.method === 'GET') {
      const article = await getArticleOrThrow(id);
      const images = await getArticleImages(id);
      sendJson(res, 200, serializeArticle(article, images));
      return;
    }

    if (req.method === 'DELETE') {
      await deleteArticle(id);
      sendJson(res, 200, { deleted: true, id });
      return;
    }

    // PATCH
    const currentArticle = await getArticleOrThrow(id); // 404s cleanly if the article doesn't exist
    const body = requireJsonBody(req);
    const update: ArticleMetadataUpdate = {};

    if ('title' in body) {
      if (body.title !== null && !isValidTitle(body.title)) {
        throw new HttpError(400, 'title must be a non-empty string of at most 500 characters, or null');
      }
      update.title = body.title === null ? null : (body.title as string).trim();
    }

    if ('slug' in body) {
      if (body.slug === null) {
        update.slug = null;
      } else if (typeof body.slug === 'string') {
        const normalized = normalizeSlug(body.slug);
        if (!isValidSlug(normalized)) {
          throw new HttpError(400, 'slug must normalize to a non-empty lowercase alphanumeric-and-hyphens string');
        }
        update.slug = normalized;
      } else {
        throw new HttpError(400, 'slug must be a string or null');
      }
    }

    if ('subtitle' in body) {
      if (body.subtitle !== null && !isValidSubtitle(body.subtitle)) {
        throw new HttpError(400, 'subtitle must be a non-empty string of at most 500 characters, or null');
      }
      update.subtitle = body.subtitle === null ? null : (body.subtitle as string).trim();
    }

    if ('category' in body) {
      if (body.category !== null && !isValidCategory(body.category)) {
        throw new HttpError(400, 'category must be a lowercase alphanumeric-and-hyphens slug of at most 100 characters, or null');
      }
      update.category = body.category as string | null;
    }

    if ('tags' in body) {
      if (body.tags !== null && !isValidTags(body.tags)) {
        throw new HttpError(400, 'tags must be an array of at most 20 {name, slug} objects, or null');
      }
      update.tags = body.tags as ArticleMetadataUpdate['tags'];
    }

    if ('featured' in body) {
      if (typeof body.featured !== 'boolean') throw new HttpError(400, 'featured must be a boolean');
      update.featured = body.featured;
    }

    if ('structuredContent' in body) {
      try {
        update.structuredContent = validateStructuredContent(body.structuredContent);
      } catch (err) {
        if (err instanceof ZodError) {
          const issues = err.issues.slice(0, 10).map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`).join('; ');
          throw new HttpError(422, `structuredContent failed schema validation: ${issues}`);
        }
        throw err;
      }
    }

    const scheduleInput: { scheduledPublishAt?: string | null; scheduledUnpublishAt?: string | null } = {};
    if ('scheduledPublishAt' in body) {
      if (body.scheduledPublishAt !== null && !isValidScheduledAt(body.scheduledPublishAt)) {
        throw new HttpError(400, 'scheduledPublishAt must be a full ISO-8601 datetime with an explicit Z or numeric offset, or null');
      }
      scheduleInput.scheduledPublishAt = body.scheduledPublishAt as string | null;
    }
    if ('scheduledUnpublishAt' in body) {
      if (body.scheduledUnpublishAt !== null && !isValidScheduledAt(body.scheduledUnpublishAt)) {
        throw new HttpError(400, 'scheduledUnpublishAt must be a full ISO-8601 datetime with an explicit Z or numeric offset, or null');
      }
      scheduleInput.scheduledUnpublishAt = body.scheduledUnpublishAt as string | null;
    }
    if (Object.keys(scheduleInput).length > 0) {
      const validated = validateScheduleUpdate(currentArticle, scheduleInput);
      if ('scheduledPublishAt' in validated) update.scheduledPublishAt = validated.scheduledPublishAt;
      if ('scheduledUnpublishAt' in validated) update.scheduledUnpublishAt = validated.scheduledUnpublishAt;
    }

    await updateArticleMetadata(id, update);
    const updated = await getArticleOrThrow(id);
    const images = await getArticleImages(id);
    sendJson(res, 200, serializeArticle(updated, images));
  });
}
