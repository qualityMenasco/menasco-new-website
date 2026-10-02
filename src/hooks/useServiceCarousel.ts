import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Shared interaction logic for the service-detail section carousel (desktop
 * and mobile each render their own markup around this, since the two trees
 * intentionally never share UI-kit components — see src/mobile/*). Native
 * scroll-snap (not a transform slider) gives touch/trackpad/drag support and
 * the slide transition for free; active-card tracking uses getBoundingClientRect
 * overlap on scroll (not IntersectionObserver) — Chromium miscalculates
 * IntersectionObserver ratios inside an RTL horizontally-scrolling container,
 * which froze the active index after the first "next" in Arabic; comparing
 * viewport rects directly is direction-agnostic and sidesteps that bug.
 * ResizeObserver keeps every card at one shared min-height (the tallest
 * section's natural content) so paging never changes page height.
 */
export function useServiceCarousel(sectionCount: number) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const recalc = () => {
      const tallest = cardRefs.current.reduce((max, card) => Math.max(max, card?.scrollHeight ?? 0), 0);
      setCardHeight(tallest || undefined);
    };
    recalc();
    let frame: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(recalc);
    });
    cardRefs.current.forEach((card) => card && observer.observe(card));
    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const recalcActiveIndex = () => {
      const trackRect = track.getBoundingClientRect();
      let bestIndex = 0;
      let bestOverlap = -1;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardRect = card.getBoundingClientRect();
        const overlapWidth = Math.max(0, Math.min(cardRect.right, trackRect.right) - Math.max(cardRect.left, trackRect.left));
        const overlap = cardRect.width > 0 ? overlapWidth / cardRect.width : 0;
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          bestIndex = index;
        }
      });
      setActiveIndex(bestIndex);
    };

    recalcActiveIndex();
    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(recalcActiveIndex);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionCount]);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(sectionCount - 1, index));
    cardRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  return { trackRef, cardRefs, activeIndex, cardHeight, goTo };
}

export interface ServiceCarouselSection {
  heading: string;
  paragraph: string;
  list?: string[];
}

export interface ServiceCarouselImage {
  src: string;
  alt: string;
}
