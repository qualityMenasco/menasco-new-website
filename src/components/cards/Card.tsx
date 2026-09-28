import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { IconComponent, Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';
import { Badge } from '../ui/Badge';

export interface CardProps {
  title: string;
  description?: string;
  icon?: IconComponent;
  image?: string;
  imageAlt?: string;
  label?: string;
  link?: { label: string; href: string };
  theme?: Theme;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export function Card({
  title,
  description,
  icon: Icon,
  image,
  imageAlt = '',
  label,
  link,
  theme,
  layout = 'vertical',
  className,
}: CardProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const isHorizontal = layout === 'horizontal';

  return (
    <article
      className={cn(
        'group flex overflow-hidden rounded-md border transition-colors duration-base ease-engineered',
        isHorizontal ? 'flex-col sm:flex-row' : 'flex-col',
        isDark ? 'border-white/10 bg-graphite hover:border-white/25' : 'border-gray-200 bg-warmwhite hover:border-gray-300',
        className,
      )}
    >
      {image && (
        <div
          className={cn(
            'overflow-hidden bg-gray-100',
            isHorizontal ? 'aspect-[4/3] sm:aspect-auto sm:w-2/5 sm:shrink-0' : 'aspect-[16/10]',
          )}
        >
          <img
            src={image}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.04]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
        {(Icon || label) && (
          <div className="flex items-center justify-between">
            {Icon && (
              <span
                className={cn(
                  'inline-flex h-11 w-11 items-center justify-center rounded-sm',
                  isDark ? 'bg-white/10 text-brand-400' : 'bg-stone text-brand-600',
                )}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
            )}
            {label && <Badge theme={resolvedTheme}>{label}</Badge>}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2">
          <Heading level="h4" theme={resolvedTheme}>
            {title}
          </Heading>
          {description && <Text theme={resolvedTheme}>{description}</Text>}
        </div>

        {link && (
          <SmartLink
            href={link.href}
            className={cn(
              'mt-1 inline-flex items-center gap-1.5 text-small font-semibold transition-colors duration-base',
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
