import { Award } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

export interface CertificationStripProps {
  certifications: string[];
  theme?: Theme;
  className?: string;
}

export function CertificationStrip({ certifications, theme, className }: CertificationStripProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-3', className)}>
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
