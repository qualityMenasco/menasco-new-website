import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';

export interface LeadershipCardProps {
  photo: string;
  photoAlt?: string;
  name: string;
  role: string;
  bio: string;
  href: string;
  theme?: Theme;
  className?: string;
}

/** Portrait card for a leadership grid — soft image zoom and elevation on hover, no layout jump. */
export function LeadershipCard({ photo, photoAlt, name, role, bio, href, theme, className }: LeadershipCardProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-md border transition-[transform,box-shadow,border-color] duration-base ease-engineered hover:-translate-y-1 hover:shadow-strong',
        isDark ? 'border-white/10 bg-graphite hover:border-white/25' : 'border-gray-200 bg-warmwhite hover:border-gray-300',
        className,
      )}
    >
      <div className="aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={photo}
          alt={photoAlt ?? ''}
          className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
        <div>
          <Heading level="h4" theme={resolvedTheme}>
            {name}
          </Heading>
          <Text variant="small" theme={resolvedTheme} className="mt-0.5 font-semibold text-brand-600">
            {role}
          </Text>
        </div>
        <Text variant="small" theme={resolvedTheme} muted className="flex-1">
          {bio}
        </Text>
        <SmartLink
          href={href}
          className={cn(
            'mt-1 inline-flex items-center gap-1.5 text-small font-semibold transition-colors duration-base',
            isDark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700',
          )}
        >
          View Profile
          <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-base group-hover:translate-x-0.5" />
        </SmartLink>
      </div>
    </article>
  );
}
