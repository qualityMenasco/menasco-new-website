import { ArrowRight } from 'lucide-react';
import { SmartLink } from '../../lib/SmartLink';

export interface ArchiveRowProps {
  href: string;
  categoryLabel: string;
  date: string;
  title: string;
  readMoreLabel: string;
}

/** One row of the Newsroom's chronological archive — a premium editorial index entry, not a card. */
export function ArchiveRow({ href, categoryLabel, date, title, readMoreLabel }: ArchiveRowProps) {
  return (
    <SmartLink
      href={href}
      className="group flex flex-col gap-2 border-b border-gray-200 py-6 transition-colors duration-base ease-engineered hover:bg-stone/60 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-2"
    >
      <div className="flex flex-col gap-1 sm:flex-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{categoryLabel}</span>
        <span className="font-display text-body-lg font-semibold text-ink transition-colors duration-base group-hover:text-brand-600">
          {title}
        </span>
      </div>
      <div className="flex items-center justify-between gap-6 sm:justify-end sm:gap-8">
        <span className="text-small text-gray-500">{date}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-small font-semibold text-brand-600">
          {readMoreLabel}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180 transition-transform duration-base group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </SmartLink>
  );
}
