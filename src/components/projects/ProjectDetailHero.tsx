import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Heading, Text } from '../typography/Typography';

export type ProjectStatusTone = 'info' | 'success' | 'warning';

const dotToneClasses: Record<ProjectStatusTone, string> = {
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
};

export interface ProjectDetailHeroProps {
  /** May be unset for a record with no sourced hero photo yet — the hero still renders (gradient over a solid fill) rather than breaking. */
  image?: string;
  title: string;
  eyebrow?: string;
  location?: string;
  statusLabel?: string;
  statusTone?: ProjectStatusTone;
  /** Rendered as a small badge above the title block (e.g. "Details Pending Verification"). */
  verificationBadge?: ReactNode;
  className?: string;
}

/**
 * Desktop hero for the standard project detail template — a single
 * full-cover photo with a dark gradient for legible overlaid text, the
 * title block anchored to the bottom-start corner and a status "pill"
 * anchored to the bottom-end corner (see the approved wireframe). Logical
 * `start`/`end` positioning (not `left`/`right`) so it mirrors correctly
 * under `dir="rtl"`.
 */
export function ProjectDetailHero({
  image,
  title,
  eyebrow,
  location,
  statusLabel,
  statusTone = 'info',
  verificationBadge,
  className,
}: ProjectDetailHeroProps) {
  return (
    <div className={cn('relative min-h-[430px] w-full overflow-hidden rounded-md bg-ink', className)}>
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent"
      />

      {verificationBadge && <div className="absolute start-5 top-5">{verificationBadge}</div>}

      <div className="absolute bottom-6 start-6 max-w-xl">
        {eyebrow && (
          <Text variant="caption" theme="dark" className="font-semibold uppercase tracking-[0.14em] !text-warmwhite">
            {eyebrow}
          </Text>
        )}
        <Heading level="h1" as="h1" theme="dark" className="mt-2 leading-[1.02]">
          {title}
        </Heading>
        {location && (
          <Text variant="body" theme="dark" className="mt-1 !text-warmwhite/85">
            {location}
          </Text>
        )}
      </div>

      {statusLabel && (
        <div className="absolute bottom-5 end-5 flex items-center gap-2 rounded-full border border-white/40 bg-ink/80 px-4 py-2.5 text-small font-medium text-warmwhite backdrop-blur-sm">
          <span aria-hidden="true" className={cn('inline-block h-2.5 w-2.5 rounded-full', dotToneClasses[statusTone])} />
          {statusLabel}
        </div>
      )}
    </div>
  );
}
