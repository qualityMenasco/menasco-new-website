import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionToken, PROJECTS_ADMIN_SESSION_COOKIE_NAME } from '../_lib/projectsAdminProxySession';

/**
 * Regression coverage for the Phase 4 live-acceptance bug: Vercel's
 * `[...path]` catch-all (in this same directory) requires at least one
 * real path segment and is never invoked for a request to the bare proxy
 * root — so list/create (aws/projects-router.ts's own `pattern: '/'`
 * route) needs this separate index.ts to be reachable at all. These tests
 * pin that it forwards to the Lambda's own root path, not some other
 * accidental shape.
 */

const { default: handler } = await import('./index');

const SESSION_SECRET = 'test-projects-session-secret';
const ADMIN_KEY = 'test-projects-admin-key';
const TARGET_BASE_URL = 'https://projects-api.example.com';

function makeReqRes(overrides: { method?: string; withValidSession?: boolean } = {}) {
  const cookies: Record<string, string> = {};
  if (overrides.withValidSession ?? true) {
    cookies[PROJECTS_ADMIN_SESSION_COOKIE_NAME] = createSessionToken(SESSION_SECRET);
  }
  const req = { method: overrides.method ?? 'GET', query: {}, cookies, body: undefined } as unknown as VercelRequest;

  const res: { status: ReturnType<typeof vi.fn>; setHeader: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } = {
    status: vi.fn(),
    setHeader: vi.fn(),
    send: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockImplementation((code: number) => { (res as { _status?: number })._status = code; return res; });
  res.setHeader.mockImplementation(() => res);
  res.send.mockImplementation(() => res);
  res.json.mockImplementation(() => res);

  return { req, res: res as unknown as VercelResponse };
}

beforeEach(() => {
  process.env.PROJECTS_ADMIN_SESSION_SECRET = SESSION_SECRET;
  process.env.PROJECTS_ADMIN_API_KEY = ADMIN_KEY;
  process.env.PROJECTS_PUBLIC_API_BASE_URL = TARGET_BASE_URL;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, headers: new Headers({ 'Content-Type': 'application/json' }), text: async () => JSON.stringify([]) }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.PROJECTS_ADMIN_SESSION_SECRET;
  delete process.env.PROJECTS_ADMIN_API_KEY;
  delete process.env.PROJECTS_PUBLIC_API_BASE_URL;
});

describe('Projects admin proxy — bare root (list/create)', () => {
  it('GET / forwards to the Lambda root path (list), never a malformed URL', async () => {
    const { req, res } = makeReqRes({ method: 'GET' });
    await handler(req, res);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(`${TARGET_BASE_URL}/api/projects/`);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('POST / (create) is forwarded, not rejected as a bad path', async () => {
    const { req, res } = makeReqRes({ method: 'POST' });
    await handler(req, res);
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe('POST');
  });

  it('rejects an unauthenticated request before ever calling fetch', async () => {
    const { req, res } = makeReqRes({ withValidSession: false });
    await handler(req, res);
    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects PATCH/DELETE at the root (the Lambda root route is GET/POST only)', async () => {
    const { req, res } = makeReqRes({ method: 'DELETE' });
    await handler(req, res);
    expect(fetch).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
