import { useState } from 'react';
import { OfficeDirectory } from '../../components/sections/home/OfficeDirectory';
import { useTranslation } from 'react-i18next';
import { OfficeDetailsPanel } from './OfficeDetailsPanel';
import { officeLocations, primaryContact } from '../../data/locations';
import { cn } from '../lib/utils';

/**
 * Compact office picker: one chip per office (country name), with a single
 * shared detail panel beneath that updates in place. About half the height
 * of the previous two-column card grid.
 */
export function RegionalOfficeGrid() {
  const { t } = useTranslation('common');
  const headquarters = officeLocations.find((office) => office.isHeadquarters) ?? officeLocations[0];
  const [selectedId, setSelectedId] = useState(headquarters.id);
  const selectedOffice = officeLocations.find((office) => office.id === selectedId) ?? headquarters;

  return (
    <div>
      <div role="group" aria-label={t('footer.offices', { defaultValue: 'Offices' })} className="flex flex-wrap gap-2">
        {officeLocations.map((office) => {
          const selected = office.id === selectedId;
          return (
            <button
              key={office.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(office.id)}
              className={cn(
                'min-h-10 rounded-full border px-4 text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                selected ? 'border-brand-600 bg-warmwhite text-brand-600' : 'border-gray-300 bg-warmwhite text-ink active:bg-gray-100',
              )}
            >
              {t(`locations.${office.id}.country`, office.country)}
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="mt-4">
        <OfficeDetailsPanel office={selectedOffice} email={primaryContact.email} />
      </div>
      <OfficeDirectory />
    </div>
  );
}
