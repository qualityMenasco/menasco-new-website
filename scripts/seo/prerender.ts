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
 * - `src/main.tsx` uses `hydrateRoot` (not `createRoot`) for exactly the
 *   page loads this module successfully prerendered (signaled via the
 *   `data-prerendered="true"` marker `generate-seo-html.ts` sets on `#root`
 *   — see src/lib/prerenderHydration.ts). An earlier version of this file
 *   used `createRoot`, on the theory that fully discarding and re-rendering
 *   sidesteps hydration risk entirely — a real production check found that
 *   discard itself caused a visible blank/skeleton flash whenever the
 *   route's lazy-loaded JS chunk hadn't finished downloading yet (the
 *   `createRoot` render still has to suspend on that chunk). `hydrateRoot`
 *   reuses this markup instead, so the real page stays visible continuously
 *   from first paint through interactivity — see src/lib/hooks.ts's
 *   `useIsDesktop` for the matching client-side half of this fix (the
 *   client's FIRST render must deterministically agree with the mobile tree
 *   below, even on a desktop browser, or hydration itself would mismatch).
 * - `useIsDesktop()` (src/lib/hooks.ts) already resolves to `false` when
 *   `window` is undefined, so rendering here deterministically produces the
 *   MOBILE component tree for every responsive route — the same branch a
 *   real mobile visitor's first paint would show, and the one Google's
 *   mobile-first indexing cares about most.
 * - VELA and Qiddiya are deliberately NOT in `PRERENDER_PATHS` (see below).
 *   Their mobile template renders safely here (same as any other project),
 *   but the desktop cinematic/GSAP treatment that replaces it after mount
 *   is a much bigger visual transition than an ordinary responsive swap —
 *   full-viewport canvas frame sequence, ScrollTrigger pin-spacer height
 *   changes, async frame-image loads — and forcing that transition to
 *   happen automatically, once, right after every desktop pageload carries
 *   real risk of its own (a multi-frame layout "settling" jump) that a
 *   plain value-mismatch-into-client-re-render doesn't have on ordinary
 *   pages. These two keep today's plain `createRoot` behavior instead —
 *   correct UX matters more here than forcing them into this phase.
 * - One content source: this renders the actual React components, not a
 *   hand-written SEO-only copy. If a page's real copy changes, this output
 *   changes with it automatically on the next build.
 * - No new dependency: `react-dom/server` ships with `react-dom`;
 *   `createMemoryRouter`/`RouterProvider` ship with `react-router-dom`; both
 *   are already dependencies of this project.
 * - Renders via `renderToPipeableStream` (resolved at `onAllReady`), not
 *   `renderToStaticMarkup`, and wraps the tree in `<Suspense>` boundaries at
 *   the SAME two nesting positions the real client tree has (one outer,
 *   around the whole app — mirroring src/App.tsx; one inner, around just
 *   the matched route's component — mirroring src/app/router.tsx's
 *   `lazyPage`/`responsivePage`). Both are required together: a real
 *   production check found that `renderToStaticMarkup` never emits the
 *   `<!--$-->`/`<!--/$-->` comment markers `hydrateRoot` needs to recognize
 *   a Suspense boundary's content as already-resolved, and the client tree
 *   has `<Suspense>` boundaries this file's tree didn't — so every single
 *   hydration attempt failed (React error #418), regardless of locale,
 *   viewport, or network speed, and React fell back to discarding the
 *   prerendered DOM and doing a full client re-render (#423) — reproducing
 *   the exact flash this prerendering work exists to prevent. Confirmed
 *   empirically that both changes together (streaming API + matching tree
 *   shape) resolve this with zero hydration errors, including with the
 *   client's i18n backend genuinely still loading.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { createElement, Fragment, Suspense } from 'react';
import type { ComponentType } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import { I18N_NAMESPACES } from '../../src/lib/i18n';
import { PageLoadingFallback } from '../../src/app/PageLoadingFallback';
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

// `modulePath` is the exact source path Vite's build manifest
// (dist/.vite/manifest.json, enabled via `build.manifest` in
// vite.config.ts) keys a dynamically-imported module's chunk under —
// generate-seo-html.ts reads it to emit `<link rel="modulepreload">` hints
// for a prerendered route's real component chunk, so hydrateRoot never has
// to suspend on a still-downloading chunk (see this file's module comment).
//
// `desktopModulePath`, where the route has a true responsive split
// (src/app/router.tsx's `responsivePage()`), is the SAME preload treatment
// for the desktop component — not needed for the initial hydration (which
// always renders mobile), but needed for the moment right after, when
// `useIsDesktop()`'s post-mount correction flips a real desktop visitor
// over to the desktop tree: without this, that flip re-suspends on a
// still-downloading desktop chunk and briefly shows the generic loading
// skeleton again — confirmed live on a throttled connection before this
// field existed. Routes rendered via `lazyPage()` (one shared component,
// no responsive split — e.g. Data Centres) omit it; there's no second tree.
// `desktopImporter`, alongside `desktopModulePath`, lets `renderRouteBody`
// actually render the desktop tree too (not just preload-hint it) — see
// this file's module comment's "dual-render" paragraph: the server must
// emit BOTH CSS-toggled trees here, matching router.tsx's `ResponsiveSwitch`
// unsettled output exactly, or the client's first (also-unsettled, because
// `settled` starts false on every prerendered load) hydration pass mismatches.
const PATTERNS: { pattern: string; importer: Importer; modulePath: string; desktopModulePath?: string; desktopImporter?: Importer }[] = [
  {
    pattern: '/',
    importer: () => import('../../src/mobile/pages/HomePage'),
    modulePath: 'src/mobile/pages/HomePage.tsx',
    desktopModulePath: 'src/pages/HomePage.tsx',
    desktopImporter: () => import('../../src/pages/HomePage'),
  },
  {
    pattern: '/about',
    importer: () => import('../../src/mobile/pages/AboutPage'),
    modulePath: 'src/mobile/pages/AboutPage.tsx',
    desktopModulePath: 'src/pages/AboutPage.tsx',
    desktopImporter: () => import('../../src/pages/AboutPage'),
  },
  {
    pattern: '/services',
    importer: () => import('../../src/mobile/pages/ServicesPage'),
    modulePath: 'src/mobile/pages/ServicesPage.tsx',
    desktopModulePath: 'src/pages/ServicesPage.tsx',
    desktopImporter: () => import('../../src/pages/ServicesPage'),
  },
  { pattern: '/services/data-centers', importer: () => import('../../src/pages/services/DataCenterPage'), modulePath: 'src/pages/services/DataCenterPage.tsx' },
  {
    pattern: '/services/bim-digital-engineering',
    importer: () => import('../../src/mobile/pages/services/BIMPage'),
    modulePath: 'src/mobile/pages/services/BIMPage.tsx',
    desktopModulePath: 'src/pages/services/BIMPage.tsx',
    desktopImporter: () => import('../../src/pages/services/BIMPage'),
  },
  {
    pattern: '/services/manufacturing-prefabrication',
    importer: () => import('../../src/mobile/pages/services/ManufacturingPrefabricationPage'),
    modulePath: 'src/mobile/pages/services/ManufacturingPrefabricationPage.tsx',
    desktopModulePath: 'src/pages/services/ManufacturingPrefabricationPage.tsx',
    desktopImporter: () => import('../../src/pages/services/ManufacturingPrefabricationPage'),
  },
  {
    pattern: '/services/:slug',
    importer: () => import('../../src/mobile/pages/ServiceDetailPage'),
    modulePath: 'src/mobile/pages/ServiceDetailPage.tsx',
    desktopModulePath: 'src/pages/ServiceDetailPage.tsx',
    desktopImporter: () => import('../../src/pages/ServiceDetailPage'),
  },
  {
    pattern: '/projects/categories',
    importer: () => import('../../src/mobile/pages/ProjectsSectorsPage'),
    modulePath: 'src/mobile/pages/ProjectsSectorsPage.tsx',
    desktopModulePath: 'src/pages/ProjectCategoriesPage.tsx',
    desktopImporter: () => import('../../src/pages/ProjectCategoriesPage'),
  },
  {
    pattern: '/projects/:slug',
    importer: () => import('../../src/mobile/pages/ProjectDetailPage'),
    modulePath: 'src/mobile/pages/ProjectDetailPage.tsx',
    desktopModulePath: 'src/pages/ProjectDetailPage.tsx',
    desktopImporter: () => import('../../src/pages/ProjectDetailPage'),
  },
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
  // /projects/vela-by-omniyat and /projects/qiddiya are deliberately
  // excluded — see this file's module comment above (the "VELA and Qiddiya
  // are deliberately NOT in PRERENDER_PATHS" paragraph) for why.
];

function matchPattern(path: string): { pattern: string; importer: Importer; modulePath: string; desktopModulePath?: string; desktopImporter?: Importer } | null {
  const segments = path.split('/').filter(Boolean);
  for (const candidate of PATTERNS) {
    const candidateSegments = candidate.pattern.split('/').filter(Boolean);
    if (candidateSegments.length !== segments.length) continue;
    const matches = candidateSegments.every((seg, i) => seg.startsWith(':') || seg === segments[i]);
    if (matches) return candidate;
  }
  return null;
}

/** The Vite build-manifest source-path key(s) for `canonicalPath`'s component — `mobile` is what's actually prerendered/hydrated; `desktop`, where the route has a true responsive split, is preloaded too so a desktop visitor's post-mount viewport correction never re-suspends on a still-downloading chunk. Both null if the path isn't in PRERENDER_PATHS or matches no known pattern. */
export function getModulePathsForRoute(canonicalPath: string): { mobile: string; desktop: string | null } | null {
  if (!PRERENDER_PATHS.includes(canonicalPath)) return null;
  const match = matchPattern(canonicalPath);
  if (!match) return null;
  return { mobile: match.modulePath, desktop: match.desktopModulePath ?? null };
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
  // Mirrors router.tsx's `ResponsiveSwitch` exactly for its unsettled
  // (server-rendered) branch: `settled` starts `false` whenever `window` is
  // undefined (src/lib/hooks.ts's `useIsDesktopInternal`), which is always
  // true here, so the client's first hydration pass against this markup is
  // also unsettled and must produce the SAME dual CSS-toggle output — see
  // this file's module comment and router.tsx's `ResponsiveSwitch` doc
  // comment for why (a desktop visitor otherwise sees the mobile tree for
  // as long as hydration takes, not just one frame).
  const DesktopComponent = match.desktopImporter ? await resolveComponent(match.desktopImporter, `${match.pattern}#desktop`) : null;
  const i18nInstance = createPrerenderI18n(locale);

  const routePattern = match.pattern.slice(1); // react-router patterns have no leading slash
  const initialEntry = locale === 'ar' ? `/ar${canonicalPath}` : canonicalPath;

  const pageContent = DesktopComponent
    ? createElement(
        Fragment,
        null,
        createElement('div', { className: 'hidden desktop:contents' }, createElement(DesktopComponent)),
        createElement('div', { className: 'contents desktop:hidden' }, createElement(Component)),
      )
    : createElement(Component);

  // Inner Suspense wraps just the route's own component — mirrors
  // src/app/router.tsx's `lazyPage`/`responsivePage` helpers exactly, which
  // wrap every real route's `lazy()` component the same way.
  const routeElement = createElement(Suspense, { fallback: createElement(PageLoadingFallback) }, pageContent);

  const memoryRouter = createMemoryRouter(
    [
      {
        path: '/',
        element: createElement(RootLayout),
        children: [{ path: routePattern, element: routeElement }],
      },
      {
        path: '/ar',
        element: createElement(RootLayout),
        children: [{ path: routePattern, element: routeElement }],
      },
    ],
    { initialEntries: [initialEntry] },
  );

  // Outer Suspense wraps the whole provider/router tree — mirrors
  // src/App.tsx's own outer `<Suspense fallback={<PageLoadingFallback/>}>`.
  const tree = createElement(
    Suspense,
    { fallback: createElement(PageLoadingFallback) },
    createElement(
      I18nextProvider,
      { i18n: i18nInstance },
      createElement(HelmetProvider, null, createElement(HeaderTransparencyProvider, null, createElement(RouterProvider, { router: memoryRouter }))),
    ),
  );

  return renderStreamToString(tree);
}

/** renderToStaticMarkup doesn't emit the Suspense hydration markers hydrateRoot needs (see this file's module comment) — renderToPipeableStream does, resolved once every boundary has genuinely settled. */
function renderStreamToString(tree: ReturnType<typeof createElement>): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = '';
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk.toString();
        callback();
      },
    });
    const { pipe } = renderToPipeableStream(tree, {
      onAllReady() {
        pipe(writable);
        writable.on('finish', () => resolve(html));
      },
      onError(error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    });
  });
}
