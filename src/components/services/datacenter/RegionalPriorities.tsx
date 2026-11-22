import { useState } from 'react';
import { cn } from '../../../lib/utils';
import { dcSustainability as d } from '../../../data/dataCenterSustainability';
import { Segmented } from './technicalDiagrams';
import { RichText } from './shared';

/**
 * "Regional priorities" (sustainability page): GCC / USA / Europe switch beside the heading, the
 * section intro (the same for all regions), then the region's seven priorities as a numbered list (two columns from tablet). All three
 * regions stay in the HTML, stacked in one cell, so switching never changes the section height.
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

function OptionA() {
  const [region, setRegion] = useState<Region>('gcc');
  return (
    <>
      <p className={EYEBROW}>Regional priorities</p>
      <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 className={H2}>GCC, USA and Europe</h2>
        <Segmented label="Region" value={region} onChange={setRegion} options={REGIONS.map((r) => ({ id: r.id, label: r.label }))} />
      </div>
      <p className="mt-4 max-w-3xl text-small leading-relaxed text-gray-700">{d.regional.intro}</p>
      <div className="mt-5 grid grid-cols-1">
        {REGIONS.map((r) => {
          const shown = region === r.id;
          return (
            <div key={r.id} aria-hidden={!shown} {...(shown ? {} : { inert: '' })}
              className={cn('col-start-1 row-start-1 min-w-0 transition-opacity duration-300 motion-reduce:transition-none', shown ? 'visible opacity-100' : 'invisible opacity-0')}>
              <ol className="grid grid-cols-1 gap-x-8 gap-y-0 border-t border-gray-200 md:grid-cols-2">
                {r.block.rows.map((row, i) => (
                  <li key={row.intervention} className="flex gap-3 border-b border-gray-200 py-2.5 md:gap-3.5 md:py-3">
                    <Num n={i + 1} small />
                    <div className="min-w-0">
                      <p className="font-display text-small font-semibold leading-snug text-ink">{row.intervention}</p>
                      <p className="mt-0.5 text-[0.8125rem] leading-snug text-gray-600 md:text-small">
                        <RichText text={row.why} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
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
