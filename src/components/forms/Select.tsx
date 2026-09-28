import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { ErrorMessage } from './ErrorMessage';
import { inputBaseClasses } from './fieldStyles';
import { FormLabel } from './FormLabel';
import { HelperText } from './HelperText';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  theme?: Theme;
  containerClassName?: string;
}

export function Select({
  id,
  label,
  options,
  placeholder,
  helperText,
  error,
  required,
  theme,
  className,
  containerClassName,
  value,
  defaultValue,
  ...rest
}: SelectProps) {
  const resolvedTheme = useSectionTheme(theme);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  // A <select> must be either controlled (value) or uncontrolled (defaultValue) — never both.
  const valueProps = value !== undefined ? { value } : { defaultValue: defaultValue ?? '' };

  return (
    <div className={containerClassName}>
      <FormLabel htmlFor={fieldId} required={required} theme={resolvedTheme}>
        {label}
      </FormLabel>
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          {...valueProps}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(inputBaseClasses(resolvedTheme, Boolean(error)), 'appearance-none pr-10', className)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2',
            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500',
          )}
        />
      </div>
      {error ? (
        <ErrorMessage id={errorId}>{error}</ErrorMessage>
      ) : (
        helperText && (
          <HelperText id={helperId} theme={resolvedTheme}>
            {helperText}
          </HelperText>
        )
      )}
    </div>
  );
}
