import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { DropdownPanel } from './DropdownPanel';
import { MegaMenuPanel } from './MegaMenuPanel';
import type { NavItem } from './types';

function isRouteActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type DesktopNavGap = 'sm' | 'md';

const gapClasses: Record<DesktopNavGap, string> = {
  sm: 'gap-5',
  // Scales down smoothly below xl instead of a fixed gap-6, so the full
  // link list (6 items, non-wrapping) still fits at the app's narrowest
  // real desktop width without ever switching to a hamburger — see the
  // comment in HeaderShell.tsx for the full rationale. Caps at the same
  // 1.5rem (24px) gap-6 used before, so wide desktop is unchanged.
  md: 'gap-x-[clamp(0.625rem,1.4vw,1.5rem)] xl:gap-8 2xl:gap-12',
};

export interface DesktopNavProps {
  items: NavItem[];
  theme?: Theme;
  /** Tighten spacing for longer nav lists. Defaults to "md". */
  gap?: DesktopNavGap;
  className?: string;
  /** Overrides the default pathname-matching active check — e.g. for scrollspy-driven homepage nav. */
  isItemActive?: (item: NavItem) => boolean;
}

export function DesktopNav({ items, theme, gap = 'md', className, isItemActive }: DesktopNavProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const rootRef = useRef<HTMLUListElement>(null);
  // One trigger element per item, so Escape can hand focus back to whichever
  // trigger opened the panel instead of dropping it to <body>.
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const { pathname } = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpenLabel(null);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenLabel((current) => {
        if (current && rootRef.current?.contains(document.activeElement)) {
          triggerRefs.current[current]?.focus();
        }
        return null;
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <ul ref={rootRef} className={cn('relative flex items-center', gapClasses[gap], className)}>
      {items.map((item) => {
        const hasPanel = Boolean(item.dropdown || item.megaMenu);
        const isOpen = openLabel === item.label;
        const panelLinks = item.dropdown ?? item.megaMenu?.columns.flatMap((column) => column.links) ?? [];
        // Mega menus are wider than their trigger, so they anchor to the whole
        // nav list (centred in the header) rather than to their own item —
        // keeps a multi-column panel on screen at narrow desktop widths.
        const anchorToNav = Boolean(item.megaMenu);
        const defaultActive = hasPanel && !item.href ? panelLinks.some((link) => isRouteActive(pathname, link.href)) : isRouteActive(pathname, item.href);
        const isActive = isItemActive ? isItemActive(item) : defaultActive;
        const linkClasses = cn(
          'group relative inline-flex items-center gap-1.5 whitespace-nowrap text-small font-semibold tracking-normal transition-[color,letter-spacing] duration-base hover:tracking-wide',
          isActive
            ? isDark
              ? 'text-brand-400'
              : 'text-brand-600'
            : isOpen
              ? isDark
                ? 'text-warmwhite'
                : 'text-ink'
              : isDark
                ? 'text-gray-200 hover:text-warmwhite'
                : 'text-gray-700 hover:text-ink',
        );
        const underline = (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-base ease-engineered group-hover:scale-x-100',
              isActive && 'scale-x-100',
              isActive ? (isDark ? 'bg-brand-400' : 'bg-brand-600') : isDark ? 'bg-warmwhite' : 'bg-ink',
            )}
          />
        );

        return (
          <li
            key={item.label}
            className={cn(!anchorToNav && 'relative')}
            onMouseEnter={() => hasPanel && setOpenLabel(item.label)}
            onMouseLeave={() => hasPanel && setOpenLabel(null)}
            onBlur={(event) => {
              // Tabbing past the panel's last link (onward to the next top-level
              // item) leaves it open over the page with nothing focused inside
              // it — close it the moment focus moves outside this item.
              if (isOpen && !event.currentTarget.contains(event.relatedTarget as Node)) setOpenLabel(null);
            }}
          >
            {item.href ? (
              <SmartLink
                ref={(el) => {
                  triggerRefs.current[item.label] = el;
                }}
                href={item.href}
                className={linkClasses}
                aria-current={isActive ? 'page' : undefined}
                aria-expanded={hasPanel ? isOpen : undefined}
                aria-haspopup={hasPanel ? 'true' : undefined}
                onFocus={() => hasPanel && setOpenLabel(item.label)}
              >
                {isActive ? <h1 className="contents">{item.label}</h1> : item.label}
                {hasPanel && (
                  <ChevronDown size={15} aria-hidden="true" className={cn('transition-transform duration-base', isOpen && 'rotate-180')} />
                )}
                {underline}
              </SmartLink>
            ) : (
              <button
                ref={(el) => {
                  triggerRefs.current[item.label] = el;
                }}
                type="button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={() => setOpenLabel(isOpen ? null : item.label)}
                className={linkClasses}
              >
                {item.label}
                <ChevronDown size={15} aria-hidden="true" className={cn('transition-transform duration-base', isOpen && 'rotate-180')} />
                {underline}
              </button>
            )}

            <AnimatePresence>
              {isOpen && item.dropdown && (
                <div className="absolute start-0 top-full pt-3">
                  <DropdownPanel links={item.dropdown} theme={resolvedTheme} />
                </div>
              )}
              {isOpen && item.megaMenu && (
                <div className="absolute left-1/2 top-full w-[min(calc(100vw-3rem),60rem)] -translate-x-1/2 pt-3">
                  <MegaMenuPanel
                    columns={item.megaMenu.columns}
                    featured={item.megaMenu.featured}
                    footerLinks={item.megaMenu.footerLinks}
                    theme={resolvedTheme}
                  />
                </div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
