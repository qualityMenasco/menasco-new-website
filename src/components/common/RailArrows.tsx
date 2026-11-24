import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Previous / next buttons beside a swipe rail's position dots: an alternative to swiping for
 * mouse, touchpad and tablet users (Data Center pages, client request 2026-11-24). Hidden on
 * real phones (touch screen, phone-sized; `.phone-hide` in styles/index.css), where swiping
 * and the dots are enough. Buttons dim at the first / last position.
 */
export function RailArrows({
  onStep,
  canPrev,
  canNext,
  prevLabel,
  nextLabel,
  controls,
  dark = false,
  className,
}: {
  onStep: (dir: 1 | -1) => void;
  canPrev: boolean;
  canNext: boolean;
  prevLabel: string;
  nextLabel: string;
  /** id of the rail the buttons move (aria-controls). */
  controls?: string;
  /** Light buttons for dark bands. */
  dark?: boolean;
  className?: string;
}) {
  const button = cn(
    'inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-default disabled:opacity-35',
    dark ? 'border-white/30 text-white hover:border-white disabled:hover:border-white/30' : 'border-gray-300 text-ink hover:border-ink disabled:hover:border-gray-300',
  );
  return (
    <div className={cn('phone-hide flex items-center gap-2', className)}>
      <button type="button" onClick={() => onStep(-1)} disabled={!canPrev} aria-label={prevLabel} aria-controls={controls} className={button}>
        <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onStep(1)} disabled={!canNext} aria-label={nextLabel} aria-controls={controls} className={button}>
        <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
      </button>
    </div>
  );
}
