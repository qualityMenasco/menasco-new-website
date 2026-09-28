import { cn } from '../../lib/utils';
import type { Theme } from '../../types';

/** Shared visual language for text inputs, textareas, and selects. */
export function inputBaseClasses(theme: Theme, hasError: boolean): string {
  const isDark = theme === 'dark';
  return cn(
    'w-full rounded-sm border px-3.5 py-2 text-body font-sans transition-colors duration-base ease-engineered',
    'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    isDark ? 'bg-white/5 text-warmwhite placeholder:text-gray-500' : 'bg-warmwhite text-ink placeholder:text-gray-400',
    hasError
      ? 'border-error focus:border-error'
      : isDark
        ? 'border-white/20 focus:border-brand-400'
        : 'border-gray-300 focus:border-brand-600',
  );
}
