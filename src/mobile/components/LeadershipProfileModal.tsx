import { useEffect } from 'react';
import { Linkedin, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LeadershipProfile } from '../../data/leadership';

export interface LeadershipProfileModalProps {
  profile: LeadershipProfile;
  onClose: () => void;
}

/**
 * Full, unedited profile text for a featured leader — opened from the
 * compact carousel card so the card itself never has to carry the full
 * biography. Reads the same messageParagraphs/closingLine the desktop
 * dedicated profile page uses, nothing is shortened or rewritten here.
 */
export function LeadershipProfileModal({ profile, onClose }: LeadershipProfileModalProps) {
  const { t } = useTranslation('about');
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 sm:items-center sm:p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="leadership-modal-title"
    >
      <div
        className="relative max-h-[85vh] w-full overflow-hidden rounded-t-lg border border-gray-200 bg-warmwhite shadow-strong sm:max-w-lg sm:rounded-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <span className="text-caption font-semibold uppercase tracking-widest text-brand-600">
              {profile.messageEyebrow}
            </span>
            <h3 id="leadership-modal-title" className="font-display text-h4 font-semibold leading-tight text-ink">
              {profile.fullName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('team.closeDialog')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 text-ink transition-colors hover:border-gray-300 hover:bg-gray-100"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex max-h-[calc(85vh-4.5rem)] flex-col gap-3 overflow-y-auto px-5 py-5">
          {profile.messageParagraphs.map((paragraph, index) => (
            <p key={index} className="text-body leading-relaxed text-ink">
              {paragraph}
            </p>
          ))}
          {profile.closingLine && (
            <p className="border-s-2 border-brand-500 ps-4 text-body font-semibold leading-relaxed text-ink">
              {profile.closingLine}
            </p>
          )}
          {profile.linkedinHref && (
            <a
              href={profile.linkedinHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-1.5 text-small font-semibold text-brand-600"
            >
              <Linkedin size={15} aria-hidden="true" />
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
