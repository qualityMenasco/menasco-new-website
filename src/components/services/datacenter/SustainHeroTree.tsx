import { useMemo } from 'react';

/**
 * Sustainability hero drawing: an illustrated tree (layered green canopy,
 * brown trunk) whose MENASCO-blue roots spread down through the whole hero,
 * behind the title, with a light pulse travelling out along them.
 *
 * Geometry is generated from a fixed seed, so the server-rendered HTML and the
 * browser render are identical.
 *
 * Two SVGs share one horizontal scale so the roots meet the trunk exactly:
 *  - the tree, in a block of height --tree-h (set by the caller), drawn at
 *    width --tree-h × (W / H);
 *  - the roots, absolutely positioned from the bottom of that block to the
 *    bottom of the hero, at the same width, stretched vertically only
 *    (non-scaling strokes keep line weights true).
 * Reduced motion: the pulse is hidden (index.css), the roots stay.
 */

const W = 1600;
const H = 430;
export const TREE_RATIO = W / H;
const CX = W / 2;
const GROUND = H;

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Blob = { x: number; y: number; r: number; tone: number };

function buildCanopy(): Blob[] {
  const rand = rng(11);
  const blobs: Blob[] = [];
  const cy = 168;
  const rx = 300;
  const ry = 150;
  // Clusters inside a slightly flattened, irregular crown.
  for (let i = 0; i < 150; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand());
    let x = CX + Math.cos(a) * rx * d;
    let y = cy + Math.sin(a) * ry * d * (Math.sin(a) > 0 ? 0.85 : 1);
    // Keep the underside open so the branch forks show.
    if (y > cy + 70 && Math.abs(x - CX) < 70) y -= 40;
    x += (rand() - 0.5) * 20;
    const r = 18 + rand() * 30 * (1 - d * 0.45);
    // Tone: 0 deep shadow … 3 sunlit. Light from the upper right.
    const light = (x - CX) / rx * 0.45 - (y - cy) / ry * 0.75 + (rand() - 0.5) * 0.6;
    const tone = light > 0.55 ? 3 : light > 0.05 ? 2 : light > -0.45 ? 1 : 0;
    blobs.push({ x, y, r, tone });
  }
  // Draw shadows first, sunlit clusters last.
  return blobs.sort((p, q) => p.tone - q.tone || p.y - q.y);
}

type Leaf = { x: number; y: number; rot: number; s: number; tone: number };

function buildRimLeaves(): Leaf[] {
  const rand = rng(29);
  const leaves: Leaf[] = [];
  for (let i = 0; i < 240; i++) {
    const a = rand() * Math.PI * 2;
    const d = 0.86 + rand() * 0.2;
    const x = CX + Math.cos(a) * 316 * d;
    const y = 168 + Math.sin(a) * 160 * d * (Math.sin(a) > 0 ? 0.8 : 1);
    const light = Math.cos(a) * 0.4 - Math.sin(a) * 0.8 + (rand() - 0.5) * 0.5;
    leaves.push({ x, y, rot: rand() * 180, s: 5 + rand() * 6, tone: light > 0.4 ? 3 : light > -0.2 ? 2 : 1 });
  }
  return leaves;
}

type Root = { d: string; w: number; level: number };

function buildRoots(): Root[] {
  const rand = rng(7);
  const roots: Root[] = [];
  const RW = W;
  const RH = 600;
  const grow = (x: number, y: number, angle: number, len: number, w: number, level: number) => {
    const pts: [number, number][] = [[x, y]];
    let a = angle;
    let cx = x;
    let cy = y;
    const steps = 10 + Math.floor(rand() * 5);
    for (let i = 0; i < steps; i++) {
      a += (rand() - 0.5) * 0.75;
      // Gravity: roots bend downward as they grow.
      a += (Math.PI / 2 - a) * 0.05;
      cx += Math.cos(a) * (len / steps);
      cy += Math.sin(a) * (len / steps);
      pts.push([cx, cy]);
      if (level < 3 && i > 2 && rand() < 0.24 - level * 0.05) {
        const side = rand() < 0.5 ? -1 : 1;
        grow(cx, cy, a + side * (0.5 + rand() * 0.6), len * (0.45 + rand() * 0.2), w * 0.55, level + 1);
      }
      if (cx < -40 || cx > RW + 40 || cy > RH + 40) break;
    }
    // Smooth curve through the midpoints.
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    d += ` L${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
    roots.push({ d, w, level });
  };
  // Main roots fan out from the trunk base: nearly flat at the sides, steep in the middle.
  const mains = [0.12, 0.3, 0.55, 0.95, 1.35, 1.6, 2.2, 2.6, 2.84, 3.02];
  mains.forEach((a, i) => {
    const spread = Math.abs(Math.cos(a));
    grow(CX + (i - 4.5) * 5, 0, a, 380 + spread * 520 + rand() * 120, 5.5 - spread * 1.5, 0);
  });
  return roots.sort((p, q) => q.level - p.level);
}

const LEAF_TONES = ['#1F4A24', '#2E6A2F', '#4C8F3A', '#7DB24A'];
const LEAF_HIGHLIGHT = ['#2C5E2D', '#3F7F37', '#66A844', '#A6CF6A'];

export function SustainHeroTree() {
  const canopy = useMemo(buildCanopy, []);
  const rim = useMemo(buildRimLeaves, []);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" aria-hidden="true" className="block h-full w-full">
      <defs>
        {LEAF_TONES.map((c, i) => (
          <radialGradient key={c} id={`dct-leaf-${i}`} cx="0.6" cy="0.35" r="0.9">
            <stop offset="0" stopColor={LEAF_HIGHLIGHT[i]} />
            <stop offset="1" stopColor={c} />
          </radialGradient>
        ))}
        <linearGradient id="dct-bark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3E2717" />
          <stop offset="0.45" stopColor="#7A5232" />
          <stop offset="0.7" stopColor="#8E6440" />
          <stop offset="1" stopColor="#4A2F1C" />
        </linearGradient>
        <linearGradient id="dct-ground" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6B5A48" stopOpacity="0" />
          <stop offset="0.5" stopColor="#6B5A48" stopOpacity="0.45" />
          <stop offset="1" stopColor="#6B5A48" stopOpacity="0" />
        </linearGradient>
        {/* Ragged, leafy edges and texture: displaces the cluster outlines with fractal noise. */}
        <filter id="dct-foliage" x="-8%" y="-12%" width="116%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.075" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Ground line, fading out at both ends */}
      <rect x={CX - 340} y={GROUND - 1.5} width={680} height={1.5} fill="url(#dct-ground)" />

      {/* Branches (mostly hidden by the crown; the forks show through its open underside) */}
      <g fill="url(#dct-bark)">
        <path d={`M${CX - 14} 300 C ${CX - 30} 250, ${CX - 90} 220, ${CX - 170} 170 L ${CX - 160} 160 C ${CX - 80} 205, ${CX - 22} 235, ${CX - 4} 280 Z`} />
        <path d={`M${CX + 10} 300 C ${CX + 34} 252, ${CX + 100} 214, ${CX + 190} 165 L ${CX + 182} 154 C ${CX + 92} 200, ${CX + 26} 236, ${CX + 2} 282 Z`} />
        <path d={`M${CX - 6} 290 C ${CX - 12} 230, ${CX - 4} 170, ${CX - 20} 90 L ${CX - 8} 88 C ${CX + 8} 170, ${CX + 6} 230, ${CX + 8} 290 Z`} />
        <path d={`M${CX - 60} 226 C ${CX - 90} 190, ${CX - 100} 150, ${CX - 110} 100 L ${CX - 100} 100 C ${CX - 88} 150, ${CX - 76} 188, ${CX - 50} 222 Z`} />
        <path d={`M${CX + 64} 222 C ${CX + 96} 186, ${CX + 116} 150, ${CX + 130} 104 L ${CX + 140} 108 C ${CX + 126} 154, ${CX + 104} 192, ${CX + 74} 228 Z`} />
      </g>

      {/* Trunk with a flared base */}
      <path
        d={`M${CX - 46} ${GROUND} C ${CX - 30} ${GROUND - 14}, ${CX - 22} ${GROUND - 40}, ${CX - 22} ${GROUND - 80} L ${CX - 18} 286 C ${CX - 8} 276, ${CX + 10} 276, ${CX + 20} 286 L ${CX + 24} ${GROUND - 80} C ${CX + 24} ${GROUND - 40}, ${CX + 34} ${GROUND - 14}, ${CX + 52} ${GROUND} Z`}
        fill="url(#dct-bark)"
      />
      {/* Bark texture */}
      <g fill="none" stroke="#3A2414" strokeOpacity={0.55} strokeWidth={1.4} strokeLinecap="round">
        <path d={`M${CX - 10} ${GROUND - 6} C ${CX - 14} ${GROUND - 60}, ${CX - 6} ${GROUND - 100}, ${CX - 10} 296`} />
        <path d={`M${CX + 8} ${GROUND - 10} C ${CX + 12} ${GROUND - 50}, ${CX + 4} ${GROUND - 92}, ${CX + 9} 300`} />
        <path d={`M${CX - 30} ${GROUND - 4} C ${CX - 22} ${GROUND - 24}, ${CX - 18} ${GROUND - 44}, ${CX - 18} ${GROUND - 70}`} strokeOpacity={0.35} />
        <path d={`M${CX + 36} ${GROUND - 4} C ${CX + 26} ${GROUND - 22}, ${CX + 20} ${GROUND - 46}, ${CX + 20} ${GROUND - 74}`} strokeOpacity={0.35} />
      </g>
      <path d={`M${CX + 12} ${GROUND - 20} C ${CX + 16} ${GROUND - 70}, ${CX + 12} ${GROUND - 110}, ${CX + 14} 300`} fill="none" stroke="#B08458" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" />
      {/* Root collar turning MENASCO blue where it meets the ground */}
      <path d={`M${CX - 46} ${GROUND} C ${CX - 20} ${GROUND - 8}, ${CX + 24} ${GROUND - 8}, ${CX + 52} ${GROUND} Z`} fill="#0C76A3" fillOpacity={0.55} />

      {/* Crown: clusters of overlapping leaf masses, shadow to sunlit, with leafy edges */}
      <g filter="url(#dct-foliage)">
        {canopy.map((b, i) => (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={b.r} fill={`url(#dct-leaf-${b.tone})`} />
            <circle cx={b.x + b.r * 0.55} cy={b.y + b.r * 0.15} r={b.r * 0.62} fill={`url(#dct-leaf-${b.tone})`} />
            <circle cx={b.x - b.r * 0.5} cy={b.y + b.r * 0.25} r={b.r * 0.55} fill={`url(#dct-leaf-${Math.max(0, b.tone - 1)})`} />
          </g>
        ))}
        {/* Individual leaves breaking the silhouette */}
        {rim.map((l, i) => (
          <ellipse key={`l${i}`} cx={l.x} cy={l.y} rx={l.s} ry={l.s * 0.48} transform={`rotate(${l.rot.toFixed(0)} ${l.x.toFixed(1)} ${l.y.toFixed(1)})`} fill={LEAF_TONES[l.tone]} />
        ))}
      </g>
    </svg>
  );
}

/** The roots: absolutely positioned by the caller under the tree, down to the bottom of the hero. */
export function SustainHeroRoots() {
  const roots = useMemo(buildRoots, []);
  return (
    <svg viewBox={`0 0 ${W} 600`} preserveAspectRatio="none" aria-hidden="true" className="block h-full w-full">
      <g fill="none" stroke="#0C76A3" strokeLinecap="round" strokeLinejoin="round">
        {roots.map((r, i) => (
          <path key={i} d={r.d} strokeWidth={r.w} strokeOpacity={0.4 - r.level * 0.08} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      {/* Light pulse travelling outward along the larger roots */}
      <g fill="none" stroke="#5CC2F2" strokeLinecap="round" className="dc-root-pulse">
        {roots
          .filter((r) => r.level <= 1)
          .map((r, i) => (
            <path
              key={i}
              d={r.d}
              pathLength={1000}
              strokeWidth={r.w}
              strokeDasharray="90 910"
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${((i * 7) % 11) * 0.45}s` }}
            />
          ))}
      </g>
    </svg>
  );
}
