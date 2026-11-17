import { cn } from '../../lib/utils';

export interface PhotoTreatmentProps {
  /** Optional large outlined word set behind the bottom edge (decorative, aria-hidden). */
  word?: string;
  /** `full` = gradient + hairline + accent bar (+ word); `thumb` = hairline + accent bar only, for small thumbnails. */
  variant?: 'full' | 'thumb';
}

/**
 * The /services listing photo treatment, layered over an image inside a
 * `relative overflow-hidden` frame: an ink gradient rising from the
 * bottom-start corner, a hairline inner border, a short brand accent bar on
 * the bottom edge and, where it adds something, an outlined background word.
 * The colour grade itself is baked into the image files.
 */
export function PhotoTreatment({ word, variant = 'full' }: PhotoTreatmentProps) {
  return (
    <>
      {variant === 'full' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink/60 via-ink/15 to-transparent rtl:bg-gradient-to-tl"
        />
      )}
      {variant === 'full' && word && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[0.12em] start-4 select-none font-sans text-[clamp(3rem,7vw,6.5rem)] font-black uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:2px_theme(colors.brand.500)]"
        >
          {word}
        </span>
      )}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15" />
      <span aria-hidden="true" className={cn('pointer-events-none absolute bottom-0 start-0 bg-brand-600', variant === 'full' ? 'h-1 w-16' : 'h-0.5 w-6')} />
    </>
  );
}
