import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Heading } from '../typography/Typography';

export interface SectorFilterCardProps {
  title: string;
  isActive: boolean;
  isDimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

/**
 * Frosted-glass prioritization control for the project gallery below it
 * (selecting a category reorders the gallery, it never hides other
 * projects) — MENASCO-blue typography on a refined glass panel ties this
 * control into the same brand accent used for links/nav elsewhere, rather
 * than relying on the glass tint alone to read as "on-brand".
 */
export function SectorFilterCard({
  title,
  isActive,
  isDimmed,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: SectorFilterCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      onClick={onSelect}
      aria-pressed={isActive}
      initial={false}
      whileHover={reducedMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.28, ease: EASE }}
      className={cn(
        'group relative flex h-24 w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-md border px-6 text-center backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:h-28',
        isActive
          ? 'border-brand-500/60 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_10px_28px_-10px_rgba(28,183,240,0.35)]'
          : 'border-black/[0.08] bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_1px_3px_rgba(10,11,13,0.04)] hover:border-brand-400/50 hover:bg-white/60 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_24px_-12px_rgba(10,11,13,0.12)]',
        isDimmed && 'opacity-60',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/[0.03]"
      />

      <Heading
        level="h4"
        as="h3"
        className={cn(
          'relative z-10 max-w-[22ch] font-bold text-brand-600 transition-colors duration-300',
          !isActive && 'group-hover:text-brand-700',
        )}
      >
        {title}
      </Heading>
    </motion.button>
  );
}
