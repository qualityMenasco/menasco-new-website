import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SECTION_SCROLL_MARGIN } from '../SectionJumpMenu';

/**
 * Shared building blocks for the Data Center pages' animated diagrams:
 * flow colours, an on-screen hook that pauses animation off screen, an
 * animated flow path, schematic nodes, black image placeholders and source
 * citations.
 */

/** Flow colours: power (amber), data (blue), water (teal), heat (warm red), structure (grey). */
export const FLOW = {
  power: '#E0A526',
  data: '#3FA9DD',
  water: '#4FB3A3',
  heat: '#D9735E',
  line: '#3A4048',
  lineLight: '#C9C3BA',
} as const;
export type FlowKind = 'power' | 'data' | 'water' | 'heat';

/** True while the element is (roughly) on screen; diagrams pause their animation otherwise. */
export function useInView<T extends Element>(rootMargin = '120px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}

/**
 * A path with a quiet base stroke and a dashed overlay travelling along it.
 * `reverse` runs the flow backwards; `speed` scales the duration.
 */
export function FlowPath({
  d,
  kind,
  width = 2,
  base = FLOW.line,
  speed = 1,
  reverse = false,
  dash = '6 14',
  active = true,
}: {
  d: string;
  kind: FlowKind;
  width?: number;
  base?: string;
  speed?: number;
  reverse?: boolean;
  dash?: string;
  active?: boolean;
}) {
  return (
    <g>
      <path d={d} fill="none" stroke={base} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      {active && (
        <path
          d={d}
          fill="none"
          stroke={FLOW[kind]}
          strokeWidth={width + 0.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dash}
          className="dc-flow"
          style={{ ['--dc-flow-distance' as string]: reverse ? '120' : '-120', ['--dc-flow-duration' as string]: `${2.4 / speed}s` }}
        />
      )}
    </g>
  );
}

/** A labelled schematic box (equipment) for the single-line style diagrams. */
export function Node({
  x,
  y,
  w = 112,
  h = 46,
  label,
  sub,
  tone = 'dark',
  accent,
  dim = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  tone?: 'dark' | 'light';
  accent?: string;
  dim?: boolean;
}) {
  const dark = tone === 'dark';
  return (
    <g opacity={dim ? 0.35 : 1} style={{ transition: 'opacity 400ms ease-out' }}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={dark ? '#14181D' : '#FFFFFF'} stroke={accent ?? (dark ? '#3A4048' : '#C9C3BA')} strokeWidth={1.2} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 4)} textAnchor="middle" className="font-sans text-[11px] font-semibold" fill={dark ? '#F3F0EB' : '#0a0b0d'}>
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 12} textAnchor="middle" className="font-sans text-[9px]" fill={dark ? '#9AA3AD' : '#6B655D'}>
          {sub}
        </text>
      )}
    </g>
  );
}

/**
 * Wraps a diagram: pauses its animation while off screen. `minWidth` keeps
 * wide diagrams readable on phones (they scroll sideways instead of
 * shrinking); the label sits below the drawing on phones, in the corner from
 * tablet up.
 */
export function DiagramFrame({
  children,
  className,
  dark = true,
  label,
  minWidth,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  label?: string;
  minWidth?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      dir="ltr"
      className={cn('relative overflow-hidden rounded-md border', dark ? 'border-white/10 bg-graphite' : 'border-gray-200 bg-white', !inView && 'dc-paused', className)}
    >
      <div className={cn(minWidth && 'no-scrollbar overflow-x-auto')}>
        <div style={minWidth ? { minWidth } : undefined}>{children}</div>
      </div>
      {label && (
        <p className="pointer-events-none px-4 pb-3 text-caption font-medium text-gray-500 md:absolute md:bottom-3 md:end-4 md:p-0">{label}</p>
      )}
    </div>
  );
}

/** A black image placeholder until final photography is supplied. */
export function PlaceholderImage({ className, label = 'Image placeholder' }: { className?: string; label?: string }) {
  return (
    <div role="img" aria-label={label} className={cn('flex items-end justify-start rounded-md bg-ink p-3', className)}>
      <span className="text-caption font-medium uppercase tracking-widest text-gray-600">{label}</span>
    </div>
  );
}

export interface SourceEntry {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
}

/** Superscript citation linking to the page's numbered source list. */
export function Cite({ n }: { n: number }) {
  return (
    <sup className="ms-0.5 font-sans text-[0.7em] font-semibold">
      <a href={`#source-${n}`} className="text-brand-600 hover:underline" aria-label={`Source ${n}`}>
        [{n}]
      </a>
    </sup>
  );
}

/**
 * The numbered sources list (anchors match `Cite`). Collapsed by default behind a
 * "Show all sources (N)" toggle (client request 2026-11-24); the list is always in the HTML
 * (hidden attribute, never unmounted). Following a citation link ([n] anywhere on the page,
 * or a #source-n URL) opens the list and scrolls to that source.
 */
export function SourcesList({
  sources,
  heading,
  intro,
  showLabel = 'Show all sources',
  hideLabel = 'Hide sources',
}: {
  sources: SourceEntry[];
  heading: string;
  intro?: string;
  showLabel?: string;
  hideLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reveal = (hash: string, smooth: boolean) => {
      if (!/^#source-\d+$/.test(hash)) return false;
      setOpen(true);
      // After the list has rendered visible, bring the source under the sticky bars.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start', behavior: smooth && !reduce ? 'smooth' : 'auto' });
        }),
      );
      return true;
    };
    reveal(window.location.hash, false);
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="#source-"]');
      if (!link) return;
      const hash = link.getAttribute('href') ?? '';
      if (reveal(hash, true)) {
        e.preventDefault();
        window.history.replaceState(window.history.state, '', hash);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div>
      <h2 className="font-display text-h3 font-semibold tracking-tight text-ink">{heading}</h2>
      {intro && <p className="mt-2 max-w-2xl text-small text-gray-600">{intro}</p>}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="sources-list"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 inline-flex min-h-10 items-center gap-1.5 font-display text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {open ? hideLabel : showLabel}
        <span className="tabular-nums text-gray-500">({sources.length})</span>
        <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', open && 'rotate-180')} />
      </button>
      {/* The hidden attribute sits on a wrapper with no display utility (a `grid` class would override it). */}
      <div id="sources-list" hidden={!open}>
      <ol className="mt-4 grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-2">
        {sources.map((s, i) => (
          <li key={s.id} id={`source-${i + 1}`} className={cn('flex gap-3 text-small text-gray-700', SECTION_SCROLL_MARGIN)}>
            <span className="w-6 shrink-0 font-semibold tabular-nums text-brand-600">[{i + 1}]</span>
            <span>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline-offset-4 hover:underline">
                {s.title}
              </a>
              <span className="text-gray-500">
                {' '}
                · {s.publisher}, {s.year}
              </span>
            </span>
          </li>
        ))}
      </ol>
      </div>
    </div>
  );
}
