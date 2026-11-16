import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
 */
export function SectorFilterChips({ options, activeSlug, onSelect }: SectorFilterChipsProps) {
  const { t } = useTranslation('projects');
  const reducedMotion = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);

  const ordered = activeSlug
    ? [...options.filter((option) => option.slug === activeSlug), ...options.filter((option) => option.slug !== activeSlug)]
    : options;

  useEffect(() => {
    rowRef.current?.scrollTo({ left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [activeSlug, reducedMotion]);

  const chip = (active: boolean) =>
    cn(
      'shrink-0 rounded-full border px-4 py-2 text-small font-semibold transition-colors duration-base',
      active ? 'border-brand-600 bg-brand-600 text-warmwhite' : 'border-gray-300 text-ink',
    );
  const layoutTransition = { duration: reducedMotion ? 0 : 0.3, ease: [0.22, 0.61, 0.36, 1] as const };

  return (
    <div ref={rowRef} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
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
  );
}
