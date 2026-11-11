import { useTranslation } from 'react-i18next';
import { Eyebrow, Heading, Text } from '../typography/Typography';
import { Badge } from '../ui/Badge';
import { SmartLink } from '../../lib/SmartLink';

export interface FeaturedProjectPanelProps {
  title: string;
  category?: string;
  location?: string;
  description?: string;
  image: string;
  imageAlt: string;
  /** This project's own detail page. */
  viewProjectHref: string;
  showVerificationBadge?: boolean;
}

/**
 * One half of the homepage's side-by-side flagship-project pair — a
 * compact, controlled-aspect-ratio portfolio feature (not a full-bleed hero
 * panel). The description lives behind the image: hovering (or keyboard-
 * focusing) the image dims the photo and brings the text up, like the BIM
 * section. The image and the title both link to the project's detail page.
 */
export function FeaturedProjectPanel({
  title,
  category,
  location,
  description,
  image,
  imageAlt,
  viewProjectHref,
  showVerificationBadge = false,
}: FeaturedProjectPanelProps) {
  const { t } = useTranslation(['common', 'projects']);
  return (
    <div>
      <SmartLink
        href={viewProjectHref}
        className="group block focus-visible:outline-offset-4"
        aria-label={t('viewItemLabel', { name: title })}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-ink">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-[opacity,transform] duration-500 ease-engineered group-hover:scale-[1.03] group-hover:opacity-20 group-focus-visible:scale-[1.03] group-focus-visible:opacity-20"
          />
          {description && (
            <div className="absolute inset-0 flex items-center justify-center p-6 opacity-0 transition-opacity duration-500 ease-engineered group-hover:opacity-100 group-focus-visible:opacity-100 lg:p-10">
              <Text variant="body" className="max-w-md text-center !leading-relaxed !text-warmwhite">
                {description}
              </Text>
            </div>
          )}
        </div>
      </SmartLink>

      <div className="mt-2.5 flex flex-col gap-1 sm:mt-3 sm:gap-1.5">
        {(category || showVerificationBadge) && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {category && <Eyebrow>{category}</Eyebrow>}
            {showVerificationBadge && (
              <Badge variant="status" className="hidden sm:inline-flex">
                {t('projects:detail.detailsPending')}
              </Badge>
            )}
          </div>
        )}
        <Heading level="h4" as="h3">
          <SmartLink href={viewProjectHref} className="transition-colors duration-base hover:text-brand-600">
            {title}
          </SmartLink>
        </Heading>
        {location && (
          <Text variant="small" muted className="uppercase tracking-wide">
            {location}
          </Text>
        )}
      </div>
    </div>
  );
}
