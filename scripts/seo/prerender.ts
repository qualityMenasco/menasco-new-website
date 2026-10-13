/**
 * Selective body prerendering for the highest-value public routes.
 *
 * `generate-seo-html.ts` already writes a correct, route-specific `<head>`
 * for every public route, but leaves `<body>` as the bare `<div id="root">`
 * React mounts into — a non-JS crawler/AI fetcher sees no page text, no
 * heading, no internal links. This module renders the REAL page component
 * (same source as the live site) to static markup at build time and hands
 * that string back to `generate-seo-html.ts` to drop into that same `<div
 * id="root">` for a deliberately small, explicit allowlist of routes.
 *
 * Design choices (see the SEO/Codebase Organization audit this implements):
 * - `src/main.tsx` keeps using `createRoot` (not `hydrateRoot`) — the client
 *   bundle, once it runs, fully replaces this server-rendered markup rather
 *   than reconciling with it. That is deliberate: it means there is no
 *   hydration-mismatch risk category to worry about at all. This prerendered
 *   HTML exists purely for fetchers that never run JS; a real browser visit
 *   behaves exactly as it did before this change.
 * - `useIsDesktop()` (src/lib/hooks.ts) already resolves to `false` when
 *   `window` is undefined, so rendering here deterministically produces the
 *   MOBILE component tree for every responsive route — the same branch a
 *   real mobile visitor's first paint would show, and the one Google's
 *   mobile-first indexing cares about most. This is also what keeps VELA and
 *   Qiddiya safe to include: their protected desktop-only cinematic/GSAP
 *   treatment never renders here, only their plain shared mobile project
 *   template (confirmed by the empirical render test performed before this
 *   file existed).
 * - One content source: this renders the actual React components, not a
 *   hand-written SEO-only copy. If a page's real copy changes, this output
 *   changes with it automatically on the next build.
 * - No new dependency: `react-dom/server` ships with `react-dom`;
 *   `createMemoryRouter`/`RouterProvider` ship with `react-router-dom`; both
 *   are already dependencies of this project.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import type { ComponentType } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import { I18N_NAMESPACES } from '../../src/lib/i18n';
import { HeaderTransparencyProvider } from '../../src/app/header-transparency';
import { RootLayout } from '../../src/app/RootLayout';
import type { Locale } from './routes';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const PUBLIC_DIR = join(ROOT, 'public');

// ---------------------------------------------------------------------------
// A standalone, synchronous i18next instance for prerendering only — mirrors
// src/lib/i18n.ts's real namespace list exactly (imported, not duplicated),
// but loads resources directly from disk instead of src/lib/i18n.ts's
// `i18next-http-backend` (which does a relative `fetch('/locales/...')` —
// meaningless, and broken, outside a browser). src/app/i18n.ts's live
// runtime instance is never touched or reused here.
// ---------------------------------------------------------------------------

type Resources = Record<string, Record<string, unknown>>;

function loadResources(): Record<Locale, Resources> {
  const resources = { en: {}, ar: {} } as Record<Locale, Resources>;
  for (const locale of ['en', 'ar'] as Locale[]) {
    for (const ns of I18N_NAMESPACES) {
      resources[locale][ns] = JSON.parse(readFileSync(join(PUBLIC_DIR, 'locales', locale, `${ns}.json`), 'utf8'));
    }
  }
  return resources;
}

let cachedResources: Record<Locale, Resources> | null = null;

function createPrerenderI18n(locale: Locale) {
  cachedResources ??= loadResources();
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    ns: I18N_NAMESPACES,
    defaultNS: 'common',
    resources: cachedResources,
    react: { useSuspense: false },
    interpolation: { escapeValue: false },
  });
  return instance;
}

// ---------------------------------------------------------------------------
// Component resolution — a small, explicit map of ROUTE PATTERN -> mobile
// (or shared) component for exactly the paths this module is asked to
// prerender. This does not duplicate scripts/seo/routes.ts's registry: it
// carries no title/description/JSON-LD/noIndex logic (that stays the single
// responsibility of routes.ts) — only "which component renders this
// pattern," which route.tsx's lazy()-wrapped elements can't provide
// synchronously (a Suspense-pending lazy import renders its loading
// fallback, not real content, on a single synchronous renderToStaticMarkup
// pass). Every import below targets the exact same module a real mobile
// visitor's browser loads.
// ---------------------------------------------------------------------------

type Importer = () => Promise<{ default: ComponentType }>;

const PATTERNS: { pattern: string; importer: Importer }[] = [
  { pattern: '/', importer: () => import('../../src/mobile/pages/HomePage') },
  { pattern: '/about', importer: () => import('../../src/mobile/pages/AboutPage') },
  { pattern: '/services', importer: () => import('../../src/mobile/pages/ServicesPage') },
  { pattern: '/services/data-centers', importer: () => import('../../src/pages/services/DataCenterPage') },
  { pattern: '/services/bim-digital-engineering', importer: () => import('../../src/mobile/pages/services/BIMPage') },
  { pattern: '/services/manufacturing-prefabrication', importer: () => import('../../src/mobile/pages/services/ManufacturingPrefabricationPage') },
  { pattern: '/services/:slug', importer: () => import('../../src/mobile/pages/ServiceDetailPage') },
  { pattern: '/projects/categories', importer: () => import('../../src/mobile/pages/ProjectsSectorsPage') },
  { pattern: '/projects/:slug', importer: () => import('../../src/mobile/pages/ProjectDetailPage') },
  // '/newsroom' is deliberately NOT in this map: its component module graph
  // reads `import.meta.env.VITE_NEWSROOM_API_BASE_URL` (src/lib/newsroomApiConfig.ts)
  // at module-evaluation time — a Vite-bundler-only global that doesn't
  // exist when this script runs under plain Node/tsx, so importing it here
  // throws before any render/network call happens. Fixing that would mean
  // either running this step through a real Vite SSR build (bigger change
  // than warranted for phase 1) or adding an env shim purely for this one
  // page. Excluded for now — see PRERENDER_PATHS and the final report.
];

/** The exact, deliberately small set of canonical paths this build prerenders body HTML for. Every entry here must also exist as a real route in scripts/seo/routes.ts — checked at call time, not assumed. */
export const PRERENDER_PATHS: string[] = [
  '/',
  '/about',
  '/services',
  '/services/mechanical',
  '/services/electrical',
  '/services/plumbing',
  '/services/fire-protection',
  '/services/bim-digital-engineering',
  '/services/manufacturing-prefabrication',
  '/services/data-centers',
  '/projects/categories',
  '/projects/casa-cavalli',
  '/projects/pcfc-headquarters-building',
  '/projects/alamein-towers',
  '/projects/town-square-development',
  '/projects/data-centre-vii',
  '/projects/vela-by-omniyat',
  '/projects/qiddiya',
];

function matchPattern(path: string): { pattern: string; importer: Importer } | null {
  const segments = path.split('/').filter(Boolean);
  for (const candidate of PATTERNS) {
    const candidateSegments = candidate.pattern.split('/').filter(Boolean);
    if (candidateSegments.length !== segments.length) continue;
    const matches = candidateSegments.every((seg, i) => seg.startsWith(':') || seg === segments[i]);
    if (matches) return candidate;
  }
  return null;
}

const resolvedComponentCache = new Map<string, ComponentType>();

async function resolveComponent(importer: Importer, cacheKey: string): Promise<ComponentType> {
  const cached = resolvedComponentCache.get(cacheKey);
  if (cached) return cached;
  const mod = await importer();
  resolvedComponentCache.set(cacheKey, mod.default);
  return mod.default;
}

/**
 * Renders the real page for `canonicalPath` (English path, e.g.
 * "/projects/casa-cavalli") at `locale` to a static HTML string — the exact
 * markup to place inside the generated shell's `<div id="root">`. Returns
 * `null` if this path isn't in the prerender allowlist (caller should leave
 * the body empty, as today) and throws if a path IS in the allowlist but
 * fails to render (a loud build failure, never a silently-shipped partial
 * page — see this module's fail-safe contract).
 */
export async function renderRouteBody(canonicalPath: string, locale: Locale): Promise<string | null> {
  if (!PRERENDER_PATHS.includes(canonicalPath)) return null;

  const match = matchPattern(canonicalPath);
  if (!match) {
    throw new Error(`prerender: "${canonicalPath}" is in PRERENDER_PATHS but matches no known component pattern — add it to PATTERNS in scripts/seo/prerender.ts.`);
  }

  const Component = await resolveComponent(match.importer, match.pattern);
  const i18nInstance = createPrerenderI18n(locale);

  const routePattern = match.pattern.slice(1); // react-router patterns have no leading slash
  const initialEntry = locale === 'ar' ? `/ar${canonicalPath}` : canonicalPath;

  const memoryRouter = createMemoryRouter(
    [
      {
        path: '/',
        element: createElement(RootLayout),
        children: [{ path: routePattern, element: createElement(Component) }],
      },
      {
        path: '/ar',
        element: createElement(RootLayout),
        children: [{ path: routePattern, element: createElement(Component) }],
      },
    ],
    { initialEntries: [initialEntry] },
  );

  const tree = createElement(
    I18nextProvider,
    { i18n: i18nInstance },
    createElement(HelmetProvider, null, createElement(HeaderTransparencyProvider, null, createElement(RouterProvider, { router: memoryRouter }))),
  );

  return renderToStaticMarkup(tree);
}
