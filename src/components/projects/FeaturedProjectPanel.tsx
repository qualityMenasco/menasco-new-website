import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Eyebrow, Heading, Text } from '../typography/Typography';
import { Badge } from '../ui/Badge';
import { ButtonLink } from '../ui/Button';
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
 * panel). The image links to this project's own detail page; "View Project"
 * below is a second, sibling link to the same destination (not nested).
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
    <div className="group">
      <SmartLink href={viewProjectHref} className="block focus-visible:outline-offset-4" aria-label={t('viewItemLabel', { name: title })}>
        <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.03]"
          />
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
          {title}
        </Heading>
        {location && (
          <Text variant="small" muted className="uppercase tracking-wide">
            {location}
          </Text>
        )}
        {description && (
          <Text variant="small" className="hidden sm:block">
            {description}
          </Text>
        )}
        <ButtonLink href={viewProjectHref} variant="outline" size="sm" trailingIcon={ArrowRight} className="mt-2 w-fit">
          {t('buttons.viewProject')}
        </ButtonLink>
      </div>
    </div>
  );
}
