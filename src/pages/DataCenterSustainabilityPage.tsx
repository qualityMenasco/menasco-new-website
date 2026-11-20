/** Design rules for the Data Center pages: see the header comment in src/pages/DataCenterPage.tsx. */
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Eyebrow, Heading } from '../components/typography/Typography';
import { HeroH1 } from '../components/typography/HeroH1';
import { ButtonLink } from '../components/ui/Button';
import { FaqAccordion } from '../components/common/FaqAccordion';
import { dcSustainability as c } from '../data/dataCenterSustainability';
import { SUSTAINABILITY_SOURCES } from '../data/dataCenterSources';
import { DC_SUSTAINABILITY_PATH, DC_TECHNICAL_PATH, ArabicDeferredNotice, DataCenterTabs, RichText, stripCites } from '../components/services/datacenter/shared';
import { SourcesList } from '../components/services/datacenter/primitives';
import { DirectionGauge, LevelBar, OpportunityGlyph, OutlookChart, SustainHeroDiagram } from '../components/services/datacenter/sustainabilityDiagrams';
import { Segmented } from '../components/services/datacenter/technicalDiagrams';
import { SEO } from '../seo/SEO';
import { faqPageJsonLd } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';
import { cn } from '../lib/utils';

type Region = 'gcc' | 'usa' | 'europe';

/** A ranked priority table (GCC, USA, Europe). */
function PriorityTable({ rows }: { rows: { intervention: string; why: string }[] }) {
  const col = c.priorityColumns;
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
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

      {/* 1. Hero */}
      <Section background="charcoal" spacing="sm" className="md:pt-12">
        <div className="max-w-3xl">
          <HeroH1
            eyebrow={
              <Eyebrow as="span" theme="dark" className="block">
                {c.hero.eyebrow}
              </Eyebrow>
            }
            title={<span className="mt-3 block font-display text-h1 font-semibold text-white text-balance">{c.hero.title}</span>}
          />
          <p className="mt-5 text-body text-gray-300 md:text-body-lg">{c.hero.intro}</p>
        </div>
        <div className="mt-10">
          <SustainHeroDiagram />
        </div>
      </Section>

      {/* 2. Seven opportunities */}
      <Section background="warmwhite" spacing="sm">
        <Eyebrow>{c.opportunities.eyebrow}</Eyebrow>
        <Heading level="h2" as="h2" className="mt-3 max-w-3xl text-balance">
          {c.opportunities.heading}
        </Heading>
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.opportunities.items.map((o, i) => (
            <li key={o.title} className={cn('flex flex-col rounded-md border border-gray-200 bg-white p-5', i === 0 && 'lg:col-span-2 lg:row-span-1')}>
              <div className="rounded-md bg-stone">
                <OpportunityGlyph icon={o.icon} />
              </div>
              <span className="mt-4 font-display text-caption font-semibold text-brand-600 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-1 font-display text-body-lg font-semibold text-ink">{o.title}</h3>
              <p className="mt-2 text-small leading-relaxed text-gray-700">{o.body}</p>
              <p className="mt-auto border-t border-gray-100 pt-3 text-small text-gray-700">
                <span className="font-semibold text-ink">{c.opportunities.impactLabel}: </span>
                {o.impact}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 3. Metrics */}
      <Section background="stone" spacing="sm">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>{c.metrics.eyebrow}</Eyebrow>
            <Heading level="h2" as="h2" className="mt-3 text-balance">
              {c.metrics.heading}
            </Heading>
            <p className="mt-4 text-body-lg font-semibold leading-snug text-ink">{c.metrics.intro}</p>
            <p className="mt-4 text-small leading-relaxed text-gray-700">
              <RichText text={c.metrics.euLabel} />
            </p>
          </div>
          <div className="lg:col-span-8">
            <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
              <table className="w-full min-w-[32rem] text-small">
                <thead>
                  <tr className="border-b border-gray-200 text-caption uppercase tracking-widest text-gray-600">
                    <th scope="col" className="px-4 py-3 text-start font-semibold">
                      {c.metrics.columns.metric}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start font-semibold">
                      {c.metrics.columns.measures}
                    </th>
                    <th scope="col" className="px-4 py-3 text-start font-semibold">
                      {c.metrics.columns.direction}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {c.metrics.rows.map((r) => (
                    <tr key={r.metric} className="border-b border-gray-100 last:border-0">
                      <th scope="row" className="px-4 py-3 text-start font-display font-semibold text-ink">
                        {r.metric}
                      </th>
                      <td className="px-4 py-3 text-gray-700">
                        <RichText text={r.measures} />
                      </td>
                      <td className="px-4 py-3">
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
          </div>
        </div>
      </Section>

      {/* 4. Regional priorities (all three in the HTML; one shown) */}
      <Section background="warmwhite" spacing="sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Regional priorities</Eyebrow>
            <h2 className="mt-3 font-display text-h2 font-semibold tracking-tight text-ink">GCC, USA and Europe</h2>
          </div>
          <Segmented label="Region" value={region} onChange={setRegion} options={regions.map((r) => ({ id: r.id, label: r.label }))} />
        </div>
        {regions.map((r) => (
          <div key={r.id} hidden={region !== r.id} className="mt-8">
            <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600">{r.block.eyebrow}</p>
            <h3 className="mt-2 font-display text-h3 font-semibold text-ink">{r.block.heading}</h3>
            <p className="mt-3 max-w-3xl text-body leading-relaxed text-gray-700">
              <RichText text={r.block.intro} />
            </p>
            <div className="mt-6">
              <PriorityTable rows={r.block.rows} />
            </div>
          </div>
        ))}
      </Section>

      {/* 5. Contractor impact */}
      <Section background="charcoal" spacing="sm">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow theme="dark">{c.contractor.eyebrow}</Eyebrow>
            <Heading level="h2" as="h2" theme="dark" className="mt-3 text-balance">
              {c.contractor.heading}
            </Heading>
            <p className="mt-4 text-body text-gray-300">{c.contractor.intro}</p>
            <ButtonLink href="/services/mep#mechanical" variant="outline" theme="dark" trailingIcon={ArrowRight} className="mt-6">
              {c.contractor.mepLink}
            </ButtonLink>
          </div>
          <div className="lg:col-span-8">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {c.contractor.items.map((item) => (
                <li key={item.area} className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[10rem_1fr]">
                  <h3 className="font-display text-body-lg font-semibold text-white">{item.area}</h3>
                  <p className="text-small leading-relaxed text-gray-300">{item.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-s-2 border-brand-500 ps-4 text-body text-gray-200">{c.contractor.closing}</p>
          </div>
        </div>
      </Section>

      {/* 6. Cooling comparison (qualitative) */}
      <Section background="warmwhite" spacing="sm">
        <Eyebrow>{c.cooling.eyebrow}</Eyebrow>
        <Heading level="h2" as="h2" className="mt-3 text-balance">
          {c.cooling.heading}
        </Heading>
        <p className="mt-4 max-w-3xl text-body text-gray-700">{c.cooling.intro}</p>
        <div className="mt-8 overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="w-full min-w-[44rem] text-small">
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="w-56 px-4 py-4 text-start text-caption font-semibold uppercase tracking-widest text-gray-600">
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
                  <th scope="row" className="px-4 py-3 text-start font-semibold text-ink">
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
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {c.cooling.climates.map((cl) => (
            <div key={cl.region} className="rounded-md border border-gray-200 bg-stone p-4">
              <p className="font-display text-body font-semibold text-ink">{cl.region}</p>
              <p className="mt-1 text-small text-gray-700">{cl.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. LEED Gold and Estidama Pearl */}
      <Section background="stone" spacing="sm">
        <Eyebrow>{c.certifications.eyebrow}</Eyebrow>
        <Heading level="h2" as="h2" className="mt-3 text-balance">
          {c.certifications.heading}
        </Heading>
        <p className="mt-4 max-w-3xl text-body text-gray-700">{c.certifications.intro}</p>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {c.certifications.items.map((cert) => (
            <article key={cert.id} className="rounded-md border border-gray-200 bg-white p-6">
              <h3 className="font-display text-h3 font-semibold text-ink">{cert.name}</h3>
              <p className="mt-2 text-small leading-relaxed text-gray-700">
                <RichText text={cert.body} />
              </p>
              <ul className="mt-4 space-y-2">
                {cert.credits.map((cr) => (
                  <li key={cr} className="flex gap-3 text-small text-gray-700">
                    <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-600" />
                    {cr}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-gray-200 bg-white p-6">
          <h3 className="font-display text-h4 font-semibold text-ink">{c.certifications.contributionHeading}</h3>
          <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
            {c.certifications.contributions.map((x) => (
              <li key={x} className="flex gap-3 text-small text-gray-700">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-600" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 8. Outlook */}
      <Section background="warmwhite" spacing="sm">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Eyebrow>{c.outlook.eyebrow}</Eyebrow>
            <Heading level="h2" as="h2" className="mt-3 text-balance">
              {c.outlook.heading}
            </Heading>
            <p className="mt-4 text-body leading-relaxed text-gray-700">
              <RichText text={c.outlook.intro} />
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-body-lg font-semibold text-ink">{c.outlook.challengesHeading}</h3>
                <ul className="mt-2 space-y-1.5">
                  {c.outlook.challenges.map((x) => (
                    <li key={x} className="text-small text-gray-700">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-body-lg font-semibold text-ink">{c.outlook.developmentsHeading}</h3>
                <ul className="mt-2 space-y-1.5">
                  {c.outlook.developments.map((x) => (
                    <li key={x} className="text-small text-gray-700">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <figure className="rounded-md border border-gray-200 bg-white p-5 lg:col-span-6">
            <OutlookChart />
            <figcaption className="mt-2 text-caption text-gray-500">
              <RichText text={c.outlook.chart.caption} />
            </figcaption>
          </figure>
        </div>
      </Section>

      {/* 9. FAQ */}
      <Section background="stone" spacing="sm">
        <Eyebrow>{c.faq.eyebrow}</Eyebrow>
        <Heading level="h2" as="h2" className="mt-3">
          {c.faq.heading}
        </Heading>
        <FaqAccordion items={c.faq.items} idPrefix="dcs-faq" className="mt-8" />
      </Section>

      {/* 10. Back to technical + sources */}
      <Section background="charcoal" spacing="sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-h3 font-semibold text-white">{c.technicalTeaser.heading}</h2>
            <p className="mt-2 text-small text-gray-400">{c.technicalTeaser.body}</p>
          </div>
          <ButtonLink href={DC_TECHNICAL_PATH} variant="outline" theme="dark" leadingIcon={ArrowLeft}>
            {c.technicalTeaser.cta}
          </ButtonLink>
        </div>
      </Section>
      <Section background="warmwhite" spacing="sm">
        <SourcesList sources={SUSTAINABILITY_SOURCES} heading={c.sources.heading} intro={c.sources.intro} />
      </Section>
    </>
  );
}
