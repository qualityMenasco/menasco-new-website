import { ImageIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

/** Dashed "photo coming soon" slot, held in place until a real photo is supplied. */
export function PhotoPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn('flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-warmwhite/70 text-gray-400', className)}
    >
      <ImageIcon size={22} aria-hidden="true" />
      <span className="text-caption font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}
