import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';

export type Discipline = 'mechanical' | 'electrical' | 'plumbing' | 'fire';
type Layer = Discipline | 'structure';

const DISCIPLINES: Discipline[] = ['mechanical', 'electrical', 'plumbing', 'fire'];

/** Conventional BIM discipline hues (light / base / dark faces), tuned for a dark ground. */
const SHADE: Record<Layer, { light: string; base: string; dark: string }> = {
  mechanical: { light: '#b7d4e1', base: '#3dc0f5', dark: '#33627a' },
  electrical: { light: '#e6cf98', base: '#f2b33d', dark: '#7d5c1f' },
  plumbing: { light: '#a6e3c6', base: '#4fc08d', dark: '#26694a' },
  fire: { light: '#f6a7a7', base: '#ef5b5b', dark: '#922c2c' },
  structure: { light: '#5a636e', base: '#414952', dark: '#2a3037' },
};

/** Solid-body face tones (sheet-metal ductwork, tray steel) — pipes and the legend use SHADE.base. */
const BODY: Partial<Record<Layer, { top: string; front: string; end: string }>> = {
  mechanical: { top: '#c3d6df', front: '#8eaab8', end: '#5f7d8c' },
  electrical: { top: '#d9c48f', front: '#b39552', end: '#7d6630' },
};

/* -------------------------------------------------------- isometric scene */

// Scene units: x along the corridor (0–90), y across it (0–36), z height above
// the ceiling (0) up to the slab soffit (24). Viewer sits at +x +y +z.
const S = 5;
const OX = 150;
const OY = 150;
const AX = 5.2; // x → screen right
const AY = 1.2; // x → screen down
const BX = 3.2; // y → screen left
const BY = 3.2; // y → screen down
const iso = (x: number, y: number, z: number): [number, number] => [OX + x * AX - y * BX, OY + x * AY + y * BY - z * S];
/** Painter's depth along the view direction (null vector of the projection): larger = nearer the viewer. */
const depthOf = (x: number, y: number, z: number) => BX * S * x + AX * S * y + (AX * BY + BX * AY) * z;
const poly = (...p: [number, number, number][]) => p.map(([x, y, z]) => iso(x, y, z).map((n) => n.toFixed(1)).join(',')).join(' ');

interface Prim {
  layer: Layer;
  depth: number;
  node: ReactNode;
}

let keySeq = 0;
const k = () => `p${keySeq++}`;

/** Splits [a, b] into chunks so long runs depth-sort correctly against crossing services. */
function chunks(a: number, b: number, step = 6): [number, number][] {
  const out: [number, number][] = [];
  for (let s = a; s < b - 1e-6; s += step) out.push([s, Math.min(b, s + step)]);
  return out;
}

/** A rectangular solid (duct, tray, beam, unit) — draws its top, +y and +x faces; long runs are segmented. */
function box(layer: Layer, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, opts: { axis?: 'x' | 'y'; opacity?: number; rungs?: boolean } = {}): Prim[] {
  const c = SHADE[layer];
  const axis = opts.axis ?? (x1 - x0 >= y1 - y0 ? 'x' : 'y');
  const segs = axis === 'x' ? chunks(x0, x1) : chunks(y0, y1);
  return segs.map(([a, b], i) => {
    const last = i === segs.length - 1;
    const [sx0, sx1, sy0, sy1] = axis === 'x' ? [a, b, y0, y1] : [x0, x1, a, b];
    const body = BODY[layer] ?? { top: c.light, front: c.base, end: c.dark };
    const faces: ReactNode[] = [];
    const topFill = opts.rungs ? 'rgba(0,0,0,0.25)' : body.top;
    // Faces stroked in their own fill so adjacent segments close without hairline seams.
    faces.push(<polygon key="t" points={poly([sx0, sy0, z1], [sx1, sy0, z1], [sx1, sy1, z1], [sx0, sy1, z1])} fill={topFill} stroke={opts.rungs ? 'none' : topFill} strokeWidth={0.9} strokeLinejoin="round" />);
    if (axis === 'x' || last) faces.push(<polygon key="f" points={poly([sx0, sy1, z1], [sx1, sy1, z1], [sx1, sy1, z0], [sx0, sy1, z0])} fill={body.front} stroke={body.front} strokeWidth={0.9} strokeLinejoin="round" />);
    if (axis === 'y' || last) faces.push(<polygon key="r" points={poly([sx1, sy0, z1], [sx1, sy1, z1], [sx1, sy1, z0], [sx1, sy0, z0])} fill={body.end} stroke={c.dark} strokeWidth={0.6} />);
    // Continuous long edges (no per-segment seams).
    const edge = (pts: string, key: string) => <polyline key={key} points={pts} fill="none" stroke={c.dark} strokeWidth={0.8} />;
    if (axis === 'x') {
      faces.push(edge(poly([sx0, sy0, z1], [sx1, sy0, z1]), 'e1'), edge(poly([sx0, sy1, z1], [sx1, sy1, z1]), 'e2'), edge(poly([sx0, sy1, z0], [sx1, sy1, z0]), 'e3'));
    } else {
      faces.push(edge(poly([sx0, sy0, z1], [sx0, sy1, z1]), 'e1'), edge(poly([sx1, sy0, z1], [sx1, sy1, z1]), 'e2'), edge(poly([sx1, sy0, z0], [sx1, sy1, z0]), 'e3'));
      if (last) faces.push(edge(poly([sx0, sy1, z1], [sx1, sy1, z1], [sx1, sy1, z0], [sx0, sy1, z0], [sx0, sy1, z1]), 'e4'));
    }
    if (axis === 'x' && last) faces.push(edge(poly([sx1, sy0, z1], [sx1, sy1, z1], [sx1, sy1, z0], [sx1, sy0, z0], [sx1, sy0, z1]), 'e5'));
    if (opts.rungs) {
      const rungs = axis === 'x' ? chunks(sx0, sx1, 2) : chunks(sy0, sy1, 2);
      rungs.forEach(([r]) => {
        const pts = axis === 'x' ? poly([r, sy0, z1], [r, sy1, z1]) : poly([sx0, r, z1], [sx1, r, z1]);
        faces.push(<polyline key={`r${r}`} points={pts} stroke={body.front} strokeWidth={0.9} fill="none" />);
      });
    }
    return {
      layer,
      depth: depthOf((sx0 + sx1) / 2, (sy0 + sy1) / 2, (z0 + z1) / 2),
      node: (
        <g key={k()} opacity={opts.opacity}>
          {faces}
        </g>
      ),
    };
  });
}

/** A round pipe along one axis (insulated pipes render light with a darker outline). */
function pipe(layer: Layer, axis: 'x' | 'y' | 'z', from: [number, number, number], length: number, d: number, opts: { insulated?: boolean; endCap?: boolean } = {}): Prim[] {
  const c = SHADE[layer];
  const w = d * S;
  const at = (t: number): [number, number, number] =>
    axis === 'x' ? [from[0] + t, from[1], from[2]] : axis === 'y' ? [from[0], from[1] + t, from[2]] : [from[0], from[1], from[2] + t];
  const segs = axis === 'z' ? ([[0, length]] as [number, number][]) : chunks(0, length);
  const prims: Prim[] = segs.map(([a, b]) => {
    const [x0, y0] = iso(...at(a));
    const [x1, y1] = iso(...at(b));
    const mid = at((a + b) / 2);
    return {
      layer,
      depth: depthOf(mid[0], mid[1], mid[2]),
      node: (
        <g key={k()}>
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={c.dark} strokeWidth={w + 1.2} strokeLinecap="butt" />
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={opts.insulated ? c.light : c.base} strokeWidth={w} strokeLinecap="butt" />
          <line x1={x0} y1={y0 - w * 0.22} x2={x1} y2={y1 - w * 0.22} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={Math.max(0.6, w * 0.18)} />
        </g>
      ),
    };
  });
  if (opts.endCap && axis !== 'z') {
    const end = at(length);
    const [ex, ey] = iso(...end);
    prims.push({
      layer,
      depth: depthOf(end[0], end[1], end[2]) + 0.01,
      node: <ellipse key={k()} cx={ex} cy={ey} rx={w * 0.42} ry={w * 0.5} fill={c.dark} stroke={opts.insulated ? c.light : c.base} strokeWidth={1} />,
    });
  }
  return prims;
}

/** A sprinkler head: short drop + deflector at the ceiling. */
function sprinkler(x: number, y: number, zFrom: number): Prim {
  const c = SHADE.fire;
  const [ax, ay] = iso(x, y, zFrom);
  const [bx, by] = iso(x, y, 0.4);
  return {
    layer: 'fire',
    depth: depthOf(x, y, 0.5),
    node: (
      <g key={k()}>
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke={c.base} strokeWidth={1.6} />
        <ellipse cx={bx} cy={by} rx={3.2} ry={1.6} fill={c.base} stroke={c.dark} strokeWidth={0.6} />
      </g>
    ),
  };
}

function buildScene(): Prim[] {
  keySeq = 0;
  const p: Prim[] = [];
  const L = 90;

  // Structure: a downstand beam the services pass beneath; shared trapeze supports.
  p.push(...box('structure', 30, 35, 0, 36, 19, 24, { axis: 'y', opacity: 0.55 }));
  [12, 50, 80].forEach((x) => {
    p.push(...pipe('structure', 'z', [x, 2, 8.6], 15.4, 0.35));
    p.push(...pipe('structure', 'z', [x, 36, 8.6], 15.4, 0.35));
    p.push(...box('structure', x - 0.6, x + 0.6, 1.5, 36.5, 8, 8.8, { axis: 'y' }));
  });

  // Mechanical: supply + return ductwork, branch to a diffuser, insulated CHW flow/return to an FCU.
  p.push(...box('mechanical', 0, L, 3, 11, 12.6, 18.4));
  // Return duct runs half the corridor, then rises into the slab (reveals the services behind it).
  p.push(...box('mechanical', 0, 58, 29, 35, 13.4, 18.4));
  p.push(...box('mechanical', 52, 58, 29, 35, 18.4, 24, { axis: 'x' }));
  p.push(...box('mechanical', 54, 59, 11, 22, 9.4, 12.6, { axis: 'y' }));
  p.push(...box('mechanical', 54, 59, 17, 22, 1.2, 9.4, { axis: 'y' }));
  p.push(...box('mechanical', 52.5, 60.5, 15.5, 23.5, 0.2, 1.2, { axis: 'y' }));
  p.push(...pipe('mechanical', 'x', [0, 15.5, 10.4], L, 1.9, { insulated: true, endCap: true }));
  p.push(...pipe('mechanical', 'x', [0, 18.5, 10.4], L, 1.9, { insulated: true, endCap: true }));
  p.push(...pipe('mechanical', 'y', [74, 18.5, 10.4], 7, 1.2, { insulated: true }));
  p.push(...box('mechanical', 70, 82, 24, 32, 3, 7.4));

  // Electrical: LV + ELV cable trays near the soffit, busbar trunking, conduit drops to light fittings.
  p.push(...box('electrical', 0, L, 12, 16, 16.6, 17.4, { rungs: true }));
  p.push(...box('electrical', 0, L, 21, 24.5, 16.6, 17.4, { rungs: true }));
  p.push(...box('electrical', 0, L, 25.4, 27.2, 17.2, 18.8));
  [20, 44, 68].forEach((x) => {
    p.push(...pipe('electrical', 'z', [x, 23, 0.4], 16.2, 0.45));
    p.push(...box('electrical', x - 3, x + 3, 21.5, 24.5, 0, 0.4));
  });

  // Plumbing: domestic cold + hot water, sloped drainage.
  p.push(...pipe('plumbing', 'x', [0, 26.4, 11.6], L, 1.1, { endCap: true }));
  p.push(...pipe('plumbing', 'x', [0, 27.9, 11.6], L, 1.1, { endCap: true }));
  const drainZ = (x: number) => 8 - (x / L) * 3;
  chunks(0, L).forEach(([a, b]) => {
    const [x0, y0] = iso(a, 33, drainZ(a));
    const [x1, y1] = iso(b, 33, drainZ(b));
    const c = SHADE.plumbing;
    p.push({
      layer: 'plumbing',
      depth: depthOf((a + b) / 2, 33, drainZ((a + b) / 2)),
      node: (
        <g key={k()}>
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={c.dark} strokeWidth={2.6 * S + 1.2} />
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={c.base} strokeWidth={2.6 * S} strokeOpacity={0.85} />
          <line x1={x0} y1={y0 - 3} x2={x1} y2={y1 - 3} stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2} />
        </g>
      ),
    });
  });

  // Fire: sprinkler main beneath the supply duct, branch lines across with heads, alarm conduit.
  p.push(...pipe('fire', 'x', [0, 7, 6.8], L, 2, { endCap: true }));
  [18, 40, 64].forEach((x) => {
    p.push(...pipe('fire', 'y', [x, 7, 5.6], 27, 0.9));
    [13, 22, 31].forEach((y) => p.push(sprinkler(x, y, 5.6)));
  });
  p.push(...pipe('fire', 'x', [0, 35.5, 18.6], L, 0.4));

  return p.sort((m, n) => m.depth - n.depth);
}

const SCENE = buildScene();

/** Callouts on the cut ends of the services, stacked in a right-hand column. */
const CALLOUTS: { layer: Layer; key: string; at: [number, number, number] }[] = [
  { layer: 'electrical', key: 'busbar', at: [90, 26.3, 18.8] },
  { layer: 'fire', key: 'alarm', at: [90, 35.5, 18.6] },
  { layer: 'mechanical', key: 'supply', at: [90, 7, 18.4] },
  { layer: 'electrical', key: 'lvTray', at: [90, 14, 17.4] },
  { layer: 'mechanical', key: 'return', at: [58, 35, 15.5] },
  { layer: 'electrical', key: 'elvTray', at: [90, 22.7, 17.4] },
  { layer: 'mechanical', key: 'chw', at: [90, 17, 10.4] },
  { layer: 'plumbing', key: 'water', at: [90, 27.2, 11.6] },
  { layer: 'fire', key: 'sprinklerMain', at: [90, 7, 6.8] },
  { layer: 'plumbing', key: 'drain', at: [90, 33, 5] },
  { layer: 'mechanical', key: 'fcu', at: [82, 30, 5] },
];

const SLAB_EDGE = poly([0, 0, 24], [90, 0, 24], [90, 36, 24], [0, 36, 24], [0, 0, 24]);
const CEILING_LINES: string[] = [
  ...Array.from({ length: 16 }, (_, i) => poly([i * 6, 0, 0], [i * 6, 36, 0])),
  ...Array.from({ length: 7 }, (_, i) => poly([0, i * 6, 0], [90, i * 6, 0])),
];

/**
 * Illustrative coordinated model — an isometric cut through a corridor ceiling
 * void where the four MEP disciplines overlap within the same space beneath
 * the slab and a downstand beam, hung from shared supports. Each discipline is
 * its own switchable layer. PLACEHOLDER for renders from a real coordinated
 * project model; the toggle UI is built so those can replace the SVG layers.
 */
export function MepSystemsDiagram() {
  const { t } = useTranslation('services');
  const [visible, setVisible] = useState<Record<Discipline, boolean>>({ mechanical: true, electrical: true, plumbing: true, fire: true });
  const shown = (layer: Layer) => layer === 'structure' || visible[layer];
  const fade = (layer: Layer) => cn('transition-opacity duration-500 ease-out motion-reduce:transition-none', shown(layer) ? 'opacity-100' : 'opacity-0');
  const a = (key: string) => t(`mepPage.integration.annotations.${key}`);

  // Callout column: label rows in the order of their anchors' screen height.
  const callouts = CALLOUTS.map((c) => ({ ...c, p: iso(...c.at) })).sort((m, n) => m.p[1] - n.p[1]);
  const top = 84;
  const gap = 24;
  const colX = 638;

  return (
    <figure className="w-full">
      <div dir="ltr" className="overflow-hidden rounded-md border border-white/10 bg-[#0d1216]">
        <svg viewBox="0 0 820 420" role="img" aria-label={t('mepPage.integration.caption')} className="block h-auto w-full">
          <defs>
            <pattern id="mep-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="rgba(61,192,245,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="820" height="420" fill="url(#mep-grid)" />

          {/* Suspended ceiling grid and slab soffit outline. */}
          <g stroke="rgba(255,255,255,0.14)" strokeWidth="0.8" fill="none">
            {CEILING_LINES.map((pts, i) => (
              <polyline key={i} points={pts} />
            ))}
          </g>
          <polyline points={SLAB_EDGE} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="6 4" />

          {/* Depth-sorted services: each element fades with its discipline layer. */}
          {SCENE.map((prim, i) => (
            <g key={i} className={fade(prim.layer)}>
              {prim.node}
            </g>
          ))}

          {/* Structural / architectural labels. */}
          <g className="fill-gray-400 font-sans text-[9.5px] font-semibold uppercase tracking-[0.12em]">
            <text x={iso(4, 0, 24)[0]} y={iso(4, 0, 24)[1] - 8}>{a('slab')}</text>
            <text x={iso(36, 0, 24)[0] + 6} y={iso(36, 0, 24)[1] - 6}>{a('beam')}</text>
            <text x={iso(4, 36, 0)[0]} y={iso(4, 36, 0)[1] + 18}>{a('ceiling')}</text>
          </g>

          {/* Callouts. */}
          {callouts.map((c, i) => {
            const y = top + i * gap;
            const col = SHADE[c.layer].base;
            return (
              <g key={c.key} className={fade(c.layer)}>
                <polyline points={`${c.p[0]},${c.p[1]} ${colX - 18},${y} ${colX - 4},${y}`} fill="none" stroke={col} strokeOpacity={0.55} strokeWidth="0.8" />
                <circle cx={c.p[0]} cy={c.p[1]} r="1.8" fill={col} />
                <text x={colX} y={y + 3.2} fill={col} className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.06em]">
                  {a(c.key)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Discipline visibility controls. */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span id="mep-layers-label" className="me-2 font-display text-caption font-semibold uppercase tracking-widest text-gray-400 rtl:tracking-normal">
          {t('mepPage.integration.controlsLabel')}
        </span>
        <div role="group" aria-labelledby="mep-layers-label" className="flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <button
              key={d}
              type="button"
              role="switch"
              aria-checked={visible[d]}
              onClick={() => setVisible((v) => ({ ...v, [d]: !v[d] }))}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-small font-semibold transition-[color,background-color,border-color,transform,box-shadow] duration-base ease-out hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-[0_6px_18px_rgba(0,0,0,0.45)] active:translate-y-0 active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 motion-reduce:transition-colors motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100',
                visible[d] ? 'border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/15' : 'border-white/10 text-gray-500 hover:border-white/25 hover:text-gray-200',
              )}
            >
              <span aria-hidden="true" className={cn('h-2.5 w-2.5 rounded-full transition-opacity duration-base', visible[d] ? 'opacity-100' : 'opacity-30')} style={{ backgroundColor: SHADE[d].base }} />
              {t(`mepPage.integration.layers.${d}`)}
            </button>
          ))}
        </div>
      </div>

    </figure>
  );
}
