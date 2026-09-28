import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../../_lib/projectsAuth';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { deleteProjectImage, getProjectRecordOrThrow, updateProjectImageMeta, type ProjectImageMetaUpdate } from '../../../../_lib/projects';
import { isValidAltText, isValidCaption, isValidUuid } from '../../../../_lib/validation';

/** PATCH (alt text/caption only — never s3Key/position, mirrors updateArticleImageMeta) / DELETE /api/projects/:id/images/:imageId */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, ['PATCH', 'DELETE']);

    const id = req.query.id;
    const imageId = req.query.imageId;
    if (typeof id !== 'string' || !isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    if (typeof imageId !== 'string' || !isValidUuid(imageId)) throw new HttpError(400, 'Invalid image id');
    await getProjectRecordOrThrow(id);

    if (req.method === 'DELETE') {
      await deleteProjectImage(id, imageId);
      sendJson(res, 200, { deleted: true, id: imageId });
      return;
    }

    const body = requireJsonBody(req);
    const update: ProjectImageMetaUpdate = {};
    if ('altText' in body) {
      if (!isValidAltText(body.altText)) throw new HttpError(400, 'altText is invalid');
      update.altText = body.altText as string | null;
    }
    if ('caption' in body) {
      if (!isValidCaption(body.caption)) throw new HttpError(400, 'caption is invalid');
      update.caption = body.caption as string | null;
    }

    await updateProjectImageMeta(id, imageId, update);
    sendJson(res, 200, { updated: true, id: imageId });
  });
}
