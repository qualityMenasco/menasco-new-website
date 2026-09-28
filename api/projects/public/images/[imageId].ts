import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireMethod, withErrorHandling } from '../../../_lib/http';
import { getPublicProjectImageS3Key } from '../../../_lib/projects/publicProjects';
import { getObjectWithContentType } from '../../../_lib/s3';
import { isValidUuid } from '../../../_lib/validation';

/**
 * GET /api/projects/public/images/:imageId — mirrors
 * api/newsroom/public/images/[imageId].ts exactly. The private
 * `menasco-newsroom-prod` bucket is never made public and no presigned URL
 * is ever handed to a public visitor — this reads the object server-side
 * and streams the bytes back with the real stored Content-Type.
 *
 * `getPublicProjectImageS3Key`'s join through `project_records` requiring
 * `status = 'published'` is the actual security boundary: an image
 * belonging to a draft project 404s here exactly like a nonexistent image
 * id — this proxy can never be used to peek at an unpublished project's
 * images by guessing an image id, even a real one.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'GET');

    const imageId = req.query.imageId;
    if (typeof imageId !== 'string' || !isValidUuid(imageId)) throw new HttpError(400, 'Invalid image id');

    const s3Key = await getPublicProjectImageS3Key(imageId);
    if (!s3Key) throw new HttpError(404, 'Image not found');

    const { body, contentType } = await getObjectWithContentType(s3Key);

    res.status(200);
    res.setHeader('Content-Type', contentType ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
    res.send(body);
  });
}
