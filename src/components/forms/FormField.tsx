import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SharedProps {
  label: string;
  error?: string;
  optional?: string;
  required?: boolean;
  helperText?: string;
}

export type FormFieldProps = SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
    as?: 'input';
  };

export type FormFieldTextareaProps = SharedProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
    as: 'textarea';
  };

export type FormFieldSelectProps = SharedProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
    as: 'select';
    children: ReactNode;
  };

/**
 * Clearly labeled form field shared by the desktop and mobile Contact
 * pages — large tap target, inline error message, works as `<input>`,
 * `<textarea>`, or `<select>`. Originally mobile-only (its sizing/styling
 * was never actually mobile-specific), promoted here so both breakpoints
 * render the exact same field treatment.
 */
export function FormField(props: FormFieldProps | FormFieldTextareaProps | FormFieldSelectProps) {
  const { label, error, optional, required, helperText, className, as, disabled, ...rest } = props;
  const id = useId();
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  const fieldClassName = cn(
    'w-full rounded-md border bg-warmwhite px-3.5 text-body text-ink placeholder:text-gray-400 transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-0',
    'disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:placeholder:text-gray-300',
    error ? 'border-error' : 'border-gray-300',
    className,
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={cn('text-small font-semibold transition-colors duration-200', disabled ? 'text-gray-400' : 'text-ink')}>
        {label}
        {required && (
          <span className="ms-0.5 text-brand-600" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="ms-1 font-normal text-gray-500">{optional}</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          rows={5}
          disabled={disabled}
          className={cn(fieldClassName, 'min-h-[120px] py-3')}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : as === 'select' ? (
        <div className="relative">
          <select
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            disabled={disabled}
            className={cn(fieldClassName, 'h-12 appearance-none pe-10')}
            {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {(rest as FormFieldSelectProps).children}
          </select>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={cn('pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200', disabled ? 'text-gray-300' : 'text-gray-500')}
          />
        </div>
      ) : (
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          disabled={disabled}
          className={cn(fieldClassName, 'h-12')}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {helperText && !error && (
        <span id={helperId} className="text-caption text-gray-500">
          {helperText}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-caption font-medium text-error">
          {error}
        </span>
      )}
    </div>
  );
}
