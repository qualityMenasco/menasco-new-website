import { useState } from 'react';
import { dcSustainability } from '../../../data/dataCenterSustainability';
import { cn } from '../../../lib/utils';

/* ------------------------------------------------------- metric direction */

/** A small static gauge: an arrow pointing in the desired direction. */
export function DirectionGauge({ better }: { better: 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 shrink-0" aria-hidden="true">
      <circle cx={20} cy={20} r={18} fill="none" stroke="#E4E0DA" strokeWidth={2} />
      <g>
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
          <span key={n} className={cn('h-2 w-6 rounded-full', n <= level ? (good ? 'bg-brand-600' : 'bg-gray-500') : 'bg-gray-200')} />
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
 * the exact figure. Static (no grow-in animation, client request).
 */
export function OutlookChart() {
  const o = dcSustainability.outlook.chart;
  const [hover, setHover] = useState<number | null>(null);
  const data = [
    { label: o.y2025, value: 485 },
    { label: o.y2030, value: 950 },
  ];
  const max = 1000;
  return (
    <div className="relative">
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
          const h = (d.value / max) * 190;
          const x = 110 + i * 170;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
              <rect x={x - 30} y={20} width={120} height={200} fill="transparent" />
              <path
                d={`M${x} 220 V${220 - h + 4} q 0 -4 4 -4 H${x + 56} q 4 0 4 4 V220 Z`}
                fill={i === 1 ? '#0C76A3' : '#86B4CB'}
              />
              <text x={x + 30} y={220 - h - 10} textAnchor="middle" className="font-display text-[15px] font-semibold" fill="#0a0b0d">
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
