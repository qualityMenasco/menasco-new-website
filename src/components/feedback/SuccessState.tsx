import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';
import { ButtonLink } from '../ui/Button';

export interface SuccessStateProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  theme?: Theme;
  className?: string;
}

export function SuccessState({ title, description, action, theme, className }: SuccessStateProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      role="status"
      className={cn('flex flex-col items-center gap-4 rounded-md border px-8 py-16 text-center', isDark ? 'border-white/15' : 'border-gray-200', className)}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success">
        <CheckCircle2 size={22} aria-hidden="true" />
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
      {action && (
        <ButtonLink href={action.href} variant="primary" size="sm" theme={resolvedTheme} className="mt-2">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
