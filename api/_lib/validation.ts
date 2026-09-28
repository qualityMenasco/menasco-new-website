const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export const ALLOWED_IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedImageContentType = (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number];

export function isAllowedImageContentType(value: unknown): value is AllowedImageContentType {
  return typeof value === 'string' && (ALLOWED_IMAGE_CONTENT_TYPES as readonly string[]).includes(value);
}

export const PDF_CONTENT_TYPE = 'application/pdf';

/**
 * Phase 1 size limits — documented here rather than left as magic numbers.
 * PDF: 50MB covers a long, image-heavy press-release/annual-report style
 * document with margin to spare. Image: 15MB covers an unprocessed
 * high-resolution photo straight off a camera/press kit without being large
 * enough to make a single upload a real abuse vector. Both are generous
 * Phase-1 defaults, not derived from a specific known document — revisit if
 * real submissions need more.
 */
export const MAX_PDF_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/** Presigned PUT URLs expire quickly — long enough for an admin to start an upload without racing a slow connection, short enough that a leaked URL isn't useful for long. */
export const PRESIGNED_URL_EXPIRY_SECONDS = 15 * 60;

const MAX_TITLE_LENGTH = 500;
const MAX_SLUG_LENGTH = 255;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidPosition(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

export function isValidTitle(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_TITLE_LENGTH;
}

/** Normalizes a free-text or already-slug-like string into a URL-safe slug (lowercase, ASCII alphanumeric, single hyphens, no leading/trailing hyphen). */
export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics left over after NFKD (e.g. é -> e + ´)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH);
}

export function isValidSlug(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_SLUG_LENGTH && SLUG_RE.test(value);
}

const MAX_SUBTITLE_LENGTH = 500;
const MAX_CATEGORY_LENGTH = 100;
const MAX_TAG_NAME_LENGTH = 100;
const MAX_TAGS = 20;

export function isValidSubtitle(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_SUBTITLE_LENGTH;
}

/** Free-form slug-like category string — matches the existing static content model (`category: string`), not an enum. */
export function isValidCategory(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_CATEGORY_LENGTH && SLUG_RE.test(value);
}

export interface ArticleTag {
  name: string;
  slug: string;
}

/**
 * A full ISO-8601 datetime with an explicit `Z` or numeric UTC offset —
 * deliberately rejects a bare date ("2026-09-20") and a timezone-less
 * "datetime-local"-looking string ("2026-09-20T09:00"), both of which are
 * exactly the kind of locale/browser-timezone-ambiguous input scheduled
 * publishing must never accept. The UI is responsible for converting an
 * editor's Asia/Dubai wall-clock entry into one of these unambiguous forms
 * before it ever reaches this boundary; this only re-verifies the shape
 * independently rather than trusting the client did that correctly.
 */
const ISO_DATETIME_WITH_TZ_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

export function isValidScheduledAt(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATETIME_WITH_TZ_RE.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

export function isValidTags(value: unknown): value is ArticleTag[] {
  if (!Array.isArray(value) || value.length > MAX_TAGS) return false;
  return value.every(
    (tag) =>
      typeof tag === 'object' &&
      tag !== null &&
      typeof (tag as ArticleTag).name === 'string' &&
      (tag as ArticleTag).name.trim().length > 0 &&
      (tag as ArticleTag).name.length <= MAX_TAG_NAME_LENGTH &&
      isValidSlug((tag as ArticleTag).slug),
  );
}

// ---------------------------------------------------------------------------
// Projects (Phase 1 — schema/validation only, see migrations/005_create_project_tables.sql).
// No Projects API exists yet; these guards are prepared ahead of it so the
// eventual create/update handlers have a validation layer to call, the same
// way every Newsroom field above already does.
// ---------------------------------------------------------------------------

const MAX_EPROMISE_ID_LENGTH = 100;
const MAX_EPROMISE_NAME_LENGTH = 500;
const MAX_COMMON_NAME_LENGTH = 500;
const MAX_PROJECT_CLASS_LENGTH = 100;
const MAX_PROJECT_TYPE_LENGTH = 100;
const MAX_LOCATION_LENGTH = 255;
const MAX_COUNTRY_LENGTH = 100;
const MAX_CONSULTANT_LENGTH = 500;
const MAX_CLIENT_LENGTH = 500;
/** Generous free-text cap (not derived from a specific known project writeup) — same reasoning as MAX_PDF_BYTES/MAX_IMAGE_BYTES: large enough for real content, bounded against abuse. */
const MAX_DESCRIPTION_LENGTH = 20_000;
/** 50 years — comfortably covers any real construction/engineering project duration without being an unbounded field. */
const MAX_DURATION_MONTHS = 600;

function isNonEmptyStringWithinLength(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function isValidEpromiseId(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_EPROMISE_ID_LENGTH);
}

export function isValidEpromiseName(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_EPROMISE_NAME_LENGTH);
}

export function isValidCommonName(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_COMMON_NAME_LENGTH);
}

export function isValidProjectClass(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_PROJECT_CLASS_LENGTH);
}

export function isValidProjectType(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_PROJECT_TYPE_LENGTH);
}

export function isValidLocation(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_LOCATION_LENGTH);
}

export function isValidCountry(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_COUNTRY_LENGTH);
}

export function isValidConsultant(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_CONSULTANT_LENGTH);
}

export function isValidClient(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_CLIENT_LENGTH);
}

export const PROJECT_COMPLETION_STATUSES = ['ongoing', 'completed', 'on_hold'] as const;
export type ProjectCompletionStatusValue = (typeof PROJECT_COMPLETION_STATUSES)[number];

/** Matches migration 005's chk_project_records_completion_status CHECK exactly — kept in sync deliberately, not independently maintained. */
export function isValidCompletionStatus(value: unknown): value is ProjectCompletionStatusValue {
  return typeof value === 'string' && (PROJECT_COMPLETION_STATUSES as readonly string[]).includes(value);
}

export function isValidPublicDescription(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_DESCRIPTION_LENGTH);
}

/** Nullable — unlike the other Projects fields, an absent private_description is valid (not every project needs internal-only notes). */
export function isValidPrivateDescription(value: unknown): value is string | null {
  return value === null || isNonEmptyStringWithinLength(value, MAX_DESCRIPTION_LENGTH);
}

function isPositiveInteger(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= max;
}

export function isValidDurationMonths(value: unknown): value is number {
  return isPositiveInteger(value, MAX_DURATION_MONTHS);
}

/** No documented upper bound for a real project's peak workforce — capped only against nonsense input (a strictly positive 32-bit-safe integer). */
export function isValidPeakWorkforce(value: unknown): value is number {
  return isPositiveInteger(value, Number.MAX_SAFE_INTEGER);
}

export function isValidFloors(value: unknown): value is number {
  return isPositiveInteger(value, 300); // no real building on earth exceeds this today
}

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isValidBuiltAreaSqm(value: unknown): value is number {
  return isPositiveFinite(value);
}

export function isValidValueAmount(value: unknown): value is number {
  return isPositiveFinite(value);
}

const ISO_4217_RE = /^[A-Z]{3}$/;

/** Shape-only (a syntactically valid 3-letter code) — not checked against the real ISO 4217 currency list, matching this repo's existing preference for narrow, purpose-built validation over pulling in a reference-data dependency for Phase 1. */
export function isValidCurrencyCode(value: unknown): value is string {
  return typeof value === 'string' && ISO_4217_RE.test(value);
}

export const PROJECT_STATUSES = ['draft', 'published'] as const;
export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number];

/** A project is never publicly reachable just because a row exists — see migration 005's own comment. Only these two values exist at the data layer. */
export function isValidProjectStatus(value: unknown): value is ProjectStatusValue {
  return typeof value === 'string' && (PROJECT_STATUSES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Projects — metrics/images (Phase 3 route handlers).
// ---------------------------------------------------------------------------

const MAX_METRIC_NAME_LENGTH = 100;
const MAX_METRIC_VALUE_LENGTH = 100;
const MAX_METRIC_UNIT_LENGTH = 50;
const MAX_ALT_TEXT_LENGTH = 500;
const MAX_CAPTION_LENGTH = 1000;

export function isValidMetricName(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_METRIC_NAME_LENGTH);
}

/** Raw value as entered — supports both numeric ("85000") and textual ("LEED Gold") highlights, see migration 005's own comment on project_metrics.metric_value. */
export function isValidMetricValue(value: unknown): value is string {
  return isNonEmptyStringWithinLength(value, MAX_METRIC_VALUE_LENGTH);
}

/** Nullable — a qualitative highlight metric may have no natural unit. */
export function isValidMetricUnit(value: unknown): value is string | null {
  return value === null || isNonEmptyStringWithinLength(value, MAX_METRIC_UNIT_LENGTH);
}

export function isValidDisplayOrder(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

export function isValidAltText(value: unknown): value is string | null {
  return value === null || isNonEmptyStringWithinLength(value, MAX_ALT_TEXT_LENGTH);
}

export function isValidCaption(value: unknown): value is string | null {
  return value === null || isNonEmptyStringWithinLength(value, MAX_CAPTION_LENGTH);
}
