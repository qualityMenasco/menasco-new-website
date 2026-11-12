import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePrefersReducedMotion } from '../../lib/hooks';
import { cn } from '../../lib/utils';

export interface AutoplayVideoProps {
  /** MP4 path; null renders the poster alone (no controls). */
  src: string | null;
  poster: string;
  alt: string;
  /** False for silent files (no audio track): hides the sound toggle. */
  hasAudio?: boolean;
  className?: string;
}

/**
 * Inline film (Community & People, About, Innovation & Technology), shared
 * by both trees. Plays muted on a loop once it's near the viewport (the file
 * only downloads then), with play/pause and sound toggles. Visitors who prefer
 * reduced motion get the poster and a play button instead of autoplay.
 */
export function AutoplayVideo({ src, poster, alt, hasAudio = true, className }: AutoplayVideoProps) {
  const { t } = useTranslation('about');
  const reducedMotion = usePrefersReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !src || nearViewport) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNearViewport(true), { rootMargin: '400px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [src, nearViewport]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted && video.paused) void video.play();
  };

  const controlClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink/60 text-warmwhite backdrop-blur-sm transition-colors duration-base hover:bg-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warmwhite';

  return (
    <div ref={wrapperRef} className={cn('relative overflow-hidden bg-ink', className)}>
      <img src={poster} alt={src ? '' : alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      {src && nearViewport && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      )}
      {src && (
        <div className="absolute bottom-4 end-4 flex gap-2 md:bottom-6 md:end-6">
          <button type="button" onClick={togglePlay} className={controlClass} aria-label={t(playing ? 'community.video.pause' : 'community.video.play')}>
            {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          </button>
          {hasAudio && (
            <button type="button" onClick={toggleSound} className={controlClass} aria-label={t(muted ? 'community.video.soundOn' : 'community.video.soundOff')}>
              {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
