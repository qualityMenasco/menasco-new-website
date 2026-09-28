/**
 * Phase 4 real end-to-end test: public Newsroom API + build-time
 * prerender/sitemap integration, against actual RDS + actual S3. Same
 * direct-handler-invocation pattern as prior phases' test scripts for the
 * API-level checks; shells out to the real `npm run build` for the
 * prerender/sitemap checks, since that's the actual pipeline being
 * verified, not a simulation of it.
 *
 * Run: npm run newsroom:phase4:e2e
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import createArticleHandler from '../api/newsroom/articles/index.ts';
import articleDetailHandler from '../api/newsroom/articles/[id]/index.ts';
import uploadsHandler from '../api/newsroom/articles/[id]/uploads/index.ts';
import completeHandler from '../api/newsroom/articles/[id]/uploads/complete.ts';
import processHandler from '../api/newsroom/articles/[id]/process.ts';
import publishHandler from '../api/newsroom/articles/[id]/publish.ts';
import unpublishHandler from '../api/newsroom/articles/[id]/unpublish.ts';
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
    _body: undefined,
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

async function buildRealTestPdf() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  let y = 780;
  for (const line of [
    'Phase 4 Public API Test Article',
    'This disposable test document exists to verify the Phase 4',
    'public Newsroom API and prerender pipeline against real infrastructure.',
    'Key Points',
    '- Real S3 object, real RDS row, published for real',
    '- Confirmed visible via the real public API',
    '- Confirmed present/absent in real prerendered HTML and sitemap.xml',
    '- Deleted from both systems at the end of this test',
  ]) {
    page.drawText(line, { x: 50, y, size: 11, font });
    y -= 18;
  }
  return Buffer.from(await doc.save());
}
const PNG_1X1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

console.log('=== Newsroom Phase 4 real public API + prerender test ===\n');

let articleId, pdfS3Key, imageS3Key, imageId, slug;

await check('[setup] create + upload PDF + process + upload image + edit metadata + publish', async () => {
  const draft = await call(createArticleHandler, { method: 'POST' });
  articleId = draft._json.id;
  slug = `phase4-test-${articleId.slice(0, 8)}`;

  const presign = await call(uploadsHandler, { method: 'POST', query: { id: articleId }, body: { type: 'pdf', filename: 'a.pdf', contentType: 'application/pdf' } });
  pdfS3Key = presign._json.s3Key;
  const put = await fetch(presign._json.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: await buildRealTestPdf() });
  if (!put.ok) throw new Error(`PDF PUT failed: ${put.status}`);
  await call(completeHandler, { method: 'POST', query: { id: articleId }, body: { type: 'pdf', s3Key: pdfS3Key } });

  const processRes = await call(processHandler, { method: 'POST', query: { id: articleId } });
  if (processRes.statusCode !== 200) throw new Error(`process failed: ${processRes.statusCode}: ${JSON.stringify(processRes._json)}`);

  const imgPresign = await call(uploadsHandler, { method: 'POST', query: { id: articleId }, body: { type: 'image', filename: 'x.png', contentType: 'image/png', position: 0 } });
  imageS3Key = imgPresign._json.s3Key;
  const imgPut = await fetch(imgPresign._json.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: PNG_1X1 });
  if (!imgPut.ok) throw new Error(`image PUT failed: ${imgPut.status}`);
  await call(completeHandler, { method: 'POST', query: { id: articleId }, body: { type: 'image', s3Key: imageS3Key, position: 0 } });

  const detail = await call(articleDetailHandler, { method: 'GET', query: { id: articleId } });
  imageId = detail._json.images[0].id;

  const patch = await call(articleDetailHandler, {
    method: 'PATCH',
    query: { id: articleId },
    body: { title: 'Phase 4 Public API Test Article', slug, subtitle: 'Verifying the real public Newsroom API.', category: 'company-news', tags: [{ name: 'Test', slug: 'test' }], featured: true },
  });
  if (patch.statusCode !== 200) throw new Error(`metadata PATCH failed: ${patch.statusCode}: ${JSON.stringify(patch._json)}`);

  const publish = await call(publishHandler, { method: 'POST', query: { id: articleId } });
  if (publish.statusCode !== 200 || publish._json.status !== 'published') throw new Error(`publish failed: ${publish.statusCode}: ${JSON.stringify(publish._json)}`);
});
console.log(`  article id: ${articleId}, slug: ${slug}`);

await check('[public list] published article appears', async () => {
  const res = await call(publicListHandler, { method: 'GET' });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}`);
  const found = res._json.find((a) => a.slug === slug);
  if (!found) throw new Error('published article not found in public list');
  if (found.title !== 'Phase 4 Public API Test Article') throw new Error('title mismatch in public list');
});

await check('[public list] forbidden fields absent', async () => {
  const res = await call(publicListHandler, { method: 'GET' });
  const json = JSON.stringify(res._json);
  for (const forbidden of ['source_pdf_s3_key', 'sourcePdf', 'processing_error', 'processingError', 'processedAt', 's3Key', 'structuredContent']) {
    if (json.includes(forbidden)) throw new Error(`forbidden field "${forbidden}" leaked into public list response`);
  }
});

await check('[public detail] returns structured content, no admin fields', async () => {
  const res = await call(publicDetailHandler, { method: 'GET', query: { slug } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (!res._json.structuredContent || !Array.isArray(res._json.structuredContent.sections)) throw new Error('missing structuredContent.sections');
  const json = JSON.stringify(res._json);
  for (const forbidden of ['source_pdf_s3_key', 'sourcePdf', 'processing_error', 'processingError', 's3Key']) {
    if (json.includes(forbidden)) throw new Error(`forbidden field "${forbidden}" leaked into public detail response`);
  }
  if (!json.includes('publicUrl') && !json.includes('/api/newsroom/public/images/')) {
    // images[].url should reference the proxy, not a raw/presigned S3 URL
    if (!json.includes(imageId)) throw new Error('expected image proxy URL referencing the real image id');
  }
});

await check('[public image] proxy delivers real bytes with correct content type', async () => {
  const res = await call(publicImageHandler, { method: 'GET', query: { imageId } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._headers['Content-Type'] !== 'image/png') throw new Error(`expected image/png, got ${res._headers['Content-Type']}`);
  if (!res._body || res._body.length === 0) throw new Error('empty image body');
});

await check('[failure] public detail 404s for a nonexistent slug', async () => {
  const res = await call(publicDetailHandler, { method: 'GET', query: { slug: 'does-not-exist-at-all' } });
  if (res.statusCode !== 404) throw new Error(`expected 404, got ${res.statusCode}`);
});

console.log('\n[real build] running npm run build with real RDS credentials...');
let buildOutput;
await check('npm run build succeeds with real DB creds', () => {
  buildOutput = execSync('npm run build', { cwd: process.cwd(), env: process.env, encoding: 'utf8', stdio: 'pipe' });
});
console.log(`  ${(buildOutput.match(/Newsroom: \d+ published/) || ['(no match)'])[0]}`);

await check('[prerender] generated HTML shell exists for the published article', () => {
  const path = `dist/newsroom/${slug}/index.html`;
  if (!existsSync(path)) throw new Error(`expected prerendered shell at ${path}`);
});

let shellHtml;
await check('[prerender] title, description, canonical, hreflang, JSON-LD present and correct', () => {
  shellHtml = readFileSync(`dist/newsroom/${slug}/index.html`, 'utf8');
  if (!shellHtml.includes('<title>Phase 4 Public API Test Article')) throw new Error('title missing/wrong in prerendered HTML');
  if (!shellHtml.includes('Verifying the real public Newsroom API.')) throw new Error('meta description missing/wrong');
  if (!shellHtml.includes(`rel="canonical" href="https://menascogroup.com/newsroom/${slug}"`)) throw new Error('canonical link missing/wrong');
  if (!shellHtml.includes('hreflang="ar"') || !shellHtml.includes('hreflang="x-default"')) throw new Error('hreflang alternates missing');
  if (!shellHtml.includes('"@type":"NewsArticle"') && !shellHtml.includes('"@type": "NewsArticle"')) throw new Error('NewsArticle JSON-LD missing');
  if (!shellHtml.includes('"headline":"Phase 4 Public API Test Article"') && !shellHtml.includes('"headline": "Phase 4 Public API Test Article"')) {
    throw new Error('JSON-LD headline missing/wrong');
  }
});

await check('[sitemap] contains the published article route', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  if (!sitemap.includes(`<loc>https://menascogroup.com/newsroom/${slug}</loc>`)) throw new Error('sitemap missing the published article URL');
});

await check('[unpublish] article no longer public', async () => {
  const res = await call(unpublishHandler, { method: 'POST', query: { id: articleId } });
  if (res.statusCode !== 200 || res._json.status !== 'ready') throw new Error(`unpublish failed: ${res.statusCode}`);
  const publicRes = await call(publicDetailHandler, { method: 'GET', query: { slug } });
  if (publicRes.statusCode !== 404) throw new Error(`expected 404 after unpublish, got ${publicRes.statusCode}`);
  const listRes = await call(publicListHandler, { method: 'GET' });
  if (listRes._json.some((a) => a.slug === slug)) throw new Error('unpublished article still present in public list');
});

console.log('\n[real build] rebuilding after unpublish...');
await check('npm run build succeeds after unpublish', () => {
  buildOutput = execSync('npm run build', { cwd: process.cwd(), env: process.env, encoding: 'utf8', stdio: 'pipe' });
});

await check('[prerender] shell no longer generated for the now-unpublished article', () => {
  if (existsSync(`dist/newsroom/${slug}/index.html`)) throw new Error('prerendered shell still exists after unpublish');
});

await check('[sitemap] no longer contains the unpublished article route', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  if (sitemap.includes(`/newsroom/${slug}`)) throw new Error('sitemap still contains the unpublished article URL');
});

console.log('\nCleanup (removing disposable test rows/objects from RDS + S3):');
await check('delete real S3 objects', async () => {
  const client = getS3Client();
  const bucket = getNewsroomBucket();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: pdfS3Key }));
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: imageS3Key }));
});
await check('delete test article row', async () => {
  await getPool().query('DELETE FROM news_articles WHERE id = :id', { id: articleId });
  const [rows] = await getPool().query('SELECT * FROM news_articles WHERE id = :id', { id: articleId });
  if (rows.length !== 0) throw new Error('cleanup did not remove test row');
});

await getPool().end();
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
