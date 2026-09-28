import { memo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SmartLink } from '../../lib/SmartLink';
import { cn } from '../../lib/utils';
import { Heading, Text } from '../typography/Typography';
import { ProjectImage } from '../media/ProjectImage';

export interface ProjectCardProps {
  title: string;
  href: string;
  /** Required for variant="image" (the default). Ignored for variant="icon". */
  image?: string;
  location?: string;
  client?: string;
  description?: string;
  /** e.g. "12 MW IT" — rendered as a small frosted badge in the visual's bottom-right corner when present. */
  capacity?: string;
  /** Visually recedes the card (lower opacity + desaturation) — used to show its sector doesn't match an in-progress filter hover. */
  muted?: boolean;
  className?: string;
  /**
   * 'image' (default): photo thumbnail. 'icon': plain dark tile — for
   * projects (e.g. confidential data centers) with no photography. Both
   * variants share the exact same location/title/CTA layout below the visual.
   */
  variant?: 'image' | 'icon';
  /** First visible grid row — loads eagerly at high priority instead of lazy-loading. */
  priority?: boolean;
}

/** Single portfolio entry — the whole card is one link, no nested interactive elements. */
export const ProjectCard = memo(function ProjectCard({
  title,
  href,
  image,
  location,
  client,
  description,
  capacity,
  muted,
  className,
  variant = 'image',
  priority = false,
}: ProjectCardProps) {
  const { t } = useTranslation('common');
  return (
    <SmartLink
      href={href}
      className={cn(
        'group block transition-[opacity,filter] duration-slow ease-engineered focus-visible:outline-offset-4',
        muted && 'opacity-45 grayscale',
        className,
      )}
    >
      <div
        className={cn(
          'relative aspect-[4/3] overflow-hidden rounded-md',
          variant === 'icon' ? 'bg-ink transition-colors duration-slow ease-engineered group-hover:bg-charcoal' : 'bg-gray-100',
        )}
      >
        {variant === 'icon' ? (
          <img
            src="/menasco-logo-landscape-white.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.14] transition-opacity duration-slow ease-engineered group-hover:opacity-20"
          />
        ) : (
          <ProjectImage
            src={image ?? ''}
            alt={title}
            priority={priority}
            imgClassName="transition-transform duration-slow ease-engineered group-hover:scale-[1.04]"
          />
        )}

        {capacity && (
          <span className="absolute bottom-3 right-3 rounded-md border border-white/40 bg-white/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink shadow-sm backdrop-blur-md">
            {capacity}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {location && (
          <Text variant="small" muted className="uppercase tracking-wide">
            {location}
          </Text>
        )}
        <Heading level="h4" as="h3">{title}</Heading>
        {client && (
          <Text variant="small" muted>
            {t('client', { name: client })}
          </Text>
        )}
        {description && <Text variant="small">{description}</Text>}
        <span className="mt-2 inline-flex items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base group-hover:text-brand-700">
          {t('buttons.exploreMore')}
          <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180 transition-transform duration-base group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </SmartLink>
  );
});
