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

/** No test here relies on an arbitrary local path actually "existing" except the one test that explicitly says so — mirrors how production asks GitHub, not the filesystem. */
const noLocalImagesExist = async () => false;

describe('validateProjectUpload', () => {
  it('accepts a valid partial update to a non-protected project', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', title: 'Casa Cavalli Updated' }];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.diff.updated).toHaveLength(1);
    expect(result.diff.updated[0].changedFields).toContain('title');
    expect(result.diff.removed).toEqual([]);
  });

  it('accepts a valid full replacement that includes every existing slug (no deletions), with override since protected rows are repeated', async () => {
    const rows: ParsedProjectRow[] = [
      { slug: 'casa-cavalli', title: 'Casa Cavalli' },
      { slug: 'vela-by-omniyat', title: 'VELA by Omniyat' },
      { slug: 'qiddiya', title: 'Qiddiya' },
      { slug: 'new-one', title: 'New One' },
    ];
    const result = await validateProjectUpload(rows, CURRENT, {
      fullReplacement: true,
      allowProtectedOverride: true,
      checkLocalImagePathExists: noLocalImagesExist,
    });
    expect(result.valid).toBe(true);
    expect(result.diff.added.map((p) => p.slug)).toEqual(['new-one']);
    expect(result.diff.removed).toEqual([]);
  });

  it('rejects any row touching a protected slug in a full replacement without override, even unchanged', async () => {
    const rows: ParsedProjectRow[] = [
      { slug: 'casa-cavalli', title: 'Casa Cavalli' },
      { slug: 'vela-by-omniyat', title: 'VELA by Omniyat' },
      { slug: 'qiddiya', title: 'Qiddiya' },
      { slug: 'new-one', title: 'New One' },
    ];
    const result = await validateProjectUpload(rows, CURRENT, { fullReplacement: true, checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(false);
    expect(result.errors.filter((e) => e.field === 'protected')).toHaveLength(2);
  });

  it('rejects a row missing the required slug field', async () => {
    const rows: ParsedProjectRow[] = [{ slug: '', title: 'No slug' } as ParsedProjectRow];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('slug');
  });

  it('rejects a row missing the required title field for a new project', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'brand-new' }];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('title');
  });

  it('rejects an invalid category', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', category: 'not-a-real-category' }];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('category');
  });

  it('accepts a real category key', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', category: 'residential-commercial' }];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(true);
  });

  it('rejects a bad heroImage path (neither https URL nor an existing /public path)', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', heroImage: '/this-file-does-not-exist-anywhere.jpg' }];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('heroImage');
  });

  it('accepts an https heroImage URL without checking it is reachable', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', heroImage: 'https://example.com/whatever-not-fetched.jpg' }];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(true);
  });

  it('accepts a local heroImage path when checkLocalImagePathExists confirms it exists (checked against public/<path>, i.e. a GitHub repo read in production — never the local filesystem, which a Vercel serverless function never has access to)', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', heroImage: '/assets/projects/qiddiya/qiddiya-speed-park-aerial.jpg' }];
    const result = await validateProjectUpload(rows, CURRENT, {
      checkLocalImagePathExists: async (p) => p === 'public/assets/projects/qiddiya/qiddiya-speed-park-aerial.jpg',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects editing a protected project (qiddiya) without allowProtectedOverride', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'qiddiya', title: 'Qiddiya Renamed' }];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('protected');
    expect(result.errors[0].message).toMatch(/PROTECTED PROJECT/);
  });

  it('accepts editing a protected project WITH allowProtectedOverride: true', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'qiddiya', title: 'Qiddiya Renamed' }];
    const result = await validateProjectUpload(rows, CURRENT, { allowProtectedOverride: true, checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(true);
    expect(result.diff.updated).toHaveLength(1);
  });

  it('rejects a full-replacement upload that omits a protected project (vela-by-omniyat) entirely, without override', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', title: 'Casa Cavalli' }];
    const result = await validateProjectUpload(rows, CURRENT, { fullReplacement: true, checkLocalImagePathExists: noLocalImagesExist });
    // Both vela-by-omniyat and qiddiya are missing from the upload -> deletion attempts, both protected, no override given.
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.row === 'vela-by-omniyat' && e.field === 'protected')).toBe(true);
    expect(result.errors.some((e) => e.row === 'qiddiya' && e.field === 'protected')).toBe(true);
  });

  it('allows deleting a protected project via full-replacement WITH allowProtectedOverride', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli', title: 'Casa Cavalli' }];
    const result = await validateProjectUpload(rows, CURRENT, {
      fullReplacement: true,
      allowProtectedOverride: true,
      checkLocalImagePathExists: noLocalImagesExist,
    });
    expect(result.valid).toBe(true);
    expect(result.diff.removed.map((r) => r.slug).sort()).toEqual(['qiddiya', 'vela-by-omniyat']);
  });

  it('detects a slug change via oldSlug and reports it in diff.slugChanged', async () => {
    const rows: ParsedProjectRow[] = [{ slug: 'casa-cavalli-renamed', oldSlug: 'casa-cavalli', title: 'Casa Cavalli' }];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(true);
    expect(result.diff.slugChanged).toEqual([{ oldSlug: 'casa-cavalli', newSlug: 'casa-cavalli-renamed' }]);
    expect(result.diff.updated[0].slug).toBe('casa-cavalli-renamed');
  });

  it('accepts an upload row with AR fields included and preserves them for the diff', async () => {
    const rows: ParsedProjectRow[] = [
      { slug: 'casa-cavalli', ar: { description: 'وصف جديد', sector: 'سكني', services: ['خدمة'] } },
    ];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(true);
    // AR fields don't live on ProjectRecord itself (they go to a separate file), but the
    // validator must not error out on their presence or drop the row from the diff.
    expect(result.diff.updated).toHaveLength(0); // no English fields changed in this row
  });

  it('rejects a duplicate slug within the same upload', async () => {
    const rows: ParsedProjectRow[] = [
      { slug: 'brand-new', title: 'First' },
      { slug: 'brand-new', title: 'Second' },
    ];
    const result = await validateProjectUpload(rows, CURRENT, { checkLocalImagePathExists: noLocalImagesExist });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes('Duplicate slug'))).toBe(true);
  });
});
