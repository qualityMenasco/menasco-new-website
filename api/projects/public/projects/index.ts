import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { listPublishedProjects } from '../../../_lib/projects/publicProjects';

/**
 * GET /api/projects/public/projects — the public Projects index. Mirrors
 * api/newsroom/public/articles/index.ts exactly: unauthenticated,
 * `listPublishedProjects()` filters `status = 'published'` in SQL and
 * selects an explicit public-safe column list (never `SELECT *`), so this
 * can never return a draft row or a private field no matter what.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'GET');
    res.setHeader('Cache-Control', 'public, s-maxage=60, must-revalidate');
    const projects = await listPublishedProjects();
    sendJson(res, 200, projects);
  });
}
