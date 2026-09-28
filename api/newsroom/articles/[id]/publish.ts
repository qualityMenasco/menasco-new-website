import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../_lib/auth';
import { HttpError, requireIdParam, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { getArticleImages, getArticleOrThrow, publishArticle, serializeArticle } from '../../../_lib/articles';
import { isValidUuid } from '../../../_lib/validation';

/**
 * POST /api/newsroom/articles/:id/publish — explicit, human-triggered
 * publish action. Never called automatically by processing or by an
 * ordinary metadata save (see processArticle.ts and [id]/index.ts — neither
 * touches `status` toward `published`). All requirement-checking lives in
 * `publishArticle()` itself (title/slug/structured_content present, status
 * already `ready` or `published`) so it can never be bypassed by a future
 * second caller of that function.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');

    await publishArticle(id);
    const article = await getArticleOrThrow(id);
    const images = await getArticleImages(id);
    sendJson(res, 200, serializeArticle(article, images));
  });
}
