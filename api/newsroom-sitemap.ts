import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SITE_URL } from './_lib/newsroomSeo.js';

/**
 * GET /sitemap-newsroom.xml (wired via a vercel.json rewrite) — a small,
 * request-time sitemap listing every currently PUBLISHED Newsroom article.
 *
 * Why a separate file instead of adding these URLs into the main, static
 * `dist/sitemap.xml`: that file is generated once per Vercel build
 * (scripts/generate-seo-html.ts) from the static route registry
 * (scripts/seo/routes.ts) — exactly the same "doesn't know about an article
 * published after the last build" gap `api/newsroom-article-page.ts`
 * already exists to close for the article page itself (see that file's
 * module comment). A real fix needs the same request-time approach; adding
 * a second `Sitemap:` line in robots.txt (see public/robots.txt) is valid
 * per the sitemap protocol — a site can reference multiple sitemaps without
 * wrapping them in a `<sitemapindex>` — so the static sitemap generator
 * and this function can each stay focused on the one content type they
 * already own, with no change to scripts/seo/sitemap.ts.
 *
 * Security boundary: calls ONLY the public, published-only Newsroom list
 * endpoint (`listPublishedArticles()`'s `status = 'published'` SQL filter,
 * same as api/newsroom-article-page.ts) — never RDS directly, never an
 * admin key. A draft/scheduled article can never appear here, by the same
 * construction that endpoint already guarantees elsewhere.
 */

interface PublicArticleSummary {
  slug: string;
  publishedAt: string;
}

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** `publishedAt` is a full ISO 8601 timestamp already — `<lastmod>` wants just the date portion. */
function toLastmodDate(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function buildNewsroomSitemapXml(articles: PublicArticleSummary[]): string {
  const urls = articles.map((article) => {
    const loc = `${SITE_URL}/newsroom/${article.slug}`;
    const lastmod = toLastmodDate(article.publishedAt);
    const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
    return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmodTag}\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).setHeader('Content-Type', 'text/plain').send('Method not allowed');
    return;
  }

  const PUBLIC_API_BASE = process.env.NEWSROOM_PUBLIC_API_BASE_URL;
  if (!PUBLIC_API_BASE) {
    // eslint-disable-next-line no-console
    console.error('[newsroom-sitemap] NEWSROOM_PUBLIC_API_BASE_URL is not configured');
    res.status(500).setHeader('Content-Type', 'text/plain').send('Newsroom sitemap is not configured in this environment');
    return;
  }

  try {
    const upstream = await fetch(`${PUBLIC_API_BASE}/api/newsroom/public/articles`);
    if (!upstream.ok) {
      // eslint-disable-next-line no-console
      console.error(`[newsroom-sitemap] upstream public API returned HTTP ${upstream.status}`);
      res.status(502).setHeader('Content-Type', 'text/plain').send('Newsroom sitemap temporarily unavailable');
      return;
    }

    const articles = (await upstream.json()) as PublicArticleSummary[];
    const xml = buildNewsroomSitemapXml(articles);

    // Same conservative TTL philosophy as api/newsroom-article-page.ts — a
    // newly published article should be discoverable here within minutes,
    // not up to an hour later behind a stale-while-revalidate window.
    res.status(200).setHeader('Content-Type', 'application/xml; charset=utf-8').setHeader('Cache-Control', 'public, s-maxage=300, must-revalidate').send(xml);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[newsroom-sitemap] unhandled error', err);
    res.status(500).setHeader('Content-Type', 'text/plain').send('Internal server error');
  }
}
