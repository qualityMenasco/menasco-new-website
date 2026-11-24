import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import { stripLocale } from '../../lib/locale';
import { isNavLinkActive } from '../../lib/navActive';
import type { Theme } from '../../types';
import type { NavLink } from './types';

export interface DropdownPanelProps {
  links: NavLink[];
  theme?: Theme;
  className?: string;
}

/** A simple positioned link list — wrap with `absolute` positioning at the call site. */
export function DropdownPanel({ links, theme, className }: DropdownPanelProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const reducedMotion = useReducedMotion();
  // The page you're on (or a page nested under it) is highlighted in the panel. When several
  // links match (All Services /services and Civil /services/civil), only the most specific wins.
  const path = stripLocale(useLocation().pathname);
  const currentHref = links
    .filter((link) => isNavLinkActive(path, link.href))
    .sort((a, b) => b.href.split('#')[0].length - a.href.split('#')[0].length)[0]?.href;

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
      transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        'min-w-[16rem] rounded-md border p-2 shadow-strong',
        isDark ? 'border-white/10 bg-charcoal' : 'border-gray-200 bg-warmwhite',
        className,
      )}
    >
      <ul role="list" className="flex flex-col">
        {links.map((link) => {
          const current = link.href === currentHref;
          return (
          <li key={link.label}>
            <SmartLink
              href={link.href}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'block rounded-sm px-4 py-3 text-small font-medium transition-colors duration-base',
                current
                  ? isDark
                    ? 'bg-white/5 font-semibold text-brand-400'
                    : 'bg-stone font-semibold text-brand-600'
                  : isDark
                    ? 'text-gray-300 hover:bg-white/5 hover:text-warmwhite'
                    : 'text-gray-700 hover:bg-stone hover:text-ink',
              )}
            >
              {link.label}
              {link.description && (
                <span className={cn('mt-0.5 block text-caption', isDark ? 'text-gray-500' : 'text-gray-500')}>
                  {link.description}
                </span>
              )}
            </SmartLink>
          </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
