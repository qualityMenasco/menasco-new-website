import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { OfficeLocation } from '../../data/locations';

export interface OfficeDetailsPanelProps {
  office: OfficeLocation;
  email: string;
}

const locationKeys: Record<string, string> = { dubai: 'dubai', riyadh: 'riyadh', cairo: 'cairo', london: 'london' };

/**
 * Single shared detail panel — one per office, laid out in a compact 2×2
 * grid on the mobile Contact page (see mobile/pages/ContactPage.tsx). `h-full`
 * + `mt-auto` on the directions link let it settle to the bottom evenly
 * when CSS Grid stretches every card in a row to match the tallest one
 * (e.g. Cairo's longer address wrapping to more lines than Riyadh's).
 */
export function OfficeDetailsPanel({ office, email }: OfficeDetailsPanelProps) {
  const { t } = useTranslation('common');
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`;
  const key = locationKeys[office.id];
  const label = key ? t(`locations.${key}.label`) : office.label;
  const city = key ? t(`locations.${key}.city`) : office.city;
  const country = key ? t(`locations.${key}.country`) : office.country;

  return (
    <div className="flex h-full flex-col rounded-md border border-gray-200 bg-warmwhite p-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">{label}</span>
      <h3 className="mt-0.5 font-display text-small font-semibold leading-tight text-ink">
        {city}, {country}
      </h3>

      <div className="mt-1.5 flex flex-col gap-1 text-caption text-gray-700">
        <div className="flex items-start gap-1.5">
          <MapPin size={11} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-600" />
          <span dir="ltr" className="text-start leading-snug">{office.address}</span>
        </div>
        {office.phone && (
          <a href={`tel:${office.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 font-semibold text-ink">
            <Phone size={11} aria-hidden="true" className="shrink-0 text-brand-600" />
            <span dir="ltr">{office.phone}</span>
          </a>
        )}
        <a href={`mailto:${email}`} className="flex items-center gap-1.5 font-semibold text-ink">
          <Mail size={11} aria-hidden="true" className="shrink-0 text-brand-600" />
          <span dir="ltr" className="truncate">{email}</span>
        </a>
      </div>

      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1 pt-1.5 text-caption font-semibold text-brand-600"
      >
        {t('buttons.getDirections')}
        <ArrowUpRight size={11} aria-hidden="true" className="rtl:-scale-x-100" />
      </a>
    </div>
  );
}
