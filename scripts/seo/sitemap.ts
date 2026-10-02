/**
 * Sitemap XML builder — pure function over the route registry in
 * scripts/seo/routes.ts, shared by the postbuild generator
 * (scripts/generate-seo-html.ts → dist/sitemap.xml) and the Vite dev server
 * (/sitemap.xml), so both always emit identical output. The dev loader
 * references this file by path string (vite.config.ts) — update it there if
 * this module moves.
 *
 * Query-string variants (e.g. /projects/categories?category=...) are never
 * included, since routes only ever holds base canonical paths. Structure-only
 * (noIndex) routes are excluded. No <changefreq>/<priority> (modern engines
 * largely ignore them); no <lastmod> unless the route carries a real, sourced
 * date (see RouteMeta).
 */
import { SITE_URL } from '../../src/seo/constants';
import { withLocale } from '../../src/lib/locale';
import { LOCALES, type RouteMeta } from './routes';

export function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function buildSitemapXml(routes: readonly RouteMeta[]): string {
  const sitemapUrls = routes.filter((route) => !route.noIndex).flatMap((route) =>
    LOCALES.map((locale) => {
      const loc = `${SITE_URL}${withLocale(route.path, locale)}`;
      const lastmodTag = route.lastmod ? `\n    <lastmod>${route.lastmod}</lastmod>` : '';
      return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmodTag}\n  </url>`;
    }),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`;
}
