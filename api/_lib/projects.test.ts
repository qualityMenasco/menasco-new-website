import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Same in-memory fake-DB approach as api/_lib/articles.delete.test.ts — no
 * real MySQL available in this environment. `withTransaction` runs the
 * callback directly against the same fake store (single-threaded, so this
 * verifies the OPERATION SEQUENCE and END STATE a transaction produces,
 * not real row-locking/concurrency) — not a substitute for a real RDS
 * integration run before Production rollout, same caveat
 * articles.delete.test.ts already documents for its own transaction-free
 * cases.
 */
interface FakeProjectRow {
  id: string;
  slug: string | null;
  status: string;
}

interface FakeImageRow {
  id: string;
  project_id: string;
  s3_key: string;
  position: number;
  is_primary: number;
}

interface FakeMetricRow {
  id: string;
  project_id: string;
  display_order: number;
}

let projects: Map<string, FakeProjectRow>;
let projectImages: Map<string, FakeImageRow>;
let projectMetrics: Map<string, FakeMetricRow>;
let callOrder: string[];

function fakeQuery(sql: string, params?: Record<string, unknown>) {
  const id = params?.id as string | undefined;

  if (sql.startsWith('SELECT * FROM project_records WHERE id')) {
    const row = id ? projects.get(id) : undefined;
    return Promise.resolve([row ? [{ ...row }] : []]);
  }
  if (sql.startsWith('UPDATE project_records SET')) {
    const row = projects.get(id as string);
    if (!row) return Promise.resolve([{ affectedRows: 0 }]);
    if (sql.includes('slug = :slug')) row.slug = (params?.slug as string | null) ?? null;
    if (sql.includes('status = :status')) row.status = params?.status as string;
    return Promise.resolve([{ affectedRows: 1 }]);
  }
  if (sql.startsWith('DELETE FROM project_records WHERE id')) {
    callOrder.push('db-delete-project');
    const existed = id ? projects.has(id) : false;
    if (id) projects.delete(id);
    return Promise.resolve([{ affectedRows: existed ? 1 : 0 }]);
  }

  if (sql.includes('FROM project_images WHERE id = :imageId AND project_id = :projectId') && sql.includes('LIMIT 1')) {
    const row = projectImages.get(params?.imageId as string);
    return Promise.resolve([row && row.project_id === params?.projectId ? [{ ...row }] : []]);
  }
  if (sql.startsWith('SELECT id FROM project_images WHERE id =') && sql.includes('FOR UPDATE')) {
    const row = projectImages.get(params?.imageId as string);
    return Promise.resolve([row && row.project_id === params?.projectId ? [{ id: row.id }] : []]);
  }
  if (sql.startsWith('UPDATE project_images SET is_primary = 0 WHERE project_id')) {
    for (const img of projectImages.values()) {
      if (img.project_id === params?.projectId) img.is_primary = 0;
    }
    return Promise.resolve([{ affectedRows: 0 }]);
  }
  if (sql.startsWith('UPDATE project_images SET is_primary = 1 WHERE id')) {
    // Two different call sites share this SQL prefix with different param names:
    // setProjectImagePrimary binds :imageId, deleteProjectImage's promotion binds :id.
    const targetId = (params?.imageId ?? params?.id) as string | undefined;
    const row = targetId ? projectImages.get(targetId) : undefined;
    if (row) row.is_primary = 1;
    return Promise.resolve([{ affectedRows: row ? 1 : 0 }]);
  }
  if (sql.startsWith('DELETE FROM project_images WHERE id')) {
    callOrder.push('db-delete-image');
    projectImages.delete(params?.imageId as string);
    return Promise.resolve([{ affectedRows: 1 }]);
  }
  if (sql.includes('FROM project_images WHERE project_id') && sql.includes('ORDER BY `position` ASC LIMIT 1') && sql.includes('FOR UPDATE')) {
    const remaining = [...projectImages.values()]
      .filter((img) => img.project_id === params?.projectId)
      .sort((a, b) => a.position - b.position);
    return Promise.resolve([remaining.length > 0 ? [{ id: remaining[0].id }] : []]);
  }
  if (sql.startsWith('SELECT id FROM project_images WHERE project_id') && sql.includes('FOR UPDATE')) {
    return Promise.resolve([[...projectImages.values()].filter((i) => i.project_id === params?.projectId).map((i) => ({ id: i.id }))]);
  }
  if (sql.includes('UPDATE project_images SET `position` = :tempPosition')) {
    const img = projectImages.get(params?.id as string);
    if (img) img.position = params?.tempPosition as number;
    return Promise.resolve([{ affectedRows: 1 }]);
  }
  if (sql.includes('UPDATE project_images SET `position` = :position')) {
    const img = projectImages.get(params?.id as string);
    if (img) img.position = params?.position as number;
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  if (sql.startsWith('SELECT id FROM project_metrics WHERE project_id') && sql.includes('FOR UPDATE')) {
    return Promise.resolve([[...projectMetrics.values()].filter((m) => m.project_id === params?.projectId).map((m) => ({ id: m.id }))]);
  }
  if (sql.includes('UPDATE project_metrics SET display_order = :tempOrder')) {
    const m = projectMetrics.get(params?.id as string);
    if (m) m.display_order = params?.tempOrder as number;
    return Promise.resolve([{ affectedRows: 1 }]);
  }
  if (sql.includes('UPDATE project_metrics SET display_order = :order')) {
    const m = projectMetrics.get(params?.id as string);
    if (m) m.display_order = params?.order as number;
    return Promise.resolve([{ affectedRows: 1 }]);
  }

  throw new Error(`fakeQuery: unrecognized SQL: ${sql}`);
}

const deleteObjectsWithPrefix = vi.fn();

// A real DB transaction combined with `FOR UPDATE` (as setProjectImagePrimary/
// deleteProjectImage/reorder* all use) serializes concurrent callers on the
// same row — this mutex reproduces exactly that guarantee for the fake store,
// so a Promise.all of "concurrent" calls genuinely exercises the ordering
// contract instead of freely interleaving mid-callback (which a bare
// `fn({query: fakeQuery})` with no lock would allow, defeating the point of a
// concurrency-aware test).
let transactionLock: Promise<unknown> = Promise.resolve();
function withFakeTransactionLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = transactionLock.then(fn, fn);
  transactionLock = run.catch(() => {});
  return run;
}

vi.mock('./db', () => ({
  getPool: () => ({ query: fakeQuery }),
  isDuplicateEntryError: () => false,
  withTransaction: (fn: (conn: unknown) => Promise<unknown>) => withFakeTransactionLock(() => fn({ query: fakeQuery })),
}));

vi.mock('./s3', () => ({
  deleteObjectsWithPrefix: (...args: unknown[]) => {
    callOrder.push('s3-delete');
    return deleteObjectsWithPrefix(...args);
  },
}));

const { deleteProjectRecord, setProjectImagePrimary, deleteProjectImage, reorderProjectImages, reorderProjectMetrics, updateProjectRecord } = await import(
  './projects'
);
const { HttpError } = await import('./http');
const { projectImagePrefix } = await import('./projectS3Keys');

function seedProject(overrides: Partial<FakeProjectRow> & { id: string }): FakeProjectRow {
  const row: FakeProjectRow = { slug: 'a-project', status: 'draft', ...overrides };
  projects.set(row.id, row);
  return row;
}
function seedImage(overrides: Partial<FakeImageRow> & { id: string; project_id: string }): FakeImageRow {
  const row: FakeImageRow = { s3_key: `projects/images/${overrides.project_id}/${overrides.id}.jpg`, position: 0, is_primary: 0, ...overrides };
  projectImages.set(row.id, row);
  return row;
}
function seedMetric(overrides: Partial<FakeMetricRow> & { id: string; project_id: string }): FakeMetricRow {
  const row: FakeMetricRow = { display_order: 0, ...overrides };
  projectMetrics.set(row.id, row);
  return row;
}

beforeEach(() => {
  projects = new Map();
  projectImages = new Map();
  projectMetrics = new Map();
  callOrder = [];
  deleteObjectsWithPrefix.mockReset();
  deleteObjectsWithPrefix.mockResolvedValue(0);
});

describe('deleteProjectRecord — S3-first ordering, mirrors deleteArticle', () => {
  it('deletes S3 objects under exactly this project\'s own prefix before the RDS row', async () => {
    seedProject({ id: 'p1' });
    await deleteProjectRecord('p1');
    expect(deleteObjectsWithPrefix).toHaveBeenCalledWith(projectImagePrefix('p1'));
    expect(callOrder).toEqual(['s3-delete', 'db-delete-project']);
    expect(projects.has('p1')).toBe(false);
  });

  it('does NOT delete the RDS row if S3 cleanup fails, and reports a safe 502', async () => {
    seedProject({ id: 'p1' });
    deleteObjectsWithPrefix.mockRejectedValue(new Error('S3 unavailable'));

    await expect(deleteProjectRecord('p1')).rejects.toMatchObject({ status: 502 });
    expect(projects.has('p1')).toBe(true);
    expect(callOrder).toEqual(['s3-delete']);
  });
});

describe('updateProjectRecord — publishing requires a slug', () => {
  it('rejects publishing a project with no slug', async () => {
    seedProject({ id: 'p1', slug: null, status: 'draft' });
    await expect(updateProjectRecord('p1', { status: 'published' })).rejects.toBeInstanceOf(HttpError);
  });

  it('allows publishing when the update itself sets a slug in the same call', async () => {
    seedProject({ id: 'p1', slug: null, status: 'draft' });
    await updateProjectRecord('p1', { slug: 'new-slug', status: 'published' });
    expect(projects.get('p1')?.status).toBe('published');
  });

  it('allows publishing when the project already has a slug', async () => {
    seedProject({ id: 'p1', slug: 'already-has-a-slug', status: 'draft' });
    await updateProjectRecord('p1', { status: 'published' });
    expect(projects.get('p1')?.status).toBe('published');
  });
});

describe('setProjectImagePrimary — the one-primary-image transactional invariant', () => {
  it('sets exactly the requested image as primary and unsets every other one', async () => {
    seedProject({ id: 'p1' });
    seedImage({ id: 'img-a', project_id: 'p1', is_primary: 1 });
    seedImage({ id: 'img-b', project_id: 'p1', is_primary: 0 });

    await setProjectImagePrimary('p1', 'img-b');

    expect(projectImages.get('img-a')?.is_primary).toBe(0);
    expect(projectImages.get('img-b')?.is_primary).toBe(1);
  });

  it('never leaves two images primary, even across repeated calls (sequential "concurrent" requests resolve deterministically to exactly one primary)', async () => {
    seedProject({ id: 'p1' });
    seedImage({ id: 'img-a', project_id: 'p1' });
    seedImage({ id: 'img-b', project_id: 'p1' });
    seedImage({ id: 'img-c', project_id: 'p1' });

    await Promise.all([setProjectImagePrimary('p1', 'img-a'), setProjectImagePrimary('p1', 'img-b'), setProjectImagePrimary('p1', 'img-c')]);

    const primaryCount = [...projectImages.values()].filter((img) => img.project_id === 'p1' && img.is_primary === 1).length;
    expect(primaryCount).toBe(1);
  });

  it('404s for an image that does not belong to this project', async () => {
    seedProject({ id: 'p1' });
    seedProject({ id: 'p2' });
    seedImage({ id: 'img-other', project_id: 'p2' });
    await expect(setProjectImagePrimary('p1', 'img-other')).rejects.toMatchObject({ status: 404 });
  });
});

describe('deleteProjectImage — primary-promotion behavior on delete (documented choice: promote the lowest-position remaining image)', () => {
  it('promotes the lowest-position remaining image to primary when the deleted image was primary', async () => {
    seedProject({ id: 'p1' });
    seedImage({ id: 'img-primary', project_id: 'p1', position: 0, is_primary: 1 });
    seedImage({ id: 'img-next', project_id: 'p1', position: 1, is_primary: 0 });
    seedImage({ id: 'img-last', project_id: 'p1', position: 2, is_primary: 0 });

    await deleteProjectImage('p1', 'img-primary');

    expect(projectImages.has('img-primary')).toBe(false);
    expect(projectImages.get('img-next')?.is_primary).toBe(1);
    expect(projectImages.get('img-last')?.is_primary).toBe(0);
  });

  it('leaves the project with no primary image when the deleted primary was the only image', async () => {
    seedProject({ id: 'p1' });
    seedImage({ id: 'img-only', project_id: 'p1', is_primary: 1 });

    await deleteProjectImage('p1', 'img-only');

    const remaining = [...projectImages.values()].filter((img) => img.project_id === 'p1');
    expect(remaining).toHaveLength(0);
  });

  it('does not touch is_primary on other images when deleting a NON-primary image', async () => {
    seedProject({ id: 'p1' });
    seedImage({ id: 'img-primary', project_id: 'p1', is_primary: 1 });
    seedImage({ id: 'img-other', project_id: 'p1', is_primary: 0 });

    await deleteProjectImage('p1', 'img-other');

    expect(projectImages.get('img-primary')?.is_primary).toBe(1);
  });

  it('deletes the S3 object before the DB row, and is retry-safe if S3 cleanup fails', async () => {
    seedProject({ id: 'p1' });
    seedImage({ id: 'img1', project_id: 'p1' });
    deleteObjectsWithPrefix.mockRejectedValue(new Error('S3 unavailable'));

    await expect(deleteProjectImage('p1', 'img1')).rejects.toMatchObject({ status: 502 });
    expect(projectImages.has('img1')).toBe(true); // untouched — safe to retry
  });
});

describe('reorderProjectImages — rejects a mismatched id set', () => {
  it('rejects a list that omits one of the project\'s current images', async () => {
    seedProject({ id: 'p1' });
    seedImage({ id: 'img-a', project_id: 'p1' });
    seedImage({ id: 'img-b', project_id: 'p1' });
    await expect(reorderProjectImages('p1', ['img-a'])).rejects.toBeInstanceOf(HttpError);
  });

  it('rejects a list containing an id from a different project', async () => {
    seedProject({ id: 'p1' });
    seedProject({ id: 'p2' });
    seedImage({ id: 'img-a', project_id: 'p1' });
    seedImage({ id: 'img-foreign', project_id: 'p2' });
    await expect(reorderProjectImages('p1', ['img-a', 'img-foreign'])).rejects.toBeInstanceOf(HttpError);
  });

  it('applies the exact requested order when the id set matches', async () => {
    seedProject({ id: 'p1' });
    seedImage({ id: 'img-a', project_id: 'p1', position: 0 });
    seedImage({ id: 'img-b', project_id: 'p1', position: 1 });
    await reorderProjectImages('p1', ['img-b', 'img-a']);
    expect(projectImages.get('img-b')?.position).toBe(0);
    expect(projectImages.get('img-a')?.position).toBe(1);
  });
});

describe('reorderProjectMetrics — same two-phase reorder as reorderProjectImages, applied to display_order', () => {
  it('applies the exact requested order and rejects a mismatched id set', async () => {
    seedProject({ id: 'p1' });
    seedMetric({ id: 'm-a', project_id: 'p1', display_order: 0 });
    seedMetric({ id: 'm-b', project_id: 'p1', display_order: 1 });

    await reorderProjectMetrics('p1', ['m-b', 'm-a']);
    expect(projectMetrics.get('m-b')?.display_order).toBe(0);
    expect(projectMetrics.get('m-a')?.display_order).toBe(1);

    await expect(reorderProjectMetrics('p1', ['m-a'])).rejects.toBeInstanceOf(HttpError);
  });
});
