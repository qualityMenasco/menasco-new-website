import { useTranslation } from 'react-i18next';
import { officeLocations, primaryContact } from '../../../data/locations';

const locationKeys: Record<string, string> = { dubai: 'dubai', riyadh: 'riyadh', cairo: 'cairo', london: 'london', usa: 'usa', jordan: 'jordan', syria: 'syria' };

/**
 * Every office's details as plain HTML, not displayed (`hidden`). The visible
 * office widgets (the globe card on desktop/tablet, the chip panel on phones)
 * show one office at a time, so this keeps all seven offices' city, country,
 * address and phone in the page's HTML for search engines. Same data and
 * translations as those widgets; nothing here is ever shown or focusable.
 */
export function OfficeDirectory() {
  const { t } = useTranslation(['home', 'common']);
  return (
    <div hidden>
      <ul>
        {officeLocations.map((office) => {
          const key = locationKeys[office.id];
          const label = key ? t(`common:locations.${key}.label`) : office.label;
          const city = key ? t(`common:locations.${key}.city`) : office.city;
          const country = key ? t(`common:locations.${key}.country`) : office.country;
          return (
            <li key={office.id}>
              <p>{label}</p>
              <p>
                {city}, {country}
              </p>
              {office.address && <address>{office.address}</address>}
              {office.phone && <a href={`tel:${office.phone.replace(/\s+/g, '')}`}>{office.phone}</a>}
              <a href={`mailto:${office.email ?? primaryContact.email}`}>{office.email ?? primaryContact.email}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
