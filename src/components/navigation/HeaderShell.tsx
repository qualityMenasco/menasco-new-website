import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Container } from '../layout/Container';

export type HeaderVariant = 'solid' | 'transparent';
/**
 * "none" means the nav/actions are always shown and `mobileControl` is
 * never shown — for consumers (like SiteHeader) that already only ever
 * mount above the app's real desktop/mobile breakpoint (see useIsDesktop in
 * lib/hooks.ts), so there is nothing left for an internal CSS breakpoint to
 * do except prematurely collapse the nav into a redundant second hamburger
 * state before the app's actual mobile layout ever kicks in.
 */
export type HeaderNavBreakpoint = 'lg' | 'xl' | 'none';

export interface HeaderShellProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  logo: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  mobileControl?: ReactNode;
  theme?: Theme;
  sticky?: boolean;
  /** Both variants render the same frosted-glass bar (blurred, translucent) — "transparent" additionally floats fixed over hero content (with `floatOverContent`) instead of sitting in normal document flow. */
  variant?: HeaderVariant;
  /**
   * Take the header out of flow (fixed) while transparent, instead of the
   * default sticky-but-in-flow, so its own box doesn't reveal page background
   * above a hero meant to start at y=0. Off by default — most transparent-header
   * pages size their hero content assuming the header's normal in-flow space;
   * only opt a page in once its hero has matching top clearance for a floating header.
   */
  floatOverContent?: boolean;
  /** Breakpoint at which the desktop nav (vs. the mobile control) appears — raise to "xl" for longer nav lists. */
  navBreakpoint?: HeaderNavBreakpoint;
}

const navBreakpointClasses: Record<HeaderNavBreakpoint, { nav: string; actions: string; mobile: string }> = {
  lg: { nav: 'hidden lg:flex', actions: 'hidden lg:flex', mobile: 'lg:hidden' },
  xl: { nav: 'hidden xl:flex', actions: 'hidden xl:flex', mobile: 'xl:hidden' },
  none: { nav: 'flex', actions: 'flex', mobile: 'hidden' },
};

/** Structural header — logo, nav slot, actions slot. Content and routing are supplied by the consumer. */
export function HeaderShell({
  logo,
  nav,
  actions,
  mobileControl,
  theme,
  sticky = true,
  variant = 'solid',
  navBreakpoint = 'lg',
  floatOverContent = false,
  className,
  ...rest
}: HeaderShellProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const isTransparent = variant === 'transparent';
  const breakpoint = navBreakpointClasses[navBreakpoint];

  return (
    <header
      className={cn(
        // Single glass treatment for every header state — the fully
        // transparent/invisible bar `variant="transparent"` used to render
        // (no background, no blur) is gone; `variant` now only decides
        // whether the header floats fixed over hero content (see
        // `floatOverContent` below), not what it looks like. Matches the
        // site-wide "one navbar treatment" requirement: same blur strength,
        // same translucency, same border/shadow everywhere, light or dark
        // theme, hero page or not.
        'z-40 w-full border-b backdrop-blur-md backdrop-saturate-150 shadow-sm transition-[background-color,border-color,box-shadow] duration-slow ease-engineered',
        sticky && (floatOverContent && isTransparent ? 'fixed inset-x-0 top-0' : 'sticky top-0'),
        isDark ? 'border-white/10 bg-charcoal/65' : 'border-gray-200/60 bg-warmwhite/65',
        className,
      )}
      {...rest}
    >
      {/*
        Fixed px-16 gutters (and a fixed gap-6 row) are exactly what forced
        the nav into a premature hamburger before: at the app's narrowest
        real desktop width (see useIsDesktop, lib/hooks.ts) the logo+nav+
        actions row's natural content is wider than the viewport minus that
        fixed padding, and since none of those three children can shrink
        below their own content width (nav's links are whitespace-nowrap),
        the overflow pushed the actions block past the container edge.
        Scaling the gutter/gap down smoothly with viewport width instead of
        a fixed value closes that gap while staying visually identical
        (clamps at the same values Container's own lg:px-16 / gap-6 already
        used) at anything wide enough that the row was never at risk.
      */}
      <Container gutter={false} className="px-[clamp(1.5rem,5vw,4rem)]">
        <div className="flex h-20 items-center justify-between gap-x-[clamp(0.75rem,2vw,1.5rem)]">
          <div className="shrink-0">{logo}</div>
          {nav && <nav className={cn('flex-1 items-center justify-center', breakpoint.nav)}>{nav}</nav>}
          <div className="flex shrink-0 items-center gap-4">
            {actions && <div className={breakpoint.actions}>{actions}</div>}
            {mobileControl && <div className={breakpoint.mobile}>{mobileControl}</div>}
          </div>
        </div>
      </Container>
    </header>
  );
}
