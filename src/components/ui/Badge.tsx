import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { IconComponent, Theme } from '../../types';

export type BadgeVariant = 'category' | 'location' | 'sector' | 'status' | 'certification';

function variantClasses(variant: BadgeVariant, theme: Theme): string {
  const light = theme === 'light';
  switch (variant) {
    case 'category':
    case 'sector':
      return light ? 'bg-stone text-ink border-transparent' : 'bg-white/10 text-warmwhite border-transparent';
    case 'location':
      return light ? 'bg-transparent text-gray-600 border-gray-300' : 'bg-transparent text-gray-300 border-white/25';
    case 'status':
      return light ? 'bg-brand-50 text-brand-700 border-transparent' : 'bg-brand-950 text-brand-300 border-transparent';
    case 'certification':
      return light ? 'bg-transparent text-sand-600 border-sand-300' : 'bg-transparent text-sand-300 border-sand-500/50';
    default:
      return '';
  }
}

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: BadgeVariant;
  theme?: Theme;
  icon?: IconComponent;
  children: string;
}

export function Badge({ variant = 'category', theme, icon: Icon, className, children, ...rest }: BadgeProps) {
  const resolvedTheme = useSectionTheme(theme);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-caption font-sans font-semibold uppercase tracking-wide',
        variantClasses(variant, resolvedTheme),
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}
