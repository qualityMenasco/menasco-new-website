import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Accent, IconComponent, Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';

const CORNER_SIZE = '2.75rem';

/** Exported so other compositions using this same signature chamfer (e.g. SectorsShowcase's split title/description modules) don't redefine it. */
export const chamferClipPath: CSSProperties = {
  clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${CORNER_SIZE}), calc(100% - ${CORNER_SIZE}) 100%, 0 100%)`,
};

export const accentClasses: Record<Accent, string> = {
  brand: 'bg-brand-600',
  sand: 'bg-sand-400',
  gray: 'bg-gray-400',
};

export const accentTextClasses: Record<Accent, string> = {
  brand: 'text-brand-600',
  sand: 'text-sand-500',
  gray: 'text-gray-500',
};

export interface CurvedCardProps {
  title: string;
  description?: string;
  icon?: IconComponent;
  image?: string;
  imageAlt?: string;
  number?: string;
  link?: { label: string; href: string };
  accent?: Accent;
  theme?: Theme;
  className?: string;
}

/** MENASCO's signature panel — a sharp rectangular card with one chamfered corner. */
export function CurvedCard({
  title,
  description,
  icon: Icon,
  image,
  imageAlt = '',
  number,
  link,
  accent = 'brand',
  theme,
  className,
}: CurvedCardProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <article
      style={chamferClipPath}
      className={cn(
        'relative flex flex-col overflow-hidden border transition-colors duration-base ease-engineered',
        isDark ? 'border-white/10 bg-charcoal hover:border-white/20' : 'border-gray-200 bg-warmwhite hover:border-gray-300',
        className,
      )}
    >
      <span className={cn('block h-1 w-16', accentClasses[accent])} aria-hidden="true" />

      {image && (
        <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-8 md:p-10">
        <div className="flex items-start justify-between gap-4">
          {Icon && (
            <span
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-sm',
                isDark ? 'bg-white/10' : 'bg-stone',
                accentTextClasses[accent],
              )}
            >
              <Icon size={22} aria-hidden="true" />
            </span>
          )}
          {number && (
            <span
              className={cn(
                'font-display text-h2 font-semibold leading-none',
                isDark ? 'text-white/10' : 'text-gray-100',
              )}
              aria-hidden="true"
            >
              {number}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <Heading level="h4" as="h3" theme={resolvedTheme}>
            {title}
          </Heading>
          {description && <Text theme={resolvedTheme}>{description}</Text>}
        </div>

        {link && (
          <SmartLink
            href={link.href}
            className={cn('mt-1 inline-flex items-center gap-1.5 text-small font-semibold transition-colors duration-base', accentTextClasses[accent], 'hover:opacity-80')}
          >
            {link.label}
            <ArrowRight size={16} aria-hidden="true" />
          </SmartLink>
        )}
      </div>
    </article>
  );
}
