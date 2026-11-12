import { useCallback, useEffect, useRef, useState } from 'react';
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { interpolateZoom } from 'd3-interpolate';
import { animate, useReducedMotion, type AnimationPlaybackControls } from 'framer-motion';
import type { MultiLineString, MultiPolygon } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { cn } from '../../../lib/utils';
import type { OfficeLocation } from '../../../data/locations';

/**
 * Office globe for the homepage Regional Presence section.
 *
 * An orthographic (globe) projection drawn on a canvas, resting on a semi
 * close-up of the selected office. Moving between offices uses the same
 * camera path as MapLibre/Mapbox `flyTo` — van Wijk & Nuij's "smooth and
 * efficient zooming and panning", which d3 ships as `interpolateZoom`: the
 * camera pulls back as it starts moving, travels at a steady perceived speed,
 * then zooms back in, with the duration derived from the distance. The pan
 * component is applied as a rotation along the great circle between the two
 * offices, so it reads as travelling across the globe, not cutting between
 * views. Pins are real buttons overlaid on the canvas and repositioned every
 * frame, so they stay clickable and accessible.
 */

/** Resting zoom: globe radius as a multiple of the frame width (semi close-up). */
const REST_SCALE = 0.62;
/**
 * Viewing tilt, in degrees. The globe is turned so the selected office sits
 * this far north of the globe's centre, and the globe is shifted down by the
 * same amount, keeping the office in the middle of the frame while the
 * curved horizon arcs across the top — like looking across the Earth from
 * orbit rather than straight down at a flat map.
 */
const TILT_DEG = 35;
const TILT_SIN = Math.sin((TILT_DEG * Math.PI) / 180);

type Detail = { land: MultiPolygon; borders: MultiLineString };
/** `fine` (1:50m) at rest; `coarse` (1:110m) while flying, so every frame stays cheap to draw. */
type World = { fine: Detail; coarse: Detail };

let worldPromise: Promise<World> | null = null;
/** Natural Earth 1:50m countries (world-atlas), loaded once, only when the globe is near the viewport. */
function loadWorld(): Promise<World> {
  worldPromise ??= Promise.all([
    import('world-atlas/countries-50m.json'),
    import('world-atlas/countries-110m.json'),
    import('topojson-client'),
  ]).then(([fine, coarse, topojson]) => {
    const toDetail = (data: unknown): Detail => {
      const world = data as Topology<{ countries: GeometryCollection }>;
      const countries = world.objects.countries;
      return {
        land: topojson.merge(world, countries.geometries as never) as MultiPolygon,
        borders: topojson.mesh(world, countries, (a, b) => a !== b) as MultiLineString,
      };
    };
    return { fine: toDetail(fine.default), coarse: toDetail(coarse.default) };
  });
  return worldPromise;
}

const graticule = geoGraticule10();

/** The globe's fixed palette ("Arctic"): white land on a cool pale sea, brand-blue route, navy pins. */
const COLORS = {
  // Sea and coastline carry the land/water contrast — tuned (2026-11-12) so
  // shapes stay legible on bright or low-contrast displays, where the white
  // land and a paler sea used to merge.
  ocean: '#e3eaf0',
  land: '#ffffff',
  coastline: '#8fa3b3',
  borders: '#dde4e9',
  grid: '#d5dee6',
  glowInner: 'rgba(159, 179, 193, 0.14)',
  glowOuter: 'rgba(159, 179, 193, 0)',
  route: '#0c76a3',
  pin: '#0c4d6c',
  pinPulse: 'rgba(12, 77, 108, 0.35)',
};

export interface OfficeGlobePin {
  office: OfficeLocation;
  /** Accessible name, e.g. "Cairo, Egypt". */
  label: string;
  /** Visible tag beside the selected pin, e.g. "CAIRO, EGYPT". */
  tag: string;
  /** Small coordinate line under the tag. */
  coordinates: string;
}

export interface OfficeGlobeProps {
  pins: OfficeGlobePin[];
  selectedId: string;
  onSelect: (id: string) => void;
  headOfficeLabel: string;
  className?: string;
}

type LngLat = [number, number];

export function OfficeGlobe({ pins, selectedId, onSelect, headOfficeLabel, className }: OfficeGlobeProps) {
  const reducedMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinRefs = useRef(new Map<string, HTMLButtonElement>());
  const labelRef = useRef<HTMLDivElement>(null);
  const [world, setWorld] = useState<World | null>(null);

  const selected = pins.find((pin) => pin.office.id === selectedId) ?? pins[0];

  // Camera state lives in refs: it changes every animation frame.
  const centerRef = useRef<LngLat>([selected.office.lng, selected.office.lat]);
  const scaleRef = useRef(REST_SCALE);
  const routeRef = useRef<{ from: LngLat; to: LngLat; progress: number; opacity: number } | null>(null);
  const flightRef = useRef<AnimationPlaybackControls | null>(null);
  const flyingRef = useRef(false);
  const fadeRef = useRef<AnimationPlaybackControls | null>(null);
  const worldRef = useRef<World | null>(null);
  worldRef.current = world;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const center = centerRef.current;
    // Zoom is relative to the frame as if it were 16:10, so a taller frame
    // (tablet, matched to the office card) shows a bigger globe, not a small
    // one floating in empty space.
    const radius = scaleRef.current * Math.max(width, height * 1.6);
    const cx = width / 2;
    const cy = height / 2 + radius * TILT_SIN;
    const projection = geoOrthographic()
      .translate([cx, cy])
      .scale(radius)
      .rotate([-center[0], -(center[1] - TILT_DEG)])
      .clipAngle(90)
      .precision(0.4);
    const path = geoPath(projection, ctx);
    const stroke = (object: GeoPermissibleObjects, color: string, lineWidth: number) => {
      ctx.beginPath();
      path(object);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    // Soft atmosphere just outside the globe's edge.
    const halo = ctx.createRadialGradient(cx, cy, radius * 0.96, cx, cy, radius * 1.08);
    halo.addColorStop(0, COLORS.glowInner);
    halo.addColorStop(1, COLORS.glowOuter);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = COLORS.ocean;
    ctx.fill();

    stroke(graticule, COLORS.grid, 1);

    const current = worldRef.current ? (flyingRef.current ? worldRef.current.coarse : worldRef.current.fine) : null;
    if (current) {
      ctx.beginPath();
      path(current.land);
      ctx.fillStyle = COLORS.land;
      ctx.fill();
      ctx.strokeStyle = COLORS.coastline;
      ctx.lineWidth = 1;
      ctx.stroke();
      stroke(current.borders, COLORS.borders, 0.6);
    }

    // Shading toward the limb sells the curvature.
    const shade = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
    shade.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shade.addColorStop(0.75, 'rgba(255, 255, 255, 0)');
    shade.addColorStop(1, 'rgba(17, 17, 17, 0.07)');
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = shade;
    ctx.fill();
    stroke({ type: 'Sphere' }, 'rgba(17, 17, 17, 0.08)', 1);

    // Travel route, drawn progressively along the great circle.
    const route = routeRef.current;
    if (route && route.opacity > 0 && route.progress > 0) {
      const along = geoInterpolate(route.from, route.to);
      const steps = 64;
      const coordinates: LngLat[] = [];
      for (let i = 0; i <= steps; i++) coordinates.push(along((i / steps) * route.progress) as LngLat);
      ctx.save();
      ctx.globalAlpha = route.opacity;
      ctx.setLineDash([5, 5]);
      ctx.lineCap = 'round';
      stroke({ type: 'LineString', coordinates }, COLORS.route, 1.6);
      ctx.restore();
    }

    // Reposition the overlay pins + the selected pin's label.
    const visibleLimit = Math.PI / 2 - 0.02;
    pinRefs.current.forEach((element, id) => {
      const pin = pins.find((entry) => entry.office.id === id);
      if (!pin) return;
      const lngLat: LngLat = [pin.office.lng, pin.office.lat];
      const point = projection(lngLat);
      const onFront = geoDistance(lngLat, [center[0], center[1] - TILT_DEG]) < visibleLimit;
      const inFrame = point && point[0] > -20 && point[0] < width + 20 && point[1] > -20 && point[1] < height + 20;
      const show = Boolean(point && onFront && inFrame);
      element.style.visibility = show ? 'visible' : 'hidden';
      if (point) element.style.transform = `translate(${point[0]}px, ${point[1]}px) translate(-50%, -50%)`;
      if (id === selectedIdRef.current && labelRef.current) {
        // The label appears once the globe arrives, not while travelling.
        labelRef.current.style.visibility = show && !flyingRef.current ? 'visible' : 'hidden';
        if (point) labelRef.current.style.transform = `translate(${point[0]}px, ${point[1]}px)`;
      }
    });
  }, [pins]);

  // Load the coastline data once the globe is close to the viewport.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let cancelled = false;
    const start = () => loadWorld().then((loaded) => !cancelled && setWorld(loaded)).catch(() => undefined);
    if (!('IntersectionObserver' in window)) {
      start();
      return () => { cancelled = true; };
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        start();
      }
    }, { rootMargin: '600px' });
    observer.observe(frame);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  // Redraw on data load and whenever the frame resizes.
  useEffect(() => {
    draw();
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(frame);
    return () => observer.disconnect();
  }, [draw, world]);

  // Fly to the newly selected office.
  useEffect(() => {
    const target: LngLat = [selected.office.lng, selected.office.lat];
    const from = centerRef.current;
    const startScale = scaleRef.current;
    const distance = geoDistance(from, target);
    flightRef.current?.stop();
    fadeRef.current?.stop();

    if (distance < 1e-4 && Math.abs(startScale - REST_SCALE) < 1e-3) {
      draw();
      return;
    }
    if (reducedMotion) {
      centerRef.current = target;
      scaleRef.current = REST_SCALE;
      routeRef.current = null;
      draw();
      return;
    }

    // `interpolateZoom` works in "world units": pan distance and view width.
    // Here the pan is the arc length in radians and the view width is the
    // arc the frame spans, frameWidth / radius = 1 / scale.
    const zoom = interpolateZoom([0, 0, 1 / startScale], [distance, 0, 1 / REST_SCALE]);
    const along = geoInterpolate(from, target);
    const duration = Math.min(Math.max(zoom.duration * 1.1, 900), 2800) / 1000;
    routeRef.current = { from, to: target, progress: 0, opacity: 1 };
    flyingRef.current = true;

    flightRef.current = animate(0, 1, {
      duration,
      // MapLibre's default flyTo easing.
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (t) => {
        const [panned, , viewWidth] = zoom(t);
        const fraction = distance > 0 ? panned / distance : 1;
        centerRef.current = along(fraction) as LngLat;
        scaleRef.current = 1 / viewWidth;
        if (routeRef.current) routeRef.current.progress = fraction;
        draw();
      },
      onComplete: () => {
        centerRef.current = target;
        scaleRef.current = REST_SCALE;
        flyingRef.current = false;
        draw();
        // Let the route linger briefly, then fade it out.
        fadeRef.current = animate(1, 0, {
          duration: 0.8,
          delay: 0.6,
          onUpdate: (opacity) => {
            if (routeRef.current) routeRef.current.opacity = opacity;
            draw();
          },
          onComplete: () => {
            routeRef.current = null;
            draw();
          },
        });
      },
    });
    return () => {
      flightRef.current?.stop();
      fadeRef.current?.stop();
      flyingRef.current = false;
    };
    // Only the selection (and motion preference) should start a flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.office.id, reducedMotion]);

  return (
    <div ref={frameRef} className={cn('relative overflow-hidden', className)}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {pins.map((pin) => {
        const isSelected = pin.office.id === selectedId;
        return (
          <button
            key={pin.office.id}
            ref={(element) => {
              if (element) pinRefs.current.set(pin.office.id, element);
              else pinRefs.current.delete(pin.office.id);
            }}
            type="button"
            aria-label={pin.label}
            aria-pressed={isSelected}
            onClick={() => onSelect(pin.office.id)}
            style={{ visibility: 'hidden' }}
            className="group absolute left-0 top-0 flex h-8 w-8 items-center justify-center focus-visible:outline-none"
          >
            {isSelected && !reducedMotion && (
              <span className="absolute h-5 w-5 animate-ping rounded-full" style={{ backgroundColor: COLORS.pinPulse }} aria-hidden="true" />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'relative rounded-full ring-warmwhite transition-all duration-300 ease-engineered group-focus-visible:ring-brand-500',
                isSelected ? 'h-3.5 w-3.5 ring-4' : 'h-2.5 w-2.5 ring-2 group-hover:scale-125',
              )}
              style={{ backgroundColor: COLORS.pin }}
            />
          </button>
        );
      })}

      {/* Label for the selected office, following its pin. */}
      <div ref={labelRef} aria-hidden="true" style={{ visibility: 'hidden' }} className="pointer-events-none absolute left-0 top-0" dir="ltr">
        <div className="ms-5 -translate-y-1/2 whitespace-nowrap rounded-sm bg-warmwhite/85 px-2 py-1 shadow-sm backdrop-blur-sm">
          {selected.office.isHeadquarters && (
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-brand-600">{headOfficeLabel}</span>
          )}
          <span className="block font-display text-small font-semibold uppercase tracking-wide text-ink">{selected.tag}</span>
          <span className="block font-mono text-[11px] font-medium tracking-tight text-brand-600/80">{selected.coordinates}</span>
        </div>
      </div>
    </div>
  );
}
