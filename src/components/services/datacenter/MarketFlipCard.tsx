import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface MarketFlipCardProps {
  /** Front heading, e.g. "Data centers in Saudi Arabia" (may carry a text-reaction span). */
  frontTitle: ReactNode;
  /** Back heading, e.g. "How MENASCO helps in Saudi Arabia". */
  backTitle: string;
  /** Front face content; receives the flip button so the layout can place it (bottom-right). */
  front: (flipButton: ReactNode) => ReactNode;
  /** Back face content; receives the flip-back button. */
  back: (flipButton: ReactNode) => ReactNode;
  /** Button labels: front -> back, back -> front. */
  flipLabel: string;
  unflipLabel: string;
  /** Small label above the title on the back face. */
  backEyebrow: string;
}

/**
 * Local energy markets region card that flips (client request 2026-11-20):
 * front = market context + "Key market constraints"; a bottom-right button
 * flips it to the back = "How MENASCO helps", whose bottom-right button flips
 * it back. Both faces share one grid cell, so the card is as tall as the
 * longer face and flipping never moves the page. Both faces stay in the DOM
 * (crawlable); the hidden face is inert and hidden from assistive tech.
 * Reduced motion: the faces swap without the 3D turn.
 */
export function MarketFlipCard({ frontTitle, backTitle, front, back, flipLabel, unflipLabel, backEyebrow }: MarketFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  const faceBase =
    'col-start-1 row-start-1 flex flex-col rounded-md px-4 py-5 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] md:px-8 md:py-7';
  const flipButton =
    'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-display text-[0.8125rem] font-semibold md:px-4 md:py-2 md:text-small transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

  return (
    // h-full: fills its slot, so cards in the swipe row all match the tallest one.
    <div className="h-full flex-1 [perspective:1600px]">
      <div
        className={cn(
          'grid h-full transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none',
          flipped && '[transform:rotateY(180deg)] motion-reduce:[transform:none]',
        )}
      >
        {/* Front: market constraints */}
        <div
          aria-hidden={flipped}
          {...(flipped ? { inert: '' } : {})}
          className={cn(faceBase, 'border border-gray-200 bg-white', 'motion-reduce:[backface-visibility:visible]', flipped && 'motion-reduce:invisible')}
        >
          <h3 className="font-display text-[1.0625rem] font-semibold leading-snug text-ink md:text-h4">{frontTitle}</h3>
          {front(
            <button type="button" onClick={() => setFlipped(true)} className={cn(flipButton, 'border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white')}>
              {flipLabel}
              <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
            </button>,
          )}
        </div>

        {/* Back: how MENASCO helps (light brand blue, client pick 2026-11-20: clearly a different side without a dark block) */}
        <div
          aria-hidden={!flipped}
          {...(!flipped ? { inert: '' } : {})}
          className={cn(
            faceBase,
            'border border-brand-200 bg-brand-50 [transform:rotateY(180deg)]',
            'motion-reduce:[transform:none] motion-reduce:[backface-visibility:visible]',
            !flipped && 'motion-reduce:invisible',
          )}
        >
          <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{backEyebrow}</p>
          <h3 className="mt-1.5 font-display text-[1.0625rem] font-semibold leading-snug text-ink md:mt-2 md:text-h4">{backTitle}</h3>
          {back(
            <button type="button" onClick={() => setFlipped(false)} className={cn(flipButton, 'border-brand-600 bg-white text-brand-600 hover:bg-brand-600 hover:text-white')}>
              <ArrowLeft size={16} aria-hidden="true" className="rtl:rotate-180" />
              {unflipLabel}
            </button>,
          )}
        </div>
      </div>
    </div>
  );
}
