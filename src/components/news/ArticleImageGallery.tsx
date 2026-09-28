import { useRef, useState } from 'react';
import type { KeyboardEvent, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/** Deliberately decoupled from any specific data source (real API `PublicImage`, or anything else) — this component only ever needs a flat `{src, alt}` list, built by the caller. */
export interface GalleryImage {
  src: string;
  alt: string;
}

export interface ArticleImageGalleryProps {
  images: GalleryImage[];
  previousLabel: string;
  nextLabel: string;
  /** e.g. (current, total) => `${current} / ${total}` — pre-formatted (including any zero-padding) by the caller so this component carries no i18n/formatting dependency of its own. */
  positionLabel: (current: number, total: number) => string;
  className?: string;
}

const SWIPE_THRESHOLD_PX = 40;

/**
 * Article header image display — takes `images: GalleryImage[]` only, no
 * knowledge of where they came from, so this works identically whether the
 * array has one entry (every article today) or an arbitrary
 * employee-uploaded count (once the admin upload flow supports adding more
 * than one — this component needs no changes when that ships, since the
 * public API already returns the full `article.images` array regardless of
 * length).
 *
 * Single image: plain display, zero chrome — no arrows, no counter. Multiple:
 * real prev/next <button>s (always in the DOM, so keyboard/touch/click all
 * work identically), a small zero-padded position readout, and keyboard
 * arrow-key navigation. No dots, no thumbnails, no autoplay — deliberately
 * minimal, matching MENASCO's existing restrained visual language. Does NOT
 * wrap: Previous is disabled on the first image, Next is disabled on the
 * last, and swipe/keyboard both respect the same boundary.
 */
export function ArticleImageGallery({ images, previousLabel, nextLabel, positionLabel, className }: ArticleImageGalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) return null;

  const total = images.length;
  const current = images[Math.min(index, total - 1)];
  const isMultiple = total > 1;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const goTo = (next: number) => setIndex(Math.max(0, Math.min(total - 1, next)));
  const goPrevious = () => {
    if (!isFirst) goTo(index - 1);
  };
  const goNext = () => {
    if (!isLast) goTo(index + 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    // Swipe/keyboard direction is a physical gesture, not a logical one —
    // swiping left (or pressing the physical ArrowLeft key) always reveals
    // the previous image regardless of text direction, matching how these
    // gestures already work in native RTL galleries; the prev/next
    // *buttons* are what flip position under RTL (via the `start-0`/`end-0`
    // logical CSS below), not the meaning of the gesture itself. Boundaries
    // (no wrap) are enforced inside goPrevious/goNext.
    if (delta < 0) goNext();
    else goPrevious();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isMultiple) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrevious();
    }
  };

  return (
    <div className={cn('group relative', className)} onKeyDown={handleKeyDown}>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-100"
        onTouchStart={isMultiple ? handleTouchStart : undefined}
        onTouchEnd={isMultiple ? handleTouchEnd : undefined}
      >
        <img key={current.src} src={current.src} alt={current.alt} className="h-full w-full object-cover animate-gallery-fade" />

        {isMultiple && (
          <>
            <button
              type="button"
              onClick={goPrevious}
              disabled={isFirst}
              aria-label={previousLabel}
              aria-disabled={isFirst}
              className="absolute inset-y-0 start-0 flex w-11 items-center justify-center opacity-70 outline-none transition-opacity duration-base hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:opacity-30"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/40 text-warmwhite backdrop-blur-sm">
                <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
              </span>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={isLast}
              aria-label={nextLabel}
              aria-disabled={isLast}
              className="absolute inset-y-0 end-0 flex w-11 items-center justify-center opacity-70 outline-none transition-opacity duration-base hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:opacity-30"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/40 text-warmwhite backdrop-blur-sm">
                <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
              </span>
            </button>

            <span
              aria-live="polite"
              dir="ltr"
              className="absolute bottom-2 end-2 rounded-sm bg-ink/60 px-1.5 py-0.5 text-caption font-medium tabular-nums text-warmwhite backdrop-blur-sm"
            >
              {positionLabel(index + 1, total)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
