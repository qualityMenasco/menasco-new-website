import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { HeadingLevel, IconComponent, Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';

export interface ServiceCardProps {
  icon?: IconComponent;
  image?: string;
  imageAlt?: string;
  title: string;
  description: string;
  link?: { label: string; href: string };
  featured?: boolean;
  /** Semantic tag for the title — defaults to h3; use h4 when cards sit under an h3 group heading. */
  headingAs?: HeadingLevel;
  theme?: Theme;
  className?: string;
}

export function ServiceCard({
  icon: Icon,
  image,
  imageAlt = '',
  title,
  description,
  link,
  featured = false,
  headingAs = 'h3',
  theme,
  className,
}: ServiceCardProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-5 overflow-hidden rounded-md border p-7 transition-colors duration-base ease-engineered md:p-8',
        featured
          ? isDark
            ? 'border-brand-700 bg-charcoal'
            : 'border-brand-200 bg-warmwhite'
          : isDark
            ? 'border-white/10 bg-graphite hover:border-white/25'
            : 'border-gray-200 bg-warmwhite hover:border-gray-300',
        className,
      )}
    >
      {featured && <span className="absolute inset-x-0 top-0 h-1 bg-brand-600" aria-hidden="true" />}

      {image ? (
        <div className="-mx-7 -mt-7 aspect-[16/10] overflow-hidden bg-gray-100 md:-mx-8 md:-mt-8">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.04]"
          />
        </div>
      ) : (
        Icon && (
          <span
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-sm',
              featured ? 'bg-brand-600 text-warmwhite' : isDark ? 'bg-white/10 text-brand-400' : 'bg-stone text-brand-600',
            )}
          >
            <Icon size={24} aria-hidden="true" />
          </span>
        )
      )}

      <div className="flex flex-1 flex-col gap-2">
        <Heading level="h4" as={headingAs} theme={resolvedTheme}>
          {title}
        </Heading>
        <Text theme={resolvedTheme}>{description}</Text>
      </div>

      {link && (
        <SmartLink
          href={link.href}
          className={cn(
            'inline-flex items-center gap-1.5 text-small font-semibold transition-colors duration-base',
            isDark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700',
          )}
        >
          {link.label}
          <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-base group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </SmartLink>
      )}
    </article>
  );
}
