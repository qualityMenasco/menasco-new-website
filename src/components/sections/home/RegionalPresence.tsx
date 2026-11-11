import { useRef, useState, type TouchEvent } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail, MapPin, Phone } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { SectionHeader } from '../../typography/SectionHeader';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { Badge } from '../../ui/Badge';
import { IconButton } from '../../ui/Button';
import { cn } from '../../../lib/utils';
import { officeLocations, primaryContact, type OfficeLocation } from '../../../data/locations';
import { ContactLink } from '../../ui/ContactLink';
import { OfficeGlobe } from './OfficeGlobe';

const locationKeys: Record<string, string> = { dubai: 'dubai', riyadh: 'riyadh', cairo: 'cairo', london: 'london', usa: 'usa', jordan: 'jordan', syria: 'syria' };
/** Country code in each pin's tag — fixed technical notation, not translated prose, so it doesn't mix scripts under Arabic. */
const countryAbbreviations: Record<string, string> = { dubai: 'UAE', riyadh: 'KSA', cairo: 'Egypt', london: 'UK', usa: 'USA', jordan: 'Jordan', syria: 'Syria' };

function formatCoordinate(lat: number, lng: number) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir} ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

interface OfficeDetailCardProps {
  office: OfficeLocation;
  onNavigate: (direction: 1 | -1) => void;
}

function OfficeDetailCard({ office, onNavigate }: OfficeDetailCardProps) {
  const { t } = useTranslation(['home', 'common']);
  const reducedMotion = useReducedMotion();

  // Touch swipe on the card: left = next office, right = previous (mirrored
  // in RTL, matching the arrows). Only clearly horizontal swipes count, so
  // vertical page scrolling over the card is unaffected.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const swipedLeft = dx < 0;
    onNavigate(swipedLeft !== rtl ? 1 : -1);
  };
  // No address yet → no directions link (and "Pending" in the address row).
  const directionsHref = office.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}` : null;
  const key = locationKeys[office.id];
  const label = key ? t(`common:locations.${key}.label`) : office.label;
  const city = key ? t(`common:locations.${key}.city`) : office.city;
  const country = key ? t(`common:locations.${key}.country`) : office.country;
  const currentIndex = officeLocations.findIndex((entry) => entry.id === office.id);
  const pending = (className?: string) => (
    <Text variant="small" muted className={cn('italic', className)}>
      {t('common:footer.pending')}
    </Text>
  );

  return (
    <div
      className="flex touch-pan-y flex-col overflow-hidden rounded-lg border border-gray-200 bg-warmwhite p-7 shadow-md md:h-full md:p-6 lg:p-9"
      aria-live="polite"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={office.id}
          initial={reducedMotion ? undefined : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex flex-1 flex-col gap-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow className="mb-0">{label}</Eyebrow>
            {office.isHeadquarters && <Badge variant="status">{t('home:regionalPresence.headOffice')}</Badge>}
          </div>

          <div>
            <Heading level="h2" as="h3">
              {city}
            </Heading>
            <Text variant="body" muted className="mt-1">
              {country}
            </Text>
          </div>

          <Stack space="md" className="border-t border-gray-200 pt-6">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone text-brand-600">
                <MapPin size={16} aria-hidden="true" />
              </span>
              {office.address ? (
                <Text variant="small" className="pt-1.5" dir="ltr">
                  {office.address}
                </Text>
              ) : (
                pending('pt-1.5')
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone text-brand-600">
                <Phone size={16} aria-hidden="true" />
              </span>
              {office.phone ? (
                <ContactLink
                  kind="tel"
                  value={office.phone}
                  className="text-small font-semibold text-ink transition-colors duration-base hover:text-brand-600"
                />
              ) : (
                pending()
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone text-brand-600">
                <Mail size={16} aria-hidden="true" />
              </span>
              <ContactLink
                kind="email"
                value={primaryContact.email}
                className="text-small font-semibold text-ink transition-colors duration-base hover:text-brand-600"
              />
            </div>
          </Stack>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2">
            {directionsHref && (
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
              >
                {t('common:buttons.getDirections')}
                <ArrowUpRight size={15} aria-hidden="true" className="rtl:-scale-x-100" />
              </a>
            )}

            <nav aria-label={t('home:regionalPresence.officeNavigation')} className="ms-auto flex items-center gap-1 text-small text-gray-500">
              <IconButton
                icon={ChevronLeft}
                label={t('common:buttons.previousOffice')}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(-1)}
                className="text-gray-500 hover:text-brand-600 rtl:rotate-180"
              />
              <span className="min-w-[3.5rem] text-center font-semibold tabular-nums text-ink" dir="ltr">
                {currentIndex + 1} / {officeLocations.length}
              </span>
              <IconButton
                icon={ChevronRight}
                label={t('common:buttons.nextOffice')}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(1)}
                className="text-gray-500 hover:text-brand-600 rtl:rotate-180"
              />
            </nav>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function RegionalPresence() {
  const { t } = useTranslation(['home', 'common']);
  const headquarters = officeLocations.find((office) => office.isHeadquarters) ?? officeLocations[0];
  const [selectedId, setSelectedId] = useState(headquarters.id);
  const activeOffice = officeLocations.find((office) => office.id === selectedId) ?? headquarters;

  // Arrows and globe pins drive the same selection; the globe flies to it.
  const goToOffice = (direction: 1 | -1) => {
    const currentIndex = officeLocations.findIndex((office) => office.id === selectedId);
    const nextIndex = (currentIndex + direction + officeLocations.length) % officeLocations.length;
    setSelectedId(officeLocations[nextIndex].id);
  };

  return (
    <Section background="warmwhite" spacing="lg" edgeFade>
      <Stack space="xl">
        <SectionHeader
          eyebrow={t('regionalPresence.eyebrow')}
          heading={t('regionalPresence.heading', { count: officeLocations.length })}
          headingAs="h3"
          description={t('regionalPresence.description')}
          descriptionClassName="whitespace-pre-line"
        />
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* 16:10 frame on phones-sized layouts; from tablet up the frame stretches to the office card's height so the two read as a matched pair. */}
          <OfficeGlobe
            pins={officeLocations.map((office) => {
              const key = locationKeys[office.id];
              return {
                office,
                label: `${key ? t(`common:locations.${key}.city`) : office.city}, ${key ? t(`common:locations.${key}.country`) : office.country}`,
                tag: `${office.city}, ${countryAbbreviations[office.id] ?? office.country}`,
                coordinates: formatCoordinate(office.lat, office.lng),
              };
            })}
            selectedId={selectedId}
            onSelect={setSelectedId}
            headOfficeLabel={t('home:regionalPresence.headOffice')}
            className="aspect-[16/10] w-full rounded-lg border border-gray-200 bg-warmwhite shadow-sm md:aspect-auto md:self-stretch"
          />
          <OfficeDetailCard office={activeOffice} onNavigate={goToOffice} />
        </div>
      </Stack>
    </Section>
  );
}
