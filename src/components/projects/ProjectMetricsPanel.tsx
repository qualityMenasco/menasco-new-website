import { CalendarCheck, Gauge, Tag } from 'lucide-react';
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

function StatCard({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="flex flex-col justify-center gap-3 rounded-md border border-gray-200 bg-stone px-5 py-5">
      <Icon size={22} aria-hidden="true" className="text-brand-600" />
      <div>
        <Text variant="body" className="font-display font-semibold text-ink">
          {value}
        </Text>
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
 */
export function ProjectMetricsPanel({
  keyMetrics,
  categoryLabel,
  categoryTitle,
  completionLabel,
  completionValue,
  className,
}: ProjectMetricsPanelProps) {
  return (
    <div className={cn(className)}>
      <div className="grid grid-cols-2 gap-3">
        {keyMetrics.map((metric) => (
          <StatCard key={metric.label} icon={Gauge} label={metric.label} value={metric.value} />
        ))}
        {categoryTitle && <StatCard icon={Tag} label={categoryLabel} value={categoryTitle} />}
      </div>

      {completionValue && (
        <div className="mt-3 flex items-center gap-4 rounded-md border border-gray-200 bg-stone px-5 py-5">
          <CalendarCheck size={24} aria-hidden="true" className="text-brand-600" />
          <div>
            <Text variant="body" className="font-display font-semibold text-ink">
              {completionValue}
            </Text>
            <Text variant="caption" muted className="mt-1">
              {completionLabel}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}
