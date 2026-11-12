import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePrefersReducedMotion } from '../../lib/hooks';
import { PhotoWithVideo } from '../../components/sections/community/PhotoWithVideo';
import { cn } from '../lib/utils';

export interface RailPhoto {
  src: string;
  alt: string;
  /** CSS object-position for the crop; defaults to centre. */
  focus?: string;
  /** MP4 that a "Watch the video" button on this photo opens full screen. */
  video?: string;
}

export interface PhotoRailProps {
  images: RailPhoto[];
  /** Accessible name for the row (e.g. the section's eyebrow). */
  label: string;
  /**
   * Size/shape of each photo, e.g. "aspect-[4/5] w-[78vw] md:w-[calc(50%-6px)]".
   * To make a row fit exactly (no scrolling, no arrows), use % widths — they
   * resolve against the row itself; vw includes a desktop scrollbar and overflows.
   */
  itemClassName: string;
  /** Outer wrapper (spacing / negative margins to bleed past a padded section). */
  className?: string;
  /** Side padding of the scroller — must match the surrounding content edge. */
  gutterClassName?: string;
}

const GAP = 12;

/**
 * Swipeable row of photos: each one snaps into place with the next peeking
 * in from the edge. When the row overflows, phones get position dots and
 * tablets (md+) get previous/next arrows instead — disabled at either end,
 * RTL-aware. Nothing shows when everything fits (wider tablets, short rows).
 */
export function PhotoRail({ images, label, itemClassName, className, gutterClassName = 'scroll-px-4 px-4 md:scroll-px-8 md:px-8' }: PhotoRailProps) {
  const { t } = useTranslation('common');
  const reducedMotion = usePrefersReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [edges, setEdges] = useState({ canPrev: false, canNext: true });

  const update = useCallback(() => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const travelled = Math.abs(rail.scrollLeft);
    setOverflowing(max > 4);
    setEdges({ canPrev: travelled > 4, canNext: travelled < max - 4 });
    setActive(Math.min(images.length - 1, Math.round(travelled / (first.offsetWidth + GAP))));
  }, [images.length]);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    const rtl = getComputedStyle(rail).direction === 'rtl';
    rail.scrollBy({ left: direction * (rtl ? -1 : 1) * (first.offsetWidth + GAP), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const arrowClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base hover:border-ink disabled:cursor-default disabled:opacity-35';

  return (
    <div className={cn('mt-5', className)}>
      <div
        ref={railRef}
        onScroll={update}
        role="group"
        aria-label={label}
        className={cn('no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto', gutterClassName)}
      >
        {images.map((image) => (
          <div key={image.src} className={cn('shrink-0 snap-start overflow-hidden rounded-md bg-gray-100', itemClassName)}>
            {image.video ? (
              <PhotoWithVideo image={image} video={image.video} className="h-full w-full" />
            ) : (
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                style={image.focus ? { objectPosition: image.focus } : undefined}
              />
            )}
          </div>
        ))}
      </div>
      {overflowing && (
        <div className="mt-4 flex justify-center">
          <div aria-hidden="true" className="flex gap-1.5 md:hidden">
            {images.map((image, index) => (
              <span key={image.src} className={`h-1.5 rounded-full transition-all duration-base ${index === active ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </div>
          <div className="hidden gap-2 md:flex">
            <button type="button" onClick={() => step(-1)} disabled={!edges.canPrev} aria-label={t('buttons.previousPhotos')} className={arrowClass}>
              <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
            <button type="button" onClick={() => step(1)} disabled={!edges.canNext} aria-label={t('buttons.nextPhotos')} className={arrowClass}>
              <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
