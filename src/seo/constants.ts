export const SITE_NAME = 'MENASCO';
export const SITE_TAGLINE = 'Integrated MEP & Engineering Contractor';
/**
 * Canonical production domain — the single source of truth every canonical
 * URL, hreflang alternate, and Open Graph `og:url` on the site is built
 * from (src/seo/SEO.tsx on the client, scripts/generate-seo-html.ts at
 * build time). Deliberately NOT the Vercel deployment/preview URL
 * (*.vercel.app) — canonical tags must always point at the real production
 * domain regardless of which URL actually served the request. If the
 * production domain ever changes, update it in this one place only.
 */
export const SITE_URL = 'https://menascogroup.com';
export const SITE_LOGO_PATH = '/Menasco-Logo.png';

/**
 * Social-sharing metadata (`og:image`, `twitter:image`, `NewsArticle.image`)
 * must be an absolute URL — crawlers that don't resolve relative to the
 * fetching page (or don't fetch HTML at all, e.g. reading raw JSON-LD)
 * would otherwise get a dead reference. Newsroom image URLs from the
 * public API (`api/_lib/newsroom/publicArticles.ts`'s `publicImageUrl()`)
 * are intentionally first-party-relative (e.g.
 * `/api/newsroom/public/images/:id`, proxied to AWS by a Vercel rewrite) so
 * `<img>` tags can use them as-is same-origin; this is the one place that
 * turns the same value into the absolute form social/structured-data
 * metadata needs, off the single `SITE_URL` source of truth rather than a
 * domain hardcoded again at each call site. A value that's already
 * absolute (starts with a scheme) passes through unchanged.
 */
export function toAbsoluteUrl(path: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
/** Single source of truth for the downloadable company profile — swap this one file in /public to update it everywhere. */
export const COMPANY_PROFILE_PATH = '/menasco-company-profile.pdf';
