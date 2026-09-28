import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { usePrefersReducedMotion } from '../../lib/hooks';
import { useSectionTheme } from '../../lib/theme-context';
import type { IconComponent, Theme } from '../../types';
import { StatText, Text } from '../typography/Typography';

const VALUE_PATTERN = /^(\D*)([\d,.]+)(\D*)$/;

function useCountUp(rawValue: string, animate: boolean) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(rawValue);

  useEffect(() => {
    const match = animate && !reducedMotion ? rawValue.match(VALUE_PATTERN) : null;
    if (!match || !ref.current) {
      setDisplay(rawValue);
      return;
    }

    const [, prefix, numberText, suffix] = match;
    const target = Number(numberText.replace(/,/g, ''));
    const decimals = numberText.includes('.') ? numberText.split('.')[1].length : 0;
    let frame: number;
    let started = false;

    const run = () => {
      const duration = 1100;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = (target * eased).toFixed(decimals);
        setDisplay(`${prefix}${Number(current).toLocaleString(undefined, { minimumFractionDigits: decimals })}${suffix}`);
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [rawValue, animate, reducedMotion]);

  return { ref, display };
}

export interface StatItemData {
  value: string;
  label: string;
  description?: string;
  icon?: IconComponent;
  /** Animates numeric values from 0 on scroll into view. No-ops under prefers-reduced-motion. */
  animate?: boolean;
  /** Extra classes merged onto the value's StatText — e.g. to accent a specific stat with the brand color. */
  valueClassName?: string;
}

interface StatEntryProps extends StatItemData {
  theme: Theme;
  size: 'lg' | 'md';
}

function StatEntry({ value, label, description, icon: Icon, animate = false, theme, size, divided = false, valueClassName }: StatEntryProps & { divided?: boolean }) {
  const { ref, display } = useCountUp(value, animate);
  return (
    <div className={cn('flex flex-col gap-2', divided && (theme === 'dark' ? 'border-t border-white/15 pt-5' : 'border-t border-gray-200 pt-5'))}>
      {Icon && (
        <span className={cn('mb-1 inline-flex', theme === 'dark' ? 'text-brand-400' : 'text-brand-600')}>
          <Icon size={size === 'lg' ? 28 : 24} aria-hidden="true" />
        </span>
      )}
      <StatText ref={ref} theme={theme} className={cn(size === 'md' && '!text-h2', valueClassName)}>
        {display}
      </StatText>
      <Text variant="small" theme={theme} className="font-semibold uppercase tracking-wide">
        {label}
      </Text>
      {description && (
        <Text variant="small" theme={theme} muted>
          {description}
        </Text>
      )}
    </div>
  );
}

export type StatisticLayout = 'single' | 'row' | 'grid';

export interface StatisticProps {
  layout?: StatisticLayout;
  items: StatItemData[];
  columns?: 2 | 3 | 4;
  theme?: Theme;
  className?: string;
  /** 'lg' renders each number at the full display-stat scale instead of the more compact default. */
  size?: 'md' | 'lg';
}

/** Renders a single statistic, a row, or a grid — driven by `layout` and `items`. */
export function Statistic({ layout = 'row', items, columns = 4, theme, className, size = 'md' }: StatisticProps) {
  const resolvedTheme = useSectionTheme(theme);

  if (layout === 'single') {
    const [item] = items;
    if (!item) return null;
    return (
      <div className={className}>
        <StatEntry {...item} theme={resolvedTheme} size="lg" />
      </div>
    );
  }

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  } as const;

  return (
    <div
      className={cn(
        'grid gap-6 md:gap-8',
        layout === 'grid' ? columnClasses[columns] : 'grid-cols-2 md:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <StatEntry key={item.label} {...item} theme={resolvedTheme} size={size} divided={layout === 'row'} />
      ))}
    </div>
  );
}
