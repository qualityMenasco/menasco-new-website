import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';
import type { NavColumn, NavFeatured } from './types';

export interface MegaMenuPanelProps {
  columns: NavColumn[];
  featured?: NavFeatured;
  theme?: Theme;
  className?: string;
}

/** A restrained multi-column panel — keep columns to a handful of links each. */
export function MegaMenuPanel({ columns, featured, theme, className }: MegaMenuPanelProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const reducedMotion = useReducedMotion();
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
      transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        'grid grid-cols-1 gap-10 rounded-md border p-8 shadow-strong sm:grid-cols-2',
        featured ? 'lg:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))_18rem]' : 'lg:grid-cols-3',
        isDark ? 'border-white/10 bg-charcoal' : 'border-gray-200 bg-warmwhite',
        className,
      )}
    >
      {columns.map((column) => (
        <div key={column.heading} className="flex flex-col gap-3">
          <Text
            variant="small"
            theme={resolvedTheme}
            muted
            className="font-semibold uppercase tracking-wide"
          >
            {column.heading}
          </Text>
          <ul role="list" className="flex flex-col gap-3">
            {column.links.map((link) => (
              <li key={link.label}>
                <SmartLink
                  href={link.href}
                  className={cn(
                    'text-small font-medium transition-colors duration-base',
                    isDark ? 'text-gray-300 hover:text-brand-400' : 'text-gray-700 hover:text-brand-600',
                  )}
                >
                  {link.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {featured && (
        <SmartLink
          href={featured.href}
          className={cn('group flex flex-col gap-4 rounded-md border p-5', borderColor, isDark ? 'hover:border-white/25' : 'hover:border-gray-300')}
        >
          {featured.image && (
            <div className="aspect-[16/10] overflow-hidden rounded-sm bg-gray-100">
              <img
                src={featured.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.04]"
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Heading level="h4" theme={resolvedTheme}>
              {featured.title}
            </Heading>
            <Text variant="small" theme={resolvedTheme} muted>
              {featured.description}
            </Text>
            <span
              className={cn(
                'mt-1 inline-flex items-center gap-1.5 text-small font-semibold',
                isDark ? 'text-brand-400' : 'text-brand-600',
              )}
            >
              Learn more
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </div>
        </SmartLink>
      )}
    </motion.div>
  );
}
