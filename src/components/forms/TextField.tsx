import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { ErrorMessage } from './ErrorMessage';
import { inputBaseClasses } from './fieldStyles';
import { FormLabel } from './FormLabel';
import { HelperText } from './HelperText';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  type?: 'text' | 'email' | 'tel' | 'password' | 'datetime-local';
  id?: string;
  label: string;
  helperText?: string;
  error?: string;
  theme?: Theme;
  containerClassName?: string;
}

/** Covers text, email, phone, and password inputs — the only differences are `type` and keyboard/masking affordances. */
export function TextField({
  type = 'text',
  id,
  label,
  helperText,
  error,
  required,
  theme,
  className,
  containerClassName,
  ...rest
}: TextFieldProps) {
  const resolvedTheme = useSectionTheme(theme);
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;

  return (
    <div className={containerClassName}>
      <FormLabel htmlFor={fieldId} required={required} theme={resolvedTheme}>
        {label}
      </FormLabel>
      <input
        id={fieldId}
        type={type}
        inputMode={type === 'tel' ? 'tel' : type === 'email' ? 'email' : undefined}
        autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : undefined}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(inputBaseClasses(resolvedTheme, Boolean(error)), className)}
        {...rest}
      />
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
