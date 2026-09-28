import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const deleteArticle = vi.fn();
const getArticleOrThrow = vi.fn();
const getArticleImages = vi.fn();
const serializeArticle = vi.fn();
const updateArticleMetadata = vi.fn();
const validateScheduleUpdate = vi.fn();

vi.mock('../../../_lib/articles', () => ({
  deleteArticle: (...args: unknown[]) => deleteArticle(...args),
  getArticleOrThrow: (...args: unknown[]) => getArticleOrThrow(...args),
  getArticleImages: (...args: unknown[]) => getArticleImages(...args),
  serializeArticle: (...args: unknown[]) => serializeArticle(...args),
  updateArticleMetadata: (...args: unknown[]) => updateArticleMetadata(...args),
  validateScheduleUpdate: (...args: unknown[]) => validateScheduleUpdate(...args),
}));

vi.mock('../../../_lib/newsroom/structuredContent', () => ({
  validateStructuredContent: vi.fn(),
}));

const { default: handler } = await import('./index');
const { HttpError } = await import('../../../_lib/http');

const VALID_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function makeReqRes(overrides: { query?: Record<string, string>; headers?: Record<string, string> } = {}) {
  const req = {
    method: 'DELETE',
    query: overrides.query ?? { id: VALID_ID },
    headers: overrides.headers ?? {},
    body: undefined,
    cookies: {},
  } as unknown as VercelRequest;

  const res: { status: ReturnType<typeof vi.fn>; setHeader: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } = {
    status: vi.fn(),
    setHeader: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockImplementation(() => res);
  res.setHeader.mockImplementation(() => res);
  res.json.mockImplementation(() => res);

  return { req, res: res as unknown as VercelResponse };
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.NEWSROOM_ADMIN_API_KEY;
  delete process.env.NEWSROOM_DEV_AUTH_BYPASS;
});

describe('DELETE /api/newsroom/articles/:id — authorization (real requireNewsroomAuth, not mocked)', () => {
  it('rejects with 401 when no admin key is configured in this environment', async () => {
    const { req, res } = makeReqRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(deleteArticle).not.toHaveBeenCalled();
  });

  it('rejects with 401 when the wrong key is provided', async () => {
    process.env.NEWSROOM_ADMIN_API_KEY = 'correct-key';
    const { req, res } = makeReqRes({ headers: { 'x-newsroom-admin-key': 'wrong-key' } });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(deleteArticle).not.toHaveBeenCalled();
  });

  it('proceeds and calls deleteArticle when the correct key is provided', async () => {
    process.env.NEWSROOM_ADMIN_API_KEY = 'correct-key';
    deleteArticle.mockResolvedValue(undefined);
    const { req, res } = makeReqRes({ headers: { 'x-newsroom-admin-key': 'correct-key' } });
    await handler(req, res);
    expect(deleteArticle).toHaveBeenCalledWith(VALID_ID);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ deleted: true, id: VALID_ID });
  });
});

describe('DELETE /api/newsroom/articles/:id — validation', () => {
  it('rejects an invalid article id before ever calling deleteArticle', async () => {
    process.env.NEWSROOM_ADMIN_API_KEY = 'correct-key';
    const { req, res } = makeReqRes({ query: { id: 'not-a-uuid' }, headers: { 'x-newsroom-admin-key': 'correct-key' } });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(deleteArticle).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/newsroom/articles/:id — error passthrough', () => {
  it('surfaces a deleteArticle failure (e.g. S3 cleanup failure) as a safe, clear error response', async () => {
    process.env.NEWSROOM_ADMIN_API_KEY = 'correct-key';
    deleteArticle.mockRejectedValue(new HttpError(502, "Failed to delete this article's stored files"));
    const { req, res } = makeReqRes({ headers: { 'x-newsroom-admin-key': 'correct-key' } });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to delete this article's stored files" });
  });

  it('surfaces a 404 for a nonexistent article', async () => {
    process.env.NEWSROOM_ADMIN_API_KEY = 'correct-key';
    deleteArticle.mockRejectedValue(new HttpError(404, 'Article not found'));
    const { req, res } = makeReqRes({ headers: { 'x-newsroom-admin-key': 'correct-key' } });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
