import { useId, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { ErrorMessage } from './ErrorMessage';
import { FormLabel } from './FormLabel';
import { HelperText } from './HelperText';

export interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  id?: string;
  label: string;
  helperText?: string;
  error?: string;
  theme?: Theme;
  containerClassName?: string;
}

export function FileUpload({
  id,
  label,
  helperText,
  error,
  required,
  theme,
  containerClassName,
  onChange,
  ...rest
}: FileUploadProps) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileNames(Array.from(event.target.files ?? []).map((file) => file.name));
    onChange?.(event);
  };

  return (
    <div className={containerClassName}>
      <FormLabel htmlFor={fieldId} required={required} theme={resolvedTheme}>
        {label}
      </FormLabel>
      <label
        htmlFor={fieldId}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-sm border-2 border-dashed px-6 py-8 text-center transition-colors duration-base',
          error ? 'border-error' : isDark ? 'border-white/20 hover:border-white/40' : 'border-gray-300 hover:border-gray-400',
        )}
      >
        <UploadCloud size={22} aria-hidden="true" className={isDark ? 'text-gray-400' : 'text-gray-500'} />
        <span className={cn('text-small font-semibold', isDark ? 'text-warmwhite' : 'text-ink')}>
          {fileNames.length > 0 ? fileNames.join(', ') : 'Click to browse or drag a file here'}
        </span>
        <input
          id={fieldId}
          type="file"
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className="sr-only"
          onChange={handleChange}
          {...rest}
        />
      </label>
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
