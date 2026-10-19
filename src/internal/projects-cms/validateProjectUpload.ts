import type { ProjectRecord } from '../../data/projects.js';
import { projectCategories } from '../../data/projectCategories.js';
import type { ParsedProjectRow } from './projectCsvJsonParser.js';
import { PROTECTED_SLUGS } from './protectedSlugs.js';

export interface ValidationError {
  /** The row's slug when known, else a positional "row N" marker for a row that failed before its slug could be trusted. */
  row: string;
  field: string;
  message: string;
}

export interface UpdatedProjectDiff {
  slug: string;
  before: ProjectRecord;
  after: ProjectRecord;
  changedFields: string[];
}

export interface ProjectDiff {
  added: ProjectRecord[];
  updated: UpdatedProjectDiff[];
  removed: { slug: string; title: string }[];
  slugChanged: { oldSlug: string; newSlug: string }[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  diff: ProjectDiff;
}

export interface ValidateProjectUploadOptions {
  /** Treat the upload as the complete dataset: any existing slug absent from the upload is a deletion. */
  fullReplacement?: boolean;
  /** Explicit owner override required to edit or delete a protected (VELA/Qiddiya) project. */
  allowProtectedOverride?: boolean;
  /**
   * Checks whether a `/`-prefixed local image path exists under `public/`.
   * Required for any upload that references a local path (vs. an external
   * https:// URL, which never calls this) — pass a GitHub-backed
   * implementation in production (see api/_lib/projectsCms/validate.ts),
   * or a simple in-memory stub in tests. There is deliberately no default:
   * a plain `fs.existsSync` default would silently work in local
   * development and fail in every real deployment, which is the exact bug
   * this replaced (a Vercel serverless function's filesystem never includes
   * the full public/ directory).
   */
  checkLocalImagePathExists: (path: string) => Promise<boolean>;
}

async function isPlausibleImagePath(value: string, checkLocalImagePathExists: (path: string) => Promise<boolean>): Promise<boolean> {
  if (value.startsWith('https://') || value.startsWith('http://')) return true;
  if (value.startsWith('/')) {
    return checkLocalImagePathExists(`public${value}`);
  }
  return false;
}

/** Builds a full ProjectRecord by applying a parsed upload row on top of the existing record (partial update) or CMS defaults (new project). */
function mergeRow(row: ParsedProjectRow, existing: ProjectRecord | undefined): ProjectRecord {
  const base: ProjectRecord = existing ?? {
    id: row.slug,
    slug: row.slug,
    title: '',
    location: '',
    country: '',
    sector: '',
    status: '',
    year: '',
    client: '',
    developer: '',
    consultant: '',
    mainContractor: '',
    menascoScope: '',
    services: [],
    description: '',
    featured: false,
    heroImage: '',
    gallery: [],
    seoTitle: '',
    seoDescription: '',
    verificationStatus: 'pending',
    keyMetrics: [],
    publishState: 'published',
    protected: false,
  };

  const merged: ProjectRecord = { ...base };
  const assignIfPresent = <K extends keyof ParsedProjectRow & keyof ProjectRecord>(key: K) => {
    if (row[key] !== undefined) {
      (merged as unknown as Record<string, unknown>)[key] = row[key];
    }
  };

  assignIfPresent('title');
  assignIfPresent('location');
  assignIfPresent('country');
  assignIfPresent('sector');
  assignIfPresent('status');
  assignIfPresent('year');
  assignIfPresent('client');
  assignIfPresent('developer');
  assignIfPresent('consultant');
  assignIfPresent('mainContractor');
  assignIfPresent('menascoScope');
  assignIfPresent('services');
  assignIfPresent('description');
  assignIfPresent('featured');
  assignIfPresent('heroImage');
  assignIfPresent('gallery');
  assignIfPresent('seoTitle');
  assignIfPresent('seoDescription');
  assignIfPresent('category');
  assignIfPresent('keyMetrics');
  assignIfPresent('publishState');

  merged.id = merged.id || row.slug;
  merged.slug = row.slug;
  // `protected` is never user-settable via upload — preserve whatever it already was (false for a brand-new project).
  merged.protected = existing?.protected ?? PROTECTED_SLUGS.has(row.slug);

  return merged;
}

const DIFF_FIELDS: (keyof ProjectRecord)[] = [
  'title',
  'location',
  'country',
  'sector',
  'status',
  'year',
  'client',
  'developer',
  'consultant',
  'mainContractor',
  'menascoScope',
  'services',
  'description',
  'featured',
  'heroImage',
  'gallery',
  'seoTitle',
  'seoDescription',
  'category',
  'keyMetrics',
  'publishState',
];

function fieldsChanged(before: ProjectRecord, after: ProjectRecord): string[] {
  const changed: string[] = [];
  for (const field of DIFF_FIELDS) {
    const a = before[field];
    const b = after[field];
    if (JSON.stringify(a) !== JSON.stringify(b)) changed.push(field);
  }
  return changed;
}

export async function validateProjectUpload(
  rows: ParsedProjectRow[],
  currentProjects: ProjectRecord[],
  options: ValidateProjectUploadOptions,
): Promise<ValidationResult> {
  const { fullReplacement = false, allowProtectedOverride = false, checkLocalImagePathExists } = options;
  const errors: ValidationError[] = [];
  const bySlug = new Map(currentProjects.map((p) => [p.slug, p]));
  const seenSlugs = new Set<string>();

  const added: ProjectRecord[] = [];
  const updated: UpdatedProjectDiff[] = [];
  const slugChanged: { oldSlug: string; newSlug: string }[] = [];

  for (const row of rows) {
    const rowLabel = row.slug || '(unknown row)';

    if (!row.slug || !row.slug.trim()) {
      errors.push({ row: rowLabel, field: 'slug', message: 'Missing required field "slug"' });
      continue;
    }
    if (seenSlugs.has(row.slug)) {
      errors.push({ row: rowLabel, field: 'slug', message: `Duplicate slug "${row.slug}" appears more than once in this upload` });
      continue;
    }
    seenSlugs.add(row.slug);

    const isRename = Boolean(row.oldSlug && row.oldSlug !== row.slug);
    if (isRename && !bySlug.has(row.oldSlug!)) {
      errors.push({ row: rowLabel, field: 'oldSlug', message: `oldSlug "${row.oldSlug}" does not match any existing project — cannot rename` });
      continue;
    }
    if (isRename && bySlug.has(row.slug)) {
      errors.push({ row: rowLabel, field: 'slug', message: `Cannot rename to "${row.slug}" — a project with that slug already exists` });
      continue;
    }

    const existing = isRename ? bySlug.get(row.oldSlug!) : bySlug.get(row.slug);
    const isNew = existing === undefined;

    if (isNew && (!row.title || !row.title.trim())) {
      errors.push({ row: rowLabel, field: 'title', message: 'Missing required field "title" for new project' });
      continue;
    }

    if (row.category !== undefined && !(row.category in projectCategories)) {
      errors.push({
        row: rowLabel,
        field: 'category',
        message: `Invalid category "${row.category}" — must be one of: ${Object.keys(projectCategories).join(', ')}`,
      });
      continue;
    }

    if (row.heroImage !== undefined && (!row.heroImage.trim() || !(await isPlausibleImagePath(row.heroImage, checkLocalImagePathExists)))) {
      errors.push({ row: rowLabel, field: 'heroImage', message: `heroImage "${row.heroImage}" is not a valid absolute URL or an existing /-prefixed public/ path` });
      continue;
    }

    if (row.gallery !== undefined) {
      let badGalleryEntry: string | undefined;
      for (const g of row.gallery) {
        if (!g.trim() || !(await isPlausibleImagePath(g, checkLocalImagePathExists))) {
          badGalleryEntry = g;
          break;
        }
      }
      if (badGalleryEntry !== undefined) {
        errors.push({ row: rowLabel, field: 'gallery', message: `gallery entry "${badGalleryEntry}" is not a valid absolute URL or an existing /-prefixed public/ path` });
        continue;
      }
    }

    const identitySlug = isRename ? row.oldSlug! : row.slug;
    const isProtected = PROTECTED_SLUGS.has(identitySlug);
    if (isProtected && !allowProtectedOverride) {
      errors.push({
        row: rowLabel,
        field: 'protected',
        message: `PROTECTED PROJECT: "${identitySlug}" is a protected project (VELA by Omniyat / Qiddiya) and cannot be edited without explicitly setting allowProtectedOverride: true. This is a deliberate safeguard, not an ordinary validation error.`,
      });
      continue;
    }

    const merged = mergeRow(row, existing);

    if (isRename) {
      seenSlugs.add(row.oldSlug!);
      slugChanged.push({ oldSlug: row.oldSlug!, newSlug: row.slug });
      const changedFields = fieldsChanged(existing!, merged);
      updated.push({ slug: row.slug, before: existing!, after: merged, changedFields: Array.from(new Set([...changedFields, 'slug'])) });
    } else if (isNew) {
      added.push(merged);
    } else {
      const changedFields = fieldsChanged(existing!, merged);
      if (changedFields.length > 0) {
        updated.push({ slug: row.slug, before: existing!, after: merged, changedFields });
      }
    }
  }

  const removed: { slug: string; title: string }[] = [];
  if (fullReplacement) {
    for (const existing of currentProjects) {
      if (!seenSlugs.has(existing.slug)) {
        const isProtected = PROTECTED_SLUGS.has(existing.slug);
        if (isProtected && !allowProtectedOverride) {
          errors.push({
            row: existing.slug,
            field: 'protected',
            message: `PROTECTED PROJECT: full-dataset-replacement upload omits "${existing.slug}" (VELA by Omniyat / Qiddiya), which would delete it. This cannot happen without explicitly setting allowProtectedOverride: true.`,
          });
          continue;
        }
        removed.push({ slug: existing.slug, title: existing.title });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    diff: { added, updated, removed, slugChanged },
  };
}
