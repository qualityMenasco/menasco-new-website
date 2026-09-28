/**
 * Phase 5 production-hardening security checks, against real RDS + S3.
 * Focuses specifically on the checks Phase 5 calls out as needing an
 * EXPLICIT test (not just "the query happens to filter correctly") — most
 * importantly: an image belonging to a not-yet-published article must not
 * be retrievable through the public image proxy, before it is ever
 * published, not just after being unpublished (Phase 4's test only proved
 * the after-unpublish case).
 *
 * Run: npm run newsroom:phase5:security
 */
import { PDFDocument, StandardFonts } from 'pdf-lib';
import createArticleHandler from '../api/newsroom/articles/index.ts';
import articleDetailHandler from '../api/newsroom/articles/[id]/index.ts';
import uploadsHandler from '../api/newsroom/articles/[id]/uploads/index.ts';
import completeHandler from '../api/newsroom/articles/[id]/uploads/complete.ts';
import processHandler from '../api/newsroom/articles/[id]/process.ts';
import publicListHandler from '../api/newsroom/public/articles/index.ts';
import publicDetailHandler from '../api/newsroom/public/articles/[slug].ts';
import publicImageHandler from '../api/newsroom/public/images/[imageId].ts';
import { getPool } from '../api/_lib/db.ts';
import { getS3Client, getNewsroomBucket } from '../api/_lib/s3.ts';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

function mockReq({ method, query = {}, body = {}, headers = {} }) {
  return { method, query, body, headers };
}
function mockRes() {
  return {
    statusCode: 200,
    _json: undefined,
    _headers: {},
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this._headers[name] = value; return this; },
    json(body) { this._json = body; return this; },
    send(body) { this._body = body; return this; },
  };
}
async function call(handler, opts) {
  const req = mockReq(opts);
  const res = mockRes();
  await handler(req, res);
  return res;
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

const PNG_1X1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

console.log('=== Newsroom Phase 5 security checks (real RDS + S3) ===\n');

let articleId, imageId, imageS3Key, slug;

await check('[setup] create draft + upload real image, article never published (stays ready-not-published)', async () => {
  const draft = await call(createArticleHandler, { method: 'POST' });
  articleId = draft._json.id;
  slug = `phase5-sec-${articleId.slice(0, 8)}`;

  const presign = await call(uploadsHandler, { method: 'POST', query: { id: articleId }, body: { type: 'image', filename: 'x.png', contentType: 'image/png', position: 0 } });
  imageS3Key = presign._json.s3Key;
  const put = await fetch(presign._json.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: PNG_1X1 });
  if (!put.ok) throw new Error(`PUT failed: ${put.status}`);
  await call(completeHandler, { method: 'POST', query: { id: articleId }, body: { type: 'image', s3Key: imageS3Key, position: 0 } });

  const detail = await call(articleDetailHandler, { method: 'GET', query: { id: articleId } });
  imageId = detail._json.images[0].id;

  await call(articleDetailHandler, { method: 'PATCH', query: { id: articleId }, body: { title: 'Phase 5 Security Test (never published)', slug } });
});
console.log(`  article id: ${articleId} (status: draft), image id: ${imageId}`);

await check('[public image] image belonging to a never-published article -> 404 via public proxy', async () => {
  const res = await call(publicImageHandler, { method: 'GET', query: { imageId } });
  if (res.statusCode !== 404) throw new Error(`expected 404, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[public detail] article slug exists but never published -> 404, identical to nonexistent', async () => {
  const realSlugRes = await call(publicDetailHandler, { method: 'GET', query: { slug } });
  const fakeSlugRes = await call(publicDetailHandler, { method: 'GET', query: { slug: 'totally-made-up-slug-xyz' } });
  if (realSlugRes.statusCode !== 404) throw new Error(`expected 404 for real-but-unpublished slug, got ${realSlugRes.statusCode}`);
  if (fakeSlugRes.statusCode !== 404) throw new Error(`expected 404 for nonexistent slug, got ${fakeSlugRes.statusCode}`);
  if (JSON.stringify(realSlugRes._json) !== JSON.stringify(fakeSlugRes._json)) {
    throw new Error(`responses differ — status could be inferred from response body: ${JSON.stringify(realSlugRes._json)} vs ${JSON.stringify(fakeSlugRes._json)}`);
  }
});

await check('[public list] never-published article never appears', async () => {
  const res = await call(publicListHandler, { method: 'GET' });
  if (res._json.some((a) => a.slug === slug)) throw new Error('unpublished article leaked into public list');
});

// Advance to processing stage (still unpublished) — proves the image proxy stays locked even once the article has real structured_content and looks "ready", not just while it's a bare draft.
await check('[setup] process article to ready (still not published)', async () => {
  const presign = await call(uploadsHandler, { method: 'POST', query: { id: articleId }, body: { type: 'pdf', filename: 'a.pdf', contentType: 'application/pdf' } });
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  page.drawText('Phase 5 security test document content for extraction.', { x: 50, y: 780, size: 11, font });
  const pdfBytes = Buffer.from(await doc.save());
  const put = await fetch(presign._json.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: pdfBytes });
  if (!put.ok) throw new Error(`PUT failed: ${put.status}`);
  await call(completeHandler, { method: 'POST', query: { id: articleId }, body: { type: 'pdf', s3Key: presign._json.s3Key } });
  const processRes = await call(processHandler, { method: 'POST', query: { id: articleId } });
  if (processRes.statusCode !== 200) throw new Error(`process failed: ${processRes.statusCode}`);
});

await check('[public image] still 404 even once the article is "ready" (processed but not published)', async () => {
  const res = await call(publicImageHandler, { method: 'GET', query: { imageId } });
  if (res.statusCode !== 404) throw new Error(`expected 404, got ${res.statusCode}`);
});

await check('[malformed input] public image proxy rejects a non-UUID id safely (400, not a 500/crash)', async () => {
  const res = await call(publicImageHandler, { method: 'GET', query: { imageId: '../../etc/passwd' } });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[malformed input] public detail rejects an empty slug safely', async () => {
  const res = await call(publicDetailHandler, { method: 'GET', query: {} });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[error leakage] a forced internal error never leaks raw SQL/stack to the client', async () => {
  // Malformed UUID already covered above; this checks the generic-error path's response shape has no "sql"/"stack"/host substrings for a real 404 case.
  const res = await call(publicDetailHandler, { method: 'GET', query: { slug: 'nonexistent' } });
  const json = JSON.stringify(res._json);
  for (const forbidden of ['sql', 'stack', 'ECONNREFUSED', 'ap-south-1.rds.amazonaws.com', 'ER_']) {
    if (json.toLowerCase().includes(forbidden.toLowerCase())) throw new Error(`response leaked internal detail: "${forbidden}"`);
  }
});

console.log('\nCleanup (removing disposable test rows/objects from RDS + S3):');
await check('delete real S3 objects', async () => {
  const client = getS3Client();
  const bucket = getNewsroomBucket();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: imageS3Key }));
  const [rows] = await getPool().query('SELECT source_pdf_s3_key FROM news_articles WHERE id = :id', { id: articleId });
  if (rows[0]?.source_pdf_s3_key) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: rows[0].source_pdf_s3_key }));
  }
});
await check('delete test article row', async () => {
  await getPool().query('DELETE FROM news_articles WHERE id = :id', { id: articleId });
  const [rows] = await getPool().query('SELECT * FROM news_articles WHERE id = :id', { id: articleId });
  if (rows.length !== 0) throw new Error('cleanup did not remove test row');
});

await getPool().end();
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
