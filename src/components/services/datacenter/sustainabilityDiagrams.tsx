import { useEffect, useState } from 'react';
import { dcSustainability, type OpportunityIcon } from '../../../data/dataCenterSustainability';
import { cn } from '../../../lib/utils';
import { DiagramFrame, FLOW, FlowPath, useInView } from './primitives';

/* -------------------------------------------------------------- hero flow */

/**
 * Energy, water and carbon flowing into a facility outline; useful computing
 * leaves on one side, and the loss streams (cooling overhead, water,
 * rejected heat) are shown thin and reducing, with a recovered-heat loop.
 */
export function SustainHeroDiagram() {
  return (
    <DiagramFrame label={dcSustainability.hero.diagramLabel} minWidth={680}>
      <svg viewBox="0 0 1000 360" role="img" aria-label={dcSustainability.hero.diagramLabel} className="block h-auto w-full">
        {/* Inputs */}
        {(
          [
            ['Low-carbon power', 'power', 70],
            ['Water', 'water', 160],
            ['Embodied carbon', 'heat', 250],
          ] as const
        ).map(([label, kind, y]) => (
          <g key={label}>
            <text x={24} y={y - 10} className="font-sans text-[11px] font-semibold" fill="#C9CED4">
              {label}
            </text>
            <FlowPath d={`M24 ${y} C 200 ${y}, 260 180, 380 180`} kind={kind} width={kind === 'power' ? 5 : 3} speed={kind === 'power' ? 1.2 : 0.9} />
          </g>
        ))}

        {/* Facility */}
        <rect x={380} y={110} width={240} height={140} rx={10} fill="#14181D" stroke="#3A4048" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={402 + i * 42} y={132} width={30} height={96} rx={2} fill="#1E242B" />
            {[0, 1, 2, 3, 4].map((j) => (
              <circle key={j} cx={426 + i * 42} cy={142 + j * 18} r={1.6} fill={FLOW.data} className="dc-glow" style={{ animationDelay: `${((i * 3 + j) % 8) * 0.28}s` }} />
            ))}
          </g>
        ))}
        <text x={500} y={272} textAnchor="middle" className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em]" fill="#9AA3AD">
          Data center
        </text>

        {/* Useful output */}
        <FlowPath d="M620 160 C 740 160, 780 90, 976 90" kind="data" width={6} speed={1.4} />
        <text x={976} y={74} textAnchor="end" className="font-sans text-[12px] font-semibold" fill="#F3F0EB">
          Useful computing
        </text>

        {/* Losses, reduced */}
        <FlowPath d="M620 200 C 740 200, 790 210, 976 210" kind="heat" width={2} speed={0.8} />
        <text x={976} y={198} textAnchor="end" className="font-sans text-[10px]" fill="#C9A49B">
          Cooling and electrical losses, reduced
        </text>
        <FlowPath d="M620 232 C 740 232, 790 290, 976 290" kind="water" width={1.4} speed={0.7} />
        <text x={976} y={280} textAnchor="end" className="font-sans text-[10px]" fill="#8FBFB3">
          Water consumed, minimised
        </text>

        {/* Heat recovery loop */}
        <FlowPath d="M560 250 C 560 330, 700 330, 760 300" kind="heat" width={2.4} speed={0.9} dash="4 10" />
        <text x={770} y={330} className="font-sans text-[10px] font-semibold" fill={FLOW.heat}>
          Heat recovered for reuse
        </text>
      </svg>
    </DiagramFrame>
  );
}

/* ------------------------------------------------------ opportunity icons */

/** A small animated pictogram for each of the seven opportunities. */
export function OpportunityGlyph({ icon }: { icon: OpportunityIcon }) {
  const { ref, inView } = useInView<SVGSVGElement>();
  const common = { ref, viewBox: '0 0 120 80', className: cn('h-20 w-full', !inView && 'dc-paused'), 'aria-hidden': true } as const;
  switch (icon) {
    case 'cooling':
      return (
        <svg {...common}>
          <rect x={44} y={14} width={32} height={52} rx={3} fill="#14181D" />
          <FlowPath d="M10 30 H44 M76 30 H110" kind="water" width={3} base="#D8ECE6" />
          <FlowPath d="M110 50 H76 M44 50 H10" kind="heat" width={3} base="#F3D9D2" />
        </svg>
      );
    case 'clean-power':
      return (
        <svg {...common}>
          <rect x={10} y={46} width={36} height={18} rx={2} fill="#E3EEF4" stroke="#2E5F78" transform="skewX(-15)" />
          <g className="dc-glow">
            <circle cx={26} cy={22} r={9} fill="none" stroke={FLOW.power} strokeWidth={2} />
          </g>
          <line x1={84} y1={64} x2={84} y2={30} stroke="#6B655D" strokeWidth={2} />
          <g style={{ transformOrigin: '84px 30px' }} className="animate-spin [animation-duration:4s]">
            <path d="M84 30 l0 -16 M84 30 l14 8 M84 30 l-14 8" stroke="#2E5F78" strokeWidth={2.4} strokeLinecap="round" />
          </g>
          <FlowPath d="M46 56 H70 M98 56 H112" kind="power" width={2} base="#EFE6D3" />
        </svg>
      );
    case 'electrical':
      return (
        <svg {...common}>
          <rect x={14} y={24} width={28} height={32} rx={3} fill="#FFFFFF" stroke="#C9C3BA" />
          <rect x={78} y={24} width={28} height={32} rx={3} fill="#FFFFFF" stroke="#C9C3BA" />
          <FlowPath d="M42 40 H78" kind="power" width={4} base="#EFE6D3" speed={1.4} />
          <path d="M60 46 q 3 6 0 12" fill="none" stroke={FLOW.heat} strokeWidth={1.4} className="dc-rise" />
        </svg>
      );
    case 'water':
      return (
        <svg {...common}>
          <path d="M30 40 a 30 22 0 1 0 60 0 a 30 22 0 1 0 -60 0" fill="none" stroke="#D8ECE6" strokeWidth={3} />
          <FlowPath d="M30 40 a 30 22 0 1 0 60 0 a 30 22 0 1 0 -60 0" kind="water" width={3} base="transparent" dash="8 16" />
          <path d="M60 30 c -6 8 -6 14 0 16 c 6 -2 6 -8 0 -16 z" fill={FLOW.water} />
        </svg>
      );
    case 'heat':
      return (
        <svg {...common}>
          <rect x={12} y={26} width={30} height={30} rx={3} fill="#14181D" />
          <FlowPath d="M42 34 C 70 20, 80 20, 104 34" kind="heat" width={3} base="#F3D9D2" />
          <path d="M92 42 l12 10 l-12 10" fill="none" stroke="#7A2F28" strokeWidth={2} />
          <rect x={78} y={44} width={30} height={20} rx={2} fill="#FFFFFF" stroke="#C9C3BA" />
        </svg>
      );
    case 'construction':
      return (
        <svg {...common}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={20 + i * 28} y={40 - (i % 2) * 14} width={24} height={24} rx={2} fill="#E3EEF4" stroke="#2E5F78" className="dc-glow" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
          <line x1={10} y1={66} x2={110} y2={66} stroke="#C9C3BA" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x={14} y={14} width={92} height={52} rx={4} fill="#FFFFFF" stroke="#C9C3BA" />
          <FlowPath d="M22 54 L40 40 L56 46 L74 28 L98 34" kind="data" width={2.4} base="#D6E8F0" />
          <circle cx={98} cy={34} r={3} fill={FLOW.data} className="dc-glow" />
        </svg>
      );
  }
}

/* ------------------------------------------------------- metric direction */

/** A small gauge: an arrow animating in the desired direction. */
export function DirectionGauge({ better }: { better: 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0" aria-hidden="true">
      <circle cx={20} cy={20} r={18} fill="none" stroke="#E4E0DA" strokeWidth={2} />
      <g className="dc-glow">
        <path d={better === 'down' ? 'M20 10 V28 M13 21 L20 28 L27 21' : 'M20 30 V12 M13 19 L20 12 L27 19'} fill="none" stroke="#0C76A3" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* --------------------------------------------------- cooling comparison */

/** Three filled segments for a qualitative level (1 = low … 3 = high). */
export function LevelBar({ level, word, good }: { level: number; word: string; good: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={cn('h-2 w-6 rounded-full transition-colors duration-500', n <= level ? (good ? 'bg-brand-600' : 'bg-gray-500') : 'bg-gray-200')} />
        ))}
      </div>
      <span className="text-small text-gray-700">{word}</span>
    </div>
  );
}

/* ------------------------------------------------------------- outlook */

/**
 * IEA central projection: 485 TWh (2025) → 950 TWh (2030). One series, two
 * points, so drawn as two bars on one axis with direct labels; hover shows
 * the exact figure. Bars grow when the chart scrolls into view.
 */
export function OutlookChart() {
  const o = dcSustainability.outlook.chart;
  const { ref, inView } = useInView<HTMLDivElement>('0px');
  // Grow once when first seen, then stay (no collapse when scrolled away).
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  const [hover, setHover] = useState<number | null>(null);
  const data = [
    { label: o.y2025, value: 485 },
    { label: o.y2030, value: 950 },
  ];
  const max = 1000;
  return (
    <div ref={ref} className="relative">
      <svg viewBox="0 0 420 260" role="img" aria-label="Global data centre electricity consumption: 485 TWh in 2025, projected 950 TWh in 2030 (IEA)" className="block h-auto w-full">
        {[0, 250, 500, 750, 1000].map((v) => {
          const y = 220 - (v / max) * 190;
          return (
            <g key={v}>
              <line x1={48} y1={y} x2={410} y2={y} stroke="#E4E0DA" strokeWidth={1} />
              <text x={40} y={y + 4} textAnchor="end" className="font-sans text-[10px]" fill="#6B655D">
                {v}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = seen ? (d.value / max) * 190 : 0;
          const x = 110 + i * 170;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
              <rect x={x - 30} y={20} width={120} height={200} fill="transparent" />
              <path
                d={`M${x} 220 V${220 - h + 4} q 0 -4 4 -4 H${x + 56} q 4 0 4 4 V220 Z`}
                fill={i === 1 ? '#0C76A3' : '#86B4CB'}
                style={{ transition: 'd 900ms cubic-bezier(0.22,0.8,0.24,1)' }}
              />
              <text x={x + 30} y={220 - h - 10} textAnchor="middle" className="font-display text-[15px] font-semibold" fill="#0a0b0d" style={{ transition: 'all 900ms' }}>
                {d.value} {o.unit}
              </text>
              <text x={x + 30} y={240} textAnchor="middle" className="font-sans text-[11px]" fill="#3A4048">
                {d.label}
              </text>
            </g>
          );
        })}
        <line x1={48} y1={220} x2={410} y2={220} stroke="#8F887F" />
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute end-2 top-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-small shadow-sm">
          <span className="font-semibold text-ink">{data[hover].label}</span>: {data[hover].value} {o.unit}
        </div>
      )}
      {/* Table view of the same data */}
      <div className="sr-only">
      <table>
        <caption>Global data centre electricity consumption (TWh), IEA</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
