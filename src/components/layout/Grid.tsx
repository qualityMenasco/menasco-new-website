import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type GridVariant = 'two' | 'three' | 'four' | 'asymmetrical' | 'featured';
export type GridGap = 'sm' | 'md' | 'lg';

const gapClasses: Record<GridGap, string> = {
  sm: 'gap-4 md:gap-6',
  md: 'gap-6 md:gap-8',
  lg: 'gap-8 md:gap-12',
};

const variantClasses: Record<GridVariant, string> = {
  two: 'grid-cols-1 sm:grid-cols-2',
  three: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  four: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  // Uneven two-column split (wide primary item, narrower secondary item).
  asymmetrical: 'grid-cols-1 lg:grid-cols-[3fr_2fr]',
  // First child spans two tracks/rows; remaining items pack around it.
  featured:
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 [&>*:first-child]:sm:col-span-2 [&>*:first-child]:lg:col-span-2 [&>*:first-child]:lg:row-span-2',
};

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GridVariant;
  gap?: GridGap;
  children: ReactNode;
}

/**
 * A single flexible grid. Variants cover the layouts the design system needs;
 * for one-off span overrides, apply `lg:col-span-*` directly to a child wrapper.
 */
export function Grid({ variant = 'three', gap = 'md', className, children, ...rest }: GridProps) {
  return (
    <div className={cn('grid', variantClasses[variant], gapClasses[gap], className)} {...rest}>
      {children}
    </div>
  );
}
