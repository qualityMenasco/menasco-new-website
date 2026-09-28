import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { getPublishedArticleBySlug } from '../../../_lib/newsroom/publicArticles';

/**
 * GET /api/newsroom/public/articles/:slug — a single published article,
 * for the public NewsDetailPage. Unauthenticated (public content).
 *
 * A nonexistent slug and an existing-but-unpublished slug both 404 with the
 * exact same response — `getPublishedArticleBySlug` returns `null` for
 * both, since its query already filters `status = 'published'`, so there is
 * no separate branch here that could accidentally leak "this slug exists
 * but isn't public yet."
 *
 * The 200 response is cacheable, but deliberately without
 * stale-while-revalidate — see api/newsroom/public/articles/index.ts's
 * matching doc comment. The 404 branch below intentionally sets no
 * Cache-Control at all (not even a short one): a newly published article
 * must never be blocked from appearing by an earlier cached 404 for the
 * same slug, and Vercel does not cache a Node function response that omits
 * Cache-Control, so this isn't negative-caching infrastructure — it's the
 * absence of any.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'GET');

    const slug = req.query.slug;
    if (typeof slug !== 'string' || slug.length === 0) throw new HttpError(400, 'Missing article slug');

    const article = await getPublishedArticleBySlug(slug);
    if (!article) throw new HttpError(404, 'Article not found');

    res.setHeader('Cache-Control', 'public, s-maxage=60, must-revalidate');
    sendJson(res, 200, article);
  });
}
