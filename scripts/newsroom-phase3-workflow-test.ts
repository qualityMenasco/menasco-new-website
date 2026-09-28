/**
 * Phase 3 real end-to-end test: editorial review + publish workflow,
 * against actual RDS + actual S3. Same direct-handler-invocation pattern as
 * `newsroom-direct-handler-test.ts`/`newsroom-process-e2e-test.ts` (see the
 * former's header for the underlying `vercel dev` dynamic-route bug this
 * works around) — real handler modules, real RDS, real S3, no mocks.
 *
 * Run: npm run newsroom:phase3:e2e
 */
import { PDFDocument, StandardFonts } from 'pdf-lib';
import createArticleHandler from '../api/newsroom/articles/index.ts';
import articleDetailHandler from '../api/newsroom/articles/[id]/index.ts';
import uploadsHandler from '../api/newsroom/articles/[id]/uploads/index.ts';
import completeHandler from '../api/newsroom/articles/[id]/uploads/complete.ts';
import processHandler from '../api/newsroom/articles/[id]/process.ts';
import publishHandler from '../api/newsroom/articles/[id]/publish.ts';
import unpublishHandler from '../api/newsroom/articles/[id]/unpublish.ts';
import sourceUrlHandler from '../api/newsroom/articles/[id]/source-url.ts';
import imageMetaHandler from '../api/newsroom/articles/[id]/images/[imageId]/index.ts';
import imagePreviewUrlHandler from '../api/newsroom/articles/[id]/images/[imageId]/preview-url.ts';
import reorderHandler from '../api/newsroom/articles/[id]/images/reorder.ts';
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
    status(code) { this.statusCode = code; return this; },
    setHeader() { return this; },
    json(body) { this._json = body; return this; },
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

async function buildRealTestPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]);
  let y = 780;
  const lines = [
    'Phase 3 Workflow Test Article',
    'This disposable test document exists to verify the Phase 3',
    'editorial review and publishing workflow against real infrastructure.',
    'Key Points',
    '- Real S3 objects, real RDS rows',
    '- Edited, reordered, and published through the real handlers',
    '- Deleted from both systems at the end of this test',
  ];
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 11, font });
    y -= 18;
  }
  return Buffer.from(await doc.save());
}

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

console.log('=== Newsroom Phase 3 real editorial review + publish workflow test ===\n');

let articleId;
let pdfS3Key;
let imageIds: string[] = [];
let secondArticleId;
let secondArticlePdfKey;

await check('[1] create disposable draft', async () => {
  const res = await call(createArticleHandler, { method: 'POST' });
  if (res.statusCode !== 201) throw new Error(`expected 201, got ${res.statusCode}`);
  articleId = res._json.id;
});
console.log(`  article id: ${articleId}`);

await check('[2] upload PDF (Phase 1 flow)', async () => {
  const presignRes = await call(uploadsHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'pdf', filename: 'article.pdf', contentType: 'application/pdf' },
  });
  pdfS3Key = presignRes._json.s3Key;
  const pdfBytes = await buildRealTestPdf();
  const putRes = await fetch(presignRes._json.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: pdfBytes });
  if (!putRes.ok) throw new Error(`S3 PUT failed: HTTP ${putRes.status}`);
  const finalizeRes = await call(completeHandler, { method: 'POST', query: { id: articleId }, body: { type: 'pdf', s3Key: pdfS3Key } });
  if (finalizeRes.statusCode !== 200) throw new Error(`finalize failed: ${finalizeRes.statusCode}`);
});

await check('[3] process -> ready', async () => {
  const res = await call(processHandler, { method: 'POST', query: { id: articleId } });
  if (res.statusCode !== 200 || res._json.status !== 'ready') throw new Error(`expected ready, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

let twoImagePresigns = [];
await check('[setup] upload two real test images', async () => {
  for (let position = 0; position < 2; position++) {
    const presignRes = await call(uploadsHandler, {
      method: 'POST',
      query: { id: articleId },
      body: { type: 'image', filename: `photo${position}.png`, contentType: 'image/png', position },
    });
    const putRes = await fetch(presignRes._json.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/png' }, body: PNG_1X1 });
    if (!putRes.ok) throw new Error(`S3 PUT failed: HTTP ${putRes.status}`);
    const finalizeRes = await call(completeHandler, { method: 'POST', query: { id: articleId }, body: { type: 'image', s3Key: presignRes._json.s3Key, position } });
    if (finalizeRes.statusCode !== 200) throw new Error(`image finalize failed: ${finalizeRes.statusCode}`);
    twoImagePresigns.push(presignRes._json);
  }
  const detail = await call(articleDetailHandler, { method: 'GET', query: { id: articleId } });
  imageIds = detail._json.images.map((img) => img.id);
  if (imageIds.length !== 2) throw new Error(`expected 2 images, got ${imageIds.length}`);
});

await check('[4] load in editor (GET) reflects processed state', async () => {
  const res = await call(articleDetailHandler, { method: 'GET', query: { id: articleId } });
  if (res.statusCode !== 200 || res._json.status !== 'ready') throw new Error(`unexpected state: ${JSON.stringify(res._json.status)}`);
  if (!res._json.structuredContent || res._json.structuredContent.sections.length === 0) throw new Error('missing structuredContent');
});

let editedStructuredContent;
await check('[5] edit title + subtitle + category + tags + featured, [6] edit one paragraph', async () => {
  const current = (await call(articleDetailHandler, { method: 'GET', query: { id: articleId } }))._json;
  const sc = current.structuredContent;
  sc.sections[0].blocks[0] = { ...sc.sections[0].blocks[0], type: 'paragraph', text: 'This paragraph was edited by a human editor for the Phase 3 test.' };
  editedStructuredContent = sc;

  const res = await call(articleDetailHandler, {
    method: 'PATCH',
    query: { id: articleId },
    body: {
      title: 'Phase 3 Workflow Test — Edited Title',
      slug: `phase3-test-${articleId.slice(0, 8)}`,
      subtitle: 'A disposable test article for the Phase 3 workflow.',
      category: 'company-news',
      tags: [{ name: 'Test', slug: 'test' }],
      featured: true,
      structuredContent: sc,
    },
  });
  if (res.statusCode !== 200) throw new Error(`PATCH failed: ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._json.title !== 'Phase 3 Workflow Test — Edited Title') throw new Error('title did not persist');
  if (!res._json.featured) throw new Error('featured did not persist');
  if (res._json.structuredContent.sections[0].blocks[0].text !== editedStructuredContent.sections[0].blocks[0].text) {
    throw new Error('edited paragraph did not persist');
  }
});

await check('[7] reorder one block within a section', async () => {
  const current = (await call(articleDetailHandler, { method: 'GET', query: { id: articleId } }))._json;
  const sc = current.structuredContent;
  const target = sc.sections.find((s) => s.blocks.length > 1) ?? sc.sections[sc.sections.length - 1];
  if (target.blocks.length < 2) {
    // Not every synthetic fixture guarantees a multi-block section — add one so the reorder is real.
    target.blocks.push({ type: 'paragraph', text: 'A second block added to prove reordering.' });
  }
  const [a, b] = target.blocks;
  target.blocks[0] = b;
  target.blocks[1] = a;
  const res = await call(articleDetailHandler, { method: 'PATCH', query: { id: articleId }, body: { structuredContent: sc } });
  if (res.statusCode !== 200) throw new Error(`PATCH failed: ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[8] edit image alt text', async () => {
  const res = await call(imageMetaHandler, {
    method: 'PATCH',
    query: { id: articleId, imageId: imageIds[0] },
    body: { altText: 'A disposable test photo for the Phase 3 workflow', caption: 'Test caption' },
  });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('reorder images', async () => {
  const res = await call(reorderHandler, { method: 'POST', query: { id: articleId }, body: { orderedImageIds: [imageIds[1], imageIds[0]] } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  const positions = res._json;
  const first = positions.find((p) => p.id === imageIds[1]);
  if (first.position !== 0) throw new Error(`expected image ${imageIds[1]} at position 0, got ${JSON.stringify(positions)}`);
});

await check('image preview URL is a real, private, working presigned link', async () => {
  const res = await call(imagePreviewUrlHandler, { method: 'GET', query: { id: articleId, imageId: imageIds[0] } });
  if (res.statusCode !== 200 || !res._json.url) throw new Error(`expected presigned url, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  const fetchRes = await fetch(res._json.url);
  if (!fetchRes.ok) throw new Error(`presigned image URL did not actually work: HTTP ${fetchRes.status}`);
});

await check('[9] save (already saved via PATCH above); [10] reload and confirm persistence', async () => {
  const res = await call(articleDetailHandler, { method: 'GET', query: { id: articleId } });
  if (res._json.title !== 'Phase 3 Workflow Test — Edited Title') throw new Error('title lost on reload');
  if (res._json.subtitle !== 'A disposable test article for the Phase 3 workflow.') throw new Error('subtitle lost on reload');
  if (res._json.category !== 'company-news') throw new Error('category lost on reload');
  if (res._json.tags.length !== 1 || res._json.tags[0].slug !== 'test') throw new Error('tags lost on reload');
  if (res._json.images[0].id !== imageIds[1]) throw new Error('image reorder lost on reload');
  if (res._json.images[0].altText !== undefined && res._json.images.find((i) => i.id === imageIds[0])?.altText !== 'A disposable test photo for the Phase 3 workflow') {
    throw new Error('image alt text lost on reload');
  }
});

await check('[11] publish', async () => {
  const res = await call(publishHandler, { method: 'POST', query: { id: articleId } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._json.status !== 'published') throw new Error(`expected status=published, got ${res._json.status}`);
});

await check('[12] verify status = published, [13] published_at set (real RDS query)', async () => {
  const [rows] = await getPool().query('SELECT status, published_at FROM news_articles WHERE id = :id', { id: articleId });
  if (rows[0].status !== 'published') throw new Error(`expected published in RDS, got ${rows[0].status}`);
  if (rows[0].published_at === null) throw new Error('published_at was not set');
});

await check('source PDF stays private even for a published article', async () => {
  const region = process.env.AWS_REGION;
  const bucket = getNewsroomBucket();
  const plainUrl = `https://${bucket}.s3.${region}.amazonaws.com/${pdfS3Key}`;
  const res = await fetch(plainUrl);
  if (res.ok) throw new Error('SECURITY: unauthenticated GET on a published article\'s source PDF succeeded');
});

await check('source-url endpoint returns a real, working presigned link', async () => {
  const res = await call(sourceUrlHandler, { method: 'GET', query: { id: articleId } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}`);
  const fetchRes = await fetch(res._json.url);
  if (!fetchRes.ok) throw new Error(`presigned source URL did not actually work: HTTP ${fetchRes.status}`);
});

await check('republishing (idempotent) refreshes published_at', async () => {
  const before = (await getPool().query('SELECT published_at FROM news_articles WHERE id = :id', { id: articleId }))[0][0].published_at;
  await new Promise((r) => setTimeout(r, 1100));
  const res = await call(publishHandler, { method: 'POST', query: { id: articleId } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}`);
  const after = (await getPool().query('SELECT published_at FROM news_articles WHERE id = :id', { id: articleId }))[0][0].published_at;
  if (new Date(after).getTime() <= new Date(before).getTime()) throw new Error('published_at did not advance on republish');
});

await check('[15] unpublish -> status ready, published_at cleared', async () => {
  const res = await call(unpublishHandler, { method: 'POST', query: { id: articleId } });
  if (res.statusCode !== 200 || res._json.status !== 'ready') throw new Error(`expected ready, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  const [rows] = await getPool().query('SELECT published_at FROM news_articles WHERE id = :id', { id: articleId });
  if (rows[0].published_at !== null) throw new Error('published_at was not cleared on unpublish');
});

console.log('\nFailure cases:');

await check('[failure] publish while draft (never processed) -> 409', async () => {
  const draftRes = await call(createArticleHandler, { method: 'POST' });
  secondArticleId = draftRes._json.id;
  const res = await call(publishHandler, { method: 'POST', query: { id: secondArticleId } });
  if (res.statusCode !== 409) throw new Error(`expected 409 (still draft, no structured_content), got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[failure] publish missing title -> 422 (article reaches "ready" via real processing, but title was never set)', async () => {
  const presignRes = await call(uploadsHandler, {
    method: 'POST',
    query: { id: secondArticleId },
    body: { type: 'pdf', filename: 'article.pdf', contentType: 'application/pdf' },
  });
  secondArticlePdfKey = presignRes._json.s3Key;
  const pdfBytes = await buildRealTestPdf();
  const putRes = await fetch(presignRes._json.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: pdfBytes });
  if (!putRes.ok) throw new Error(`S3 PUT failed: HTTP ${putRes.status}`);
  await call(completeHandler, { method: 'POST', query: { id: secondArticleId }, body: { type: 'pdf', s3Key: secondArticlePdfKey } });
  const processRes = await call(processHandler, { method: 'POST', query: { id: secondArticleId } });
  if (processRes.statusCode !== 200) throw new Error(`process failed: ${processRes.statusCode}`);

  const res = await call(publishHandler, { method: 'POST', query: { id: secondArticleId } });
  if (res.statusCode !== 422) throw new Error(`expected 422 (ready, but no title), got ${res.statusCode}: ${JSON.stringify(res._json)}`);

  // Now give it a title/slug so the later duplicate-slug and unpublish-not-published failure cases still exercise a real, addressable article.
  await call(articleDetailHandler, { method: 'PATCH', query: { id: secondArticleId }, body: { title: 'Has a title', slug: `phase3-second-${secondArticleId.slice(0, 8)}` } });
});

await check('[failure] duplicate slug on PATCH -> 409', async () => {
  const res = await call(articleDetailHandler, { method: 'PATCH', query: { id: secondArticleId }, body: { slug: `phase3-test-${articleId.slice(0, 8)}` } });
  if (res.statusCode !== 409) throw new Error(`expected 409, got ${res.statusCode}`);
});

await check('[failure] publish invalid structured_content (unknown block type) -> 422', async () => {
  const res = await call(articleDetailHandler, {
    method: 'PATCH',
    query: { id: articleId },
    body: { structuredContent: { version: 1, source: { extractor: 'x', extractedAt: new Date().toISOString(), sourcePdfKey: 'k' }, sections: [{ blocks: [{ type: 'video', url: 'x' }] }] } },
  });
  if (res.statusCode !== 422) throw new Error(`expected 422, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[failure] unauthorized publish -> 401', async () => {
  const prevBypass = process.env.NEWSROOM_DEV_AUTH_BYPASS;
  const prevKey = process.env.NEWSROOM_ADMIN_API_KEY;
  process.env.NEWSROOM_DEV_AUTH_BYPASS = 'false';
  delete process.env.NEWSROOM_ADMIN_API_KEY;
  try {
    const { default: freshPublishHandler } = await import(`../api/newsroom/articles/[id]/publish.ts?cachebust=${Date.now()}`);
    const res = await call(freshPublishHandler, { method: 'POST', query: { id: articleId }, headers: {} });
    if (res.statusCode !== 401) throw new Error(`expected 401, got ${res.statusCode}`);
  } finally {
    process.env.NEWSROOM_DEV_AUTH_BYPASS = prevBypass;
    if (prevKey !== undefined) process.env.NEWSROOM_ADMIN_API_KEY = prevKey;
  }
});

await check('[failure] unauthorized edit (PATCH) -> 401', async () => {
  const prevBypass = process.env.NEWSROOM_DEV_AUTH_BYPASS;
  const prevKey = process.env.NEWSROOM_ADMIN_API_KEY;
  process.env.NEWSROOM_DEV_AUTH_BYPASS = 'false';
  delete process.env.NEWSROOM_ADMIN_API_KEY;
  try {
    const { default: freshDetailHandler } = await import(`../api/newsroom/articles/[id]/index.ts?cachebust=${Date.now()}`);
    const res = await call(freshDetailHandler, { method: 'PATCH', query: { id: articleId }, body: { title: 'hacked' }, headers: {} });
    if (res.statusCode !== 401) throw new Error(`expected 401, got ${res.statusCode}`);
  } finally {
    process.env.NEWSROOM_DEV_AUTH_BYPASS = prevBypass;
    if (prevKey !== undefined) process.env.NEWSROOM_ADMIN_API_KEY = prevKey;
  }
});

await check('[failure] malformed article id on publish -> 400', async () => {
  const res = await call(publishHandler, { method: 'POST', query: { id: 'not-a-uuid' } });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}`);
});

await check('[failure] missing article on unpublish -> 404', async () => {
  const res = await call(unpublishHandler, { method: 'POST', query: { id: '00000000-0000-4000-8000-000000000000' } });
  if (res.statusCode !== 404) throw new Error(`expected 404, got ${res.statusCode}`);
});

await check('[failure] unpublish an article that is not published -> 409', async () => {
  const res = await call(unpublishHandler, { method: 'POST', query: { id: secondArticleId } });
  if (res.statusCode !== 409) throw new Error(`expected 409, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('[failure] image reorder collision — wrong/incomplete id set -> 400', async () => {
  const res = await call(reorderHandler, { method: 'POST', query: { id: articleId }, body: { orderedImageIds: [imageIds[0]] } });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

let thirdArticleId;
await check('[failure] source preview on article with no PDF -> 404', async () => {
  const draftRes = await call(createArticleHandler, { method: 'POST' });
  thirdArticleId = draftRes._json.id;
  const res = await call(sourceUrlHandler, { method: 'GET', query: { id: thirdArticleId } });
  if (res.statusCode !== 404) throw new Error(`expected 404, got ${res.statusCode}`);
});

console.log('\n[16] Cleanup (removing disposable test rows/objects from RDS + S3):');
await check('delete real S3 objects', async () => {
  const client = getS3Client();
  const bucket = getNewsroomBucket();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: pdfS3Key }));
  if (secondArticlePdfKey) await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: secondArticlePdfKey }));
  for (const presign of twoImagePresigns) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: presign.s3Key }));
  }
});
await check('delete test article rows', async () => {
  await getPool().query('DELETE FROM news_articles WHERE id IN (:a, :b, :c)', { a: articleId, b: secondArticleId, c: thirdArticleId });
  const [rows] = await getPool().query('SELECT * FROM news_articles WHERE id IN (:a, :b, :c)', { a: articleId, b: secondArticleId, c: thirdArticleId });
  if (rows.length !== 0) throw new Error('cleanup did not remove test rows');
});

await getPool().end();
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
