/**
 * Real end-to-end test of the Phase 6A-preferred build-time data path:
 * `postbuild` -> HTTPS -> (API Gateway + Lambda, substituted here by a
 * local HTTP server wrapping the real `aws/newsroom-lambda.ts` handler) ->
 * real RDS. Proves `scripts/newsroom-public-data.ts`'s HTTPS strategy
 * actually works against a real running endpoint and real published
 * content, not just that its code compiles.
 *
 * The local HTTP server is a genuine substitute for "API Gateway is not
 * deployed yet" — it translates a real Node HTTP request into the exact
 * same `APIGatewayProxyEventV2` shape API Gateway would produce and feeds
 * it to the real, unmodified Lambda `handler()`, so everything except the
 * actual AWS networking hop is real.
 *
 * Run: npm run aws:build-time:test
 */
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, existsSync } from 'node:fs';

const execFileAsync = promisify(execFile);
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { handler as lambdaHandler } from '../aws/newsroom-lambda';
import { fetchPublishedNewsroomArticles } from './newsroom-public-data';
import createArticleHandler from '../api/newsroom/articles/index';
import uploadsHandler from '../api/newsroom/articles/[id]/uploads/index';
import completeHandler from '../api/newsroom/articles/[id]/uploads/complete';
import processHandler from '../api/newsroom/articles/[id]/process';
import articleDetailHandler from '../api/newsroom/articles/[id]/index';
import publishHandler from '../api/newsroom/articles/[id]/publish';
import { getPool } from '../api/_lib/db';
import { getS3Client, getNewsroomBucket } from '../api/_lib/s3';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

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

function mockReq({ method, query = {}, body = {}, headers = {} }: { method: string; query?: Record<string, string>; body?: unknown; headers?: Record<string, string> }) {
  return { method, query, body, headers };
}
function mockRes() {
  return {
    statusCode: 200,
    _json: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    setHeader() { return this; },
    json(body: unknown) { this._json = body; return this; },
  };
}
async function call(handler: (req: unknown, res: unknown) => Promise<void>, opts: Parameters<typeof mockReq>[0]) {
  const req = mockReq(opts);
  const res = mockRes();
  await handler(req, res);
  return res;
}

console.log('=== AWS build-time HTTPS fetch path — real end-to-end test ===\n');

// A real local HTTP server standing in for "API Gateway is deployed" —
// translates real HTTP requests into real APIGatewayProxyEventV2 events
// and feeds them to the real, unmodified Lambda handler.
const server = createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', async () => {
    const body = Buffer.concat(chunks).toString('utf8');
    const url = new URL(req.url ?? '/', 'http://localhost');
    const query: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (query[k] = v));

    const event = {
      version: '2.0',
      rawPath: url.pathname,
      rawQueryString: url.search.replace(/^\?/, ''),
      headers: Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : (v ?? '')])),
      queryStringParameters: Object.keys(query).length > 0 ? query : undefined,
      requestContext: { http: { method: req.method ?? 'GET', path: url.pathname, protocol: 'HTTP/1.1', sourceIp: '127.0.0.1', userAgent: 'test' } },
      body: body.length > 0 ? body : undefined,
      isBase64Encoded: false,
    } as APIGatewayProxyEventV2;

    const result = await lambdaHandler(event);
    res.statusCode = result.statusCode ?? 500;
    for (const [name, value] of Object.entries(result.headers ?? {})) res.setHeader(name, value as string);
    const responseBody = result.isBase64Encoded ? Buffer.from(result.body as string, 'base64') : (result.body ?? '');
    res.end(responseBody);
  });
});

await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const port = typeof address === 'object' && address ? address.port : 0;
const baseUrl = `http://127.0.0.1:${port}`;
console.log(`  local server (standing in for API Gateway) listening at ${baseUrl}\n`);

let articleId: string, slug: string, pdfS3Key: string;

await check('[setup] create + upload PDF + process + publish a real disposable article', async () => {
  const draft = await call(createArticleHandler as never, { method: 'POST' });
  articleId = (draft._json as { id: string }).id;
  slug = `aws-buildtime-test-${articleId.slice(0, 8)}`;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  page.drawText('AWS build-time HTTPS fetch path test document.', { x: 50, y: 780, size: 11, font });
  const pdfBytes = Buffer.from(await doc.save());

  const presign = await call(uploadsHandler as never, { method: 'POST', query: { id: articleId }, body: { type: 'pdf', filename: 'a.pdf', contentType: 'application/pdf' } });
  pdfS3Key = (presign._json as { s3Key: string }).s3Key;
  const put = await fetch((presign._json as { uploadUrl: string }).uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: pdfBytes });
  if (!put.ok) throw new Error(`PUT failed: ${put.status}`);
  await call(completeHandler as never, { method: 'POST', query: { id: articleId }, body: { type: 'pdf', s3Key: pdfS3Key } });
  const processRes = await call(processHandler as never, { method: 'POST', query: { id: articleId } });
  assert(processRes.statusCode === 200, `process failed: ${processRes.statusCode}`);

  const patch = await call(articleDetailHandler as never, { method: 'PATCH', query: { id: articleId }, body: { title: 'AWS Build-Time Fetch Test', slug } });
  assert(patch.statusCode === 200, `metadata PATCH failed: ${patch.statusCode}`);
  const publish = await call(publishHandler as never, { method: 'POST', query: { id: articleId } });
  assert(publish.statusCode === 200, `publish failed: ${publish.statusCode}`);
});
console.log(`  article id: ${articleId!}, slug: ${slug!}`);

await check('fetchPublishedNewsroomArticles() via NEWSROOM_PUBLIC_API_BASE_URL fetches the real article over real HTTP, with zero DB env vars needed by this call', async () => {
  const prevBase = process.env.NEWSROOM_PUBLIC_API_BASE_URL;
  const savedDbVars: Record<string, string | undefined> = {};
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    savedDbVars[key] = process.env[key];
    delete process.env[key]; // prove this call path needs none of them
  }
  process.env.NEWSROOM_PUBLIC_API_BASE_URL = baseUrl;
  try {
    const articles = await fetchPublishedNewsroomArticles();
    const found = articles.find((a) => a.slug === slug);
    assert(found, `published article not found via HTTPS fetch path: ${JSON.stringify(articles.map((a) => a.slug))}`);
    assert(found!.title === 'AWS Build-Time Fetch Test', `title mismatch: ${found!.title}`);
  } finally {
    if (prevBase !== undefined) process.env.NEWSROOM_PUBLIC_API_BASE_URL = prevBase;
    else delete process.env.NEWSROOM_PUBLIC_API_BASE_URL;
    for (const [key, value] of Object.entries(savedDbVars)) {
      if (value !== undefined) process.env[key] = value;
    }
  }
});

await check('real `npm run build` with ONLY NEWSROOM_PUBLIC_API_BASE_URL set (no DB_* vars at all) prerenders the real published article', async () => {
  const buildEnv = { ...process.env };
  for (const key of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) delete buildEnv[key];
  buildEnv.NEWSROOM_PUBLIC_API_BASE_URL = baseUrl;

  // execFile (async), NOT execSync — this test's local HTTP server lives in
  // THIS same process, and the build's postbuild step needs to fetch()
  // from it; a synchronous exec would block this process's event loop
  // entirely, so the server could never respond to that fetch, deadlocking
  // both sides. (Found and fixed during this phase's own real testing.)
  const { stdout, stderr } = await execFileAsync('npm', ['run', 'build'], { cwd: process.cwd(), env: buildEnv, maxBuffer: 20 * 1024 * 1024 });
  const output = stdout + stderr;
  assert(output.includes('Newsroom: 1 published'), `expected the build log to report 1 published article, got: ${output.match(/Newsroom:.*$/m)?.[0] ?? '(no match)'}`);

  const shellPath = `dist/newsroom/${slug}/index.html`;
  assert(existsSync(shellPath), `expected a prerendered shell at ${shellPath}`);
  const html = readFileSync(shellPath, 'utf8');
  assert(html.includes('<title>AWS Build-Time Fetch Test'), 'title missing/wrong in the HTTPS-path-built prerendered HTML');
  assert(html.includes('"@type":"NewsArticle"') || html.includes('"@type": "NewsArticle"'), 'NewsArticle JSON-LD missing');

  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  assert(sitemap.includes(`/newsroom/${slug}`), 'sitemap missing the article built via the HTTPS path');
});

console.log('\nCleanup:');
await check('delete real S3 object + RDS row', async () => {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: getNewsroomBucket(), Key: pdfS3Key }));
  await getPool().query('DELETE FROM news_articles WHERE id = :id', { id: articleId });
});

server.close();
await getPool().end();
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
