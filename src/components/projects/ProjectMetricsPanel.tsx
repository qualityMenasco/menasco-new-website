import { CalendarCheck, Tag } from 'lucide-react';
import type { ProjectKeyMetric } from '../../data/projects';
import { cn } from '../../lib/utils';
import { Text } from '../typography/Typography';

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
function StatCard({ icon: Icon, label, value, fullWidth }: { icon?: typeof Tag; label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={cn('flex flex-col justify-center gap-3 rounded-md border border-gray-200 bg-stone px-5 py-5', fullWidth && 'col-span-2')}>
      {Icon && <Icon size={22} aria-hidden="true" className="text-brand-600" />}
      <div>
        <span className="block font-display text-h3 font-semibold tabular-nums text-ink">{value}</span>
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
 * separate full-width "Completion" card below (see the approved wireframe —
 * the wireframe's artificial `.65fr` short row is deliberately NOT
 * reproduced here; this lets the completion card size by its own content).
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
  const isOdd = cards.length % 2 === 1;

  return (
    <div className={cn(className)}>
      {cards.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, cardIndex) => (
            <StatCard
              key={card.key}
              icon={card.icon}
              label={card.label}
              value={card.value}
              fullWidth={isOdd && cardIndex === cards.length - 1}
            />
          ))}
        </div>
      )}

      {completionValue && (
        <div className="mt-3 flex items-center gap-4 rounded-md border border-gray-200 bg-stone px-5 py-5">
          <CalendarCheck size={24} aria-hidden="true" className="text-brand-600" />
          <div>
            <span className="block font-display text-h3 font-semibold tabular-nums text-ink">{completionValue}</span>
            <Text variant="caption" muted className="mt-1">
              {completionLabel}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}
