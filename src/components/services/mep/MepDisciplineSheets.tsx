import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { MEP_DISCIPLINE_ANCHORS } from '../../../data/mepDisciplines';
import { cn } from '../../../lib/utils';
import { disciplineTone, type Discipline } from './MepSystemsDiagram';

/** Drawing-sheet code per discipline (M-01, E-02, P-03, FP-04). */
const CODES: Record<Discipline, string> = { mechanical: 'M', electrical: 'E', plumbing: 'P', fire: 'FP' };
/** On phones, scope lists show this many items until "Show all". */
const MOBILE_SCOPE_LIMIT = 6;
/** Height of the sticky mobile/tablet header (MobileHeader, h-14) plus breathing room. */
const HEADER_OFFSET = 72;

interface DisciplineEntry {
  id: Discipline;
  label: string;
  title: string;
}

interface Sheet extends DisciplineEntry {
  ref: string;
  introduction: string;
  scope: string[];
  line: string;
}

/**
 * Copy: services `mepPage.disciplinesSection` (tab labels, chrome) and
 * `items.<id>` (introduction + capabilities, shared with the drafts kept in
 * src/data/mepSubServiceDrafts.ts).
 */
function useSheets(): Sheet[] {
  const { t } = useTranslation('services');
  const items = t('mepPage.disciplinesSection.items', { returnObjects: true }) as DisciplineEntry[];
  return items.map((item, i) => ({
    ...item,
    ref: `${CODES[item.id]}-${String(i + 1).padStart(2, '0')}`,
    introduction: t(`items.${item.id}.introduction`),
    scope: t(`items.${item.id}.capabilities`, { returnObjects: true }) as string[],
    line: disciplineTone(item.id).line,
  }));
}

function ScopeList({ sheet, idPrefix }: { sheet: Sheet; idPrefix: string }) {
  const { t } = useTranslation('services');
  const [open, setOpen] = useState(false);
  const listId = `${idPrefix}-scope-${sheet.id}`;
  return (
    <div>
      <p className="font-display text-caption font-semibold uppercase tracking-widest text-ink rtl:tracking-normal">{t('mepPage.disciplinesSection.scopeLabel')}</p>
      <ul id={listId} className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {sheet.scope.map((item, j) => (
          <li key={item} className={cn('flex gap-3 border-b border-gray-200 py-2.5 text-small text-gray-700', !open && j >= MOBILE_SCOPE_LIMIT && 'max-md:hidden')}>
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: sheet.line }} />
            {item}
          </li>
        ))}
      </ul>
      {sheet.scope.length > MOBILE_SCOPE_LIMIT && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600 md:hidden"
        >
          {open ? t('mepPage.disciplinesSection.showLess') : t('mepPage.disciplinesSection.showAll', { count: sheet.scope.length })}
          <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', open && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}

/** Closes each sheet like a drawing title block. */
function TitleBlock({ sheet }: { sheet: Sheet }) {
  const { t } = useTranslation('services');
  const k = (key: string) => t(`mepPage.disciplinesSection.titleBlock.${key}`);
  const cells: [string, string][] = [
    [k('discipline'), sheet.label],
    [k('drawingRef'), sheet.ref],
    [k('systems'), String(sheet.scope.length)],
    [k('coordination'), k('coordinationValue')],
  ];
  return (
    <dl className="grid grid-cols-2 border-t border-gray-200 text-caption md:grid-cols-4">
      {cells.map(([label, value], i) => (
        <div key={label} className={cn('px-5 py-3 md:px-8', i % 2 === 1 && 'border-s border-gray-200', i > 1 && 'border-t border-gray-200 md:border-t-0', i === 2 && 'md:border-s')}>
          <dt className="font-semibold uppercase tracking-wider text-gray-400 rtl:tracking-normal">{label}</dt>
          <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Sheet body: discipline title + introduction beside the scope list. */
function SheetBody({ sheet, showTitle, idPrefix }: { sheet: Sheet; showTitle: boolean; idPrefix: string }) {
  return (
    <div className="grid grid-cols-1 gap-7 p-5 md:gap-10 md:p-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        {showTitle && <h3 className="font-display text-h3 font-semibold tracking-tight text-ink text-balance">{sheet.title}</h3>}
        <p className={cn('text-small leading-relaxed text-gray-700 md:text-body', showTitle && 'mt-4')}>{sheet.introduction}</p>
      </div>
      <div className="lg:col-span-7">
        <ScopeList sheet={sheet} idPrefix={idPrefix} />
      </div>
    </div>
  );
}

/**
 * The four MEP disciplines as drawing sheets. From 768px (tablets up): the
 * desktop layout, folder tabs (drawing ref + label) sitting on one sheet; the
 * active tab joins the sheet. Below that the tab labels no longer fit, so phones
 * get stacked sheet rows, all closed on entry; opening one unfolds it in place
 * and snaps the page so the open sheet is centred.
 */
export function MepDisciplineSheets() {
  const { t } = useTranslation('services');
  const sheets = useSheets();
  const [active, setActive] = useState(0);
  // Phones: all sheets start closed.
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const location = useLocation();
  // Bumped to re-snap even when the requested row is already open.
  const [snapRequest, setSnapRequest] = useState(0);

  // On opening a sheet, snap the page so the whole open sheet sits centred in the
  // space below the header; if it's taller than that, align its top under the header.
  useEffect(() => {
    if (mobileOpen === null) return;
    const el = rowRefs.current[mobileOpen];
    if (!el || el.offsetParent === null) return;
    const frame = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const available = window.innerHeight - HEADER_OFFSET;
      const offset = rect.height < available ? HEADER_OFFSET + (available - rect.height) / 2 : HEADER_OFFSET;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: window.scrollY + rect.top - offset, behavior: reduce ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [mobileOpen, snapRequest]);

  // /services/mep#mechanical (etc.): open that discipline — the tab from tablets
  // up (the page-level hash scroll brings the section into view), the row on
  // phones (which then snaps into view as above).
  useEffect(() => {
    const anchor = location.hash.slice(1);
    const index = sheets.findIndex((sheet) => MEP_DISCIPLINE_ANCHORS[sheet.id] === anchor);
    if (index < 0) return;
    setActive(index);
    setMobileOpen(index);
    setSnapRequest((n) => n + 1);

    // Tablet/desktop: late layout shifts above the section (web fonts, the
    // Arabic face especially) can land the page-level hash scroll short.
    // Re-align a couple of times while the page settles — but only if the
    // visitor hasn't scrolled since.
    const target = document.getElementById(anchor);
    if (!target || target.offsetParent === null) return;
    let userScrolled = false;
    const markUser = () => {
      userScrolled = true;
    };
    const userEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    userEvents.forEach((type) => window.addEventListener(type, markUser, { passive: true }));
    const timers = [1000, 2200].map((delay) =>
      window.setTimeout(() => {
        if (!userScrolled) target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }, delay),
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      userEvents.forEach((type) => window.removeEventListener(type, markUser));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, location.key, sheets.length]);
  const current = sheets[active];
  if (!current) return null;

  return (
    <>
      {/* Phones (below 768px): stacked sheet rows (accordion). */}
      <div className="space-y-3 md:hidden">
        {sheets.map((sheet, i) => {
          const open = mobileOpen === i;
          return (
            <div
              key={sheet.id}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className={cn('overflow-hidden rounded-md border bg-white', open ? 'border-gray-300' : 'border-gray-200')}
            >
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`mep-sheet-m-${sheet.id}`}
                onClick={() => setMobileOpen(open ? null : i)}
                className="relative flex min-h-16 w-full items-center gap-4 px-5 py-4 text-start"
              >
                <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px]" style={{ backgroundColor: sheet.line, opacity: open ? 1 : 0.35 }} />
                <span dir="ltr" className="w-11 shrink-0 font-mono text-caption font-semibold tracking-wider" style={{ color: open ? sheet.line : '#9ca3af' }}>
                  {sheet.ref}
                </span>
                <span className="flex-1 font-display text-body-lg font-semibold leading-snug text-ink">{sheet.title}</span>
                <ChevronDown size={20} aria-hidden="true" className={cn('shrink-0 text-gray-400 transition-transform duration-base', open && 'rotate-180 text-ink')} />
              </button>
              {/* Always in the HTML (SEO); closed sheets are hidden, not unmounted. */}
              <div id={`mep-sheet-m-${sheet.id}`} hidden={!open} className="border-t border-gray-200">
                <SheetBody sheet={sheet} showTitle={false} idPrefix="mep-m" />
                <TitleBlock sheet={sheet} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 768px and up: folder tabs + one sheet. */}
      <div className="hidden md:block">
        <div role="tablist" aria-label={t('mepPage.disciplinesSection.eyebrow')} className="relative z-10 -mb-px flex gap-1">
          {sheets.map((sheet, i) => {
            const isActive = i === active;
            return (
              <button
                key={sheet.id}
                id={`mep-tab-${sheet.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`mep-panel-${sheet.id}`}
                onClick={() => setActive(i)}
                className={cn(
                  'relative flex min-w-0 flex-1 items-baseline gap-1.5 rounded-t-md border px-2.5 py-3.5 text-start lg:gap-3 transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 lg:px-5',
                  isActive ? 'border-gray-300 border-b-white bg-white' : 'border-transparent text-gray-500 hover:bg-white/50 hover:text-ink',
                )}
              >
                {isActive && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[2px] rounded-t-md" style={{ backgroundColor: sheet.line }} />}
                <span dir="ltr" className="shrink-0 font-mono text-caption font-semibold tracking-wider" style={{ color: isActive ? sheet.line : '#9ca3af' }}>
                  {sheet.ref}
                </span>
                <span className={cn('truncate font-display text-small font-semibold lg:text-body', isActive && 'text-ink')}>{sheet.label}</span>
              </button>
            );
          })}
        </div>
        {/* Every panel is in the HTML (SEO); only the active one is shown. */}
        {sheets.map((sheet, i) => (
          <div
            key={sheet.id}
            id={`mep-panel-${sheet.id}`}
            role="tabpanel"
            aria-labelledby={`mep-tab-${sheet.id}`}
            hidden={i !== active}
            className={cn('rounded-md border border-gray-300 bg-white', i === 0 && 'rounded-ss-none', i === sheets.length - 1 && 'rounded-se-none')}
          >
            <SheetBody sheet={sheet} showTitle idPrefix="mep-d" />
            <TitleBlock sheet={sheet} />
          </div>
        ))}
      </div>
    </>
  );
}
