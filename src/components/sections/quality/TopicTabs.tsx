import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import type { AccordionTopic } from './TopicAccordion';

/** A topic, optionally with extra content rendered under its body (lists, links). */
export interface TabTopic extends AccordionTopic {
  extra?: ReactNode;
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
export function TopicTabs({ topics, idPrefix, label, className, layoutClassName = DEFAULT_LAYOUT, lead, footer }: TopicTabsProps) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const next = (index + topics.length) % topics.length;
    setActive(next);
    const tab = tabRefs.current[next];
    tab?.focus();
    tab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
    <div className={cn(layoutClassName, className)}>
      <div className="min-w-0">
      {lead}
      {/* Phones: a swipeable pill row. Tablets/desktop: a vertical list. */}
      <div
        role="tablist"
        aria-label={label}
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:border-s md:border-gray-200 md:px-0 md:pb-0"
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
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={onKeyDown}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500',
                'md:-ms-px md:whitespace-normal md:rounded-none md:border-0 md:border-s-2 md:px-5 md:py-3 md:text-start md:text-body',
                selected
                  ? 'border-brand-600 bg-white text-brand-600 md:border-brand-600 md:bg-transparent md:text-ink'
                  : 'border-gray-300 text-gray-600 hover:border-gray-500 hover:text-ink md:border-transparent md:hover:border-gray-300',
              )}
            >
              {topic.title}
            </button>
          );
        })}
      </div>
      {footer}
      </div>

      {/* Panels stacked in one cell: the box sizes to the longest topic. */}
      <div className="mt-5 grid rounded-md border border-gray-200 bg-white p-6 md:mt-0 md:p-8">
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
                'col-start-1 row-start-1 transition-opacity duration-300 ease-out motion-reduce:transition-none',
                selected ? 'visible opacity-100' : 'invisible opacity-0',
              )}
            >
              <h3 className="font-display text-h4 font-semibold text-ink">{topic.title}</h3>
              <div className="mt-3 max-w-3xl space-y-3 text-body leading-relaxed text-gray-700">
                {topic.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
              {topic.extra}
            </div>
          );
        })}
      </div>
    </div>
  );
}
