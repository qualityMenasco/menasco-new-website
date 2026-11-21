import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
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
 *
 * Interaction (client request 2026-11-21):
 * - Clicking anywhere on the card flips it (links inside the text still open,
 *   and a text selection drag doesn't flip). The buttons stay for keyboard and
 *   screen-reader users.
 * - Mouse/trackpad devices: the card pops (lifts, deeper shadow) on hover.
 * - Touch devices and phone-width windows: the card peeks (a small tilt while
 *   its bottom-right corner lifts to show the blue back, then it settles flat)
 *   every time it comes into view: scrolling onto it from either direction,
 *   swiping to it in the row, or switching to its country tab. It never flips
 *   by itself, and doesn't peek while its back is showing. Reduced motion: a
 *   static folded corner instead.
 */
export function MarketFlipCard({ frontTitle, backTitle, front, back, flipLabel, unflipLabel, backEyebrow }: MarketFlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [touch, setTouch] = useState(false);
  const [peek, setPeek] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const flip = (next: boolean) => {
    setFlipped(next);
    setPeek(false);
  };

  // Peek every time the card comes into view (touch devices, or any phone-width
  // window such as a narrowed desktop browser).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !window.matchMedia('(hover: none), (max-width: 767px)').matches) return;
    setTouch(true);
    let raf = 0;
    // Restart the CSS animation even if it is mid-play: drop the class, re-add it two frames later.
    const replay = () => {
      cancelAnimationFrame(raf);
      setPeek(false);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => setPeek(true));
      });
    };
    // Scrolling onto it (either direction) or swiping to it in the row.
    let wasIn = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasIn) replay();
        wasIn = entry.isIntersecting;
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    // Switching to its country tab: the tab panel around it is un-hidden.
    const panel = el.closest('[role="tabpanel"]');
    const mo = new MutationObserver(() => {
      if (panel?.getAttribute('aria-hidden') === 'false' && wasIn) replay();
    });
    if (panel) mo.observe(panel, { attributes: true, attributeFilter: ['aria-hidden'] });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Switching country: when this card's tab panel is hidden, turn it back to its front.
  useEffect(() => {
    const panel = rootRef.current?.closest('[role="tabpanel"]');
    if (!panel) return;
    const mo = new MutationObserver(() => {
      if (panel.getAttribute('aria-hidden') === 'true') setFlipped(false);
    });
    mo.observe(panel, { attributes: true, attributeFilter: ['aria-hidden'] });
    return () => mo.disconnect();
  }, []);

  const downAt = useRef<{ x: number; y: number } | null>(null);
  const onCardClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    // Ignore only a real drag (selecting text); a tap with a little trackpad jitter
    // still flips. (A leftover text selection elsewhere no longer blocks the flip.)
    const start = downAt.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;
    flip(!flipped);
  };

  const faceBase =
    'col-start-1 row-start-1 flex flex-col rounded-md px-4 py-4 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] md:px-8 md:py-7';
  const flipButton =
    'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-display text-[0.8125rem] font-semibold md:px-4 md:py-2 md:text-small transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

  return (
    // h-full: fills its slot, so cards in the swipe row all match the tallest one.
    // The hover pop lives on this outer wrapper, outside the 3D context, so the lift
    // never disturbs how the turned faces (and the back's gradient border) are drawn.
    <div
      ref={rootRef}
      onPointerDown={(e) => {
        downAt.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={onCardClick}
      className={cn(
        'h-full flex-1 cursor-pointer rounded-md',
        'transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none',
        // Hover pop on the front only: on the back it clipped the top of the gradient border in some browsers (client request 2026-11-21).
        !flipped && '[@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-xl motion-reduce:[@media(hover:hover)]:hover:translate-y-0',
      )}
    >
      <div
        onAnimationEnd={(e) => e.animationName === 'dc-card-peek' && setPeek(false)}
        className={cn('h-full rounded-md [perspective:1600px]', peek && !flipped && 'dc-card-peek')}
      >
      <div
        className={cn(
          'grid h-full transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none',
          flipped && '[transform:rotateY(-180deg)] motion-reduce:[transform:none]',
        )}
      >
        {/* Front: market constraints */}
        <div
          aria-hidden={flipped}
          {...(flipped ? { inert: '' } : {})}
          className={cn(faceBase, 'relative overflow-hidden border border-gray-200 bg-white', 'motion-reduce:[backface-visibility:visible]', flipped && 'motion-reduce:invisible')}
        >
          {/* Touch only: lifted corner showing the blue back (animated once; static with reduced motion). */}
          {touch && !flipped && <span aria-hidden="true" className={cn('dc-peek-corner', peek && 'is-peeking')} />}
          <h3 className="font-display text-[1.0625rem] font-semibold leading-snug text-ink md:text-h4">{frontTitle}</h3>
          {front(
            <button type="button" onClick={() => flip(true)} className={cn(flipButton, 'border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white')}>
              {flipLabel}
              <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
            </button>,
          )}
        </div>

        {/* Back: how MENASCO helps. White like the front; a lightly pulsing brand-blue gradient border marks it as the other side (client request 2026-11-21; .dc-pulse-border in index.css). */}
        <div
          aria-hidden={!flipped}
          {...(!flipped ? { inert: '' } : {})}
          className={cn(
            faceBase,
            'dc-pulse-border bg-white [transform:rotateY(180deg)]',
            'motion-reduce:[transform:none] motion-reduce:[backface-visibility:visible]',
            !flipped && 'motion-reduce:invisible',
          )}
        >
          <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{backEyebrow}</p>
          <h3 className="mt-1.5 font-display text-[1.0625rem] font-semibold leading-snug text-ink md:mt-2 md:text-h4">{backTitle}</h3>
          {back(
            <button type="button" onClick={() => flip(false)} className={cn(flipButton, 'border-brand-600 bg-white text-brand-600 hover:bg-brand-600 hover:text-white')}>
              <ArrowLeft size={16} aria-hidden="true" className="rtl:rotate-180" />
              {unflipLabel}
            </button>,
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
