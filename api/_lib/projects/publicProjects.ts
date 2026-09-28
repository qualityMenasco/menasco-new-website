import { getPool } from '../db';
import type { ProjectImageRow, ProjectMetricRow, ProjectRecordRow } from '../projects';

/**
 * Narrow Pick<> shapes matching exactly the explicit column lists the query
 * functions below select — never the full Row types. This makes "never
 * fetch a private column for a public query" a compiler-enforced property,
 * not just a mapper-layer discipline: a private field literally never
 * exists in memory for these code paths, and toPublicProject/etc. below
 * can't reference one even by a future typo, since it isn't in the type.
 * `id` is the one exception on the project source row — selected because
 * the caller needs it to join project_metrics/project_images, never
 * because it's returned to a client (toPublicProject never reads it).
 */
export type PublicProjectSourceRow = Pick<
  ProjectRecordRow,
  | 'id'
  | 'slug'
  | 'common_name'
  | 'project_class'
  | 'project_type'
  | 'category'
  | 'location'
  | 'country'
  | 'completion_date'
  | 'completion_status'
  | 'public_description'
  | 'peak_workforce'
  | 'built_area_sqm'
  | 'floors'
  | 'featured'
>;
export type PublicProjectMetricSourceRow = Pick<ProjectMetricRow, 'metric_name' | 'metric_value' | 'metric_unit' | 'display_order'>;
export type PublicProjectImageSourceRow = Pick<ProjectImageRow, 'id' | 'position' | 'alt_text' | 'caption' | 'is_primary'>;

const PUBLIC_PROJECT_COLUMNS =
  'id, slug, common_name, project_class, project_type, category, location, country, completion_date, completion_status, public_description, peak_workforce, built_area_sqm, floors, featured';
const PUBLIC_PROJECT_METRIC_COLUMNS = 'metric_name, metric_value, metric_unit, display_order';
const PUBLIC_PROJECT_IMAGE_COLUMNS = 'id, `position`, alt_text, caption, is_primary';

/**
 * The locked Projects privacy model. No Projects API exists yet — this
 * file exists so the security architecture is fixed in code BEFORE any
 * route/handler is written, the same discipline
 * api/_lib/newsroom/publicArticles.ts already applies to Newsroom:
 *
 *   - Public responses are built by explicit ALLOWLIST field construction
 *     only. Never `{...projectRecord}`, never a generic serializer, never
 *     `SELECT *` handed straight to a public endpoint.
 *   - `project_records.id` (the internal UUID) is never the public
 *     identifier — PublicProject has no `id` field at all. The public
 *     identifier is `slug` (see migration 005's own comment: a Phase 2
 *     publish action must enforce "no publish without a slug", the same
 *     way Newsroom's publishArticle() already enforces a slug).
 *   - `epromise_id`/`epromise_name`/`consultant`/`client`/
 *     `private_description`/`duration_months`/`value_amount`/
 *     `value_currency`/`created_at`/`updated_at` are permanently private —
 *     not configurable per-project (no `show_client`-style toggle exists
 *     or should ever be added; see STRICTLY_PRIVATE_PROJECT_FIELDS below).
 *   - `s3_key` never leaves this server; public image responses carry only
 *     an opaque `imageId` + a proxy `url`, mirroring
 *     api/newsroom/public/images/[imageId].ts exactly — the actual object
 *     is streamed server-side, never a presigned URL or raw key.
 *
 * Note for whoever builds the actual queries in Phase 2: Newsroom's own
 * PublicArticleSummary.id currently returns the raw internal article UUID
 * — an existing precedent this file deliberately does NOT continue for
 * Projects, per this privacy model being a distinct, explicit requirement.
 * That is a pre-existing Newsroom behavior, unrelated to and untouched by
 * this file.
 */

/**
 * Every key here is a field that must NEVER appear anywhere in a public
 * Projects API response, in either its snake_case (DB) or camelCase (API)
 * form. Intended for the security regression tests to import once the
 * Projects API exists (walk every public response recursively and assert
 * none of these keys are present) rather than hand-copied into each test
 * file, so the list can never drift out of sync with the model itself.
 */
export const STRICTLY_PRIVATE_PROJECT_FIELDS = [
  'id',
  'epromiseId',
  'epromise_id',
  'epromiseName',
  'epromise_name',
  'consultant',
  'client',
  'privateDescription',
  'private_description',
  'durationMonths',
  'duration_months',
  'valueAmount',
  'value_amount',
  'valueCurrency',
  'value_currency',
  's3Key',
  's3_key',
  'createdAt',
  'created_at',
  'updatedAt',
  'updated_at',
] as const;

const PUBLIC_PROJECT_IMAGE_PROXY_PREFIX = '/api/projects/public/images';

export function publicProjectImageUrl(imageId: string): string {
  return `${PUBLIC_PROJECT_IMAGE_PROXY_PREFIX}/${imageId}`;
}

export interface PublicProjectMetric {
  metricName: string;
  metricValue: string;
  metricUnit: string | null;
  displayOrder: number;
}

export interface PublicProjectImage {
  /** Opaque proxy-lookup id (the image row's own UUID) — never the S3 key, never presigned. Named `imageId`, not `id`, so it can never be mistaken for (or accidentally aliased to) the forbidden project-level `id`. */
  imageId: string;
  url: string;
  altText: string | null;
  caption: string | null;
  isPrimary: boolean;
  position: number;
}

export interface PublicProject {
  slug: string;
  commonName: string;
  projectClass: string;
  projectType: string;
  category: string;
  location: string;
  country: string;
  completionDate: string | null;
  completionStatus: string;
  publicDescription: string;
  peakWorkforce: number;
  builtAreaSqm: number;
  floors: number;
  featured: boolean;
  metrics: PublicProjectMetric[];
  images: PublicProjectImage[];
}

/**
 * Explicit field-by-field construction — deliberately not a spread, not a
 * destructure-and-omit, not a generic mapper. A future field added to
 * ProjectRecordRow (private or public) has NO effect on this function's
 * output unless someone deliberately adds a line here, which is the entire
 * point: the compiler can't enforce "never leak a new private column", but
 * an allowlist that has to be hand-extended for every new public field
 * makes that the only way a field ever reaches a public response.
 */
export function toPublicProjectMetric(metric: PublicProjectMetricSourceRow): PublicProjectMetric {
  return {
    metricName: metric.metric_name,
    metricValue: metric.metric_value,
    metricUnit: metric.metric_unit,
    displayOrder: metric.display_order,
  };
}

export function toPublicProjectImage(image: PublicProjectImageSourceRow): PublicProjectImage {
  return {
    imageId: image.id,
    url: publicProjectImageUrl(image.id),
    altText: image.alt_text,
    caption: image.caption,
    isPrimary: Boolean(image.is_primary),
    position: image.position,
  };
}

/**
 * Callers (Phase 2's actual query layer) are responsible for only ever
 * passing a `status === 'published'` record — exactly like
 * getPublishedArticleBySlug filters `status = 'published'` in SQL, never
 * as an afterthought here. This function does not itself re-check status;
 * it only controls which FIELDS of an already-authorized record cross the
 * public boundary.
 */
export function toPublicProject(
  record: PublicProjectSourceRow,
  metrics: PublicProjectMetricSourceRow[],
  images: PublicProjectImageSourceRow[],
): PublicProject {
  return {
    slug: record.slug as string, // a published record always has a slug — the publish action must enforce this before allowing the status transition, mirroring publishArticle()
    commonName: record.common_name,
    projectClass: record.project_class,
    projectType: record.project_type,
    category: record.category,
    location: record.location,
    country: record.country,
    completionDate: record.completion_date ? record.completion_date.toISOString().slice(0, 10) : null,
    completionStatus: record.completion_status,
    publicDescription: record.public_description,
    peakWorkforce: record.peak_workforce,
    builtAreaSqm: record.built_area_sqm,
    floors: record.floors,
    featured: Boolean(record.featured),
    metrics: metrics.map(toPublicProjectMetric),
    images: images.map(toPublicProjectImage),
  };
}

// ---------------------------------------------------------------------------
// Query layer — every query here filters `status = 'published'` in SQL,
// never in application code after the fact (the actual security boundary,
// mirroring api/_lib/newsroom/publicArticles.ts's own header comment), and
// every SELECT lists exact public-safe columns — never `*`.
// ---------------------------------------------------------------------------

async function listPublicMetrics(projectId: string): Promise<PublicProjectMetricSourceRow[]> {
  const [rows] = await getPool().query<(PublicProjectMetricSourceRow & import('mysql2').RowDataPacket)[]>(
    `SELECT ${PUBLIC_PROJECT_METRIC_COLUMNS} FROM project_metrics WHERE project_id = :projectId ORDER BY display_order ASC`,
    { projectId },
  );
  return rows;
}

async function listPublicImages(projectId: string): Promise<PublicProjectImageSourceRow[]> {
  const [rows] = await getPool().query<(PublicProjectImageSourceRow & import('mysql2').RowDataPacket)[]>(
    `SELECT ${PUBLIC_PROJECT_IMAGE_COLUMNS} FROM project_images WHERE project_id = :projectId ORDER BY \`position\` ASC`,
    { projectId },
  );
  return rows;
}

/** Lean list for the public Projects index — no private_description/consultant/client/epromise fields ever leave RDS for this query. */
export async function listPublishedProjects(): Promise<PublicProject[]> {
  const [rows] = await getPool().query<(PublicProjectSourceRow & import('mysql2').RowDataPacket)[]>(
    `SELECT ${PUBLIC_PROJECT_COLUMNS} FROM project_records WHERE status = 'published' ORDER BY updated_at DESC LIMIT 100`,
  );
  const results: PublicProject[] = [];
  for (const row of rows) {
    const [metrics, images] = await Promise.all([listPublicMetrics(row.id), listPublicImages(row.id)]);
    results.push(toPublicProject(row, metrics, images));
  }
  return results;
}

/**
 * Returns null for a nonexistent slug AND for an existing-but-unpublished
 * (draft) one — identical outward behavior for both, by construction of
 * the SQL filter, not by an extra "don't leak status" check layered on
 * top. This is the ONLY lookup path for a public project detail — never
 * by internal id, never by epromise_id/epromise_name.
 */
export async function getPublishedProjectBySlug(slug: string): Promise<PublicProject | null> {
  const [rows] = await getPool().query<(PublicProjectSourceRow & import('mysql2').RowDataPacket)[]>(
    `SELECT ${PUBLIC_PROJECT_COLUMNS} FROM project_records WHERE slug = :slug AND status = 'published' LIMIT 1`,
    { slug },
  );
  const record = rows[0];
  if (!record) return null;

  const [metrics, images] = await Promise.all([listPublicMetrics(record.id), listPublicImages(record.id)]);
  return toPublicProject(record, metrics, images);
}

/**
 * Resolves an image belonging to a PUBLISHED project only — the join
 * condition (`p.status = 'published'`), not a separate check afterward, is
 * what keeps the public image proxy from ever serving a draft project's
 * image even if the caller already knows a real imageId. Returns the real
 * `s3_key` server-side only; this is never sent to the client. Mirrors
 * getPublicImageS3Key (api/_lib/newsroom/publicArticles.ts) exactly.
 */
export async function getPublicProjectImageS3Key(imageId: string): Promise<string | null> {
  const [rows] = await getPool().query<(import('mysql2').RowDataPacket & { s3_key: string })[]>(
    `SELECT img.s3_key AS s3_key
     FROM project_images img
     JOIN project_records p ON p.id = img.project_id
     WHERE img.id = :imageId AND p.status = 'published'
     LIMIT 1`,
    { imageId },
  );
  return rows[0]?.s3_key ?? null;
}
