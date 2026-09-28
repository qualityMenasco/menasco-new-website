import { Inbox } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { HeadingLevel, IconComponent, Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';
import { ButtonLink } from '../ui/Button';

export interface EmptyStateProps {
  icon?: IconComponent;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  theme?: Theme;
  className?: string;
  /** Set to "h1" when this is the page's primary heading (e.g. a 404 page). Defaults to a non-heading-outline h4 style. */
  headingAs?: HeadingLevel;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, theme, className, headingAs }: EmptyStateProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={cn('flex flex-col items-center gap-4 rounded-md border border-dashed px-8 py-16 text-center', isDark ? 'border-white/15' : 'border-gray-300', className)}>
      <span className={cn('inline-flex h-12 w-12 items-center justify-center rounded-full', isDark ? 'bg-white/10 text-gray-400' : 'bg-stone text-gray-500')}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <Heading level="h4" as={headingAs} theme={resolvedTheme}>
          {title}
        </Heading>
        {description && (
          <Text theme={resolvedTheme} muted className="max-w-sm">
            {description}
          </Text>
        )}
      </div>
      {action && (
        <ButtonLink href={action.href} variant="outline" size="sm" theme={resolvedTheme} className="mt-2">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
