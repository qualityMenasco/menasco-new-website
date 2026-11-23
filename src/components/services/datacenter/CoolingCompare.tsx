import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { dcSustainability as d } from '../../../data/dataCenterSustainability';
import { Segmented } from './technicalDiagrams';

/**
 * "Cooling configurations compared" (sustainability page): pick a configuration to see its
 * scorecard across the five criteria (best option per criterion in MENASCO blue), then the
 * climate notes. No sideways scrolling on any screen size.
 */
const c = d.cooling;
type Crit = (typeof c.criteria)[number];
const isBest = (cr: Crit, i: number) =>
  !('plain' in cr && cr.plain?.includes(c.configs[i].id)) &&
  (cr.better === 'low' ? cr.levels[i] === Math.min(...cr.levels) : cr.levels[i] === Math.max(...cr.levels));

/** Three-step meter; brand blue when this option is the best on the criterion. */
function Meter({ level, best }: { level: number; best: boolean }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span key={n} className={cn('h-1.5 w-5 rounded-full', n <= level ? (best ? 'bg-brand-600' : 'bg-gray-400') : 'bg-gray-200')} />
      ))}
    </span>
  );
}

function Climates() {
  // Phones: one panel with the three regions stacked. Tablet and desktop: a separate card per region.
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 md:border-0 md:bg-transparent md:p-0">
      <p className="text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.climateHeading}</p>
      <dl className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 lg:gap-6">
        {c.climates.map((cl) => (
          <div key={cl.region} className="md:rounded-lg md:border md:border-gray-200 md:bg-white md:p-5 lg:p-6">
            <dt className="font-display text-small font-semibold text-ink md:text-body">{cl.region}</dt>
            <dd className="mt-0.5 text-small leading-relaxed text-gray-600 md:mt-1.5">{cl.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const TYPE: Record<string, string> = { chw: 'chilled water', hybrid: 'hybrid air / liquid', dlc: 'direct-to-chip' };

/**
 * Small "i" with a bubble: shows on mouse hover and keyboard focus, toggles on tap.
 * Visibility is all state (no CSS :hover / :focus-within, which stick on touch
 * screens), and an open bubble closes on any scroll, a tap or click elsewhere, or Escape.
 */
function InfoBubble({ text }: { text: string }) {
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const open = pinned || hover;

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setPinned(false);
      setHover(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('scroll', close, { passive: true, capture: true });
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, { capture: true });
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(false)}
    >
      <button
        type="button"
        aria-label={text}
        aria-expanded={open}
        onClick={() => setPinned((v) => !v)}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && setPinned(true)}
        onBlur={() => setPinned(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Info size={14} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-60 rounded-md bg-ink px-3 py-2 text-caption font-normal normal-case leading-snug tracking-normal text-white shadow-lg transition-opacity duration-150',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        {text}
      </span>
    </span>
  );
}

function OptionC() {
  const [id, setId] = useState(c.configs[1].id);
  const i = c.configs.findIndex((x) => x.id === id);
  const cfg = c.configs[i];
  return (
    <>
      <div className="mt-8">
        <Segmented label="Configuration" value={id} onChange={setId} options={c.configs.map((x) => ({ id: x.id, label: x.id === 'chw' ? 'Chilled water' : x.id === 'hybrid' ? 'Hybrid' : 'Direct-to-chip' }))} />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 rounded-lg border border-gray-200 bg-white p-5 md:grid-cols-12 md:gap-8 lg:p-7">
        <div className="md:col-span-4">
          <h3 className="font-display text-h4 font-semibold leading-snug text-ink">{cfg.name}</h3>
          <p className="mt-1.5 text-small leading-relaxed text-gray-600">{cfg.sub}</p>
        </div>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 md:col-span-8">
          {c.criteria.map((cr) => (
            <div key={cr.label} className="rounded-md bg-stone px-3.5 py-3">
              <dt className="flex items-center justify-between gap-2 text-caption font-semibold uppercase tracking-widest text-gray-500">
                {cr.label.replace(' (with evaporative heat rejection)', '')}
                {'info' in cr && cr.info && <InfoBubble text={cr.info.replace('{type}', TYPE[cfg.id])} />}
              </dt>
              <dd className="mt-2 flex items-center justify-between gap-3">
                <span className={cn('font-display text-small font-semibold', isBest(cr, i) ? 'text-brand-700' : 'text-ink')}>{cr.words[i]}</span>
                <Meter level={cr.levels[i]} best={isBest(cr, i)} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <Climates />
    </>
  );
}

export function CoolingCompare() {
  return <OptionC />;
}
