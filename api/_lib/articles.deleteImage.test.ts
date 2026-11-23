import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Same in-memory fake-DB approach as articles.delete.test.ts — no real
 * MySQL available in this environment, so this simulates exactly the
 * SELECT/DELETE/UPDATE statements deleteArticleImage issues, plus a mocked
 * S3 layer, to verify the ordering/safety contract (S3 object delete before
 * the DB row delete, the row left untouched if S3 delete fails) and the
 * position-compaction behavior at the application level. Not a substitute
 * for a real RDS+S3 integration run before Production rollout.
 */
interface FakeImageRow {
  id: string;
  article_id: string;
  s3_key: string;
  position: number;
}

let images: FakeImageRow[];
let callOrder: string[];

function fakeQuery(sql: string, params?: Record<string, unknown>) {
  const imageId = params?.imageId as string | undefined;
  const articleId = params?.articleId as string | undefined;

  if (sql.includes('SELECT id FROM news_article_images WHERE article_id') && sql.includes('FOR UPDATE')) {
    return Promise.resolve([images.filter((img) => img.article_id === articleId).map((img) => ({ id: img.id }))]);
  }

  if (sql.includes('SELECT * FROM news_article_images WHERE id')) {
    const row = images.find((img) => img.id === imageId && img.article_id === articleId);
    return Promise.resolve([row ? [{ ...row }] : []]);
  }

  if (sql.includes('DELETE FROM news_article_images WHERE id')) {
    callOrder.push('db-delete');
    const existed = images.some((img) => img.id === imageId && img.article_id === articleId);
    images = images.filter((img) => !(img.id === imageId && img.article_id === articleId));
    return Promise.resolve([{ affectedRows: existed ? 1 : 0 }]);
  }

  if (sql.includes("SET \`position\` = \`position\` - 1")) {
    const deletedPosition = params?.deletedPosition as number;
    images = images.map((img) =>
      img.article_id === articleId && img.position > deletedPosition ? { ...img, position: img.position - 1 } : img,
    );
    return Promise.resolve([{ affectedRows: images.length }]);
  }

  throw new Error(`fakeQuery: unrecognized SQL: ${sql}`);
}

const deleteObject = vi.fn();

vi.mock('./db', () => ({
  getPool: () => ({ query: fakeQuery }),
  isDuplicateEntryError: () => false,
  withTransaction: async (fn: (conn: { query: typeof fakeQuery }) => Promise<unknown>) => fn({ query: fakeQuery }),
}));

vi.mock('./s3', () => ({
  deleteObject: (...args: unknown[]) => {
    callOrder.push('s3-delete');
    return deleteObject(...args);
  },
}));

const { deleteArticleImage } = await import('./articles');
const { HttpError } = await import('./http');

function seed(overrides: Partial<FakeImageRow> & { id: string }): FakeImageRow {
  const row: FakeImageRow = { article_id: 'a1', s3_key: `newsroom/articles/a1/${overrides.id}.jpg`, position: 0, ...overrides };
  images.push(row);
  return row;
}

beforeEach(() => {
  images = [];
  callOrder = [];
  deleteObject.mockReset();
  deleteObject.mockResolvedValue(undefined);
});

describe('deleteArticleImage — ordering', () => {
  it('deletes the S3 object BEFORE deleting the DB row', async () => {
    seed({ id: 'img1', position: 0 });
    await deleteArticleImage('a1', 'img1');
    expect(callOrder).toEqual(['s3-delete', 'db-delete']);
  });

  it('targets exactly this image\'s own stored S3 key', async () => {
    const row = seed({ id: 'img1', position: 0 });
    await deleteArticleImage('a1', 'img1');
    expect(deleteObject).toHaveBeenCalledWith(row.s3_key);
    expect(deleteObject).toHaveBeenCalledTimes(1);
  });
});

describe('deleteArticleImage — S3 failure safety', () => {
  it('does NOT delete the DB row if S3 delete fails', async () => {
    seed({ id: 'img1', position: 0 });
    deleteObject.mockRejectedValue(new Error('S3 unavailable'));

    await expect(deleteArticleImage('a1', 'img1')).rejects.toThrow();
    expect(images.some((img) => img.id === 'img1')).toBe(true);
    expect(callOrder).toEqual(['s3-delete']); // db-delete never ran
  });

  it('reports a clear, safe error (502) rather than pretending deletion succeeded', async () => {
    seed({ id: 'img1', position: 0 });
    deleteObject.mockRejectedValue(new Error('S3 unavailable'));

    try {
      await deleteArticleImage('a1', 'img1');
      expect.unreachable('deleteArticleImage should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpError);
      expect((err as InstanceType<typeof HttpError>).status).toBe(502);
      expect((err as Error).message).toMatch(/not be deleted|safe to try again/i);
    }
  });
});

describe('deleteArticleImage — position compaction', () => {
  it('decrements the position of every image after the deleted one, leaving earlier ones untouched', async () => {
    seed({ id: 'img0', position: 0 });
    seed({ id: 'img1', position: 1 });
    seed({ id: 'img2', position: 2 });
    seed({ id: 'img3', position: 3 });

    await deleteArticleImage('a1', 'img1');

    const byId = Object.fromEntries(images.map((img) => [img.id, img.position]));
    expect(byId).toEqual({ img0: 0, img2: 1, img3: 2 });
  });

  it('deleting the last image touches no other position', async () => {
    seed({ id: 'img0', position: 0 });
    seed({ id: 'img1', position: 1 });

    await deleteArticleImage('a1', 'img1');

    expect(images).toEqual([{ id: 'img0', article_id: 'a1', s3_key: 'newsroom/articles/a1/img0.jpg', position: 0 }]);
  });
});

describe('deleteArticleImage — scoping and not-found', () => {
  it('throws a 404 for an image id that does not belong to this article, and never calls S3', async () => {
    seed({ id: 'img1', article_id: 'other-article', position: 0 });

    await expect(deleteArticleImage('a1', 'img1')).rejects.toMatchObject({ status: 404 });
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it('throws a 404 for a nonexistent image id', async () => {
    await expect(deleteArticleImage('a1', 'missing')).rejects.toMatchObject({ status: 404 });
    expect(deleteObject).not.toHaveBeenCalled();
  });
});
