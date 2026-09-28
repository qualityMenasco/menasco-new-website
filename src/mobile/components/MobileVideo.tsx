import { useReducedMotion } from 'framer-motion';
import { cn } from '../lib/utils';

export interface MobileVideoProps {
  src: string;
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
export function MobileVideo({ src, poster, alt, className }: MobileVideoProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <img src={poster} alt={alt} className={cn('h-full w-full object-cover', className)} />;
  }

  return (
    // No poster on the video itself — it flashed the unrelated placeholder
    // photo before the first real frame painted; `poster` above still backs
    // the prefers-reduced-motion still-image branch, which needs it.
    <video
      className={cn('h-full w-full object-cover', className)}
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
      <source src={src} type="video/mp4" />
    </video>
  );
}
