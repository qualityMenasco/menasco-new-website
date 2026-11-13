import { ArrowRight } from 'lucide-react';
import { SmartLink } from '../../lib/SmartLink';
import { cn } from '../../lib/utils';
import { useMediaOrientation } from '../../lib/useMediaOrientation';

export interface FeaturedStoryCardProps {
  href: string;
  image?: string;
  mediaType?: 'image' | 'video';
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
 * rather than a button. Image panels keep the shared compact landscape
 * aspect ratio so they read as equal-height regardless of headline length.
 * A video panel instead adapts its own aspect ratio to the clip's real
 * orientation (`useMediaOrientation`) — landscape stays the same compact
 * ratio, portrait grows taller rather than being cropped down to a sliver —
 * which is why the Featured grid itself uses `items-start` (see
 * NewsroomPage.tsx) instead of grid's default row-stretch: each panel's
 * height must stay its own, not forced to match its tallest sibling.
 */
export function FeaturedStoryCard({ href, image, mediaType, categoryLabel, date, title, subtitle, readMoreLabel, className }: FeaturedStoryCardProps) {
  const { orientation, onVideoLoadedMetadata } = useMediaOrientation();
  const isVideo = mediaType === 'video';
  const aspectClassName = isVideo && orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]';

  return (
    <SmartLink
      href={href}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-md bg-ink focus-visible:outline-offset-4',
        aspectClassName,
        className,
      )}
    >
      {image &&
        (isVideo ? (
          <video
            src={image}
            autoPlay
            muted
            loop
            playsInline
            onLoadedMetadata={onVideoLoadedMetadata}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.04]"
          />
        ) : (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.04]"
          />
        ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/50" aria-hidden="true" />

      <div className="relative z-10 flex items-start justify-between gap-3 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">{categoryLabel}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-300">{date}</span>
      </div>

      <div className="relative z-10 flex flex-col gap-1.5 p-4">
        <h3 className="font-display text-h4 font-semibold leading-tight text-warmwhite" dir="auto">
          {title}
        </h3>
        <p className="text-small text-gray-200" dir="auto">
          {subtitle}
        </p>
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 text-small font-semibold text-brand-300 transition-colors duration-base group-hover:text-brand-200">
          {readMoreLabel}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180 transition-transform duration-base group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </SmartLink>
  );
}
