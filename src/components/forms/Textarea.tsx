import { useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { ErrorMessage } from './ErrorMessage';
import { inputBaseClasses } from './fieldStyles';
import { FormLabel } from './FormLabel';
import { HelperText } from './HelperText';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id?: string;
  label: string;
  helperText?: string;
  error?: string;
  theme?: Theme;
  containerClassName?: string;
}

export function Textarea({
  id,
  label,
  helperText,
  error,
  required,
  rows = 5,
  theme,
  className,
  containerClassName,
  ...rest
}: TextareaProps) {
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
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(inputBaseClasses(resolvedTheme, Boolean(error)), 'resize-y', className)}
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
