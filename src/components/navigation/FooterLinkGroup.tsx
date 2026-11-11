import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Text } from '../typography/Typography';
import type { NavColumn } from './types';

export interface FooterLinkGroupProps extends NavColumn {
  /**
   * 2 = newspaper-style columns (down the first, then the second). Each column
   * stacks independently, so a two-line link never leaves a gap beside it.
   */
  columns?: 1 | 2;
  theme?: Theme;
  className?: string;
}

export function FooterLinkGroup({ heading, links, columns = 1, theme, className }: FooterLinkGroupProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const twoColumns = columns === 2;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Text variant="small" theme={resolvedTheme} muted className="font-semibold uppercase tracking-wide">
        {heading}
      </Text>
      <ul role="list" className={twoColumns ? 'columns-2 gap-x-8' : 'flex flex-col gap-3'}>
        {links.map((link) => (
          <li key={link.label} className={cn(twoColumns && 'mb-3 break-inside-avoid')}>
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
