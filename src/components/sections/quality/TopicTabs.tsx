import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import type { AccordionTopic } from './TopicAccordion';

/** A topic, optionally with extra content rendered under its body (lists, links). */
export interface TabTopic extends AccordionTopic {
  extra?: ReactNode;
  /** Deep-link fragment (no '#'): /page#hash opens on this topic; clicking the tab updates the URL. */
  hash?: string;
}

export interface TopicTabsProps {
  topics: TabTopic[];
  /** Unique prefix for the tab/panel ids. */
  idPrefix: string;
  /** Accessible name for the tab list. */
  label: string;
  className?: string;
  /** Replaces the default two-column grid classes (tab list | panel). */
  layoutClassName?: string;
  /** Optional content above / below the tab list, in the same column. */
  lead?: ReactNode;
  footer?: ReactNode;
  /** Render only each topic's `extra` (no box, no title): for callers that draw their own card. */
  bare?: boolean;
  /** Keep the tabs as a horizontal pill row above the panel at every width (no side list). */
  horizontal?: boolean;
  /**
   * When the pills no longer fit side by side on one row (measured live, not a
   * fixed breakpoint): hide them and show every panel in a swipeable, snapping
   * row with position dots underneath; the panel in view is the active one.
   * Needs `horizontal`.
   */
  mobileRail?: boolean;
  /** Tighter tab list and card (smaller tab text, less padding) for dense topic sets. */
  compact?: boolean;
  /** Phones (pill row): position dots + counter under the panel showing which topic is selected. */
  dots?: boolean;
}

const DEFAULT_LAYOUT = 'md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]';

/**
 * Topic tabs (Quality, Health & Safety page; also the home "What we deliver"
 * section) — a compact alternative to the
 * accordion that keeps every word. Tablets/desktop: the titles as a vertical
 * list beside a content panel. Phones: a swipeable row of pills above it.
 *
 * Every panel stays in the DOM (crawlable). Panels share one grid cell, so
 * the box is always as tall as the longest topic and switching never makes
 * the page jump; inactive panels are invisible, inert and hidden from
 * assistive tech. Arrow keys / Home / End move between tabs.
 */
export function TopicTabs({ topics, idPrefix, label, className, layoutClassName, lead, footer, bare = false, horizontal = false, mobileRail = false, compact = false, dots = false }: TopicTabsProps) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement | null>(null);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  // mobileRail: swipe mode is on while the pills cannot all fit on one row.
  const [rail, setRail] = useState(false);

  useEffect(() => {
    const list = tablistRef.current;
    if (!mobileRail || !list) return;
    // The pill row never wraps in this mode, so scrollWidth is the width the
    // pills need; it stays measurable while visually collapsed (h-0, invisible).
    const measure = () => setRail(list.scrollWidth > list.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [mobileRail]);

  // Deep links: open on the topic named in the URL fragment (also on later hash changes,
  // and again if the topic order changes, e.g. the visitor-region reorder).
  const hashKey = topics.map((t) => t.hash ?? '').join('|');
  useEffect(() => {
    if (!hashKey.replace(/\|/g, '')) return;
    const apply = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const i = hash ? topics.findIndex((t) => t.hash === hash) : -1;
      if (i < 0) return;
      setActive(i);
      const rail = railRef.current;
      const panel = rail?.children[i] as HTMLElement | undefined;
      if (rail && panel && getComputedStyle(rail).display === 'flex') rail.scrollTo({ left: panel.offsetLeft - rail.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft || '0'), behavior: 'instant' as ScrollBehavior });
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashKey]);

  const choose = (i: number) => {
    setActive(i);
    const hash = topics[i]?.hash;
    if (hash) window.history.replaceState(window.history.state, '', `#${hash}`);
    // Phones (scrolling pill row): bring the chosen pill to the front of the row, leaving a
    // glimpse of the previous pill (except for the first). Scrolls only the row, never the page.
    const list = tablistRef.current;
    const tab = tabRefs.current[i];
    if (list && tab && list.scrollWidth > list.clientWidth + 1) {
      const pad = parseFloat(getComputedStyle(list).paddingInlineStart || '0');
      const rtl = getComputedStyle(list).direction === 'rtl';
      const peek = i > 0 ? 36 : 0;
      const left = rtl ? -(list.scrollWidth - tab.offsetLeft - tab.offsetWidth - pad - peek) : tab.offsetLeft - list.offsetLeft - pad - peek;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      list.scrollTo({ left: rtl ? left : Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  // Swipe mode: the panel nearest the rail's start edge is the active one.
  const onRailScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const rtl = getComputedStyle(rail).direction === 'rtl';
    const pad = parseFloat(getComputedStyle(rail).scrollPaddingInlineStart || '0');
    const edge = rtl ? rail.getBoundingClientRect().right - pad : rail.getBoundingClientRect().left + pad;
    let best = 0;
    let dist = Infinity;
    [...rail.children].forEach((panel, i) => {
      const r = (panel as HTMLElement).getBoundingClientRect();
      const d = Math.abs((rtl ? r.right : r.left) - edge);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    if (best !== active) setActive(best);
  };

  const select = (index: number) => {
    const next = (index + topics.length) % topics.length;
    choose(next);
    const tab = tabRefs.current[next];
    tab?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const forward = ['ArrowDown', rtl ? 'ArrowLeft' : 'ArrowRight'];
    const back = ['ArrowUp', rtl ? 'ArrowRight' : 'ArrowLeft'];
    if (forward.includes(event.key)) {
      event.preventDefault();
      select(active + 1);
    } else if (back.includes(event.key)) {
      event.preventDefault();
      select(active - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      select(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      select(topics.length - 1);
    }
  };

  return (
    <div className={cn(layoutClassName ?? (horizontal ? '' : DEFAULT_LAYOUT), className)}>
      <div className="min-w-0">
      {lead}
      {/* Phones: a swipeable pill row. Tablets/desktop: a vertical list. */}
      <div
        ref={tablistRef}
        role="tablist"
        aria-label={label}
        className={cn(
          mobileRail
            ? cn('no-scrollbar flex gap-2 overflow-hidden pb-1', rail && 'invisible h-0 pb-0')
            : 'no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1',
          !mobileRail && (horizontal ? 'md:mx-0 md:flex-wrap md:px-0' : 'md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:border-s md:border-gray-200 md:px-0 md:pb-0'),
        )}
      >
        {topics.map((topic, i) => {
          const selected = active === i;
          return (
            <button
              key={topic.title}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${i}`}
              tabIndex={selected && !rail ? 0 : -1}
              onClick={() => choose(i)}
              onKeyDown={onKeyDown}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500',
                !horizontal && cn('md:-ms-px md:whitespace-normal md:rounded-none md:border-0 md:border-s-2 md:text-start', compact ? 'md:px-4 md:py-2 md:text-small md:leading-snug' : 'md:px-5 md:py-3 md:text-body'),
                selected
                  ? cn('border-brand-600 bg-white text-brand-600', !horizontal && 'md:border-brand-600 md:bg-transparent md:text-ink')
                  : cn('border-gray-300 text-gray-600 hover:border-gray-500 hover:text-ink', !horizontal && 'md:border-transparent md:hover:border-gray-300'),
              )}
            >
              {topic.title}
            </button>
          );
        })}
      </div>
      {footer}
      </div>

      {/* Panels stacked in one cell: the box sizes to the longest topic.
          Swipe mode (mobileRail + pills don't fit): panels sit side by side in a snapping row. */}
      <div
        ref={railRef}
        onScroll={rail ? onRailScroll : undefined}
        className={cn(
          rail ? 'no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 md:-mx-10 md:scroll-px-10 md:px-10' : 'mt-5 grid',
          !horizontal && 'md:mt-0',
          !bare && cn('rounded-md border border-gray-200 bg-white', compact ? 'p-5 md:p-6' : 'p-6 md:p-8'),
        )}
      >
        {topics.map((topic, i) => {
          const selected = active === i;
          return (
            <div
              key={topic.title}
              id={`${idPrefix}-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`${idPrefix}-tab-${i}`}
              aria-hidden={!selected}
              {...(selected ? {} : { inert: '' })}
              className={cn(
                'transition-opacity duration-300 ease-out motion-reduce:transition-none',
                rail
                  ? 'flex w-[91%] max-w-xl shrink-0 snap-start flex-col'
                  : cn('col-start-1 row-start-1', selected ? 'visible opacity-100' : 'invisible opacity-0'),
              )}
            >
              {/* Anchor for /page#hash (scroll-mt clears the fixed header + section tabs). */}
              {topic.hash && <span id={topic.hash} aria-hidden="true" className="block scroll-mt-48" />}
              {!bare && (
                <>
                  <h3 className="font-display text-h4 font-semibold text-ink">{topic.title}</h3>
                  <div className="mt-3 max-w-3xl space-y-3 text-body leading-relaxed text-gray-700">
                    {topic.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                </>
              )}
              {topic.extra}
            </div>
          );
        })}
      </div>
      {dots && !rail && (
        <div className={cn('mt-4 flex items-center justify-between', !horizontal && 'md:hidden')}>
          <div aria-hidden="true" className="flex gap-1.5">
            {topics.map((topic, i) => (
              <span key={topic.title} className={cn('h-1.5 rounded-full transition-all duration-base', i === active ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300')} />
            ))}
          </div>
          <p className="font-display text-caption font-semibold tabular-nums text-gray-500">
            {String(active + 1).padStart(2, '0')} / {String(topics.length).padStart(2, '0')}
          </p>
        </div>
      )}
      {rail && (
        <div className="mt-5 flex items-center justify-between">
          <div aria-hidden="true" className="flex gap-1.5">
            {topics.map((topic, i) => (
              <span key={topic.title} className={cn('h-1.5 rounded-full transition-all duration-base', i === active ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300')} />
            ))}
          </div>
          <p className="font-display text-caption font-semibold tabular-nums text-gray-500">
            {String(active + 1).padStart(2, '0')} / {String(topics.length).padStart(2, '0')}
          </p>
        </div>
      )}
    </div>
  );
}
