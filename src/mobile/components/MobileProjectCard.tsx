import { LocaleLink } from './LocaleLink';
import { ProjectImage } from '../../components/media/ProjectImage';

export interface MobileProjectCardProps {
  /** Required for variant="image" (the default). Ignored for variant="icon". */
  image?: string;
  title: string;
  categoryLabel?: string;
  location?: string;
  href: string;
  className?: string;
  /** First visible grid row — loads eagerly at high priority instead of lazy-loading. */
  priority?: boolean;
  /**
   * 'image' (default): photo thumbnail. 'icon': plain dark tile with a
   * subtle centered MENASCO watermark — for projects (e.g. confidential
   * data centers) with no photography. Mirrors the desktop ProjectCard's
   * same variant so both breakpoints stay visually consistent.
   */
  variant?: 'image' | 'icon';
}

/** Compact project preview card for horizontal scrollers and the project grid. */
export function MobileProjectCard({
  image,
  title,
  categoryLabel,
  location,
  href,
  className,
  priority = false,
  variant = 'image',
}: MobileProjectCardProps) {
  const metaLine = [categoryLabel, location].filter(Boolean).join(' · ');
  return (
    <LocaleLink to={href} className={`block overflow-hidden rounded-md border border-gray-200 bg-warmwhite ${className ?? ''}`}>
      <div className={`relative aspect-[4/3] overflow-hidden ${variant === 'icon' ? 'bg-ink' : 'bg-gray-100'}`}>
        {variant === 'icon' ? (
          <img
            src="/menasco-logo-landscape-white.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.14]"
          />
        ) : (
          <ProjectImage src={image ?? ''} alt={title} priority={priority} />
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        {metaLine && <span className="text-caption font-semibold uppercase tracking-wide text-gray-500">{metaLine}</span>}
        <span className="font-display text-body font-semibold text-ink">{title}</span>
      </div>
    </LocaleLink>
  );
}
