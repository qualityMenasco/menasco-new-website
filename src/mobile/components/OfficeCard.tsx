import { MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export interface OfficeCardProps {
  /** The office's existing approved `label` field, e.g. "Dubai — Head Office". */
  label: string;
  country: string;
  isSelected: boolean;
  onSelect: () => void;
}

/** Compact 2×2-grid office tile — a real button (not hover-only), marks its selected state via aria-pressed. */
export function OfficeCard({ label, country, isSelected, onSelect }: OfficeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'flex min-h-[92px] flex-col items-start gap-1.5 rounded-md border p-3 text-start transition-colors duration-base',
        isSelected ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-warmwhite active:border-gray-300',
      )}
    >
      <span
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-sm',
          isSelected ? 'bg-brand-600 text-warmwhite' : 'bg-stone text-brand-600',
        )}
      >
        <MapPin size={14} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <span className="block truncate font-display text-body font-semibold text-ink">{country}</span>
        <span className="block truncate text-caption text-gray-600">{label}</span>
      </div>
    </button>
  );
}
