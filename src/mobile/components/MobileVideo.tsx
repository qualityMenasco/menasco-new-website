import { useReducedMotion } from 'framer-motion';
import { cn } from '../lib/utils';

export interface MobileVideoProps {
  src: string;
  /** Lighter encode for phones (max-width 767px); tablets keep `src`. */
  smallSrc?: string;
  poster: string;
  alt: string;
  className?: string;
}

/**
 * Background/inline video, sized to its container. Respects
 * prefers-reduced-motion by rendering only the poster image (no autoplaying
 * media) for users who've asked for it, and always ships `preload="metadata"`
 * so mobile connections aren't forced to buffer the whole file up front.
 */
export function MobileVideo({ src, smallSrc, poster, alt, className }: MobileVideoProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <img src={poster} alt={alt} className={cn('h-full w-full object-cover', className)} />;
  }

  return (
    // The poster is a real frame from the video, so it paints instantly (it's the page's
    // largest image) without the mismatched flash an unrelated placeholder used to cause.
    <video
      className={cn('h-full w-full object-cover', className)}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload noplaybackrate"
      aria-label={alt}
    >
      {smallSrc && <source src={smallSrc} type="video/mp4" media="(max-width: 767px)" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
