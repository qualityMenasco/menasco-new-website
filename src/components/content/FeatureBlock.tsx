import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { IconComponent, Theme } from '../../types';
import { Eyebrow, Heading, Text } from '../typography/Typography';
import { ProfessionalList, type ListItemData } from './ProfessionalList';

export interface FeatureBlockProps {
  icon?: IconComponent;
  image?: string;
  imageAlt?: string;
  eyebrow?: string;
  heading: string;
  description?: string;
  list?: ListItemData[];
  cta?: { label: string; href: string };
  theme?: Theme;
  className?: string;
}

export function FeatureBlock({
  icon: Icon,
  image,
  imageAlt = '',
  eyebrow,
  heading,
  description,
  list,
  cta,
  theme,
  className,
}: FeatureBlockProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-md border p-8 md:p-10',
        isDark ? 'border-white/10 bg-charcoal' : 'border-gray-200 bg-warmwhite',
        className,
      )}
    >
      {image ? (
        <div className="-mx-8 -mt-8 aspect-[16/9] overflow-hidden bg-gray-100 md:-mx-10 md:-mt-10">
          <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
        </div>
      ) : (
        Icon && (
          <span className={cn('inline-flex h-12 w-12 items-center justify-center rounded-sm', isDark ? 'bg-white/10 text-brand-400' : 'bg-stone text-brand-600')}>
            <Icon size={24} aria-hidden="true" />
          </span>
        )
      )}

      <div className="flex flex-col gap-3">
        {eyebrow && <Eyebrow theme={resolvedTheme}>{eyebrow}</Eyebrow>}
        <Heading level="h3" theme={resolvedTheme}>
          {heading}
        </Heading>
        {description && <Text theme={resolvedTheme}>{description}</Text>}
      </div>

      {list && list.length > 0 && <ProfessionalList items={list} variant="rule" theme={resolvedTheme} />}

      {cta && (
        <SmartLink
          href={cta.href}
          className={cn(
            'mt-1 inline-flex items-center gap-1.5 self-start text-small font-semibold transition-colors duration-base',
            isDark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700',
          )}
        >
          {cta.label}
          <ArrowRight size={16} aria-hidden="true" />
        </SmartLink>
      )}
    </div>
  );
}
