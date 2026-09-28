import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { getPublishedProjectBySlug } from '../../../_lib/projects/publicProjects';

/**
 * GET /api/projects/public/projects/:slug — a single published project, by
 * slug ONLY (never the internal UUID — that lookup path doesn't exist
 * here). Mirrors api/newsroom/public/articles/[slug].ts exactly: a
 * nonexistent slug and an existing-but-draft slug both 404 identically,
 * since getPublishedProjectBySlug's query already filters
 * `status = 'published'` — there is no separate branch that could leak
 * "this slug exists but is still a draft."
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'GET');

    const slug = req.query.slug;
    if (typeof slug !== 'string' || slug.length === 0) throw new HttpError(400, 'Missing project slug');

    const project = await getPublishedProjectBySlug(slug);
    if (!project) throw new HttpError(404, 'Project not found');

    res.setHeader('Cache-Control', 'public, s-maxage=60, must-revalidate');
    sendJson(res, 200, project);
  });
}
