import { cn } from '../../../lib/utils';
import { dcTechnical } from '../../../data/dataCenterTechnical';
import { DiagramFrame, FLOW, FlowPath, Node } from './primitives';

/* ------------------------------------------------------- power resilience */

/** Utility to IT with a generator and ATS; "failed" shows the UPS bridging and the generator taking over. */
export function ResilienceDiagram({ failed }: { failed: boolean }) {
  const l = dcTechnical.power.labels;
  return (
    <DiagramFrame label={failed ? dcTechnical.power.states.failed : dcTechnical.power.states.normal} minWidth={640}>
      <svg viewBox="0 0 900 280" role="img" aria-label={failed ? dcTechnical.power.states.failed : dcTechnical.power.states.normal} className="block h-auto w-full">
        {/* Utility side */}
        <FlowPath d="M118 90 H150 M262 90 H294 M406 90 H438" kind="power" width={2.4} active={!failed} base={failed ? '#5A2A24' : FLOW.line} />
        <Node x={10} y={67} w={108} label={l.utility} accent={failed ? FLOW.heat : FLOW.power} />
        <Node x={150} y={67} label={l.mv} />
        <Node x={294} y={67} label={l.tx} />
        {failed && (
          <g>
            <path d="M126 80 l16 20 M142 80 l-16 20" stroke={FLOW.heat} strokeWidth={2.6} strokeLinecap="round" />
          </g>
        )}

        {/* Generator into ATS */}
        <Node x={438} y={190} w={112} label={l.gen} sub={failed ? 'Running' : 'Standby'} accent={failed ? FLOW.power : undefined} />
        <FlowPath d="M494 190 V113" kind="power" width={2.4} active={failed} />

        {/* ATS → UPS → PDU → IT */}
        <Node x={438} y={67} w={112} label={l.ats} sub={failed ? 'Transferred to generator' : 'Utility position'} accent={failed ? FLOW.power : undefined} />
        <FlowPath d="M550 90 H582 M694 90 H726" kind="power" width={2.4} />
        <Node x={582} y={67} label={l.ups} sub={failed ? 'Bridging on battery' : 'Online'} accent={failed ? FLOW.power : undefined} />
        <Node x={726} y={67} w={150} label={l.it} sub="Uninterrupted" accent={FLOW.data} />
        {failed && <circle cx={638} cy={130} r={6} fill={FLOW.power} className="dc-glow" />}
        {failed && (
          <text x={650} y={134} className="font-sans text-[10px] font-semibold" fill={FLOW.power}>
            Battery
          </text>
        )}
      </svg>
    </DiagramFrame>
  );
}

/* --------------------------------------------------------- toggle buttons */

/** A two-option segmented control for the interactive diagrams. */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-gray-300 bg-white p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'min-h-9 rounded-full px-4 text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            value === o.id ? 'bg-ink text-white' : 'text-gray-600 hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------ hero server hall */

/**
 * The hero's origin drawing: a server hall in one-point perspective (two rack
 * rows down an aisle, a ceiling busway and chilled-water pipes). Three marked
 * points (`data-flow-origin`) are where the hero title's story lines start:
 * the busway tap box (power), a pipe drip point (water) and a rack network
 * port (data). Static line art: nothing moves until the story lines do.
 */
export function HeroServerHall() {
  const VP: [number, number] = [600, 132];
  // Rack-row fronts: [x at outer edge, x at inner edge], top/bottom lines converge to VP.
  const rowCols = (outer: number, inner: number, n: number) => {
    const xs: number[] = [];
    for (let i = 0; i <= n; i++) {
      const t = 1 - Math.pow(1 - i / n, 1.6);
      xs.push(outer + (inner - outer) * t);
    }
    return xs;
  };
  const yAt = (x: number, y0: number, x0: number) => y0 + ((VP[1] - y0) * (x - x0)) / (VP[0] - x0);
  const left = rowCols(-20, 520, 9);
  const right = rowCols(1220, 680, 9);
  const rack = (xs: number[], x0: number, top0: number, bot0: number, side: 'l' | 'r') =>
    xs.slice(0, -1).map((x, i) => {
      const x2 = xs[i + 1];
      const t1 = yAt(x, top0, x0);
      const b1 = yAt(x, bot0, x0);
      const t2 = yAt(x2, top0, x0);
      const b2 = yAt(x2, bot0, x0);
      const rows = 7;
      return (
        <g key={`${side}${i}`}>
          <path d={`M${x} ${t1} L${x2} ${t2} L${x2} ${b2} L${x} ${b1} Z`} fill="#11161B" stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
          {Array.from({ length: rows }, (_, k) => {
            const f = (k + 1) / (rows + 1);
            const lx = x + (x2 - x) * 0.78;
            const ly = t1 + (b1 - t1) * f;
            return <circle key={k} cx={lx} cy={ly + ((t2 - t1) * 0.78)} r={Math.max(0.8, Math.abs(x2 - x) * 0.025)} fill={k % 3 === 0 ? '#3DBE7A' : '#3B9EE6'} fillOpacity={0.55} />;
          })}
        </g>
      );
    });
  const floor = [210, 250, 300, 360];
  return (
    <div aria-hidden="true" className="pointer-events-none select-none">
      <svg viewBox="0 0 1200 330" className="block h-auto w-full" preserveAspectRatio="xMidYMid meet">
        {/* Floor grid */}
        <g stroke="rgba(255,255,255,0.07)" strokeWidth={1}>
          {[-400, -100, 200, 450, 750, 1000, 1300, 1600].map((x) => (
            <line key={x} x1={x} y1={330} x2={VP[0]} y2={VP[1]} />
          ))}
          {floor.map((y) => (
            <line key={y} x1={0} y1={y} x2={1200} y2={y} />
          ))}
        </g>
        {/* Rack rows */}
        {rack(left, -20, 30, 300, 'l')}
        {rack(right, 1220, 30, 300, 'r')}
        {/* Ceiling busway (left) with tap box, chilled-water pipes (right) */}
        <line x1={-20} y1={14} x2={560} y2={yAt(560, 14, -20)} stroke="#E9B23A" strokeOpacity={0.55} strokeWidth={2} />
        <rect x={318} y={yAt(330, 14, -20) - 6} width={24} height={14} rx={2} fill="#14181D" stroke="#E9B23A" strokeOpacity={0.8} />
        <circle data-flow-origin="power" cx={330} cy={yAt(330, 14, -20) + 9} r={2.5} fill="#E9B23A" />
        <line x1={1220} y1={10} x2={640} y2={yAt(640, 10, 1220)} stroke="#3B9EE6" strokeOpacity={0.55} strokeWidth={3} />
        <line x1={1220} y1={22} x2={640} y2={yAt(640, 22, 1220)} stroke="#3B9EE6" strokeOpacity={0.35} strokeWidth={3} />
        <circle data-flow-origin="water" cx={760} cy={yAt(760, 22, 1220) + 3} r={2.5} fill="#3B9EE6" />
        {/* Network port on a left rack */}
        <rect x={430} y={150} width={16} height={8} rx={1} fill="#14181D" stroke="#3DBE7A" strokeOpacity={0.9} />
        <circle data-flow-origin="data" cx={438} cy={158} r={2} fill="#3DBE7A" />
        {/* Aisle glow */}
        <defs>
          <radialGradient id="dc-aisle" cx="50%" cy="40%" r="40%">
            <stop offset="0%" stopColor="#3B9EE6" stopOpacity={0.12} />
            <stop offset="100%" stopColor="#3B9EE6" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={600} cy={140} rx={260} ry={110} fill="url(#dc-aisle)" />
      </svg>
    </div>
  );
}
