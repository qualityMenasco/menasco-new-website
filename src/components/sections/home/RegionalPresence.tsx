import { useState, type CSSProperties } from 'react';
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
import { regionalMapLandPaths } from '../../../data/regionalMapPaths';

const locationKeys: Record<string, string> = { dubai: 'dubai', riyadh: 'riyadh', cairo: 'cairo', london: 'london' };
const countryAbbreviations: Record<string, string> = { dubai: 'UAE', riyadh: 'KSA', cairo: 'Egypt', london: 'UK' };

/**
 * Node positions are a simple linear (equirectangular) projection of each
 * office's real longitude/latitude, bounded to a box tailored just to these
 * four cities (not the whole world) so they spread naturally across the
 * canvas — this is a technical network diagram, not a literal map, so the
 * projection only needs to preserve relative direction/distance, not
 * cartographic accuracy. `labelDir` is a hand-placed layout choice (which
 * side of the node its label reads from) to keep the four labels from
 * overlapping — Riyadh and Dubai sit close together geographically, so one
 * reads below its node and the other above.
 */
const PROJECTION_BOUNDS = { lonMin: -8, lonMax: 63, latMin: 18, latMax: 56 };
const labelDirections: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
  london: 'right',
  cairo: 'bottom',
  riyadh: 'bottom',
  dubai: 'top',
};

function projectFlat(lat: number, lng: number) {
  const { lonMin, lonMax, latMin, latMax } = PROJECTION_BOUNDS;
  const x = ((lng - lonMin) / (lonMax - lonMin)) * 100;
  const y = 100 - ((lat - latMin) / (latMax - latMin)) * 100;
  return { x, y };
}

function formatCoordinate(lat: number, lng: number) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir} ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

/**
 * Small hand-tuned corrections on top of each office's true projected
 * position, verified against the exact land-path geometry in
 * `regionalMapPaths.ts` (point-in-polygon + distance-to-coastline checks) —
 * not aesthetic spacing. Cairo's true projection sits close to the
 * Delta/Sinai coastline edge at this map's simplification level, so it's
 * nudged south/west to read clearly as inland Egypt. Riyadh's true
 * projection, while technically well inside the peninsula, sits close
 * enough to the Dubai cluster to visually read as coastal at this scale, so
 * it's nudged further into the interior for a clearer "central Saudi
 * Arabia" read. London and Dubai are left at their true projected
 * positions (London already reads clearly inland; Dubai is genuinely
 * coastal and should stay that way).
 */
const positionNudges: Partial<Record<string, { x?: number; y?: number }>> = {
  cairo: { x: -2, y: 3 },
  riyadh: { x: -3, y: 2 },
};

const nodePositions: Record<string, { x: number; y: number; labelDir: 'top' | 'bottom' | 'left' | 'right' }> = Object.fromEntries(
  officeLocations.map((office) => {
    const base = projectFlat(office.lat, office.lng);
    const nudge = positionNudges[office.id];
    return [
      office.id,
      { x: base.x + (nudge?.x ?? 0), y: base.y + (nudge?.y ?? 0), labelDir: labelDirections[office.id] ?? 'right' },
    ];
  }),
);

const labelOffsetByDir: Record<string, CSSProperties> = {
  right: { transform: 'translate(16px, -50%)', textAlign: 'left' },
  left: { transform: 'translate(calc(-100% - 16px), -50%)', textAlign: 'right' },
  top: { transform: 'translate(-50%, calc(-100% - 14px))', textAlign: 'center' },
  bottom: { transform: 'translate(-50%, 14px)', textAlign: 'center' },
};

interface NetworkNodeProps {
  office: OfficeLocation;
  isActive: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

function NetworkNode({ office, isActive, isSelected, onHover, onSelect }: NetworkNodeProps) {
  const { t } = useTranslation(['common', 'home']);
  const reducedMotion = useReducedMotion();
  const position = nodePositions[office.id];
  const isHq = Boolean(office.isHeadquarters);

  const key = locationKeys[office.id];
  // The aria-label is localized, like the rest of the site.
  const city = key ? t(`common:locations.${key}.city`) : office.city;
  const country = key ? t(`common:locations.${key}.country`) : office.country;
  // The visible node tag reads like the coordinates beneath it — a fixed
  // technical notation (city + country code), not translated prose — so it
  // doesn't mix scripts under Arabic (e.g. "لندن, UK").
  const tagCity = office.city;
  const tagCountry = countryAbbreviations[office.id] ?? office.country;

  return (
    <>
      <button
        type="button"
        aria-label={t('home:regionalPresence.viewOffice', { city, country })}
        aria-pressed={isSelected}
        onMouseEnter={() => onHover(office.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(office.id)}
        onBlur={() => onHover(null)}
        onClick={() => onSelect(office.id)}
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
        className="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center focus-visible:outline-none"
      >
        {/* Translucent outer halo — stronger once active/hovered. */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute rounded-full transition-all duration-300 ease-engineered',
            isHq ? 'h-11 w-11' : 'h-9 w-9',
            isActive ? 'bg-brand-400/25 opacity-100' : 'bg-brand-300/15 opacity-0 group-hover:opacity-100',
          )}
        />
        {/* Persistent pulse — reserved for the truly-selected office. */}
        {isSelected && !reducedMotion && (
          <span
            aria-hidden="true"
            className={cn('absolute animate-ping rounded-full bg-brand-400/40', isHq ? 'h-7 w-7' : 'h-5 w-5')}
          />
        )}
        {/* Outline ring. */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute rounded-full border-2 transition-all duration-300 ease-engineered',
            isHq ? 'h-8 w-8' : 'h-6 w-6',
            isActive ? 'border-brand-500 opacity-100' : 'border-brand-300/70 opacity-70 group-hover:opacity-100',
          )}
        />
        {/* Solid center. */}
        <span
          aria-hidden="true"
          className={cn(
            'relative rounded-full bg-brand-600 ring-2 ring-warmwhite transition-transform duration-300 ease-engineered',
            isHq ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5',
            isActive ? 'scale-110' : 'scale-100',
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full group-focus-visible:ring-2 group-focus-visible:ring-brand-600 group-focus-visible:ring-offset-2"
        />
      </button>

      {/* Label — visually attached to the node, mouse-clickable for a larger hit area, but not
          a separate keyboard/AT stop (the node button above is the one accessible control). */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => onSelect(office.id)}
        onMouseEnter={() => onHover(office.id)}
        onMouseLeave={() => onHover(null)}
        style={{ left: `${position.x}%`, top: `${position.y}%`, ...labelOffsetByDir[position.labelDir] }}
        className="absolute flex cursor-pointer flex-col gap-0.5 whitespace-nowrap"
        dir="ltr"
      >
        {isHq && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">
            {t('home:regionalPresence.headOffice')}
          </span>
        )}
        <span
          className={cn(
            'font-display text-small font-semibold uppercase tracking-wide transition-colors duration-300 ease-engineered',
            isActive ? 'text-ink' : 'text-gray-500',
          )}
        >
          {tagCity}, {tagCountry}
        </span>
        <span
          className={cn(
            'hidden font-mono text-[11px] font-medium tracking-tight transition-colors duration-300 ease-engineered sm:block',
            isActive ? 'text-brand-600/80' : 'text-gray-400',
          )}
          dir="ltr"
        >
          {formatCoordinate(office.lat, office.lng)}
        </span>
      </button>
    </>
  );
}

/**
 * Static geographic backdrop for the office network — real (simplified)
 * coastlines for the UK/Ireland, continental Europe, the Mediterranean rim,
 * North Africa/Egypt, and the Arabian Peninsula, pre-projected into the same
 * 0–100 viewBox and lon/lat window the office markers use (see
 * PROJECTION_BOUNDS/projectFlat), so the landmasses sit accurately under
 * their real-world region — see `regionalMapLandPaths` for provenance.
 * Purely decorative context: aria-hidden, pointer-events-none, and rendered
 * as its own absolutely-positioned layer behind the interactive network SVG
 * so it can never intercept clicks/hover and never animates on its own.
 */
function RegionalMapBackground() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Paper-cut relief: a tight directional shadow for crisp coastline
            definition, plus a wider/softer ambient shadow underneath for a
            physically-raised feel. Light source is upper-left, so both
            shadows fall down-and-right, matching the reference artwork. */}
        <filter id="landmassEmboss" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0.8" dy="1.1" stdDeviation="0.9" floodColor="#141e28" floodOpacity="0.16" />
          <feDropShadow dx="1.6" dy="2.2" stdDeviation="2.2" floodColor="#141e28" floodOpacity="0.06" />
        </filter>
      </defs>
      <g filter="url(#landmassEmboss)">
        {regionalMapLandPaths.map((d, index) => (
          <path key={index} d={d} fill="#ffffff" />
        ))}
      </g>
    </svg>
  );
}

interface RegionalMapProps {
  activeId: string;
  selectedId: string;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

function RegionalMap({ activeId, selectedId, onHover, onSelect }: RegionalMapProps) {
  const headquarters = officeLocations.find((office) => office.isHeadquarters) ?? officeLocations[0];
  const hqPosition = nodePositions[headquarters.id];
  const activePosition = nodePositions[activeId];

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-warmwhite p-6 shadow-sm sm:p-10 lg:h-full lg:min-h-[460px] lg:p-12"
      onMouseLeave={() => onHover(null)}
    >
      <div className="relative isolate aspect-[4/5] w-full max-w-[640px] sm:aspect-[3/2]">
        <RegionalMapBackground />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {officeLocations
            .filter((office) => !office.isHeadquarters)
            .map((office) => {
              const from = nodePositions[office.id];
              const to = hqPosition;
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.hypot(dx, dy) || 1;
              const curve = len * 0.16;
              const cx = mx - (dy / len) * curve;
              const cy = my + (dx / len) * curve;
              const isConnectionActive = office.id === activeId || headquarters.id === activeId;

              return (
                <path
                  key={office.id}
                  d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                  fill="none"
                  stroke="#1cb7f0"
                  strokeWidth={isConnectionActive ? 0.45 : 0.3}
                  strokeDasharray="1.4 1.4"
                  strokeLinecap="round"
                  opacity={isConnectionActive ? 0.55 : 0.22}
                  style={{ transition: 'opacity 300ms ease, stroke-width 300ms ease' }}
                />
              );
            })}

          {/* Spotlight beneath the active node, easing between selections. */}
          {activePosition && (
            <circle
              cx={activePosition.x}
              cy={activePosition.y}
              r="6"
              fill="#1cb7f0"
              opacity="0.12"
              style={{ transition: 'cx 350ms cubic-bezier(0.22,0.61,0.36,1), cy 350ms cubic-bezier(0.22,0.61,0.36,1)' }}
            />
          )}
        </svg>

        {officeLocations.map((office) => (
          <NetworkNode
            key={office.id}
            office={office}
            isActive={office.id === activeId}
            isSelected={office.id === selectedId}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

interface OfficeDetailCardProps {
  office: OfficeLocation;
  onNavigate: (direction: 1 | -1) => void;
}

function OfficeDetailCard({ office, onNavigate }: OfficeDetailCardProps) {
  const { t } = useTranslation(['home', 'common']);
  const reducedMotion = useReducedMotion();
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`;
  const key = locationKeys[office.id];
  const label = key ? t(`common:locations.${key}.label`) : office.label;
  const city = key ? t(`common:locations.${key}.city`) : office.city;
  const country = key ? t(`common:locations.${key}.country`) : office.country;
  const currentIndex = officeLocations.findIndex((entry) => entry.id === office.id);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-warmwhite p-7 shadow-md md:p-9 lg:h-full"
      aria-live="polite"
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
              <Text variant="small" className="pt-1.5" dir="ltr">
                {office.address}
              </Text>
            </div>
            {office.phone && (
              <div className="flex items-center gap-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone text-brand-600">
                  <Phone size={16} aria-hidden="true" />
                </span>
                <a
                  href={`tel:${office.phone.replace(/\s+/g, '')}`}
                  dir="ltr"
                  className="text-small font-semibold text-ink transition-colors duration-base hover:text-brand-600"
                >
                  {office.phone}
                </a>
              </div>
            )}
            <div className="flex items-center gap-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone text-brand-600">
                <Mail size={16} aria-hidden="true" />
              </span>
              <a
                href={`mailto:${primaryContact.email}`}
                dir="ltr"
                className="text-small font-semibold text-ink transition-colors duration-base hover:text-brand-600"
              >
                {primaryContact.email}
              </a>
            </div>
          </Stack>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2">
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
            >
              {t('common:buttons.getDirections')}
              <ArrowUpRight size={15} aria-hidden="true" className="rtl:-scale-x-100" />
            </a>

            <nav aria-label={t('home:regionalPresence.officeNavigation')} className="flex items-center gap-1 text-small text-gray-500">
              <IconButton
                icon={ChevronLeft}
                label={t('common:buttons.previousOffice')}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(-1)}
                className="text-gray-400 hover:text-brand-600 rtl:rotate-180"
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
                className="text-gray-400 hover:text-brand-600 rtl:rotate-180"
              />
            </nav>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function RegionalPresence() {
  const { t } = useTranslation('home');
  const headquarters = officeLocations.find((office) => office.isHeadquarters) ?? officeLocations[0];
  const [selectedId, setSelectedId] = useState(headquarters.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = hoveredId ?? selectedId;
  const activeOffice = officeLocations.find((office) => office.id === activeId) ?? headquarters;

  // Arrow-driven navigation always sets the persistent selection (same state
  // a map-pin click uses), independent of any transient hover preview.
  const goToOffice = (direction: 1 | -1) => {
    const currentIndex = officeLocations.findIndex((office) => office.id === activeId);
    const nextIndex = (currentIndex + direction + officeLocations.length) % officeLocations.length;
    setSelectedId(officeLocations[nextIndex].id);
  };

  return (
    <Section background="warmwhite" spacing="lg" edgeFade>
      <Stack space="xl">
        <SectionHeader
          eyebrow={t('regionalPresence.eyebrow')}
          heading={t('regionalPresence.heading')}
          headingAs="h3"
          description={t('regionalPresence.description')}
          descriptionClassName="whitespace-pre-line"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
          <RegionalMap activeId={activeId} selectedId={selectedId} onHover={setHoveredId} onSelect={setSelectedId} />
          <OfficeDetailCard office={activeOffice} onNavigate={goToOffice} />
        </div>
      </Stack>
    </Section>
  );
}
