import type { LucideIcon } from 'lucide-react';
import { ExpandableText } from './ExpandableText';
import { LocaleLink } from './LocaleLink';
import { cn } from '../lib/utils';

export interface MobileTechnologyCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  summary: string;
  moreParagraphs?: string[];
  caption?: string;
  featured?: boolean;
  className?: string;
  /** Small secondary link (e.g. a product's privacy policy) — never the card's primary content. */
  link?: { label: string; href: string };
}

/** Compact technology card used across the Innovation & Technology page — icon, title, short explanation, optional expansion. */
export function MobileTechnologyCard({ icon: Icon, eyebrow, title, summary, moreParagraphs, caption, featured = false, className, link }: MobileTechnologyCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border p-5',
        featured ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-warmwhite',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center rounded-sm',
          featured ? 'bg-brand-600 text-warmwhite' : 'bg-stone text-brand-600',
        )}
      >
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</span>
        <h3 className="mt-1 font-display text-h3 font-semibold text-ink">{title}</h3>
      </div>
      {moreParagraphs && moreParagraphs.length > 0 ? (
        <ExpandableText summary={summary} paragraphs={moreParagraphs} />
      ) : (
        <p className="text-body text-gray-600">{summary}</p>
      )}
      {caption && <p className="text-caption text-gray-500">{caption}</p>}
      {link && (
        <LocaleLink to={link.href} className="text-small font-semibold text-brand-600">
          {link.label}
        </LocaleLink>
      )}
    </div>
  );
}
