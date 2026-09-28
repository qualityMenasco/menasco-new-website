import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Text } from '../typography/Typography';

export interface CompanySummaryProps {
  logo: ReactNode;
  description: string;
  theme?: Theme;
  className?: string;
}

export function CompanySummary({ logo, description, theme, className }: CompanySummaryProps) {
  const resolvedTheme = useSectionTheme(theme);
  return (
    <div className={cn('flex max-w-xs flex-col gap-4', className)}>
      {logo}
      <Text variant="small" theme={resolvedTheme} muted>
        {description}
      </Text>
    </div>
  );
}
