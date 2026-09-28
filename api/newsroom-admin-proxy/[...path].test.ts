import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionToken, ADMIN_SESSION_COOKIE_NAME } from '../_lib/adminProxySession';

/**
 * Regression coverage for the Production "Method DELETE not allowed" bug.
 * Traced the complete path (frontend -> this proxy -> API Gateway -> Lambda
 * router -> deleteArticle): this proxy's own `requireMethod` allow-list is
 * the ONE place in the whole chain that could reject a method before ever
 * forwarding it — these tests pin that DELETE passes cleanly through here,
 * with auth still enforced and the method/id/auth-key correctly forwarded,
 * so a future regression at this specific layer is caught immediately.
 * (The actual root cause was the separately-deployed Lambda still running
 * a build from before its own DELETE route existed — see aws/router.test.ts
 * and this task's report for the full trace.)
 */

const { default: handler } = await import('./[...path]');

const SESSION_SECRET = 'test-session-secret';
const ADMIN_KEY = 'test-admin-key';
const TARGET_BASE_URL = 'https://api.example.com';

function makeReqRes(overrides: { method?: string; path?: string[]; withValidSession?: boolean } = {}) {
  const cookies: Record<string, string> = {};
  if (overrides.withValidSession ?? true) {
    cookies[ADMIN_SESSION_COOKIE_NAME] = createSessionToken(SESSION_SECRET);
  }

  const req = {
    method: overrides.method ?? 'DELETE',
    query: { path: overrides.path ?? ['articles', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'] },
    cookies,
    body: undefined,
  } as unknown as VercelRequest;

  const res: {
    status: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    _status?: number;
  } = {
    status: vi.fn(),
    setHeader: vi.fn(),
    send: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockImplementation((code: number) => {
    res._status = code;
    return res;
  });
  res.setHeader.mockImplementation(() => res);
  res.send.mockImplementation(() => res);
  res.json.mockImplementation(() => res);

  return { req, res: res as unknown as VercelResponse & { _status?: number } };
}

beforeEach(() => {
  process.env.NEWSROOM_ADMIN_SESSION_SECRET = SESSION_SECRET;
  process.env.NEWSROOM_ADMIN_API_KEY = ADMIN_KEY;
  process.env.NEWSROOM_PUBLIC_API_BASE_URL = TARGET_BASE_URL;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify({ deleted: true, id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.NEWSROOM_ADMIN_SESSION_SECRET;
  delete process.env.NEWSROOM_ADMIN_API_KEY;
  delete process.env.NEWSROOM_PUBLIC_API_BASE_URL;
});

describe('Admin proxy — DELETE method acceptance', () => {
  it('forwards a DELETE request through to the Lambda with the DELETE method preserved', async () => {
    const { req, res } = makeReqRes({ method: 'DELETE', path: ['articles', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'] });

    await handler(req, res);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe('DELETE');
    expect(String(url)).toBe(`${TARGET_BASE_URL}/api/newsroom/articles/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('attaches the real admin API key header to the forwarded DELETE request', async () => {
    const { req, res } = makeReqRes({ method: 'DELETE' });
    await handler(req, res);

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers['x-newsroom-admin-key']).toBe(ADMIN_KEY);
  });

  it('forwards the exact article id segment from the request path', async () => {
    const { req, res } = makeReqRes({ method: 'DELETE', path: ['articles', 'some-other-id'] });
    await handler(req, res);

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(`${TARGET_BASE_URL}/api/newsroom/articles/some-other-id`);
  });

  it('rejects DELETE with 401 and never forwards it when there is no valid session', async () => {
    const { req, res } = makeReqRes({ method: 'DELETE', withValidSession: false });
    await handler(req, res);

    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('DELETE is in the same allowed-method set as GET/POST/PATCH, not rejected by this proxy itself', async () => {
    for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
      const { req, res } = makeReqRes({ method });
      await handler(req, res);
      expect(res.status).not.toHaveBeenCalledWith(405);
    }
  });
});
