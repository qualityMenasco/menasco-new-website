import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OfficeCard } from './OfficeCard';
import { OfficeDetailsPanel } from './OfficeDetailsPanel';
import { officeLocations, primaryContact } from '../../data/locations';

/** Two-column office grid + one shared detail panel beneath it — tapping a card updates the panel in place. */
export function RegionalOfficeGrid() {
  const { t } = useTranslation('common');
  const headquarters = officeLocations.find((office) => office.isHeadquarters) ?? officeLocations[0];
  const [selectedId, setSelectedId] = useState(headquarters.id);
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedOffice = officeLocations.find((office) => office.id === selectedId) ?? headquarters;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Only scroll if the panel isn't already fully visible — keeps the interaction fast rather than always jumping.
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect && (rect.bottom > window.innerHeight || rect.top < 0)) {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {officeLocations.map((office) => {
          return (
            <OfficeCard
              key={office.id}
              label={t(`locations.${office.id}.label`, office.label)}
              country={t(`locations.${office.id}.country`, office.country)}
              isSelected={office.id === selectedId}
              onSelect={() => handleSelect(office.id)}
              // With an odd number of offices, the head office spans both
              // columns so every row below it is a full pair.
              className={office.isHeadquarters && officeLocations.length % 2 === 1 ? 'col-span-2' : undefined}
            />
          );
        })}
      </div>
      <div ref={panelRef} className="mt-3">
        <OfficeDetailsPanel office={selectedOffice} email={primaryContact.email} />
      </div>
    </div>
  );
}
