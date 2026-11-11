import type { ComponentType } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

/** A lucide icon or one of the custom brand marks (X, Threads). */
export type SocialIconComponent = ComponentType<{ size?: number | string; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

export interface SocialLink {
  platform: string;
  /** Empty while the profile URL is unconfirmed — the icon then renders as a non-clickable placeholder. */
  href: string;
  icon: SocialIconComponent;
}

export interface SocialLinksProps {
  links: SocialLink[];
  theme?: Theme;
  className?: string;
}

export function SocialLinks({ links, theme, className }: SocialLinksProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const base = 'inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors duration-base';
  const live = isDark ? 'border-white/15 text-gray-300 hover:border-white/30 hover:text-warmwhite' : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-ink';
  const placeholder = isDark ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400';

  return (
    <ul role="list" className={cn('flex flex-wrap items-center gap-2', className)}>
      {links.map(({ platform, href, icon: Icon }) => (
        <li key={platform}>
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={platform} className={cn(base, live)}>
              <Icon size={16} aria-hidden="true" />
            </a>
          ) : (
            <span role="img" aria-label={platform} title={platform} className={cn(base, placeholder)}>
              <Icon size={16} aria-hidden="true" />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
