import { CalendarCheck, Tag } from 'lucide-react';
import type { ProjectKeyMetric } from '../../data/projects';
import { cn } from '../../lib/utils';
import { Text } from '../typography/Typography';

/**
 * Every value in a given project's panel renders at the SAME size — but
 * which size is picked per project, from its own longest value, rather
 * than one fixed size for every project site-wide. A project whose values
 * are all short ("9", "Completed", "132/11 kV") stays at the larger size;
 * a project with even one long value (e.g. a full category title) shrinks
 * every box in its own panel to match, so short and long values in the
 * SAME project never look mismatched, but a short-everything project
 * elsewhere on the site isn't needlessly shrunk down too.
 */
function panelValueSizeClass(longestValueLength: number): string {
  if (longestValueLength <= 12) return 'text-h3';
  if (longestValueLength <= 24) return 'text-h4';
  return 'text-body leading-snug';
}

export interface ProjectMetricsPanelProps {
  /** 0-3 entries — rendered as-is, never padded with invented placeholders. */
  keyMetrics: ProjectKeyMetric[];
  categoryLabel: string;
  categoryTitle?: string;
  completionLabel: string;
  /** e.g. the project's `year` — omitted entirely (no card) if the project has none. */
  completionValue?: string;
  className?: string;
}

/**
 * A dynamic key-metric card (capacity, voltage, whatever the project's own
 * data provides) has no icon — unlike `categoryTitle`'s `Tag` or
 * `completionValue`'s `CalendarCheck`, there's no single fixed concept a
 * metric card represents, so a generic icon repeated across non-identical
 * values would be purely decorative (the thing the design spec explicitly
 * rules out). `fullWidth` lets a lone trailing card (odd total count) span
 * both grid columns instead of leaving an empty cell beside it.
 */
function StatCard({ icon: Icon, label, value, valueSizeClass, fullWidth }: { icon?: typeof Tag; label: string; value: string; valueSizeClass: string; fullWidth?: boolean }) {
  return (
    <div className={cn('flex flex-col justify-center gap-3 rounded-md border border-gray-200 bg-stone px-5 py-5', fullWidth && 'col-span-2')}>
      {Icon && <Icon size={22} aria-hidden="true" className="text-brand-600" />}
      <div>
        <span className={cn('block font-display font-semibold tabular-nums text-ink leading-snug', valueSizeClass)}>{value}</span>
        <Text variant="caption" muted className="mt-1.5">
          {label}
        </Text>
      </div>
    </div>
  );
}

/**
 * Right-hand metrics panel for the standard project detail template: up to
 * 3 key-metric cards plus a category card in a 2-column grid, then a
 * separate full-width "Completion" card below. Sits beside
 * `ProjectDetailHero` in the same CSS grid row (see `PROJECT_DETAIL_GRID`),
 * which by default stretches every grid item to the row's height — i.e. to
 * the hero image's own height, since that's always the taller of the two.
 * `h-full flex flex-col` here claims that stretched height; the stat card
 * grid is `flex-1 auto-rows-[minmax(auto,1fr)]` — every row is AT LEAST
 * its own content's natural height (so a long-wrapping value is never
 * squeezed below what it needs, unlike Tailwind's built-in `auto-rows-fr`
 * utility, which compiles to `grid-auto-rows: minmax(0, 1fr)` — a hard
 * equal split with NO content-based floor, confirmed via a live
 * screenshot to spill text past a card's own border), and any space LEFT
 * OVER beyond that is split evenly across the rows via the `1fr` weight —
 * so the panel's bottom edge still always lines up with the hero image's,
 * for any number of cards and any font size, without ever being able to
 * overflow a card.
 * When the grid ends up with an odd number of cards (e.g. only a category
 * card, or 1/3 key metrics), the last card spans both columns instead of
 * leaving an empty cell next to it — a layout fix only, never an invented
 * placeholder card.
 */
export function ProjectMetricsPanel({
  keyMetrics,
  categoryLabel,
  categoryTitle,
  completionLabel,
  completionValue,
  className,
}: ProjectMetricsPanelProps) {
  const cards = [
    ...keyMetrics.map((metric) => ({ key: metric.label, icon: undefined, label: metric.label, value: metric.value })),
    ...(categoryTitle ? [{ key: '__category', icon: Tag, label: categoryLabel, value: categoryTitle }] : []),
  ];
  const hasCards = cards.length > 0;
  const isOdd = cards.length % 2 === 1;

  // One size for every box in THIS project's panel, picked from the
  // longest value across every card (including the completion card) — not
  // a global fixed size, so a project whose values are all short still
  // renders at the larger size.
  const longestValueLength = Math.max(0, ...cards.map((card) => card.value.length), completionValue?.length ?? 0);
  const valueSizeClass = panelValueSizeClass(longestValueLength);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {hasCards && (
        <div className="grid flex-1 auto-rows-[minmax(auto,1fr)] grid-cols-2 gap-3">
          {cards.map((card, cardIndex) => (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={card.value}
              valueSizeClass={valueSizeClass}
              fullWidth={isOdd && cardIndex === cards.length - 1}
            />
          ))}
        </div>
      )}

      {completionValue && (
        <div
          className={cn(
            'mt-3 flex items-center gap-4 rounded-md border border-gray-200 bg-stone px-5 py-5',
            !hasCards && 'flex-1',
          )}
        >
          <CalendarCheck size={24} aria-hidden="true" className="text-brand-600" />
          <div>
            <span className={cn('block font-display font-semibold tabular-nums text-ink leading-snug', valueSizeClass)}>{completionValue}</span>
            <Text variant="caption" muted className="mt-1">
              {completionLabel}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}
