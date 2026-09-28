import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../../_lib/projectsAuth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { getProjectRecordOrThrow, listProjectImages, upsertProjectImage } from '../../../../_lib/projects';
import { headObject } from '../../../../_lib/s3';
import { isKeyWithinProjectPrefix } from '../../../../_lib/projectS3Keys';
import { MAX_IMAGE_BYTES, isAllowedImageContentType, isValidAltText, isValidCaption, isValidPosition, isValidUuid } from '../../../../_lib/validation';

/**
 * POST /api/projects/:id/images/uploads/complete — confirms an upload
 * actually happened before RDS ever records a reference to it. Mirrors
 * api/newsroom/articles/[id]/uploads/complete.ts's image branch exactly.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, 'POST');

    const id = requireIdParam(req);
    if (!isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    await getProjectRecordOrThrow(id);

    const body = requireJsonBody(req);
    const s3Key = body.s3Key;
    if (typeof s3Key !== 'string' || s3Key.length === 0) {
      throw new HttpError(400, 's3Key is required');
    }
    if (!isKeyWithinProjectPrefix(s3Key, id)) {
      throw new HttpError(400, 's3Key does not belong to this project');
    }

    const head = await headObject(s3Key);
    if (!head) {
      throw new HttpError(409, 'Object not found in S3: the upload may not have completed yet');
    }
    if (!isAllowedImageContentType(head.contentType)) {
      throw new HttpError(422, `Uploaded object's content type (${head.contentType ?? 'unknown'}) is not an allowed image type`);
    }
    if ((head.contentLength ?? 0) > MAX_IMAGE_BYTES) {
      throw new HttpError(413, `Uploaded image exceeds the maximum allowed size of ${MAX_IMAGE_BYTES} bytes`);
    }
    if (!isValidPosition(body.position)) {
      throw new HttpError(400, 'position must be a non-negative integer');
    }
    if (body.altText !== undefined && !isValidAltText(body.altText)) throw new HttpError(400, 'altText is invalid');
    if (body.caption !== undefined && !isValidCaption(body.caption)) throw new HttpError(400, 'caption is invalid');

    await upsertProjectImage({
      projectId: id,
      s3Key,
      position: body.position,
      altText: (body.altText as string | null | undefined) ?? undefined,
      caption: (body.caption as string | null | undefined) ?? undefined,
    });
    const images = await listProjectImages(id);
    sendJson(
      res,
      200,
      images.map((image) => ({
        id: image.id,
        s3Key: image.s3_key,
        position: image.position,
        altText: image.alt_text,
        caption: image.caption,
        isPrimary: Boolean(image.is_primary),
      })),
    );
  });
}
