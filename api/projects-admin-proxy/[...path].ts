import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireMethod, withErrorHandling } from '../_lib/http.js';
import { forwardToProjectsLambda } from '../_lib/projectsProxyForward.js';

/**
 * ANY /api/projects-admin-proxy/<...path> — mirrors
 * api/newsroom-admin-proxy/[...path].ts's role exactly. Handles every
 * request with at least one real path segment (e.g. /articles-equivalent
 * paths like /:id, /:id/metrics, ...); the bare proxy root (list/create,
 * segments === []) is a SEPARATE file — see index.ts's own comment for why.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, ['GET', 'POST', 'PATCH', 'DELETE']);

    const pathSegments = req.query.path;
    const rawSegments = Array.isArray(pathSegments) ? pathSegments : pathSegments ? [pathSegments] : [];
    const segments = rawSegments.flatMap((seg) => seg.split('/'));
    if (segments.length === 0) {
      throw new HttpError(400, 'Invalid path segment');
    }

    await forwardToProjectsLambda(req, res, segments);
  });
}
