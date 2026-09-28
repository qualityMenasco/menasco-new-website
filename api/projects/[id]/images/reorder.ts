import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../_lib/projectsAuth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { getProjectRecordOrThrow, listProjectImages, reorderProjectImages } from '../../../_lib/projects';
import { isValidUuid } from '../../../_lib/validation';

/** POST /api/projects/:id/images/reorder — body: { orderedImageIds: string[] }. Must list exactly the project's current image ids, each once. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    await getProjectRecordOrThrow(id);

    const body = requireJsonBody(req);
    const orderedImageIds = body.orderedImageIds;
    if (!Array.isArray(orderedImageIds) || orderedImageIds.some((v) => typeof v !== 'string')) {
      throw new HttpError(400, 'orderedImageIds must be an array of image ids');
    }

    await reorderProjectImages(id, orderedImageIds as string[]);
    const images = await listProjectImages(id);
    sendJson(
      res,
      200,
      images.map((image) => ({ id: image.id, s3Key: image.s3_key, position: image.position, altText: image.alt_text, caption: image.caption, isPrimary: Boolean(image.is_primary) })),
    );
  });
}
