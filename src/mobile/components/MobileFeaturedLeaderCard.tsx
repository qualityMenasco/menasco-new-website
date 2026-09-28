import { ArrowRight, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LeadershipProfile } from '../../data/leadership';

export interface MobileFeaturedLeaderCardProps {
  profile: LeadershipProfile;
  onReadFullProfile: () => void;
}

/**
 * Compact featured-leader card for the mobile carousel — same scale/visual
 * language as MobileLeadershipCard (portrait, name, title, subtle border,
 * restrained shadow) with a one-line summary and a button into the full
 * profile modal, instead of the full biography sitting in the card itself.
 */
export function MobileFeaturedLeaderCard({ profile, onReadFullProfile }: MobileFeaturedLeaderCardProps) {
  const { t } = useTranslation('about');
  const summary = profile.messageParagraphs[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-warmwhite shadow-soft">
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <img
            src={profile.photo}
            alt={t('team.portraitAlt', { name: profile.fullName, role: profile.fullRole, defaultValue: `Portrait of ${profile.fullName}, ${profile.fullRole} of MENASCO` })}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <span className="text-caption font-semibold uppercase tracking-widest text-brand-600">
            {profile.messageEyebrow}
          </span>
          <h3 className="truncate font-display text-body font-semibold leading-tight text-ink">{profile.fullName}</h3>
          <span className="block truncate text-small text-gray-600">{profile.fullRole}</span>
        </div>
      </div>

      <p className="line-clamp-2 px-4 text-small leading-relaxed text-gray-600">{summary}</p>

      <div className="mt-auto flex items-center justify-between gap-3 p-4 pt-3">
        <button
          type="button"
          onClick={onReadFullProfile}
          className="inline-flex items-center gap-1 text-small font-semibold text-brand-600"
        >
          {t('team.readFullProfileShort')}
          <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
        </button>
        {profile.linkedinHref && (
          <a
            href={profile.linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('team.linkedinProfileFor', { name: profile.fullName, defaultValue: `${profile.fullName}'s LinkedIn profile` })}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-brand-600"
          >
            <Linkedin size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
