/**
 * Real end-to-end test of the Phase 1 Newsroom API flow — create draft ->
 * presign PDF -> PUT PDF -> finalize -> presign image -> PUT image ->
 * finalize -> GET article -> assert RDS/S3 state, then a battery of
 * failure-case checks (invalid id, wrong MIME, bad position, finalize
 * before upload, duplicate finalize, unauthorized).
 *
 * This talks to a REAL running API (`vercel dev`) backed by the REAL RDS
 * instance and S3 bucket — it cannot be run from an environment without
 * network access to both, which is why this ships as a script for you to
 * run locally rather than something executed automatically.
 *
 * Usage:
 *   npm run vercel:dev              # in one terminal
 *   npm run newsroom:e2e            # in another, once vercel dev is up
 *
 * Reads from .env.local (via `node --env-file`, wired in package.json):
 *   NEWSROOM_ADMIN_API_KEY   — required, must match what vercel dev sees
 *   NEWSROOM_API_BASE_URL    — optional, defaults to http://localhost:3000
 */

const BASE_URL = process.env.NEWSROOM_API_BASE_URL ?? 'http://localhost:3000';
const ADMIN_KEY = process.env.NEWSROOM_ADMIN_API_KEY;

if (!ADMIN_KEY) {
  console.error('NEWSROOM_ADMIN_API_KEY is required in .env.local to run this test.');
  process.exit(1);
}

// A minimal but genuinely valid PDF (parses as application/pdf).
const MINIMAL_PDF = Buffer.from(
  '%PDF-1.4\n' +
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n' +
    'xref\n0 4\n0000000000 65535 f \n' +
    'trailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF',
  'utf8',
);

// A minimal valid 1x1 JPEG.
const MINIMAL_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  'base64',
);

interface CreateResponse {
  id: string;
  status: string;
  createdAt: string;
}
interface PresignResponse {
  uploadUrl: string;
  s3Key: string;
  expiresIn: number;
}
interface ArticleDetailResponse {
  id: string;
  status: string;
  sourcePdf: { s3Key: string } | null;
  images: { id: string; s3Key: string; position: number }[];
}

let passed = 0;
let failed = 0;

async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  process.stdout.write(`- ${name} ... `);
  try {
    const result = await fn();
    console.log('OK');
    passed += 1;
    return result;
  } catch (err) {
    console.log('FAILED');
    console.error(`  ${(err as Error).message}`);
    failed += 1;
    throw err;
  }
}

async function expectFailure(name: string, fn: () => Promise<unknown>, expectedStatus: number): Promise<void> {
  process.stdout.write(`- [failure case] ${name} ... `);
  try {
    const res = await fn();
    const status = (res as Response).status;
    if (status === expectedStatus) {
      console.log(`OK (got expected ${status})`);
      passed += 1;
    } else {
      console.log(`FAILED (expected ${expectedStatus}, got ${status})`);
      failed += 1;
    }
  } catch (err) {
    console.log('FAILED (threw instead of returning a response)');
    console.error(`  ${(err as Error).message}`);
    failed += 1;
  }
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { 'x-newsroom-admin-key': ADMIN_KEY as string, ...extra };
}

async function main() {
  console.log(`Newsroom Phase 1 E2E test against ${BASE_URL}\n`);

  // --- Happy path -----------------------------------------------------
  const article = await step('create draft article', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
    });
    if (res.status !== 201) throw new Error(`expected 201, got ${res.status}: ${await res.text()}`);
    return (await res.json()) as CreateResponse;
  });
  console.log(`  article id: ${article.id}`);

  const pdfPresign = await step('request PDF presigned upload', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ type: 'pdf', filename: 'article.pdf', contentType: 'application/pdf' }),
    });
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}: ${await res.text()}`);
    return (await res.json()) as PresignResponse;
  });
  console.log(`  s3Key: ${pdfPresign.s3Key}`);

  await step('PUT test PDF to presigned URL', async () => {
    const res = await fetch(pdfPresign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: MINIMAL_PDF,
    });
    if (!res.ok) throw new Error(`S3 PUT failed: ${res.status} ${await res.text()}`);
  });

  await step('finalize PDF upload', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads/complete`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ type: 'pdf', s3Key: pdfPresign.s3Key }),
    });
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}: ${await res.text()}`);
  });

  const imagePresign = await step('request image presigned upload (position 0)', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ type: 'image', filename: 'hero.jpg', contentType: 'image/jpeg', position: 0 }),
    });
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}: ${await res.text()}`);
    return (await res.json()) as PresignResponse;
  });
  console.log(`  s3Key: ${imagePresign.s3Key}`);

  await step('PUT test image to presigned URL', async () => {
    const res = await fetch(imagePresign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: MINIMAL_JPEG,
    });
    if (!res.ok) throw new Error(`S3 PUT failed: ${res.status} ${await res.text()}`);
  });

  await step('finalize image upload', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads/complete`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ type: 'image', s3Key: imagePresign.s3Key, position: 0, altText: 'Test image' }),
    });
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}: ${await res.text()}`);
  });

  await step('GET article and verify persisted state', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles/${article.id}`, {
      headers: authHeaders(),
    });
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}: ${await res.text()}`);
    const body = (await res.json()) as ArticleDetailResponse;
    if (body.sourcePdf?.s3Key !== pdfPresign.s3Key) throw new Error('source_pdf_s3_key not persisted correctly');
    if (!Array.isArray(body.images) || body.images.length !== 1) throw new Error('expected exactly one image row');
    if (body.images[0].s3Key !== imagePresign.s3Key || body.images[0].position !== 0) {
      throw new Error('image row does not match what was finalized');
    }
    console.log(`  status=${body.status} sourcePdf.s3Key=${body.sourcePdf.s3Key} images=${body.images.length}`);
  });

  await step('duplicate finalize is idempotent (no duplicate image row)', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads/complete`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ type: 'image', s3Key: imagePresign.s3Key, position: 0, altText: 'Test image (retry)' }),
    });
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
    const check = await fetch(`${BASE_URL}/api/newsroom/articles/${article.id}`, { headers: authHeaders() });
    const body = (await check.json()) as ArticleDetailResponse;
    if (body.images.length !== 1) throw new Error(`expected still exactly 1 image row, got ${body.images.length}`);
  });

  await step('PATCH title/slug', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles/${article.id}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ title: 'E2E Test Article', slug: `e2e-test-${article.id.slice(0, 8)}` }),
    });
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}: ${await res.text()}`);
  });

  // --- Failure cases ----------------------------------------------------
  console.log('\nFailure cases:');

  await expectFailure(
    'nonexistent article id (valid UUID shape)',
    () => fetch(`${BASE_URL}/api/newsroom/articles/00000000-0000-4000-8000-000000000000`, { headers: authHeaders() }),
    404,
  );

  await expectFailure(
    'malformed article id',
    () => fetch(`${BASE_URL}/api/newsroom/articles/not-a-uuid`, { headers: authHeaders() }),
    400,
  );

  await expectFailure(
    'unauthorized request (no key)',
    () => fetch(`${BASE_URL}/api/newsroom/articles/${article.id}`),
    401,
  );

  await expectFailure(
    'unauthorized request (wrong key)',
    () => fetch(`${BASE_URL}/api/newsroom/articles/${article.id}`, { headers: { 'x-newsroom-admin-key': 'wrong-key' } }),
    401,
  );

  await expectFailure(
    'unsupported MIME type for image presign',
    () =>
      fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ type: 'image', filename: 'x.gif', contentType: 'image/gif', position: 1 }),
      }),
    400,
  );

  await expectFailure(
    'invalid image position (negative)',
    () =>
      fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ type: 'image', filename: 'x.jpg', contentType: 'image/jpeg', position: -1 }),
      }),
    400,
  );

  await expectFailure(
    'finalize before any upload exists (unused position)',
    () =>
      fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads/complete`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          type: 'image',
          s3Key: `newsroom/articles/${article.id}/images/never-uploaded.jpg`,
          position: 5,
        }),
      }),
    409,
  );

  await expectFailure(
    'finalize with an s3Key outside this article prefix',
    () =>
      fetch(`${BASE_URL}/api/newsroom/articles/${article.id}/uploads/complete`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ type: 'pdf', s3Key: 'newsroom/articles/someone-elses-article/source/article.pdf' }),
      }),
    400,
  );

  // Duplicate slug: create a second draft and try to PATCH it to the same
  // slug the first article already has.
  await step('create second draft for duplicate-slug check', async () => {
    const res = await fetch(`${BASE_URL}/api/newsroom/articles`, { method: 'POST', headers: authHeaders() });
    if (res.status !== 201) throw new Error(`expected 201, got ${res.status}`);
    const second = (await res.json()) as CreateResponse;
    (globalThis as { __secondArticleId?: string }).__secondArticleId = second.id;
  });
  const secondId = (globalThis as { __secondArticleId?: string }).__secondArticleId as string;

  await expectFailure(
    'duplicate slug on PATCH',
    () =>
      fetch(`${BASE_URL}/api/newsroom/articles/${secondId}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ slug: `e2e-test-${article.id.slice(0, 8)}` }),
      }),
    409,
  );

  console.log(`\n${passed} passed, ${failed} failed.`);
  console.log(`\nTest article id (source PDF + 1 image, real S3 objects): ${article.id}`);
  console.log(`Second (duplicate-slug) draft article id: ${secondId}`);
  console.log('Delete these manually from menasco_newsroom / S3 if you want to clean up test data.');

  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('\nE2E test crashed:', err);
  process.exitCode = 1;
});
