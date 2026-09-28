import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod, sendJson, withErrorHandling } from '../../../_lib/http';
import { listPublishedArticles } from '../../../_lib/newsroom/publicArticles';

/**
 * GET /api/newsroom/public/articles — the public Newsroom index feed.
 * Unauthenticated by design (this is public content); `requireNewsroomAuth`
 * is deliberately never called here — that guard is for the admin
 * read/write endpoints only. `listPublishedArticles()` filters
 * `status = 'published'` in SQL, so this can never return a draft/ready/
 * processing/failed row no matter what.
 *
 * Cacheable, but deliberately without stale-while-revalidate: an unpublish
 * must stop being publicly listed within a bounded, short window, not up to
 * an hour later while a stale cached copy keeps being served during
 * background revalidation. `s-maxage=60, must-revalidate` mirrors
 * api/newsroom-article-page.ts's dynamic HTML policy — the same pattern,
 * empirically verified in Production to give Vercel's edge a real ~60s hard
 * ceiling with no stale-serving grace period once expired.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'GET');
    res.setHeader('Cache-Control', 'public, s-maxage=60, must-revalidate');
    const articles = await listPublishedArticles();
    sendJson(res, 200, articles);
  });
}
