import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface UseScrollFrameAnimationOptions {
  frameFolder: string;
  frameCount: number;
  frameFormat?: string;
  /** Zero-padded digit width in frame filenames, e.g. 3 for "frame-007.jpg". */
  framePad?: number;
  /** Skips ScrollTrigger/pin setup entirely — used for prefers-reduced-motion. */
  disabled?: boolean;
  /**
   * Fraction (0–1) of the pinned scroll range reserved for an opening beat
   * before the sequence starts advancing — frame 1 holds for that portion,
   * then frames 1..frameCount map to the remaining scroll range.
   */
  introHoldFraction?: number;
  /**
   * Forces the window to scroll position 0 right after the pin trigger is
   * created — only appropriate when this sequence owns the whole page (the
   * 'full' mode standalone project page), never when it's embedded mid-page.
   * See the comment above the ScrollTrigger.create() call for why this is
   * needed at all.
   */
  resetScrollOnMount?: boolean;
  /**
   * Scroll-progress thresholds (0–1, ascending) at which each milestone
   * becomes active. Passed in so this hook can decide internally when the
   * *visible* state actually changes, instead of the caller re-rendering on
   * every fractional scroll tick — see the isIntro/activeIndex state below.
   */
  milestoneStartProgress: number[];
  /**
   * When true, scroll progress 0 shows the LAST frame and progress 1 shows
   * the FIRST frame — i.e. the sequence plays backward as the user scrolls
   * down, without touching the underlying frame files or milestone progress
   * thresholds (those still key off storyProgress, not frame index).
   */
  reverse?: boolean;
}

// How far ahead/behind the current target frame counts as "nearby" — always
// requested at 'high' fetch priority regardless of what else is in flight.
// With the full-sequence background fill below, this radius only matters
// during the first few seconds after mount (or right after a very fast
// fling lands somewhere the background fill hasn't reached yet); once the
// whole sequence has loaded, every index is already cached.
const NEARBY_RADIUS = 15;

// Immediate (not idle-deferred) coverage on mount: every Nth frame gets
// requested right away, in addition to the first/last frame and the nearby
// window around the starting index — so a fast scroll anywhere in the
// sequence always has *some* already-decoded frame within a few indices to
// fall back to (see findNearestReady) instead of freezing until the exact
// requested frame's network round-trip finishes.
const KEYFRAME_STRIDE = 10;

// Frames per idle-callback batch for the background full-sequence fill —
// small enough that each batch's decode work doesn't itself cause a
// noticeable pause if it lands during an active scroll.
const BACKGROUND_BATCH_SIZE = 12;

function frameUrl(frameFolder: string, index: number, framePad: number, frameFormat: string) {
  return `${frameFolder}/frame-${String(index).padStart(framePad, '0')}.${frameFormat}`;
}

/** Sets `fetchPriority` where the browser supports it (Chrome/Edge/Firefox/Safari all do as of 2024); silently a no-op elsewhere — a hint, not a requirement, so unsupported browsers just fall back to default scheduling. */
function setFetchPriority(img: HTMLImageElement, priority: 'high' | 'low') {
  if ('fetchPriority' in img) {
    (img as HTMLImageElement & { fetchPriority: string }).fetchPriority = priority;
  }
}

function activeMilestoneIndex(thresholds: number[], storyProgress: number) {
  let index = 0;
  thresholds.forEach((start, i) => {
    if (storyProgress >= start) index = i;
  });
  return index;
}

/** Crops+scales an image to fill the canvas exactly (CSS `object-fit: cover` equivalent). */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvasWidth: number, canvasHeight: number) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;
  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;

  if (imgRatio > canvasRatio) {
    sh = img.naturalHeight;
    sw = sh * canvasRatio;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / canvasRatio;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);
}

/**
 * Drives a canvas frame sequence directly from scroll position — scroll is
 * the sole authority over which frame is showing, with no eased "catch up"
 * animation: GSAP ScrollTrigger (`scrub: true`, no built-in delay) updates a
 * progress ref on every scroll tick, and a requestAnimationFrame loop reads
 * that same raw value each frame purely to throttle canvas draws to once per
 * paint (never to more than once per rAF, and never introducing lag of its
 * own) — stop scrolling and the frame freezes on whatever the exact scroll
 * position maps to; reverse by a pixel and it reverses by the corresponding
 * fraction of a frame. The whole sequence is loaded+decoded progressively in
 * the background (not just a rolling window around the current frame), so
 * by the time a user is actively scrubbing, nearly every index is already
 * resident; the nearby-window/keyframe preloading below exists for the
 * brief window before that background fill completes.
 *
 * Frame readiness pipeline is NETWORK FETCH → DECODE → READY → CANVAS DRAW,
 * not fetch → ready → decode-during-draw: a frame is only marked paint-ready
 * once `img.decode()` resolves, so the (comparatively expensive) decode
 * never happens for the first time on the canvas draw call itself, which is
 * exactly where a decode stall reads as a scroll stutter. If the exact
 * target frame isn't ready yet, the nearest already-decoded frame is drawn
 * instead (see findNearestReady) — the canvas never freezes waiting on one
 * specific frame while the rest of the sequence is sitting there decoded.
 */
export function useScrollFrameAnimation({
  frameFolder,
  frameCount,
  frameFormat = 'jpg',
  framePad = 3,
  disabled = false,
  introHoldFraction = 0,
  resetScrollOnMount = false,
  milestoneStartProgress,
  reverse = false,
}: UseScrollFrameAnimationOptions) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Raw scroll-derived progress (0–1) — a ref, never React state: a
  // fractional update on every scroll tick would force a full re-render,
  // competing with the canvas redraw for main-thread time. Set directly from
  // ScrollTrigger's onUpdate and read as-is (no easing) by the rAF draw
  // loop below — scroll position is the only authority over which frame
  // shows. React state below only updates on the much rarer occasions when
  // isIntro or activeIndex actually change, since those are the only two
  // things this section's JSX renders differently based on.
  const progressRef = useRef(0);
  const [milestoneState, setMilestoneState] = useState({ isIntro: introHoldFraction > 0, activeIndex: 0 });

  const cacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const readyRef = useRef<Set<number>>(new Set());
  const currentIndexRef = useRef(1);
  const drawnIndexRef = useRef(0);

  useEffect(() => {
    if (disabled) return;

    // GSAP's ScrollTrigger records the scroll position when it initializes
    // and re-applies it during its own internal refresh, synchronously,
    // inside ScrollTrigger.create() — including on a page that was scrolled
    // deep down a moment ago (e.g. arriving here from the homepage's
    // Featured Projects section), where it re-applies that leftover
    // position even after RootLayout's own route-change effect has already
    // reset scroll to the top, landing the story mid-sequence instead of at
    // frame 1. clearScrollMemory() reduces how often that happens; the
    // authoritative fix is the resetScrollOnMount correction after create()
    // below, since GSAP's own corrections are proven (by testing) to always
    // finish before create() returns.
    ScrollTrigger.clearScrollMemory();

    const cache = cacheRef.current;
    const ready = readyRef.current;

    // Reassigned further down, once the Stage B gating logic exists — see
    // markReady() inside loadFrame() below for why this needs to be a
    // mutable forward reference rather than a plain function declared in
    // call order.
    let notifyFrameReady: (index: number) => void = () => {};

    const drawFrame = (index: number) => {
      const canvas = canvasRef.current;
      const img = cache.get(index);
      if (!canvas || !img || !ready.has(index)) return;
      if (drawnIndexRef.current === index) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCover(ctx, img, canvas.width, canvas.height);
      drawnIndexRef.current = index;
    };

    // Never leaves the canvas blank or frozen on a stale frame for lack of
    // the *exact* requested index: searches outward (target, target±1,
    // target±2, ...) for the closest index that has already finished
    // loading+decoding. In steady state (once the background fill below has
    // caught up) this always returns `target` itself.
    const findNearestReady = (target: number): number | null => {
      if (ready.has(target)) return target;
      for (let offset = 1; offset < frameCount; offset += 1) {
        const lo = target - offset;
        const hi = target + offset;
        if (lo >= 1 && ready.has(lo)) return lo;
        if (hi <= frameCount && ready.has(hi)) return hi;
        if (lo < 1 && hi > frameCount) break;
      }
      return null;
    };

    const loadFrame = (index: number, priority: 'high' | 'low' = 'high') => {
      if (index < 1 || index > frameCount || cache.has(index)) return;
      const img = new Image();
      img.decoding = 'async';
      setFetchPriority(img, priority);
      img.src = frameUrl(frameFolder, index, framePad, frameFormat);
      cache.set(index, img);

      const markReady = () => {
        if (!cache.has(index)) return; // shouldn't happen — cache is never evicted — but guards a stale closure regardless
        ready.add(index);
        // The frame that just became ready might not be the current target,
        // but could now be a closer fallback than whatever's on screen —
        // let requestFrame's nearest-ready search re-evaluate either way.
        const nearest = findNearestReady(currentIndexRef.current);
        if (nearest !== null) drawFrame(nearest);
        notifyFrameReady(index);
      };

      // decode() resolves once the image is both downloaded AND decoded —
      // this is what makes the pipeline fetch → decode → ready → draw
      // instead of fetch → ready → decode-during-draw. Broadly supported;
      // for the rare engine without it, fall back to the 'load' event alone
      // (which only guarantees download, not decode, but is still strictly
      // better than nothing).
      if (typeof img.decode === 'function') {
        img.decode().then(markReady).catch(() => {
          // decode() rejects both on a genuine load failure and, in a few
          // older engine versions, spuriously even after a good load — only
          // treat it as ready if the image actually finished loading.
          if (img.complete && img.naturalWidth > 0) markReady();
        });
      } else {
        img.addEventListener('load', markReady, { once: true });
      }
    };

    const requestFrame = (index: number) => {
      const clamped = Math.min(frameCount, Math.max(1, index));
      currentIndexRef.current = clamped;

      for (let offset = 0; offset <= NEARBY_RADIUS; offset += 1) {
        loadFrame(clamped + offset, 'high');
        if (offset > 0) loadFrame(clamped - offset, 'high');
      }

      const nearest = findNearestReady(clamped);
      if (nearest !== null) drawFrame(nearest);
      // else: nothing decoded yet anywhere nearby (only possible in the
      // first instants after mount) — whatever the canvas already shows
      // (nothing, pre-first-paint) stays until the very first frame lands.
    };

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      drawnIndexRef.current = 0;
      const nearest = findNearestReady(currentIndexRef.current);
      if (nearest !== null) drawFrame(nearest);
    };

    resizeCanvas();

    // Immediate (not idle-deferred) coverage, fired synchronously on mount
    // rather than waiting for the first scroll or rAF tick: the frame the
    // section actually opens on, the opposite end of the sequence, and a
    // sparse set of keyframes spanning the whole range — so even a very
    // fast scroll to somewhere the background fill hasn't reached yet still
    // lands near an already-decoded frame instead of a long freeze.
    const initialIndex = reverse ? frameCount : 1;
    const oppositeEndIndex = reverse ? 1 : frameCount;
    loadFrame(initialIndex, 'high');
    loadFrame(oppositeEndIndex, 'high');
    for (let i = 1; i <= frameCount; i += KEYFRAME_STRIDE) {
      loadFrame(i, 'low');
    }
    requestFrame(initialIndex);

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvasRef.current) resizeObserver.observe(canvasRef.current);

    // Background full-sequence fill — decodes and caches every remaining
    // frame (not just a rolling window), so the sequence keeps getting more
    // complete the longer the page sits open, independent of scroll. Two-
    // stage, gated on two independent signals (see the Stage B block
    // below):
    //
    //  STAGE A (this component's own mount): nothing extra beyond the
    //  immediate keyframe/nearby-window loads above — do not hammer the
    //  network with the whole sequence before the frames actually needed
    //  right now have had a real chance to load.
    //
    //  STAGE B: fires once the section is within ~1.5 viewports of view AND
    //  the initial nearby-frame window has actually settled — in 'full'
    //  mode (the standalone Vela/Qiddiya project pages) proximity is true
    //  almost immediately, so in practice Stage B there is gated by the
    //  settle condition alone; in 'feature' mode (embedded mid-page) it
    //  also waits for real scroll proximity.
    const idleRequest = window.requestIdleCallback?.bind(window);
    const idleCancel = window.cancelIdleCallback?.bind(window);

    let fillCancelled = false;
    let fillHandle: number | undefined;
    let fallbackTimeoutHandle: number | undefined;
    const fillRemaining = (start: number) => {
      if (fillCancelled) return;
      const end = Math.min(frameCount, start + BACKGROUND_BATCH_SIZE - 1);
      for (let i = start; i <= end; i += 1) {
        loadFrame(i, 'low');
      }
      if (end < frameCount) {
        const scheduleNext = () => fillRemaining(end + 1);
        fillHandle = idleRequest ? idleRequest(scheduleNext, { timeout: 150 }) : window.setTimeout(scheduleNext, 60);
      }
    };

    // navigator.connection is Chromium-only and intentionally treated as a
    // soft hint, not a bandwidth engine — Save-Data on just keeps the
    // existing conservative nearby-window loading (no aggressive full-
    // sequence fill), everyone else gets Stage B once they're near the
    // section.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const saveData = connection?.saveData === true;

    // Stage B needs BOTH signals before it fires, not just proximity: in
    // 'full' mode this pinned section is the first thing on the page, so
    // the IntersectionObserver below fires almost immediately on mount —
    // gating on proximity alone would flood the connection pool with the
    // full-sequence fill before the immediate keyframe/nearby-window loads
    // above have even won a connection slot, which is exactly the "hammer
    // the network while the page is still loading" failure mode Stage A
    // exists to avoid.
    //
    // The gate is "has the initial nearby-frame window around the starting
    // index actually finished loading+decoding" — tied to this component's
    // own requests, not a generic page-load signal (window 'load' does NOT
    // work here: this component is itself behind a lazy route chunk, so by
    // the time it mounts and fires its first frame requests, 'load' has
    // often already fired for the surrounding page shell, giving zero real
    // delay — confirmed by testing). A capped fallback timer exists only so
    // a genuine request failure can't block Stage B forever.
    const initialWindowStart = Math.max(1, initialIndex - NEARBY_RADIUS);
    const initialWindowEnd = Math.min(frameCount, initialIndex + NEARBY_RADIUS);
    let stageBTriggered = false;
    let nearSection = false;
    let initialWindowSettled = false;

    const maybeStartStageB = () => {
      if (stageBTriggered || saveData || !nearSection || !initialWindowSettled) return;
      stageBTriggered = true;
      fillRemaining(1);
    };

    notifyFrameReady = () => {
      if (initialWindowSettled) return;
      for (let i = initialWindowStart; i <= initialWindowEnd; i += 1) {
        if (!ready.has(i)) return;
      }
      initialWindowSettled = true;
      maybeStartStageB();
    };

    fallbackTimeoutHandle = window.setTimeout(() => {
      initialWindowSettled = true;
      maybeStartStageB();
    }, 2000);

    let approachObserver: IntersectionObserver | null = null;
    if (!saveData && wrapperRef.current && typeof IntersectionObserver !== 'undefined') {
      approachObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            nearSection = true;
            maybeStartStageB();
          }
        },
        // Grows the root's bottom edge by 1.5 viewport heights, so this
        // fires once the section is within ~1.5 viewports of actually being
        // visible while scrolling down toward it — not only once it's
        // already on screen.
        { rootMargin: '0px 0px 150% 0px', threshold: 0 },
      );
      approachObserver.observe(wrapperRef.current);
    } else if (!saveData) {
      // No IntersectionObserver support (very old browser) — proximity is
      // unknowable, so just treat "near" as immediately true; the initial-
      // window-settled gate above still protects against hammering the
      // network before the starting frame has had its turn.
      nearSection = true;
      maybeStartStageB();
    }

    let trigger: ScrollTrigger | null = null;
    if (wrapperRef.current && pinRef.current) {
      trigger = ScrollTrigger.create({
        trigger: wrapperRef.current,
        pin: pinRef.current,
        start: 'top top',
        end: 'bottom bottom',
        // No built-in scrub delay — self.progress reflects raw scroll
        // position exactly, every tick, with no smoothing/easing anywhere
        // in the pipeline: scroll position is the sole authority over the
        // frame index (see progressRef and the rAF draw loop below).
        scrub: true,
        onUpdate: (self) => {
          const storyProgress =
            introHoldFraction > 0
              ? Math.max(0, (self.progress - introHoldFraction) / (1 - introHoldFraction))
              : self.progress;
          progressRef.current = storyProgress;

          // Only these two derived facts affect what the section renders —
          // update React state (and thus re-render) only when one of them
          // actually flips, not on every continuous progress tick.
          const isIntro = introHoldFraction > 0 && self.progress < introHoldFraction;
          const activeIndex = isIntro ? 0 : activeMilestoneIndex(milestoneStartProgress, storyProgress);
          setMilestoneState((prev) =>
            prev.isIntro === isIntro && prev.activeIndex === activeIndex ? prev : { isIntro, activeIndex },
          );
        },
      });

      // ScrollTrigger.create() above can, synchronously as part of its own
      // init/refresh, re-apply a scroll position left over from before this
      // route was mounted (see the comment above clearScrollMemory()) — this
      // re-asserts the top-of-page position GSAP's own scroll listener then
      // picks up immediately after, updating progress back to frame 1/0.
      if (resetScrollOnMount) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    // GSAP batches a second, deferred refresh pass shortly after a trigger is
    // created (its own internal _queueRefreshAll, for performance — see GSAP
    // source), which repeats the same stale-position restore as above but
    // asynchronously, after the synchronous correction already ran. GSAP
    // dispatches its own "refresh" event once that settles, so hooking that
    // (once, then unsubscribing) reliably lands our correction after GSAP is
    // truly done — not a guessed delay, but GSAP's own completion signal.
    const handleRefresh = () => {
      if (resetScrollOnMount) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      ScrollTrigger.removeEventListener('refresh', handleRefresh);
    };
    if (resetScrollOnMount) ScrollTrigger.addEventListener('refresh', handleRefresh);

    // The single rAF loop that owns every visual update — purely a draw-
    // rate throttle (never more than once per paint), not a source of
    // motion of its own: it reads the current raw progressRef value as-is
    // every tick, with no easing toward it, so the frame index is always
    // exactly what the current scroll position maps to. requestFrame itself
    // only touches the canvas if the resolved index actually differs from
    // what's already drawn (see drawFrame's drawnIndexRef check), so a
    // stationary scroll position costs nothing per tick beyond the check.
    let rafId = requestAnimationFrame(function tick() {
      const storyProgress = progressRef.current;
      const forwardIndex = Math.round(1 + storyProgress * (frameCount - 1));
      const index = reverse ? frameCount + 1 - forwardIndex : forwardIndex;
      requestFrame(index);

      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.removeEventListener('refresh', handleRefresh);
      trigger?.kill();
      resizeObserver.disconnect();
      approachObserver?.disconnect();
      cache.clear();
      ready.clear();
      fillCancelled = true;
      if (idleCancel && fillHandle !== undefined) {
        idleCancel(fillHandle);
      } else if (fillHandle !== undefined) {
        window.clearTimeout(fillHandle);
      }
      if (fallbackTimeoutHandle !== undefined) window.clearTimeout(fallbackTimeoutHandle);
    };
  }, [disabled, frameFolder, frameCount, frameFormat, framePad, introHoldFraction, resetScrollOnMount, milestoneStartProgress, reverse]);

  return { wrapperRef, pinRef, canvasRef, isIntro: milestoneState.isIntro, activeIndex: milestoneState.activeIndex };
}
