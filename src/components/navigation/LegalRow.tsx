import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

export interface LegalRowProps {
  copyrightText: string;
  links?: { label: string; href: string }[];
  theme?: Theme;
  className?: string;
}

export function LegalRow({ copyrightText, links = [], theme, className }: LegalRowProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textColor = isDark ? 'text-gray-500' : 'text-gray-500';

  return (
    <div className={cn('flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between', borderColor, className)}>
      <p className={cn('text-caption', textColor)}>{copyrightText}</p>
      {links.length > 0 && (
        <ul role="list" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <SmartLink href={link.href} className={cn('text-caption transition-colors duration-base', textColor, isDark ? 'hover:text-warmwhite' : 'hover:text-ink')}>
                {link.label}
              </SmartLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
