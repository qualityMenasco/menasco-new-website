import { useLayoutEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ProjectImageProps {
  src: string;
  alt: string;
  /** Above-the-fold cards (first grid row) load eagerly at high priority; everything else lazy-loads. */
  priority?: boolean;
  /** Applied to the <img> itself — e.g. the hover scale-up transform the desktop card already uses. */
  imgClassName?: string;
}

/**
 * Fills its parent — the parent owns the aspect-ratio/rounded/background
 * container (unchanged across desktop and mobile project cards) so this
 * component only manages the skeleton → image → error states inside it.
 */
export function ProjectImage({ src, alt, priority = false, imgClassName }: ProjectImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imgRef = useRef<HTMLImageElement>(null);

  // A card can unmount/remount when a filter re-sorts the grid (see
  // AnimatePresence in ProjectCategoriesPage). If the browser already has
  // this image cached from before, skip the loading state entirely instead
  // of flashing a skeleton for an image that's actually already available.
  useLayoutEffect(() => {
    if (imgRef.current?.complete) setStatus('loaded');
  }, []);

  return (
    <>
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex animate-pulse items-center justify-center bg-gray-100 motion-reduce:animate-none"
        >
          <Loader2 size={22} className="animate-spin text-gray-400" strokeWidth={2} />
        </div>
      )}

      {status === 'error' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <img src="/Menasco-Logo.png" alt="" aria-hidden="true" className="w-[36%] opacity-15" />
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // The installed React/ReactDOM (18.3.1) doesn't yet recognize
          // `fetchPriority` in its known-DOM-props table — it still forwards
          // the camelCase prop into the DOM as a raw attribute (so it works),
          // but logs a "spell it lowercase" warning on every render. Spreading
          // the native lowercase attribute name instead sets it the same way
          // browsers read it, with no warning.
          {...{ fetchpriority: priority ? 'high' : 'low' }}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none',
            status === 'loaded' && 'opacity-100',
            imgClassName,
          )}
        />
      )}
    </>
  );
}
