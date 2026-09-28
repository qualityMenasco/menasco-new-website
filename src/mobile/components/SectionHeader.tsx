import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export interface SectionHeaderProps {
  eyebrow?: string;
  heading: string;
  headingAs?: 'h1' | 'h2' | 'h3';
  description?: string;
  /** Extra classes merged onto the description `<p>` — e.g. `whitespace-pre-line` to preserve line breaks in copy. */
  descriptionClassName?: string;
  action?: ReactNode;
  className?: string;
}

/** Compact section intro — eyebrow, heading, one short description line. Reused across every mobile page. */
export function SectionHeader({
  eyebrow,
  heading,
  headingAs = 'h2',
  description,
  descriptionClassName,
  action,
  className,
}: SectionHeaderProps) {
  const HeadingTag = headingAs;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {eyebrow && <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</span>}
      <HeadingTag className="font-display text-h2 font-semibold tracking-tight text-ink">{heading}</HeadingTag>
      {description && <p className={cn('text-body text-gray-600', descriptionClassName)}>{description}</p>}
      {action}
    </div>
  );
}
