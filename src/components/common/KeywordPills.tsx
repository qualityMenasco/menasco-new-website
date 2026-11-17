import { SmartLink } from '../../lib/SmartLink';
import { cn } from '../../lib/utils';

export interface KeywordPill {
  label: string;
  /** Internal link target — linked terms double as crawlable internal links. */
  href?: string;
}

interface KeywordPillsProps {
  items: KeywordPill[];
  /** Accessible name for the list (e.g. "MEP specialisms"). */
  label: string;
  /** Show the label as a small visible lead-in before the terms (e.g. "Delivering across"). */
  showLabel?: boolean;
  className?: string;
}

/**
 * A quiet, wrapping list of specialism terms separated by middots (used under
 * hero photos) — small grey text, no borders; linked terms underline on hover.
 * Always rendered into the DOM — callers decide visibility with CSS, so the
 * terms and links remain in the prerendered HTML for crawlers.
 */
export function KeywordPills({ items, label, showLabel = false, className }: KeywordPillsProps) {
  return (
    <ul role="list" aria-label={label} className={cn('flex flex-wrap items-baseline gap-y-1 text-caption leading-relaxed text-gray-500', className)}>
      {showLabel && (
        <li aria-hidden="true" className="me-2 font-display font-semibold uppercase tracking-widest text-gray-400 rtl:tracking-normal">
          {label}
        </li>
      )}
      {items.map((item, i) => (
        <li key={item.label} className="flex items-baseline">
          {item.href ? (
            <SmartLink href={item.href} className="font-medium text-gray-600 underline-offset-4 transition-colors duration-base hover:text-brand-600 hover:underline">
              {item.label}
            </SmartLink>
          ) : (
            <span>{item.label}</span>
          )}
          {i < items.length - 1 && (
            <span aria-hidden="true" className="mx-2 text-gray-300">
              ·
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
