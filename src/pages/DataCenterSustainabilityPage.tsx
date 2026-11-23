/** Design rules for the Data Center pages: see the header comment in src/pages/DataCenterPage.tsx. */
import { useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronDown } from 'lucide-react';
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
import { SustainHeroFjord } from '../components/services/datacenter/SustainHeroFjord';
import { CoolingCompare } from '../components/services/datacenter/CoolingCompare';
import { RegionalPriorities } from '../components/services/datacenter/RegionalPriorities';
import { TextReactions } from '../components/services/datacenter/TextReactions';
import { TopicTabs } from '../components/sections/quality/TopicTabs';
import { TopicAccordion } from '../components/sections/quality/TopicAccordion';
import { SEO } from '../seo/SEO';
import { faqPageJsonLd } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';
import { cn } from '../lib/utils';


/** One lever in the Seven opportunities tabs: grey sub-heading, first paragraph, the second
 *  behind Read more (all screen sizes), and the impact points always visible. */
function LeverBody({ lead, body, impact }: { lead: string; body: string[]; impact: string[] }) {
  const [open, setOpen] = useState(false);
  const [first, ...rest] = body;
  return (
    <div className="-mt-2">
      <p className="text-[0.8125rem] font-semibold leading-snug text-gray-500 lg:text-[0.78rem] lg:tracking-[-0.005em]">{lead}</p>
      <div className="max-w-3xl">
      <p className="mt-2.5 text-small leading-relaxed text-gray-700">
        <RichText text={first} />
      </p>
      {rest.length > 0 && (
        <>
          {open && rest.map((para) => (
            <p key={para.slice(0, 24)} className="mt-2.5 text-small leading-relaxed text-gray-700">
              <RichText text={para} />
            </p>
          ))}
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="mt-1.5 font-display text-[0.8125rem] font-semibold text-brand-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {open ? c.opportunities.readLess : c.opportunities.readMore}
          </button>
        </>
      )}
      <div className="mt-3.5 border-t border-gray-100 pt-3">
        <p className="text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.opportunities.impactLabel}</p>
        <ul className="mt-1.5 space-y-1">
          {impact.map((x) => (
            <li key={x} className="flex gap-2.5 text-small leading-snug text-gray-700">
              <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-500" />
              {x}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}

/** "Gold" in metallic gold and "Pearl" in a soft pearlescent sheen (gradient text). */
function RatingWords({ text }: { text: string }) {
  return (
    <>
      {text.split(/(Gold|Pearl)/).map((part, i) =>
        part === 'Gold' ? (
          <span key={i} className="bg-[linear-gradient(135deg,#f6dc8a_0%,#d4a93c_45%,#f2d27a_70%,#b8892a_100%)] bg-clip-text text-transparent">
            {part}
          </span>
        ) : part === 'Pearl' ? (
          <span key={i} className="bg-[linear-gradient(110deg,#f7d6ec_0%,#c9d6ff_28%,#f0c8e4_52%,#bfeee4_76%,#f6e3bf_100%)] bg-clip-text text-transparent">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

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

function Head({ eyebrow, title, intro, dark = false }: { eyebrow: string; title: ReactNode; intro?: ReactNode; dark?: boolean }) {
  return (
    <>
      <p className={dark ? `${EYEBROW_BASE} text-brand-400` : EYEBROW}>{eyebrow}</p>
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center lg:gap-12">
        <h2 className={cn(H2, dark && 'text-white', intro ? 'lg:col-span-6' : 'lg:col-span-9')}>{title}</h2>
        {intro && <div className={cn('text-body leading-relaxed lg:col-span-6', dark ? 'text-gray-300' : 'text-gray-700')}>{intro}</div>}
      </div>
    </>
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
  const heroTextRef = useRef<HTMLElement>(null);
  const certRail = useRail();
  const title = t('dataCenterSustainability.seo.title');
  const description = t('dataCenterSustainability.seo.description');
  const url = `${SITE_URL}${DC_SUSTAINABILITY_PATH}`;

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
        <Container className="relative z-[2] pb-8 pt-4 md:pb-10 md:pt-2">  {/* same gap below the drawing as the technical hero (mt-4 md:mt-2) */}
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
      <Band tone="light" className="py-10 md:py-12">
        <Head eyebrow={c.opportunities.eyebrow} title={c.opportunities.heading} />
        <TopicTabs
          idPrefix="dcs-opportunity"
          label={c.opportunities.eyebrow}
          className="mt-6"
          layoutClassName="md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:items-center md:gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]"
          compact
          dots
          swipe
          topics={c.opportunities.items.map((o) => ({
            title: o.title,
            body: [],
            extra: <LeverBody lead={o.lead} body={o.body} impact={o.impact} />,
          }))}
        />
      </Band>

      {/* 3. Metrics */}
      <Band tone="stone">
        <Head
          eyebrow={c.metrics.eyebrow}
          title={c.metrics.heading}
          intro={
            <span className="block text-small">
              <RichText text={c.metrics.euLabel} />
            </span>
          }
        />
        {/* Metric cards instead of a table: no sideways scrolling. Each item: metric, what it measures,
            and the desired direction as a small badge. Phones: one compact card with divided rows;
            tablets: two cards per row; desktop: three. */}
        <ul className="mt-6 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-3 sm:divide-y-0 sm:border-0 sm:bg-transparent lg:grid-cols-3 lg:gap-4">
          {c.metrics.rows.map((r) => {
            const up = r.better === 'up';
            return (
              <li key={r.metric} className="flex flex-col px-4 py-3 sm:rounded-lg sm:border sm:border-gray-200 sm:bg-white sm:p-4 lg:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-body font-semibold leading-snug text-ink sm:text-body-lg">{r.metric}</h3>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-caption font-semibold',
                      up ? 'bg-brand-50 text-brand-700' : 'bg-gray-100 text-gray-700',
                    )}
                  >
                    {up ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />}
                    {r.direction}
                  </span>
                </div>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-gray-600 sm:mt-2 sm:text-small">
                  <RichText text={r.measures} />
                </p>
              </li>
            );
          })}
        </ul>
      </Band>

      {/* 4. LEED Gold and Estidama Pearl (dark): two cards (swipe on phones) and a collapsible contribution list. */}
      <Band tone="dark">
        <Head dark eyebrow={c.certifications.eyebrow} title={c.certifications.heading} intro={c.certifications.intro} />
        <div
          ref={(el) => {
            certRail.railRef.current = el;
          }}
          onScroll={certRail.onScroll}
          className={cn('mt-8', RAIL_CLASS, 'md:grid-cols-2 lg:gap-6')}
        >
          {c.certifications.items.map((cert) => (
            <article key={cert.id} className="flex w-[86%] shrink-0 snap-start flex-col rounded-lg border border-white/10 bg-white/[0.04] p-5 sm:w-[70%] sm:p-6 md:w-auto lg:p-7">
              <h3 className="font-display text-h4 font-semibold text-white">
                <RatingWords text={cert.name} />
              </h3>
              <p className="mt-2 text-small leading-relaxed text-gray-300">
                <RichText text={cert.body} />
              </p>
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                {cert.credits.map((cr) => (
                  <li key={cr} className="flex gap-2.5 text-small leading-snug text-gray-300">
                    <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                    {cr}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <RailDots dark count={c.certifications.items.length} active={certRail.active} />
        <details className="group mt-5 rounded-lg border border-white/10 bg-white/[0.04] [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 lg:px-7">
            <span className="font-display text-body-lg font-semibold text-white">{c.certifications.contributionHeading}</span>
            <ChevronDown size={20} aria-hidden="true" className="shrink-0 text-gray-400 transition-transform duration-base group-open:rotate-180" />
          </summary>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-2 border-t border-white/10 px-5 pb-5 pt-4 md:grid-cols-2 lg:px-7">
            {c.certifications.contributions.map((x) => (
              <li key={x} className="flex gap-2.5 text-small leading-snug text-gray-300">
                <span aria-hidden="true" className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                {x}
              </li>
            ))}
          </ul>
        </details>
      </Band>

      {/* 5. Cooling comparison (qualitative): configuration switch + scorecard, then climate notes. */}
      <Band tone="light">
        <Head eyebrow={c.cooling.eyebrow} title={c.cooling.heading} />
        <CoolingCompare />
      </Band>

      {/* 6. Regional priorities: region switch, intro, numbered priorities (RegionalPriorities). */}
      <Band tone="white" className="py-10 md:py-12">
        <RegionalPriorities />
      </Band>

      {/* 7. Contractor impact (dark): heading, intro and a link to the MEP disciplines. */}
      <Band tone="dark" className="py-10 md:py-14">
        <p className={`${EYEBROW_BASE} text-brand-400`}>{c.contractor.eyebrow}</p>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center lg:gap-12">
          <h2 className={cn(H2, 'text-white lg:col-span-6')}>{c.contractor.heading}</h2>
          <div className="lg:col-span-6">
            <p className="text-small leading-relaxed text-gray-300 lg:text-body">{c.contractor.intro}</p>
            <ButtonLink href="/services/mep#mechanical" variant="outline" theme="dark" trailingIcon={ArrowRight} className="mt-5">
              {c.contractor.mepLink}
            </ButtonLink>
          </div>
        </div>
      </Band>

      {/* 8. Outlook: heading | intro, then challenges and developments side by side (chart removed). */}
      <Band tone="white">
        <Head eyebrow={c.outlook.eyebrow} title={c.outlook.heading} intro={<RichText text={c.outlook.intro} />} />
        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-gray-200 pt-5 sm:grid-cols-2 lg:mt-8">
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
