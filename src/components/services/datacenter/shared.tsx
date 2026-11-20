import { Fragment, useCallback, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SmartLink } from '../../../lib/SmartLink';
import { Container } from '../../layout/Container';
import { cn } from '../../../lib/utils';
import { getLocaleFromPath } from '../../../lib/locale';
import { dcTechnical } from '../../../data/dataCenterTechnical';
import { Cite } from './primitives';

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
export function DataCenterTabs({ active }: { active: 'technical' | 'sustainability' }) {
  const tabs = [
    { id: 'technical' as const, href: DC_TECHNICAL_PATH, label: dcTechnical.tabs.technical },
    { id: 'sustainability' as const, href: DC_SUSTAINABILITY_PATH, label: dcTechnical.tabs.sustainability },
  ];
  return (
    <nav aria-label="Data centers" className="sticky top-14 z-30 border-b border-white/10 bg-charcoal desktop:top-20">
      <Container className="flex h-12 items-stretch gap-8 md:h-14">
        <span className="hidden items-center pe-8 font-display text-caption font-semibold uppercase tracking-widest text-gray-500 sm:flex sm:border-e sm:border-white/10 rtl:tracking-normal">
          {dcTechnical.tabs.section}
        </span>
        <ul className="flex items-stretch gap-8">
          {tabs.map((tab) => {
            const on = active === tab.id;
            return (
              <li key={tab.id} className="relative flex">
                <SmartLink
                  href={tab.href}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'flex items-center font-display text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400 md:text-body',
                    on ? 'text-white' : 'text-gray-400 hover:text-white',
                  )}
                >
                  {tab.label}
                </SmartLink>
                <span aria-hidden="true" className={cn('absolute inset-x-0 -bottom-px h-0.5 bg-brand-400 transition-opacity duration-base', on ? 'opacity-100' : 'opacity-0')} />
              </li>
            );
          })}
        </ul>
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

export function useRail() {
  const railRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const onScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const pad = parseFloat(getComputedStyle(rail).scrollPaddingLeft || '0');
    const left = rail.getBoundingClientRect().left + pad;
    let best = 0;
    let dist = Infinity;
    [...rail.children].forEach((card, i) => {
      const d = Math.abs((card as HTMLElement).getBoundingClientRect().left - left);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);
  return { railRef, active, onScroll };
}

/** Position dots + "02 / 09" counter shown under a rail (phones only). */
export function RailDots({ count, active }: { count: number; active: number }) {
  return (
    <div className="mt-5 flex items-center justify-between md:hidden">
      <div aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={cn('h-1.5 rounded-full transition-all duration-base', i === active ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300')} />
        ))}
      </div>
      <p className="font-display text-caption font-semibold tabular-nums text-gray-500">
        {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </p>
    </div>
  );
}
