import { Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

export interface CertificationStripProps {
  certifications: string[];
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
      {certifications.map((certification) => (
        <span
          key={certification}
          className={cn(
            'inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-caption font-semibold uppercase tracking-wide',
            isDark ? 'border-white/15 text-gray-300' : 'border-gray-300 text-gray-600',
          )}
        >
          <Award size={13} aria-hidden="true" className="text-sand-500" />
          {certification}
        </span>
      ))}
    </div>
  );
}
