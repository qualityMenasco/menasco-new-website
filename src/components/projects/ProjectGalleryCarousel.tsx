import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  className?: string;
}

/**
 * Gallery carousel for the standard project detail template (see the
 * approved wireframe's `.gallery`/`.dots`). Unlike `ArticleImageGallery`,
 * this one WRAPS (Next past the last image returns to the first, and vice
 * versa) and shows dot indicators — both called for by the Ratio+Format
 * spec for this template. A project with an empty `gallery` array falls
 * back to a single-image "slide" built from its hero image by the caller;
 * with exactly one image, arrows/dots are hidden rather than shown
 * pointlessly.
 *
 * Logical `start-4`/`end-4` positioning (not `left`/`right`) so prev/next
 * mirror correctly under `dir="rtl"`.
 */
export function ProjectGalleryCarousel({ images, previousLabel, nextLabel, dotLabel, className }: ProjectGalleryCarouselProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const total = images.length;
  const current = images[index] ?? images[0];
  const isMultiple = total > 1;

  const goPrevious = () => setIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setIndex((prev) => (prev + 1) % total);

  return (
    <div className={cn('group relative aspect-[16/9] w-full overflow-hidden rounded-md bg-ink', className)}>
      <img key={current.src} src={current.src} alt={current.alt} className="h-full w-full object-cover" />

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
