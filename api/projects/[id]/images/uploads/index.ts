import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../../_lib/projectsAuth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { getProjectRecordOrThrow } from '../../../../_lib/projects';
import { createPresignedPutUrl } from '../../../../_lib/s3';
import { buildProjectImageKey } from '../../../../_lib/projectS3Keys';
import { PRESIGNED_URL_EXPIRY_SECONDS, isAllowedImageContentType, isValidPosition, isValidUuid } from '../../../../_lib/validation';

/**
 * POST /api/projects/:id/images/uploads — issue a short-lived presigned S3
 * PUT URL under projects/images/<project-id>/. Mirrors
 * api/newsroom/articles/[id]/uploads/index.ts's image branch exactly
 * (image-only here — Projects has no PDF/source-document concept).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    await getProjectRecordOrThrow(id);

    const body = requireJsonBody(req);
    if (!isAllowedImageContentType(body.contentType)) {
      throw new HttpError(400, 'contentType must be one of image/jpeg, image/png, image/webp');
    }
    if (!isValidPosition(body.position)) {
      throw new HttpError(400, 'position must be a non-negative integer');
    }

    const s3Key = buildProjectImageKey(id, body.contentType);
    const uploadUrl = await createPresignedPutUrl(s3Key, body.contentType, PRESIGNED_URL_EXPIRY_SECONDS);
    sendJson(res, 200, { uploadUrl, s3Key, expiresIn: PRESIGNED_URL_EXPIRY_SECONDS });
  });
}
