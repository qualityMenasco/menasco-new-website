/** Design rules for the Data Center pages: see the header comment in src/pages/DataCenterPage.tsx. */
import { useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Eyebrow } from '../components/typography/Typography';
import { HeroH1 } from '../components/typography/HeroH1';
import { ButtonLink } from '../components/ui/Button';
import { FaqAccordion } from '../components/common/FaqAccordion';
import { dcSustainability as c } from '../data/dataCenterSustainability';
import { SUSTAINABILITY_SOURCES } from '../data/dataCenterSources';
import { DC_SUSTAINABILITY_PATH, DC_TECHNICAL_PATH, ArabicDeferredNotice, DataCenterTabs, RAIL_CLASS, RailDots, RichText, stripCites, useRail } from '../components/services/datacenter/shared';
import { SourcesList } from '../components/services/datacenter/primitives';
import { DirectionGauge, LevelBar, OutlookChart } from '../components/services/datacenter/sustainabilityDiagrams';
import { SustainHeroFjord } from '../components/services/datacenter/SustainHeroFjord';
import { TextReactions } from '../components/services/datacenter/TextReactions';
import { TopicTabs } from '../components/sections/quality/TopicTabs';
import { TopicAccordion } from '../components/sections/quality/TopicAccordion';
import { Segmented } from '../components/services/datacenter/technicalDiagrams';
import { SEO } from '../seo/SEO';
import { faqPageJsonLd } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';
import { cn } from '../lib/utils';

type Region = 'gcc' | 'usa' | 'europe';

/* Shared section pattern, matching the Technical page: tight bands, a small blue
   eyebrow on its own row, then a compact heading with the intro beside it on desktop. */
const EYEBROW_BASE = 'font-display text-caption font-semibold uppercase tracking-widest rtl:tracking-normal';
const EYEBROW = `${EYEBROW_BASE} text-brand-600`;
const H2 = 'font-display text-[clamp(1.625rem,1.2rem+1.5vw,2.375rem)] font-semibold leading-[1.1] tracking-tight text-ink text-balance';
const TONE_BG = { white: 'bg-white', light: 'bg-warmwhite', stone: 'bg-stone', dark: 'bg-charcoal' } as const;

function Band({ tone, className, children }: { tone: keyof typeof TONE_BG; className?: string; children: ReactNode }) {
  return (
    <section className={TONE_BG[tone]}>
      <Container className={cn('py-12 md:py-16', className)}>{children}</Container>
    </section>
  );
}

function Head({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: ReactNode }) {
  return (
    <>
      <p className={EYEBROW}>{eyebrow}</p>
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center lg:gap-12">
        <h2 className={cn(H2, intro ? 'lg:col-span-6' : 'lg:col-span-9')}>{title}</h2>
        {intro && <div className="text-body leading-relaxed text-gray-700 lg:col-span-6">{intro}</div>}
      </div>
    </>
  );
}

/** A ranked priority table (GCC, USA, Europe). */
function PriorityTable({ rows }: { rows: { intervention: string; why: string }[] }) {
  const col = c.priorityColumns;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[34rem] text-start text-small">
        <thead>
          <tr className="border-b border-gray-200 bg-stone text-caption uppercase tracking-widest text-gray-600">
            <th scope="col" className="w-20 px-4 py-3 text-start font-semibold">
              {col.priority}
            </th>
            <th scope="col" className="px-4 py-3 text-start font-semibold">
              {col.intervention}
            </th>
            <th scope="col" className="px-4 py-3 text-start font-semibold">
              {col.why}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.intervention} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 align-top">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 font-display text-caption font-semibold text-white tabular-nums">{i + 1}</span>
              </td>
              <th scope="row" className="px-4 py-3 text-start align-top font-semibold text-ink">
                {r.intervention}
              </th>
              <td className="px-4 py-3 align-top text-gray-700">
                <RichText text={r.why} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Data Center sustainability page (/services/data-centers/sustainability),
 * the second Data Center tab. Its own URL, title, H1, Article + FAQ
 * structured data, so it ranks for sustainability searches by itself. Copy:
 * src/data/dataCenterSustainability.ts (English; Arabic deferred).
 */
export default function DataCenterSustainabilityPage() {
  const { t } = useTranslation('services');
  const [region, setRegion] = useState<Region>('gcc');
  const heroTextRef = useRef<HTMLElement>(null);
  const climateRail = useRail();
  const certRail = useRail();
  const title = t('dataCenterSustainability.seo.title');
  const description = t('dataCenterSustainability.seo.description');
  const url = `${SITE_URL}${DC_SUSTAINABILITY_PATH}`;
  const regions: { id: Region; label: string; block: { eyebrow: string; heading: string; intro: string; rows: { intervention: string; why: string }[] } }[] = [
    { id: 'gcc', label: 'GCC', block: c.gcc },
    { id: 'usa', label: 'USA', block: c.usa },
    { id: 'europe', label: 'Europe', block: c.europe },
  ];

  return (
    <>
      <SEO
        title={title}
        description={description}
        path={DC_SUSTAINABILITY_PATH}
        pageType="WebPage"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Data Centers', path: DC_TECHNICAL_PATH },
          { label: 'Sustainability', path: DC_SUSTAINABILITY_PATH },
        ]}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: `${c.hero.eyebrow}: ${c.hero.title}`,
            description,
            url,
            inLanguage: 'en',
            author: { '@type': 'Organization', name: 'MENASCO', url: SITE_URL },
            publisher: { '@type': 'Organization', name: 'MENASCO', url: SITE_URL },
            dateModified: '2026-11-20',
            about: ['Data center sustainability', 'PUE', 'WUE', 'Liquid cooling', 'LEED', 'Estidama'],
            citation: SUSTAINABILITY_SOURCES.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url, publisher: s.publisher })),
          },
          faqPageJsonLd(c.faq.items.map((f) => ({ question: f.question, answer: stripCites(f.answer) }))),
        ]}
      />
      <DataCenterTabs active="sustainability" />
      <ArabicDeferredNotice />

      {/* 1. Hero: white, with the fjord drawing composed like the technical hero (same frame,
          vanishing point and bleed into the side gutters), then the title. */}
      <section className="relative overflow-hidden bg-white">
        <Container className="relative pt-6 md:pt-8">
          <div className="-mx-6 md:-mx-14 lg:-mx-28">
            <SustainHeroFjord />
          </div>
        </Container>
      </section>
      {/* Hero text: white, the same as the drawing's water, so the drawing runs into it. */}
      <section ref={heroTextRef} className="bg-white">
        {/* Title words react on page entry, as on the technical hero. */}
        <TextReactions containerRef={heroTextRef} />
        <Container className="relative z-[2] pb-14 pt-4 md:pb-20 md:pt-2">  {/* same gap below the drawing as the technical hero (mt-4 md:mt-2) */}
          <div className="max-w-5xl">
            <HeroH1
              eyebrow={
                <Eyebrow as="span" className="block">
                  {c.hero.eyebrow}
                </Eyebrow>
              }
              title={
                <span className="mt-4 block font-display text-[clamp(2.75rem,1.6rem+4.6vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-ink text-balance">
                  {/* Only "Water" reacts (liquid fill) on page entry, on the same timing as "Cooling" on the technical hero. */}
                  {c.hero.title.split(/(Water)/).map((part, i) =>
                    part === 'Water' ? (
                      <span key={i} data-flow-target="water" data-flow-hero="">
                        {part}
                      </span>
                    ) : (
                      part
                    ),
                  )}
                </span>
              }
            />
            <p className="mt-5 max-w-3xl text-body leading-relaxed text-gray-700 md:text-body-lg">{c.hero.intro}</p>
          </div>
        </Container>
      </section>

      {/* 2. Seven opportunities: tabs (vertical list beside the panel from md; a scrolling pill row on phones). */}
      <Band tone="white">
        <Head eyebrow={c.opportunities.eyebrow} title={c.opportunities.heading} />
        <TopicTabs
          idPrefix="dcs-opportunity"
          label={c.opportunities.eyebrow}
          className="mt-8"
          layoutClassName="md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:items-center md:gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]"
          topics={c.opportunities.items.map((o) => ({
            title: o.title,
            body: [o.body],
            extra: (
              <p className="mt-5 max-w-3xl border-t border-gray-100 pt-4 text-small leading-relaxed text-gray-700">
                <span className="font-semibold text-ink">{c.opportunities.impactLabel}: </span>
                {o.impact}
              </p>
            ),
          }))}
        />
      </Band>

      {/* 3. Metrics */}
      <Band tone="light">
        <Head
          eyebrow={c.metrics.eyebrow}
          title={c.metrics.heading}
          intro={
            <>
              <span className="block font-semibold text-ink">{c.metrics.intro}</span>
              <span className="mt-2 block text-small">
                <RichText text={c.metrics.euLabel} />
              </span>
            </>
          }
        />
        <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[32rem] text-small">
            <thead>
              <tr className="border-b border-gray-200 text-caption uppercase tracking-widest text-gray-600">
                <th scope="col" className="px-4 py-3 text-start font-semibold lg:px-6">
                  {c.metrics.columns.metric}
                </th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">
                  {c.metrics.columns.measures}
                </th>
                <th scope="col" className="px-4 py-3 text-start font-semibold lg:px-6">
                  {c.metrics.columns.direction}
                </th>
              </tr>
            </thead>
            <tbody>
              {c.metrics.rows.map((r) => (
                <tr key={r.metric} className="border-b border-gray-100 last:border-0">
                  <th scope="row" className="px-4 py-3 text-start font-display font-semibold text-ink lg:px-6">
                    {r.metric}
                  </th>
                  <td className="px-4 py-3 text-gray-700">
                    <RichText text={r.measures} />
                  </td>
                  <td className="px-4 py-3 lg:px-6">
                    <span className="flex items-center gap-2 font-semibold text-ink">
                      <DirectionGauge better={r.better as 'up' | 'down'} />
                      {r.direction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Band>

      {/* 4. Regional priorities: toggle; all three in the HTML, stacked in one cell (no height jump). */}
      <Band tone="white">
        <p className={EYEBROW}>Regional priorities</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className={H2}>GCC, USA and Europe</h2>
          <Segmented label="Region" value={region} onChange={setRegion} options={regions.map((r) => ({ id: r.id, label: r.label }))} />
        </div>
        <div className="mt-8 grid">
          {regions.map((r) => {
            const shown = region === r.id;
            return (
              <div
                key={r.id}
                aria-hidden={!shown}
                {...(shown ? {} : { inert: '' })}
                className={cn('col-start-1 row-start-1 transition-opacity duration-300 motion-reduce:transition-none', shown ? 'visible opacity-100' : 'invisible opacity-0')}
              >
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-center lg:gap-12">
                  <div className="lg:col-span-5">
                    <p className="text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{r.block.eyebrow}</p>
                    <h3 className="mt-1.5 font-display text-h4 font-semibold text-ink">{r.block.heading}</h3>
                  </div>
                  <p className="text-small leading-relaxed text-gray-700 lg:col-span-7">
                    <RichText text={r.block.intro} />
                  </p>
                </div>
                <div className="mt-5">
                  <PriorityTable rows={r.block.rows} />
                </div>
              </div>
            );
          })}
        </div>
      </Band>

      {/* 5. Contractor impact: text | accordion of disciplines. */}
      <Band tone="dark">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-5">
            <p className={`${EYEBROW_BASE} text-brand-400`}>{c.contractor.eyebrow}</p>
            <h2 className={cn(H2, 'mt-3 text-white')}>{c.contractor.heading}</h2>
            <p className="mt-4 text-small leading-relaxed text-gray-300 lg:text-body">{c.contractor.intro}</p>
            <ButtonLink href="/services/mep#mechanical" variant="outline" theme="dark" trailingIcon={ArrowRight} className="mt-6">
              {c.contractor.mepLink}
            </ButtonLink>
          </div>
          <div className="lg:col-span-7">
            <TopicAccordion dark compact idPrefix="dcs-contractor" topics={c.contractor.items.map((it) => ({ title: it.area, body: [it.body] }))} />
            <p className="mt-5 border-s-2 border-brand-500 ps-4 text-small leading-relaxed text-gray-200">{c.contractor.closing}</p>
          </div>
        </div>
      </Band>

      {/* 6. Cooling comparison (qualitative): table scrolls sideways on phones with the criterion column pinned. */}
      <Band tone="light">
        <Head eyebrow={c.cooling.eyebrow} title={c.cooling.heading} intro={c.cooling.intro} />
        <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[40rem] text-small">
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="sticky left-0 z-[1] w-36 bg-white px-4 py-4 text-start text-caption font-semibold uppercase tracking-widest text-gray-600 sm:w-56 lg:px-6">
                  Criterion
                </th>
                {c.cooling.configs.map((cfg) => (
                  <th key={cfg.id} scope="col" className="px-4 py-4 text-start align-bottom">
                    <span className="block font-display text-body font-semibold text-ink">{cfg.name}</span>
                    <span className="mt-1 block text-caption font-normal text-gray-500">{cfg.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.cooling.criteria.map((cr) => (
                <tr key={cr.label} className="border-b border-gray-100 last:border-0">
                  <th scope="row" className="sticky left-0 z-[1] bg-white px-4 py-3 text-start font-semibold text-ink lg:px-6">
                    {cr.label}
                  </th>
                  {cr.levels.map((lvl, i) => {
                    const best = cr.better === 'low' ? lvl === Math.min(...cr.levels) : lvl === Math.max(...cr.levels);
                    return (
                      <td key={i} className="px-4 py-3">
                        <LevelBar level={lvl} word={cr.words[i]} good={best} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-caption text-gray-500">{c.cooling.note}</p>
        <h3 className="mt-8 font-display text-h4 font-semibold text-ink">{c.cooling.climateHeading}</h3>
        <div
          ref={(el) => {
            climateRail.railRef.current = el;
          }}
          onScroll={climateRail.onScroll}
          className={cn('mt-4', RAIL_CLASS, 'md:grid-cols-3')}
        >
          {c.cooling.climates.map((cl) => (
            <div key={cl.region} className="w-[86%] shrink-0 snap-start rounded-lg border border-gray-200 bg-white p-5 sm:w-[60%] md:w-auto">
              <p className="text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{cl.region}</p>
              <p className="mt-2 text-small leading-relaxed text-gray-700">{cl.body}</p>
            </div>
          ))}
        </div>
        <RailDots count={c.cooling.climates.length} active={climateRail.active} />
      </Band>

      {/* 7. LEED Gold and Estidama Pearl: two cards (swipe on phones) and a collapsible contribution list. */}
      <Band tone="stone">
        <Head eyebrow={c.certifications.eyebrow} title={c.certifications.heading} intro={c.certifications.intro} />
        <div
          ref={(el) => {
            certRail.railRef.current = el;
          }}
          onScroll={certRail.onScroll}
          className={cn('mt-8', RAIL_CLASS, 'md:grid-cols-2 lg:gap-6')}
        >
          {c.certifications.items.map((cert) => (
            <article key={cert.id} className="flex w-[86%] shrink-0 snap-start flex-col rounded-lg border border-gray-200 bg-white p-5 sm:w-[70%] sm:p-6 md:w-auto lg:p-7">
              <h3 className="font-display text-h4 font-semibold text-ink">{cert.name}</h3>
              <p className="mt-2 text-small leading-relaxed text-gray-700">
                <RichText text={cert.body} />
              </p>
              <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                {cert.credits.map((cr) => (
                  <li key={cr} className="flex gap-2.5 text-small leading-snug text-gray-700">
                    <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-600" />
                    {cr}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <RailDots count={c.certifications.items.length} active={certRail.active} />
        <details className="group mt-5 rounded-lg border border-gray-200 bg-white [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 lg:px-7">
            <span className="font-display text-body-lg font-semibold text-ink">{c.certifications.contributionHeading}</span>
            <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-gray-500 transition-transform duration-base group-open:rotate-180" />
          </summary>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-2 border-t border-gray-100 px-5 pb-5 pt-4 md:grid-cols-2 lg:px-7">
            {c.certifications.contributions.map((x) => (
              <li key={x} className="flex gap-2.5 text-small leading-snug text-gray-700">
                <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-600" />
                {x}
              </li>
            ))}
          </ul>
        </details>
      </Band>

      {/* 8. Outlook: text | static chart, centred against each other. */}
      <Band tone="light">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-6">
            <p className={EYEBROW}>{c.outlook.eyebrow}</p>
            <h2 className={cn(H2, 'mt-3')}>{c.outlook.heading}</h2>
            <p className="mt-4 text-small leading-relaxed text-gray-700 lg:text-body">
              <RichText text={c.outlook.intro} />
            </p>
            <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-200 pt-5 sm:grid-cols-2">
              <div>
                <p className="text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{c.outlook.challengesHeading}</p>
                <ul className="mt-2 space-y-1.5">
                  {c.outlook.challenges.map((x) => (
                    <li key={x} className="flex gap-2 text-small leading-snug text-gray-700">
                      <span aria-hidden="true" className="mt-[0.45rem] h-1 w-2.5 shrink-0 rounded-full bg-gray-400" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.outlook.developmentsHeading}</p>
                <ul className="mt-2 space-y-1.5">
                  {c.outlook.developments.map((x) => (
                    <li key={x} className="flex gap-2 text-small leading-snug text-gray-700">
                      <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-600" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <figure className="rounded-lg border border-gray-200 bg-white p-5 lg:col-span-6">
            <OutlookChart />
            <figcaption className="mt-2 text-caption text-gray-500">
              <RichText text={c.outlook.chart.caption} />
            </figcaption>
          </figure>
        </div>
      </Band>

      {/* 9. FAQ */}
      <Band tone="stone">
        <p className={EYEBROW}>{c.faq.eyebrow}</p>
        <h2 className={cn(H2, 'mt-3')}>{c.faq.heading}</h2>
        <FaqAccordion items={c.faq.items} idPrefix="dcs-faq" className="mt-6" />
      </Band>

      {/* 10. Back to technical + sources */}
      <Band tone="dark" className="py-10 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-h4 font-semibold text-white md:text-h3">{c.technicalTeaser.heading}</h2>
            <p className="mt-2 text-small text-gray-400">{c.technicalTeaser.body}</p>
          </div>
          <ButtonLink href={DC_TECHNICAL_PATH} variant="outline" theme="dark" leadingIcon={ArrowLeft}>
            {c.technicalTeaser.cta}
          </ButtonLink>
        </div>
      </Band>
      <Band tone="light" className="py-10 md:py-12">
        <SourcesList sources={SUSTAINABILITY_SOURCES} heading={c.sources.heading} intro={c.sources.intro} />
      </Band>
    </>
  );
}
