import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

/** Minimum scroll delta (px) before a direction change counts — ignores jitter and momentum wobble. */
const DIRECTION_THRESHOLD = 8;

/**
 * On-demand return-to-top control. Shown only while the reader is scrolling
 * back up past the first viewport, and hidden again as soon as they scroll
 * down — so it never sits over content that's being read. It rests at the
 * inline end (the ragged edge of text in both LTR and RTL), just above the
 * bottom nav (49px) with a 12px gap, clear of the home-indicator safe area.
 */
export function BackToTopButton() {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    lastY.current = window.scrollY;
    const update = () => {
      frame.current = null;
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y <= window.innerHeight) setVisible(false);
      else if (delta < -DIRECTION_THRESHOLD) setVisible(true);
      else if (delta > DIRECTION_THRESHOLD) setVisible(false);
      else return; // below threshold — keep lastY so small moves accumulate
      lastY.current = y;
    };
    const handleScroll = () => {
      if (frame.current === null) frame.current = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  const scrollToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    // Land keyboard/screen-reader users at the top of the page content too.
    document.getElementById('main-content')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t('buttons.backToTop')}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        'fixed end-4 bottom-[calc(3.8125rem+env(safe-area-inset-bottom))] z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-warmwhite/90 text-ink shadow-soft backdrop-blur-md',
        'transition-[opacity,transform] duration-base ease-engineered motion-reduce:transition-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
