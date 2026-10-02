import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { ErrorMessage } from './ErrorMessage';
import { HelperText } from './HelperText';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  id?: string;
  label: string;
  helperText?: string;
  error?: string;
  theme?: Theme;
  containerClassName?: string;
}

export function Checkbox({
  id,
  label,
  helperText,
  error,
  theme,
  className,
  containerClassName,
  ...rest
}: CheckboxProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={containerClassName}>
      <label htmlFor={fieldId} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0">
          <input
            id={fieldId}
            type="checkbox"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn('peer absolute inset-0 h-5 w-5 cursor-pointer opacity-0', className)}
            {...rest}
          />
          <span
            className={cn(
              'pointer-events-none h-5 w-5 rounded-xs border-2 transition-colors duration-base',
              'peer-checked:border-brand-600 peer-checked:bg-brand-600',
              'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500',
              error ? 'border-error' : isDark ? 'border-white/30' : 'border-gray-300',
            )}
          />
          <Check
            size={14}
            strokeWidth={3}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto text-warmwhite opacity-0 transition-opacity duration-base peer-checked:opacity-100"
          />
        </span>
        <span className={cn('text-small', isDark ? 'text-gray-300' : 'text-gray-700')}>{label}</span>
      </label>
      {error ? (
        <ErrorMessage id={errorId} className="ms-8">
          {error}
        </ErrorMessage>
      ) : (
        helperText && (
          <HelperText id={helperId} theme={resolvedTheme} className="ms-8">
            {helperText}
          </HelperText>
        )
      )}
    </div>
  );
}
