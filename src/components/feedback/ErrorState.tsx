import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';
import { Button } from '../ui/Button';

export interface ErrorStateProps {
  title: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  theme?: Theme;
  className?: string;
}

export function ErrorState({ title, description, retryLabel = 'Try again', onRetry, theme, className }: ErrorStateProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-4 rounded-md border px-8 py-16 text-center', isDark ? 'border-white/15' : 'border-gray-200', className)}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-error-subtle text-error">
        <AlertTriangle size={22} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <Heading level="h4" theme={resolvedTheme}>
          {title}
        </Heading>
        {description && (
          <Text theme={resolvedTheme} muted className="max-w-sm">
            {description}
          </Text>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" theme={resolvedTheme} onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
