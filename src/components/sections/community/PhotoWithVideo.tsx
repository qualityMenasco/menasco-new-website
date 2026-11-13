import { useEffect, useRef, useState } from 'react';
import { Pause, Play, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';

export interface PhotoWithVideoProps {
  image: { src: string; alt: string };
  /** Portrait MP4; null shows a non-interactive "video coming soon" badge instead of the play button. */
  video: string | null;
  className?: string;
  /** Extra classes for the scrim + button overlay, e.g. to hide it at widths where the film plays inline instead. */
  overlayClassName?: string;
  /**
   * False for silent clips: the viewer drops the browser's native controls (their
   * volume button suggests sound that isn't there) for a muted loop with only a
   * play/pause button.
   */
  hasAudio?: boolean;
}

/**
 * A photo with a "Watch the video" play button that opens the (portrait)
 * video full screen (with sound unless `hasAudio` is false) — the compact mobile alternative to
 * stacking a tall video under the photo. Esc / the close button / the
 * backdrop dismiss it; the page doesn't scroll while it's open and focus
 * returns to the play button afterwards.
 */
export function PhotoWithVideo({ image, video, className, overlayClassName, hasAudio = true }: PhotoWithVideoProps) {
  const { t } = useTranslation(['about', 'common']);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setPlaying(true);
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const badge = (label: string) => (
    <>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-warmwhite text-ink shadow-sm">
        <Play size={18} aria-hidden="true" className="translate-x-px" />
      </span>
      <span className="text-small font-semibold text-warmwhite">{label}</span>
    </>
  );

  return (
    <div className={cn('relative overflow-hidden rounded-md bg-gray-100', className)}>
      <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      {/* Bottom scrim so the label stays legible over any photo. */}
      <div aria-hidden="true" className={cn('absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent', overlayClassName)} />
      <div className={cn('absolute bottom-3 start-3 end-3', overlayClassName)}>
        {video ? (
          <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warmwhite">
            {badge(t('community.video.watch'))}
          </button>
        ) : (
          <div className="flex items-center gap-3 opacity-90">{badge(t('community.video.comingSoon'))}</div>
        )}
      </div>

      {open && video && (
        <div role="dialog" aria-modal="true" aria-label={image.alt} className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4" onClick={() => setOpen(false)}>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('common:buttons.closeDialog')}
            className="absolute end-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-warmwhite transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warmwhite"
          >
            <X size={20} aria-hidden="true" />
          </button>
          {hasAudio ? (
            <video
              src={video}
              autoPlay
              controls
              playsInline
              onClick={(event) => event.stopPropagation()}
              className="max-h-[85svh] w-auto max-w-full rounded-md bg-black"
            />
          ) : (
            <div className="relative" onClick={(event) => event.stopPropagation()}>
              <video
                ref={videoRef}
                src={video}
                autoPlay
                muted
                loop
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="max-h-[85svh] w-auto max-w-full rounded-md bg-black"
              />
              <button
                type="button"
                onClick={() => {
                  const el = videoRef.current;
                  if (!el) return;
                  if (el.paused) void el.play();
                  else el.pause();
                }}
                aria-label={t(playing ? 'community.video.pause' : 'community.video.play')}
                className="absolute bottom-4 end-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink/60 text-warmwhite backdrop-blur-sm transition-colors hover:bg-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warmwhite"
              >
                {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
