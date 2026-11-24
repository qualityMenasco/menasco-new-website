import { cn } from '../../lib/utils';

export interface MenascoLogoProps {
  /** Sets the logo's rendered height (e.g. "h-9"); width follows automatically to preserve aspect ratio. */
  className?: string;
  /** Swaps in the dedicated white landscape lockup (/Menasco_Logo_Landscape_White.png), which reads directly on dark surfaces — no backing plate needed. */
  onDark?: boolean;
}

/** The single source of truth for the MENASCO logo — renders the uploaded logo asset, never a text or recreated substitute. */
export function MenascoLogo({ className, onDark = false }: MenascoLogoProps) {
  return (
    <img
      src={onDark ? '/Menasco_Logo_Landscape_White.png' : '/Menasco_Logo.png'}
      alt="MENASCO"
      className={cn('w-auto shrink-0 self-start object-contain', className)}
    />
  );
}
