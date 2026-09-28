import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../../_lib/auth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { getArticleImages, getArticleOrThrow, reorderArticleImages } from '../../../../_lib/articles';
import { isValidUuid } from '../../../../_lib/validation';

/**
 * POST /api/newsroom/articles/:id/images/reorder — body: `{ orderedImageIds: string[] }`,
 * the full new order for every image on this article. See
 * `reorderArticleImages()` for why this must be all-or-nothing (a partial
 * reorder can't be expressed against a unique `(article_id, position)`
 * index without a real risk of silently losing/duplicating a position).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');
    await getArticleOrThrow(id);

    const body = requireJsonBody(req);
    const orderedImageIds = body.orderedImageIds;
    if (!Array.isArray(orderedImageIds) || orderedImageIds.length === 0 || !orderedImageIds.every((v) => typeof v === 'string' && isValidUuid(v))) {
      throw new HttpError(400, 'orderedImageIds must be a non-empty array of image ids');
    }

    await reorderArticleImages(id, orderedImageIds as string[]);
    const images = await getArticleImages(id);
    sendJson(
      res,
      200,
      images.map((image) => ({ id: image.id, position: image.position })),
    );
  });
}
