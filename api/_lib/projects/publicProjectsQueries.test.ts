import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Same in-memory fake-DB approach as api/_lib/articles.delete.test.ts — no
 * real MySQL available in this environment. This exercises the actual SQL
 * this module issues (explicit column lists, `status = 'published'`
 * filters) rather than just the pure mapper functions (already covered by
 * publicProjects.test.ts), so a regression that accidentally widened a
 * SELECT or dropped a status filter would be caught here.
 */
interface FakeProjectRow {
  id: string;
  slug: string | null;
  common_name: string;
  project_class: string;
  project_type: string;
  category: string;
  location: string;
  country: string;
  completion_date: Date | null;
  completion_status: string;
  public_description: string;
  peak_workforce: number;
  built_area_sqm: number;
  floors: number;
  featured: number;
  status: string;
  // Private fields, present in the fake store exactly like a real row —
  // proves the query layer itself never selects them, not just that the
  // mapper ignores them.
  epromise_id: string;
  epromise_name: string;
  consultant: string;
  client: string;
  private_description: string;
  duration_months: number;
  value_amount: number;
  value_currency: string;
  created_at: Date;
  updated_at: Date;
}

interface FakeImageRow {
  id: string;
  project_id: string;
  s3_key: string;
  position: number;
  alt_text: string | null;
  caption: string | null;
  is_primary: number;
}

let projects: Map<string, FakeProjectRow>;
let images: Map<string, FakeImageRow>;

const PRIVATE_FIXTURE_VALUES = [
  'EPROMISE-SECRET-001',
  'Epromise Internal Codename',
  'Confidential Consultant LLC',
  'Confidential Client Holdings',
  'Internal margin notes never public',
];

function seedProject(overrides: Partial<FakeProjectRow> & { id: string }): FakeProjectRow {
  const row: FakeProjectRow = {
    slug: 'vela-by-omniyat',
    common_name: 'Vela by Omniyat',
    project_class: 'Residential',
    project_type: 'High-rise',
    category: 'residential',
    location: 'Business Bay',
    country: 'UAE',
    completion_date: new Date('2026-06-01T00:00:00.000Z'),
    completion_status: 'completed',
    public_description: 'A landmark residential tower.',
    peak_workforce: 1200,
    built_area_sqm: 85000,
    floors: 72,
    featured: 1,
    status: 'published',
    epromise_id: PRIVATE_FIXTURE_VALUES[0],
    epromise_name: PRIVATE_FIXTURE_VALUES[1],
    consultant: PRIVATE_FIXTURE_VALUES[2],
    client: PRIVATE_FIXTURE_VALUES[3],
    private_description: PRIVATE_FIXTURE_VALUES[4],
    duration_months: 36,
    value_amount: 420_000_000,
    value_currency: 'AED',
    created_at: new Date('2025-01-01T00:00:00.000Z'),
    updated_at: new Date('2025-06-01T00:00:00.000Z'),
    ...overrides,
  };
  projects.set(row.id, row);
  return row;
}

function seedImage(overrides: Partial<FakeImageRow> & { id: string; project_id: string }): FakeImageRow {
  const row: FakeImageRow = {
    s3_key: `projects/images/${overrides.project_id}/${overrides.id}.jpg`,
    position: 0,
    alt_text: 'A real photo',
    caption: null,
    is_primary: 1,
    ...overrides,
  };
  images.set(row.id, row);
  return row;
}

/** Applies an explicit-column-list SELECT to a fake row, so the fake genuinely can't leak a column the real SQL never asked for. */
function project(row: FakeProjectRow) {
  const { id, slug, common_name, project_class, project_type, category, location, country, completion_date, completion_status, public_description, peak_workforce, built_area_sqm, floors, featured } = row;
  return { id, slug, common_name, project_class, project_type, category, location, country, completion_date, completion_status, public_description, peak_workforce, built_area_sqm, floors, featured };
}
function image(row: FakeImageRow) {
  const { id, position, alt_text, caption, is_primary } = row;
  return { id, position, alt_text, caption, is_primary };
}

function fakeQuery(sql: string, params?: Record<string, unknown>) {
  if (sql.includes('FROM project_records WHERE status = \'published\' ORDER BY')) {
    return Promise.resolve([[...projects.values()].filter((p) => p.status === 'published').map(project)]);
  }
  if (sql.includes('FROM project_records WHERE slug =')) {
    const row = [...projects.values()].find((p) => p.slug === params?.slug && p.status === 'published');
    return Promise.resolve([row ? [project(row)] : []]);
  }
  if (sql.includes('FROM project_metrics WHERE project_id =')) {
    return Promise.resolve([[]]);
  }
  if (sql.includes('FROM project_images img') && sql.includes('JOIN project_records p')) {
    const img = images.get(params?.imageId as string);
    if (!img) return Promise.resolve([[]]);
    const owningProject = projects.get(img.project_id);
    if (!owningProject || owningProject.status !== 'published') return Promise.resolve([[]]);
    return Promise.resolve([[{ s3_key: img.s3_key }]]);
  }
  if (sql.includes('FROM project_images WHERE project_id =')) {
    return Promise.resolve([[...images.values()].filter((i) => i.project_id === params?.projectId).map(image)]);
  }
  throw new Error(`fakeQuery: unrecognized SQL: ${sql}`);
}

vi.mock('../db', () => ({ getPool: () => ({ query: fakeQuery }) }));

const { listPublishedProjects, getPublishedProjectBySlug, getPublicProjectImageS3Key } = await import('./publicProjects');
const { STRICTLY_PRIVATE_PROJECT_FIELDS } = await import('./publicProjects');

function collectAllKeysDeep(value: unknown, keys: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectAllKeysDeep(item, keys);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      keys.add(key);
      collectAllKeysDeep(val, keys);
    }
  }
  return keys;
}

beforeEach(() => {
  projects = new Map();
  images = new Map();
});

describe('listPublishedProjects', () => {
  it('returns only published projects, never a draft one', async () => {
    seedProject({ id: 'p-published', slug: 'published-project', status: 'published' });
    seedProject({ id: 'p-draft', slug: 'draft-project', status: 'draft' });

    const result = await listPublishedProjects();
    expect(result.map((p) => p.slug)).toEqual(['published-project']);
  });

  it.each(STRICTLY_PRIVATE_PROJECT_FIELDS)('never exposes the strictly-private field "%s"', async (forbiddenKey) => {
    seedProject({ id: 'p1' });
    const result = await listPublishedProjects();
    expect(collectAllKeysDeep(result).has(forbiddenKey)).toBe(false);
  });

  it('never leaks a private fixture value anywhere in the serialized output', async () => {
    seedProject({ id: 'p1' });
    const serialized = JSON.stringify(await listPublishedProjects());
    for (const value of PRIVATE_FIXTURE_VALUES) expect(serialized).not.toContain(value);
  });
});

describe('getPublishedProjectBySlug', () => {
  it('returns the project for a published slug', async () => {
    seedProject({ id: 'p1', slug: 'vela-by-omniyat', status: 'published' });
    const result = await getPublishedProjectBySlug('vela-by-omniyat');
    expect(result?.commonName).toBe('Vela by Omniyat');
  });

  it('returns null (404 at the handler layer) for a draft project\'s slug — identical to a nonexistent slug', async () => {
    seedProject({ id: 'p-draft', slug: 'not-yet-public', status: 'draft' });
    expect(await getPublishedProjectBySlug('not-yet-public')).toBeNull();
    expect(await getPublishedProjectBySlug('genuinely-does-not-exist')).toBeNull();
  });

  it('cannot be looked up by the internal UUID', async () => {
    const row = seedProject({ id: 'p1', slug: 'vela-by-omniyat', status: 'published' });
    expect(await getPublishedProjectBySlug(row.id)).toBeNull();
  });

  it('cannot be looked up by epromise_id or epromise_name', async () => {
    const row = seedProject({ id: 'p1', slug: 'vela-by-omniyat', status: 'published' });
    expect(await getPublishedProjectBySlug(row.epromise_id)).toBeNull();
    expect(await getPublishedProjectBySlug(row.epromise_name)).toBeNull();
  });

  it.each(STRICTLY_PRIVATE_PROJECT_FIELDS)('never exposes the strictly-private field "%s"', async (forbiddenKey) => {
    seedProject({ id: 'p1', slug: 'vela-by-omniyat' });
    const result = await getPublishedProjectBySlug('vela-by-omniyat');
    expect(collectAllKeysDeep(result).has(forbiddenKey)).toBe(false);
  });
});

describe('getPublicProjectImageS3Key — draft-project image security', () => {
  it('resolves the real s3_key for an image belonging to a published project', async () => {
    seedProject({ id: 'p1', status: 'published' });
    seedImage({ id: 'img1', project_id: 'p1' });
    expect(await getPublicProjectImageS3Key('img1')).toBe('projects/images/p1/img1.jpg');
  });

  it('returns null (404) for an image belonging to a DRAFT project, even with a real, correct imageId', async () => {
    seedProject({ id: 'p-draft', status: 'draft' });
    seedImage({ id: 'img-draft', project_id: 'p-draft' });
    expect(await getPublicProjectImageS3Key('img-draft')).toBeNull();
  });

  it('returns null for a nonexistent imageId', async () => {
    expect(await getPublicProjectImageS3Key('does-not-exist')).toBeNull();
  });
});
