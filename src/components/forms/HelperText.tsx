import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

export interface HelperTextProps extends HTMLAttributes<HTMLParagraphElement> {
  theme?: Theme;
}

export function HelperText({ theme, className, children, ...rest }: HelperTextProps) {
  const resolvedTheme = useSectionTheme(theme);
  return (
    <p
      className={cn('mt-1 text-caption', resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500', className)}
      {...rest}
    >
      {children}
    </p>
  );
}
