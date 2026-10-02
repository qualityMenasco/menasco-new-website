import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';
import type { NavColumn, NavFeatured, NavLink } from './types';

export interface MegaMenuPanelProps {
  columns: NavColumn[];
  featured?: NavFeatured;
  /** Full-width row of secondary links beneath the columns. */
  footerLinks?: NavLink[];
  /** Label for the featured card's call to action — pass a translated string. */
  featuredCtaLabel?: string;
  theme?: Theme;
  className?: string;
}

const columnCountClasses: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

/** A restrained multi-column panel — keep columns to a handful of links each. */
export function MegaMenuPanel({ columns, featured, footerLinks, featuredCtaLabel = 'Learn more', theme, className }: MegaMenuPanelProps) {
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
        featured ? 'lg:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))_18rem]' : (columnCountClasses[columns.length] ?? 'lg:grid-cols-3'),
        isDark ? 'border-white/10 bg-charcoal' : 'border-gray-200 bg-warmwhite',
        className,
      )}
    >
      {columns.map((column) => {
        // A column heading that links to its own parent page reads as
        // ink/white with a trailing arrow, exactly like the footer row below
        // — so PARENT = clickable landing page is unambiguous everywhere in
        // this menu. A heading with no page of its own stays the quieter
        // muted/uppercase label, so the two states are visibly different by
        // design rather than left for the visitor to guess.
        return (
          <div key={column.heading} className="flex flex-col gap-3">
            {column.href ? (
              <SmartLink
                href={column.href}
                className={cn(
                  'group inline-flex items-center gap-1.5 text-small font-semibold normal-case tracking-normal underline-offset-4 transition-colors duration-base hover:underline',
                  isDark ? 'text-warmwhite hover:text-brand-400' : 'text-ink hover:text-brand-600',
                )}
              >
                {column.heading}
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="shrink-0 transition-transform duration-base group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </SmartLink>
            ) : (
              <Text variant="small" theme={resolvedTheme} muted className="text-small font-semibold uppercase tracking-wide">
                {column.heading}
              </Text>
            )}
            {column.links.length > 0 && (
              <ul role="list" className={cn('flex flex-col gap-3', column.href && cn('border-s ps-3', borderColor))}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <SmartLink
                      href={link.href}
                      className={cn(
                        'text-small font-medium transition-colors duration-base',
                        isDark ? 'text-gray-400 hover:text-warmwhite' : 'text-gray-600 hover:text-ink',
                      )}
                    >
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {footerLinks && footerLinks.length > 0 && (
        <ul role="list" className={cn('col-span-full flex flex-wrap gap-x-8 gap-y-2 border-t pt-5', borderColor)}>
          {footerLinks.map((link) => (
            <li key={link.href}>
              <SmartLink
                href={link.href}
                className={cn(
                  'group inline-flex items-center gap-1.5 text-small font-semibold transition-colors duration-base',
                  isDark ? 'text-warmwhite hover:text-brand-400' : 'text-ink hover:text-brand-600',
                )}
              >
                {link.label}
                <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
              </SmartLink>
            </li>
          ))}
        </ul>
      )}

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
              {featuredCtaLabel}
              <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
            </span>
          </div>
        </SmartLink>
      )}
    </motion.div>
  );
}
