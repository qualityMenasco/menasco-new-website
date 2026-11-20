import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '../../ui/Button';
import { Container } from '../../layout/Container';
import { cn } from '../../../lib/utils';
import { dcTechnical } from '../../../data/dataCenterTechnical';
import { RailDots, useRail } from './shared';

interface Capability {
  title: string;
  description: string;
}

/**
 * "MENASCO in data centers": the section directly below the hero. Built from
 * the approved services:dataCenter copy (EN + AR): intro, capabilities and
 * prefabrication. No text reactions in this section (client request).
 */
/** Fabrication items shown per group below lg before "Show all". */
const PREFAB_PREVIEW = 3;

export function CapabilitySection() {
  const { t } = useTranslation('services');
  const intro = t('dataCenter.introParagraphs', { returnObjects: true }) as string[];
  const caps = t('dataCenter.capabilities', { returnObjects: true }) as Capability[];
  const c = dcTechnical.capability;
  // Below md the capabilities are a swipe rail (shared helper).
  const { railRef, active, onScroll: onRailScroll } = useRail();

  return (
    <section className="relative bg-warmwhite">
      <Container className="relative z-[2] py-14 md:py-20">
        {/* Intro */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Heading sits in the upper part of the row: free space split 1 : 2 above / below. */}
          <div className="flex flex-col lg:col-span-5 lg:before:flex-[1] lg:before:content-[''] lg:after:flex-[2] lg:after:content-['']">
            <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.eyebrow}</p>
            <h2 className="mt-5 font-display text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-semibold leading-[1.06] tracking-tight text-ink text-balance">
              {t('dataCenter.introHeading.heading')}
            </h2>
          </div>
          <div className="space-y-5 lg:col-span-7">
            {intro.slice(0, 1).map((p, i) => (
              <p key={i} className={cn('leading-relaxed', i === 0 ? 'text-body-lg text-gray-700' : 'text-body text-gray-600')}>
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Capabilities: a 3x2 grid from tablet (md) up; below md, where three columns no longer
            fit, a swipeable, snapping card rail with position dots (all six cards stay in the HTML). */}
        <div className="relative mt-10">
          <div
            ref={(el) => {
              railRef.current = el;
            }}
            onScroll={onRailScroll}
            className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-px md:overflow-hidden md:rounded-lg md:border md:border-gray-200 md:bg-gray-200 md:px-0 md:pb-0"
          >
            {caps.slice(0, 6).map((cap, i) => (
              <article
                key={cap.title}
                className="flex w-[82%] shrink-0 snap-start flex-col rounded-lg border border-gray-200 bg-white p-7 sm:w-[60%] md:w-auto md:rounded-none md:border-0 md:p-6 lg:p-7"
              >
                <span className="font-display text-caption font-semibold tabular-nums text-gray-400">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-display text-h4 font-semibold leading-snug text-ink">{cap.title}</h3>
                <p className="mt-3 text-small leading-relaxed text-gray-600">{cap.description}</p>
              </article>
            ))}
          </div>
          <RailDots count={Math.min(6, caps.length)} active={active} />
        </div>
      </Container>
    </section>
  );
}

/**
 * Prefabrication, a section of its own (client request): full-width charcoal band
 * directly after the capability section.
 */
export function PrefabSection() {
  const { t } = useTranslation('services');
  const prefabGroups = t('dataCenter.prefab.groups', { returnObjects: true }) as { label: string; items: string[] }[];
  const prefabTotal = prefabGroups.reduce((n, g) => n + g.items.length, 0);
  const [showAllPrefab, setShowAllPrefab] = useState(false);

  return (
    <section className="relative bg-charcoal">
      <Container className="relative z-[2] py-14 md:py-16">
      {/* Prefabrication: header row (heading | snippet + link), then the fabrication items
          grouped by system in three columns (MACS in-house manufacture, data-center-relevant
          only). Below lg each group shows its first PREFAB_PREVIEW items until "Show all";
          hidden items stay in the HTML (CSS-hidden) so crawlers still read the full list. */}
      <div>
        {/* Eyebrow on its own row so the heading and snippet start on the same line (wide screens). */}
        <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-400 rtl:tracking-normal">{t('dataCenter.prefab.eyebrow')}</p>
        {/* Wide screens: heading with "Explore more" under it (left), snippet (right).
            Below lg the DOM order applies: heading, snippet, button. */}
        <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-6">
          <h3 className="font-display text-h3 font-semibold leading-snug text-white text-balance lg:col-span-6 lg:col-start-1 lg:row-start-1">{t('dataCenter.prefab.heading')}</h3>
          <p className="text-body leading-relaxed text-gray-300 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1">{t('dataCenter.prefab.snippet')}</p>
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-2">
            <ButtonLink href="/services/manufacturing-prefabrication" variant="outline" theme="dark" trailingIcon={ArrowRight}>
              {t('dataCenter.prefab.cta')}
            </ButtonLink>
          </div>
        </div>

        <div id="dc-prefab-items" className="mt-8 grid grid-cols-1 gap-8 border-t border-white/10 pt-8 md:grid-cols-3 md:gap-8 lg:gap-12">
          {prefabGroups.map((group) => (
            <div key={group.label}>
              <h4 className="font-display text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{group.label}</h4>
              <ul className="mt-4 space-y-3">
                {group.items.map((item, i) => (
                  <li
                    key={item}
                    className={cn(
                      'flex gap-3 text-small leading-snug text-gray-200',
                      !showAllPrefab && i >= PREFAB_PREVIEW && 'hidden lg:flex',
                    )}
                  >
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {prefabTotal > PREFAB_PREVIEW * prefabGroups.length && (
          <button
            type="button"
            aria-expanded={showAllPrefab}
            aria-controls="dc-prefab-items"
            onClick={() => setShowAllPrefab((v) => !v)}
            className="mt-6 inline-flex items-center gap-1.5 font-display text-small font-semibold text-brand-400 transition-colors hover:text-white lg:hidden"
          >
            {showAllPrefab ? t('dataCenter.prefab.showLess') : t('dataCenter.prefab.showAll', { count: prefabTotal })}
            <ChevronDown aria-hidden="true" className={cn('h-4 w-4 transition-transform', showAllPrefab && 'rotate-180')} />
          </button>
        )}
      </div>
      </Container>
    </section>
  );
}
