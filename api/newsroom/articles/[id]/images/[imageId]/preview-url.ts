import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../../../_lib/auth';
import { HttpError, requireIdParam, requireMethod, sendJson, withErrorHandling } from '../../../../../_lib/http';
import { getArticleImages, getArticleOrThrow } from '../../../../../_lib/articles';
import { createPresignedGetUrl } from '../../../../../_lib/s3';
import { isValidUuid } from '../../../../../_lib/validation';

const PREVIEW_URL_EXPIRY_SECONDS = 5 * 60;

/** GET /api/newsroom/articles/:id/images/:imageId/preview-url — short-lived presigned GET for one image thumbnail, same pattern/expiry as the source PDF preview. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, 'GET');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');
    await getArticleOrThrow(id);

    const imageId = req.query.imageId;
    if (typeof imageId !== 'string' || !isValidUuid(imageId)) throw new HttpError(400, 'Invalid image id');

    const images = await getArticleImages(id);
    const image = images.find((img) => img.id === imageId);
    if (!image) throw new HttpError(404, 'Image not found on this article');

    const url = await createPresignedGetUrl(image.s3_key, PREVIEW_URL_EXPIRY_SECONDS);
    sendJson(res, 200, { url, expiresIn: PREVIEW_URL_EXPIRY_SECONDS });
  });
}
