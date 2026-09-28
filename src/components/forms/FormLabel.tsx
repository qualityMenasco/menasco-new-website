import type { LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  theme?: Theme;
}

export function FormLabel({ required, theme, className, children, ...rest }: FormLabelProps) {
  const resolvedTheme = useSectionTheme(theme);
  return (
    <label
      className={cn(
        'mb-1.5 block text-small font-semibold',
        resolvedTheme === 'dark' ? 'text-warmwhite' : 'text-ink',
        className,
      )}
      {...rest}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-brand-600" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
