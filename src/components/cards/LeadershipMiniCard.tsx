import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';

export interface LeadershipMiniCardProps {
  href: string;
  photo: string;
  photoAlt: string;
  name: string;
  role: string;
  theme?: Theme;
  className?: string;
}

/** Compact, clickable portrait + name + title card linking to a full leadership profile page — no bio, unlike the full LeadershipCard grid. */
export function LeadershipMiniCard({ href, photo, photoAlt, name, role, theme, className }: LeadershipMiniCardProps) {
  const { t } = useTranslation('about');
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <SmartLink
      href={href}
      aria-label={t('team.viewProfileLabel', { name, role, defaultValue: `View profile: ${name}, ${role}` })}
      className={cn(
        'group block overflow-hidden rounded-md border shadow-soft transition-[transform,box-shadow,border-color] duration-base ease-engineered hover:-translate-y-1 hover:shadow-strong focus-visible:-translate-y-1 focus-visible:shadow-strong',
        isDark ? 'border-white/10 bg-graphite hover:border-white/25' : 'border-gray-200 bg-stone hover:border-brand-300',
        className,
      )}
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-200">
        <img
          src={photo}
          alt={photoAlt}
          className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-105"
        />
      </div>
      <span aria-hidden="true" className="block h-0.5 w-0 bg-brand-500 transition-all duration-slow ease-engineered group-hover:w-full" />
      <div className="p-4">
        <Heading level="h4" as="h3" theme={resolvedTheme}>
          {name}
        </Heading>
        <Text variant="small" theme={resolvedTheme} muted className="mt-0.5">
          {role}
        </Text>
        <span
          aria-hidden="true"
          className={cn(
            'mt-2 flex -translate-x-1 items-center gap-1.5 text-small font-semibold text-brand-600 opacity-0 transition-all duration-base ease-engineered group-hover:translate-x-0 group-hover:opacity-100',
          )}
        >
          {t('team.viewProfile')}
          <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
        </span>
      </div>
    </SmartLink>
  );
}
