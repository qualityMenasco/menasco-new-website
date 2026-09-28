import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../_lib/auth';
import { HttpError, requireIdParam, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { getArticleOrThrow } from '../../../_lib/articles';
import { createPresignedGetUrl } from '../../../_lib/s3';
import { isValidUuid } from '../../../_lib/validation';

/** Short-lived internal-preview link — long enough for an editor to open and read the PDF, short enough that a leaked URL is useless shortly after. Not a "download forever" link. */
const PREVIEW_URL_EXPIRY_SECONDS = 5 * 60;

/**
 * GET /api/newsroom/articles/:id/source-url — a short-lived presigned GET
 * URL for the article's private source PDF, for internal editorial review
 * only. Never persisted anywhere (computed fresh on every call, same
 * pattern as the Phase 1 presigned PUT) and never makes the object public —
 * the bucket's Block Public Access setting is untouched.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, 'GET');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');

    const article = await getArticleOrThrow(id);
    if (!article.source_pdf_s3_key) throw new HttpError(404, 'This article has no source PDF uploaded');

    const url = await createPresignedGetUrl(article.source_pdf_s3_key, PREVIEW_URL_EXPIRY_SECONDS);
    sendJson(res, 200, { url, expiresIn: PREVIEW_URL_EXPIRY_SECONDS });
  });
}
