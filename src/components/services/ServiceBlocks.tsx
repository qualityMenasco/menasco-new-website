import { Children, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowRight, ChevronDown, ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RailDots, useRail } from './datacenter/shared';
import { cn } from '../../lib/utils';

/**
 * Building blocks shared by the rebuilt service pages (Manufacturing &
 * Prefabrication, EPC). They encode the site's phone rules: lists become
 * swipe rails with dots, long copy sits behind "Read more", detail lists
 * become tap-to-open rows, and every word stays in the DOM for crawlers.
 */

/* ---------------------------------------------------------- Placeholder */

/** Neutral stand-in until real photography is supplied; the caption says what goes here. */
export function ImagePlaceholder({ label, dark = false, className }: { label: string; dark?: boolean; className?: string }) {
  const { t } = useTranslation('common');
  const kicker = t('placeholders.image');
  return (
    <div
      role="img"
      aria-label={`${kicker}: ${label}`}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center',
        dark ? 'border-white/20 bg-white/[0.04] text-gray-400' : 'border-gray-300 bg-gray-100 text-gray-500',
        className,
      )}
    >
      <ImageIcon size={28} aria-hidden="true" />
      <span className="text-caption font-semibold uppercase tracking-widest rtl:tracking-normal">{kicker}</span>
      <span className="text-small">{label}</span>
    </div>
  );
}

/* ---------------------------------------------------------- Bullet list */

/** Ruled bullet list (brand dots), light or dark. */
export function BulletList({ items, dark = false, className }: { items: string[]; dark?: boolean; className?: string }) {
  return (
    <ul role="list" className={className}>
      {items.map((item) => (
        <li key={item} className={cn('flex gap-3 border-t py-2.5 text-small', dark ? 'border-white/10 text-gray-300' : 'border-gray-200 text-gray-700')}>
          <span aria-hidden="true" className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', dark ? 'bg-brand-400' : 'bg-brand-600')} />
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ Swipe rail */

/**
 * Phones (below sm): a swipeable, snapping row with position dots, so a list of
 * cards costs one card's height instead of the whole stack. From sm up: the
 * grid given in `gridClassName`. Children are the <li> items.
 */
export function RailList({ children, gridClassName, dark = false }: { children: ReactNode; gridClassName: string; dark?: boolean }) {
  const rail = useRail();
  const count = Children.count(children);
  return (
    <>
      <ul
        role="list"
        ref={(el) => {
          rail.railRef.current = el;
        }}
        onScroll={rail.onScroll}
        className={cn(
          'no-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 sm:mx-0 sm:grid sm:snap-none sm:overflow-visible sm:px-0',
          '[&>li]:w-[78vw] [&>li]:max-w-[20rem] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-auto sm:[&>li]:max-w-none',
          gridClassName,
        )}
      >
        {children}
      </ul>
      <div className="sm:hidden">
        <RailDots count={count} active={rail.active} dark={dark} />
      </div>
    </>
  );
}

/* --------------------------------------------------------- Read more */

/**
 * Body copy that shows its first paragraph clamped to three lines on phones,
 * behind "Read more" (same pattern as the MEP page). Full text from md up.
 */
export function ClampedParagraphs({ id, paragraphs, dark = false }: { id: string; paragraphs: string[]; dark?: boolean }) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  return (
    <>
      <div id={id}>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={cn(
              'mt-4 text-body leading-relaxed',
              dark ? 'text-gray-300' : 'text-gray-600',
              !open && (i === 0 ? 'line-clamp-3 md:line-clamp-none' : 'hidden md:block'),
            )}
          >
            {p}
          </p>
        ))}
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'mt-1 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold transition-colors duration-base md:hidden',
          dark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700',
        )}
      >
        {open ? t('buttons.showLess') : t('buttons.readMore')}
        <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', open && 'rotate-180')} />
      </button>
    </>
  );
}

/* ------------------------------------------------------- Disclosure rows */

/**
 * Rows whose detail opens on tap on phones; from md up every row is open and
 * the toggle is inert, so tablets/desktop read as a plain list (wrap it in
 * `md:hidden` when RowTabs takes over from md). Panels use the `hidden`
 * attribute (still in the DOM for crawlers).
 */
export function DisclosureList({
  idPrefix,
  items,
  defaultOpen = null,
  numbered = true,
  dark = false,
}: {
  idPrefix: string;
  items: { title: string; content: ReactNode }[];
  defaultOpen?: number | null;
  numbered?: boolean;
  dark?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const rule = dark ? 'border-white/15' : 'border-gray-300';
  return (
    <ol className={cn('border-b', rule)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={i} className={cn('border-t', rule)}>
            <h3>
              <button
                type="button"
                id={`${idPrefix}-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${idPrefix}-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  'grid w-full items-baseline py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:pointer-events-none md:pb-0',
                  numbered ? 'grid-cols-[2.5rem_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]',
                )}
              >
                {numbered && <span className={cn('font-display text-caption font-semibold tabular-nums', dark ? 'text-brand-400' : 'text-brand-600')}>{String(i + 1).padStart(2, '0')}</span>}
                <span className={cn('font-display text-body font-semibold', dark ? 'text-white' : 'text-ink')}>{item.title}</span>
                <ChevronDown size={18} aria-hidden="true" className={cn('self-center transition-transform duration-base md:hidden', dark ? 'text-gray-400' : 'text-gray-500', isOpen && 'rotate-180')} />
              </button>
            </h3>
            <div id={`${idPrefix}-panel-${i}`} role="region" aria-labelledby={`${idPrefix}-btn-${i}`} hidden={!isOpen} className={cn('pb-4 md:block md:pt-1', numbered && 'ps-10')}>
              {item.content}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------------- Row tabs */

/**
 * Tablet/desktop tabs: large ruled rows on the left and the selected panel on
 * the right, on the page's two-column grid, so the tabs carry as much visual
 * weight as the panel. Every panel stays in the DOM (crawlable); they share one
 * grid cell so switching never changes the height. Arrow keys move between
 * tabs. Hidden below md: pair with a DisclosureList for phones.
 *
 * Optional slots let a section share one layout at every width: `lead` sits
 * above the tab list (e.g. the section heading, so it pins with the tabs when
 * `sticky`), `aside` sits above the panels (e.g. the intro), and `phone` is the
 * phone-only content (e.g. a DisclosureList) shown under `aside` below md.
 * Phones then read lead, aside, phone in order.
 */
export function RowTabs({
  idPrefix,
  label,
  tabs,
  dark = false,
  sticky = false,
  lead,
  aside,
  phone,
  className,
}: {
  idPrefix: string;
  label: string;
  tabs: { title: string; panel: ReactNode }[];
  dark?: boolean;
  /** Keep the tab list pinned below the site header while a tall panel scrolls past. */
  sticky?: boolean;
  lead?: ReactNode;
  aside?: ReactNode;
  phone?: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    document.getElementById(`${idPrefix}-tab-${next}`)?.focus();
  };
  const rule = dark ? 'border-white/15' : 'border-gray-300';
  const slotted = Boolean(lead || aside || phone);
  return (
    <div className={cn(slotted ? 'grid grid-cols-1 gap-6' : 'hidden', 'md:grid md:grid-cols-[17rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-2 lg:gap-12', className)}>
      {/* Sticky offset clears the site header (56px below desktop, 80px from desktop) plus a gap. */}
      <div className={cn('self-start', sticky && 'md:sticky md:top-20 desktop:top-28')}>
      {lead}
      <div role="tablist" aria-label={label} aria-orientation="vertical" className={cn('hidden border-b md:block', rule, lead && 'md:mt-8')}>
        {tabs.map((tab, i) => {
          const on = i === active;
          return (
            <button
              key={tab.title}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${idPrefix}-panel-${i}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center border-t py-5 text-start transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500',
                rule,
                dark ? (on ? 'text-white' : 'text-gray-500 hover:text-white') : on ? 'text-ink' : 'text-gray-500 hover:text-ink',
              )}
            >
              <span className="font-display text-h4 font-semibold">{tab.title}</span>
              <ArrowRight size={18} aria-hidden="true" className={cn('transition-[opacity,transform] duration-base rtl:rotate-180', on ? cn('opacity-100', dark ? 'text-brand-400' : 'text-brand-600') : 'opacity-0 group-hover:opacity-60')} />
            </button>
          );
        })}
      </div>
      </div>
      <div>
      {aside}
      {phone && <div className={cn('md:hidden', aside && 'mt-6')}>{phone}</div>}
      <div className={cn('hidden md:grid', aside && 'md:mt-6')}>
        {tabs.map((tab, i) => {
          const on = i === active;
          return (
            <div
              key={tab.title}
              role="tabpanel"
              id={`${idPrefix}-panel-${i}`}
              aria-labelledby={`${idPrefix}-tab-${i}`}
              aria-hidden={!on}
              {...(on ? {} : { inert: '' })}
              className={cn(
                'rounded-md border p-6 transition-opacity duration-base [grid-area:1/1] lg:p-8',
                dark ? 'border-white/10 bg-white/[0.04]' : 'border-gray-200 bg-white',
                on ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              {tab.panel}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
