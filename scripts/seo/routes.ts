/**
 * SEO route registry — the single source of truth for every public route the
 * build prerenders a head shell for (scripts/generate-seo-html.ts) and lists
 * in the sitemap (scripts/seo/sitemap.ts, served at /sitemap.xml by the Vite
 * dev server and written to dist/sitemap.xml at build time).
 *
 * Pure data: reads locale JSON from public/locales at import time but
 * performs no writes, no process.exit and has no dependency on dist/, so it
 * can be loaded both by tsx (postbuild) and by Vite's ssrLoadModule (dev).
 * The dev loader references this file by path string (vite.config.ts,
 * `menasco-dev-sitemap`) — update it there if this module moves.
 *
 * Titles/descriptions come from the exact same sources each React page reads
 * at runtime (public/locales/*.json + the typed data modules under src/data);
 * this module only duplicates the "which key for which route" resolution.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL, SITE_NAME } from '../../src/seo/constants';
import { services } from '../../src/data/services';
import { projects } from '../../src/data/projects';
import { projectCategories } from '../../src/data/projectCategories';
import { leadershipProfiles } from '../../src/data/leadership';
import { buildProjectFallbackDescription, pickProjectSeoDescription, formatProjectLocation } from '../../src/seo/projectDescription';
import {
  organizationJsonLd,
  websiteJsonLd,
  serviceEntity,
  personEntity,
  type WebPageType,
  type BreadcrumbEntry,
} from '../../src/seo/structuredData';

export type Locale = 'en' | 'ar';
export const LOCALES: Locale[] = ['en', 'ar'];

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const PUBLIC_DIR = join(ROOT, 'public');

const NAMESPACES = ['about', 'careers', 'common', 'contact', 'home', 'legal', 'nav', 'newsroom', 'projects', 'seo', 'services'] as const;

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

export function siteName(locale: Locale): string {
  return NS[locale].seo.siteName as string;
}

/** Same rule as src/seo/SEO.tsx's fullTitle: a topic that already carries the site name is used verbatim (it's a fully custom title); everything else gets " | <SiteName>" appended. */
function fullTitle(locale: Locale, topic: string): string {
  const name = siteName(locale);
  return topic.includes(name) || topic.includes(SITE_NAME) ? topic : `${topic} | ${name}`;
}

export interface RouteMeta {
  /** Canonical (English) path, e.g. "/services/mechanical". */
  path: string;
  title: (locale: Locale) => string;
  description: (locale: Locale) => string;
  /**
   * ISO date (YYYY-MM-DD), only when there is a genuine, trustworthy
   * modification/publication date in the source data — never fabricated or
   * set to the build date. No registered route currently has one (Newsroom
   * articles are rendered per request by api/newsroom-article-page.ts and
   * aren't in this registry), so every route omits `<lastmod>` rather than
   * guess.
   */
  lastmod?: string;
  /** WebPage-family schema.org type for this route's auto-generated JSON-LD. Defaults to 'WebPage' — mirrors the `pageType` prop on <SEO>. */
  pageType?: WebPageType;
  /** A more specific entity (Service, Person) embedded as this route's structured-data `mainEntity` — mirrors the `mainEntity` prop on <SEO>. */
  mainEntity?: (locale: Locale) => Record<string, unknown> | undefined;
  /** Breadcrumb trail, mirroring the same `breadcrumbJsonLd([...])` call each page component already makes. */
  breadcrumb?: (locale: Locale) => BreadcrumbEntry[] | undefined;
  /** Additional standalone top-level JSON-LD entities beyond the auto WebPage (e.g. Organization+WebSite on the homepage). */
  extraJsonLd?: (locale: Locale) => Record<string, unknown>[] | undefined;
  /**
   * Structure-only route awaiting approved content — mirrors `<SEO noIndex>`:
   * the shell carries `noindex, nofollow` (or `noindex, follow` when `follow`
   * is set) and no JSON-LD, and the route is left out of the sitemap. It
   * still gets a shell so a hard load doesn't fall through to the "Page Not
   * Found" 404 shell.
   */
  noIndex?: boolean;
  /** Mirrors `<SEO follow>` — lets crawlers follow this noIndex page's links (its child links are real, indexable pages). */
  follow?: boolean;
}

export interface AddRouteOptions {
  lastmod?: string;
  pageType?: WebPageType;
  mainEntity?: (locale: Locale) => Record<string, unknown> | undefined;
  breadcrumb?: (locale: Locale) => BreadcrumbEntry[] | undefined;
  extraJsonLd?: (locale: Locale) => Record<string, unknown>[] | undefined;
  noIndex?: boolean;
  follow?: boolean;
}

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
};

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

export const routes: RouteMeta[] = [];

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
// Structure-only IA pages (src/pages/PendingContentPages.tsx) — noindex and
// excluded from the sitemap until approved content exists; see
// `pendingContentPaths` in src/data/navigation.ts. Titles mirror the page
// components' own <SEO> props.
// ---------------------------------------------------------------------------

const pendingDescription = (l: Locale) => tr(l, 'common', 'pendingContent.notice', NS[l].seo.defaultDescription);
const manufacturingGroupName = (l: Locale) => tr(l, 'nav', 'servicesGroups.manufacturingPrefabrication', 'Manufacturing & Prefabrication');
addRoute(
  '/services/mep',
  (l) => fullTitle(l, tr(l, 'nav', 'servicesGroups.mep', 'MEP')),
  pendingDescription,
  { noIndex: true, follow: true },
);
addRoute(
  '/services/civil',
  (l) => fullTitle(l, tr(l, 'nav', 'servicesGroups.civil', 'Civil')),
  pendingDescription,
  { noIndex: true, follow: true },
);
addRoute(
  '/services/manufacturing-prefabrication/modular',
  (l) => fullTitle(l, `${tr(l, 'nav', 'servicesList.modular', 'Modular')} | ${manufacturingGroupName(l)}`),
  pendingDescription,
  { noIndex: true, follow: true },
);
addRoute(
  '/services/manufacturing-prefabrication/custom',
  (l) => fullTitle(l, `${tr(l, 'nav', 'servicesList.custom', 'Custom')} | ${manufacturingGroupName(l)}`),
  pendingDescription,
  { noIndex: true, follow: true },
);
addRoute(
  '/services/turnkey-developments',
  (l) => fullTitle(l, tr(l, 'nav', 'servicesGroups.turnkeyDevelopments', 'Turnkey Developments')),
  pendingDescription,
  { noIndex: true, follow: true },
);
addRoute(
  '/certification-training',
  (l) => fullTitle(l, tr(l, 'nav', 'certificationTraining', 'MENASCO Certification & Training')),
  pendingDescription,
  { noIndex: true, follow: true },
);
