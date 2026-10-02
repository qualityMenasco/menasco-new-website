import { lazy, Suspense } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { PageLoadingFallback } from './PageLoadingFallback';
import { getLocaleFromPath, withLocale } from '../lib/locale';
import { useIsDesktop } from '../lib/hooks';

function lazyPage(importer: () => Promise<{ default: ComponentType }>): ReactNode {
  const LazyComponent = lazy(importer);
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <LazyComponent />
    </Suspense>
  );
}

function ResponsiveSwitch({ Desktop, Mobile }: { Desktop: ComponentType; Mobile: ComponentType }) {
  const isDesktop = useIsDesktop();
  return isDesktop ? <Desktop /> : <Mobile />;
}

/**
 * A route that renders a different implementation above vs. at-or-below the
 * desktop/mobile breakpoint (see `useIsDesktop` in ../lib/hooks) — same URL,
 * same route, only the mounted component changes. Each side is `lazy()`, so
 * only the branch actually being rendered ever triggers its dynamic
 * `import()`; a mobile visitor never fetches desktop's chunk (hero video,
 * GSAP scroll-frame sequence, etc.) and vice versa. Switching back and forth
 * on resize re-renders from the already-loaded module, no re-fetch.
 */
function responsivePage(
  desktopImporter: () => Promise<{ default: ComponentType }>,
  mobileImporter: () => Promise<{ default: ComponentType }>,
): ReactNode {
  const Desktop = lazy(desktopImporter);
  const Mobile = lazy(mobileImporter);
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <ResponsiveSwitch Desktop={Desktop} Mobile={Mobile} />
    </Suspense>
  );
}

/**
 * Locale-aware redirect — `to` is always the canonical English path; this
 * resolves it to the equivalent /ar path when the redirect fires from
 * inside the /ar route tree, so old bookmarks/links never drop a user back
 * into English. See router.tsx's dual-mount (routeChildren under both
 * '/' and '/ar') for why a plain absolute <Navigate> wouldn't do this.
 */
function LocaleNavigate({ to }: { to: string }) {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  return <Navigate to={withLocale(to, locale)} replace />;
}

const routeChildren: RouteObject[] = [
  { index: true, element: responsivePage(() => import('../pages/HomePage'), () => import('../mobile/pages/HomePage')) },
  { path: 'about', element: responsivePage(() => import('../pages/AboutPage'), () => import('../mobile/pages/AboutPage')) },
  { path: 'contact', element: responsivePage(() => import('../pages/ContactPage'), () => import('../mobile/pages/ContactPage')) },
  // Desktop-only for now — no mobile leadership profile pages exist yet, so
  // these render the desktop implementation regardless of viewport width.
  { path: 'leadership/helmi-badawiyeh', element: lazyPage(() => import('../pages/HelmiBadawiyehPage')) },
  { path: 'leadership/bahaa-badawiyeh', element: lazyPage(() => import('../pages/BahaaBadawiyehPage')) },
  { path: 'services', element: responsivePage(() => import('../pages/ServicesPage'), () => import('../mobile/pages/ServicesPage')) },
  // Desktop-only for now — no mobile Data Centres page exists yet.
  { path: 'services/data-centers', element: lazyPage(() => import('../pages/services/DataCenterPage')) },
  { path: 'services/data-centres', element: lazyPage(() => import('../pages/services/DataCenterPage')) },
  { path: 'services/bim-digital-engineering', element: responsivePage(() => import('../pages/services/BIMPage'), () => import('../mobile/pages/services/BIMPage')) },
  {
    path: 'services/manufacturing-prefabrication',
    element: responsivePage(() => import('../pages/services/ManufacturingPrefabricationPage'), () => import('../mobile/pages/services/ManufacturingPrefabricationPage')),
  },
  // Structure-only pages for the grouped Services / About IA — single
  // shared implementation, noIndex until approved content exists (see
  // pendingContentPaths in data/navigation.ts).
  { path: 'services/mep', element: lazyPage(() => import('../pages/PendingContentPages').then((m) => ({ default: m.MepPage }))) },
  { path: 'services/civil', element: lazyPage(() => import('../pages/PendingContentPages').then((m) => ({ default: m.CivilPage }))) },
  { path: 'services/manufacturing-prefabrication/modular', element: lazyPage(() => import('../pages/PendingContentPages').then((m) => ({ default: m.ModularPage }))) },
  { path: 'services/manufacturing-prefabrication/custom', element: lazyPage(() => import('../pages/PendingContentPages').then((m) => ({ default: m.CustomPage }))) },
  { path: 'services/turnkey-developments', element: lazyPage(() => import('../pages/PendingContentPages').then((m) => ({ default: m.TurnkeyDevelopmentsPage }))) },
  { path: 'services/:slug', element: responsivePage(() => import('../pages/ServiceDetailPage'), () => import('../mobile/pages/ServiceDetailPage')) },
  // The old standalone Projects landing page (large VELA/Saudi F1 banners) is
  // retired — "Explore Our Projects" now scrolls to the homepage's own
  // Featured Projects section instead. This route only exists so that
  // old bookmarks/links to the bare /projects URL still land somewhere real.
  { path: 'projects', element: <LocaleNavigate to="/projects/categories" /> },
  // Same path, differently-named components on each side (ProjectCategoriesPage
  // vs. ProjectsSectorsPage) — both are the "browse by sector" hub page.
  { path: 'projects/categories', element: responsivePage(() => import('../pages/ProjectCategoriesPage'), () => import('../mobile/pages/ProjectsSectorsPage')) },
  // The dedicated per-category pages are retired — Project Categories is
  // the single hub for browsing by category, with the category
  // prioritized via ?category=. These routes (and the old three-category
  // slugs, from before the 2026-08-06 move to four categories) only
  // exist so old bookmarks/links still land on the right category.
  { path: 'projects/hotel-residential', element: <LocaleNavigate to="/projects/categories?category=residential-commercial" /> },
  { path: 'projects/landmark-entertainment', element: <LocaleNavigate to="/projects/categories?category=hospitality-landmark-entertainment" /> },
  { path: 'projects/mission-critical', element: <LocaleNavigate to="/projects/categories?category=advanced-technical-facilities" /> },
  { path: 'projects/:slug', element: responsivePage(() => import('../pages/ProjectDetailPage'), () => import('../mobile/pages/ProjectDetailPage')) },
  // The standalone Sectors page is retired — Project Categories is now the
  // single hub for browsing by sector. This route only exists so old
  // bookmarks/links to the bare /sectors URL still land somewhere real.
  { path: 'sectors', element: <LocaleNavigate to="/projects/categories" /> },
  { path: 'certification-training', element: lazyPage(() => import('../pages/PendingContentPages').then((m) => ({ default: m.CertificationTrainingPage }))) },
  { path: 'quality-safety', element: responsivePage(() => import('../pages/QualitySafetyPage'), () => import('../mobile/pages/QualitySafetyPage')) },
  { path: 'team', element: responsivePage(() => import('../pages/TeamPage'), () => import('../mobile/pages/TeamPage')) },
  { path: 'esg-reporting', element: responsivePage(() => import('../pages/ESGReportingPage'), () => import('../mobile/pages/ESGReportingPage')) },
  // Same path, differently-named components on each side (InnovationTechnologyPage vs. InnovationPage).
  { path: 'innovation-technology', element: responsivePage(() => import('../pages/InnovationTechnologyPage'), () => import('../mobile/pages/InnovationPage')) },
  { path: 'newsroom', element: responsivePage(() => import('../pages/NewsroomPage'), () => import('../mobile/pages/NewsroomPage')) },
  { path: 'newsroom/:slug', element: responsivePage(() => import('../pages/NewsDetailPage'), () => import('../mobile/pages/NewsDetailPage')) },
  { path: 'careers', element: responsivePage(() => import('../pages/CareersPage'), () => import('../mobile/pages/CareersPage')) },
  { path: 'privacy-policy', element: responsivePage(() => import('../pages/PrivacyPolicyPage'), () => import('../mobile/pages/PrivacyPolicyPage')) },
  { path: 'terms', element: responsivePage(() => import('../pages/TermsPage'), () => import('../mobile/pages/TermsPage')) },
  // Single shared implementation for both breakpoints — see LynxqcPrivacyPolicyPage's own comment.
  { path: 'lynxqc/privacy-policy', element: lazyPage(() => import('../pages/LynxqcPrivacyPolicyPage')) },
  // Desktop-only internal design-system preview tool — no mobile equivalent, not a real content page.
  { path: 'dev/preview', element: lazyPage(() => import('../preview/ComponentPreviewPage')) },
  // Desktop-only internal Newsroom editorial review/publishing tool (Phase 3) — no mobile equivalent, not linked from the public site, noIndex.
  { path: 'dev/newsroom-admin', element: lazyPage(() => import('../internal/newsroom/NewsroomAdminPage')) },
  // Desktop-only internal Projects data-entry tool (Phase 4) — no mobile equivalent, not linked from the public site, noIndex.
  { path: 'dev/projects-admin', element: lazyPage(() => import('../internal/projects/ProjectsAdminPage')) },
  { path: '404', element: lazyPage(() => import('../pages/NotFoundPage')) },
  { path: '*', element: lazyPage(() => import('../pages/NotFoundPage')) },
];

export const router = createBrowserRouter([
  { path: '/', element: <RootLayout />, children: routeChildren },
  { path: '/ar', element: <RootLayout />, children: routeChildren },
]);
