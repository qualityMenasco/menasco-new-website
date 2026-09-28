import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../../_lib/auth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { getArticleOrThrow } from '../../../../_lib/articles';
import { createPresignedPutUrl } from '../../../../_lib/s3';
import { buildImageKey, buildPdfKey } from '../../../../_lib/s3Keys';
import { PDF_CONTENT_TYPE, PRESIGNED_URL_EXPIRY_SECONDS, isAllowedImageContentType, isValidPosition, isValidUuid } from '../../../../_lib/validation';

/**
 * POST /api/newsroom/articles/:id/uploads — issue a short-lived presigned S3
 * PUT URL. The server alone decides the S3 key; the client only says which
 * kind of file it's uploading. Generating a presign does NOT write anything
 * to RDS — that only happens once /uploads/complete confirms the object
 * actually landed in S3.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid article id');
    await getArticleOrThrow(id);

    const body = requireJsonBody(req);
    const type = body.type;

    if (type === 'pdf') {
      if (body.contentType !== PDF_CONTENT_TYPE) {
        throw new HttpError(400, `contentType must be "${PDF_CONTENT_TYPE}" for a PDF upload`);
      }
      const s3Key = buildPdfKey(id);
      const uploadUrl = await createPresignedPutUrl(s3Key, PDF_CONTENT_TYPE, PRESIGNED_URL_EXPIRY_SECONDS);
      sendJson(res, 200, { uploadUrl, s3Key, expiresIn: PRESIGNED_URL_EXPIRY_SECONDS });
      return;
    }

    if (type === 'image') {
      if (!isAllowedImageContentType(body.contentType)) {
        throw new HttpError(400, 'contentType must be one of image/jpeg, image/png, image/webp');
      }
      if (!isValidPosition(body.position)) {
        throw new HttpError(400, 'position must be a non-negative integer');
      }
      const s3Key = buildImageKey(id, body.contentType);
      const uploadUrl = await createPresignedPutUrl(s3Key, body.contentType, PRESIGNED_URL_EXPIRY_SECONDS);
      sendJson(res, 200, { uploadUrl, s3Key, expiresIn: PRESIGNED_URL_EXPIRY_SECONDS });
      return;
    }

    throw new HttpError(400, 'type must be "pdf" or "image"');
  });
}
