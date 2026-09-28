import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface CompactTextBlockProps {
  children: ReactNode;
  className?: string;
}

/** Generic short-paragraph wrapper — consistent text color/size/measure wherever a page needs one plain block of copy. */
export function CompactTextBlock({ children, className }: CompactTextBlockProps) {
  return <div className={cn('flex flex-col gap-3 text-body text-gray-700', className)}>{children}</div>;
}
