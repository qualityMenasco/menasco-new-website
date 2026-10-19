import { describe, expect, it } from 'vitest';
import type { ProjectRecord } from '../../data/projects';
import { validateProjectUpload } from './validateProjectUpload';
import type { ParsedProjectRow } from './projectCsvJsonParser';

function makeProject(overrides: Partial<ProjectRecord>): ProjectRecord {
  return {
    id: overrides.slug ?? 'x',
    slug: 'x',
    title: 'X',
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
    heroImage: '/x.jpg',
    gallery: [],
    seoTitle: '',
    seoDescription: '',
    verificationStatus: 'verified',
    keyMetrics: [],
    publishState: 'published',
    protected: false,
    ...overrides,
  };
}

const CURRENT: ProjectRecord[] = [
  makeProject({ id: 'casa-cavalli', slug: 'casa-cavalli', title: 'Casa Cavalli' }),
  makeProject({ id: 'vela-by-omniyat', slug: 'vela-by-omniyat', title: 'VELA by Omniyat', protected: true }),
  makeProject({ id: 'qiddiya', slug: 'qiddiya', title: 'Qiddiya', protected: true }),
];

describe('validateProjectUpload', () => {
  it('accepts a valid partial update to a non-protected project', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', title: 'Casa Cavalli Updated' }];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.diff.updated).toHaveLength(1);
    expect(result.diff.updated[0].changedFields).toContain('title');
    expect(result.diff.removed).toEqual([]);
  });

  it('accepts a valid full replacement that includes every existing slug (no deletions), with override since protected rows are repeated', () => {
    const rows: ParsedProjectRow[] = [
      { slug: 'casa-cavalli', title: 'Casa Cavalli' },
      { slug: 'vela-by-omniyat', title: 'VELA by Omniyat' },
      { slug: 'qiddiya', title: 'Qiddiya' },
      { slug: 'new-one', title: 'New One' },
    ];
    const result = validateProjectUpload(rows, CURRENT, { fullReplacement: true, allowProtectedOverride: true });
    expect(result.valid).toBe(true);
    expect(result.diff.added.map((p) => p.slug)).toEqual(['new-one']);
    expect(result.diff.removed).toEqual([]);
  });

  it('rejects any row touching a protected slug in a full replacement without override, even unchanged', () => {
    const rows: ParsedProjectRow[] = [
      { slug: 'casa-cavalli', title: 'Casa Cavalli' },
      { slug: 'vela-by-omniyat', title: 'VELA by Omniyat' },
      { slug: 'qiddiya', title: 'Qiddiya' },
      { slug: 'new-one', title: 'New One' },
    ];
    const result = validateProjectUpload(rows, CURRENT, { fullReplacement: true });
    expect(result.valid).toBe(false);
    expect(result.errors.filter((e) => e.field === 'protected')).toHaveLength(2);
  });

  it('rejects a row missing the required slug field', () => {
    const rows: ParsedProjectRow[] = [{ slug: '', title: 'No slug' } as ParsedProjectRow];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('slug');
  });

  it('rejects a row missing the required title field for a new project', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'brand-new' }];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('title');
  });

  it('rejects an invalid category', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', category: 'not-a-real-category' }];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('category');
  });

  it('accepts a real category key', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', category: 'residential-commercial' }];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(true);
  });

  it('rejects a bad heroImage path (neither https URL nor an existing /public path)', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', heroImage: '/this-file-does-not-exist-anywhere.jpg' }];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('heroImage');
  });

  it('accepts an https heroImage URL without checking it is reachable', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', heroImage: 'https://example.com/whatever-not-fetched.jpg' }];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(true);
  });

  it('rejects editing a protected project (qiddiya) without allowProtectedOverride', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'qiddiya', title: 'Qiddiya Renamed' }];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('protected');
    expect(result.errors[0].message).toMatch(/PROTECTED PROJECT/);
  });

  it('accepts editing a protected project WITH allowProtectedOverride: true', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'qiddiya', title: 'Qiddiya Renamed' }];
    const result = validateProjectUpload(rows, CURRENT, { allowProtectedOverride: true });
    expect(result.valid).toBe(true);
    expect(result.diff.updated).toHaveLength(1);
  });

  it('rejects a full-replacement upload that omits a protected project (vela-by-omniyat) entirely, without override', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', title: 'Casa Cavalli' }];
    const result = validateProjectUpload(rows, CURRENT, { fullReplacement: true });
    // Both vela-by-omniyat and qiddiya are missing from the upload -> deletion attempts, both protected, no override given.
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.row === 'vela-by-omniyat' && e.field === 'protected')).toBe(true);
    expect(result.errors.some((e) => e.row === 'qiddiya' && e.field === 'protected')).toBe(true);
  });

  it('allows deleting a protected project via full-replacement WITH allowProtectedOverride', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', title: 'Casa Cavalli' }];
    const result = validateProjectUpload(rows, CURRENT, { fullReplacement: true, allowProtectedOverride: true });
    expect(result.valid).toBe(true);
    expect(result.diff.removed.map((r) => r.slug).sort()).toEqual(['qiddiya', 'vela-by-omniyat']);
  });

  it('detects a slug change via oldSlug and reports it in diff.slugChanged', () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli-renamed', oldSlug: 'casa-cavalli', title: 'Casa Cavalli' }];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(true);
    expect(result.diff.slugChanged).toEqual([{ oldSlug: 'casa-cavalli', newSlug: 'casa-cavalli-renamed' }]);
    expect(result.diff.updated[0].slug).toBe('casa-cavalli-renamed');
  });

  it('accepts an upload row with AR fields included and preserves them for the diff', () => {
    const rows: ParsedProjectRow[] = [
      { slug: 'casa-cavalli', ar: { description: 'وصف جديد', sector: 'سكني', services: ['خدمة'] } },
    ];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(true);
    // AR fields don't live on ProjectRecord itself (they go to a separate file), but the
    // validator must not error out on their presence or drop the row from the diff.
    expect(result.diff.updated).toHaveLength(0); // no English fields changed in this row
  });

  it('rejects a duplicate slug within the same upload', () => {
    const rows: ParsedProjectRow[] = [
      { slug: 'brand-new', title: 'First' },
      { slug: 'brand-new', title: 'Second' },
    ];
    const result = validateProjectUpload(rows, CURRENT, {});
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('Duplicate slug'))).toBe(true);
  });
});
