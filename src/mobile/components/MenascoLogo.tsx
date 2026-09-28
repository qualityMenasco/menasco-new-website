export interface MenascoLogoProps {
  className?: string;
  /** Swaps in the dedicated white landscape lockup, which reads directly on dark surfaces. */
  onDark?: boolean;
}

export function MenascoLogo({ className, onDark = false }: MenascoLogoProps) {
  return (
    <img
      src={onDark ? '/menasco-logo-landscape-white.png' : '/Menasco-Logo.png'}
      alt="MENASCO"
      className={`w-auto shrink-0 self-start object-contain ${className ?? ''}`}
    />
  );
}
