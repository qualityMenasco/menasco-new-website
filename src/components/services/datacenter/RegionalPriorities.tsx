import { useState } from 'react';
import { cn } from '../../../lib/utils';
import { dcSustainability as d } from '../../../data/dataCenterSustainability';
import { Segmented } from './technicalDiagrams';
import { RailDots, RichText, useRail } from './shared';

/**
 * "Regional priorities" (sustainability page): GCC / USA / Europe switch beside the heading, the
 * section intro (the same for all regions), then the region's seven priorities as a numbered list (two columns from tablet). All three
 * regions stay in the HTML, stacked in one cell, so switching never changes the section height.
 * Phones: the priorities are a swipeable card row with position dots (one region fits on one
 * screen; client request 2026-11-24). Same list element, so the text is in the HTML once.
 */
type Region = 'gcc' | 'usa' | 'europe';
type Row = { intervention: string; why: string };
const REGIONS: { id: Region; label: string; block: { eyebrow: string; heading: string; rows: Row[] } }[] = [
  { id: 'gcc', label: 'GCC', block: d.gcc },
  { id: 'usa', label: 'USA', block: d.usa },
  { id: 'europe', label: 'Europe', block: d.europe },
];
const EYEBROW = 'font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal';
const H2 = 'font-display text-[clamp(1.625rem,1.2rem+1.5vw,2.375rem)] font-semibold leading-[1.1] tracking-tight text-ink text-balance';

function Num({ n, small = false }: { n: number; small?: boolean }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-display font-semibold tabular-nums text-white', small ? 'h-5 w-5 text-[0.7rem]' : 'h-7 w-7 text-caption')}>
      {n}
    </span>
  );
}

/** One region's priorities: card rail on phones, two-column numbered list from tablet. */
function PriorityList({ rows }: { rows: Row[] }) {
  const rail = useRail();
  const { railRef, active, onScroll } = rail;
  return (
    <>
      <ol
        ref={(el) => {
          railRef.current = el;
        }}
        onScroll={onScroll}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden scroll-px-6 px-6 pb-1 md:mx-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-0 md:snap-none md:overflow-visible md:border-t md:border-gray-200 md:px-0 md:pb-0"
      >
        {rows.map((row, i) => (
          // Phones: number + title on one line, the reason full width under both (fewer lines per
          // card). Tablet/desktop: the reason sits under the title, beside the number (as before).
          <li
            key={row.intervention}
            className="grid w-[86%] max-w-sm shrink-0 snap-start grid-cols-[auto_minmax(0,1fr)] content-start gap-x-2.5 rounded-lg border border-gray-200 bg-white p-4 md:w-auto md:max-w-none md:gap-x-3.5 md:rounded-none md:border-0 md:border-b md:bg-transparent md:px-0 md:py-3"
          >
            <Num n={i + 1} small />
            <p className="min-w-0 font-display text-small font-semibold leading-snug text-ink">{row.intervention}</p>
            <p className="col-span-2 mt-1.5 min-w-0 text-[0.8125rem] leading-snug text-gray-600 md:col-span-1 md:col-start-2 md:mt-0.5 md:text-small">
              <RichText text={row.why} />
            </p>
          </li>
        ))}
      </ol>
      <RailDots count={rows.length} active={active} rail={rail} />
    </>
  );
}

function OptionA() {
  const [region, setRegion] = useState<Region>('gcc');
  return (
    <>
      <p className={EYEBROW}>Regional priorities</p>
      <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 className={H2}>GCC, USA and Europe</h2>
        <Segmented label="Region" value={region} onChange={setRegion} options={REGIONS.map((r) => ({ id: r.id, label: r.label }))} />
      </div>
      <p className="mt-3 max-w-3xl text-small leading-relaxed text-gray-700 md:mt-4">{d.regional.intro}</p>
      <div className="mt-4 grid grid-cols-1 md:mt-5">
        {REGIONS.map((r) => {
          const shown = region === r.id;
          return (
            <div key={r.id} aria-hidden={!shown} {...(shown ? {} : { inert: '' })}
              className={cn('col-start-1 row-start-1 min-w-0 transition-opacity duration-300 motion-reduce:transition-none', shown ? 'visible opacity-100' : 'invisible opacity-0')}>
              <PriorityList rows={r.block.rows} />
            </div>
          );
        })}
      </div>
    </>
  );
}

export function RegionalPriorities() {
  return <OptionA />;
}
