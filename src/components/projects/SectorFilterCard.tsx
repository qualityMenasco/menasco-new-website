import { cn } from '../../lib/utils';

export interface SectorFilterCardProps {
  title: string;
  /** e.g. "84 Featured Projects", shown under the title. */
  count?: string;
  isActive: boolean;
  isDimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}

/**
 * One sector tab in the Project Portfolio filter row (desktop/tablet).
 * Selecting it reorders the gallery below (it never hides other projects).
 * Plain text tab, no box: sector name with its featured-project count beneath,
 * and its own underline: grey for each sector, MENASCO blue for the selected
 * one (client request 2026-11-23). Separate lines per tab, no full-width rule.
 */
export function SectorFilterCard({ title, count, isActive, isDimmed, onHoverStart, onHoverEnd, onSelect }: SectorFilterCardProps) {
  return (
    <button
      type="button"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      onClick={onSelect}
      aria-pressed={isActive}
      className={cn(
        'group relative flex w-full flex-col items-start gap-1 border-b-2 pb-4 pt-2 text-start transition-[color,border-color,opacity] duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        isActive ? 'border-brand-600' : 'border-gray-300 hover:border-gray-400',
        isDimmed && !isActive && 'opacity-60',
      )}
    >
      <span className={cn('font-display text-body font-semibold leading-snug transition-colors duration-base', isActive ? 'text-brand-600' : 'text-ink group-hover:text-brand-700')}>
        {title}
      </span>
      {count && <span className="text-small text-gray-500">{count}</span>}
    </button>
  );
}
