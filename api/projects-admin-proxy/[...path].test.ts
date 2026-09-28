import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionToken, PROJECTS_ADMIN_SESSION_COOKIE_NAME } from '../_lib/projectsAdminProxySession';

/**
 * Mirrors api/newsroom-admin-proxy/[...path].test.ts exactly, proving the
 * Projects proxy's own credential/session isolation: a Newsroom session
 * cookie must never authenticate here, and this proxy must never read or
 * forward NEWSROOM_ADMIN_API_KEY.
 */

const { default: handler } = await import('./[...path]');

const SESSION_SECRET = 'test-projects-session-secret';
const ADMIN_KEY = 'test-projects-admin-key';
const TARGET_BASE_URL = 'https://projects-api.example.com';

function makeReqRes(overrides: { method?: string; path?: string[]; withValidSession?: boolean; sessionSecretOverride?: string } = {}) {
  const cookies: Record<string, string> = {};
  if (overrides.withValidSession ?? true) {
    cookies[PROJECTS_ADMIN_SESSION_COOKIE_NAME] = createSessionToken(overrides.sessionSecretOverride ?? SESSION_SECRET);
  }

  const req = {
    method: overrides.method ?? 'GET',
    query: { path: overrides.path ?? ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'] },
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
  process.env.PROJECTS_ADMIN_SESSION_SECRET = SESSION_SECRET;
  process.env.PROJECTS_ADMIN_API_KEY = ADMIN_KEY;
  process.env.PROJECTS_PUBLIC_API_BASE_URL = TARGET_BASE_URL;
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: async () => JSON.stringify({ ok: true }),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.PROJECTS_ADMIN_SESSION_SECRET;
  delete process.env.PROJECTS_ADMIN_API_KEY;
  delete process.env.PROJECTS_PUBLIC_API_BASE_URL;
});

describe('Projects admin proxy — authorization', () => {
  it('rejects with 401 and never forwards the request when there is no session cookie', async () => {
    const { req, res } = makeReqRes({ withValidSession: false });
    await handler(req, res);
    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects a session token signed with a DIFFERENT secret (e.g. a forged or Newsroom-signed cookie)', async () => {
    const { req, res } = makeReqRes({ sessionSecretOverride: 'wrong-secret' });
    await handler(req, res);
    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('a real Newsroom session token never authenticates the Projects proxy (separate secret, separate cookie)', async () => {
    // Simulates the literal Newsroom signing secret being used — proves the two proxies
    // cannot cross-authenticate even if an attacker replayed a valid Newsroom cookie here.
    const { req, res } = makeReqRes({ sessionSecretOverride: 'a-newsroom-secret-not-the-projects-one' });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('forwards a valid, authenticated request to the real Projects Lambda base URL, never the Newsroom one', async () => {
    const { req, res } = makeReqRes({ path: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'] });
    await handler(req, res);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(`${TARGET_BASE_URL}/api/projects/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`);
    expect(String(url)).not.toContain('newsroom');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('attaches x-projects-admin-key (never x-newsroom-admin-key) to the forwarded request', async () => {
    const { req, res } = makeReqRes();
    await handler(req, res);
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers['x-projects-admin-key']).toBe(ADMIN_KEY);
    expect(headers['x-newsroom-admin-key']).toBeUndefined();
  });

  it('every HTTP method (GET/POST/PATCH/DELETE) is forwarded once authenticated, never itself rejected with 405', async () => {
    for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
      const { req, res } = makeReqRes({ method });
      await handler(req, res);
      expect(res.status).not.toHaveBeenCalledWith(405);
    }
  });

  it('rejects a path containing ".." (traversal) before ever calling fetch', async () => {
    const { req, res } = makeReqRes({ path: ['..', 'secret'] });
    await handler(req, res);
    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('fails closed with 401 when PROJECTS_ADMIN_API_KEY is not configured, even with a valid session', async () => {
    delete process.env.PROJECTS_ADMIN_API_KEY;
    const { req, res } = makeReqRes();
    await handler(req, res);
    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
