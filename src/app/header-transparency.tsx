import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from '../types';

export type HeaderTransparencyMode = 'auto' | 'always';

interface HeaderTransparencyValue {
  transparent: boolean;
  setTransparent: (value: boolean) => void;
  /** "auto" (default) drops to a solid bar once scrolled; "always" stays transparent for the page's lifetime. */
  mode: HeaderTransparencyMode;
  setMode: (mode: HeaderTransparencyMode) => void;
  /** When set, overrides the default scroll-derived light/dark theme (e.g. live background-brightness detection). */
  themeOverride: Theme | null;
  setThemeOverride: (value: Theme | null) => void;
}

const HeaderTransparencyContext = createContext<HeaderTransparencyValue>({
  transparent: false,
  setTransparent: () => {},
  mode: 'auto',
  setMode: () => {},
  themeOverride: null,
  setThemeOverride: () => {},
});

// This provider is mounted above <RouterProvider> (see App.tsx), so it has
// no access to useLocation() — reading the raw browser URL directly here is
// the only way to seed state before the first paint. Only used for a lazy
// useState initializer below (runs once, synchronously, before that first
// paint), never for reactive updates — route changes are already handled
// by each page's own useTransparentHeader/useHeaderThemeOverride effects.
function isQiddiyaProjectPath(pathname: string): boolean {
  return pathname === '/projects/qiddiya' || pathname === '/ar/projects/qiddiya';
}

export function HeaderTransparencyProvider({ children }: { children: ReactNode }) {
  // The Qiddiya cinematic project page needs its header dark (transparent,
  // 'always' mode) from the very first rendered frame — its frame sequence
  // and every timeline milestone are dark from the start (see
  // ProjectDetailPage.tsx's CINEMATIC_PROJECTS.qiddiya), so the ordinary
  // default-then-effect-corrects-it flow produces a real, visible
  // light-then-dark header flash on direct navigation/hard refresh, which
  // the mount effect (a moment later) is too late to prevent. Lazy
  // initializers run synchronously during the first render, before paint,
  // so seeding the correct values here — for this one route only — removes
  // the flash entirely without changing default behaviour anywhere else.
  const startsOnQiddiya = typeof window !== 'undefined' && isQiddiyaProjectPath(window.location.pathname);
  const [transparent, setTransparent] = useState(startsOnQiddiya);
  const [mode, setMode] = useState<HeaderTransparencyMode>(startsOnQiddiya ? 'always' : 'auto');
  const [themeOverride, setThemeOverride] = useState<Theme | null>(startsOnQiddiya ? 'dark' : null);
  return (
    <HeaderTransparencyContext.Provider
      value={{ transparent, setTransparent, mode, setMode, themeOverride, setThemeOverride }}
    >
      {children}
    </HeaderTransparencyContext.Provider>
  );
}

/** Read by SiteHeader to know whether the current route allows a transparent-over-hero state. */
export function useHeaderTransparencyState() {
  return useContext(HeaderTransparencyContext);
}

/**
 * Call from a page with a full-bleed hero (e.g. HomePage) to enable the transparent header while mounted.
 * Pass `alwaysTransparent: true` to keep it transparent for the page's whole scroll instead of the default
 * "solid after a short scroll" behaviour — for pages where a full-bleed visual runs the entire length.
 */
export function useTransparentHeader(enabled = true, options?: { alwaysTransparent?: boolean }) {
  const { setTransparent, setMode } = useContext(HeaderTransparencyContext);
  const alwaysTransparent = options?.alwaysTransparent ?? false;
  useEffect(() => {
    setTransparent(enabled);
    setMode(alwaysTransparent ? 'always' : 'auto');
    return () => {
      setTransparent(false);
      setMode('auto');
    };
  }, [enabled, alwaysTransparent, setTransparent, setMode]);
}

/**
 * Drives the header's logo/nav theme directly while mounted — e.g. from live
 * background-brightness detection under a transparent header — overriding
 * the default scroll-derived light/dark theme. Pass `null` to release it.
 */
export function useHeaderThemeOverride(theme: Theme | null) {
  const { setThemeOverride } = useContext(HeaderTransparencyContext);
  useEffect(() => {
    setThemeOverride(theme);
    return () => setThemeOverride(null);
  }, [theme, setThemeOverride]);
}
