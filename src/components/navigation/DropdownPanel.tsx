import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
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
        {links.map((link) => (
          <li key={link.label}>
            <SmartLink
              href={link.href}
              className={cn(
                'block rounded-sm px-4 py-3 text-small font-medium transition-colors duration-base',
                isDark ? 'text-gray-300 hover:bg-white/5 hover:text-warmwhite' : 'text-gray-700 hover:bg-stone hover:text-ink',
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
        ))}
      </ul>
    </motion.div>
  );
}
