import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Text } from '../typography/Typography';
import type { NavColumn } from './types';

export interface FooterLinkGroupProps extends NavColumn {
  theme?: Theme;
  className?: string;
}

export function FooterLinkGroup({ heading, links, theme, className }: FooterLinkGroupProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Text variant="small" theme={resolvedTheme} muted className="font-semibold uppercase tracking-wide">
        {heading}
      </Text>
      <ul role="list" className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <SmartLink
              href={link.href}
              className={cn('text-small transition-colors duration-base', isDark ? 'text-gray-400 hover:text-warmwhite' : 'text-gray-600 hover:text-ink')}
            >
              {link.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
