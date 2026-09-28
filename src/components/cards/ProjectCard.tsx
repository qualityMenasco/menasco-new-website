import { ArrowRight, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, StatText, Text } from '../typography/Typography';
import { Badge } from '../ui/Badge';

export type ProjectCardLayout = 'vertical' | 'horizontal' | 'featured';

export interface ProjectCardProps {
  image: string;
  imageAlt?: string;
  name: string;
  /** Omit any of these when not yet verified — the corresponding row is skipped rather than rendered empty. */
  location?: string;
  sector?: string;
  scope?: string;
  status?: string;
  metric?: { value: string; label: string };
  link?: { label: string; href: string };
  layout?: ProjectCardLayout;
  theme?: Theme;
  className?: string;
}

export function ProjectCard({
  image,
  imageAlt = '',
  name,
  location,
  sector,
  scope,
  status,
  metric,
  link,
  layout = 'vertical',
  theme,
  className,
}: ProjectCardProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const isHorizontal = layout === 'horizontal';
  const isFeatured = layout === 'featured';

  return (
    <article
      className={cn(
        'group flex overflow-hidden rounded-md border transition-colors duration-base ease-engineered',
        isHorizontal || isFeatured ? 'flex-col lg:flex-row' : 'flex-col',
        isDark ? 'border-white/10 bg-graphite hover:border-white/25' : 'border-gray-200 bg-warmwhite hover:border-gray-300',
        className,
      )}
    >
      <div
        className={cn(
          'overflow-hidden bg-gray-100',
          isFeatured ? 'aspect-[16/10] lg:aspect-auto lg:w-1/2' : isHorizontal ? 'aspect-[4/3] lg:aspect-auto lg:w-2/5 lg:shrink-0' : 'aspect-[4/3]',
        )}
      >
        <img
          src={image}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.04]"
        />
      </div>

      <div className={cn('flex flex-1 flex-col gap-5 p-6 md:p-8', isFeatured && 'lg:justify-center lg:p-10')}>
        {(sector || status) && (
          <div className="flex flex-wrap items-center gap-2">
            {sector && (
              <Badge variant="sector" theme={resolvedTheme}>
                {sector}
              </Badge>
            )}
            {status && (
              <Badge variant="status" theme={resolvedTheme}>
                {status}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Heading level={isFeatured ? 'h3' : 'h4'} theme={resolvedTheme}>
            {name}
          </Heading>
          {location && (
            <div className={cn('flex items-center gap-1.5 text-small', isDark ? 'text-gray-400' : 'text-gray-500')}>
              <MapPin size={15} aria-hidden="true" />
              <span>{location}</span>
            </div>
          )}
          {scope && (
            <Text theme={resolvedTheme} muted className="mt-1">
              {scope}
            </Text>
          )}
        </div>

        {metric && (
          <div className="flex items-baseline gap-2">
            <StatText as="span" theme={resolvedTheme} className="!text-h3">
              {metric.value}
            </StatText>
            <Text variant="small" theme={resolvedTheme} muted>
              {metric.label}
            </Text>
          </div>
        )}

        {link && (
          <SmartLink
            href={link.href}
            className={cn(
              'mt-auto inline-flex items-center gap-1.5 text-small font-semibold transition-colors duration-base',
              isDark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700',
            )}
          >
            {link.label}
            <ArrowRight size={16} aria-hidden="true" />
          </SmartLink>
        )}
      </div>
    </article>
  );
}
