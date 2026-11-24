import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SmartLink } from '../../../lib/SmartLink';
import { Container } from '../../layout/Container';
import { cn } from '../../../lib/utils';
import { getLocaleFromPath } from '../../../lib/locale';
import { dcTechnical } from '../../../data/dataCenterTechnical';
import { Cite } from './primitives';
import { SectionJumpMenu, type JumpSection } from '../SectionJumpMenu';
import { RailArrows } from '../../common/RailArrows';

export const DC_TECHNICAL_PATH = '/services/data-centers';
export const DC_SUSTAINABILITY_PATH = '/services/data-centers/sustainability';

/** Renders copy containing [[n]] citation markers as text with superscript source links. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/\[\[(\d+)\]\]/);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <Cite key={i} n={Number(part)} /> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

/** Plain text with citation markers removed (for structured data and llms.txt). */
export function stripCites(text: string) {
  return text.replace(/\s*\[\[\d+\]\]/g, '');
}

/**
 * The two Data Center pages presented as tabs: a slim, sticky editorial tab
 * bar under the header, aligned to the page content (a "Data Centers" label,
 * then text tabs; the active one is white with a brand-blue underline sitting
 * on the bar's hairline). Each tab is a real page (its own URL, title, H1).
 */
export function DataCenterTabs({ active, sections }: { active: 'technical' | 'sustainability'; sections?: JumpSection[] }) {
  // The bar is white on the Sustainability page (its hero is white), dark on Technical.
  const light = active === 'sustainability';
  const tabs = [
    { id: 'technical' as const, href: DC_TECHNICAL_PATH, label: dcTechnical.tabs.technical },
    { id: 'sustainability' as const, href: DC_SUSTAINABILITY_PATH, label: dcTechnical.tabs.sustainability },
  ];
  return (
    <nav aria-label="Data centers" className={cn('sticky top-14 z-30 border-b desktop:top-20', light ? 'border-gray-200 bg-white' : 'border-white/10 bg-charcoal')}>
      <Container className="flex h-12 items-stretch gap-5 sm:gap-8 md:h-14">
        <span className={cn('hidden items-center pe-8 font-display text-caption font-semibold uppercase tracking-widest text-gray-500 sm:flex sm:border-e rtl:tracking-normal', light ? 'sm:border-gray-200' : 'sm:border-white/10')}>
          {dcTechnical.tabs.section}
        </span>
        <ul className="flex shrink-0 items-stretch gap-5 sm:gap-8">
          {tabs.map((tab) => {
            const on = active === tab.id;
            return (
              <li key={tab.id} className="relative flex">
                <SmartLink
                  href={tab.href}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'flex items-center font-display text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400 md:text-body',
                    light ? (on ? 'text-ink' : 'text-gray-500 hover:text-ink') : on ? 'text-white' : 'text-gray-400 hover:text-white',
                  )}
                >
                  {tab.label}
                </SmartLink>
                <span aria-hidden="true" className={cn('absolute inset-x-0 -bottom-px h-0.5 transition-opacity duration-base', light ? 'bg-brand-600' : 'bg-brand-400', on ? 'opacity-100' : 'opacity-0')} />
              </li>
            );
          })}
        </ul>
        {/* Readability prototype: "On this page" section menu + reading progress (pages that pass sections). */}
        {sections && sections.length > 0 && <SectionJumpMenu sections={sections} label={dcTechnical.tabs.onThisPage} shortLabel={dcTechnical.tabs.sections} light={light} />}
      </Container>
    </nav>
  );
}

/** Arabic route only: notes that these pages are not yet translated. */
export function ArabicDeferredNotice() {
  const { pathname } = useLocation();
  if (getLocaleFromPath(pathname) !== 'ar') return null;
  return (
    <div lang="ar" dir="rtl" className="bg-warning-subtle px-4 py-2 text-center text-small font-semibold text-ink">
      {dcTechnical.arabicNotice}
    </div>
  );
}

/**
 * Swipe-rail helpers for the Data Center pages. Below md (768px), card grids
 * become a horizontal, snapping rail; this tracks which card is in view.
 * Breakpoint rule (client): stay a full grid on tablet; collapse only below md.
 */
export const RAIL_CLASS =
  'no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 md:mx-0 md:grid md:snap-none md:overflow-visible md:px-0 md:pb-0';

/** What RailDots needs to draw previous / next arrows for a rail (returned by useRail). */
export interface RailNav {
  step: (dir: 1 | -1) => void;
  atStart: boolean;
  atEnd: boolean;
}

export function useRail() {
  const railRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  // Scroll positions (for dots): with several cards in view the last ones never reach the start
  // edge, so positions = cards - cards in view + 1 (one per card on phones). 0 until measured.
  const [positions, setPositions] = useState(0);
  // Card an arrow click is scrolling to: a quick second click steps on from there.
  const pending = useRef<number | null>(null);
  const pendingTimer = useRef(0);

  /** Index of the card nearest the rail's start edge. */
  const nearest = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return 0;
    const style = getComputedStyle(rail);
    const rtl = style.direction === 'rtl';
    const pad = parseFloat(style.scrollPaddingInlineStart) || 0;
    const r = rail.getBoundingClientRect();
    const edge = rtl ? r.right - pad : r.left + pad;
    let best = 0;
    let dist = Infinity;
    [...rail.children].forEach((card, i) => {
      const c = (card as HTMLElement).getBoundingClientRect();
      const d = Math.abs((rtl ? c.right : c.left) - edge);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  }, []);

  const measureEdges = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const pos = Math.abs(rail.scrollLeft);
    const next = { atStart: pos <= 1, atEnd: pos >= max - 1 };
    setEdges((e) => (e.atStart === next.atStart && e.atEnd === next.atEnd ? e : next));
    const first = rail.firstElementChild as HTMLElement | null;
    if (first) {
      const style = getComputedStyle(rail);
      const gap = parseFloat(style.columnGap) || 0;
      const inner = rail.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
      const inView = Math.max(1, Math.floor((inner + gap + 1) / (first.offsetWidth + gap)));
      setPositions(Math.max(1, rail.children.length - inView + 1));
    }
  }, []);

  const onScroll = useCallback(() => {
    const best = nearest();
    if (pending.current === best) pending.current = null;
    setActive(best);
    measureEdges();
  }, [nearest, measureEdges]);

  // Arrow buttons: slide one card toward the end (1) or the start (-1). Scrolls only the rail.
  const step = useCallback(
    (dir: 1 | -1) => {
      const rail = railRef.current;
      if (!rail) return;
      const cards = [...rail.children] as HTMLElement[];
      if (!cards.length) return;
      const i = Math.max(0, Math.min(cards.length - 1, (pending.current ?? nearest()) + dir));
      const style = getComputedStyle(rail);
      const rtl = style.direction === 'rtl';
      const pad = parseFloat(style.scrollPaddingInlineStart) || 0;
      const r = rail.getBoundingClientRect();
      const c = cards[i].getBoundingClientRect();
      const delta = rtl ? c.right - (r.right - pad) : c.left - (r.left + pad);
      pending.current = i;
      window.clearTimeout(pendingTimer.current);
      pendingTimer.current = window.setTimeout(() => {
        pending.current = null;
      }, 900);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      rail.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' });
    },
    [nearest],
  );

  // Arrow enabled states also change when the rail is resized or shown (hidden attribute).
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    measureEdges();
    // Not in jsdom (tests) or very old browsers: the edges then update on scroll only.
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measureEdges);
    ro.observe(rail);
    return () => {
      ro.disconnect();
      window.clearTimeout(pendingTimer.current);
    };
  }, [measureEdges]);

  // The current scroll position (dot), clamped; the last one once the rail is at its end.
  const position = positions ? (edges.atEnd ? positions - 1 : Math.min(active, positions - 1)) : active;
  return { railRef, active, onScroll, step, atStart: edges.atStart, atEnd: edges.atEnd, positions, position };
}

/**
 * Position dots under a rail (phones only unless alwaysShow). With `rail` (Data Center pages):
 * previous / next arrows on the right instead of the "02 / 09" counter, hidden on real phones,
 * which keep just the dots. Without `rail` (other service pages): the counter, as before.
 */
export function RailDots({ count, active, alwaysShow = false, dark = false, rail, controls, labels }: { count: number; active: number; /** Show at any width (caller decides, e.g. from measured overflow). */ alwaysShow?: boolean; /** Light dots for dark bands. */ dark?: boolean; /** The rail's useRail() result: draws the arrows. */ rail?: RailNav; /** id of the rail (aria-controls for the arrows). */ controls?: string; /** Arrow labels (translated pages); default: the Data Center pages' English labels. */ labels?: { previous: string; next: string } }) {
  return (
    <div className={cn('mt-5 flex items-center justify-between', !alwaysShow && 'md:hidden')}>
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={cn('h-1.5 rounded-full transition-all duration-base', i === active ? cn('w-5', dark ? 'bg-white' : 'bg-ink') : cn('w-1.5', dark ? 'bg-white/25' : 'bg-gray-300'))} />
        ))}
      </div>
      {rail ? (
        <RailArrows onStep={rail.step} canPrev={!rail.atStart} canNext={!rail.atEnd} prevLabel={labels?.previous ?? dcTechnical.tabs.previous} nextLabel={labels?.next ?? dcTechnical.tabs.next} controls={controls} dark={dark} />
      ) : (
        <p className={cn('font-display text-caption font-semibold tabular-nums', dark ? 'text-gray-400' : 'text-gray-500')}>
          {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </p>
      )}
    </div>
  );
}
