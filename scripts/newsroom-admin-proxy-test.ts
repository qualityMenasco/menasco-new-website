/**
 * Real test of the Phase 6B admin proxy (`api/newsroom-admin-proxy/*`),
 * calling the handler modules directly (same pattern used throughout this
 * project) against the REAL deployed Lambda admin API over HTTPS. Only
 * read-only admin calls are exercised (article list) — no article is
 * created, processed, or published by this script.
 *
 * Run: npx tsx --env-file=.env.local scripts/newsroom-admin-proxy-test.ts
 */
import { createHmac } from 'node:crypto';
import loginHandler from '../api/newsroom-admin-proxy/login';
import logoutHandler from '../api/newsroom-admin-proxy/logout';
import proxyHandler from '../api/newsroom-admin-proxy/[...path]';
import { ADMIN_SESSION_COOKIE_NAME } from '../api/_lib/adminProxySession';

/** Replicates adminProxySession.ts's exact token format (base64url payload + base64url HMAC-SHA256 signature) so this test can construct edge-case tokens (expired, wrong-secret) that the real `createSessionToken()` has no parameter for. */
function buildRawToken(secret: string, exp: number): string {
  const payloadB64 = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const signature = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

function mockReq({ method, query = {}, body = {}, headers = {}, cookies = {} }: { method: string; query?: Record<string, unknown>; body?: unknown; headers?: Record<string, string>; cookies?: Record<string, string> }) {
  return { method, query, body, headers, cookies };
}
function mockRes() {
  return {
    statusCode: 200,
    _json: undefined as unknown,
    _headers: {} as Record<string, string>,
    status(code: number) { this.statusCode = code; return this; },
    setHeader(name: string, value: string) { this._headers[name] = value; return this; },
    json(body: unknown) { this._json = body; return this; },
    send(body: unknown) { this._json = typeof body === 'string' ? JSON.parse(body) : body; return this; },
  };
}
async function call(handler: (req: unknown, res: unknown) => Promise<void>, opts: Parameters<typeof mockReq>[0]) {
  const req = mockReq(opts);
  const res = mockRes();
  await handler(req, res);
  return res;
}

/** Extracts the session token value out of a `Set-Cookie` header string, mimicking what a real browser would then send back on the next request. */
function extractCookieValue(setCookieHeader: string | undefined): string | undefined {
  if (!setCookieHeader) return undefined;
  const match = setCookieHeader.match(new RegExp(`${ADMIN_SESSION_COOKIE_NAME}=([^;]+)`));
  return match?.[1];
}

let pass = 0, fail = 0;
async function check(label: string, fn: () => Promise<void>) {
  process.stdout.write(`- ${label} ... `);
  try {
    await fn();
    console.log('OK');
    pass++;
  } catch (err) {
    console.log(`FAIL: ${(err as Error).message}`);
    fail++;
  }
}
function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

console.log('=== Newsroom admin proxy test (real login + real upstream Lambda call, read-only) ===\n');

await check('[failure] login with wrong password -> 401, no cookie issued', async () => {
  const res = await call(loginHandler as never, { method: 'POST', body: { password: 'definitely-wrong' } });
  assert(res.statusCode === 401, `expected 401, got ${res.statusCode}`);
  assert(!res._headers['Set-Cookie'], 'a cookie should never be issued on a failed login');
});

await check('[failure] proxy call with no session cookie -> 401', async () => {
  const res = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles'] } });
  assert(res.statusCode === 401, `expected 401, got ${res.statusCode}`);
});

await check('[failure] proxy call with a forged/garbage cookie -> 401', async () => {
  const res = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: 'forged.garbage' } });
  assert(res.statusCode === 401, `expected 401, got ${res.statusCode}`);
});

await check('[failure] expired cookie (valid signature, past exp) -> 401', async () => {
  const realSecret = process.env.NEWSROOM_ADMIN_SESSION_SECRET;
  if (!realSecret) throw new Error('NEWSROOM_ADMIN_SESSION_SECRET not set in this environment');
  const expiredToken = buildRawToken(realSecret, Date.now() - 1000);
  const res = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: expiredToken } });
  assert(res.statusCode === 401, `expected 401, got ${res.statusCode}`);
});

await check('[failure] cookie signed with the WRONG session secret -> 401', async () => {
  const wrongSecretToken = buildRawToken('a-completely-different-secret-value', Date.now() + 60_000);
  const res = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: wrongSecretToken } });
  assert(res.statusCode === 401, `expected 401, got ${res.statusCode}`);
});

await check('[failure] missing NEWSROOM_ADMIN_SESSION_SECRET fails closed on login', async () => {
  const prev = process.env.NEWSROOM_ADMIN_SESSION_SECRET;
  delete process.env.NEWSROOM_ADMIN_SESSION_SECRET;
  try {
    const password = process.env.NEWSROOM_ADMIN_PROXY_PASSWORD!;
    const res = await call(loginHandler as never, { method: 'POST', body: { password } });
    assert(res.statusCode === 401, `expected 401, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
    assert(!res._headers['Set-Cookie'], 'no cookie should be issued when session signing is unconfigured');
  } finally {
    if (prev !== undefined) process.env.NEWSROOM_ADMIN_SESSION_SECRET = prev;
  }
});

await check('[failure] missing NEWSROOM_ADMIN_SESSION_SECRET fails closed on the proxy itself', async () => {
  const prev = process.env.NEWSROOM_ADMIN_SESSION_SECRET;
  delete process.env.NEWSROOM_ADMIN_SESSION_SECRET;
  try {
    const res = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: 'irrelevant.value' } });
    assert(res.statusCode === 401, `expected 401, got ${res.statusCode}`);
  } finally {
    if (prev !== undefined) process.env.NEWSROOM_ADMIN_SESSION_SECRET = prev;
  }
});

let sessionToken: string | undefined;
await check('login with the real correct password -> 200, issues a session cookie', async () => {
  const password = process.env.NEWSROOM_ADMIN_PROXY_PASSWORD;
  if (!password) throw new Error('NEWSROOM_ADMIN_PROXY_PASSWORD not set in this environment');
  const res = await call(loginHandler as never, { method: 'POST', body: { password } });
  assert(res.statusCode === 200, `expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  sessionToken = extractCookieValue(res._headers['Set-Cookie']);
  assert(sessionToken, 'expected a session cookie to be issued');
  assert(res._headers['Set-Cookie']?.includes('HttpOnly'), 'session cookie must be HttpOnly');
});

await check('authenticated proxy call reaches the REAL deployed Lambda admin API (real HTTPS call, read-only)', async () => {
  const res = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: sessionToken! } });
  assert(res.statusCode === 200, `expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  assert(Array.isArray(res._json), `expected an array response from the real admin list endpoint, got ${JSON.stringify(res._json)}`);
});

await check('[failure] missing NEWSROOM_ADMIN_API_KEY fails closed even with a valid session cookie', async () => {
  const prev = process.env.NEWSROOM_ADMIN_API_KEY;
  delete process.env.NEWSROOM_ADMIN_API_KEY;
  try {
    const res = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: sessionToken! } });
    assert(res.statusCode === 401, `expected 401, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  } finally {
    if (prev !== undefined) process.env.NEWSROOM_ADMIN_API_KEY = prev;
  }
});

await check('the response never contains the real NEWSROOM_ADMIN_API_KEY value', async () => {
  const adminKey = process.env.NEWSROOM_ADMIN_API_KEY;
  const res = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: sessionToken! } });
  const json = JSON.stringify(res._json);
  assert(!adminKey || !json.includes(adminKey), 'the real admin key leaked into the proxy response');
});

await check('logout clears the cookie (expired Set-Cookie, Max-Age=0)', async () => {
  const res = await call(logoutHandler as never, { method: 'POST' });
  assert(res.statusCode === 200, `expected 200, got ${res.statusCode}`);
  assert(res._headers['Set-Cookie']?.includes('Max-Age=0'), 'expected an expiring Set-Cookie on logout');
});

await check('[failure] path traversal segments (".." / ".") are rejected before ever being forwarded', async () => {
  const res1 = await call(proxyHandler as never, { method: 'GET', query: { path: ['..', 'admin'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: sessionToken! } });
  assert(res1.statusCode === 400, `expected 400 for ".." segment, got ${res1.statusCode}: ${JSON.stringify(res1._json)}`);
  const res2 = await call(proxyHandler as never, { method: 'GET', query: { path: ['articles', '.'] }, cookies: { [ADMIN_SESSION_COOKIE_NAME]: sessionToken! } });
  assert(res2.statusCode === 400, `expected 400 for "." segment, got ${res2.statusCode}: ${JSON.stringify(res2._json)}`);
});

await check('[failure] a nonexistent-article GET through the proxy still returns a clean 404, not raw upstream details', async () => {
  const res = await call(proxyHandler as never, {
    method: 'GET',
    query: { path: ['articles', '00000000-0000-4000-8000-000000000000'] },
    cookies: { [ADMIN_SESSION_COOKIE_NAME]: sessionToken! },
  });
  assert(res.statusCode === 404, `expected 404, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
