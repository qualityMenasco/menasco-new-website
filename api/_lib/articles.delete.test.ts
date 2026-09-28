import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Same in-memory fake-DB approach as articles.lifecycle.test.ts — no real
 * MySQL available in this environment, so this simulates exactly the
 * DELETE/SELECT statements deleteArticle issues, plus a mocked S3 layer,
 * to verify the ordering/safety contract (S3 cleanup before the DB row
 * delete, and the DB row is left untouched if S3 cleanup fails) at the
 * application level. Not a substitute for a real RDS+S3 integration run
 * before Production rollout.
 */
interface FakeRow {
  id: string;
  status: string;
  title: string | null;
}

let store: Map<string, FakeRow>;
let callOrder: string[];

function fakeQuery(sql: string, params?: Record<string, unknown>) {
  const id = params?.id as string | undefined;

  if (sql.includes('SELECT * FROM news_articles WHERE id')) {
    const row = id ? store.get(id) : undefined;
    return Promise.resolve([row ? [{ ...row }] : []]);
  }

  if (sql.includes('DELETE FROM news_articles WHERE id')) {
    callOrder.push('db-delete');
    const existed = id ? store.has(id) : false;
    if (id) store.delete(id);
    return Promise.resolve([{ affectedRows: existed ? 1 : 0 }]);
  }

  throw new Error(`fakeQuery: unrecognized SQL: ${sql}`);
}

const deleteObjectsWithPrefix = vi.fn();

vi.mock('./db', () => ({
  getPool: () => ({ query: fakeQuery }),
  isDuplicateEntryError: () => false,
  withTransaction: async (fn: (conn: unknown) => Promise<unknown>) => fn({}),
}));

vi.mock('./s3', () => ({
  deleteObjectsWithPrefix: (...args: unknown[]) => {
    callOrder.push('s3-delete');
    return deleteObjectsWithPrefix(...args);
  },
}));

const { deleteArticle } = await import('./articles');
const { HttpError } = await import('./http');
const { articlePrefix } = await import('./s3Keys');

function seed(id: string, overrides: Partial<FakeRow> = {}): FakeRow {
  const row: FakeRow = { id, status: 'draft', title: 'Test Article', ...overrides };
  store.set(id, row);
  return row;
}

beforeEach(() => {
  store = new Map();
  callOrder = [];
  deleteObjectsWithPrefix.mockReset();
  deleteObjectsWithPrefix.mockResolvedValue(0);
});

describe('deleteArticle — allowed at every status', () => {
  it.each(['draft', 'processing', 'ready', 'published', 'failed'])('deletes a "%s" article', async (status) => {
    seed('a1', { status });
    await deleteArticle('a1');
    expect(store.has('a1')).toBe(false);
  });
});

describe('deleteArticle — S3 cleanup scope', () => {
  it("targets exactly this article's own S3 prefix, nothing else", async () => {
    seed('a1');
    await deleteArticle('a1');
    expect(deleteObjectsWithPrefix).toHaveBeenCalledWith(articlePrefix('a1'));
    expect(deleteObjectsWithPrefix).toHaveBeenCalledTimes(1);
  });

  it('never reuses another article\'s prefix', async () => {
    seed('a1');
    seed('a2');
    await deleteArticle('a1');
    expect(deleteObjectsWithPrefix).not.toHaveBeenCalledWith(articlePrefix('a2'));
    expect(store.has('a2')).toBe(true);
  });
});

describe('deleteArticle — ordering', () => {
  it('deletes S3 objects BEFORE deleting the RDS row', async () => {
    seed('a1');
    await deleteArticle('a1');
    expect(callOrder).toEqual(['s3-delete', 'db-delete']);
  });
});

describe('deleteArticle — S3 failure safety', () => {
  it('does NOT delete the RDS row if S3 cleanup fails', async () => {
    seed('a1');
    deleteObjectsWithPrefix.mockRejectedValue(new Error('S3 unavailable'));

    await expect(deleteArticle('a1')).rejects.toThrow();
    expect(store.has('a1')).toBe(true);
    expect(callOrder).toEqual(['s3-delete']); // db-delete never ran
  });

  it('reports a clear, safe error (502) rather than pretending deletion succeeded', async () => {
    seed('a1');
    deleteObjectsWithPrefix.mockRejectedValue(new Error('S3 unavailable'));

    try {
      await deleteArticle('a1');
      expect.unreachable('deleteArticle should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as InstanceType<typeof HttpError>).status).toBe(502);
      expect((err as Error).message).toMatch(/not be deleted|safe to try again/i);
    }
  });

  it('a retried delete after a fixed S3 failure succeeds (idempotent retry)', async () => {
    seed('a1');
    deleteObjectsWithPrefix.mockRejectedValueOnce(new Error('S3 unavailable'));
    await expect(deleteArticle('a1')).rejects.toThrow();
    expect(store.has('a1')).toBe(true);

    deleteObjectsWithPrefix.mockResolvedValueOnce(0);
    await deleteArticle('a1');
    expect(store.has('a1')).toBe(false);
  });
});

describe('deleteArticle — not found', () => {
  it('throws a 404 for a nonexistent article and never calls S3', async () => {
    await expect(deleteArticle('missing')).rejects.toMatchObject({ status: 404 });
    expect(deleteObjectsWithPrefix).not.toHaveBeenCalled();
  });
});
