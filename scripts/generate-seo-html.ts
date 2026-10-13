/**
 * Post-build static "SEO shell" generator.
 *
 * MENASCO is a client-side-only React SPA (Vite + react-router + Vercel).
 * Every route is served the same `dist/index.html`, so a crawler that
 * doesn't execute JavaScript (or executes it but gives up before React +
 * react-helmet-async finish mounting) sees whatever `<title>`/meta tags are
 * baked into that one static file — previously the design-system tool's
 * stale "MENASCO Design System" title, regardless of the page requested.
 *
 * This script runs after `vite build` (wired as `postbuild`) and, for every
 * public indexable route (English and the /ar equivalent), writes a copy of
 * the built `dist/index.html` at `dist/<route>/index.html` with the `<head>`
 * replaced — same bundled JS/CSS. For most routes `<div id="root">` stays
 * empty, exactly as before, and React mounts into it client-side.
 *
 * For a small, explicit allowlist of the highest-value public routes
 * (`scripts/seo/prerender.ts`'s `PRERENDER_PATHS`), `<div id="root">` is
 * instead pre-filled with real body markup rendered from the actual React
 * page component at build time — so a non-JS crawler/AI fetcher sees real
 * headings, text and internal links immediately, not just an empty div.
 * `src/main.tsx` still mounts via `createRoot` (never `hydrateRoot`), so a
 * JS-enabled browser's client render fully replaces this markup rather than
 * reconciling with it — there is no hydration-mismatch risk, by design; see
 * scripts/seo/prerender.ts's own doc comment for the full reasoning.
 *
 * Vercel serves an exact filesystem match (`/about` → `dist/about/index.html`)
 * before falling back to the SPA catch-all rewrite in vercel.json, so a
 * crawler requesting `/about` gets this file's `<title>` directly, with no
 * client-side JavaScript required.
 *
 * Every title/description here is read from the exact same source each
 * React page component reads at runtime (public/locales/*.json + the typed
 * data modules under src/data) — the small amount of "which key for which
 * route" resolution logic lives in the shared route registry
 * (scripts/seo/routes.ts, also used for the sitemap), not the underlying
 * content itself. There is exactly one place the actual
 * title/description strings live: the locale JSON and data files.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL } from '../src/seo/constants';
import { withLocale, directionForLocale } from '../src/lib/locale';
import { webPageJsonLd, breadcrumbJsonLd, serializeJsonLd } from '../src/seo/structuredData';
// The route registry (every addRoute call, locale loading, title helpers)
// lives in scripts/seo/routes.ts so the Vite dev server can serve the same
// sitemap without running this script's filesystem side effects.
import { LOCALES, routes, siteName, type Locale, type RouteMeta } from './seo/routes';
import { buildSitemapXml } from './seo/sitemap';
import { renderRouteBody, PRERENDER_PATHS } from './seo/prerender';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// ---------------------------------------------------------------------------
// Newsroom articles: individual article detail pages (/newsroom/:slug) are
// deliberately NOT generated here. They're dynamic RDS content — a build-time
// static shell would mean "publish an article" does nothing until the next
// Vercel rebuild. Instead, api/newsroom-article-page.ts renders their SEO
// shell at REQUEST time from the live public API, wired via dedicated
// vercel.json rewrites (/newsroom/:slug and /ar/newsroom/:slug) that take
// priority over this script's static routes. This script has no DB
// dependency as a result — see the asset-manifest write below, which is the
// only thing this script does on that function's behalf.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Write dist/<route>/index.html (and dist/ar/<route>/index.html) per route,
// replacing only the built index.html's <head> contents.
// ---------------------------------------------------------------------------

const templatePath = join(DIST, 'index.html');
if (!existsSync(templatePath)) {
  // eslint-disable-next-line no-console
  console.error(`generate-seo-html: ${templatePath} not found — run "vite build" first.`);
  process.exit(1);
}
const template = readFileSync(templatePath, 'utf8');

// Vite injects the built entry `<script type="module" src="/assets/...">`
// and its `<link rel="stylesheet" href="/assets/...">` INSIDE `<head>`, not
// `<body>` — so replacing the whole `<head>` (below) would silently strip
// the very tags that load the app, leaving every prerendered route as a
// blank page. Pull those specific asset tags out of the real build output
// once, and re-append them to every generated head.
const builtAssetTags = (template.match(/<(?:script|link)[^>]*\/assets\/[^>]*>(?:<\/script>)?/g) ?? []).join('\n    ');
if (!builtAssetTags) {
  // eslint-disable-next-line no-console
  console.error('generate-seo-html: no built /assets/ script or stylesheet tag found in dist/index.html — aborting to avoid shipping broken pages.');
  process.exit(1);
}

// api/newsroom-article-page.ts (the request-time renderer for
// /newsroom/:slug) needs these exact same hashed asset tags but can't read
// dist/index.html itself at runtime — Vercel bundles serverless functions
// separately from the static build output. Writing them into a small JSON
// file INSIDE api/ means the function's own `import` statement picks up
// this build's real hashes when Vercel bundles it (this script runs, via
// postbuild, before Vercel's function-bundling step). The checked-in file
// only ever holds a placeholder for local dev/typecheck before a real build
// has run. Lives under api/_generated/ (not api/newsroom/_generated/) since
// .vercelignore excludes all of api/newsroom/** — see the doc comment atop
// api/newsroom-article-page.ts.
const assetManifestPath = join(ROOT, 'api/_generated/newsroomArticlePageAssets.json');
writeFileSync(assetManifestPath, JSON.stringify({ assetTags: builtAssetTags }, null, 2), 'utf8');
// eslint-disable-next-line no-console
console.log('Generated api/_generated/newsroomArticlePageAssets.json for the dynamic article renderer.');

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHead(route: RouteMeta, locale: Locale): string {
  const title = route.title(locale);
  const description = route.description(locale);
  const canonicalPath = route.path;
  const url = `${SITE_URL}${withLocale(canonicalPath, locale)}`;
  const enUrl = `${SITE_URL}${canonicalPath}`;
  const arUrl = `${SITE_URL}${withLocale(canonicalPath, 'ar')}`;

  // Mirrors src/seo/SEO.tsx exactly: every page gets an auto WebPage-family
  // entity (with any mainEntity embedded), plus whatever additional
  // standalone entities the route supplies (BreadcrumbList, Organization+
  // WebSite on the homepage) — same
  // builders from src/seo/structuredData.ts, so client and prerendered
  // JSON-LD can never drift apart.
  const pageJsonLd = webPageJsonLd({
    type: route.pageType,
    url,
    name: title,
    description,
    inLanguage: locale,
    mainEntity: route.mainEntity?.(locale),
  });
  const breadcrumbEntries = route.breadcrumb?.(locale);
  const jsonLdEntities: Record<string, unknown>[] = route.noIndex
    ? []
    : [
        pageJsonLd,
        ...(breadcrumbEntries ? [breadcrumbJsonLd(breadcrumbEntries, locale)] : []),
        ...(route.extraJsonLd?.(locale) ?? []),
      ];
  const jsonLdScripts = jsonLdEntities.map((entry) => `<script type="application/ld+json">${serializeJsonLd(entry)}</script>`).join('\n    ');

  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}" />
    <link rel="alternate" hreflang="ar" href="${escapeHtml(arUrl)}" />
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(enUrl)}" />${route.noIndex ? `\n    <meta name="robots" content="noindex, ${route.follow ? 'follow' : 'nofollow'}" />` : ''}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(siteName(locale))}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:locale" content="${locale === 'ar' ? 'ar_AE' : 'en_US'}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    ${jsonLdScripts}
    ${builtAssetTags}`;
}

const EMPTY_ROOT_DIV = '<div id="root"></div>';

async function writeRoute(route: RouteMeta, locale: Locale) {
  const localizedPath = withLocale(route.path, locale); // "/", "/services/mechanical", "/ar", "/ar/services/mechanical"
  const head = buildHead(route, locale);
  let html = template
    .replace(/<html[^>]*>/, `<html lang="${locale}" dir="${directionForLocale(locale)}">`)
    .replace(/<head>[\s\S]*<\/head>/, `<head>${head}\n  </head>`);

  if (PRERENDER_PATHS.includes(route.path)) {
    // A path on this allowlist that fails to render must fail the build
    // loudly (see this file's fail-safe contract) — never ship a shell with
    // a partially-rendered or missing body silently.
    const body = await renderRouteBody(route.path, locale);
    if (body) {
      if (!html.includes(EMPTY_ROOT_DIV)) {
        throw new Error(`generate-seo-html: expected to find ${EMPTY_ROOT_DIV} in the template for "${localizedPath}" but did not — aborting rather than writing a malformed shell.`);
      }
      html = html.replace(EMPTY_ROOT_DIV, `<div id="root">${body}</div>`);
    }
  }

  const segments = localizedPath.split('/').filter(Boolean);
  const outDir = segments.length > 0 ? join(DIST, ...segments) : DIST;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
}

// Every PRERENDER_PATHS entry must correspond to a real, currently-registered
// route — catches a stale/typo'd path (e.g. a project slug that no longer
// exists) loudly at build time rather than silently prerendering nothing.
const registeredPaths = new Set(routes.map((route) => route.path));
const unknownPrerenderPaths = PRERENDER_PATHS.filter((path) => !registeredPaths.has(path));
if (unknownPrerenderPaths.length > 0) {
  console.error(`generate-seo-html: PRERENDER_PATHS lists path(s) not found in the route registry (scripts/seo/routes.ts): ${unknownPrerenderPaths.join(', ')}`);
  process.exit(1);
}

let count = 0;
let prerenderedCount = 0;
for (const route of routes) {
  for (const locale of LOCALES) {
    // The bare "/" (and "/ar") route would collide with dist/index.html
    // itself — index.html already IS that file, `writeRoute` handles it
    // correctly (outDir === DIST for "/", a dedicated dist/ar/index.html
    // for the Arabic homepage), so no special-casing needed here.
    await writeRoute(route, locale);
    count += 1;
    if (PRERENDER_PATHS.includes(route.path)) prerenderedCount += 1;
  }
}

// eslint-disable-next-line no-console
console.log(`Generated ${count} route-specific SEO HTML shells under dist/ (${routes.length} routes x ${LOCALES.length} locales), ${prerenderedCount} with prerendered body content.`);

// ---------------------------------------------------------------------------
// dist/404.html — a dedicated, explicitly noindex shell for every URL that
// isn't one of the routes above. vercel.json's catch-all SPA rewrite is
// repointed at this file (instead of index.html) so that an unknown/typo'd
// URL — or an internal, unlinked route like /dev/preview that also has no
// dedicated shell — no longer serves a 200 OK page carrying the homepage's
// fully indexable title/canonical to crawlers that don't execute JS. Every
// *real* public route already has its own shell above and is matched by
// Vercel's filesystem lookup before this rewrite ever fires, so this only
// ever affects genuinely non-canonical/unknown paths — see this script's
// module comment and README-equivalent notes in the final SEO report for
// why this can't become a true HTTP 404 status without deeper platform
// routing changes (a Vercel `rewrites` entry can't set a status code; only
// the legacy `routes` config can, which is a larger, unwarranted change
// for this fix).
// ---------------------------------------------------------------------------

function build404Head(): string {
  const title = 'Page Not Found | MENASCO';
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="The page you're looking for doesn't exist." />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    ${builtAssetTags}`;
}

const notFoundHtml = template
  .replace(/<html[^>]*>/, '<html lang="en" dir="ltr">')
  .replace(/<head>[\s\S]*<\/head>/, `<head>${build404Head()}\n  </head>`);
writeFileSync(join(DIST, '404.html'), notFoundHtml, 'utf8');
// eslint-disable-next-line no-console
console.log('Generated dist/404.html (noindex).');

// ---------------------------------------------------------------------------
// dist/sitemap.xml — generated from the exact same `routes` array used for
// the shells above (via scripts/seo/sitemap.ts, which the dev server also
// uses), so the sitemap and the prerendered HTML can never drift apart.
// ---------------------------------------------------------------------------

const sitemapPath = join(DIST, 'sitemap.xml');
const sitemapXml = buildSitemapXml(routes);
writeFileSync(sitemapPath, sitemapXml, 'utf8');
const writtenSitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';
const sitemapUrlCount = (writtenSitemap.match(/<url>/g) ?? []).length;
if (!writtenSitemap.trim() || sitemapUrlCount === 0) {
  console.error('generate-seo-html: dist/sitemap.xml is missing, empty or has no <url> entries — aborting.');
  process.exit(1);
}
// eslint-disable-next-line no-console
console.log(`Generated dist/sitemap.xml (${sitemapUrlCount} URLs).`);

// ---------------------------------------------------------------------------
// dist/robots.txt — `public/robots.txt` (general crawler access, the
// sitemap line, and the explicit AI-crawler allow rules) is the single
// source of truth; `vite build` already copies it into dist/ verbatim, so
// this step only verifies that copy happened rather than generating/
// overwriting the file with a second, duplicated version.
// ---------------------------------------------------------------------------

if (!existsSync(join(DIST, 'robots.txt'))) {
  console.error('generate-seo-html: dist/robots.txt not found — expected vite build to copy it from public/robots.txt.');
  process.exit(1);
}
// eslint-disable-next-line no-console
console.log('Verified dist/robots.txt (copied from public/robots.txt by vite build).');
