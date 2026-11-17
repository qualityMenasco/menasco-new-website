import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SmartLink } from '../../lib/SmartLink';
import { cn, slugify } from '../../lib/utils';
import { dataCentreServiceLink, servicesNavigationGroups } from '../../data/navigation';
import { servicesListingUmbrellaImages } from '../../data/services';

interface Umbrella {
  /** Locale key under services:listing.umbrellas.* */
  key: string;
  /** Anchor id — kept identical to the old section ids so existing #links still land. */
  anchor: string;
  href: string;
  name: string;
  image: string;
  sector: boolean;
}

/**
 * Per-tile sizing, in order: MEP (feature), Civil, Manufacturing, EPC, Data
 * Centers (wide). Phones: equal cards in a swipeable row. Tablets: MEP full
 * width over pairs. Desktop: MEP takes the 2×2 slot, Data Centers spans two.
 * Rows grow with their content (minmax) so no text is ever clipped.
 */
const TILE_LAYOUT = [
  'md:col-span-2 md:min-h-[26rem] lg:col-span-2 lg:row-span-2 lg:min-h-0',
  'md:min-h-[20rem] lg:min-h-0',
  'md:min-h-[20rem] lg:min-h-0',
  'md:min-h-[20rem] lg:min-h-0',
  'md:min-h-[20rem] lg:col-span-2 lg:min-h-0',
];

/**
 * Title size that fills the tile without overflowing: scaled to the tile's
 * own width (container query units) by the longest word in the name, capped
 * per tile. Works for any language because it reads the translated name.
 */
function titleSize(name: string, capRem: number) {
  const longest = Math.max(...name.split(/\s+/).map((word) => word.length), 3);
  const cqw = Math.min(40, 78 / (longest * 0.66));
  return `clamp(1.75rem, ${cqw.toFixed(1)}cqw, ${capRem}rem)`;
}

/**
 * The /services index — typographic maximalism over shadowed photography.
 * Each umbrella tile (MEP, Civil, Manufacturing & Prefabrication, EPC, Data
 * Centers) carries a desaturated, heavily darkened photo as texture, so the
 * type does the work: an oversized title sized to fill the tile (last word in
 * MENASCO blue) against small body and label type for extreme contrast of
 * scale. Each tile is one fully
 * clickable link (stretched link on the title). Phones: swipeable row with
 * dots; tablets: paired grid under a full-width MEP tile; desktop: bento.
 */
export function ServicesBento() {
  const { t } = useTranslation(['services', 'nav', 'common']);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const umbrellas: Umbrella[] = [
    ...servicesNavigationGroups
      .filter((group) => group.href)
      .map((group) => ({
        key: group.i18nKey.replace('servicesGroups.', ''),
        anchor: slugify(group.label),
        href: group.href!,
        name: t(`nav:${group.i18nKey}`),
        image: servicesListingUmbrellaImages[group.href!],
        sector: false,
      })),
    {
      key: 'dataCenters',
      anchor: 'data-centres',
      href: dataCentreServiceLink.href,
      name: t(`nav:${dataCentreServiceLink.i18nKey}`),
      image: servicesListingUmbrellaImages[dataCentreServiceLink.href],
      sector: true,
    },
  ];
  const count = umbrellas.length;

  // Phones: which card the row is on (drives the dots). scrollLeft runs negative in RTL.
  const updateActive = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const travelled = Math.abs(rail.scrollLeft);
    const max = rail.scrollWidth - rail.clientWidth;
    const first = rail.firstElementChild as HTMLElement | null;
    const index = travelled >= max - 4 ? count - 1 : first ? Math.round(travelled / (first.offsetWidth + 16)) : 0;
    setActive(Math.min(count - 1, Math.max(0, index)));
  }, [count]);

  useEffect(() => {
    updateActive();
    window.addEventListener('resize', updateActive);
    return () => window.removeEventListener('resize', updateActive);
  }, [updateActive]);

  return (
    <div>
      <div
        ref={railRef}
        onScroll={updateActive}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:auto-rows-[minmax(17rem,auto)] lg:grid-cols-3 xl:auto-rows-[minmax(19rem,auto)]"
      >
        {umbrellas.map((u, index) => {
          const feature = index === 0;
          // Split the name so its last word can carry the accent colour.
          const words = u.name.split(' ');
          const lastWord = words.length > 1 ? words.pop()! : null;
          const leading = words.join(' ');

          return (
            <article
              key={u.href}
              id={u.anchor}
              aria-labelledby={`${u.anchor}-heading`}
              className={cn(
                'group relative isolate flex min-h-[26rem] w-[82vw] max-w-[22rem] shrink-0 snap-start scroll-mt-28 overflow-hidden rounded-md bg-ink [container-type:inline-size] focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-brand-500 md:w-auto md:max-w-none md:shrink',
                TILE_LAYOUT[index],
              )}
            >
              {/* Photo as texture: desaturated and heavily shadowed so the type leads. */}
              <img
                src={u.image}
                alt=""
                loading={index < 2 ? 'eager' : 'lazy'}
                decoding="async"
                className="absolute inset-0 -z-20 h-full w-full object-cover grayscale transition-[transform,filter] duration-slow ease-engineered group-hover:scale-[1.04] group-hover:grayscale-[60%] motion-reduce:transition-none"
              />
              <span aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/80 transition-colors duration-slow group-hover:bg-ink/70" />
              <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

              <div className="relative flex w-full flex-col justify-between gap-8 p-6 md:p-7 lg:p-8">
                {/* Top row: micro label (Data Centers only) at the start, liquid-glass Explore pill at the end. */}
                <div className="flex items-start justify-between gap-4">
                  {u.sector ? (
                    <span className="pt-2.5 font-display text-caption font-semibold uppercase tracking-[0.25em] text-brand-300 rtl:tracking-normal">
                      {t('services:listing.sectorSolution')}
                    </span>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  <span
                    aria-hidden="true"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-small font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md backdrop-saturate-150 transition-colors duration-base group-hover:border-white/40 group-hover:bg-white/20"
                  >
                    {t('common:buttons.explore')}
                    <ArrowRight size={14} className="transition-transform duration-base group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </div>

                <div>
                  <h3
                    id={`${u.anchor}-heading`}
                    className="font-display font-bold leading-[0.95] tracking-tight text-white"
                    style={{ fontSize: titleSize(u.name, feature ? 7.5 : 3.5) }}
                  >
                    {/* Stretched link: the whole tile opens the umbrella page. */}
                    <SmartLink href={u.href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                      {lastWord ? (
                        <>
                          {leading}{' '}
                          <span className="text-brand-400">{lastWord}</span>
                        </>
                      ) : (
                        u.name
                      )}
                    </SmartLink>
                  </h3>
                  <p className={cn('mt-4 text-gray-300', feature ? 'max-w-md text-body md:text-body-lg' : 'max-w-xs text-small')}>
                    {t(`services:listing.umbrellas.${u.key}`)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Phones: one dot per service, the current one stretched into a short pill (same style as the home rails). */}
      <div aria-hidden="true" className="flex justify-center gap-1.5 pt-4 md:hidden">
        {umbrellas.map((u, index) => (
          <span key={u.href} className={cn('h-1.5 rounded-full transition-all duration-base', index === active ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300')} />
        ))}
      </div>
    </div>
  );
}
