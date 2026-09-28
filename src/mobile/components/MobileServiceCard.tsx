import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from './LocaleLink';

export interface MobileServiceCardProps {
  image: string;
  title: string;
  description: string;
  href: string;
  className?: string;
}

/** Compact service card — image, title, one-line summary, arrow link. Used in both the swipe row and the full services grid. */
export function MobileServiceCard({ image, title, description, href, className }: MobileServiceCardProps) {
  const { t } = useTranslation('common');
  return (
    <LocaleLink to={href} className={`group block overflow-hidden rounded-md border border-gray-200 bg-warmwhite ${className ?? ''}`}>
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img src={image} alt={`MENASCO ${title} services`} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-display text-h4 font-semibold text-ink">{title}</h3>
        <p className="text-small text-gray-600">{description}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-small font-semibold text-brand-600">
          {t('buttons.explore')}
          <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180 transition-transform duration-base group-active:translate-x-1 rtl:group-active:-translate-x-1" />
        </span>
      </div>
    </LocaleLink>
  );
}
