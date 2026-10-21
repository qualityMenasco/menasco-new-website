/**
 * Parses an uploaded CSV or JSON file (as raw text) into a flat array of
 * partial project rows for the Projects CMS. This module does NOT validate
 * business rules (required fields, category membership, protected-project
 * rules, image path existence) — see validateProjectUpload.ts for that. It
 * only turns raw file text into a typed, structurally-normalized shape.
 *
 * CSV semicolon-separated-list columns (`services`, `gallery`,
 * `services_ar`) and the three keyMetricN column pairs exist only because a
 * CSV cell can't hold a nested array/object — JSON uploads use real nested
 * `keyMetrics: [{label,value}]` and `ar: {...}` structures instead.
 */

export interface ParsedProjectAr {
  description?: string;
  menascoScope?: string;
  sector?: string;
  services?: string[];
}

export interface ParsedProjectKeyMetric {
  label: string;
  value: string;
}

/** One row/object from the upload, before validation against the existing dataset. */
export interface ParsedProjectRow {
  slug: string;
  /** Present only for an explicit slug-rename: identifies the EXISTING record (by its current slug) this row replaces. Never inferred from title changes. */
  oldSlug?: string;
  title?: string;
  location?: string;
  country?: string;
  sector?: string;
  status?: string;
  year?: string;
  client?: string;
  developer?: string;
  consultant?: string;
  mainContractor?: string;
  menascoScope?: string;
  services?: string[];
  description?: string;
  featured?: boolean;
  heroImage?: string;
  gallery?: string[];
  seoTitle?: string;
  seoDescription?: string;
  category?: string;
  keyMetrics?: ParsedProjectKeyMetric[];
  publishState?: 'draft' | 'published';
  ar?: ParsedProjectAr;
}

export class ProjectUploadParseError extends Error {}

const STRING_FIELDS = [
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
  'description',
  'heroImage',
  'seoTitle',
  'seoDescription',
  'category',
] as const;

/** An empty cell means "not provided" (leave the existing value alone on an update), matching every other optional CSV column — not "clear this list to empty". */
function splitSemicolonList(value: unknown): string[] | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Google Drive "share" links (drive.google.com/file/d/ID/view,
 * drive.google.com/open?id=ID, drive.google.com/uc?id=ID) are HTML viewer
 * pages, not image URLs — a browser <img> tag can't render them directly.
 * This rewrites a recognized Drive link to lh3.googleusercontent.com/d/ID,
 * Google's image-serving host, which DOES return the raw image for a file
 * shared as "Anyone with the link can view". This only works for files
 * actually shared that way — an access-restricted file still won't load
 * (no URL rewrite can bypass that), and Google could change or block this
 * undocumented hotlinking path at any time; re-hosting the image file in
 * the repo remains the reliable option, but is deliberately not what this
 * project wants (see conversation: repo-hosted images considered too slow).
 * Any URL that isn't a recognized Drive share link is returned unchanged.
 */
function normalizeGoogleDriveImageUrl(url: string): string {
  const trimmed = url.trim();
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?.*?[?&]id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w2000`;
    }
  }
  return trimmed;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const v = value.trim().toLowerCase();
  if (v === '') return undefined;
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return undefined;
}

function parsePublishState(value: unknown): 'draft' | 'published' | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.trim().toLowerCase();
  if (v === 'draft') return 'draft';
  if (v === 'published') return 'published';
  if (v === '') return undefined;
  throw new ProjectUploadParseError(`Invalid publishState "${value}" — must be "draft" or "published"`);
}

/** Minimal RFC4180-style CSV parser: handles quoted fields, escaped quotes (""), commas/newlines inside quotes. No external dependency. */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  function pushField() {
    row.push(field);
    field = '';
  }
  function pushRow() {
    pushField();
    rows.push(row);
    row = [];
  }

  while (i < len) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ',') {
      pushField();
      i++;
      continue;
    }
    if (char === '\r') {
      i++;
      continue;
    }
    if (char === '\n') {
      pushRow();
      i++;
      continue;
    }
    field += char;
    i++;
  }
  // Final field/row (if the file doesn't end with a trailing newline).
  if (field.length > 0 || row.length > 0) {
    pushRow();
  }
  // Drop fully-blank trailing rows produced by a trailing newline.
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

export function parseProjectCsv(content: string): ParsedProjectRow[] {
  const rows = parseCsvRows(content);
  if (rows.length === 0) {
    throw new ProjectUploadParseError('CSV file is empty');
  }
  const header = rows[0].map((h) => h.trim());
  if (!header.includes('slug')) {
    throw new ProjectUploadParseError('CSV is missing a required "slug" column');
  }

  const dataRows = rows.slice(1).filter((r) => r.some((cell) => cell.trim() !== ''));

  return dataRows.map((cells, index) => {
    const get = (col: string): string | undefined => {
      const colIndex = header.indexOf(col);
      if (colIndex === -1) return undefined;
      const value = cells[colIndex];
      return value === undefined ? undefined : value;
    };

    const slug = (get('slug') ?? '').trim();
    if (!slug) {
      throw new ProjectUploadParseError(`CSV row ${index + 2} is missing a required "slug" value`);
    }

    const parsed: ParsedProjectRow = { slug };

    const oldSlug = get('oldSlug');
    if (oldSlug && oldSlug.trim()) parsed.oldSlug = oldSlug.trim();

    for (const field of STRING_FIELDS) {
      const raw = get(field);
      if (raw !== undefined && raw.trim() !== '') {
        parsed[field] = raw.trim();
      }
    }
    if (parsed.heroImage !== undefined) {
      parsed.heroImage = normalizeGoogleDriveImageUrl(parsed.heroImage);
    }

    const services = splitSemicolonList(get('services'));
    if (services !== undefined) parsed.services = services;

    const gallery = splitSemicolonList(get('gallery'));
    if (gallery !== undefined) parsed.gallery = gallery.map(normalizeGoogleDriveImageUrl);

    const featured = parseBoolean(get('featured'));
    if (featured !== undefined) parsed.featured = featured;

    const publishState = parsePublishState(get('publishState'));
    if (publishState !== undefined) parsed.publishState = publishState;

    const keyMetrics: ParsedProjectKeyMetric[] = [];
    for (const n of [1, 2, 3] as const) {
      const label = get(`keyMetric${n}Label`);
      const value = get(`keyMetric${n}Value`);
      if (label && label.trim() && value && value.trim()) {
        keyMetrics.push({ label: label.trim(), value: value.trim() });
      }
    }
    if (keyMetrics.length > 0) parsed.keyMetrics = keyMetrics;

    const arDescription = get('description_ar');
    const arScope = get('menascoScope_ar');
    const arSector = get('sector_ar');
    const arServices = splitSemicolonList(get('services_ar'));
    const ar: ParsedProjectAr = {};
    if (arDescription && arDescription.trim()) ar.description = arDescription.trim();
    if (arScope && arScope.trim()) ar.menascoScope = arScope.trim();
    if (arSector && arSector.trim()) ar.sector = arSector.trim();
    if (arServices !== undefined && arServices.length > 0) ar.services = arServices;
    if (Object.keys(ar).length > 0) parsed.ar = ar;

    return parsed;
  });
}

export function parseProjectJson(content: string): ParsedProjectRow[] {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch (err) {
    throw new ProjectUploadParseError(`Invalid JSON: ${(err as Error).message}`);
  }
  if (!Array.isArray(data)) {
    throw new ProjectUploadParseError('JSON upload must be an array of project objects');
  }

  return data.map((item, index) => {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ProjectUploadParseError(`JSON array item at index ${index} must be an object`);
    }
    const obj = item as Record<string, unknown>;
    const slugRaw = obj.slug;
    if (typeof slugRaw !== 'string' || slugRaw.trim() === '') {
      throw new ProjectUploadParseError(`JSON array item at index ${index} is missing a required "slug" string`);
    }
    const parsed: ParsedProjectRow = { slug: slugRaw.trim() };

    if (typeof obj.oldSlug === 'string' && obj.oldSlug.trim()) {
      parsed.oldSlug = obj.oldSlug.trim();
    }

    for (const field of STRING_FIELDS) {
      const raw = obj[field];
      if (typeof raw === 'string' && raw.trim() !== '') {
        parsed[field] = raw.trim();
      }
    }
    if (parsed.heroImage !== undefined) {
      parsed.heroImage = normalizeGoogleDriveImageUrl(parsed.heroImage);
    }

    if (Array.isArray(obj.services)) {
      parsed.services = obj.services.filter((s): s is string => typeof s === 'string');
    }
    if (Array.isArray(obj.gallery)) {
      parsed.gallery = obj.gallery.filter((s): s is string => typeof s === 'string').map(normalizeGoogleDriveImageUrl);
    }
    if (typeof obj.featured === 'boolean') {
      parsed.featured = obj.featured;
    } else if (typeof obj.featured === 'string') {
      const b = parseBoolean(obj.featured);
      if (b !== undefined) parsed.featured = b;
    }
    if (obj.publishState !== undefined) {
      const publishState = parsePublishState(obj.publishState);
      if (publishState !== undefined) parsed.publishState = publishState;
    }
    if (Array.isArray(obj.keyMetrics)) {
      const keyMetrics: ParsedProjectKeyMetric[] = [];
      for (const metric of obj.keyMetrics) {
        if (
          metric != null &&
          typeof metric === 'object' &&
          typeof (metric as Record<string, unknown>).label === 'string' &&
          typeof (metric as Record<string, unknown>).value === 'string'
        ) {
          keyMetrics.push({
            label: (metric as Record<string, string>).label,
            value: (metric as Record<string, string>).value,
          });
        } else {
          throw new ProjectUploadParseError(`JSON array item "${parsed.slug}" has an invalid keyMetrics entry — each must be {label: string, value: string}`);
        }
      }
      parsed.keyMetrics = keyMetrics;
    }
    if (obj.ar != null && typeof obj.ar === 'object' && !Array.isArray(obj.ar)) {
      const arRaw = obj.ar as Record<string, unknown>;
      const ar: ParsedProjectAr = {};
      if (typeof arRaw.description === 'string' && arRaw.description.trim()) ar.description = arRaw.description.trim();
      if (typeof arRaw.menascoScope === 'string' && arRaw.menascoScope.trim()) ar.menascoScope = arRaw.menascoScope.trim();
      if (typeof arRaw.sector === 'string' && arRaw.sector.trim()) ar.sector = arRaw.sector.trim();
      if (Array.isArray(arRaw.services)) {
        const services = arRaw.services.filter((s): s is string => typeof s === 'string');
        if (services.length > 0) ar.services = services;
      }
      if (Object.keys(ar).length > 0) parsed.ar = ar;
    }

    return parsed;
  });
}

export function parseProjectUpload(content: string, format: 'csv' | 'json'): ParsedProjectRow[] {
  if (format === 'csv') return parseProjectCsv(content);
  if (format === 'json') return parseProjectJson(content);
  throw new ProjectUploadParseError(`Unknown upload format "${format}" — must be "csv" or "json"`);
}

/** Minimal shape needed to serialize a stored project back to CSV — avoids importing the full ProjectRecord type into this dependency-light parser module. */
export interface SerializableProject {
  /** Internal tracking ID (e.g. "MENASCO-0001") — export-only, never read back on re-upload (see projectCsvJsonParser's STRING_FIELDS, which deliberately omits it). */
  internalId: string;
  slug: string;
  title: string;
  location: string;
  country: string;
  sector: string;
  status: string;
  year: string;
  client: string;
  developer: string;
  consultant: string;
  mainContractor: string;
  menascoScope: string;
  services: string[];
  description: string;
  featured: boolean;
  heroImage: string;
  gallery: string[];
  seoTitle: string;
  seoDescription: string;
  category?: string;
  keyMetrics: ParsedProjectKeyMetric[];
  publishState: 'draft' | 'published';
}

const CSV_EXPORT_COLUMNS = [
  'internalId',
  'slug',
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
  'keyMetric1Label',
  'keyMetric1Value',
  'keyMetric2Label',
  'keyMetric2Value',
  'keyMetric3Label',
  'keyMetric3Value',
  'publishState',
] as const;

/** RFC4180 field escaping — quotes a field only when it contains a comma, quote, or newline (matching parseProjectCsv's own quoting assumptions). */
function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Serializes stored projects back into the same CSV shape parseProjectCsv accepts — round-trippable with the upload format, for the CMS's "download current dataset" export. */
export function projectsToCsv(projects: SerializableProject[]): string {
  const lines = [CSV_EXPORT_COLUMNS.join(',')];
  for (const p of projects) {
    const row: Record<(typeof CSV_EXPORT_COLUMNS)[number], string> = {
      internalId: p.internalId,
      slug: p.slug,
      title: p.title,
      location: p.location,
      country: p.country,
      sector: p.sector,
      status: p.status,
      year: p.year,
      client: p.client,
      developer: p.developer,
      consultant: p.consultant,
      mainContractor: p.mainContractor,
      menascoScope: p.menascoScope,
      services: p.services.join(';'),
      description: p.description,
      featured: p.featured ? 'true' : 'false',
      heroImage: p.heroImage,
      gallery: p.gallery.join(';'),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      category: p.category ?? '',
      keyMetric1Label: p.keyMetrics[0]?.label ?? '',
      keyMetric1Value: p.keyMetrics[0]?.value ?? '',
      keyMetric2Label: p.keyMetrics[1]?.label ?? '',
      keyMetric2Value: p.keyMetrics[1]?.value ?? '',
      keyMetric3Label: p.keyMetrics[2]?.label ?? '',
      keyMetric3Value: p.keyMetrics[2]?.value ?? '',
      publishState: p.publishState,
    };
    lines.push(CSV_EXPORT_COLUMNS.map((col) => csvEscape(row[col])).join(','));
  }
  return lines.join('\r\n');
}
