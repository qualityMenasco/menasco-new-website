/** Design rules for this animation and the Data Center pages: see the header comment in src/pages/DataCenterPage.tsx. */
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * Scroll-driven story animation for the Data Center technical page.
 *
 * Text opts in with `data-flow-target="power|water|data|heat"` on an inline
 * span. Each target gets an episode with kind-specific physics:
 * - power: a faint stepped leader descends, then the return stroke strikes
 *   (with branches) and fades. Text: zap.
 * - water: separate raindrops fall on gravity arcs and splash. Text: flood.
 * - data:  bit-packets travel orthogonal circuit traces and leave by a new
 *   route. Text: glitch.
 * - heat:  plumes rise, widen and lean, then dissipate. Text: shimmer.
 *
 * Architecture: lines travel mostly through the 2nd and 4th fifths of the
 * page, strike into the content, and exit through the outer fifths. Two SVG
 * layers sit either side of the content (content is z-[2]): lines travel
 * UNDER text and cards, and rise ABOVE them only for the final approach and
 * strike. Timing: an episode begins as the reader finishes the previous
 * section and strikes as the target scrolls into view. Progress follows
 * scroll with light easing (it settles a moment after scrolling stops), so
 * motion is smooth and trackable. Hidden for reduced-motion users.
 */

type Kind = 'power' | 'water' | 'data' | 'heat';
type Pt = [number, number];

export const STORY_COLORS: Record<Kind, string> = { power: '#E9B23A', water: '#3B9EE6', data: '#3DBE7A', heat: '#E0765C' };

interface Drop {
  land: Pt;
  vx: number;
  vy: number;
  delay: number;
  len: number;
  /** Fall time from release (origin drops only); otherwise drops fall from off screen. */
  T?: number;
}

interface Episode {
  kind: Kind;
  el: HTMLElement;
  top: number;
  /** Order among targets visible at load (driven by the first scroll); -1 otherwise. */
  early: number;
  /** Hero words launched from an origin drawing: absolute scroll positions for start / hit / end. */
  hero?: { start: number; hit: number; end: number };
  touch: Pt;
  /** Main route (power, data) and the window [above0, above1] drawn over the content. */
  route?: string;
  above0: number;
  above1: number;
  strike: number;
  branches?: string[];
  drops?: Drop[];
  corners?: { at: Pt; f: number }[];
  plumes?: { d: string; a0: number; a1: number }[];
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const plen = (pts: Pt[]) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

function lightning(from: Pt, to: Pt, r: () => number, rough: number): Pt[] {
  const pts: Pt[] = [from];
  let [x, y] = from;
  let guard = 0;
  while (Math.hypot(to[0] - x, to[1] - y) > 24 && guard++ < 240) {
    const ang = Math.atan2(to[1] - y, to[0] - x) + (r() - 0.5) * rough;
    const step = 14 + r() * 28;
    x += Math.cos(ang) * step;
    y += Math.max(4, Math.sin(ang) * step);
    pts.push([x, y]);
  }
  pts.push(to);
  return pts;
}

function build(kind: Kind, el: HTMLElement, box: { x: number; y: number; w: number; h: number }, W: number, seed: number, early: number, origin?: Pt): Episode {
  const r = rng(seed);
  const cx = box.x + box.w / 2;
  const leftHalf = cx < W / 2;
  // Fifths of the page: lanes in the 2nd/4th, exits in the 1st/5th.
  const lane = W * (leftHalf ? 0.3 : 0.7) + (r() - 0.5) * W * 0.08;
  const exitX = leftHalf ? W * 0.06 : W * 0.94;
  const otherLane = W * (leftHalf ? 0.7 : 0.3);
  // Strike point: on top of the text where the lane meets it, else its nearest end.
  const sx = clamp(lane, box.x + 10, box.x + box.w - 10);
  const touch: Pt = [sx, box.y - 2];
  const base = { kind, el, top: box.y, early, touch, above0: 0, above1: 0, strike: 1 };

  if (origin && kind === 'power') {
    // Discharge from the busway tap box down onto the word.
    const ox = clamp(origin[0], box.x + 10, box.x + box.w - 10);
    const strikeAt: Pt = [ox + (r() - 0.5) * 30, box.y - 2];
    const knee: Pt = [strikeAt[0] + (r() - 0.5) * 40, box.y - 46 - r() * 18];
    const top = lightning(origin, knee, r, 1.4);
    const fin = lightning(knee, strikeAt, r, 0.9);
    const all = [...top, ...fin.slice(1)];
    const branches = [0, 1].map(() => {
      const at = top[Math.floor(top.length * (0.4 + r() * 0.4))];
      return toD(lightning(at, [at[0] + (r() - 0.5) * 120, at[1] + 40 + r() * 40], r, 1.8));
    });
    return { ...base, touch: strikeAt, route: toD(all), above0: plen(top) / plen(all), above1: 1, strike: 1, branches };
  }

  if (origin && kind === 'water') {
    // Drips from the pipe: each drop is released at the origin and falls ballistically onto the word.
    const G = 980;
    const n = 12 + Math.floor(r() * 6);
    const drops: Drop[] = Array.from({ length: n }, () => {
      const land: Pt = [box.x + 8 + r() * (box.w - 16), box.y + r() * box.h * 0.35];
      const T = 0.55 + r() * 0.3;
      const o: Pt = [origin[0] + (r() - 0.5) * 8, origin[1]];
      return { land, T, vx: (land[0] - o[0]) / T, vy: (land[1] - o[1] - 0.5 * G * T * T) / T, delay: (r() - 0.7) * 0.22, len: 8 + r() * 7 };
    });
    return { ...base, drops };
  }

  if (origin && kind === 'data') {
    // Leaves the rack's network port and routes down onto the word, then away.
    const pts: Pt[] = [origin, [origin[0], origin[1] + 30 + r() * 30]];
    const jogX = origin[0] + (r() - 0.5) * 120;
    pts.push([jogX, pts[1][1]]);
    const midY = (pts[1][1] + box.y) / 2 + (r() - 0.5) * 30;
    pts.push([jogX, midY]);
    pts.push([sx, midY]);
    const approachStart = pts.length - 1;
    pts.push(touch);
    const inLen = plen(pts);
    const out: Pt[] = [touch, [sx, box.y + box.h + 30], [exitX, box.y + box.h + 30], [exitX, box.y + box.h + 260], [leftHalf ? -40 : W + 40, box.y + box.h + 260]];
    const all = [...pts, ...out.slice(1)];
    const total = plen(all);
    const corners = all.slice(1, -1).map((at, k) => ({ at, f: plen(all.slice(0, k + 2)) / total }));
    return { ...base, route: toD(all), above0: plen(pts.slice(0, approachStart + 1)) / total, above1: (inLen + 30) / total, strike: inLen / total, corners };
  }

  if (kind === 'power') {
    const sky: Pt = [lane + (r() - 0.5) * 60, box.y - 640 - r() * 260];
    const knee: Pt = [sx + (r() - 0.5) * 36, box.y - 52 - r() * 22];
    const top = lightning(sky, knee, r, 1.5);
    const fin = lightning(knee, touch, r, 0.9);
    const all = [...top, ...fin.slice(1)];
    const branches: string[] = [];
    const n = 1 + Math.floor(r() * 3);
    for (let b = 0; b < n; b++) {
      const at = fin[Math.min(fin.length - 1, Math.floor(fin.length * (0.1 + r() * 0.5)))];
      const end: Pt = [at[0] + (r() - 0.5) * 140, at[1] + 30 + r() * 50];
      branches.push(toD(lightning(at, end, r, 1.8)));
    }
    return { ...base, route: toD(all), above0: plen(top) / plen(all), above1: 1, strike: 1, branches };
  }

  if (kind === 'water') {
    const wind = (leftHalf ? 1 : -1) * (30 + r() * 90);
    const n = 12 + Math.floor(r() * 8);
    const drops: Drop[] = Array.from({ length: n }, () => ({
      land: [clamp(sx + (r() - 0.5) * Math.min(160, box.w), box.x + 4, box.x + box.w - 4), box.y + r() * Math.max(6, box.h * 0.4)],
      vx: wind * (0.6 + r() * 0.8),
      vy: 100 + r() * 160,
      delay: (r() - 0.65) * 0.2,
      len: 9 + r() * 9,
    }));
    return { ...base, drops };
  }

  if (kind === 'data') {
    // Enters high in the lane, steps down with orthogonal turns (sometimes via the centre),
    // drops onto the text, then routes out through the outer fifth.
    const pts: Pt[] = [[lane, box.y - 700 - r() * 200]];
    let y = pts[0][1];
    const steps = 2 + Math.floor(r() * 3);
    let x = lane;
    for (let i = 0; i < steps; i++) {
      y += (box.y - 140 - y) / (steps - i) + (r() - 0.5) * 40;
      pts.push([x, y]);
      x = i % 2 === 0 ? lane + (r() > 0.6 ? (W * 0.5 - lane) * 0.8 : (r() - 0.5) * W * 0.07) : lane + (r() - 0.5) * W * 0.05;
      pts.push([x, y]);
    }
    pts.push([sx, y]);
    const approachStart = pts.length - 1;
    pts.push(touch);
    const inLen = plen(pts);
    const out: Pt[] = [touch, [sx, box.y + box.h + 40 + r() * 60]];
    const oy = out[1][1];
    out.push([r() > 0.5 ? exitX : otherLane, oy]);
    out.push([out[2][0], oy + 160 + r() * 160]);
    out.push([leftHalf ? -40 : W + 40, out[3][1]]);
    const all = [...pts, ...out.slice(1)];
    const total = plen(all);
    const corners = all.slice(1, -1).map((at, k) => ({ at, f: plen(all.slice(0, k + 2)) / total }));
    return {
      ...base,
      route: toD(all),
      above0: plen(pts.slice(0, approachStart + 1)) / total,
      above1: (inLen + 30) / total,
      strike: inLen / total,
      corners,
    };
  }

  // heat: plumes rise from below in the lane, pass over the text, drift towards the outer fifth.
  const plumes = [0, 1, 2].map((k) => {
    const baseY = box.y + box.h + 380 + r() * 160;
    const height = 760 + r() * 200;
    const bx = sx + (k - 1) * 14 + (r() - 0.5) * 10;
    const drift = (exitX - bx) * (0.35 + r() * 0.25);
    const wl = 46 + r() * 22;
    const pts: Pt[] = [];
    for (let i = 0; i <= 180; i++) {
      const t = i / 180;
      const h = t * height;
      const amp = 2 + t * 11;
      pts.push([bx + drift * t * t + amp * Math.sin((h / wl) * Math.PI * 2 + k * 1.7), baseY - h]);
    }
    const a0 = clamp((baseY - (box.y + box.h) - 50) / height);
    const a1 = clamp((baseY - box.y + 40) / height);
    return { d: toD(pts), a0, a1 };
  });
  return { ...base, plumes, strike: plumes[1].a0 + 0.02 };
}

export function StoryFlow({ containerRef }: { containerRef: RefObject<HTMLElement> }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [enabled, setEnabled] = useState(true);
  const below = useRef<(SVGGElement | null)[]>([]);
  const above = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setEnabled(!mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const measure = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const rr = root.getBoundingClientRect();
    const W = root.clientWidth;
    const rootTopAbs = rr.top + window.scrollY;
    const vh = window.innerHeight;
    const origins: Partial<Record<Kind, Pt>> = {};
    root.querySelectorAll<SVGElement>('[data-flow-origin]').forEach((o) => {
      const ob = o.getBoundingClientRect();
      origins[o.dataset.flowOrigin as Kind] = [ob.left + ob.width / 2 - rr.left, ob.top + ob.height / 2 - rr.top];
    });
    let earlyCount = 0;
    let heroCount = 0;
    const eps = [...root.querySelectorAll<HTMLElement>('[data-flow-target]')].map((el, i) => {
      const b = el.getBoundingClientRect();
      const box = { x: b.left - rr.left, y: b.top - rr.top, w: b.width, h: b.height };
      const kind = el.dataset.flowTarget as Kind;
      el.style.setProperty('--dc-ink', getComputedStyle(el).color);
      if (kind === 'water') el.dataset.text = el.textContent ?? '';
      const origin = el.hasAttribute('data-flow-hero') ? origins[kind] : undefined;
      if (origin) {
        // Strike as the word reaches the upper-middle of the screen, staggered word by word.
        const k = heroCount++;
        // Hero timing (tuned with the client): each line runs from scroll 0 (or half a
        // screen before its hit), the hit lands as the word passes ~42% down the screen,
        // and words are staggered slightly so every strike happens while the word is in view.
        const stagger = 0.045 * vh;
        const hit = Math.max(0.1 * vh + k * stagger, rootTopAbs + box.y - 0.42 * vh + k * stagger);
        const ep = build(kind, el, box, W, (i + 7) * 104729, -1, origin);
        return { ...ep, hero: { start: Math.max(0, hit - 0.5 * vh), hit, end: hit + 0.6 * vh } };
      }
      const early = rootTopAbs + box.y < vh * 0.8 ? earlyCount++ : -1;
      return build(kind, el, box, W, (i + 7) * 104729, early);
    });
    setSize({ w: W, h: root.scrollHeight });
    setEpisodes(eps);
  }, [containerRef]);

  useLayoutEffect(() => {
    if (!enabled) return;
    measure();
    const root = containerRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    return () => ro.disconnect();
  }, [enabled, measure, containerRef]);

  useEffect(() => {
    if (!enabled || !episodes.length) return;
    let frame = 0;
    const shown = episodes.map(() => -1);
    const lengths = new Map<SVGGeometryElement, number>();
    const L = (p: SVGGeometryElement) => {
      let v = lengths.get(p);
      if (v === undefined) lengths.set(p, (v = p.getTotalLength()));
      return v;
    };
    /** Show only [a, b] (fractions of length) of a path. */
    const win = (p: SVGGeometryElement | null, a: number, b: number) => {
      if (!p) return;
      const len = L(p);
      if (b <= a) {
        p.style.strokeDasharray = `0 ${len * 2}`;
        return;
      }
      p.style.strokeDasharray = `${(b - a) * len} ${len * 2}`;
      p.style.strokeDashoffset = `${-a * len}`;
    };

    const targetProgress = (ep: Episode, vh: number, rootTop: number) => {
      if (ep.hero) {
        const { start, hit, end } = ep.hero;
        return { p: clamp((window.scrollY - start) / (end - start)), H: (hit - start) / (end - start) };
      }
      if (ep.early >= 0) {
        const start = ep.early * 0.07 * vh;
        return { p: clamp((window.scrollY - start) / (0.6 * vh)), H: 0.18 };
      }
      const u = (rootTop + ep.top) / vh;
      return { p: clamp((1.75 - u) / 1.6), H: (1.75 - 0.8) / 1.6 };
    };

    const draw = (ep: Episode, i: number, p: number, H: number) => {
      const gB = below.current[i];
      const gA = above.current[i];
      if (!gB || !gA) return;
      const active = p > 0.001 && p < 0.999;
      gB.style.display = active ? '' : 'none';
      gA.style.display = active ? '' : 'none';
      const lit = p >= H && p < H + 0.28;
      if (lit && ep.el.dataset.lit !== ep.kind) ep.el.dataset.lit = ep.kind;
      else if (!lit && ep.el.dataset.lit) delete ep.el.dataset.lit;
      if (!active) return;
      const fadeIn = clamp(p / 0.12);
      const fadeOut = clamp((1 - p) / 0.16);
      const base = fadeIn * fadeOut;
      /** Lines travelling under the content are quieter; they brighten as they rise over it. */
      const UNDER = 0.45;

      if (ep.kind === 'power') {
        const leader = gB.querySelector<SVGGeometryElement>('[data-leader]');
        const lead = clamp((p - (H - 0.4)) / 0.32);
        win(leader, 0, lead * 0.95);
        if (leader) leader.style.opacity = String(p < H - 0.02 ? 0.4 * UNDER * base : 0);
        const struck = p >= H - 0.05;
        const decay = clamp((p - H) / 0.26);
        const op = struck ? (1 - decay) * base : 0;
        gB.querySelectorAll<SVGGeometryElement>('[data-bolt]').forEach((b) => {
          win(b, 0, struck ? ep.above0 : 0);
          b.style.opacity = String(op * UNDER);
        });
        gA.querySelectorAll<SVGGeometryElement>('[data-bolt]').forEach((b) => {
          win(b, ep.above0, struck ? 1 : ep.above0);
          b.style.opacity = String(op);
        });
        gA.querySelectorAll<SVGGeometryElement>('[data-branch]').forEach((b, k) => {
          win(b, 0, struck ? clamp((p - (H - 0.05)) / (0.04 + k * 0.015)) : 0);
          b.style.opacity = String(op * 0.85);
        });
        const flash = gA.querySelector<SVGEllipseElement>('[data-flash]');
        if (flash) {
          const k = clamp((p - H) / 0.16);
          flash.setAttribute('rx', String(4 + 60 * k));
          flash.setAttribute('ry', String(3 + 20 * k));
          flash.style.opacity = String(p >= H ? (1 - k) * base : 0);
        }
        return;
      }

      if (ep.kind === 'water') {
        const span = Math.max(0.25, H);
        const linesB = gB.querySelectorAll<SVGLineElement>('[data-drop]');
        const linesA = gA.querySelectorAll<SVGLineElement>('[data-drop]');
        const splashes = gA.querySelectorAll<SVGEllipseElement>('[data-splash]');
        const G = 980;
        ep.drops!.forEach((d, k) => {
          const s = ((H + d.delay - p) / span) * 1.5;
          const sMax = d.T ?? 1.5;
          const overAt = d.T ? d.T * 0.45 : 0.3;
          const lb = linesB[k];
          const la = linesA[k];
          const sp = splashes[k];
          if (s > 0 && s < sMax) {
            const x = d.land[0] - d.vx * s;
            const y = d.land[1] - (d.vy * s + 0.5 * G * s * s);
            const vy = d.vy + G * s;
            const m = Math.hypot(d.vx, vy) || 1;
            const line = s < overAt ? la : lb; // over the content for the last stretch
            const other = s < overAt ? lb : la;
            line.setAttribute('x1', x.toFixed(1));
            line.setAttribute('y1', y.toFixed(1));
            line.setAttribute('x2', (x - (d.vx / m) * d.len).toFixed(1));
            line.setAttribute('y2', (y - (vy / m) * d.len).toFixed(1));
            line.style.opacity = String(0.85 * base * (s < overAt ? 1 : 0.6));
            other.style.opacity = '0';
            sp.style.opacity = '0';
          } else {
            lb.style.opacity = '0';
            la.style.opacity = '0';
            const after = -s;
            if (after >= 0 && after < 0.35) {
              const q = after / 0.35;
              sp.setAttribute('cx', String(d.land[0]));
              sp.setAttribute('cy', String(d.land[1]));
              sp.setAttribute('rx', String(2 + 13 * q));
              sp.setAttribute('ry', String(1 + 3.5 * q));
              sp.style.opacity = String(0.8 * (1 - q) * base);
            } else sp.style.opacity = '0';
          }
        });
        return;
      }

      if (ep.kind === 'data') {
        const head = p < H ? ep.strike * clamp((p - 0.04) / (H - 0.04)) : ep.strike + (1 - ep.strike) * ((p - H) / (1 - H));
        const tail = Math.max(0, head - 0.32);
        const pre = gB.querySelector<SVGGeometryElement>('[data-pre]');
        const post = gB.querySelector<SVGGeometryElement>('[data-post]');
        const mid = gA.querySelector<SVGGeometryElement>('[data-mid]');
        win(pre, tail, Math.min(head, ep.above0));
        win(mid, Math.max(tail, ep.above0), Math.min(head, ep.above1));
        win(post, Math.max(tail, ep.above1), head);
        if (pre) pre.style.opacity = String(base * UNDER);
        if (post) post.style.opacity = String(base * UNDER);
        if (mid) mid.style.opacity = String(base);
        gB.querySelectorAll<SVGRectElement>('[data-corner]').forEach((rc, k) => {
          const f = ep.corners![k].f;
          rc.style.opacity = head >= f && head - f < 0.32 ? String(base * UNDER) : '0';
        });
        const route = pre!;
        const len = L(route);
        const pb = gB.querySelectorAll<SVGTextElement>('[data-packet]');
        const pa = gA.querySelectorAll<SVGTextElement>('[data-packet]');
        pb.forEach((t, k) => {
          const at = head - k * 0.022;
          const over = at >= ep.above0 && at <= ep.above1;
          const el = over ? pa[k] : t;
          const other = over ? t : pa[k];
          other.style.opacity = '0';
          if (at <= 0) {
            el.style.opacity = '0';
            return;
          }
          const pt = route.getPointAtLength(at * len);
          el.setAttribute('x', pt.x.toFixed(1));
          el.setAttribute('y', (pt.y + 3).toFixed(1));
          el.style.opacity = String((1 - k * 0.18) * base * (over ? 1 : 0.6));
        });
        return;
      }

      // heat
      const rise = clamp((p - 0.03) / 0.94);
      ep.plumes!.forEach((pl, k) => {
        const head = clamp(rise * 1.12 - k * 0.04);
        const tail = Math.max(0, head - 0.42);
        const op = String(0.7 * base * UNDER);
        const pre = gB.querySelector<SVGGeometryElement>(`[data-plume-pre="${k}"]`);
        const post = gB.querySelector<SVGGeometryElement>(`[data-plume-post="${k}"]`);
        const mid = gA.querySelector<SVGGeometryElement>(`[data-plume-mid="${k}"]`);
        win(pre, tail, Math.min(head, pl.a0));
        win(mid, Math.max(tail, pl.a0), Math.min(head, pl.a1));
        win(post, Math.max(tail, pl.a1), head);
        if (pre) pre.style.opacity = op;
        if (post) post.style.opacity = op;
        if (mid) mid.style.opacity = String(0.8 * base);
      });
    };

    const tick = () => {
      frame = 0;
      const root = containerRef.current;
      if (!root) return;
      const vh = window.innerHeight;
      const rootTop = root.getBoundingClientRect().top;
      let moving = false;
      episodes.forEach((ep, i) => {
        const { p: target, H } = targetProgress(ep, vh, rootTop);
        // Ease towards the scroll position so motion stays smooth and trackable.
        const cur = shown[i] < 0 ? target : shown[i] + (target - shown[i]) * 0.14;
        shown[i] = Math.abs(target - cur) < 0.0006 ? target : cur;
        if (shown[i] !== target) moving = true;
        draw(ep, i, shown[i], H);
      });
      if (moving) frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      cancelAnimationFrame(frame);
      episodes.forEach((ep) => delete ep.el.dataset.lit);
    };
  }, [enabled, episodes, containerRef]);

  if (!enabled || !size.w) return null;

  const layer = (which: 'below' | 'above') => (
    <svg
      aria-hidden="true"
      width={size.w}
      height={size.h}
      viewBox={`0 0 ${size.w} ${size.h}`}
      className={`pointer-events-none absolute inset-0 ${which === 'below' ? 'z-[1]' : 'z-[3]'}`}
    >
      {episodes.map((ep, i) => {
        const color = STORY_COLORS[ep.kind];
        const ref = (el: SVGGElement | null) => {
          (which === 'below' ? below : above).current[i] = el;
        };
        const bolt = (key: string) => (
          <Fragment key={key}>
            <path data-bolt d={ep.route} fill="none" stroke={color} strokeOpacity={0.28} strokeWidth={5} strokeLinejoin="miter" strokeLinecap="round" />
            <path data-bolt d={ep.route} fill="none" stroke="#FFF1C9" strokeWidth={1.8} strokeLinejoin="miter" strokeLinecap="round" />
          </Fragment>
        );
        return (
          <g key={i} ref={ref} style={{ display: 'none' }}>
            {ep.kind === 'power' &&
              (which === 'below' ? (
                <>
                  <path data-leader d={ep.route} fill="none" stroke={color} strokeWidth={1} />
                  {bolt('b')}
                </>
              ) : (
                <>
                  {bolt('a')}
                  {ep.branches!.map((b, k) => (
                    <path key={k} data-branch d={b} fill="none" stroke={color} strokeWidth={1.1} strokeLinecap="round" />
                  ))}
                  <ellipse data-flash cx={ep.touch[0]} cy={ep.touch[1]} rx={4} ry={3} fill="none" stroke={color} strokeWidth={1.6} />
                </>
              ))}
            {ep.kind === 'water' &&
              ep.drops!.map((_, k) => (
                <g key={k}>
                  <line data-drop stroke={color} strokeWidth={2.2} strokeLinecap="round" style={{ opacity: 0 }} />
                  {which === 'above' && <ellipse data-splash fill="none" stroke={color} strokeWidth={1.2} style={{ opacity: 0 }} />}
                </g>
              ))}
            {ep.kind === 'data' && (
              <>
                {which === 'below' ? (
                  <>
                    <path data-pre d={ep.route} fill="none" stroke={color} strokeOpacity={0.5} strokeWidth={1.2} strokeLinejoin="round" />
                    <path data-post d={ep.route} fill="none" stroke={color} strokeOpacity={0.5} strokeWidth={1.2} strokeLinejoin="round" />
                    {ep.corners!.map(({ at: [x, y] }, k) => (
                      <rect key={k} data-corner x={x - 2} y={y - 2} width={4} height={4} fill={color} fillOpacity={0.55} style={{ opacity: 0 }} />
                    ))}
                  </>
                ) : (
                  <path data-mid d={ep.route} fill="none" stroke={color} strokeOpacity={0.85} strokeWidth={1.6} strokeLinejoin="round" />
                )}
                {['1011', '0110', '1101', '0010'].map((bits, k) => (
                  <text key={k} data-packet textAnchor="middle" className="font-mono text-[10px] font-bold" fill={color} style={{ opacity: 0 }}>
                    {bits}
                  </text>
                ))}
              </>
            )}
            {ep.kind === 'heat' &&
              ep.plumes!.map((pl, k) =>
                which === 'below' ? (
                  <Fragment key={k}>
                    <path data-plume-pre={k} d={pl.d} fill="none" stroke={color} strokeWidth={1.7 - k * 0.3} strokeLinecap="round" />
                    <path data-plume-post={k} d={pl.d} fill="none" stroke={color} strokeWidth={1.7 - k * 0.3} strokeLinecap="round" />
                  </Fragment>
                ) : (
                  <path key={k} data-plume-mid={k} d={pl.d} fill="none" stroke={color} strokeWidth={2 - k * 0.3} strokeLinecap="round" />
                ),
              )}
          </g>
        );
      })}
    </svg>
  );

  return (
    <>
      {layer('below')}
      {layer('above')}
    </>
  );
}
