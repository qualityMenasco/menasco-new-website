import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool, isDuplicateEntryError, withTransaction } from './db';
import { HttpError } from './http';
import { deleteObjectsWithPrefix } from './s3';
import { projectImagePrefix } from './projectS3Keys';
import type { ProjectStatusValue, ProjectCompletionStatusValue } from './validation';

/**
 * Row shapes for the Projects Phase 1 schema (migrations/005_create_project_tables.sql).
 * Types only — no queries/CRUD functions here yet, deliberately: Phase 1 is
 * schema + validation only. These mirror api/_lib/articles.ts's
 * ArticleRow/ImageRow shape (RowDataPacket extension, MySQL BOOLEAN/TINYINT
 * columns typed as `number` since mysql2 returns 0/1 not a JS boolean,
 * nullable columns as `X | null`) so a future projects.ts CRUD layer slots
 * in the same way articles.ts already does.
 */

/** Re-exported from validation.ts's PROJECT_STATUSES so the row type and the runtime guard can never drift apart. */
export type ProjectStatus = ProjectStatusValue;

export interface ProjectRecordRow extends RowDataPacket {
  id: string;
  epromise_id: string;
  epromise_name: string;
  common_name: string;
  /** Locked public identifier (see api/_lib/projects/publicProjects.ts) — never the internal `id`, never `epromise_id`/`epromise_name`. Nullable: a draft may not have one chosen yet. */
  slug: string | null;
  project_class: string;
  project_type: string;
  category: string;
  location: string;
  country: string;
  consultant: string;
  client: string;
  completion_date: Date | null;
  completion_status: ProjectCompletionStatusValue;
  public_description: string;
  /** Application-layer contract, not DB-enforced: no public-facing query may ever select this column. */
  private_description: string | null;
  duration_months: number;
  peak_workforce: number;
  built_area_sqm: number;
  value_amount: number;
  value_currency: string;
  floors: number;
  featured: number; // MySQL BOOLEAN is TINYINT(1) — mysql2 returns 0/1, not a JS boolean.
  status: ProjectStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMetricRow extends RowDataPacket {
  id: string;
  project_id: string;
  metric_name: string;
  /** Raw value as entered — supports both numeric ("85000") and textual ("LEED Gold") highlights; comma/unit formatting is a display-layer concern. */
  metric_value: string;
  metric_unit: string | null;
  display_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectImageRow extends RowDataPacket {
  id: string;
  project_id: string;
  /** Private S3 object key — never a stored public URL. */
  s3_key: string;
  position: number;
  alt_text: string | null;
  caption: string | null;
  /** "At most one primary per project" is an application-layer invariant (Phase 3's write path), not DB-enforced — see migration 005's own comment for why the originally-planned generated-column constraint had to be dropped (rejected by MySQL: a FK with ON DELETE CASCADE cannot target a base column of a STORED generated column). */
  is_primary: number; // MySQL BOOLEAN is TINYINT(1) — mysql2 returns 0/1, not a JS boolean.
  created_at: Date;
  updated_at: Date;
}

// ---------------------------------------------------------------------------
// project_records — admin CRUD. Deliberately NOT coupled to any Newsroom
// business logic (no publish/schedule concept — status is a plain
// draft/published toggle, see validation.ts's isValidProjectStatus).
// ---------------------------------------------------------------------------

export async function getProjectRecordById(id: string): Promise<ProjectRecordRow | null> {
  const [rows] = await getPool().query<ProjectRecordRow[]>(`SELECT * FROM project_records WHERE id = :id LIMIT 1`, { id });
  return rows[0] ?? null;
}

export async function getProjectRecordOrThrow(id: string): Promise<ProjectRecordRow> {
  const record = await getProjectRecordById(id);
  if (!record) throw new HttpError(404, 'Project not found');
  return record;
}

/** Most-recently-updated first, capped at 100 — same convention as listArticles (api/_lib/articles.ts). */
export async function listProjectRecords(): Promise<ProjectRecordRow[]> {
  const [rows] = await getPool().query<ProjectRecordRow[]>(`SELECT * FROM project_records ORDER BY updated_at DESC LIMIT 100`);
  return rows;
}

/**
 * Every NOT NULL project_records column (per migration 005) except `slug`
 * and `completion_date` — unlike Newsroom's "create an empty draft, fill
 * in later" flow, project_records has almost no nullable columns, so a
 * genuinely empty INSERT would violate NOT NULL constraints. Callers
 * (the POST /api/projects handler) must validate every field against
 * api/_lib/validation.ts before calling this.
 */
export interface CreateProjectRecordInput {
  epromiseId: string;
  epromiseName: string;
  commonName: string;
  slug?: string | null;
  projectClass: string;
  projectType: string;
  category: string;
  location: string;
  country: string;
  consultant: string;
  client: string;
  completionDate?: string | null;
  completionStatus: ProjectCompletionStatusValue;
  publicDescription: string;
  privateDescription?: string | null;
  durationMonths: number;
  peakWorkforce: number;
  builtAreaSqm: number;
  valueAmount: number;
  valueCurrency?: string;
  floors: number;
  featured?: boolean;
}

export async function createProjectRecord(input: CreateProjectRecordInput): Promise<ProjectRecordRow> {
  const id = randomUUID();
  try {
    await getPool().query(
      `INSERT INTO project_records (
         id, epromise_id, epromise_name, common_name, slug, project_class, project_type, category,
         location, country, consultant, client, completion_date, completion_status,
         public_description, private_description, duration_months, peak_workforce,
         built_area_sqm, value_amount, value_currency, floors, featured
       ) VALUES (
         :id, :epromiseId, :epromiseName, :commonName, :slug, :projectClass, :projectType, :category,
         :location, :country, :consultant, :client, :completionDate, :completionStatus,
         :publicDescription, :privateDescription, :durationMonths, :peakWorkforce,
         :builtAreaSqm, :valueAmount, :valueCurrency, :floors, :featured
       )`,
      {
        id,
        epromiseId: input.epromiseId,
        epromiseName: input.epromiseName,
        commonName: input.commonName,
        slug: input.slug ?? null,
        projectClass: input.projectClass,
        projectType: input.projectType,
        category: input.category,
        location: input.location,
        country: input.country,
        consultant: input.consultant,
        client: input.client,
        completionDate: input.completionDate ?? null,
        completionStatus: input.completionStatus,
        publicDescription: input.publicDescription,
        privateDescription: input.privateDescription ?? null,
        durationMonths: input.durationMonths,
        peakWorkforce: input.peakWorkforce,
        builtAreaSqm: input.builtAreaSqm,
        valueAmount: input.valueAmount,
        valueCurrency: input.valueCurrency ?? 'AED',
        floors: input.floors,
        featured: input.featured ? 1 : 0,
      },
    );
  } catch (err) {
    if (isDuplicateEntryError(err)) throw new HttpError(409, 'That slug is already in use by another project');
    throw err;
  }
  const created = await getProjectRecordById(id);
  if (!created) throw new Error('Failed to read back newly created project record');
  return created;
}

export interface ProjectRecordUpdate {
  epromiseId?: string;
  epromiseName?: string;
  commonName?: string;
  slug?: string | null;
  projectClass?: string;
  projectType?: string;
  category?: string;
  location?: string;
  country?: string;
  consultant?: string;
  client?: string;
  completionDate?: string | null;
  completionStatus?: ProjectCompletionStatusValue;
  publicDescription?: string;
  privateDescription?: string | null;
  durationMonths?: number;
  peakWorkforce?: number;
  builtAreaSqm?: number;
  valueAmount?: number;
  valueCurrency?: string;
  floors?: number;
  featured?: boolean;
  status?: ProjectStatus;
}

const PROJECT_RECORD_UPDATE_COLUMNS: Record<keyof ProjectRecordUpdate, string> = {
  epromiseId: 'epromise_id',
  epromiseName: 'epromise_name',
  commonName: 'common_name',
  slug: 'slug',
  projectClass: 'project_class',
  projectType: 'project_type',
  category: 'category',
  location: 'location',
  country: 'country',
  consultant: 'consultant',
  client: 'client',
  completionDate: 'completion_date',
  completionStatus: 'completion_status',
  publicDescription: 'public_description',
  privateDescription: 'private_description',
  durationMonths: 'duration_months',
  peakWorkforce: 'peak_workforce',
  builtAreaSqm: 'built_area_sqm',
  valueAmount: 'value_amount',
  valueCurrency: 'value_currency',
  floors: 'floors',
  featured: 'featured',
  status: 'status',
};

/**
 * Publishing a project requires a non-null slug — the same invariant
 * publishArticle() enforces for news_articles, applied here instead of a
 * DB trigger so the rule stays in one reviewable place. Checked against
 * the union of the current row and this update (a request that sets
 * status='published' AND slug in the same call is valid).
 */
export async function updateProjectRecord(id: string, update: ProjectRecordUpdate): Promise<void> {
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  for (const key of Object.keys(update) as (keyof ProjectRecordUpdate)[]) {
    const column = PROJECT_RECORD_UPDATE_COLUMNS[key];
    let value = update[key];
    if (key === 'featured') value = value ? 1 : 0;
    fields.push(`${column} = :${key}`);
    params[key] = value ?? null;
  }
  if (fields.length === 0) return;

  if (update.status === 'published') {
    const nextSlug = 'slug' in update ? update.slug : (await getProjectRecordOrThrow(id)).slug;
    if (!nextSlug) throw new HttpError(422, 'Project cannot be published without a slug');
  }

  try {
    await getPool().query(`UPDATE project_records SET ${fields.join(', ')} WHERE id = :id`, params as never);
  } catch (err) {
    if (isDuplicateEntryError(err)) throw new HttpError(409, 'That slug is already in use by another project');
    throw err;
  }
}

/**
 * S3-first, DB-row-last — identical ordering rationale to deleteArticle
 * (api/_lib/articles.ts): if S3 cleanup fails, the project row (and its
 * DB-cascaded metrics/images rows) stay untouched and the whole delete is
 * safe to retry; deleting an already-empty prefix is a harmless no-op.
 * project_metrics/project_images rows are cascade-deleted by their own
 * `ON DELETE CASCADE` foreign keys (migration 005) — no application-level
 * child-row cleanup needed, only the S3 objects those image rows pointed to.
 */
export async function deleteProjectRecord(id: string): Promise<void> {
  await getProjectRecordOrThrow(id); // 404s cleanly if the project doesn't exist

  try {
    await deleteObjectsWithPrefix(projectImagePrefix(id));
  } catch (err) {
    throw new HttpError(
      502,
      `Failed to delete this project's stored images: ${(err as Error).message}. The project was NOT deleted — it is safe to try again.`,
    );
  }

  await getPool().query(`DELETE FROM project_records WHERE id = :id`, { id });
}

// ---------------------------------------------------------------------------
// project_metrics
// ---------------------------------------------------------------------------

export async function listProjectMetrics(projectId: string): Promise<ProjectMetricRow[]> {
  const [rows] = await getPool().query<ProjectMetricRow[]>(
    `SELECT * FROM project_metrics WHERE project_id = :projectId ORDER BY display_order ASC`,
    { projectId },
  );
  return rows;
}

export interface CreateProjectMetricInput {
  projectId: string;
  metricName: string;
  metricValue: string;
  metricUnit?: string | null;
  displayOrder: number;
}

export async function createProjectMetric(input: CreateProjectMetricInput): Promise<ProjectMetricRow> {
  const id = randomUUID();
  try {
    await getPool().query(
      `INSERT INTO project_metrics (id, project_id, metric_name, metric_value, metric_unit, display_order)
       VALUES (:id, :projectId, :metricName, :metricValue, :metricUnit, :displayOrder)`,
      { id, projectId: input.projectId, metricName: input.metricName, metricValue: input.metricValue, metricUnit: input.metricUnit ?? null, displayOrder: input.displayOrder },
    );
  } catch (err) {
    if (isDuplicateEntryError(err)) throw new HttpError(409, 'A metric already occupies this display position for this project');
    throw err;
  }
  const [rows] = await getPool().query<ProjectMetricRow[]>(`SELECT * FROM project_metrics WHERE id = :id LIMIT 1`, { id });
  return rows[0];
}

export interface ProjectMetricUpdate {
  metricName?: string;
  metricValue?: string;
  metricUnit?: string | null;
  displayOrder?: number;
}

/** Scoped to `projectId` so one project's edit request can never touch another project's metric row even given an arbitrary metricId — mirrors updateArticleImageMeta's own scoping. */
export async function updateProjectMetric(projectId: string, metricId: string, update: ProjectMetricUpdate): Promise<void> {
  const fields: string[] = [];
  const params: Record<string, unknown> = { projectId, metricId };
  if ('metricName' in update) { fields.push('metric_name = :metricName'); params.metricName = update.metricName; }
  if ('metricValue' in update) { fields.push('metric_value = :metricValue'); params.metricValue = update.metricValue; }
  if ('metricUnit' in update) { fields.push('metric_unit = :metricUnit'); params.metricUnit = update.metricUnit ?? null; }
  if ('displayOrder' in update) { fields.push('display_order = :displayOrder'); params.displayOrder = update.displayOrder; }
  if (fields.length === 0) return;

  let result;
  try {
    [result] = await getPool().query(
      `UPDATE project_metrics SET ${fields.join(', ')} WHERE id = :metricId AND project_id = :projectId`,
      params as never,
    );
  } catch (err) {
    if (isDuplicateEntryError(err)) throw new HttpError(409, 'A metric already occupies this display position for this project');
    throw err;
  }
  if ((result as { affectedRows: number }).affectedRows === 0) throw new HttpError(404, 'Metric not found on this project');
}

export async function deleteProjectMetric(projectId: string, metricId: string): Promise<void> {
  const [result] = await getPool().query(`DELETE FROM project_metrics WHERE id = :metricId AND project_id = :projectId`, {
    metricId,
    projectId,
  });
  if ((result as { affectedRows: number }).affectedRows === 0) throw new HttpError(404, 'Metric not found on this project');
}

/** Two-phase reorder (temp offset, then final) — identical rationale to reorderArticleImages: `(project_id, display_order)` is a UNIQUE index, so writing final positions one row at a time would collide with whatever row currently holds the target slot. */
const REORDER_TEMP_OFFSET = 100_000;
/** project_metrics.display_order is SMALLINT UNSIGNED (max 65535), unlike project_images.position (a plain INT) — REORDER_TEMP_OFFSET overflows it, so metrics get their own smaller offset, still far above any realistic metric count. */
const METRICS_REORDER_TEMP_OFFSET = 30_000;

export async function reorderProjectMetrics(projectId: string, orderedMetricIds: string[]): Promise<void> {
  await withTransaction(async (conn) => {
    const [rows] = await conn.query<ProjectMetricRow[]>(`SELECT id FROM project_metrics WHERE project_id = :projectId FOR UPDATE`, {
      projectId,
    });
    const currentIds = new Set(rows.map((r) => r.id));
    const requestedIds = new Set(orderedMetricIds);
    if (currentIds.size !== requestedIds.size || [...currentIds].some((id) => !requestedIds.has(id))) {
      throw new HttpError(400, 'orderedMetricIds must contain exactly this project\'s current set of metric ids, each exactly once');
    }
    for (let i = 0; i < orderedMetricIds.length; i++) {
      await conn.query(`UPDATE project_metrics SET display_order = :tempOrder WHERE id = :id`, {
        id: orderedMetricIds[i],
        tempOrder: METRICS_REORDER_TEMP_OFFSET + i,
      });
    }
    for (let i = 0; i < orderedMetricIds.length; i++) {
      await conn.query(`UPDATE project_metrics SET display_order = :order WHERE id = :id`, {
        id: orderedMetricIds[i],
        order: i,
      });
    }
  });
}

// ---------------------------------------------------------------------------
// project_images
// ---------------------------------------------------------------------------

export async function listProjectImages(projectId: string): Promise<ProjectImageRow[]> {
  const [rows] = await getPool().query<ProjectImageRow[]>(
    `SELECT * FROM project_images WHERE project_id = :projectId ORDER BY \`position\` ASC`,
    { projectId },
  );
  return rows;
}

export interface UpsertProjectImageInput {
  projectId: string;
  s3Key: string;
  position: number;
  altText?: string | null;
  caption?: string | null;
}

/** Keyed on the (project_id, position) unique index — mirrors upsertArticleImage exactly, including idempotent re-finalize. Never sets is_primary — a brand-new image never silently becomes primary; that's always an explicit, separate setProjectImagePrimary call. */
export async function upsertProjectImage(input: UpsertProjectImageInput): Promise<void> {
  const id = randomUUID();
  await getPool().query(
    `INSERT INTO project_images (id, project_id, s3_key, \`position\`, alt_text, caption)
     VALUES (:id, :projectId, :s3Key, :position, :altText, :caption)
     ON DUPLICATE KEY UPDATE
       s3_key = VALUES(s3_key),
       alt_text = VALUES(alt_text),
       caption = VALUES(caption),
       updated_at = CURRENT_TIMESTAMP`,
    { id, projectId: input.projectId, s3Key: input.s3Key, position: input.position, altText: input.altText ?? null, caption: input.caption ?? null },
  );
}

export interface ProjectImageMetaUpdate {
  altText?: string | null;
  caption?: string | null;
}

export async function updateProjectImageMeta(projectId: string, imageId: string, update: ProjectImageMetaUpdate): Promise<void> {
  const fields: string[] = [];
  const params: Record<string, unknown> = { projectId, imageId };
  if ('altText' in update) { fields.push('alt_text = :altText'); params.altText = update.altText ?? null; }
  if ('caption' in update) { fields.push('caption = :caption'); params.caption = update.caption ?? null; }
  if (fields.length === 0) return;

  const [result] = await getPool().query(
    `UPDATE project_images SET ${fields.join(', ')} WHERE id = :imageId AND project_id = :projectId`,
    params as never,
  );
  if ((result as { affectedRows: number }).affectedRows === 0) throw new HttpError(404, 'Image not found on this project');
}

export async function reorderProjectImages(projectId: string, orderedImageIds: string[]): Promise<void> {
  await withTransaction(async (conn) => {
    const [rows] = await conn.query<ProjectImageRow[]>(`SELECT id FROM project_images WHERE project_id = :projectId FOR UPDATE`, {
      projectId,
    });
    const currentIds = new Set(rows.map((r) => r.id));
    const requestedIds = new Set(orderedImageIds);
    if (currentIds.size !== requestedIds.size || [...currentIds].some((id) => !requestedIds.has(id))) {
      throw new HttpError(400, 'orderedImageIds must contain exactly this project\'s current set of image ids, each exactly once');
    }
    for (let i = 0; i < orderedImageIds.length; i++) {
      await conn.query(`UPDATE project_images SET \`position\` = :tempPosition WHERE id = :id`, {
        id: orderedImageIds[i],
        tempPosition: REORDER_TEMP_OFFSET + i,
      });
    }
    for (let i = 0; i < orderedImageIds.length; i++) {
      await conn.query(`UPDATE project_images SET \`position\` = :position WHERE id = :id`, {
        id: orderedImageIds[i],
        position: i,
      });
    }
  });
}

/**
 * The one-primary-image invariant (Section 5 of the Phase 3 spec):
 * production MySQL cannot enforce this at the DB layer (the generated-
 * column approach was tried against real production and rejected — see
 * migration 005's own comment), so it's enforced here, transactionally,
 * exactly as specified: unset every other primary for this project, then
 * set the requested one, inside a single transaction with a row lock on
 * the target so two concurrent "make X primary" calls for the same
 * project can never both partially apply (the second waits for the
 * first's transaction to commit, then simply reapplies the same final
 * state — the last writer wins deterministically, never two primaries
 * left standing).
 */
export async function setProjectImagePrimary(projectId: string, imageId: string): Promise<void> {
  await withTransaction(async (conn) => {
    const [rows] = await conn.query<ProjectImageRow[]>(
      `SELECT id FROM project_images WHERE id = :imageId AND project_id = :projectId FOR UPDATE`,
      { imageId, projectId },
    );
    if (rows.length === 0) throw new HttpError(404, 'Image not found on this project');

    await conn.query(`UPDATE project_images SET is_primary = 0 WHERE project_id = :projectId`, { projectId });
    await conn.query(`UPDATE project_images SET is_primary = 1 WHERE id = :imageId AND project_id = :projectId`, {
      imageId,
      projectId,
    });
  });
}

/**
 * Deletes one image (row + its S3 object), S3-first for the same
 * retry-safety reason as deleteProjectRecord. If the deleted image was
 * the primary one, deterministically promotes the lowest-`position`
 * remaining image to primary in the same transaction as the row delete —
 * the documented choice for Section 5's "deleting the primary image"
 * question (over "leave the project with no primary image"), so a
 * project's public detail page is never left without a hero image purely
 * as a side effect of an admin editing its gallery, when a perfectly
 * reasonable next image already exists.
 */
export async function deleteProjectImage(projectId: string, imageId: string): Promise<void> {
  const [rows] = await getPool().query<ProjectImageRow[]>(
    `SELECT * FROM project_images WHERE id = :imageId AND project_id = :projectId LIMIT 1`,
    { imageId, projectId },
  );
  const image = rows[0];
  if (!image) throw new HttpError(404, 'Image not found on this project');

  try {
    // No single-object delete primitive exists in s3.ts (Newsroom has never needed one —
    // only whole-article delete). Safe to reuse the prefix-delete here: image.s3_key already
    // ends in a random UUID + extension, so no other object's key can ever share it as a prefix.
    await deleteObjectsWithPrefix(image.s3_key);
  } catch (err) {
    throw new HttpError(
      502,
      `Failed to delete this image's stored file: ${(err as Error).message}. The image was NOT deleted — it is safe to try again.`,
    );
  }

  await withTransaction(async (conn) => {
    await conn.query(`DELETE FROM project_images WHERE id = :imageId AND project_id = :projectId`, { imageId, projectId });

    if (image.is_primary) {
      const [remaining] = await conn.query<ProjectImageRow[]>(
        `SELECT id FROM project_images WHERE project_id = :projectId ORDER BY \`position\` ASC LIMIT 1 FOR UPDATE`,
        { projectId },
      );
      if (remaining.length > 0) {
        await conn.query(`UPDATE project_images SET is_primary = 1 WHERE id = :id`, { id: remaining[0].id });
      }
    }
  });
}

/** Admin-facing serializer — the full internal shape, including every strictly-private field. Never used for a public response (see api/_lib/projects/publicProjects.ts's own, separate, narrow allowlist mappers). */
export function serializeProjectRecordForAdmin(record: ProjectRecordRow, metrics: ProjectMetricRow[], images: ProjectImageRow[]) {
  return {
    id: record.id,
    epromiseId: record.epromise_id,
    epromiseName: record.epromise_name,
    commonName: record.common_name,
    slug: record.slug,
    projectClass: record.project_class,
    projectType: record.project_type,
    category: record.category,
    location: record.location,
    country: record.country,
    consultant: record.consultant,
    client: record.client,
    completionDate: record.completion_date,
    completionStatus: record.completion_status,
    publicDescription: record.public_description,
    privateDescription: record.private_description,
    durationMonths: record.duration_months,
    peakWorkforce: record.peak_workforce,
    builtAreaSqm: record.built_area_sqm,
    valueAmount: record.value_amount,
    valueCurrency: record.value_currency,
    floors: record.floors,
    featured: Boolean(record.featured),
    status: record.status,
    metrics: metrics.map((m) => ({
      id: m.id,
      metricName: m.metric_name,
      metricValue: m.metric_value,
      metricUnit: m.metric_unit,
      displayOrder: m.display_order,
    })),
    images: images.map((img) => ({
      id: img.id,
      s3Key: img.s3_key,
      position: img.position,
      altText: img.alt_text,
      caption: img.caption,
      isPrimary: Boolean(img.is_primary),
    })),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}
