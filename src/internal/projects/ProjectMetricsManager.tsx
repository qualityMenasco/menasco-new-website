import { useState } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { TextField } from '../../components/forms/TextField';
import { Button, IconButton } from '../../components/ui/Button';
import { Text } from '../../components/typography/Typography';
import { projectsAdminApi } from './projectsAdminApi';
import type { ProjectMetric } from './types';

export interface ProjectMetricsManagerProps {
  projectId: string;
  metrics: ProjectMetric[];
  onMetricsChanged: (metrics: ProjectMetric[]) => void;
}

/**
 * Ordered metric rows, NOT fixed "Key Metric 1/2/3" columns — the first
 * three rows by displayOrder ARE Key Metrics 1-3 for display purposes, but
 * there is no separate fixed-slot API or column; this editor is simply an
 * ordered list with add/edit/delete/reorder, matching project_metrics'
 * actual shape (api/_lib/projects.ts).
 */
export function ProjectMetricsManager({ projectId, metrics, onMetricsChanged }: ProjectMetricsManagerProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const sorted = [...metrics].sort((a, b) => a.displayOrder - b.displayOrder);

  async function addMetric() {
    if (!newName.trim() || !newValue.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const created = await projectsAdminApi.createMetric(projectId, {
        metricName: newName.trim(),
        metricValue: newValue.trim(),
        metricUnit: newUnit.trim() || null,
        displayOrder: sorted.length,
      });
      onMetricsChanged([...metrics, created]);
      setNewName('');
      setNewValue('');
      setNewUnit('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  async function saveField(metricId: string, update: Partial<{ metricName: string; metricValue: string; metricUnit: string | null }>) {
    setBusyId(metricId);
    setError(null);
    try {
      await projectsAdminApi.updateMetric(projectId, metricId, update);
      onMetricsChanged(metrics.map((m) => (m.id === metricId ? { ...m, ...update, metricUnit: update.metricUnit ?? m.metricUnit } : m)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeMetric(metricId: string) {
    setBusyId(metricId);
    setError(null);
    try {
      await projectsAdminApi.deleteMetric(projectId, metricId);
      onMetricsChanged(metrics.filter((m) => m.id !== metricId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function reorder(fromIndex: number, direction: -1 | 1) {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[fromIndex], reordered[toIndex]] = [reordered[toIndex], reordered[fromIndex]];
    setError(null);
    try {
      const updated = await projectsAdminApi.reorderMetrics(projectId, reordered.map((m) => m.id));
      onMetricsChanged(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-body text-error">{error}</p>}
      {sorted.length === 0 ? (
        <Text variant="small" className="text-gray-500">
          No metrics yet. The first three, in order, become Key Metrics 1-3.
        </Text>
      ) : (
        <div className="space-y-2">
          {sorted.map((metric, i) => (
            <div key={metric.id} className="flex items-center gap-2 rounded-sm border border-gray-200 bg-warmwhite p-2.5">
              <span className="w-5 shrink-0 text-center text-caption font-semibold text-gray-400">{i + 1}</span>
              <TextField
                label="Name"
                containerClassName="flex-1"
                defaultValue={metric.metricName}
                onBlur={(e) => e.target.value !== metric.metricName && saveField(metric.id, { metricName: e.target.value })}
                disabled={busyId === metric.id}
              />
              <TextField
                label="Value"
                containerClassName="flex-1"
                defaultValue={metric.metricValue}
                onBlur={(e) => e.target.value !== metric.metricValue && saveField(metric.id, { metricValue: e.target.value })}
                disabled={busyId === metric.id}
              />
              <TextField
                label="Unit"
                containerClassName="w-28"
                defaultValue={metric.metricUnit ?? ''}
                onBlur={(e) => e.target.value !== (metric.metricUnit ?? '') && saveField(metric.id, { metricUnit: e.target.value || null })}
                disabled={busyId === metric.id}
              />
              <div className="flex shrink-0 gap-1 self-end pb-0.5">
                <IconButton icon={ArrowUp} label="Move up" size="sm" onClick={() => reorder(i, -1)} disabled={i === 0} />
                <IconButton icon={ArrowDown} label="Move down" size="sm" onClick={() => reorder(i, 1)} disabled={i === sorted.length - 1} />
                <IconButton icon={Trash2} label={`Delete metric "${metric.metricName}"`} size="sm" onClick={() => removeMetric(metric.id)} className="text-error hover:bg-error/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 border-t border-gray-200 pt-3">
        <TextField label="Name" containerClassName="flex-1" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Built Area" />
        <TextField label="Value" containerClassName="flex-1" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="e.g. 85,000" />
        <TextField label="Unit" containerClassName="w-28" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="m²" />
        <Button variant="outline" size="sm" onClick={addMetric} loading={adding} disabled={!newName.trim() || !newValue.trim()}>
          Add metric
        </Button>
      </div>
    </div>
  );
}
