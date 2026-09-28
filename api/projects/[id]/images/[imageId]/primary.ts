import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireProjectsAuth } from '../../../../_lib/projectsAuth';
import { HttpError, requireMethod, sendJson, withErrorHandling } from '../../../../_lib/http';
import { getProjectRecordOrThrow, setProjectImagePrimary } from '../../../../_lib/projects';
import { isValidUuid } from '../../../../_lib/validation';

/**
 * POST /api/projects/:id/images/:imageId/primary — the one-primary-image
 * invariant's only write path (Section 5 of the Phase 3 spec): delegates
 * entirely to setProjectImagePrimary's transactional unset-then-set, so
 * this handler itself carries no race-prone logic of its own.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireProjectsAuth(req);
    requireMethod(req, 'POST');

    const id = req.query.id;
    const imageId = req.query.imageId;
    if (typeof id !== 'string' || !isValidUuid(id)) throw new HttpError(400, 'Invalid project id');
    if (typeof imageId !== 'string' || !isValidUuid(imageId)) throw new HttpError(400, 'Invalid image id');
    await getProjectRecordOrThrow(id);

    await setProjectImagePrimary(id, imageId);
    sendJson(res, 200, { primaryImageId: imageId });
  });
}
