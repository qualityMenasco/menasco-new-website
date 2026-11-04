import { useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProjectImage } from '../media/ProjectImage';

export interface ProjectGalleryImage {
  src: string;
  alt: string;
}

export interface ProjectGalleryCarouselProps {
  images: ProjectGalleryImage[];
  previousLabel: string;
  nextLabel: string;
  /** e.g. (index) => `Go to image ${index + 1}` */
  dotLabel: (index: number) => string;
  /** e.g. (current, total) => `${current} / ${total}` — rendered opposite the dots. */
  counterLabel: (current: number, total: number) => string;
  className?: string;
}

/** Minimum horizontal drag distance (px) to register as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 40;

/**
 * Gallery carousel for the standard project detail template (see the
 * approved wireframe's `.gallery`/`.dots`). Unlike `ArticleImageGallery`,
 * this one WRAPS (Next past the last image returns to the first, and vice
 * versa), shows dot indicators, and supports touch swipe + a numeric
 * counter — all called for by the Ratio+Format spec for this template. A
 * project with an empty `gallery` array falls back to a single-image
 * "slide" built from its hero image by the caller; with exactly one image,
 * arrows/dots/counter are hidden rather than shown pointlessly.
 *
 * Logical `start-4`/`end-4` positioning (not `left`/`right`) so prev/next
 * mirror correctly under `dir="rtl"` — swipe direction is handled the same
 * way: a left-drag always means "next" visually, which is what a user
 * expects regardless of reading direction, so the touch delta isn't
 * flipped for RTL the way the arrow icons are.
 */
export function ProjectGalleryCarousel({ images, previousLabel, nextLabel, dotLabel, counterLabel, className }: ProjectGalleryCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) return null;

  const total = images.length;
  const current = images[index] ?? images[0];
  const isMultiple = total > 1;

  const goPrevious = () => setIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setIndex((prev) => (prev + 1) % total);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) goNext();
    else goPrevious();
  };

  return (
    <div
      className={cn('group relative aspect-[16/9] w-full touch-pan-y overflow-hidden rounded-md bg-ink', className)}
      onTouchStart={isMultiple ? handleTouchStart : undefined}
      onTouchEnd={isMultiple ? handleTouchEnd : undefined}
    >
      {/*
       * ProjectImage (not a raw <img>) — a hotlinked Google Drive image URL
       * has no uptime/rate-limit guarantee and can intermittently fail to
       * load even when the file is correctly shared; this shows the same
       * graceful placeholder the project grid cards already fall back to.
       * `key` forces a remount (and so a reset of ProjectImage's own
       * loading/error state) whenever the active slide changes.
       */}
      <ProjectImage key={current.src} src={current.src} alt={current.alt} />

      {isMultiple && (
        <>
          <button
            type="button"
            onClick={goPrevious}
            aria-label={previousLabel}
            className="absolute inset-y-0 start-4 my-auto flex h-10 w-10 items-center justify-center rounded-full bg-warmwhite text-ink opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft size={20} aria-hidden="true" className="rtl:rotate-180" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={nextLabel}
            className="absolute inset-y-0 end-4 my-auto flex h-10 w-10 items-center justify-center rounded-full bg-warmwhite text-ink opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight size={20} aria-hidden="true" className="rtl:rotate-180" />
          </button>

          <div className="absolute bottom-3 end-4 rounded-full bg-ink/70 px-3 py-1 text-caption font-medium tabular-nums text-warmwhite backdrop-blur-sm">
            {counterLabel(index + 1, total)}
          </div>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2.5">
            {images.map((image, dotIndex) => (
              <button
                key={image.src}
                type="button"
                aria-label={dotLabel(dotIndex)}
                aria-current={dotIndex === index}
                onClick={() => setIndex(dotIndex)}
                className={cn('h-2.5 w-2.5 rounded-full transition-colors', dotIndex === index ? 'bg-brand-600' : 'bg-warmwhite/70')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
