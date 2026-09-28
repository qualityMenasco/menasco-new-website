/**
 * Real end-to-end smoke test of `aws/newsroom-lambda.ts`'s actual exported
 * `handler()` — not the adapter primitives in isolation (see
 * `aws-lambda-adapter-test.ts` for that), the real Lambda entrypoint,
 * calling real `api/newsroom/**` handlers, against real RDS + S3. Proves
 * the full chain (API Gateway event -> route match -> dynamic import of
 * the real handler module -> real business logic -> API Gateway response)
 * works end to end, not just that its individual pieces do in isolation.
 *
 * Run: npm run aws:lambda:real
 */
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../aws/newsroom-lambda';
import { getPool } from '../api/_lib/db';

function fakeEvent(opts: { method: string; path: string; headers?: Record<string, string>; body?: string }): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: `${opts.method} /api/newsroom/{proxy+}`,
    rawPath: `/api/newsroom${opts.path}`,
    rawQueryString: '',
    headers: opts.headers ?? {},
    requestContext: {
      http: { method: opts.method, path: `/api/newsroom${opts.path}`, protocol: 'HTTP/1.1', sourceIp: '127.0.0.1', userAgent: 'test' },
    } as APIGatewayProxyEventV2['requestContext'],
    body: opts.body,
    isBase64Encoded: false,
  } as APIGatewayProxyEventV2;
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

console.log('=== AWS Lambda real entrypoint smoke test (real RDS + S3, via aws/newsroom-lambda.ts) ===\n');

await check('GET /api/newsroom/public/articles through the real Lambda handler -> real RDS query, 200 + JSON array', async () => {
  const result = await handler(fakeEvent({ method: 'GET', path: '/public/articles' }));
  assert(result.statusCode === 200, `status ${result.statusCode}: ${result.body}`);
  const body = JSON.parse(result.body as string);
  assert(Array.isArray(body), `expected an array, got ${result.body}`);
});

await check('unauthenticated admin call through the real Lambda handler -> real requireNewsroomAuth -> 401', async () => {
  // .env.local sets NEWSROOM_DEV_AUTH_BYPASS=true for local dev convenience — temporarily off here so this specifically tests the real "no credentials" rejection path, not the dev bypass. Same pattern used throughout Phases 1-5's auth tests.
  const prevBypass = process.env.NEWSROOM_DEV_AUTH_BYPASS;
  delete process.env.NEWSROOM_DEV_AUTH_BYPASS;
  try {
    const result = await handler(fakeEvent({ method: 'POST', path: '/articles', headers: {} }));
    assert(result.statusCode === 401, `expected 401, got ${result.statusCode}: ${result.body}`);
  } finally {
    if (prevBypass !== undefined) process.env.NEWSROOM_DEV_AUTH_BYPASS = prevBypass;
  }
});

await check('authenticated admin call through the real Lambda handler creates a real draft in RDS, then cleans it up', async () => {
  const adminKey = process.env.NEWSROOM_ADMIN_API_KEY;
  if (!adminKey) throw new Error('NEWSROOM_ADMIN_API_KEY not set in this environment');
  const result = await handler(fakeEvent({ method: 'POST', path: '/articles', headers: { 'x-newsroom-admin-key': adminKey } }));
  assert(result.statusCode === 201, `expected 201, got ${result.statusCode}: ${result.body}`);
  const body = JSON.parse(result.body as string);
  assert(body.status === 'draft', `expected draft, got ${JSON.stringify(body)}`);

  // Confirm it's a real row, then clean it up.
  const [rows] = await getPool().query('SELECT id FROM news_articles WHERE id = :id', { id: body.id });
  assert((rows as unknown[]).length === 1, 'expected a real row in RDS');
  await getPool().query('DELETE FROM news_articles WHERE id = :id', { id: body.id });
});

await check('unknown route through the real Lambda handler -> 404', async () => {
  const result = await handler(fakeEvent({ method: 'GET', path: '/totally-unknown' }));
  assert(result.statusCode === 404, `expected 404, got ${result.statusCode}`);
});

await check('known path, wrong method, through the real Lambda handler -> 405', async () => {
  const result = await handler(fakeEvent({ method: 'DELETE', path: '/public/articles' }));
  assert(result.statusCode === 405, `expected 405, got ${result.statusCode}`);
});

await getPool().end();
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
