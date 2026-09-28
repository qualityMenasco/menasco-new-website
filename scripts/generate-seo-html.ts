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
 * the built `dist/index.html` at `dist/<route>/index.html` with ONLY the
 * `<head>` replaced — same bundled JS/CSS, same empty `<div id="root">`, so
 * React mounts and hydrates over it exactly as it does today. Nothing in
 * `<body>` is prerendered, which sidesteps any hydration-mismatch risk
 * entirely — this is a metadata shell, not a content prerender.
 *
 * Vercel serves an exact filesystem match (`/about` → `dist/about/index.html`)
 * before falling back to the SPA catch-all rewrite in vercel.json, so a
 * crawler requesting `/about` gets this file's `<title>` directly, with no
 * client-side JavaScript required.
 *
 * Every title/description here is read from the exact same source each
 * React page component reads at runtime (public/locales/*.json + the typed
 * data modules under src/data) — this script duplicates the small amount of
 * "which key for which route" resolution logic each page already contains
 * (the same pattern generate-llms.ts already uses for the llms.txt tree),
 * not the underlying content itself. There is exactly one place the actual
 * title/description strings live: the locale JSON and data files.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, SITE_NAME } from '../src/seo/constants';
import { withLocale, directionForLocale } from '../src/lib/locale';
import { services } from '../src/data/services';
import { projects } from '../src/data/projects';
import { projectCategories } from '../src/data/projectCategories';
import { leadershipProfiles } from '../src/data/leadership';
import { buildProjectFallbackDescription, pickProjectSeoDescription, formatProjectLocation } from '../src/seo/projectDescription';
import {
  organizationJsonLd,
  websiteJsonLd,
  webPageJsonLd,
  breadcrumbJsonLd,
  serviceEntity,
  personEntity,
  serializeJsonLd,
  type WebPageType,
  type BreadcrumbEntry,
} from '../src/seo/structuredData';

type Locale = 'en' | 'ar';
const LOCALES: Locale[] = ['en', 'ar'];

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const PUBLIC_DIR = join(ROOT, 'public');

const NAMESPACES = ['about', 'careers', 'contact', 'home', 'legal', 'newsroom', 'projects', 'seo', 'services'] as const;

function readNamespace(locale: Locale, name: string): any {
  return JSON.parse(readFileSync(join(PUBLIC_DIR, 'locales', locale, `${name}.json`), 'utf8'));
}

const NS: Record<Locale, Record<string, any>> = { en: {}, ar: {} };
for (const locale of LOCALES) {
  for (const ns of NAMESPACES) NS[locale][ns] = readNamespace(locale, ns);
}

/** Dotted-path lookup into one namespace's JSON, mirroring i18next's `t('ns:a.b.c')` — falls back when the path is missing or empty, same as `t(key, fallback)` at runtime. */
function tr(locale: Locale, ns: string, dottedKey: string, fallback: string): string {
  let cur: any = NS[locale][ns];
  for (const part of dottedKey.split('.')) {
    if (cur == null) return fallback;
    cur = cur[part];
  }
  return typeof cur === 'string' && cur.length > 0 ? cur : fallback;
}

function siteName(locale: Locale): string {
  return NS[locale].seo.siteName as string;
}

/** Same rule as src/seo/SEO.tsx's fullTitle: a topic that already carries the site name is used verbatim (it's a fully custom title); everything else gets " | <SiteName>" appended. */
function fullTitle(locale: Locale, topic: string): string {
  const name = siteName(locale);
  return topic.includes(name) || topic.includes(SITE_NAME) ? topic : `${topic} | ${name}`;
}

interface RouteMeta {
  /** Canonical (English) path, e.g. "/services/mechanical". */
  path: string;
  title: (locale: Locale) => string;
  description: (locale: Locale) => string;
  /**
   * ISO date (YYYY-MM-DD), only when there is a genuine, trustworthy
   * modification/publication date in the source data — never fabricated or
   * set to the build date. Currently only newsroom articles (their real
   * `date` field) qualify; every other route omits `<lastmod>` entirely
   * rather than guess.
   */
  lastmod?: string;
  /** WebPage-family schema.org type for this route's auto-generated JSON-LD. Defaults to 'WebPage' — mirrors the `pageType` prop on <SEO>. */
  pageType?: WebPageType;
  /** A more specific entity (Service, Person) embedded as this route's structured-data `mainEntity` — mirrors the `mainEntity` prop on <SEO>. */
  mainEntity?: (locale: Locale) => Record<string, unknown> | undefined;
  /** Breadcrumb trail, mirroring the same `breadcrumbJsonLd([...])` call each page component already makes. */
  breadcrumb?: (locale: Locale) => BreadcrumbEntry[] | undefined;
  /** Additional standalone top-level JSON-LD entities beyond the auto WebPage (Organization+WebSite on the homepage, NewsArticle on newsroom articles). */
  extraJsonLd?: (locale: Locale) => Record<string, unknown>[] | undefined;
}

interface AddRouteOptions {
  lastmod?: string;
  pageType?: WebPageType;
  mainEntity?: (locale: Locale) => Record<string, unknown> | undefined;
  breadcrumb?: (locale: Locale) => BreadcrumbEntry[] | undefined;
  extraJsonLd?: (locale: Locale) => Record<string, unknown>[] | undefined;
}

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
};

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  hotels: 'hospitality',
  'landmark-entertainment': 'landmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
};

const routes: RouteMeta[] = [];

function addRoute(path: string, title: (locale: Locale) => string, description: (locale: Locale) => string, options: AddRouteOptions = {}) {
  routes.push({ path, title, description, ...options });
}

// ---------------------------------------------------------------------------
// Static routes
// ---------------------------------------------------------------------------

const HOME: BreadcrumbEntry = { label: 'Home', path: '/' };

addRoute(
  '/',
  (l) => fullTitle(l, tr(l, 'home', 'seo.title', 'MENASCO')),
  (l) => tr(l, 'home', 'seo.description', NS[l].seo.defaultDescription),
  { extraJsonLd: () => [organizationJsonLd(), websiteJsonLd()] },
);
addRoute(
  '/about',
  (l) => fullTitle(l, tr(l, 'about', 'seo.title', 'About MENASCO')),
  (l) => tr(l, 'about', 'seo.description', NS[l].seo.defaultDescription),
  { pageType: 'AboutPage', breadcrumb: () => [HOME, { label: 'About', path: '/about' }] },
);
addRoute(
  '/team',
  (l) => fullTitle(l, tr(l, 'about', 'team.seo.title', 'Leadership Team')),
  (l) => tr(l, 'about', 'team.seo.description', NS[l].seo.defaultDescription),
  { breadcrumb: () => [HOME, { label: 'Team', path: '/team' }] },
);
addRoute(
  '/quality-safety',
  (l) => fullTitle(l, tr(l, 'about', 'qualitySafetyPage.seo.title', 'Quality & Safety')),
  (l) => tr(l, 'about', 'qualitySafetyPage.seo.description', NS[l].seo.defaultDescription),
  { breadcrumb: () => [HOME, { label: 'Quality, Health & Safety', path: '/quality-safety' }] },
);
addRoute(
  '/esg-reporting',
  (l) => fullTitle(l, tr(l, 'about', 'esg.seo.title', 'ESG & Sustainability')),
  (l) => tr(l, 'about', 'esg.seo.description', NS[l].seo.defaultDescription),
  { breadcrumb: () => [HOME, { label: 'ESG Reporting', path: '/esg-reporting' }] },
);
addRoute(
  '/innovation-technology',
  (l) => fullTitle(l, tr(l, 'about', 'innovation.seo.title', 'Innovation & Technology')),
  (l) => tr(l, 'about', 'innovation.seo.description', NS[l].seo.defaultDescription),
  { breadcrumb: () => [HOME, { label: 'Innovation & Technology', path: '/innovation-technology' }] },
);
addRoute(
  '/contact',
  (l) => fullTitle(l, tr(l, 'contact', 'seo.title', 'Contact MENASCO')),
  (l) => tr(l, 'contact', 'seo.description', NS[l].seo.defaultDescription),
  { pageType: 'ContactPage', breadcrumb: () => [HOME, { label: 'Contact', path: '/contact' }] },
);
addRoute(
  '/services',
  (l) => fullTitle(l, tr(l, 'services', 'seo.title', 'MEP Engineering Services')),
  (l) => tr(l, 'services', 'seo.description', NS[l].seo.defaultDescription),
  { pageType: 'CollectionPage', breadcrumb: () => [HOME, { label: 'Services', path: '/services' }] },
);
addRoute(
  '/services/data-centers',
  (l) => fullTitle(l, tr(l, 'services', 'dataCenter.seo.title', 'Data Centre MEP Services')),
  (l) => tr(l, 'services', 'dataCenter.seo.description', NS[l].seo.defaultDescription),
  {
    mainEntity: (l) =>
      serviceEntity({
        name: tr(l, 'services', 'dataCenter.seo.title', 'Data Centre MEP Services'),
        description: tr(l, 'services', 'dataCenter.seo.description', NS[l].seo.defaultDescription),
        url: `${SITE_URL}/services/data-centers`,
      }),
    breadcrumb: () => [HOME, { label: 'Services', path: '/services' }, { label: 'Data Centres', path: '/services/data-centers' }],
  },
);
addRoute(
  '/services/bim-digital-engineering',
  (l) => fullTitle(l, tr(l, 'services', 'bimPage.seo.title', 'BIM & MEP Coordination')),
  (l) => tr(l, 'services', 'bimPage.seo.description', NS[l].seo.defaultDescription),
  {
    mainEntity: (l) =>
      serviceEntity({
        name: tr(l, 'services', 'bimPage.seo.title', 'BIM & MEP Coordination'),
        description: tr(l, 'services', 'bimPage.seo.description', NS[l].seo.defaultDescription),
        url: `${SITE_URL}/services/bim-digital-engineering`,
      }),
    breadcrumb: (l) => [HOME, { label: 'Services', path: '/services' }, { label: tr(l, 'services', 'items.bimDigitalEngineering.name', 'BIM & Digital Engineering'), path: '/services/bim-digital-engineering' }],
  },
);
addRoute(
  '/services/manufacturing-prefabrication',
  (l) => fullTitle(l, tr(l, 'services', 'manufacturingPage.seo.title', 'MEP Prefabrication')),
  (l) => tr(l, 'services', 'manufacturingPage.seo.description', NS[l].seo.defaultDescription),
  {
    mainEntity: (l) =>
      serviceEntity({
        name: tr(l, 'services', 'manufacturingPage.seo.title', 'MEP Prefabrication'),
        description: tr(l, 'services', 'manufacturingPage.seo.description', NS[l].seo.defaultDescription),
        url: `${SITE_URL}/services/manufacturing-prefabrication`,
      }),
    breadcrumb: () => [HOME, { label: 'Services', path: '/services' }, { label: 'Manufacturing & Prefabrication', path: '/services/manufacturing-prefabrication' }],
  },
);
addRoute(
  '/projects/categories',
  (l) => fullTitle(l, tr(l, 'projects', 'seo.title', 'Projects & Sectors')),
  (l) => tr(l, 'projects', 'seo.description', NS[l].seo.defaultDescription),
  { pageType: 'CollectionPage', breadcrumb: () => [HOME, { label: 'Projects', path: '/projects/categories' }] },
);
addRoute(
  '/newsroom',
  (l) => fullTitle(l, tr(l, 'newsroom', 'seo.title', 'MENASCO Newsroom | News & Insights')),
  (l) => tr(l, 'newsroom', 'seo.description', NS[l].seo.defaultDescription),
  { pageType: 'CollectionPage', breadcrumb: () => [HOME, { label: 'Newsroom', path: '/newsroom' }] },
);
addRoute(
  '/careers',
  (l) => fullTitle(l, tr(l, 'careers', 'seo.title', 'Careers at MENASCO | Join Our Team')),
  (l) => tr(l, 'careers', 'seo.description', NS[l].seo.defaultDescription),
  { breadcrumb: () => [HOME, { label: 'Careers', path: '/careers' }] },
);
addRoute(
  '/privacy-policy',
  (l) => fullTitle(l, tr(l, 'legal', 'privacy.seo.title', 'Privacy Policy')),
  (l) => tr(l, 'legal', 'privacy.seo.description', NS[l].seo.defaultDescription),
);
addRoute(
  '/terms',
  (l) => fullTitle(l, tr(l, 'legal', 'terms.seo.title', 'Terms of Use')),
  (l) => tr(l, 'legal', 'terms.seo.description', NS[l].seo.defaultDescription),
);
addRoute(
  '/lynxqc/privacy-policy',
  (l) => fullTitle(l, tr(l, 'legal', 'lynxqcPrivacy.seo.title', 'LYNXqc Privacy Policy | MENASCO')),
  (l) => tr(l, 'legal', 'lynxqcPrivacy.seo.description', NS[l].seo.defaultDescription),
  { breadcrumb: () => [HOME, { label: 'Innovation & Technology', path: '/innovation-technology' }, { label: 'LYNXqc Privacy Policy', path: '/lynxqc/privacy-policy' }] },
);

// ---------------------------------------------------------------------------
// Leadership profiles
// ---------------------------------------------------------------------------

for (const profile of leadershipProfiles) {
  const base = `leadershipProfiles.${profile.slug}`;
  addRoute(
    `/leadership/${profile.slug}`,
    (l) => fullTitle(l, tr(l, 'about', `${base}.seoTitle`, `${profile.fullRole}, ${profile.fullName}`)),
    (l) => tr(l, 'about', `${base}.seoDescription`, NS[l].seo.defaultDescription),
    {
      mainEntity: (l) =>
        personEntity({
          name: profile.fullName,
          jobTitle: tr(l, 'about', `${base}.fullRole`, profile.fullRole),
          url: `${SITE_URL}/leadership/${profile.slug}`,
          image: profile.photo ? `${SITE_URL}${profile.photo}` : undefined,
          sameAs: profile.linkedinHref ? [profile.linkedinHref] : undefined,
        }),
      breadcrumb: () => [
        HOME,
        { label: 'About', path: '/about' },
        { label: 'Leadership', path: '/about' },
        { label: profile.fullName, path: `/leadership/${profile.slug}` },
      ],
    },
  );
}

// ---------------------------------------------------------------------------
// Services (generic :slug detail pages only — BIM/Manufacturing/Data Centres
// have their own dedicated routes, added above)
// ---------------------------------------------------------------------------

for (const [slug, key] of Object.entries(serviceKeys)) {
  const svc = services.find((s) => s.slug === slug);
  if (!svc) continue;
  addRoute(
    `/services/${slug}`,
    (l) => fullTitle(l, tr(l, 'services', `items.${key}.seoTitle`, tr(l, 'services', `items.${key}.name`, svc.name))),
    (l) => tr(l, 'services', `items.${key}.seoDescription`, tr(l, 'services', `items.${key}.shortDescription`, svc.shortDescription)),
    {
      mainEntity: (l) =>
        serviceEntity({
          name: tr(l, 'services', `items.${key}.seoTitle`, tr(l, 'services', `items.${key}.name`, svc.name)),
          description: tr(l, 'services', `items.${key}.seoDescription`, tr(l, 'services', `items.${key}.shortDescription`, svc.shortDescription)),
          url: `${SITE_URL}/services/${slug}`,
        }),
      breadcrumb: (l) => [HOME, { label: 'Services', path: '/services' }, { label: tr(l, 'services', `items.${key}.name`, svc.name), path: `/services/${slug}` }],
    },
  );
}

// Note: the project-category hub's richer per-category titles
// (?category=...) aren't distinct filesystem paths — only the base
// "/projects/categories" title above is prerendered; the deep-linked title
// still renders correctly client-side for JS-executing crawlers.

// ---------------------------------------------------------------------------
// Individual projects
// ---------------------------------------------------------------------------

// ProjectDetailPage renders `project.title` verbatim (not overlaid per
// locale) — matching that exactly here rather than inventing a translation
// key that doesn't exist.
for (const project of projects) {
  const category = project.category ? projectCategories[project.category] : undefined;
  const seoDescriptionFor = (l: Locale) => {
    const categoryTitle = category ? tr(l, 'projects', `categories.${categoryKeys[category.slug] ?? category.slug}.title`, category.title) : undefined;
    const translatedDescription = tr(l, 'projects', `items.${project.slug}.description`, project.description);
    return pickProjectSeoDescription({
      locale: l,
      seoDescription: project.seoDescription,
      translatedDescription,
      rawEnglishDescription: project.description,
      fallback: buildProjectFallbackDescription({ title: project.title, location: project.location, country: project.country, categoryTitle, capacity: project.capacity }),
    });
  };
  const projectLocation = formatProjectLocation(project.location, project.country);
  addRoute(
    `/projects/${project.slug}`,
    (l) => fullTitle(l, project.title),
    (l) => seoDescriptionFor(l),
    {
      // MENASCO delivered the MEP engineering scope for this project — it is
      // not the project's owner, developer, or architect, so this is
      // deliberately a `Service` (what MENASCO did), not a claim of
      // ownership/creation over the project/building itself.
      mainEntity: (l) =>
        serviceEntity({
          name: `MENASCO MEP Engineering Scope: ${project.title}`,
          description: seoDescriptionFor(l),
          url: `${SITE_URL}/projects/${project.slug}`,
          areaServed: projectLocation ? [projectLocation] : undefined,
        }),
      // `category.title` used verbatim (not locale-translated) — matches
      // ProjectDetailPage.tsx's own breadcrumbJsonLd call exactly, which
      // reads the same static English field regardless of locale.
      breadcrumb: () => [
        HOME,
        { label: 'Projects / Sectors', path: '/projects/categories' },
        ...(category ? [{ label: category.title, path: `/projects/categories?category=${category.slug}` }] : []),
        { label: project.title, path: `/projects/${project.slug}` },
      ],
    },
  );
}

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
  // WebSite on the homepage, NewsArticle on newsroom articles) — same
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
  const jsonLdEntities: Record<string, unknown>[] = [
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
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(enUrl)}" />
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

function writeRoute(route: RouteMeta, locale: Locale) {
  const localizedPath = withLocale(route.path, locale); // "/", "/services/mechanical", "/ar", "/ar/services/mechanical"
  const head = buildHead(route, locale);
  const html = template
    .replace(/<html[^>]*>/, `<html lang="${locale}" dir="${directionForLocale(locale)}">`)
    .replace(/<head>[\s\S]*<\/head>/, `<head>${head}\n  </head>`);

  const segments = localizedPath.split('/').filter(Boolean);
  const outDir = segments.length > 0 ? join(DIST, ...segments) : DIST;
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
}

let count = 0;
for (const route of routes) {
  for (const locale of LOCALES) {
    // The bare "/" (and "/ar") route would collide with dist/index.html
    // itself — index.html already IS that file, `writeRoute` handles it
    // correctly (outDir === DIST for "/", a dedicated dist/ar/index.html
    // for the Arabic homepage), so no special-casing needed here.
    writeRoute(route, locale);
    count += 1;
  }
}

// eslint-disable-next-line no-console
console.log(`Generated ${count} route-specific SEO HTML shells under dist/ (${routes.length} routes x ${LOCALES.length} locales).`);

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
// the shells above, so the sitemap and the prerendered HTML can never drift
// apart. Query-string variants (e.g. /projects/categories?category=...)
// are never included, since routes only ever holds base canonical paths.
// No <changefreq>/<priority> (modern engines largely ignore them); no
// <lastmod> unless the route carries a real, sourced date (see RouteMeta).
// ---------------------------------------------------------------------------

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const sitemapUrls = routes.flatMap((route) =>
  LOCALES.map((locale) => {
    const loc = `${SITE_URL}${withLocale(route.path, locale)}`;
    const lastmodTag = route.lastmod ? `\n    <lastmod>${route.lastmod}</lastmod>` : '';
    return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmodTag}\n  </url>`;
  }),
);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemapXml, 'utf8');
// eslint-disable-next-line no-console
console.log(`Generated dist/sitemap.xml (${sitemapUrls.length} URLs).`);

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
