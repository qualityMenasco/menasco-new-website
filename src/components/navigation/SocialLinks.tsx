import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { IconComponent, Theme } from '../../types';

export interface SocialLink {
  platform: string;
  href: string;
  icon: IconComponent;
}

export interface SocialLinksProps {
  links: SocialLink[];
  theme?: Theme;
  className?: string;
}

export function SocialLinks({ links, theme, className }: SocialLinksProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <ul role="list" className={cn('flex items-center gap-2', className)}>
      {links.map(({ platform, href, icon: Icon }) => (
        <li key={platform}>
          <a
            href={href}
            aria-label={platform}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors duration-base',
              isDark ? 'border-white/15 text-gray-300 hover:border-white/30 hover:text-warmwhite' : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-ink',
            )}
          >
            <Icon size={16} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
