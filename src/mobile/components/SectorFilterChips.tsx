import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export interface SectorFilterChipsProps {
  options: { slug: string; title: string }[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

/**
 * Horizontally scrollable, tap-only filter chips — no hover state required,
 * so it works identically on touch. The selected sector moves to the front,
 * right after "All projects" (the rest keep their order), and the row scrolls
 * back to its start so the selection is always in view. Chips glide to their
 * new places (framer-motion layout animation).
 *
 * Mouse users (no trackpad / touch swipe) get previous/next arrow buttons in a
 * small control row at the top right, above the chips (never over them). They
 * render only for fine pointers and only while the row overflows; the arrow
 * for an exhausted direction is disabled. Phones keep the plain swipe row.
 */
export function SectorFilterChips({ options, activeSlug, onSelect }: SectorFilterChipsProps) {
  const { t } = useTranslation(['projects', 'common']);
  const reducedMotion = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  const ordered = activeSlug
    ? [...options.filter((option) => option.slug === activeSlug), ...options.filter((option) => option.slug !== activeSlug)]
    : options;

  // Which edges still hide chips. RTL rows scroll with negative scrollLeft, so use magnitudes.
  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const pos = Math.abs(row.scrollLeft);
    setCanBack(pos > 4);
    setCanForward(max - pos > 4);
  }, []);

  useEffect(() => {
    rowRef.current?.scrollTo({ left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [activeSlug, reducedMotion]);

  useEffect(() => {
    measure();
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [measure, options.length]);

  /** Scroll by most of the visible width, in reading direction. */
  const page = (direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    const rtl = getComputedStyle(row).direction === 'rtl';
    row.scrollBy({ left: direction * (rtl ? -1 : 1) * row.clientWidth * 0.75, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const chip = (active: boolean) =>
    cn(
      'shrink-0 rounded-full border px-4 py-2 text-small font-semibold transition-colors duration-base',
      active ? 'border-brand-600 bg-brand-600 text-warmwhite' : 'border-gray-300 text-ink',
    );
  const layoutTransition = { duration: reducedMotion ? 0 : 0.3, ease: [0.22, 0.61, 0.36, 1] as const };
  const overflows = canBack || canForward;
  const arrow =
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-warmwhite text-ink transition-colors duration-base hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-default disabled:opacity-35 disabled:hover:border-gray-300';

  return (
    <div className="relative">
      {/* Mouse users only (fine pointer), and only when the chips overflow. Sits in the
          empty space at the top right, just above the row, so it adds no height. */}
      {overflows && (
        <div className="absolute bottom-full end-0 mb-3 hidden gap-2 [@media(pointer:fine)]:flex">
          <button type="button" aria-label={t('common:buttons.previous')} onClick={() => page(-1)} disabled={!canBack} className={arrow}>
            <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
          </button>
          <button type="button" aria-label={t('common:buttons.next')} onClick={() => page(1)} disabled={!canForward} className={arrow}>
            <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
          </button>
        </div>
      )}
      <div className="relative">
      <div ref={rowRef} onScroll={measure} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button type="button" onClick={() => onSelect(null)} aria-pressed={activeSlug === null} className={chip(activeSlug === null)}>
          {t('categoriesPage.allProjects')}
        </button>
        {ordered.map((option) => (
          <motion.button
            key={option.slug}
            layout="position"
            transition={layoutTransition}
            type="button"
            onClick={() => onSelect(option.slug)}
            aria-pressed={activeSlug === option.slug}
            className={chip(activeSlug === option.slug)}
          >
            {option.title}
          </motion.button>
        ))}
      </div>
      {/* Soft edge fades hint that the row continues (decorative, never cover a chip's tap target). */}
      {canBack && <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -start-4 w-10 bg-gradient-to-r from-warmwhite to-transparent rtl:bg-gradient-to-l" />}
      {canForward && <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -end-4 w-10 bg-gradient-to-l from-warmwhite to-transparent rtl:bg-gradient-to-r" />}
      </div>
    </div>
  );
}
