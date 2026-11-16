import { Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

export interface CertificationStripItem {
  label: string;
  /** Certificate PDF; when set the badge links to it (opens in a new tab). */
  href?: string;
}

export interface CertificationStripProps {
  /** Plain labels, or label + certificate link. */
  certifications: (string | CertificationStripItem)[];
  /** Horizontal alignment of the badge row (default centered). */
  align?: 'center' | 'start';
  theme?: Theme;
  className?: string;
}

export function CertificationStrip({ certifications, align = 'center', theme, className }: CertificationStripProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={cn('flex flex-wrap items-center gap-3', align === 'start' ? 'justify-start' : 'justify-center', className)}>
      {certifications.map((certification) => {
        const { label, href } = typeof certification === 'string' ? { label: certification, href: undefined } : certification;
        const className = cn(
          'inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-caption font-semibold uppercase tracking-wide',
          isDark ? 'border-white/15 text-gray-300' : 'border-gray-300 text-gray-600',
          href && (isDark ? 'transition-colors duration-base hover:border-white/40 hover:text-warmwhite' : 'transition-colors duration-base hover:border-gray-500 hover:text-ink'),
        );
        const content = (
          <>
            <Award size={13} aria-hidden="true" className="text-sand-500" />
            {label}
          </>
        );
        return href ? (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {content}
          </a>
        ) : (
          <span key={label} className={className}>
            {content}
          </span>
        );
      })}
    </div>
  );
}
