import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { IconComponent, Theme } from '../../types';
import { Eyebrow, Heading, Text } from '../typography/Typography';

export interface TimelineItemData {
  date: string;
  title: string;
  description?: string;
  icon?: IconComponent;
}

export interface TimelineProps {
  items: TimelineItemData[];
  theme?: Theme;
  className?: string;
}

/** A single vertical timeline — already mobile-friendly, so there's no separate stacked variant. */
export function Timeline({ items, theme, className }: TimelineProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const lineColor = isDark ? 'bg-white/15' : 'bg-gray-200';
  const markerRing = isDark ? 'ring-charcoal' : 'ring-warmwhite';

  return (
    <ol className={cn('relative flex flex-col', className)}>
      <span className={cn('absolute left-[15px] top-2 bottom-2 w-px', lineColor)} aria-hidden="true" />
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <li key={`${item.date}-${item.title}`} className={cn('relative flex gap-6', index === items.length - 1 ? 'pb-0' : 'pb-10')}>
            <span
              className={cn(
                'relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4',
                markerRing,
                isDark ? 'bg-brand-600 text-warmwhite' : 'bg-brand-600 text-warmwhite',
              )}
            >
              {Icon ? <Icon size={15} aria-hidden="true" /> : <span className="h-1.5 w-1.5 rounded-full bg-warmwhite" aria-hidden="true" />}
            </span>
            <div className="flex flex-1 flex-col gap-1 pt-1">
              <Eyebrow theme={resolvedTheme} as="span">
                {item.date}
              </Eyebrow>
              <Heading level="h4" theme={resolvedTheme}>
                {item.title}
              </Heading>
              {item.description && <Text theme={resolvedTheme}>{item.description}</Text>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
