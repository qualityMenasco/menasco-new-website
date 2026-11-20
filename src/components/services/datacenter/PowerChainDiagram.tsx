import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { dcTechnical } from '../../../data/dataCenterTechnical';
import { FLOW, useInView } from './primitives';

/**
 * Electrical resilience diagram (Data Center technical page): a single-line
 * view of the power chain from utility to IT load, with a generator feeding
 * the automatic transfer switch.
 *
 * Client brief (2026-11-20): look more advanced, fit the space on every
 * screen. So: equipment icons and status chips per node, a real switch blade
 * in the ATS that swings from the utility to the generator contact, a UPS
 * battery gauge that drains while bridging, a generator rotor that spins up,
 * energised conductors with a travelling pulse, and a faint engineering grid.
 *
 * Three configurations of the same drawing, picked from the panel's measured
 * width (not a page breakpoint) so text stays legible as the column narrows:
 *  - "wide"    (>= 560px): a U-shaped run over four columns;
 *  - "compact" (380–560px): a 3 x 3 snake, so it can stay beside the text
 *    down to tablet widths (client request);
 *  - "tall"    (< 380px, phones): a single vertical run.
 */

type Tone = 'ok' | 'warn' | 'idle' | 'fault';
const TONE: Record<Tone, string> = { ok: '#3DBE7A', warn: FLOW.power, idle: '#6B7480', fault: FLOW.heat };

const S = dcTechnical.power;

/* ------------------------------------------------------------------ icons */

/** 16×16 equipment glyphs, drawn at (x, y). */
function Icon({ kind, x, y, spinning = false, color = '#C9D1DA' }: { kind: string; x: number; y: number; spinning?: boolean; color?: string }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let body: ReactNode = null;
  switch (kind) {
    case 'utility': // transmission pylon
      body = <path {...p} d="M8 1 L3.5 15 M8 1 L12.5 15 M5 7 H11 M4.3 11 H11.7 M2.5 4 H13.5" />;
      break;
    case 'mv': // switchgear cabinet
      body = (
        <g {...p}>
          <rect x="2" y="1.5" width="12" height="13" rx="1.5" />
          <path d="M8 1.5 V14.5 M4.5 5 H6 M10 5 H11.5 M4.5 9 H6 M10 9 H11.5" />
        </g>
      );
      break;
    case 'tx': // transformer: two coupled windings
      body = (
        <g {...p}>
          <circle cx="6" cy="8" r="4.2" />
          <circle cx="10" cy="8" r="4.2" />
        </g>
      );
      break;
    case 'gen': // generator with rotor
      body = (
        <g {...p}>
          <circle cx="8" cy="8" r="6.5" />
          <g className={cn(spinning && 'dc-rotor')} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <path d="M8 8 L8 3.2 M8 8 L12.2 10.4 M8 8 L3.8 10.4" />
          </g>
        </g>
      );
      break;
    case 'pdu': // distribution unit with outlets
      body = (
        <g {...p}>
          <rect x="2" y="3" width="12" height="10" rx="1.5" />
          <path d="M5 6.5 V9.5 M8 6.5 V9.5 M11 6.5 V9.5" />
        </g>
      );
      break;
    case 'it': // server rack
      body = (
        <g {...p}>
          <rect x="3" y="1.5" width="10" height="13" rx="1.2" />
          <path d="M3 5.5 H13 M3 9 H13 M3 12.5 H13" />
          <circle cx="10.8" cy="3.5" r="0.4" fill={color} />
        </g>
      );
      break;
    default:
      body = null;
  }
  return <g transform={`translate(${x} ${y})`}>{body}</g>;
}

/* ------------------------------------------------------------------ parts */

interface NodeProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  status: string;
  tone: Tone;
  icon?: string;
  spinning?: boolean;
  gradId: string;
  children?: ReactNode;
  /** Smaller type for the compact layout. */
  small?: boolean;
}

/** An equipment block: icon, name, status chip with a live dot. */
function EquipNode({ x, y, w, h, label, status, tone, icon, spinning, gradId, children, small = false }: NodeProps) {
  const c = TONE[tone];
  const chipW = Math.max(46, status.length * (small ? 6 : 6.6) + (small ? 20 : 23));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill={`url(#${gradId})`} stroke={tone === 'idle' ? '#2E353D' : c} strokeOpacity={tone === 'idle' ? 1 : 0.55} strokeWidth={1.2} style={{ transition: 'stroke 400ms ease-out' }} />
      {/* top highlight */}
      <path d={`M${x + 9} ${y + 0.8} H${x + w - 9}`} stroke="#FFFFFF" strokeOpacity={0.07} strokeWidth={1} />
      {icon && <Icon kind={icon} x={x + (small ? 9 : 11)} y={y + (small ? 9 : 11)} spinning={spinning} color={tone === 'idle' ? '#8D96A1' : '#D7DEE6'} />}
      <text x={x + (icon ? (small ? 29 : 33) : small ? 10 : 12)} y={y + (small ? 21 : 23)} className={cn('font-sans font-semibold', small ? 'text-[11.5px]' : 'text-[13px]')} fill="#EEF1F4">
        {label}
      </text>
      {/* status chip */}
      <g style={{ transition: 'opacity 300ms' }}>
        <rect x={x + (small ? 9 : 11)} y={y + h - (small ? 21 : 23)} width={chipW} height={small ? 14 : 15} rx={small ? 7 : 7.5} fill={c} fillOpacity={0.14} />
        <circle cx={x + (small ? 16.5 : 19.5)} cy={y + h - (small ? 14 : 15.5)} r={small ? 2.3 : 2.6} fill={c} className={tone !== 'idle' ? 'dc-glow' : undefined} />
        <text x={x + (small ? 23 : 27)} y={y + h - (small ? 11 : 12.2)} className={cn('font-sans font-semibold uppercase', small ? 'text-[9px]' : 'text-[10px]')} letterSpacing="0.05em" fill={c}>
          {status}
        </text>
      </g>
      {children}
    </g>
  );
}

/** A conductor: quiet base line plus, when energised, an amber line with a travelling pulse. */
function Conductor({ d, live, fault = false }: { d: string; live: boolean; fault?: boolean }) {
  return (
    <g>
      <path d={d} fill="none" stroke={fault ? '#5A2A24' : '#2A3139'} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={fault ? '4 6' : undefined} />
      <path d={d} fill="none" stroke={FLOW.power} strokeOpacity={live ? 0.55 : 0} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke-opacity 400ms ease-out' }} />
      {live && (
        <path
          d={d}
          fill="none"
          stroke="#FFE3A0"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeDasharray="2 22"
          className="dc-flow"
          style={{ ['--dc-flow-distance' as string]: '-96', ['--dc-flow-duration' as string]: '1.6s' }}
        />
      )}
    </g>
  );
}

/** Junction dot where a conductor meets equipment. */
const Dot = ({ x, y, live }: { x: number; y: number; live: boolean }) => <circle cx={x} cy={y} r={3} fill={live ? FLOW.power : '#3A424B'} style={{ transition: 'fill 400ms' }} />;

/* ------------------------------------------------------------- the drawing */

type Layout = 'wide' | 'compact' | 'tall';

function Drawing({ failed, layout }: { failed: boolean; layout: Layout }) {
  const uid = useId().replace(/:/g, '');
  const grad = `pcd-node-${uid}`;
  const grid = `pcd-grid-${uid}`;
  const l = S.labels;
  const st = S.status;
  const utilityLive = !failed;

  // Geometry per configuration.
  const W = layout === 'wide';
  const C = layout === 'compact';
  const vb = W ? '0 0 680 380' : C ? '0 0 408 280' : '0 0 340 560';
  const nw = W ? 136 : C ? 120 : 168; // node width
  const nh = C ? 56 : 58;
  const pos = C
    ? {
        // 3 x 3 snake: utility run along the top, ATS fed from above (utility) and the left (generator),
        // load run back along the bottom.
        utility: { x: 8, y: 14 },
        mv: { x: 144, y: 14 },
        tx: { x: 280, y: 14 },
        gen: { x: 144, y: 112 },
        ats: { x: 280, y: 112 },
        ups: { x: 280, y: 210 },
        pdu: { x: 144, y: 210 },
        it: { x: 8, y: 210 },
      }
    : W
    ? {
        gen: { x: 524, y: 16 },
        utility: { x: 20, y: 150 },
        mv: { x: 188, y: 150 },
        tx: { x: 356, y: 150 },
        ats: { x: 524, y: 150 },
        ups: { x: 524, y: 290 },
        pdu: { x: 356, y: 290 },
        it: { x: 20, y: 290, w: 304 },
      }
    : {
        utility: { x: 16, y: 12 },
        mv: { x: 16, y: 90 },
        tx: { x: 16, y: 168 },
        ats: { x: 16, y: 252 },
        gen: { x: 214, y: 252, w: 110 },
        ups: { x: 16, y: 336 },
        pdu: { x: 16, y: 414 },
        it: { x: 16, y: 492, w: 168 },
      };
  const box = (k: keyof typeof pos) => ({ x: pos[k].x, y: pos[k].y, w: (pos[k] as { w?: number }).w ?? nw, h: nh });
  const g = box('gen');
  const u = box('utility');
  const m = box('mv');
  const t = box('tx');
  const a = box('ats');
  const p = box('ups');
  const d = box('pdu');
  const it = box('it');

  // Conductors.
  const midY = (b: { y: number; h: number }) => b.y + b.h / 2;
  const midX = (b: { x: number; w: number }) => b.x + b.w / 2;
  const utilityRun = W
    ? `M${u.x + u.w} ${midY(u)} H${m.x} M${m.x + m.w} ${midY(m)} H${t.x} M${t.x + t.w} ${midY(t)} H${a.x}`
    : C
      ? `M${u.x + u.w} ${midY(u)} H${m.x} M${m.x + m.w} ${midY(m)} H${t.x} M${midX(t)} ${t.y + t.h} V${a.y}`
      : `M${midX(u)} ${u.y + u.h} V${m.y} M${midX(m)} ${m.y + m.h} V${t.y} M${midX(t)} ${t.y + t.h} V${a.y}`;
  const genRun = W ? `M${midX(g)} ${g.y + g.h} V${a.y}` : C ? `M${g.x + g.w} ${midY(g)} H${a.x}` : `M${g.x} ${midY(g)} H${a.x + a.w}`;
  const loadRun = W || C
    ? `M${midX(a)} ${a.y + a.h} V${p.y} M${p.x} ${midY(p)} H${d.x + d.w} M${d.x} ${midY(d)} H${it.x + it.w}`
    : `M${midX(a)} ${a.y + a.h} V${p.y} M${midX(p)} ${p.y + p.h} V${d.y} M${midX(d)} ${d.y + d.h} V${it.y}`;
  // Where the utility and generator feeds land on the ATS (junction dots).
  const uIn = W ? { x: a.x, y: midY(a) } : { x: midX(a), y: a.y };
  const gIn = W ? { x: midX(a), y: a.y } : C ? { x: a.x, y: midY(a) } : { x: a.x + a.w, y: midY(a) };

  // ATS switch blade: pivot on the output side, swings from the utility contact to the generator contact.
  // Placed in the node's top-right corner, clear of the status chip.
  // The contacts point the way each feed actually arrives in that configuration:
  //   wide    — utility from the left, generator from above;
  //   compact — utility from above,   generator from the left;
  //   tall    — utility from above,   generator from the right.
  // Angles are clockwise from "pointing left" (0 = left, 90 = up, 180 = right).
  const pivot = { x: a.x + a.w - (layout === 'tall' ? 30 : C ? 15 : 18), y: a.y + (C ? 24 : 26) };
  const bladeLen = C ? 14 : 16;
  const uAngle = W ? 0 : 90;
  const gAngle = W ? 90 : C ? 0 : 180;
  const bladeAngle = failed ? gAngle : uAngle;
  const contact = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return { x: pivot.x - bladeLen * Math.cos(r), y: pivot.y - bladeLen * Math.sin(r) };
  };
  const uContact = contact(uAngle);
  const gContact = contact(gAngle);

  // UPS battery gauge.
  const gaugeW = p.w - (C ? 66 : 76);
  const gaugeFill = failed ? 0.38 : 1;

  return (
    <svg viewBox={vb} className="block h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E252D" />
          <stop offset="100%" stopColor="#151A20" />
        </linearGradient>
        <pattern id={grid} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" fill="none" stroke="#FFFFFF" strokeOpacity="0.035" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${grid})`} />

      {/* Legend (wide layout: fills the open top-left corner) */}
      {(W || C) && (
        <g className={cn('font-sans', C ? 'text-[9px]' : 'text-[10.5px]')} fill="#9AA3AD" transform={C ? 'translate(-10 100)' : undefined}>
          <path d={C ? 'M22 34 H40' : 'M22 34 H48'} stroke={FLOW.power} strokeOpacity={0.7} strokeWidth={2.4} strokeLinecap="round" />
          <text x={C ? 46 : 58} y="38">{S.legend.energised}</text>
          <path d={C ? 'M22 52 H40' : 'M22 58 H48'} stroke="#5A2A24" strokeWidth={3} strokeDasharray="4 6" strokeLinecap="round" />
          <text x={C ? 46 : 58} y={C ? 56 : 62}>{S.legend.deenergised}</text>
          <path d={C ? 'M22 70 H40' : 'M22 82 H48'} stroke="#2A3139" strokeWidth={3} strokeLinecap="round" />
          <text x={C ? 46 : 58} y={C ? 74 : 86}>{S.legend.standby}</text>
        </g>
      )}

      <Conductor d={utilityRun} live={utilityLive} fault={failed} />
      <Conductor d={genRun} live={failed} />
      <Conductor d={loadRun} live />

      <EquipNode {...u} gradId={grad} small={C} icon="utility" label={l.utility} status={failed ? st.lost : st.online} tone={failed ? 'fault' : 'ok'}>
        {failed && <path d={`M${u.x + u.w - 26} ${u.y + 12} l12 12 M${u.x + u.w - 14} ${u.y + 12} l-12 12`} stroke={FLOW.heat} strokeWidth={2.2} strokeLinecap="round" />}
      </EquipNode>
      <EquipNode {...m} gradId={grad} small={C} icon="mv" label={l.mv} status={failed ? st.deenergised : st.energised} tone={failed ? 'idle' : 'ok'} />
      <EquipNode {...t} gradId={grad} small={C} icon="tx" label={l.tx} status={failed ? st.deenergised : st.energised} tone={failed ? 'idle' : 'ok'} />
      <EquipNode {...g} gradId={grad} small={C} icon="gen" spinning={failed} label={l.gen} status={failed ? st.running : st.standby} tone={failed ? 'warn' : 'idle'} />

      {/* ATS with a visible switch blade */}
      <EquipNode {...a} gradId={grad} small={C} label={l.ats} status={failed ? st.onGenerator : st.onUtility} tone={failed ? 'warn' : 'ok'}>
        <circle cx={uContact.x} cy={uContact.y} r={2.4} fill="none" stroke={utilityLive ? FLOW.power : '#5A636E'} strokeWidth={1.3} />
        <circle cx={gContact.x} cy={gContact.y} r={2.4} fill="none" stroke={failed ? FLOW.power : '#5A636E'} strokeWidth={1.3} />
        {/* Blade: drawn pointing left from the pivot, then rotated about the pivot. Its own
            coordinate system starts at the pivot, so the rotation can't drift off-centre. */}
        <g transform={`translate(${pivot.x} ${pivot.y})`}>
          <g style={{ transform: `rotate(${bladeAngle}deg)`, transition: 'transform 600ms cubic-bezier(0.34,1.4,0.64,1)' }}>
            <line x1={0} y1={0} x2={-bladeLen} y2={0} stroke="#F5D58A" strokeWidth={2} strokeLinecap="round" />
          </g>
        </g>
        <circle cx={pivot.x} cy={pivot.y} r={2.6} fill={FLOW.power} />
      </EquipNode>

      {/* UPS with a battery gauge that drains while bridging */}
      <EquipNode {...p} gradId={grad} small={C} label={l.ups} status={failed ? st.onBattery : st.online} tone={failed ? 'warn' : 'ok'}>
        <g transform={`translate(${p.x + p.w - gaugeW - (C ? 11 : 14)} ${p.y + (C ? 14 : 16)})`}>
          <rect x="0" y="0" width={gaugeW} height="9" rx="2" fill="none" stroke="#56606B" strokeWidth="1" />
          <rect x={gaugeW} y="2.5" width="2.5" height="4" rx="0.8" fill="#56606B" />
          <rect x="1.5" y="1.5" width={(gaugeW - 3) * gaugeFill} height="6" rx="1.2" fill={failed ? FLOW.power : TONE.ok} style={{ transition: 'width 1.6s ease-in-out, fill 400ms' }} />
        </g>
      </EquipNode>
      <EquipNode {...d} gradId={grad} small={C} icon="pdu" label={l.pdu} status={st.energised} tone="ok" />
      <EquipNode {...it} gradId={grad} small={C} icon="it" label={l.it} status={st.uninterrupted} tone="ok" />

      {/* junction dots */}
      <Dot x={uIn.x} y={uIn.y} live={utilityLive} />
      <Dot x={gIn.x} y={gIn.y} live={failed} />
      <Dot x={midX(a)} y={a.y + a.h} live />
    </svg>
  );
}

/** Panel with a header (title, live status, simulate toggle) and the drawing in two configurations. */
export function PowerChainDiagram({ failed, onToggle }: { failed: boolean; onToggle: () => void }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  // Pick the configuration from the drawing area's real width.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>('wide');
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const pick = () => {
      const w = el.clientWidth;
      setLayout(w >= 560 ? 'wide' : w >= 380 ? 'compact' : 'tall');
    };
    pick();
    const ro = new ResizeObserver(pick);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} dir="ltr" className={cn('overflow-hidden rounded-lg border border-white/10 bg-graphite', !inView && 'dc-paused')}>
      {/* Header: the button never wraps or moves (fixed to the right, as wide as its longer
          label); only the title + status chip on the left may wrap onto two lines. */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3.5 py-2.5 lg:px-5 lg:py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="font-display text-caption font-semibold uppercase tracking-widest text-gray-500">{S.diagramTitle}</span>
          <span aria-live="polite" className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold', failed ? 'bg-[#E0A526]/15 text-[#F2C35B]' : 'bg-[#3DBE7A]/15 text-[#5FD497]')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', failed ? 'bg-[#F2C35B]' : 'bg-[#5FD497]')} />
            {/* Fixed width (both labels share a cell) so toggling never re-wraps the header. */}
            <span className="inline-grid whitespace-nowrap">
              <span className={cn('col-start-1 row-start-1', failed && 'invisible')}>{S.headerStatus.normal}</span>
              <span className={cn('col-start-1 row-start-1', !failed && 'invisible')}>{S.headerStatus.failed}</span>
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={failed}
          className={cn(
            'inline-grid min-h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-center text-caption font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:min-h-9 lg:px-4 lg:text-small',
            failed ? 'bg-white text-ink hover:bg-gray-200' : 'bg-brand-600 text-white hover:bg-brand-700',
          )}
        >
          {/* Both labels share one grid cell, so the button keeps the width of the longer one. */}
          <span className={cn('col-start-1 row-start-1', failed && 'invisible')} aria-hidden={failed}>
            {S.simulate}
          </span>
          <span className={cn('col-start-1 row-start-1', !failed && 'invisible')} aria-hidden={!failed}>
            {S.restore}
          </span>
        </button>
      </div>
      <div ref={bodyRef} role="img" aria-label={failed ? S.states.failed : S.states.normal} className="p-2 lg:p-3">
        <div className={cn(layout === 'tall' && 'mx-auto max-w-sm')}>
          <Drawing failed={failed} layout={layout} />
        </div>
      </div>
      <p className="border-t border-white/10 px-3.5 py-2.5 text-caption leading-relaxed text-gray-400 lg:px-5 lg:py-3">{failed ? S.states.failed : S.states.normal}</p>
    </div>
  );
}
