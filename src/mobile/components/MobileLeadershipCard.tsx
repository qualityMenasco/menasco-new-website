import { Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface MobileLeadershipCardProps {
  photo: string;
  photoAlt: string;
  name: string;
  title: string;
  linkedinHref?: string;
}

/** Compact executive/support roster card — consistent portrait ratio, name, title, LinkedIn link. */
export function MobileLeadershipCard({ photo, photoAlt, name, title, linkedinHref }: MobileLeadershipCardProps) {
  const { t } = useTranslation('about');
  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-gray-200 bg-warmwhite">
      <div className="aspect-[3/4] overflow-hidden bg-gray-200">
        <img src={photo} alt={photoAlt} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="font-display text-body font-semibold leading-tight text-ink">{name}</span>
        <span className="text-small text-gray-600">{title}</span>
        {linkedinHref && (
          <a
            href={linkedinHref}
            aria-label={t('team.linkedinProfileFor', { name, defaultValue: `${name}'s LinkedIn profile` })}
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-caption font-semibold text-brand-600"
          >
            <Linkedin size={13} aria-hidden="true" />
            LinkedIn
          </a>
        )}
      </div>
    </article>
  );
}
