import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../../_lib/projectsAuth';
import { HttpError, requireIdParam, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { listProjectImages, getProjectRecordOrThrow } from '../../../../_lib/projects';
import { createPresignedGetUrl } from '../../../../_lib/s3';
import { isValidUuid } from '../../../../_lib/validation';

const PREVIEW_URL_EXPIRY_SECONDS = 5 * 60;

/**
 * GET /api/projects/:id/images/:imageId/preview-url — admin-only,
 * short-lived presigned GET for one image thumbnail, mirroring
 * api/newsroom/articles/[id]/images/[imageId]/preview-url.ts exactly.
 * Needed because the PUBLIC image proxy (api/projects/public/images/
 * [imageId].ts) requires the parent project to be `status = 'published'`
 * by design — a draft project's images would 404 there, so the admin
 * editor needs its own auth-gated (not publish-status-gated) preview path
 * to show thumbnails before a project is ever published.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, 'GET');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    await getProjectRecordOrThrow(id);

    const imageId = req.query.imageId;
    if (typeof imageId !== 'string' || !isValidUuid(imageId)) throw new HttpError(400, 'Invalid image id');

    const images = await listProjectImages(id);
    const image = images.find((img) => img.id === imageId);
    if (!image) throw new HttpError(404, 'Image not found on this project');

    const url = await createPresignedGetUrl(image.s3_key, PREVIEW_URL_EXPIRY_SECONDS);
    sendJson(res, 200, { url, expiresIn: PREVIEW_URL_EXPIRY_SECONDS });
  });
}
