import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireNewsroomAuth } from '../../_lib/auth';
import { requireMethod, sendJson, withErrorHandling } from '../../_lib/http';
import { createDraftArticle, listArticles } from '../../_lib/articles';

/**
 * GET  /api/newsroom/articles — the internal review queue (rows arrive
 *      most-recently-updated first per listArticles' own query, capped at
 *      100; the admin UI re-sorts client-side by createdAt for its Sort by
 *      control, independent of this response's own order). Summary fields
 *      only — the full structured_content/images payload is fetched
 *      per-article on demand via GET /api/newsroom/articles/:id, same as
 *      before. `createdAt` is included alongside `updatedAt`/`publishedAt`
 *      so the admin queue can sort by actual creation time rather than
 *      conflating it with either of those. `scheduledPublishAt`/
 *      `scheduledUnpublishAt` were already fetched from RDS via
 *      listArticles' `SELECT *` but never serialized here — added so the
 *      queue's Opens/Closes columns can render a publication window per
 *      row without a second request per article.
 * POST /api/newsroom/articles — create an empty draft record. No
 *      title/slug/content required yet.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireNewsroomAuth(req);
    requireMethod(req, ['GET', 'POST']);

    if (req.method === 'GET') {
      const articles = await listArticles();
      sendJson(
        res,
        200,
        articles.map((article) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          category: article.category,
          featured: Boolean(article.featured),
          status: article.status,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          publishedAt: article.published_at,
          scheduledPublishAt: article.scheduled_publish_at,
          scheduledUnpublishAt: article.scheduled_unpublish_at,
        })),
      );
      return;
    }

    const article = await createDraftArticle();
    sendJson(res, 201, {
      id: article.id,
      status: article.status,
      createdAt: article.created_at,
    });
  });
}
