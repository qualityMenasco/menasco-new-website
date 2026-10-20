import { useEffect, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { MobileHeader } from '../mobile/components/MobileHeader';
import { MobileMenu } from '../mobile/components/MobileMenu';
import { MobileFooter } from '../mobile/components/MobileFooter';
import { BackToTopButton } from '../mobile/components/BackToTopButton';
import { scrollToSectionWhenReady } from '../lib/scrollToSection';
import { getLocaleFromPath, directionForLocale } from '../lib/locale';
import { useIsDesktopSettled } from '../lib/hooks';

/**
 * Single source of truth for scroll position on route entry — deliberately
 * replaces react-router's <ScrollRestoration>, whose own remembered-position
 * restore was racing this and winning unpredictably (reload landed at top on
 * some routes but not others). No hash → top of page, every time, including
 * on a hard refresh, since a reload is just a fresh mount like any other
 * route entry. With a hash (e.g. "/#services", landed on directly or via
 * SmartLink's cross-page navigation) → scroll to that section instead.
 *
 * A layout effect (not a passive one) so the reset runs before the browser
 * paints and before any newly-mounted route content's own effects run —
 * e.g. ScrollFrameAnimation's GSAP ScrollTrigger reads window.scrollY on
 * mount to compute its initial progress, so landing here with the previous
 * page's scroll position still in place (client-side navigation never
 * resets scroll on its own) was starting the animation mid-sequence.
 */
function useScrollOnRouteChange() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      return scrollToSectionWhenReady(hash.slice(1), 'auto');
    }
    // Explicit 'auto' — html has `scroll-behavior: smooth` globally, and an
    // animated slide-up here is exactly the visible jump this is meant to
    // prevent, plus it leaves window.scrollY mid-transition for whatever
    // instant a newly-mounted route's own effects (e.g. ScrollFrameAnimation's
    // GSAP ScrollTrigger) read it to compute their initial state.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, hash]);
}

/**
 * The URL is the single source of truth for locale (see src/lib/locale.ts) —
 * this keeps i18next's active language and the document's lang/dir
 * attributes in sync with it on every navigation, including the very first
 * render and direct hard-refreshes on an /ar/... URL. Runs once here,
 * above the desktop/mobile shell switch, so language never resets or
 * flickers when the viewport crosses the responsive breakpoint.
 */
function useLocaleSync() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const locale = getLocaleFromPath(pathname);
    const direction = directionForLocale(locale);
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [pathname, i18n]);
}

function SkipLink({ t }: { t: TFunction<'common'> }) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-small focus:font-semibold focus:text-warmwhite"
    >
      {t('skipToContent')}
    </a>
  );
}

function DesktopShell() {
  const { t } = useTranslation('common');
  return (
    <>
      <SkipLink t={t} />
      <SiteHeader />
      <main id="main-content">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}

function MobileShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation('common');
  return (
    <>
      <SkipLink t={t} />
      <MobileHeader onOpenMenu={() => setIsMenuOpen(true)} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      {/* No bottom padding here — MobileFooter's own bottom padding already clears BackToTopButton; padding on <main> left a light strip between each page's closing CTA band and the dark footer. */}
      {/* tabIndex -1: focusable target for the skip link and BackToTopButton's focus hand-off. */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <MobileFooter />
      <BackToTopButton />
    </>
  );
}

/**
 * Renders BOTH the desktop and mobile chrome at once, each wrapped in a
 * `desktop:` (1025px, matching `DESKTOP_QUERY` exactly — see
 * tailwind.config.js) CSS toggle so a real browser's CSS engine decides
 * which one is actually visible BEFORE first paint, with zero JS involved
 * in that decision. This exists only for the one unsettled render of a
 * prerendered page load (see `useIsDesktopSettled`): the prerender always
 * ships the MOBILE shell's markup, and forcing the client's first render to
 * match it for a safe `hydrateRoot` meant a real desktop visitor briefly
 * saw mobile chrome — the hamburger icon and mobile header — for however
 * long it took a `useLayoutEffect` correction to swap trees. Shipping both,
 * CSS-toggled, from the very first paint removes that window entirely: the
 * correct chrome is visible immediately regardless of how long React takes
 * to settle, with no blank gap (both are real, fully-painted markup, never
 * hidden-then-revealed-empty) and no hydration risk (server and client
 * render the same unconditional two-tree output, so there's nothing left
 * that depends on viewport at render time to mismatch on).
 *
 * The routed page's content is deliberately NOT duplicated this way — only
 * one `<Outlet/>` renders here — see this file's RootLayout comment for why
 * that's a separate, smaller, already-acceptable tradeoff.
 */
function UnsettledDualShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation('common');
  return (
    <>
      <SkipLink t={t} />
      <div className="hidden desktop:contents">
        <SiteHeader />
      </div>
      <div className="contents desktop:hidden">
        <MobileHeader onOpenMenu={() => setIsMenuOpen(true)} />
        <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      </div>
      {/* Page content isn't dual-rendered (see this component's doc
          comment) — the mobile tree's own content keeps correcting itself
          independently, exactly as before this fix. */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <div className="hidden desktop:contents">
        <SiteFooter />
      </div>
      <div className="contents desktop:hidden">
        <MobileFooter />
        <BackToTopButton />
      </div>
    </>
  );
}

/**
 * Renders the desktop or mobile chrome (header/nav/footer) depending on
 * viewport width — see `useIsDesktop` (src/lib/hooks.ts) for the shared
 * 1024px breakpoint. The routed page itself switches independently at the
 * same breakpoint via `responsivePage()` in router.tsx; both reads of
 * `useIsDesktop()` are backed by the same matchMedia query, so the shell and
 * the page always agree with each other and with the live viewport,
 * including on resize — no reload, no remount of unrelated state.
 *
 * On a prerendered page's very first paint, `settled` is briefly `false`
 * (see `useIsDesktopSettled`) — for that one render, both shells are
 * rendered at once (`UnsettledDualShell`) so a real desktop visitor's
 * browser shows the correct chrome immediately via CSS, never the mobile
 * one. Every other render (including the very next one, once mounted, and
 * every non-prerendered page load) takes the plain single-branch path
 * exactly as before this fix.
 */
export function RootLayout() {
  useScrollOnRouteChange();
  useLocaleSync();
  const { isDesktop, settled } = useIsDesktopSettled();

  if (!settled) return <UnsettledDualShell />;
  return isDesktop ? <DesktopShell /> : <MobileShell />;
}
