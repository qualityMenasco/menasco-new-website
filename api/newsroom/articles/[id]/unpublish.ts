import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../_lib/auth';
import { HttpError, requireIdParam, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { getArticleImages, getArticleOrThrow, serializeArticle, unpublishArticle } from '../../../_lib/articles';
import { isValidUuid } from '../../../_lib/validation';

/**
 * POST /api/newsroom/articles/:id/unpublish — published -> ready. Content
 * is never deleted; only `status` changes and `published_at` is cleared
 * (see `unpublishArticle()`'s doc comment for why `published_at` is treated
 * as "non-NULL iff currently live" rather than a retained history field).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');

    await unpublishArticle(id);
    const article = await getArticleOrThrow(id);
    const images = await getArticleImages(id);
    sendJson(res, 200, serializeArticle(article, images));
  });
}
