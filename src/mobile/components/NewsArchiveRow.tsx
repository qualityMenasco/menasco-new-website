import { ArrowRight } from 'lucide-react';
import { LocaleLink } from './LocaleLink';

export interface NewsArchiveRowProps {
  href: string;
  categoryLabel: string;
  date: string;
  title: string;
  readMoreLabel: string;
}

/** Compact mobile timeline row for the Newsroom archive — not a card. */
export function NewsArchiveRow({ href, categoryLabel, date, title, readMoreLabel }: NewsArchiveRowProps) {
  return (
    <LocaleLink to={href} className="flex flex-col gap-1.5 border-b border-gray-200 py-5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">{categoryLabel}</span>
      <span className="font-display text-body-lg font-semibold text-ink">{title}</span>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-small text-gray-500">{date}</span>
        <span className="inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
          {readMoreLabel}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
        </span>
      </div>
    </LocaleLink>
  );
}
