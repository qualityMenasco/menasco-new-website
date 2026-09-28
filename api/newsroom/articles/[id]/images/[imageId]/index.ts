import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../../../_lib/auth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../../../_lib/http';
import { getArticleOrThrow, updateArticleImageMeta, type ArticleImageMetaUpdate } from '../../../../../_lib/articles';
import { isValidUuid } from '../../../../../_lib/validation';

/**
 * PATCH /api/newsroom/articles/:id/images/:imageId — edit alt text/caption
 * only (never `s3_key`/`position` — see `updateArticleImageMeta`'s doc
 * comment). Scoped to the parent article id so an editor's request can
 * never touch an image belonging to a different article.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, 'PATCH');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');
    await getArticleOrThrow(id);

    const imageId = req.query.imageId;
    if (typeof imageId !== 'string' || !isValidUuid(imageId)) throw new HttpError(400, 'Invalid image id');

    const body = requireJsonBody(req);
    const update: ArticleImageMetaUpdate = {};

    if ('altText' in body) {
      if (body.altText !== null && typeof body.altText !== 'string') throw new HttpError(400, 'altText must be a string or null');
      update.altText = body.altText === null ? null : (body.altText as string).trim();
    }
    if ('caption' in body) {
      if (body.caption !== null && typeof body.caption !== 'string') throw new HttpError(400, 'caption must be a string or null');
      update.caption = body.caption === null ? null : (body.caption as string).trim();
    }

    await updateArticleImageMeta(id, imageId, update);
    sendJson(res, 200, { id: imageId, ...update });
  });
}
