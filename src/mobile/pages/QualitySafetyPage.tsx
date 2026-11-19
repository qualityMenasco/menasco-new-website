import { useEffect, useRef, useState } from 'react';
import { HeroH1 } from '../../components/typography/HeroH1';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { ExpandableText } from '../components/ExpandableText';
import { type AccordionTopic } from '../../components/sections/quality/TopicAccordion';
import { TopicTabs } from '../../components/sections/quality/TopicTabs';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { certifications } from '../../data/certifications';
import { qhseAnnotations, qhseHeroPhoto, qualitySafetyPhotos } from '../../data/siteSafety';
import { cn } from '../lib/utils';

/*
 * Phone/tablet version of Quality, Health & Safety — same copy and sections as
 * desktop, in the site's standard mobile components: the hero callouts become
 * tappable numbered points, Quality and Safety swipe (side by side on tablets),
 * and the commitment text sits behind "Read more".
 */

const scopeKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

type DisciplineCopy = { tag: string; title: string; lead: string; points: string[] };
type ResultGroup = { tag: string; stats: { value: string; label: string }[]; text: string };

/** Same photos and crops as desktop: the team reviewing works for Quality, the site at sunset for Safety. */
const disciplines = [
  { key: 'quality' as const, photo: qualitySafetyPhotos.portraits[1], focus: 'object-[50%_25%]', risk: false },
  { key: 'safety' as const, photo: qualitySafetyPhotos.landscape, focus: 'object-center', risk: true },
];

/*
 * The hero photo is cropped to a 3:4 frame (the source is ~4:7) so it isn't
 * awkwardly tall on phones. The frame shows the image from 20% down; the
 * callout coordinates (percentages of the full photo) are remapped into it.
 */
const PHOTO_RATIO = 753 / 1280;
const FRAME_RATIO = 3 / 4;
const VISIBLE = (PHOTO_RATIO / FRAME_RATIO) * 100; // % of the photo's height inside the frame
const OFFSET = 20; // % of the photo's height above the frame
const framePosY = (OFFSET / (100 - VISIBLE)) * 100;
const toFrameY = (y: number) => ((y - OFFSET) / VISIBLE) * 100;

/**
 * The annotated site photo with tappable numbered points. The selected point's
 * note fades into one fixed slot under the photo (the hint shows there when
 * nothing is selected), so it never covers the photo and always appears in
 * the same place.
 */
function HeroHotspots() {
  const { t } = useTranslation(['about', 'common']);
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const current = open === null ? null : qhseAnnotations[open];
  const fade = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -6 },
    transition: { duration: reducedMotion ? 0 : 0.22, ease: [0.22, 0.61, 0.36, 1] as const },
  };
  return (
    // Stacked (under 440px) the photo is capped and centred; side by side it fills its column.
    // There the note slot is taken out of the flow (absolute, under the photo) so the photo itself
    // centres on the text; the section reserves room for it with extra bottom padding.
    <div className="relative mx-auto w-full max-w-[22rem] min-[440px]:max-w-none">
      <div className="relative aspect-[3/4]">
        <img
          src={qhseHeroPhoto.src}
          alt={qhseHeroPhoto.alt}
          className="h-full w-full rounded-md object-cover contrast-[1.08] grayscale"
          style={{ objectPosition: `50% ${framePosY}%` }}
        />
        {qhseAnnotations.map((a, i) => {
          const risk = a.kind === 'risk';
          const active = open === i;
          return (
            // Physical left/top: the photo doesn't mirror in Arabic, so neither do its features.
            <button
              key={a.key}
              type="button"
              onClick={() => setOpen(active ? null : i)}
              aria-expanded={active}
              aria-controls="qhse-hotspot-note"
              aria-label={t(`qualitySafetyPage.hero.annotations.${a.key}.title`)}
              className={cn(
                'absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-small font-bold tabular-nums transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warmwhite',
                risk ? 'border-warning' : 'border-brand-400',
                active ? cn('scale-110', risk ? 'bg-warning text-ink' : 'bg-brand-400 text-ink') : cn('bg-ink/70', risk ? 'text-warning' : 'text-brand-400'),
              )}
              style={{ left: `${a.x}%`, top: `${toFrameY(a.y)}%` }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      {/* Fixed-height slot: the note (or the hint) crossfades here, so nothing jumps. */}
      <div id="qhse-hotspot-note" aria-live="polite" className="mt-4 min-h-[4.5rem] min-[440px]:absolute min-[440px]:inset-x-0 min-[440px]:top-full">
        <AnimatePresence mode="wait" initial={false}>
          {current ? (
            <motion.div key={current.key} {...fade} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-small font-bold tabular-nums text-ink',
                  current.kind === 'risk' ? 'bg-warning' : 'bg-brand-400',
                )}
              >
                {(open ?? 0) + 1}
              </span>
              <span>
                <span className={cn('block text-body font-semibold', current.kind === 'risk' ? 'text-warning' : 'text-brand-400')}>
                  {t(`qualitySafetyPage.hero.annotations.${current.key}.title`)}
                </span>
                <span className="mt-0.5 block text-small text-gray-300">{t(`qualitySafetyPage.hero.annotations.${current.key}.note`)}</span>
              </span>
            </motion.div>
          ) : (
            <motion.p key="hint" {...fade} className="pt-1 text-center text-small text-gray-400">
              {t('qualitySafetyPage.hero.tapHint')}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {/* All four notes, not displayed (the slot above shows one at a time), so every note is in the HTML. */}
      <ul hidden>
        {qhseAnnotations.map((a) => (
          <li key={a.key}>
            {t(`qualitySafetyPage.hero.annotations.${a.key}.title`)}: {t(`qualitySafetyPage.hero.annotations.${a.key}.note`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Hero. From 440px up: the text beside the annotated photo. On narrower phones
 * the two would only fit stacked, so they become two side-by-side panels in a
 * horizontal scroller (swipe), with a tab switcher above that follows the
 * scroll position and scrolls to a panel when tapped.
 */
function Hero() {
  const { t } = useTranslation(['about', 'common']);
  const reducedMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [panel, setPanel] = useState(0);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  // Narrow phones: the two panels sit side by side in a swipe row, which would
  // otherwise always be as tall as the taller (photo) panel. Size the row to
  // the visible panel instead, and keep it in sync as content reflows.
  useEffect(() => {
    const measure = () => {
      const narrow = window.matchMedia('(max-width: 439px)').matches;
      const el = panelRefs[panel].current;
      setPanelHeight(narrow && el ? el.offsetHeight : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    panelRefs.forEach((r) => r.current && ro.observe(r.current));
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);
  const tabs = [t('qualitySafetyPage.hero.tabs.overview'), t('qualitySafetyPage.hero.tabs.photo')];

  const onScroll = () => {
    const el = scrollerRef.current;
    if (el && el.clientWidth) setPanel(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };
  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    el.scrollTo({ left: (rtl ? -1 : 1) * i * el.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
    setPanel(i);
  };

  return (
    <section className="bg-ink px-4 pb-10 pt-6 min-[440px]:pb-28 min-[440px]:pt-8 md:px-8">
      {/* Tab switcher, narrow phones only. */}
      <div role="tablist" aria-label={t('qualitySafetyPage.heading')} className="mb-6 grid grid-cols-2 rounded-full bg-white/10 p-1 min-[440px]:hidden">
        {tabs.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            id={`qhse-hero-tab-${i}`}
            aria-selected={panel === i}
            aria-controls={`qhse-hero-panel-${i}`}
            onClick={() => goTo(i)}
            className={cn(
              'rounded-full px-3 py-2 text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warmwhite',
              panel === i ? 'bg-warmwhite text-ink' : 'text-gray-300',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        style={panelHeight ? { height: panelHeight } : undefined}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory items-start overflow-x-auto overflow-y-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none min-[440px]:items-center min-[440px]:mx-0 min-[440px]:grid min-[440px]:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] min-[440px]:gap-5 min-[440px]:overflow-visible sm:gap-6"
      >
        <div ref={panelRefs[0]} id="qhse-hero-panel-0" role="tabpanel" aria-labelledby="qhse-hero-tab-0" className="w-full shrink-0 snap-start px-4 min-[440px]:w-auto min-[440px]:px-0">
          <HeroH1
            eyebrow={<span className="block text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('qualitySafetyPage.eyebrow')}</span>}
            title={
              <span className="mt-2 block font-display text-h1 font-semibold tracking-tight text-warmwhite text-balance min-[440px]:text-h2 sm:text-h1">
                {t('qualitySafetyPage.heading')}
              </span>
            }
          />
          <p className="mt-3 text-body text-gray-300 min-[440px]:text-small sm:text-body">{t('qualitySafetyPage.description')}</p>
          <a
            href="/certificates/qhse-policy.pdf"
            download="MENASCO-QHSE-Policy-2026.pdf"
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-body font-semibold text-warmwhite min-[440px]:text-small sm:text-body md:w-fit md:px-8"
          >
            <Download size={16} aria-hidden="true" className="shrink-0" />
            {t('qualitySafetyPage.downloadPolicy')}
          </a>
        </div>
        <div ref={panelRefs[1]} id="qhse-hero-panel-1" role="tabpanel" aria-labelledby="qhse-hero-tab-1" className="w-full shrink-0 snap-start px-4 min-[440px]:w-auto min-[440px]:px-0">
          <HeroHotspots />
        </div>
      </div>
    </section>
  );
}

export default function QualitySafetyPage() {
  const { t } = useTranslation(['about', 'common']);
  const commitment = t('qualitySafetyPage.commitment.paragraphs', { returnObjects: true }) as string[];
  const topics = t('qualitySafetyPage.commitment.topics', { returnObjects: true }) as AccordionTopic[];
  const railRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const onRailScroll = () => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (rail && first) setActiveCard(Math.min(disciplines.length - 1, Math.round(Math.abs(rail.scrollLeft) / (first.offsetWidth + 12))));
  };

  return (
    <>
      <SEO
        title={t('qualitySafetyPage.seo.title')}
        description={t('qualitySafetyPage.seo.description')}
        path="/quality-safety"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Quality, Health & Safety', path: '/quality-safety' }]}
      />

      <Hero />

      {/* Quality and Safety: a swipeable row of equal-height cards on phones, side by side on tablets. */}
      <section className="px-4 py-10 md:px-8">
        <SectionHeader eyebrow={t('qualitySafetyPage.disciplines.eyebrow')} heading={t('qualitySafetyPage.disciplines.heading')} headingAs="h3" />
        <div
          ref={railRef}
          onScroll={onRailScroll}
          className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-px-4 px-4 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0"
        >
          {disciplines.map(({ key, photo, focus, risk }) => {
            const copy = t(`qualitySafetyPage.disciplines.${key}`, { returnObjects: true }) as DisciplineCopy;
            return (
              <article key={key} className="flex w-[84vw] max-w-[22rem] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-gray-200 bg-stone md:w-auto md:max-w-none">
                {/* Absolutely positioned so the photo's own size can't stretch the 4:3 frame (it's a flex child). */}
                <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-gray-100">
                  <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className={cn('absolute inset-0 h-full w-full object-cover', focus)} />
                </div>
                <div className="p-5">
                  <span className={cn('inline-flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-widest', risk ? 'text-warning' : 'text-brand-600')}>
                    <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', risk ? 'bg-warning' : 'bg-brand-600')} />
                    {copy.tag}
                  </span>
                  <h4 className="mt-2 font-display text-h4 font-semibold text-ink">{copy.title}</h4>
                  <p className="mt-2 text-body text-gray-600">{copy.lead}</p>
                  <ul className="mt-4 space-y-2">
                    {copy.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-small text-ink">
                        <span aria-hidden="true" className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', risk ? 'bg-warning' : 'bg-brand-600')} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
        <div aria-hidden="true" className="mt-4 flex justify-center gap-1.5 md:hidden">
          {disciplines.map((d, i) => (
            <span key={d.key} className={cn('h-1.5 rounded-full transition-all duration-base', i === activeCard ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300')} />
          ))}
        </div>
      </section>

      {/* Three-year results on a dark band. */}
      <section className="bg-charcoal px-4 py-10 md:px-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('qualitySafetyPage.results.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite text-balance">{t('qualitySafetyPage.results.heading')}</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(['safety', 'quality'] as const).map((key) => {
            const g = t(`qualitySafetyPage.results.${key}`, { returnObjects: true }) as ResultGroup;
            const risk = key === 'safety';
            return (
              <div key={key} className="rounded-md border border-white/10 bg-graphite p-5">
                <span className={cn('inline-flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-widest', risk ? 'text-warning' : 'text-brand-400')}>
                  <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', risk ? 'bg-warning' : 'bg-brand-400')} />
                  {g.tag}
                </span>
                <dl className={cn('mt-4 grid gap-4', g.stats.length > 1 && 'grid-cols-2')}>
                  {g.stats.map((s) => (
                    <div key={s.label}>
                      <dd dir="ltr" className="font-display text-stat font-semibold leading-none text-brand-400 rtl:text-end">
                        {s.value}
                      </dd>
                      <dt className="mt-2 text-small text-gray-300">{s.label}<span aria-hidden="true">*</span></dt>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 border-t border-white/10 pt-4 text-small text-gray-300">{g.text}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-caption text-gray-400">* {t('qualitySafetyPage.results.footnote')}</p>
      </section>

      {/* What clients can expect, beside the site engineer's portrait at full length; the rest behind "Read more". */}
      <section className="px-4 py-10 md:grid md:grid-cols-2 md:items-center md:gap-8 md:px-8">
        <div className="mx-auto aspect-[4/5] max-w-[22rem] overflow-hidden rounded-md bg-gray-100 md:col-start-2 md:row-start-1 md:max-w-none">
          <img src={qualitySafetyPhotos.portraits[0].src} alt={qualitySafetyPhotos.portraits[0].alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
        <div className="mt-6 md:col-start-1 md:row-start-1 md:mt-0">
          <SectionHeader eyebrow={t('qualitySafetyPage.commitment.eyebrow')} heading={t('qualitySafetyPage.commitment.heading')} headingAs="h3" />
          <ExpandableText
            className="mt-4"
            summary={commitment[0]}
            paragraphs={commitment.slice(1)}
            expandLabel={t('common:buttons.readMore')}
            collapseLabel={t('common:buttons.showLess')}
          />
        </div>
        {/* The detail behind the overview: six topics as tabs (pills on phones, a list beside the panel on tablets). */}
        <TopicTabs topics={topics} idPrefix="qhse-topic-m" label={t('qualitySafetyPage.commitment.heading')} className="mt-8 md:col-span-2 md:row-start-2 md:mt-6" />
      </section>

      {/* The three ISO certificates as one connected list. */}
      <section className="bg-stone px-4 py-10 md:px-8">
        <SectionHeader eyebrow={t('qualitySafetyPage.certs.eyebrow')} heading={t('qualitySafetyPage.certs.heading')} headingAs="h3" />
        <div className="mt-6 divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 bg-warmwhite md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
          {certifications.map((c) => {
            const scope = scopeKeys[c.name] ? t(`common:certifications.${scopeKeys[c.name]}`) : c.scope;
            const body = (
              <>
                <span dir="ltr" className="block font-display text-h4 font-semibold text-ink rtl:text-end">
                  {c.name}
                </span>
                <span className="mt-1 block text-small text-gray-600">{scope}</span>
                {c.fileUrl && (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
                    {t('qualitySafetyPage.certs.viewCertificate')}
                    <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
                  </span>
                )}
              </>
            );
            return c.fileUrl ? (
              <a key={c.name} href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="block p-4">
                {body}
              </a>
            ) : (
              <div key={c.name} className="p-4">
                {body}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
