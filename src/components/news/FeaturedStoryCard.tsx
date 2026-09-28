import { ArrowRight } from 'lucide-react';
import { SmartLink } from '../../lib/SmartLink';
import { cn } from '../../lib/utils';

export interface FeaturedStoryCardProps {
  href: string;
  image?: string;
  categoryLabel: string;
  date: string;
  title: string;
  subtitle: string;
  readMoreLabel: string;
  className?: string;
}

/**
 * Editorial story panel for the Newsroom's Featured section — not a boxed
 * card: category/date float over the image, headline + excerpt sit in a
 * gradient-shielded lower zone, "Read More" is a lightweight inline link
 * rather than a button. All three featured panels share the same compact
 * landscape aspect ratio so they read as equal-height regardless of
 * headline length, and so the sticky Featured band stays short.
 */
export function FeaturedStoryCard({ href, image, categoryLabel, date, title, subtitle, readMoreLabel, className }: FeaturedStoryCardProps) {
  return (
    <SmartLink
      href={href}
      className={cn(
        'group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-md bg-ink focus-visible:outline-offset-4',
        className,
      )}
    >
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.04]"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/50" aria-hidden="true" />

      <div className="relative z-10 flex items-start justify-between gap-3 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">{categoryLabel}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-300">{date}</span>
      </div>

      <div className="relative z-10 flex flex-col gap-1.5 p-4">
        <h3 className="font-display text-h4 font-semibold leading-tight text-warmwhite">{title}</h3>
        <p className="text-small text-gray-200">{subtitle}</p>
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 text-small font-semibold text-brand-300 transition-colors duration-base group-hover:text-brand-200">
          {readMoreLabel}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180 transition-transform duration-base group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </SmartLink>
  );
}
