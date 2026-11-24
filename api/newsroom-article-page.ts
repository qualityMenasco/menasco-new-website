import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, SITE_NAME, DEFAULT_SHARE_IMAGE_PATH, toAbsoluteUrl, articleJsonLd, serializeJsonLd } from './_lib/newsroomSeo.js';
import { renderArticleBodyHtml, escapeHtml } from './_lib/newsroomArticleBody.js';
import type { ArticleBodyImage, ArticleBodySection, ArticleBodyTag } from './_lib/newsroomArticleBody.js';
import { isProductionLaunch } from './_lib/launchConfig.js';

/**
 * GET /newsroom/:slug and /ar/newsroom/:slug (wired via vercel.json rewrites
 * into this function as ?slug=...&locale=en|ar) — the dynamic, per-request
 * SEO shell for a single published Newsroom article.
 *
 * Lives at api/newsroom-article-page.ts, a sibling of api/newsroom/, not
 * nested inside it: .vercelignore excludes all of api/newsroom/** from
 * being deployed as live Vercel functions (that's the Lambda's shared
 * source only), with api/newsroom-admin-proxy/** as the one existing
 * exception for a thin, RDS/S3-free relay. This function is the same kind
 * of exception — it only ever calls the public Lambda API server-to-server
 * (see below) — so it needs the same sibling-directory treatment rather
 * than an edit to that deliberately-scoped ignore file.
 *
 * Why this exists: the site's static prerender (scripts/generate-seo-html.ts)
 * only knows about articles that existed in RDS at the last Vercel build —
 * publishing a new article does nothing to already-deployed static output
 * until the next rebuild. This function closes that gap by rendering the
 * `<head>` at REQUEST time from the live public API, so publish → crawlable
 * with zero Vercel rebuild.
 *
 * Security boundary: this calls ONLY the public Newsroom API
 * (NEWSROOM_PUBLIC_API_BASE_URL, the same Lambda every browser's public
 * article fetch already hits) — never RDS directly, never
 * NEWSROOM_ADMIN_API_KEY, never an admin endpoint, never S3/presigned URLs.
 * The Lambda's own `status = 'published'` query join (see
 * api/_lib/newsroom/publicArticles.ts) remains the single source of truth
 * for whether an article is servable; an unpublished/nonexistent slug is
 * indistinguishable here and both produce a real HTTP 404.
 *
 * Called server-to-server directly against the AWS API Gateway host (not
 * through the /api/newsroom/public/* Vercel rewrite) specifically to avoid
 * that rewrite's own CDN-level Cache-Control (`s-maxage=300,
 * stale-while-revalidate=3600`) — API Gateway itself does not cache, so this
 * function always sees live DB state and the ONLY staleness an unpublished
 * article can have is this function's own short response TTL (see
 * Cache-Control below), not a compounded upstream cache window. The AWS
 * hostname itself never leaks into any canonical/OG/JSON-LD value — those
 * are all built from SITE_URL (src/seo/constants.ts), same as every other
 * page on the site.
 *
 * The returned HTML uses the same built JS/CSS asset tags
 * scripts/generate-seo-html.ts's static routes use (captured at build time
 * into _generated/newsroomArticlePageAssets.json, since Vite's output
 * hashes change every build), so the existing React application still
 * boots and NewsDetailPage mounts over this and renders the real
 * interactive article exactly as it does today. Unlike the original
 * version of this function, `<div id="root">` is no longer empty: it now
 * also carries a hand-rendered, crawler-visible snapshot of the article's
 * real body (category, date, title, subtitle, structured-content sections,
 * related-topic links) via `renderArticleBodyHtml` — see
 * api/_lib/newsroomArticleBody.ts's module comment for why that's a
 * deliberate duplicate of ArticleStructuredContent.tsx's rendering logic
 * rather than a reuse of the real component, and for the known
 * flash-on-hydration trade-off this introduces for JS-enabled visitors.
 */

type Locale = 'en' | 'ar';

interface PublicImage {
  url: string;
}

interface PublicArticle {
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  publishedAt: string;
  primaryImage: PublicImage | null;
  tags: ArticleBodyTag[];
  structuredContent: { sections: ArticleBodySection[] };
  images: ArticleBodyImage[];
}

export { escapeHtml };

/** Same rule as src/seo/SEO.tsx / scripts/seo/routes.ts's fullTitle: a topic that already carries the site name is used verbatim. */
function fullTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

// Read via fs, not a native ESM JSON import: Vercel's Node builder ships this
// file alongside the bundled function rather than inlining it, and Node's
// strict ESM loader requires an import-attribute (`with { type: 'json' }`)
// for a real runtime JSON import that this build/runtime combination doesn't
// satisfy — fs avoids that entirely and works identically in every Node
// version.
const __dirname = dirname(fileURLToPath(import.meta.url));
const assetManifest = JSON.parse(readFileSync(join(__dirname, '_generated/newsroomArticlePageAssets.json'), 'utf8')) as { assetTags: string };
const assetTags: string = assetManifest.assetTags;

function htmlDocument(locale: Locale, head: string, body: string = ''): string {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${head}
    ${assetTags}
  </head>
  <body>
    <div id="root">${body}</div>
  </body>
</html>
`;
}

/**
 * Builds the full HTML document for a published article.
 *
 * Arabic (locale === 'ar'): there is currently no independent Arabic article
 * content in RDS (see NewsDetailPage.tsx's own documented limitation) — this
 * renders the same English content but marks the page `noindex, follow`,
 * omits an `hreflang="ar"` alternate (there is no genuinely different
 * Arabic version to point search engines at), and points `canonical` at the
 * ENGLISH article URL rather than the /ar one, so the /ar copy is never
 * indexed as separate/duplicate content. Do not "fix" this by inventing a
 * translation — remove this whole branch once real Arabic article content
 * exists in RDS.
 */
export function buildArticleHtml(article: PublicArticle, locale: Locale): string {
  const title = fullTitle(article.title);
  const description = article.subtitle ?? '';
  const path = `/newsroom/${article.slug}`;
  const enUrl = `${SITE_URL}${path}`;
  const localeUrl = locale === 'ar' ? `${SITE_URL}/ar${path}` : enUrl;
  // Canonical always points at the English URL — for the /ar variant this is
  // deliberate (see doc comment above), not a bug.
  const canonicalUrl = enUrl;
  const absoluteImage = article.primaryImage ? toAbsoluteUrl(article.primaryImage.url) : undefined;
  // Link previews: the article's own photo, else the site-wide MENASCO logo share image.
  const shareImage = absoluteImage ?? toAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH);
  // A non-launched deployment (preview/branch/local — see
  // api/_lib/launchConfig.ts) overrides even a normally-indexable English
  // article to the strict `noindex, nofollow` every other page on such a
  // deployment gets — this function's own request-time rendering means it
  // would otherwise be the one surface that stays indexable while every
  // static page on the same deployment is noindex.
  const robots = !isProductionLaunch() ? 'noindex, nofollow' : locale === 'ar' ? 'noindex, follow' : 'index, follow';

  const jsonLd = articleJsonLd({
    title: article.title,
    description,
    path,
    datePublished: article.publishedAt,
    image: absoluteImage,
  });

  const head = `<title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(enUrl)}" />
    <meta name="robots" content="${robots}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(localeUrl)}" />
    <meta property="og:image" content="${escapeHtml(shareImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(shareImage)}" />
    <script type="application/ld+json">${serializeJsonLd(jsonLd)}</script>`;

  const body = renderArticleBodyHtml({
    title: article.title,
    subtitle: article.subtitle,
    category: article.category,
    publishedAt: article.publishedAt,
    tags: article.tags,
    structuredContent: article.structuredContent,
    images: article.images,
  });

  return htmlDocument(locale, head, body);
}

/** True 404 — no article title/body/JSON-LD leaked, regardless of whether the slug never existed or belongs to a not-yet-published article (the public API makes those indistinguishable, which is the point). */
export function buildNotFoundHtml(locale: Locale): string {
  const head = `<title>Page Not Found | ${escapeHtml(SITE_NAME)}</title>
    <meta name="description" content="The page you're looking for doesn't exist." />
    <meta name="robots" content="noindex, nofollow" />`;
  return htmlDocument(locale, head);
}

function parseLocale(value: unknown): Locale {
  return value === 'ar' ? 'ar' : 'en';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).setHeader('Content-Type', 'text/plain').send('Method not allowed');
    return;
  }

  const slug = req.query.slug;
  const locale = parseLocale(req.query.locale);

  if (typeof slug !== 'string' || slug.length === 0) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(buildNotFoundHtml(locale));
    return;
  }

  const PUBLIC_API_BASE = process.env.NEWSROOM_PUBLIC_API_BASE_URL;
  if (!PUBLIC_API_BASE) {
    // eslint-disable-next-line no-console
    console.error('[newsroom-render-article] NEWSROOM_PUBLIC_API_BASE_URL is not configured');
    res.status(500).setHeader('Content-Type', 'text/plain').send('Newsroom rendering is not configured in this environment');
    return;
  }

  try {
    const upstream = await fetch(`${PUBLIC_API_BASE}/api/newsroom/public/articles/${encodeURIComponent(slug)}`);

    if (upstream.status === 404) {
      res
        .status(404)
        .setHeader('Content-Type', 'text/html; charset=utf-8')
        .setHeader('Cache-Control', 'public, s-maxage=60, must-revalidate')
        .setHeader('X-Robots-Tag', 'noindex, nofollow')
        .send(buildNotFoundHtml(locale));
      return;
    }

    if (!upstream.ok) {
      // eslint-disable-next-line no-console
      console.error(`[newsroom-render-article] upstream public API returned HTTP ${upstream.status} for slug "${slug}"`);
      res.status(502).setHeader('Content-Type', 'text/plain').send('Newsroom article temporarily unavailable');
      return;
    }

    const article = (await upstream.json()) as PublicArticle;
    const html = buildArticleHtml(article, locale);
    // Mirrors buildArticleHtml's own <meta name="robots"> value exactly —
    // see that function for the full launch/AR-locale rationale.
    const xRobotsTag = !isProductionLaunch() ? 'noindex, nofollow' : locale === 'ar' ? 'noindex, follow' : 'index, follow';

    // Conservative, non-stale-serving TTL: an unpublish must stop being
    // reflected here within roughly this window, not up to an hour later.
    // `must-revalidate` (not stale-while-revalidate) means the shared cache
    // MUST re-invoke this function after expiry rather than serve stale —
    // see the module doc comment for why the upstream fetch itself can't
    // introduce additional staleness on top of this.
    res
      .status(200)
      .setHeader('Content-Type', 'text/html; charset=utf-8')
      .setHeader('Cache-Control', 'public, s-maxage=60, must-revalidate')
      .setHeader('X-Robots-Tag', xRobotsTag)
      .send(html);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[newsroom-render-article] unhandled error', err);
    res.status(500).setHeader('Content-Type', 'text/plain').send('Internal server error');
  }
}
