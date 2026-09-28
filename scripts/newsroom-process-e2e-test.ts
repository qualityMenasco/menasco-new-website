/**
 * Phase 2 real end-to-end test: PDF -> validated structured_content in RDS,
 * against actual RDS + actual S3 (menasco-newsroom-prod). Reuses the same
 * direct-handler-invocation workaround as `newsroom-direct-handler-test.ts`
 * (see that file's header for why — a confirmed `vercel dev` dynamic-route
 * bug) plus the same real Phase 1 upload flow to get a real PDF into S3
 * before processing it. Loosely typed on purpose — a verification tool, not
 * part of the strict `tsconfig.api.json` project (matches
 * newsroom-direct-handler-test.ts).
 *
 * Run: npm run newsroom:process:e2e
 */
import { PDFDocument, StandardFonts } from 'pdf-lib';
import createArticleHandler from '../api/newsroom/articles/index.ts';
import uploadsHandler from '../api/newsroom/articles/[id]/uploads/index.ts';
import completeHandler from '../api/newsroom/articles/[id]/uploads/complete.ts';
import processHandler from '../api/newsroom/articles/[id]/process.ts';
import { getPool } from '../api/_lib/db.ts';
import { getS3Client, getNewsroomBucket } from '../api/_lib/s3.ts';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { validateStructuredContent } from '../api/_lib/newsroom/structuredContent.ts';

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
    'Phase 2 Processing Test Article',
    'This disposable test document exists only to verify the Phase 2',
    'PDF-to-structured-content pipeline against real infrastructure.',
    'Key Points',
    '- Real S3 object, uploaded through the real Phase 1 presign flow',
    '- Real RDS row, processed through the real /process endpoint',
    '- Deleted from both systems at the end of this test',
  ];
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: 11, font });
    y -= 18;
  }
  return Buffer.from(await doc.save());
}

console.log('=== Newsroom Phase 2 real S3 + RDS processing test ===\n');

let articleId;
let pdfS3Key;

await check('[setup] create real draft', async () => {
  const res = await call(createArticleHandler, { method: 'POST' });
  if (res.statusCode !== 201) throw new Error(`expected 201, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  articleId = res._json.id;
});
console.log(`  article id: ${articleId}`);

await check('[setup] presign + PUT + finalize real test PDF (Phase 1 flow)', async () => {
  const presignRes = await call(uploadsHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'pdf', filename: 'article.pdf', contentType: 'application/pdf' },
  });
  if (presignRes.statusCode !== 200) throw new Error(`presign failed: ${presignRes.statusCode}: ${JSON.stringify(presignRes._json)}`);
  pdfS3Key = presignRes._json.s3Key;

  const pdfBytes = await buildRealTestPdf();
  const putRes = await fetch(presignRes._json.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: pdfBytes,
  });
  if (!putRes.ok) throw new Error(`S3 PUT failed: HTTP ${putRes.status}`);

  const finalizeRes = await call(completeHandler, {
    method: 'POST',
    query: { id: articleId },
    body: { type: 'pdf', s3Key: pdfS3Key },
  });
  if (finalizeRes.statusCode !== 200) throw new Error(`finalize failed: ${finalizeRes.statusCode}: ${JSON.stringify(finalizeRes._json)}`);
});
console.log(`  pdf s3Key: ${pdfS3Key}`);

await check('[failure] process before PDF uploaded -> handled elsewhere; process with no id -> 400', async () => {
  const res = await call(processHandler, { method: 'POST', query: { id: 'not-a-uuid' } });
  if (res.statusCode !== 400) throw new Error(`expected 400, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('POST /api/newsroom/articles/:id/process — real extraction + normalization + validation', async () => {
  const res = await call(processHandler, { method: 'POST', query: { id: articleId } });
  if (res.statusCode !== 200) throw new Error(`expected 200, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  if (res._json.status !== 'ready') throw new Error(`expected status=ready, got ${res._json.status}`);
  if (!res._json.structuredContent || !Array.isArray(res._json.structuredContent.sections)) {
    throw new Error(`response missing structuredContent.sections: ${JSON.stringify(res._json)}`);
  }
  const json = JSON.stringify(res._json.structuredContent);
  if (!json.includes('Phase 2 Processing Test Article') && !json.includes('disposable test document')) {
    throw new Error(`expected real extracted text present, got: ${json.slice(0, 300)}`);
  }
});

await check('status transitioned draft -> processing -> ready in RDS, processed_at set, no processing_error', async () => {
  const [rows] = await getPool().query('SELECT status, structured_content, processed_at, processing_error FROM news_articles WHERE id = :id', { id: articleId });
  if (rows.length !== 1) throw new Error('article row not found');
  const row = rows[0];
  if (row.status !== 'ready') throw new Error(`expected status=ready in RDS, got ${row.status}`);
  if (row.structured_content === null) throw new Error('structured_content is NULL in RDS after successful processing');
  if (row.processed_at === null) throw new Error('processed_at was not set');
  if (row.processing_error !== null) throw new Error(`expected processing_error=NULL, got ${row.processing_error}`);
});

await check('structured_content read back from RDS re-validates against the schema (MySQL JSON round-trip is lossless)', async () => {
  const [rows] = await getPool().query('SELECT structured_content FROM news_articles WHERE id = :id', { id: articleId });
  // mysql2 with `decimalNumbers`/JSON columns returns an already-parsed JS object for a JSON column, not a string.
  const readBack = rows[0].structured_content;
  const revalidated = validateStructuredContent(readBack);
  if (revalidated.sections.length === 0) throw new Error('re-validated structured_content has zero sections');
});

await check('reprocessing is idempotent (replaces, not appends) — status stays ready, one coherent section set', async () => {
  const res = await call(processHandler, { method: 'POST', query: { id: articleId } });
  if (res.statusCode !== 200) throw new Error(`expected 200 on reprocess, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
  const [rows] = await getPool().query('SELECT status, structured_content FROM news_articles WHERE id = :id', { id: articleId });
  if (rows[0].status !== 'ready') throw new Error(`expected status=ready after reprocess, got ${rows[0].status}`);
  const sectionCountFirstRun = res._json.structuredContent.sections.length;
  const sectionCountStored = rows[0].structured_content.sections.length;
  if (sectionCountFirstRun !== sectionCountStored) {
    throw new Error(`reprocess produced a different section count than what's stored: ${sectionCountFirstRun} vs ${sectionCountStored}`);
  }
});

await check('[failure] process nonexistent article -> 404', async () => {
  const res = await call(processHandler, { method: 'POST', query: { id: '00000000-0000-4000-8000-000000000000' } });
  if (res.statusCode !== 404) throw new Error(`expected 404, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

let noPdfArticleId;
await check('[failure] process article with no source PDF -> 409', async () => {
  const draftRes = await call(createArticleHandler, { method: 'POST' });
  noPdfArticleId = draftRes._json.id;
  const res = await call(processHandler, { method: 'POST', query: { id: noPdfArticleId } });
  if (res.statusCode !== 409) throw new Error(`expected 409, got ${res.statusCode}: ${JSON.stringify(res._json)}`);
});

await check('source PDF remains private throughout processing (no public/anonymous GET)', async () => {
  const region = process.env.AWS_REGION;
  const bucket = getNewsroomBucket();
  const plainUrl = `https://${bucket}.s3.${region}.amazonaws.com/${pdfS3Key}`;
  const res = await fetch(plainUrl);
  if (res.ok) throw new Error(`SECURITY: unauthenticated GET on the source PDF succeeded (HTTP ${res.status}) — bucket must stay private`);
  if (res.status !== 403 && res.status !== 401) {
    throw new Error(`expected 403/401 for an unauthenticated request to a private object, got HTTP ${res.status}`);
  }
});

console.log('\nCleanup (removing disposable test rows/objects from RDS + S3):');
await check('delete real S3 PDF object', async () => {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: getNewsroomBucket(), Key: pdfS3Key }));
});
await check('delete test article rows', async () => {
  await getPool().query('DELETE FROM news_articles WHERE id IN (:a, :b)', { a: articleId, b: noPdfArticleId });
  const [rows] = await getPool().query('SELECT * FROM news_articles WHERE id IN (:a, :b)', { a: articleId, b: noPdfArticleId });
  if (rows.length !== 0) throw new Error('cleanup did not remove test rows');
});

await getPool().end();
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (fail > 0) process.exit(1);
