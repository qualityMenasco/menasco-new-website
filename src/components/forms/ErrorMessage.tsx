import type { HTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ErrorMessageProps = HTMLAttributes<HTMLParagraphElement>;

export function ErrorMessage({ className, children, ...rest }: ErrorMessageProps) {
  return (
    <p role="alert" className={cn('mt-1.5 flex items-center gap-1.5 text-caption text-error', className)} {...rest}>
      <AlertCircle size={13} aria-hidden="true" className="shrink-0" />
      {children}
    </p>
  );
}
