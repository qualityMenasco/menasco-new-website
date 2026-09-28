import { ArrowRight, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { Theme } from '../../types';
import { Heading, Text } from '../typography/Typography';
import { ButtonLink } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface LeadershipTeamCardProps {
  photo: string;
  photoAlt: string;
  name: string;
  title: string;
  linkedinHref?: string;
  /** Only present for executives with a dedicated profile page. */
  profileHref?: string;
  /** Optional bio paragraphs for modal display when no dedicated profile page exists. */
  bio?: string[];
  theme?: Theme;
  className?: string;
}

/**
 * Executive roster card — same dimensions, typography, hover treatment,
 * border/shadow/radius as LeadershipMiniCard (the Bahaa/Helmi About-page
 * cards), but static (no click-through, since most executives don't yet
 * have a dedicated profile page) with an always-visible LinkedIn button
 * in place of the hover-reveal "View Profile" affordance.
 */
export function LeadershipTeamCard({
  photo,
  photoAlt,
  name,
  title,
  linkedinHref,
  profileHref,
  bio,
  theme,
  className,
}: LeadershipTeamCardProps) {
  const { t } = useTranslation('about');
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const [isBioOpen, setIsBioOpen] = useState(false);

  return (
    <>
      <article
        className={cn(
          'group flex h-full min-h-[35rem] flex-col overflow-hidden rounded-md border shadow-soft transition-[transform,box-shadow,border-color] duration-base ease-engineered hover:-translate-y-1 hover:shadow-strong',
          isDark ? 'border-white/10 bg-graphite hover:border-white/25' : 'border-gray-200 bg-stone hover:border-brand-300',
          className,
        )}
      >
        <div className="aspect-[3/4] overflow-hidden bg-gray-200">
          <img
            src={photo}
            alt={photoAlt}
            className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-105"
          />
        </div>
        <span aria-hidden="true" className="block h-0.5 w-0 bg-brand-500 transition-all duration-slow ease-engineered group-hover:w-full" />
        <div className="flex flex-1 flex-col gap-0.5 p-4">
          <div>
            <Heading level="h4" as="h3" theme={resolvedTheme}>
              {name}
            </Heading>
            <Text variant="small" theme={resolvedTheme} muted>
              {title}
            </Text>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
            {!profileHref && bio && (
              <ButtonLink
                href="#"
                variant="primary"
                size="sm"
                theme={resolvedTheme}
                trailingIcon={ArrowRight}
                aria-label={t('team.readBioFor', { name, defaultValue: `Read ${name}'s bio` })}
                className="w-fit"
                onClick={(event) => {
                  event.preventDefault();
                  setIsBioOpen(true);
                }}
              >
                {t('team.readBio')}
              </ButtonLink>
            )}
            {profileHref && (
              <ButtonLink
                href={profileHref}
                variant="primary"
                size="sm"
                theme={resolvedTheme}
                trailingIcon={ArrowRight}
                aria-label={t('team.viewProfileFor', { name, defaultValue: `View ${name}'s profile` })}
                className="w-fit"
              >
                {t('team.viewProfile')}
              </ButtonLink>
            )}
            {linkedinHref && (
              <ButtonLink
                href={linkedinHref}
                variant="outline"
                size="sm"
                theme={resolvedTheme}
                leadingIcon={Linkedin}
                aria-label={t('team.linkedinProfileFor', { name, defaultValue: `${name}'s LinkedIn profile` })}
                className="w-fit"
              >
                LinkedIn
              </ButtonLink>
            )}
          </div>
        </div>
      </article>

      {bio && (
        <Modal isOpen={isBioOpen} onClose={() => setIsBioOpen(false)} title={name}>
          <div className="space-y-3">
            <p className="font-display text-h5 font-semibold text-brand-600">{title}</p>
            {bio.map((paragraph, index) => (
              <Text key={index} variant="body" theme={resolvedTheme}>
                {paragraph}
              </Text>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}
