import { SUSTAIN_HERO_FJORD_SVG as fjordSvg } from '../../../assets/sustainHeroFjord';

/**
 * Sustainability hero drawing: a fjord in one-point perspective, composed to
 * match the technical hero (HeroServerHall): same 1200x330 frame and vanishing
 * point (600,132), bank walls on the rack rows' base lines with the same panel
 * spacing, faint floor lines, and the floor's converging lines drawn as
 * MENASCO-blue data lines with pulses (staggered left to right on entry).
 * The water is pure white, like the hero around it.
 *
 * Inline SVG (static markup from src/assets/sustainHeroFjord.ts) so its own
 * pulse animation runs; pulses are hidden for reduced-motion users.
 */
export function SustainHeroFjord() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
      // Trusted, build-time asset (no user input).
      dangerouslySetInnerHTML={{ __html: fjordSvg }}
    />
  );
}
