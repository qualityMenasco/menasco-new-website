import { ArrowRight, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Text } from '../typography/Typography';

export type ProfessionalListVariant = 'bullet' | 'check' | 'arrow' | 'numbered';

export interface ListItemData {
  title: string;
  description?: string;
}

export type ProfessionalListGap = 'sm' | 'md';

export interface ProfessionalListProps {
  items: ListItemData[];
  variant?: ProfessionalListVariant;
  columns?: 1 | 2;
  theme?: Theme;
  /** Vertical gap between items. Defaults to 'md' (existing spacing) — pass 'sm' for a denser list. */
  gap?: ProfessionalListGap;
  className?: string;
}

const gapClasses: Record<ProfessionalListGap, string> = {
  sm: 'gap-2.5',
  md: 'gap-4',
};

function Marker({ variant, index, theme }: { variant: ProfessionalListVariant; index: number; theme: Theme }) {
  const accent = theme === 'dark' ? 'text-brand-400' : 'text-brand-600';

  if (variant === 'check') return <Check size={16} className={cn('mt-1 shrink-0', accent)} aria-hidden="true" />;
  if (variant === 'arrow') return <ArrowRight size={16} className={cn('mt-1 shrink-0', accent)} aria-hidden="true" />;
  if (variant === 'numbered')
    return (
      <span className={cn('mt-0.5 shrink-0 font-display text-small font-semibold tabular-nums', accent)} aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
    );
  return (
    <span
      className={cn('mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full', theme === 'dark' ? 'bg-brand-400' : 'bg-brand-600')}
      aria-hidden="true"
    />
  );
}

/** A single flexible list — marker style, columns, and title+description items are all configurable. */
export function ProfessionalList({ items, variant = 'bullet', columns = 1, theme, gap = 'md', className }: ProfessionalListProps) {
  const resolvedTheme = useSectionTheme(theme);
  const Tag = variant === 'numbered' ? 'ol' : 'ul';
  const isBullet = variant === 'bullet';

  return (
    <Tag
      className={cn(
        isBullet ? (columns === 2 ? 'grid gap-y-4 sm:grid-cols-2 sm:gap-x-10 list-disc pl-5' : 'list-disc pl-5') : columns === 2 ? 'grid gap-y-4 sm:grid-cols-2 sm:gap-x-10' : 'flex flex-col',
        gapClasses[gap],
        className,
      )}
    >
      {items.map((item, index) => (
        <li key={item.title} className={cn(isBullet ? 'break-inside-avoid' : 'flex gap-3 break-inside-avoid')}>
          {!isBullet && <Marker variant={variant} index={index} theme={resolvedTheme} />}
          <div className={cn('flex flex-col gap-0.5', isBullet ? '' : '')}>
            <Text as="span" theme={resolvedTheme} className="font-semibold">
              {item.title}
            </Text>
            {item.description && (
              <Text as="span" variant="small" theme={resolvedTheme} muted>
                {item.description}
              </Text>
            )}
          </div>
        </li>
      ))}
    </Tag>
  );
}

export interface KeyValueItem {
  key: string;
  value: string;
}

export interface KeyValueListProps {
  items: KeyValueItem[];
  theme?: Theme;
  className?: string;
}

/** Technical spec-sheet style key/value layout — e.g. contract value, duration, scope. */
export function KeyValueList({ items, theme, className }: KeyValueListProps) {
  const resolvedTheme = useSectionTheme(theme);
  const borderColor = resolvedTheme === 'dark' ? 'border-white/10' : 'border-gray-200';

  return (
    <dl className={cn('flex flex-col', className)}>
      {items.map((item) => (
        <div key={item.key} className={cn('flex items-baseline justify-between gap-4 border-b py-3 first:pt-0', borderColor)}>
          <dt className={cn('text-small', resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>{item.key}</dt>
          <dd className={cn('text-right text-small font-semibold', resolvedTheme === 'dark' ? 'text-warmwhite' : 'text-ink')}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}