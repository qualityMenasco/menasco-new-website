import { Text } from '../typography/Typography';
import { cn } from '../../lib/utils';

export interface ProjectHighlightStat {
  label: string;
  /** Undefined/empty when the underlying project data doesn't have this field yet — never invent a value to fill it. */
  value?: string;
}

export interface ProjectHighlightsProps {
  /** Display order. Historically exactly six (a clean 3×2 grid on desktop); a trailing 7th (or any count not evenly divisible by the grid's column count) spans the final row full-width instead of leaving a narrow orphan cell — see the `isLast` span logic below. */
  stats: ProjectHighlightStat[];
  /** Shown in place of a card's value when the project's data doesn't have that field. */
  pendingLabel: string;
  className?: string;
}

/**
 * Project Highlights grid, shared by every project detail page (cinematic
 * and default templates alike) — see ProjectHighlightsSection in
 * ProjectDetailPage.tsx. Renders every slot in `stats`, regardless of count;
 * unpopulated fields fall back to `pendingLabel` rather than being guessed.
 * When the count isn't a clean multiple of the grid's columns (e.g. 7 stats
 * in a 3-column grid, 3+3+1), the trailing item spans the full row instead
 * of sitting alone as a narrow card — the same modulo-span idiom already
 * used by src/mobile/components/MobileStatsGrid.tsx for its own odd-count
 * case, so this isn't a new pattern on the site.
 */
export function ProjectHighlights({ stats, pendingLabel, className }: ProjectHighlightsProps) {
  return (
    <div className={cn('grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {stats.map((stat, index) => {
        const isLast = index === stats.length - 1;
        return (
        <div
          key={stat.label}
          className={cn(
            'flex h-full flex-col gap-1 rounded-sm border border-transparent bg-gradient-to-b from-[#fffdfa] via-warmwhite to-stone px-4 py-3.5 shadow-[0_2px_8px_-2px_rgba(10,11,13,0.07)] transition-all duration-[220ms] ease-out hover:-translate-y-1 hover:border-brand-200/60 hover:shadow-[0_10px_22px_-6px_rgba(10,11,13,0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
            isLast && stats.length % 2 === 1 && 'sm:col-span-2',
            isLast && stats.length % 3 === 1 && 'lg:col-span-3',
          )}
        >
          <Text variant="caption" muted className="font-semibold uppercase tracking-wide">
            {stat.label}
          </Text>
          {stat.value ? (
            <span className="font-display text-h4 font-semibold leading-snug tracking-tight text-ink">{stat.value}</span>
          ) : (
            <span className="font-display text-h4 font-semibold italic leading-snug tracking-tight text-gray-300">
              {pendingLabel}
            </span>
          )}
        </div>
        );
      })}
    </div>
  );
}
