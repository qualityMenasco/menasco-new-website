import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';
import { useMediaQuery } from '../../../lib/hooks';

export type Discipline = 'mechanical' | 'electrical' | 'plumbing' | 'fire';
type Layer = Discipline | 'ceiling' | 'structure';

const DISCIPLINES: Discipline[] = ['mechanical', 'electrical', 'plumbing', 'fire'];

/** Stacking order, bottom to top (as installed in the void: ceiling up to the slab). */
const STACK: Layer[] = ['ceiling', 'fire', 'plumbing', 'mechanical', 'electrical', 'structure'];

/** Components of each discipline (keys of services `mepPage.integration.annotations`). */
const COMPONENTS: Record<Discipline, string[]> = {
  mechanical: ['supply', 'return', 'chw', 'fcu'],
  electrical: ['lvTray', 'elvTray', 'busbar'],
  plumbing: ['water', 'drain'],
  fire: ['sprinklerMain', 'alarm'],
};

/**
 * Muted, print-like discipline tones for a light ground: brand blue for
 * mechanical, ochre, teal and brick. `top`/`front`/`end` are the three visible
 * faces of a solid; `line` is the linework; `pipe` the round-section fill.
 */
const TONE: Record<Layer, { top: string; front: string; end: string; line: string; pipe: string }> = {
  mechanical: { top: '#E3EEF4', front: '#A9C8D8', end: '#6F9CB3', line: '#2E5F78', pipe: '#86B4CB' },
  electrical: { top: '#F4EAD2', front: '#DDC48D', end: '#B09350', line: '#6E5726', pipe: '#CDAE68' },
  plumbing: { top: '#DCEDE7', front: '#9CCABD', end: '#64A090', line: '#2D5E51', pipe: '#79B3A3' },
  fire: { top: '#F5DAD5', front: '#DE9D94', end: '#BA6B61', line: '#7A2F28', pipe: '#D3837A' },
  structure: { top: '#EEEBE6', front: '#DAD5CE', end: '#C6C0B7', line: '#8F887F', pipe: '#BDB6AC' },
  ceiling: { top: '#F7F5F1', front: '#E4E0DA', end: '#D3CEC6', line: '#BDB6AC', pipe: '#D3CEC6' },
};

/** A discipline's model colours, for UI that matches the model (e.g. the discipline sheets). */
export const disciplineTone = (d: Discipline) => ({ line: TONE[d].line, tint: TONE[d].top });

/* -------------------------------------------------------- isometric scene */

// Scene units: x along the corridor (0–L), y across it (0–W), z height above the
// ceiling (0) to the slab soffit (24). Viewer sits at +x +y +z.
const L = 72;
const W = 36;
const S = 4.6;
const AX = 4.8;
const AY = 1.15;
const BX = 3.1;
const BY = 3.1;
/** Screen gap between neighbouring layers when exploded. */
const GAP = 38;

const OX = 176 + W * BX;
const OY = 18 + 24 * S + 2.5 * GAP;
const iso = (x: number, y: number, z: number): [number, number] => [OX + x * AX - y * BX, OY + x * AY + y * BY - z * S];
/** Painter's depth along the view direction: larger = nearer the viewer. */
const depthOf = (x: number, y: number, z: number) => BX * S * x + AX * S * y + (AX * BY + BX * AY) * z;
const poly = (...p: [number, number, number][]) =>
  p
    .map(([x, y, z]) =>
      iso(x, y, z)
        .map((n) => n.toFixed(1))
        .join(','),
    )
    .join(' ');

const VIEW_W = Math.ceil(iso(L, 0, 0)[0] + 28);
const VIEW_H = Math.ceil(iso(L, W, 0)[1] + 2.5 * GAP + 18);

/** Exploded vertical offset (screen units) for each layer, centred on the assembled position. */
const explodeOffset = (layer: Layer) => (2.5 - STACK.indexOf(layer)) * GAP;

/**
 * Assembled view zoom: the assembled void is smaller than the exploded stack
 * (and needs no label column), so scale it up to fill the frame, centred.
 */
function assembledZoom(extraLeft: number) {
  const [left] = iso(0, W, 0);
  const [right] = iso(L, 0, 0);
  const top = iso(0, 0, 24)[1];
  const bottom = iso(L, W, 0)[1];
  const viewW = VIEW_W + extraLeft;
  const scale = Math.min((viewW * 0.9) / (right - left), (VIEW_H * 0.86) / (bottom - top));
  const tx = -extraLeft + viewW / 2 - scale * ((left + right) / 2);
  const ty = VIEW_H / 2 - scale * ((top + bottom) / 2);
  return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${scale.toFixed(3)})`;
}

/**
 * Phones: the drawing renders at roughly half size, so the layer labels use a
 * larger font (in drawing units) and the frame gains extra room on the left
 * for them.
 */
const PHONE_QUERY = '(max-width: 767px)';
const PHONE_LABEL_ROOM = 90;

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

/** A rectangular solid (duct, tray, beam, unit): top, +y and +x faces with crisp linework. */
function box(
  layer: Layer,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  opts: { axis?: 'x' | 'y'; rungs?: boolean; ghost?: boolean } = {},
): Prim[] {
  const c = TONE[layer];
  const axis = opts.axis ?? (x1 - x0 >= y1 - y0 ? 'x' : 'y');
  const segs = axis === 'x' ? chunks(x0, x1) : chunks(y0, y1);
  return segs.map(([a, b], i) => {
    const first = i === 0;
    const last = i === segs.length - 1;
    const [sx0, sx1, sy0, sy1] = axis === 'x' ? [a, b, y0, y1] : [x0, x1, a, b];
    const faces: ReactNode[] = [];
    const topFill = opts.rungs ? 'none' : c.top;
    const face = (key: string, pts: string, fill: string) => (
      <polygon
        key={key}
        points={pts}
        fill={fill}
        fillOpacity={opts.ghost ? 0.55 : 1}
        stroke={fill === 'none' ? 'none' : fill}
        strokeWidth={0.7}
        strokeLinejoin="round"
      />
    );
    faces.push(face('t', poly([sx0, sy0, z1], [sx1, sy0, z1], [sx1, sy1, z1], [sx0, sy1, z1]), topFill));
    if (axis === 'x' || last) faces.push(face('f', poly([sx0, sy1, z1], [sx1, sy1, z1], [sx1, sy1, z0], [sx0, sy1, z0]), c.front));
    if (axis === 'y' || last) faces.push(face('r', poly([sx1, sy0, z1], [sx1, sy1, z1], [sx1, sy1, z0], [sx1, sy0, z0]), c.end));
    if (opts.rungs) {
      const rungs = axis === 'x' ? chunks(sx0, sx1, 1.6) : chunks(sy0, sy1, 1.6);
      rungs.forEach(([r]) => {
        const pts = axis === 'x' ? poly([r, sy0, z1], [r, sy1, z1]) : poly([sx0, r, z1], [sx1, r, z1]);
        faces.push(<polyline key={`r${r}`} points={pts} stroke={c.end} strokeWidth={0.7} fill="none" />);
      });
    }
    // Continuous outline edges (no per-segment seams), drawn last.
    const edge = (pts: string, key: string) => (
      <polyline key={key} points={pts} fill="none" stroke={c.line} strokeWidth={0.75} strokeLinejoin="round" strokeLinecap="round" />
    );
    if (axis === 'x') {
      faces.push(
        edge(poly([sx0, sy0, z1], [sx1, sy0, z1]), 'e1'),
        edge(poly([sx0, sy1, z1], [sx1, sy1, z1]), 'e2'),
        edge(poly([sx0, sy1, z0], [sx1, sy1, z0]), 'e3'),
      );
      if (first) faces.push(edge(poly([sx0, sy0, z1], [sx0, sy1, z1], [sx0, sy1, z0]), 'e0'));
      if (last) faces.push(edge(poly([sx1, sy0, z1], [sx1, sy1, z1], [sx1, sy1, z0], [sx1, sy0, z0], [sx1, sy0, z1]), 'e5'));
    } else {
      faces.push(
        edge(poly([sx0, sy0, z1], [sx0, sy1, z1]), 'e1'),
        edge(poly([sx1, sy0, z1], [sx1, sy1, z1]), 'e2'),
        edge(poly([sx1, sy0, z0], [sx1, sy1, z0]), 'e3'),
      );
      if (first) faces.push(edge(poly([sx0, sy0, z1], [sx1, sy0, z1], [sx1, sy0, z0]), 'e0'));
      if (last) faces.push(edge(poly([sx0, sy1, z1], [sx1, sy1, z1], [sx1, sy1, z0], [sx0, sy1, z0], [sx0, sy1, z1]), 'e4'));
    }
    return { layer, depth: depthOf((sx0 + sx1) / 2, (sy0 + sy1) / 2, (z0 + z1) / 2), node: <g key={k()}>{faces}</g> };
  });
}

/** A round pipe or conduit along one axis: outlined body with a soft lit band. */
function pipe(
  layer: Layer,
  axis: 'x' | 'y' | 'z',
  from: [number, number, number],
  length: number,
  d: number,
  opts: { endCap?: boolean; slope?: number } = {},
): Prim[] {
  const c = TONE[layer];
  const w = d * S;
  const at = (t: number): [number, number, number] =>
    axis === 'x' ? [from[0] + t, from[1], from[2] - (opts.slope ?? 0) * t] : axis === 'y' ? [from[0], from[1] + t, from[2]] : [from[0], from[1], from[2] + t];
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
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={c.line} strokeWidth={w + 1.4} />
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={c.pipe} strokeWidth={w} />
          {w > 3 && <line x1={x0} y1={y0 - w * 0.2} x2={x1} y2={y1 - w * 0.2} stroke={c.top} strokeOpacity={0.7} strokeWidth={w * 0.22} />}
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
      node: <ellipse key={k()} cx={ex} cy={ey} rx={w * 0.4 + 0.5} ry={w * 0.5 + 0.5} fill={c.end} stroke={c.line} strokeWidth={0.75} />,
    });
  }
  return prims;
}

/** A sprinkler head: short drop and a deflector just above the ceiling. */
function sprinkler(x: number, y: number, zFrom: number): Prim {
  const c = TONE.fire;
  const [ax, ay] = iso(x, y, zFrom);
  const [bx, by] = iso(x, y, 0.5);
  return {
    layer: 'fire',
    depth: depthOf(x, y, 0.5),
    node: (
      <g key={k()}>
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke={c.line} strokeWidth={1.3} />
        <ellipse cx={bx} cy={by} rx={2.8} ry={1.3} fill={c.pipe} stroke={c.line} strokeWidth={0.6} />
      </g>
    ),
  };
}

/** A recessed light fitting in the ceiling plane, fed by a conduit drop from the tray. */
function lightFitting(x: number, y: number): Prim[] {
  const c = TONE.electrical;
  return [
    ...pipe('electrical', 'z', [x, y, 0.3], 18, 0.32),
    {
      layer: 'electrical',
      depth: depthOf(x, y, 0.2),
      node: (
        <polygon
          key={k()}
          points={poly([x - 2.6, y - 1.6, 0.25], [x + 2.6, y - 1.6, 0.25], [x + 2.6, y + 1.6, 0.25], [x - 2.6, y + 1.6, 0.25])}
          fill="#FFFDF6"
          stroke={c.line}
          strokeWidth={0.7}
        />
      ),
    },
  ];
}

function buildScene(): Prim[] {
  keySeq = 0;
  const p: Prim[] = [];

  // Structure: downstand beam the services pass beneath.
  p.push(...box('structure', 30, 35, 0, W, 20.5, 24, { axis: 'y', ghost: true }));

  // Fire: sprinkler main, branch lines across with heads, fire alarm conduit.
  p.push(...pipe('fire', 'x', [0, 8, 4.8], L, 1.6, { endCap: true }));
  [14, 38, 62].forEach((x) => {
    p.push(...pipe('fire', 'y', [x, 8, 4.4], 24, 0.75));
    [15, 23, 31].forEach((y) => p.push(sprinkler(x, y, 4.4)));
  });
  p.push(...pipe('fire', 'x', [0, 35, 6.6], L, 0.4, { endCap: true }));

  // Plumbing: domestic cold + hot water, drainage laid to falls.
  p.push(...pipe('plumbing', 'x', [0, 25.6, 9.4], L, 0.95, { endCap: true }));
  p.push(...pipe('plumbing', 'x', [0, 27.2, 9.4], L, 0.95, { endCap: true }));
  p.push(...pipe('plumbing', 'x', [0, 32.4, 8], L, 2.1, { endCap: true, slope: 2.6 / L }));

  // Mechanical: supply + return ductwork, insulated chilled water flow/return to a fan coil unit.
  p.push(...box('mechanical', 0, L, 2, 10, 11.4, 16.8));
  p.push(...box('mechanical', 0, L, 29, 35, 12, 16.8));
  p.push(...pipe('mechanical', 'x', [0, 14.6, 10.4], L, 1.7, { endCap: true }));
  p.push(...pipe('mechanical', 'x', [0, 17.4, 10.4], L, 1.7, { endCap: true }));
  p.push(...pipe('mechanical', 'y', [56, 17.4, 10.4], 3.6, 1.1));
  p.push(...box('mechanical', 50, 62, 19, 27, 6.4, 10.2));

  // Electrical: LV + ELV cable trays and busbar trunking near the soffit; drops to light fittings.
  p.push(...box('electrical', 0, L, 11.6, 15.6, 18.4, 19.2, { rungs: true }));
  p.push(...box('electrical', 0, L, 20, 23.4, 18.4, 19.2, { rungs: true }));
  p.push(...box('electrical', 0, L, 24.4, 26.2, 18.8, 20.4));
  [22, 46].forEach((x) => p.push(...lightFitting(x, 21.7)));

  return p.sort((m, n) => m.depth - n.depth);
}

const SCENE = buildScene();

/** A layer's footprint sheet at height z (visible in the exploded view). */
const sheet = (z: number) => poly([0, 0, z], [L, 0, z], [L, W, z], [0, W, z]);
const SHEET_Z: Record<Layer, number> = { ceiling: 0, fire: 3.6, plumbing: 6.2, mechanical: 6.2, electrical: 17.6, structure: 24 };
const CEILING_LINES: string[] = [
  ...Array.from({ length: L / 6 + 1 }, (_, i) => poly([i * 6, 0, 0], [i * 6, W, 0])),
  ...Array.from({ length: W / 6 + 1 }, (_, i) => poly([0, i * 6, 0], [L, i * 6, 0])),
];

/**
 * Illustrative coordinated model: an exploded axonometric of a corridor ceiling
 * void. The ceiling, four MEP disciplines and the slab start pulled apart as
 * separate sheets and slide together into one coordinated void when the model
 * scrolls into view (or on "Assemble"). Selecting a discipline isolates it and
 * lists its components below the model.
 */
export function MepSystemsDiagram() {
  const { t } = useTranslation('services');
  const figureRef = useRef<HTMLElement>(null);
  const [assembled, setAssembled] = useState(false);
  const [focus, setFocus] = useState<Discipline | null>(null);
  const isPhone = useMediaQuery(PHONE_QUERY);
  const extraLeft = isPhone ? PHONE_LABEL_ROOM : 0;

  // Assemble once, shortly after the model is mostly in view.
  useEffect(() => {
    const el = figureRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = window.setTimeout(() => setAssembled(true), 700);
          observer.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const shift = (layer: Layer): CSSProperties => ({
    transform: `translateY(${assembled ? 0 : explodeOffset(layer)}px)`,
    transition: `transform 1100ms cubic-bezier(0.22, 0.8, 0.24, 1) ${(assembled ? 5 - STACK.indexOf(layer) : STACK.indexOf(layer)) * 70}ms, opacity 400ms ease-out`,
  });
  const dimmed = (layer: Layer) => focus !== null && layer !== focus;
  const label = (layer: Layer) =>
    layer === 'ceiling'
      ? t('mepPage.integration.annotations.ceiling')
      : layer === 'structure'
        ? t('mepPage.integration.annotations.slab')
        : t(`mepPage.integration.layers.${layer}`);

  return (
    <figure ref={figureRef} className="w-full">
      <div className="relative">
        <div dir="ltr" className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <svg
            viewBox={`${-extraLeft} 0 ${VIEW_W + extraLeft} ${VIEW_H}`}
            role="img"
            aria-label={t('mepPage.integration.caption')}
            className="block h-auto w-full [&_*]:motion-reduce:!transition-none"
          >
            <g
              style={{
                transform: assembled ? assembledZoom(extraLeft) : 'none',
                transformOrigin: '0 0',
                transition: `transform 1100ms cubic-bezier(0.22, 0.8, 0.24, 1) ${assembled ? 250 : 0}ms`,
              }}
            >
              {/* Sheets + layer labels (exploded view only). */}
              {STACK.map((layer) => {
                const z = SHEET_Z[layer];
                const [lx, ly] = iso(0, W, z);
                const c = TONE[layer];
                const isDiscipline = layer !== 'ceiling' && layer !== 'structure';
                return (
                  <g key={layer} style={{ ...shift(layer), opacity: dimmed(layer) ? 0.25 : 1 }}>
                    {layer === 'ceiling' ? (
                      <>
                        <polygon points={sheet(0)} fill={c.top} stroke={c.line} strokeWidth={0.8} />
                        <g stroke={c.line} strokeOpacity={0.55} strokeWidth={0.6} fill="none">
                          {CEILING_LINES.map((pts, i) => (
                            <polyline key={i} points={pts} />
                          ))}
                        </g>
                      </>
                    ) : layer === 'structure' ? (
                      <polygon points={sheet(z)} fill="none" stroke={c.line} strokeWidth={0.8} strokeDasharray="5 4" />
                    ) : (
                      <polygon
                        points={sheet(z)}
                        fill={c.top}
                        fillOpacity={0.45}
                        stroke={c.end}
                        strokeOpacity={0.7}
                        strokeWidth={0.8}
                        strokeDasharray="4 3"
                        style={{ opacity: assembled ? 0 : 1, transition: 'opacity 500ms ease-out' }}
                      />
                    )}
                    <g style={{ opacity: assembled ? 0 : 1, transition: 'opacity 500ms ease-out' }}>
                      <line x1={lx - 6} y1={ly} x2={lx - 26} y2={ly} stroke={isDiscipline ? c.line : '#8F887F'} strokeWidth={0.8} />
                      <text
                        x={lx - 32}
                        y={ly + 3.5}
                        textAnchor="end"
                        fill={isDiscipline ? c.line : '#6B655D'}
                        className="font-sans text-[10.5px] font-semibold uppercase tracking-[0.1em] max-md:text-[21px] max-md:normal-case max-md:tracking-normal"
                      >
                        {label(layer)}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Depth-sorted services: each element moves and dims with its layer. */}
              {SCENE.map((prim, i) => (
                <g key={i} style={{ ...shift(prim.layer), opacity: dimmed(prim.layer) ? (prim.layer === 'structure' ? 0.5 : 0.12) : 1 }}>
                  {prim.node}
                </g>
              ))}
            </g>
          </svg>
        </div>
        <button
          type="button"
          onClick={() => setAssembled((a) => !a)}
          className="absolute end-3 top-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-ink px-4 text-small font-semibold text-white shadow-sm transition-colors duration-base hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Layers size={16} aria-hidden="true" />
          {assembled ? t('mepPage.integration.explode') : t('mepPage.integration.assemble')}
        </button>
        {/* Fixed label in the panel's bottom corner, whatever the state or selection. */}
        <p aria-hidden="true" className="pointer-events-none absolute bottom-3 end-4 text-caption font-medium text-gray-500">
          {t('mepPage.integration.caption')}
        </p>
      </div>

      {/* Discipline isolation. */}
      <div className="mt-4">
        <div role="radiogroup" aria-label={t('mepPage.integration.controlsLabel')} className="flex flex-wrap gap-1.5">
          {[null, ...DISCIPLINES].map((d) => {
            const active = focus === d;
            return (
              <button
                key={d ?? 'all'}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFocus(d)}
                className={cn(
                  'inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                  active ? 'border-ink bg-white text-ink' : 'border-gray-200 bg-white/60 text-gray-600 hover:border-gray-400 hover:text-ink',
                )}
              >
                {d && <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: TONE[d].end }} />}
                {d ? t(`mepPage.integration.layers.${d}`) : t('mepPage.integration.allLayers')}
              </button>
            );
          })}
        </div>
      </div>
      <figcaption aria-live="polite" className={cn('mt-3 text-small text-gray-600 md:min-h-[1.5rem]', !focus && 'max-md:hidden')}>
        {/* Every discipline's component list is in the HTML; only the selected one is shown. */}
        {DISCIPLINES.map((d) => (
          <span key={d} hidden={focus !== d}>
            {COMPONENTS[d].map((key) => t(`mepPage.integration.annotations.${key}`)).join('  ·  ')}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
