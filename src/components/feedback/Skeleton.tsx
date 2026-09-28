import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

export type SkeletonVariant = 'text' | 'block' | 'circle';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  theme?: Theme;
}

/** A loading placeholder. Compose several to build skeleton cards, rows, or lists. */
export function Skeleton({ variant = 'block', theme, className, ...rest }: SkeletonProps) {
  const resolvedTheme = useSectionTheme(theme);
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse',
        resolvedTheme === 'dark' ? 'bg-white/10' : 'bg-gray-200',
        variant === 'circle' ? 'rounded-full' : 'rounded-sm',
        variant === 'text' && 'h-4 w-full',
        className,
      )}
      {...rest}
    />
  );
}
