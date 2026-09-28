import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../../../_lib/auth';
import { HttpError, requireIdParam, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { getArticleImages, getArticleOrThrow, setArticlePdfKey, upsertArticleImage } from '../../../../_lib/articles';
import { headObject } from '../../../../_lib/s3';
import { buildPdfKey, isKeyWithinArticlePrefix } from '../../../../_lib/s3Keys';
import { MAX_IMAGE_BYTES, MAX_PDF_BYTES, PDF_CONTENT_TYPE, isAllowedImageContentType, isValidPosition, isValidUuid } from '../../../../_lib/validation';

/**
 * POST /api/newsroom/articles/:id/uploads/complete — confirms an upload
 * actually happened before RDS ever records a reference to it. Requesting a
 * presigned URL proves nothing on its own; this HEADs the S3 object,
 * checks its real ContentType/ContentLength against what was expected, and
 * only then persists the key. Safe to call twice: PDF finalize is a plain
 * idempotent UPDATE, and image finalize is keyed on the (article_id,
 * position) unique index via ON DUPLICATE KEY UPDATE — a retried finalize
 * for the same position updates the row instead of duplicating it.
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
    const s3Key = body.s3Key;

    if (typeof s3Key !== 'string' || s3Key.length === 0) {
      throw new HttpError(400, 's3Key is required');
    }
    // The server generated every valid key up front (see s3Keys.ts) — this
    // rejects a key that doesn't belong to this article's own prefix,
    // regardless of what the client claims.
    if (!isKeyWithinArticlePrefix(s3Key, id)) {
      throw new HttpError(400, 's3Key does not belong to this article');
    }

    const head = await headObject(s3Key);
    if (!head) {
      throw new HttpError(409, 'Object not found in S3: the upload may not have completed yet');
    }

    if (type === 'pdf') {
      const expectedKey = buildPdfKey(id);
      if (s3Key !== expectedKey) throw new HttpError(400, `Unexpected S3 key for a PDF upload (expected ${expectedKey})`);
      if (head.contentType !== PDF_CONTENT_TYPE) {
        throw new HttpError(422, `Uploaded object's content type (${head.contentType ?? 'unknown'}) does not match ${PDF_CONTENT_TYPE}`);
      }
      if ((head.contentLength ?? 0) > MAX_PDF_BYTES) {
        throw new HttpError(413, `Uploaded PDF exceeds the maximum allowed size of ${MAX_PDF_BYTES} bytes`);
      }

      await setArticlePdfKey(id, s3Key);
      sendJson(res, 200, { sourcePdf: { s3Key } });
      return;
    }

    if (type === 'image') {
      if (!isAllowedImageContentType(head.contentType)) {
        throw new HttpError(422, `Uploaded object's content type (${head.contentType ?? 'unknown'}) is not an allowed image type`);
      }
      if ((head.contentLength ?? 0) > MAX_IMAGE_BYTES) {
        throw new HttpError(413, `Uploaded image exceeds the maximum allowed size of ${MAX_IMAGE_BYTES} bytes`);
      }
      if (!isValidPosition(body.position)) {
        throw new HttpError(400, 'position must be a non-negative integer');
      }
      const altText = typeof body.altText === 'string' ? body.altText : undefined;
      const caption = typeof body.caption === 'string' ? body.caption : undefined;
      const role = typeof body.role === 'string' ? body.role : undefined;

      await upsertArticleImage({ articleId: id, s3Key, position: body.position, altText, caption, role });
      const images = await getArticleImages(id);
      sendJson(
        res,
        200,
        images.map((image) => ({
          id: image.id,
          s3Key: image.s3_key,
          position: image.position,
          altText: image.alt_text,
          caption: image.caption,
          role: image.role,
        })),
      );
      return;
    }

    throw new HttpError(400, 'type must be "pdf" or "image"');
  });
}
