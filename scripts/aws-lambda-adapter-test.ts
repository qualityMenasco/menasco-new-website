/**
 * Offline tests for the AWS Lambda adapter (`aws/adapter.ts`, `aws/router.ts`)
 * — no AWS, RDS, or S3 required. Business logic itself (article CRUD,
 * publishing, PDF processing, public API field-scoping, etc.) is already
 * proven 113 times over against real infrastructure in Phases 1-5; these
 * tests instead prove the ADAPTER's transport-layer translation is
 * correct in isolation, using small synthetic handlers that mimic the
 * real `(req, res)` contract without touching `api/_lib/db.ts`/`s3.ts` at
 * all — so this suite runs anywhere, instantly, with zero credentials.
 *
 * Run: npx tsx scripts/aws-lambda-adapter-test.ts
 */
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { invokeHandler } from '../aws/adapter';
import { matchRoute, pathHasAnyMethod, routes } from '../aws/router';

let pass = 0, fail = 0;
function check(label: string, fn: () => void) {
  process.stdout.write(`- ${label} ... `);
  try {
    fn();
    console.log('OK');
    pass++;
  } catch (err) {
    console.log(`FAIL: ${(err as Error).message}`);
    fail++;
  }
}
async function checkAsync(label: string, fn: () => Promise<void>) {
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

function fakeEvent(opts: {
  method: string;
  path: string;
  query?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
}): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: `${opts.method} /api/newsroom/{proxy+}`,
    rawPath: opts.path,
    rawQueryString: '',
    headers: opts.headers ?? {},
    queryStringParameters: opts.query,
    requestContext: {
      http: { method: opts.method, path: opts.path, protocol: 'HTTP/1.1', sourceIp: '127.0.0.1', userAgent: 'test' },
    } as APIGatewayProxyEventV2['requestContext'],
    body: opts.body,
    isBase64Encoded: opts.isBase64Encoded ?? false,
  } as APIGatewayProxyEventV2;
}

console.log('=== AWS Lambda adapter offline tests (no AWS/RDS/S3 required) ===\n');

// --- Router: pure path-matching logic ---
console.log('router (pure, no I/O):');
check('matches a static public route', () => {
  const m = matchRoute('GET', '/public/articles');
  assert(m?.route.pattern === '/public/articles', `got ${JSON.stringify(m)}`);
});
check('matches a dynamic :slug route and captures the param', () => {
  const m = matchRoute('GET', '/public/articles/my-article-slug');
  assert(m?.params.slug === 'my-article-slug', `got ${JSON.stringify(m)}`);
});
check('matches a dynamic :imageId route', () => {
  const m = matchRoute('GET', '/public/images/abc-123');
  assert(m?.params.imageId === 'abc-123', `got ${JSON.stringify(m)}`);
});
check('nested route /articles/:id/images/:imageId/preview-url is checked before the bare :imageId route', () => {
  const m = matchRoute('GET', '/articles/A1/images/IMG1/preview-url');
  assert(m?.route.pattern === '/articles/:id/images/:imageId/preview-url', `got ${JSON.stringify(m?.route.pattern)}`);
  assert(m?.params.id === 'A1' && m?.params.imageId === 'IMG1', `params wrong: ${JSON.stringify(m?.params)}`);
});
check('literal /articles/:id/images/reorder is not swallowed by the /articles/:id/images/:imageId pattern', () => {
  const m = matchRoute('POST', '/articles/A1/images/reorder');
  assert(m?.route.pattern === '/articles/:id/images/reorder', `expected the reorder route, got ${JSON.stringify(m?.route.pattern)} (imageId would have wrongly captured "reorder")`);
});
check('literal /articles/:id/uploads/complete is not swallowed by /articles/:id/uploads', () => {
  const m = matchRoute('POST', '/articles/A1/uploads/complete');
  assert(m?.route.pattern === '/articles/:id/uploads/complete', `got ${JSON.stringify(m?.route.pattern)}`);
});
check('unknown path -> no match (404 territory)', () => {
  assert(matchRoute('GET', '/totally/unknown/path') === null, 'expected no match');
});
check('known path, wrong method -> no match on matchRoute, but pathHasAnyMethod is true (405 territory)', () => {
  assert(matchRoute('DELETE', '/public/articles') === null, 'expected no match for DELETE');
  assert(pathHasAnyMethod('/public/articles') === true, 'expected pathHasAnyMethod true for a real path with a different method');
});
check('every route pattern in the table is reachable (no duplicate method+pattern pairs)', () => {
  const seen = new Set<string>();
  for (const r of routes) {
    const key = `${r.method} ${r.pattern}`;
    assert(!seen.has(key), `duplicate route: ${key}`);
    seen.add(key);
  }
});

// --- Adapter: request/response translation, using synthetic handlers ---
console.log('\nadapter (invokeHandler, synthetic handlers):');

await checkAsync('JSON success response round-trips correctly (GET public list style)', async () => {
  const handler = async (_req: VercelRequest, res: VercelResponse) => {
    (res as unknown as { status: (c: number) => typeof res }).status(200);
    (res as unknown as { setHeader: (n: string, v: string) => void }).setHeader('Cache-Control', 'public, s-maxage=300');
    (res as unknown as { json: (b: unknown) => void }).json([{ slug: 'a' }, { slug: 'b' }]);
  };
  const result = await invokeHandler(handler, fakeEvent({ method: 'GET', path: '/public/articles' }), '/public/articles', {});
  assert(result.statusCode === 200, `status ${result.statusCode}`);
  assert(result.isBase64Encoded === false, 'expected non-base64 JSON response');
  assert(result.headers?.['Cache-Control'] === 'public, s-maxage=300', 'header not propagated');
  assert(JSON.parse(result.body as string).length === 2, 'body not round-tripped correctly');
});

await checkAsync('path params (:slug) reach the handler via req.query, exactly like Vercel dynamic routes', async () => {
  let captured: unknown;
  const handler = async (req: VercelRequest, res: VercelResponse) => {
    captured = (req.query as Record<string, string>).slug;
    (res as unknown as { status: (c: number) => typeof res }).status(200);
    (res as unknown as { json: (b: unknown) => void }).json({ ok: true });
  };
  await invokeHandler(handler, fakeEvent({ method: 'GET', path: '/public/articles/my-slug' }), '/public/articles/my-slug', { slug: 'my-slug' });
  assert(captured === 'my-slug', `expected req.query.slug === "my-slug", got ${captured}`);
});

await checkAsync('real querystring params merge alongside path params', async () => {
  let capturedQuery: Record<string, string> = {};
  const handler = async (req: VercelRequest, res: VercelResponse) => {
    capturedQuery = req.query as Record<string, string>;
    (res as unknown as { status: (c: number) => typeof res }).status(200);
    (res as unknown as { json: (b: unknown) => void }).json({});
  };
  await invokeHandler(
    handler,
    fakeEvent({ method: 'GET', path: '/articles/A1', query: { debug: '1' } }),
    '/articles/A1',
    { id: 'A1' },
  );
  assert(capturedQuery.id === 'A1' && capturedQuery.debug === '1', `expected both path+query params merged, got ${JSON.stringify(capturedQuery)}`);
});

await checkAsync('admin key header reaches the handler unchanged (authorization propagation)', async () => {
  let capturedKey: unknown;
  const handler = async (req: VercelRequest, res: VercelResponse) => {
    capturedKey = req.headers['x-newsroom-admin-key'];
    (res as unknown as { status: (c: number) => typeof res }).status(200);
    (res as unknown as { json: (b: unknown) => void }).json({});
  };
  await invokeHandler(
    handler,
    fakeEvent({ method: 'POST', path: '/articles', headers: { 'x-newsroom-admin-key': 'test-key-value' } }),
    '/articles',
    {},
  );
  assert(capturedKey === 'test-key-value', `expected admin key header propagated, got ${capturedKey}`);
});

await checkAsync('plain JSON request body is parsed into req.body (POST admin route style)', async () => {
  let capturedBody: unknown;
  const handler = async (req: VercelRequest, res: VercelResponse) => {
    capturedBody = req.body;
    (res as unknown as { status: (c: number) => typeof res }).status(201);
    (res as unknown as { json: (b: unknown) => void }).json({});
  };
  await invokeHandler(
    handler,
    fakeEvent({ method: 'POST', path: '/articles/A1', body: JSON.stringify({ title: 'Hello' }) }),
    '/articles/A1',
    { id: 'A1' },
  );
  assert((capturedBody as { title?: string })?.title === 'Hello', `expected parsed JSON body, got ${JSON.stringify(capturedBody)}`);
});

await checkAsync('base64-encoded request body (API Gateway may send this) is decoded before JSON parsing', async () => {
  let capturedBody: unknown;
  const handler = async (req: VercelRequest, res: VercelResponse) => {
    capturedBody = req.body;
    (res as unknown as { status: (c: number) => typeof res }).status(200);
    (res as unknown as { json: (b: unknown) => void }).json({});
  };
  const jsonPayload = JSON.stringify({ featured: true });
  await invokeHandler(
    handler,
    fakeEvent({ method: 'PATCH', path: '/articles/A1', body: Buffer.from(jsonPayload, 'utf8').toString('base64'), isBase64Encoded: true }),
    '/articles/A1',
    { id: 'A1' },
  );
  assert((capturedBody as { featured?: boolean })?.featured === true, `expected decoded+parsed body, got ${JSON.stringify(capturedBody)}`);
});

await checkAsync('empty request body -> req.body defaults to {} (no crash on a bodyless call)', async () => {
  let capturedBody: unknown = 'not-yet-set';
  const handler = async (req: VercelRequest, res: VercelResponse) => {
    capturedBody = req.body;
    (res as unknown as { status: (c: number) => typeof res }).status(200);
    (res as unknown as { json: (b: unknown) => void }).json({});
  };
  await invokeHandler(handler, fakeEvent({ method: 'GET', path: '/public/articles' }), '/public/articles', {});
  assert(typeof capturedBody === 'object' && capturedBody !== null && !Array.isArray(capturedBody), `expected {}, got ${JSON.stringify(capturedBody)}`);
});

await checkAsync('binary image response is base64-encoded with isBase64Encoded=true and Content-Type preserved (public image proxy style)', async () => {
  const realPngBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const handler = async (_req: VercelRequest, res: VercelResponse) => {
    (res as unknown as { status: (c: number) => typeof res }).status(200);
    (res as unknown as { setHeader: (n: string, v: string) => void }).setHeader('Content-Type', 'image/png');
    (res as unknown as { setHeader: (n: string, v: string) => void }).setHeader('Cache-Control', 'public, max-age=3600');
    (res as unknown as { send: (b: Buffer) => void }).send(realPngBytes);
  };
  const result = await invokeHandler(handler, fakeEvent({ method: 'GET', path: '/public/images/img1' }), '/public/images/img1', { imageId: 'img1' });
  assert(result.statusCode === 200, `status ${result.statusCode}`);
  assert(result.isBase64Encoded === true, 'expected isBase64Encoded=true for a binary body');
  assert(result.headers?.['Content-Type'] === 'image/png', `expected image/png, got ${result.headers?.['Content-Type']}`);
  const roundTripped = Buffer.from(result.body as string, 'base64');
  assert(roundTripped.equals(realPngBytes), 'binary bytes were corrupted by the base64 round trip');
});

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
