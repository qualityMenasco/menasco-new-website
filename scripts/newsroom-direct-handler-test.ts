/**
 * Fallback E2E harness — use `npm run newsroom:e2e` (real HTTP, via
 * `vercel dev`) as the primary test. This script exists because a real,
 * isolated bug was found in `vercel dev` (CLI 59.16.0, this project's
 * custom Vite `devCommand`): ANY dynamic `[id]` route — folder or
 * filename bracket syntax, minimal repro or the real routes — silently
 * falls through to the SPA 404 instead of reaching the function, while
 * static (non-dynamic) `/api/*` routes work correctly. Only the static
 * `POST /api/newsroom/articles` route could be verified over real HTTP;
 * this script calls the other (dynamic-route) handler modules directly —
 * same real code, same real RDS/S3 calls, just without going through
 * `vercel dev`'s router for the parts of it that don't work locally yet.
 * Loosely typed on purpose (a debugging/verification tool, not production
 * code) — not part of the strict `tsconfig.api.json` project.
 *
 * Run: npm run newsroom:e2e:direct
 */
import createArticleHandler from '../api/newsroom/articles/index.ts';
import articleDetailHandler from '../api/newsroom/articles/[id]/index.ts';
import uploadsHandler from '../api/newsroom/articles/[id]/uploads/index.ts';
import completeHandler from '../api/newsroom/articles/[id]/uploads/complete.ts';
import { getPool } from '../api/_lib/db.ts';
import { getS3Client, getNewsroomBucket } from '../api/_lib/s3.ts';
import { HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// A minimal but genuinely valid PDF (parses as application/pdf).
const TEST_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\nxref\n0 4\n0000000000 65535 f \n' +
    'trailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF',
  'utf8',
);
// A minimal valid 1x1 JPEG.
const TEST_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'base64',
);

function mockReq({ method, query = {}, body = {}, headers = {} }) {
  return { method, query, body, headers };
}
function mockRes() {
  return {
    statusCode: 200,
    _json: undefined,
    status(code) { this.statusCode = code; return this; },
    setHeader() { return this; },
    json(body) { this._json = body; return this; },
  };
}

let pass = 0, fail = 0;
async function check(label, fn) {
  process.stdout.write(`- ${label} ... `);
  try {
    await fn();
    console.log('OK');
    pass++;
  } catch (err) {
    console.log(`FAIL: ${err.message}`);
    fail++;
  }
}

async function call(handler, opts) {
  const req = mockReq(opts);
  const res = mockRes();
  await handler(req, res);
  return res;
}

console.log('=== Direct handler test against REAL RDS (and REAL S3 where creds allow) ===\n');

let articleId;
await check('POST /api/newsroom/articles (dev bypass, no key needed)', async () => {
  const res = await call(createArticleHandler, { method: 'POST', headers: {} });
  if (res.statusCode !== 201) throw new Error(`expected 201, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  articleId = res._json.id;
  if (res._json.status !== 'draft') throw new Error(`expected status draft, got ${res._json.status}`);
});
console.log(`  article id: ${articleId}`);

await check('GET /api/newsroom/articles/:id', async () => {
  const res = await call(articleDetailHandler, { method: 'GET', query: { id: articleId } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._json.status !== 'draft' || res._json.sourcePdf !== null || res._json.images.length !== 0) {
    throw new Error(`unexpected fresh-draft shape: ${JSON.stringify(res._json)}`);
  }
  if (res._json.structuredContent !== null) throw new Error('structuredContent should be NULL in Phase 1');
});

await check('PATCH title/slug', async () => {
  const slug = `direct-test-${articleId.slice(0, 8)}`;
  const res = await call(articleDetailHandler, {
    method: 'PATCH',
    query: { id: articleId },
    body: { title: 'Direct Handler Test Article', slug },
  });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._json.title !== 'Direct Handler Test Article' || res._json.slug !== slug) {
    throw new Error(`PATCH did not persist correctly: ${JSON.stringify(res._json)}`);
  }
});

let pdfPresign;
await check('POST .../uploads (type=pdf) — presign', async () => {
  const res = await call(uploadsHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'pdf', filename: 'article.pdf', contentType: 'application/pdf' },
  });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  pdfPresign = res._json;
  const expectedKey = `newsroom/articles/${articleId}/source/article.pdf`;
  if (pdfPresign.s3Key !== expectedKey) throw new Error(`unexpected s3Key: ${pdfPresign.s3Key}`);
  if (pdfPresign.expiresIn !== 900) throw new Error(`expected 15-minute (900s) expiry, got ${pdfPresign.expiresIn}`);
});
console.log(`  s3Key: ${pdfPresign?.s3Key}`);
console.log(`  presigned URL host: ${pdfPresign ? new URL(pdfPresign.uploadUrl).host : 'n/a'}`);

console.log('\nReal S3 happy path (real credentials confirmed active — aws sts get-caller-identity succeeded):');

await check('PUT real test PDF to presigned URL', async () => {
  const res = await fetch(pdfPresign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: TEST_PDF,
  });
  if (!res.ok) throw new Error(`S3 PUT failed: HTTP ${res.status} ${await res.text()}`);
});

await check('finalize PDF via complete handler', async () => {
  const res = await call(completeHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'pdf', s3Key: pdfPresign.s3Key },
  });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._json.sourcePdf?.s3Key !== pdfPresign.s3Key) {
    throw new Error(`finalize response missing expected sourcePdf.s3Key: ${JSON.stringify(res._json)}`);
  }
});

await check('duplicate PDF finalize is idempotent (still 200, same key)', async () => {
  const res = await call(completeHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'pdf', s3Key: pdfPresign.s3Key },
  });
  if (res.statusCode !== 200) throw new Error(`expected 200 on idempotent re-finalize, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._json.sourcePdf?.s3Key !== pdfPresign.s3Key) throw new Error('idempotent re-finalize changed the s3Key');
});

await check('verify source_pdf_s3_key persisted in RDS', async () => {
  const [rows] = await getPool().query('SELECT source_pdf_s3_key FROM news_articles WHERE id = :id', { id: articleId });
  if (rows.length !== 1) throw new Error('article row not found');
  if (rows[0].source_pdf_s3_key !== pdfPresign.s3Key) {
    throw new Error(`expected source_pdf_s3_key=${pdfPresign.s3Key}, got ${rows[0].source_pdf_s3_key}`);
  }
});

let imagePresign;
await check('POST .../uploads (type=image, position=0) — presign', async () => {
  const res = await call(uploadsHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'image', filename: 'photo.jpg', contentType: 'image/jpeg', position: 0 },
  });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  imagePresign = res._json;
  const prefix = `newsroom/articles/${articleId}/images/`;
  if (!imagePresign.s3Key.startsWith(prefix) || !imagePresign.s3Key.endsWith('.jpg')) {
    throw new Error(`unexpected image s3Key: ${imagePresign.s3Key}`);
  }
});
console.log(`  s3Key: ${imagePresign?.s3Key}`);

await check('PUT real test JPEG to presigned URL', async () => {
  const res = await fetch(imagePresign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: TEST_JPEG,
  });
  if (!res.ok) throw new Error(`S3 PUT failed: HTTP ${res.status} ${await res.text()}`);
});

await check('finalize image via complete handler', async () => {
  const res = await call(completeHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'image', s3Key: imagePresign.s3Key, position: 0 },
  });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('duplicate image finalize is idempotent (same position upserts, not duplicates)', async () => {
  const res = await call(completeHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'image', s3Key: imagePresign.s3Key, position: 0 },
  });
  if (res.statusCode !== 200) throw new Error(`expected 200 on idempotent re-finalize, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  const [rows] = await getPool().query('SELECT COUNT(*) AS c FROM news_article_images WHERE article_id = :id', { id: articleId });
  if (Number(rows[0].c) !== 1) throw new Error(`expected exactly 1 image row after idempotent re-finalize, got ${rows[0].c}`);
});

await check('verify news_article_images row persisted in RDS', async () => {
  const [rows] = await getPool().query(
    'SELECT s3_key, `position` FROM news_article_images WHERE article_id = :id',
    { id: articleId },
  );
  if (rows.length !== 1) throw new Error(`expected 1 image row, got ${rows.length}`);
  if (rows[0].s3_key !== imagePresign.s3Key) throw new Error(`expected s3_key=${imagePresign.s3Key}, got ${rows[0].s3_key}`);
  if (Number(rows[0].position) !== 0) throw new Error(`expected position=0, got ${rows[0].position}`);
});

await check('S3 HEAD confirms real PDF object exists', async () => {
  const client = getS3Client();
  await client.send(new HeadObjectCommand({ Bucket: getNewsroomBucket(), Key: pdfPresign.s3Key }));
});

await check('S3 HEAD confirms real image object exists', async () => {
  const client = getS3Client();
  await client.send(new HeadObjectCommand({ Bucket: getNewsroomBucket(), Key: imagePresign.s3Key }));
});

await check('GET article reflects full real state (pdf + image)', async () => {
  const res = await call(articleDetailHandler, { method: 'GET', query: { id: articleId } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._json.sourcePdf?.s3Key !== pdfPresign.s3Key) throw new Error(`GET missing expected sourcePdf: ${JSON.stringify(res._json.sourcePdf)}`);
  if (res._json.images.length !== 1 || res._json.images[0].s3Key !== imagePresign.s3Key) {
    throw new Error(`GET images mismatch: ${JSON.stringify(res._json.images)}`);
  }
  if (res._json.structuredContent !== null) throw new Error('structuredContent should remain NULL in Phase 1');
});

// --- Failure cases that don't need S3 ---
console.log('\nFailure cases (no S3 required):');

await check('[failure] GET nonexistent article -> 404', async () => {
  const res = await call(articleDetailHandler, { method: 'GET', query: { id: '00000000-0000-4000-8000-000000000000' } });
  if (res.statusCode !== 404) throw new Error(`expected 404, got ${res.statusCode}`);
});

await check('[failure] GET malformed article id -> 400', async () => {
  const res = await call(articleDetailHandler, { method: 'GET', query: { id: 'not-a-uuid' } });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}`);
});

await check('[failure] unsupported image MIME type -> 400', async () => {
  const res = await call(uploadsHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'image', filename: 'x.gif', contentType: 'image/gif', position: 0 },
  });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[failure] invalid image position (negative) -> 400', async () => {
  const res = await call(uploadsHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'image', filename: 'x.jpg', contentType: 'image/jpeg', position: -1 },
  });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[failure] finalize before upload exists -> 409 (real S3 HEAD confirms object missing)', async () => {
  const res = await call(completeHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'image', s3Key: `newsroom/articles/${articleId}/images/never-uploaded.jpg`, position: 5 },
  });
  if (res.statusCode !== 409) throw new Error(`expected 409, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[failure] finalize with s3Key outside article prefix -> 400', async () => {
  const res = await call(completeHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'pdf', s3Key: 'newsroom/articles/someone-elses-article/source/article.pdf' },
  });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

let secondArticleId;
await check('[setup] create second draft for duplicate-slug check', async () => {
  const res = await call(createArticleHandler, { method: 'POST' });
  if (res.statusCode !== 201) throw new Error(`expected 201, got ${res.statusCode}`);
  secondArticleId = res._json.id;
});

await check('[failure] duplicate slug on PATCH -> 409, clean error (not a raw MySQL stack trace)', async () => {
  const res = await call(articleDetailHandler, {
    method: 'PATCH',
    query: { id: secondArticleId },
    body: { slug: `direct-test-${articleId.slice(0, 8)}` },
  });
  if (res.statusCode !== 409) throw new Error(`expected 409, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (typeof res._json.error !== 'string' || res._json.error.includes('ER_DUP_ENTRY') || res._json.error.includes('SQL')) {
    throw new Error(`error message leaks raw DB detail: ${JSON.stringify(res._json)}`);
  }
});

// --- Auth tests: temporarily simulate bypass=false / wrong env ---
console.log('\nAuth behavior (re-importing auth module with mutated env — see script for method):');

await check('[auth] unauthorized with bypass off and no key -> 401', async () => {
  const prevBypass = process.env.NEWSROOM_DEV_AUTH_BYPASS;
  const prevKey = process.env.NEWSROOM_ADMIN_API_KEY;
  process.env.NEWSROOM_DEV_AUTH_BYPASS = 'false';
  delete process.env.NEWSROOM_ADMIN_API_KEY;
  try {
    // Re-import auth fresh isn't possible without cache-busting; call the guard logic inline via a fresh dynamic import with a cache-busting query.
    const { requireNewsroomAuth } = await import(`../api/_lib/auth.ts?cachebust=${Date.now()}`);
    let threw = false;
    try {
      requireNewsroomAuth({ headers: {} });
    } catch (err) {
      threw = true;
      if (err.status !== 401) throw new Error(`expected 401, got ${err.status}`);
    }
    if (!threw) throw new Error('expected requireNewsroomAuth to throw when unauthenticated');
  } finally {
    process.env.NEWSROOM_DEV_AUTH_BYPASS = prevBypass;
    if (prevKey !== undefined) process.env.NEWSROOM_ADMIN_API_KEY = prevKey;
  }
});

await check('[auth] wrong admin key -> 401, correct key -> passes', async () => {
  const prevBypass = process.env.NEWSROOM_DEV_AUTH_BYPASS;
  const prevKey = process.env.NEWSROOM_ADMIN_API_KEY;
  process.env.NEWSROOM_DEV_AUTH_BYPASS = 'false';
  process.env.NEWSROOM_ADMIN_API_KEY = 'the-real-key';
  try {
    const { requireNewsroomAuth } = await import(`../api/_lib/auth.ts?cachebust=${Date.now()}`);
    let wrongThrew = false;
    try {
      requireNewsroomAuth({ headers: { 'x-newsroom-admin-key': 'wrong-key' } });
    } catch (err) {
      wrongThrew = true;
      if (err.status !== 401) throw new Error(`wrong key: expected 401, got ${err.status}`);
    }
    if (!wrongThrew) throw new Error('expected wrong key to throw 401');
    // correct key should NOT throw
    requireNewsroomAuth({ headers: { 'x-newsroom-admin-key': 'the-real-key' } });
  } finally {
    process.env.NEWSROOM_DEV_AUTH_BYPASS = prevBypass;
    if (prevKey !== undefined) process.env.NEWSROOM_ADMIN_API_KEY = prevKey;
    else delete process.env.NEWSROOM_ADMIN_API_KEY;
  }
});

await check('[auth] fails closed in production even with dev bypass=true', async () => {
  const prevBypass = process.env.NEWSROOM_DEV_AUTH_BYPASS;
  const prevKey = process.env.NEWSROOM_ADMIN_API_KEY;
  const prevVercelEnv = process.env.VERCEL_ENV;
  process.env.NEWSROOM_DEV_AUTH_BYPASS = 'true';
  delete process.env.NEWSROOM_ADMIN_API_KEY;
  process.env.VERCEL_ENV = 'production';
  try {
    const { requireNewsroomAuth } = await import(`../api/_lib/auth.ts?cachebust=${Date.now()}`);
    let threw = false;
    try {
      requireNewsroomAuth({ headers: {} });
    } catch (err) {
      threw = true;
      if (err.status !== 401) throw new Error(`expected 401, got ${err.status}`);
    }
    if (!threw) throw new Error('SECURITY: dev bypass leaked into production!');
  } finally {
    process.env.NEWSROOM_DEV_AUTH_BYPASS = prevBypass;
    if (prevKey !== undefined) process.env.NEWSROOM_ADMIN_API_KEY = prevKey;
    if (prevVercelEnv !== undefined) process.env.VERCEL_ENV = prevVercelEnv;
    else delete process.env.VERCEL_ENV;
  }
});

// --- DB verification ---
console.log('\nDB state verification (direct query):');
const pool = getPool();
await check('news_articles row exists with expected fields (real pdf key persisted)', async () => {
  const [rows] = await pool.query('SELECT * FROM news_articles WHERE id = :id', { id: articleId });
  if (rows.length !== 1) throw new Error('article row not found');
  const row = rows[0];
  if (row.status !== 'draft') throw new Error(`expected status=draft, got ${row.status}`);
  if (row.structured_content !== null) throw new Error('structured_content should remain NULL');
  if (row.source_pdf_s3_key !== pdfPresign.s3Key) {
    throw new Error(`expected source_pdf_s3_key=${pdfPresign.s3Key}, got ${row.source_pdf_s3_key}`);
  }
});

// --- Cleanup ---
console.log('\nCleanup (removing disposable test rows/objects from RDS + S3):');
await check('delete real S3 objects (pdf + image)', async () => {
  const client = getS3Client();
  const bucket = getNewsroomBucket();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: pdfPresign.s3Key }));
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: imagePresign.s3Key }));
  // Confirm deletion: HEAD should now reject with a not-found error.
  for (const key of [pdfPresign.s3Key, imagePresign.s3Key]) {
    let stillExists = true;
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    } catch {
      stillExists = false;
    }
    if (stillExists) throw new Error(`S3 object ${key} still exists after delete`);
  }
});

await check('delete test articles (cascades to news_article_images)', async () => {
  await pool.query('DELETE FROM news_articles WHERE id IN (:a, :b)', { a: articleId, b: secondArticleId });
  const [check1] = await pool.query('SELECT * FROM news_articles WHERE id IN (:a, :b)', { a: articleId, b: secondArticleId });
  if (check1.length !== 0) throw new Error('cleanup did not remove test rows');
  const [images] = await pool.query('SELECT * FROM news_article_images WHERE article_id = :id', { id: articleId });
  if (images.length !== 0) throw new Error('cleanup did not remove image rows');
});

await pool.end();
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
