import { ArrowDown, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BulletList, ClampedParagraphs, DisclosureList, ImagePlaceholder, RailList, RowTabs } from '../components/services/ServiceBlocks';
import { Section } from '../components/layout/Section';
import { Eyebrow, Heading } from '../components/typography/Typography';
import { HeroH1 } from '../components/typography/HeroH1';
import { Button, ButtonLink } from '../components/ui/Button';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { FaqAccordion, type FaqAccordionItem } from '../components/common/FaqAccordion';
import { useTransparentHeader } from '../app/header-transparency';
import { SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity, servicesFaqJsonLd } from '../seo/structuredData';
import { cn } from '../lib/utils';

/**
 * Manufacturing & Prefabrication (/services/manufacturing-prefabrication):
 * one responsive page for desktop, tablets and phones, in the same language
 * as the refreshed MEP page.
 *   1. Hero: in-house manufacturing in three countries, proof row.
 *   2. Why off-site: the four outcomes of moving fabrication off site.
 *   3. Data center white spaces (featured, #modular): cooling pipework and electrical transfer.
 *   4. E-Houses (featured): complete prefabricated electrical rooms.
 *   5. Product range (#custom): the rest of the in-house range as tabs.
 *   6. Testing & quality: factory tests and certified management systems.
 *   7. Factories in the UAE, Saudi Arabia and Egypt (ISS night photos; figures pending from the client).
 *   8. Sectors served.
 *   9. FAQ, then a short closing band.
 *
 * Copy: services `manufacturingPage.*` (EN + AR). Images other than the factory cards are placeholders
 * until the client supplies photography (client request 2026-11-22).
 * The prefabrication subsidiary is never named on this page (client request).
 */

const RANGE_ANCHOR = 'custom';
const WHITE_SPACE_ANCHOR = 'modular';
const PATH = '/services/manufacturing-prefabrication';

/**
 * Factory cards, in the order of `factories.countries` (UAE, Saudi Arabia, Egypt):
 * NASA daytime photographs from the International Space Station (telephoto
 * lenses), public domain, no attribution required (images.nasa.gov):
 *   uae          iss074e0825656  Palm Jumeirah and the Dubai coast (560 mm), centred on the Palm
 *   saudi-arabia iss069e004755   central Riyadh street grid (400 mm)
 *   egypt        iss032e009123   Giza pyramids beside Cairo and the Nile (1200 mm)
 * Tight 16:10 crops (about 2,300–2,700 px of the original each, so the cards show near-native
 * detail), haze and colour cast removed with per-channel levels, sharpened after the final
 * resize; 1200×750 plus 800×500 (-800). Swap for real factory photography when supplied.
 */
const FACTORY_IMAGES = ['/manufacturing/factories/uae.webp', '/manufacturing/factories/saudi-arabia.webp', '/manufacturing/factories/egypt.webp'];

interface TitleBody {
  title: string;
  body: string;
}

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

export default function ManufacturingPrefabricationPage() {
  const { t } = useTranslation('services');
  return (
    <>
      <SEO
        title={t('manufacturingPage.seo.title')}
        description={t('manufacturingPage.seo.description')}
        path={PATH}
        mainEntity={serviceEntity({
          name: t('manufacturingPage.seo.title'),
          description: t('manufacturingPage.seo.description'),
          url: `${SITE_URL}${PATH}`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Manufacturing & Prefabrication', path: PATH },
        ]}
        structuredData={servicesFaqJsonLd(t('manufacturingPage.faq.items', { returnObjects: true }))}
      />
      <Hero />
      <WhyOffsite />
      <WhiteSpaces />
      <EHouses />
      <ProductRange />
      <Testing />
      <Factories />
      <Sectors />
      <Faq />
      <Closing />
    </>
  );
}

/* --------------------------------------------------------------- 1. Hero */

function Hero() {
  const { t } = useTranslation('services');
  useTransparentHeader(true);
  const proof = t('manufacturingPage.hero.proof', { returnObjects: true }) as { value: string; label: string }[];

  return (
    <Section background="charcoal" spacing="sm" className="md:pt-12 desktop:pt-32">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <HeroH1
            eyebrow={
              <Eyebrow as="span" theme="dark" className="block">
                {t('manufacturingPage.hero.eyebrow')}
              </Eyebrow>
            }
            title={<span className="mt-3 block font-display text-h1 font-semibold text-white text-balance">{t('manufacturingPage.hero.title')}</span>}
          />
          <p className="mt-4 max-w-2xl text-body text-gray-300 md:text-body-lg">{t('manufacturingPage.hero.description')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" trailingIcon={ArrowDown} onClick={() => scrollTo(RANGE_ANCHOR)}>
              {t('manufacturingPage.hero.primaryCta')}
            </Button>
            <ButtonLink href="/projects/categories" variant="outline" theme="dark" trailingIcon={ArrowRight} className="!border-white">
              {t('manufacturingPage.hero.secondaryCta')}
            </ButtonLink>
          </div>
          <dl aria-label={t('manufacturingPage.hero.proofLabel')} className="mt-10 grid grid-cols-3 border-t border-white/10 pt-6">
            {proof.map((item, i) => (
              <div key={i} className={cn('flex flex-col', i > 0 && 'border-s border-white/10 ps-3 sm:ps-5', i < proof.length - 1 && 'pe-3 sm:pe-5')}>
                <dt className="mt-1.5 text-caption text-gray-400 md:text-small">{item.label}</dt>
                <dd className="order-first font-display text-[clamp(0.95rem,0.6rem+1.4vw,1.375rem)] font-semibold leading-tight text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Portrait placeholder only where text and image sit side by side (desktop), as on the MEP page. */}
        <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
          <ImagePlaceholder dark label={t('manufacturingPage.hero.placeholder')} className="aspect-[4/5]" />
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------- 2. Why off-site */

function WhyOffsite() {
  const { t } = useTranslation('services');
  const items = t('manufacturingPage.whyOffsite.items', { returnObjects: true }) as TitleBody[];
  return (
    <Section background="warmwhite" spacing="sm">
      <ScrollReveal className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-6">
          <Eyebrow>{t('manufacturingPage.whyOffsite.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('manufacturingPage.whyOffsite.heading')}
          </Heading>
        </div>
        {/* Hidden on desktop (client request); phones and tablets keep it. */}
        <p className="text-body leading-relaxed text-gray-600 lg:hidden">{t('manufacturingPage.whyOffsite.intro')}</p>
      </ScrollReveal>
      <div className="mt-8 md:mt-10">
{/* Cards on phones and desktop; plain ruled columns on tablet (client request 2026-11-23). */}
        <RailList gridClassName="sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0 lg:grid-cols-4 lg:gap-5">
          {items.map((item, i) => (
            <li key={i} className="rounded-md border border-gray-200 bg-white p-5 sm:rounded-none sm:border-0 sm:border-t sm:border-gray-300 sm:bg-transparent sm:px-0 sm:pb-5 sm:pt-5 lg:rounded-md lg:border lg:border-gray-200 lg:bg-white lg:p-6">
              <span className="font-display text-caption font-semibold tabular-nums text-brand-600">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-display text-h4 font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-small leading-relaxed text-gray-600">{item.body}</p>
            </li>
          ))}
        </RailList>
      </div>
    </Section>
  );
}

/* ---------------------------------------------- 3. Data center white spaces */

function WhiteSpaces() {
  const { t } = useTranslation('services');
  const body = t('manufacturingPage.whiteSpaces.body', { returnObjects: true }) as string[];
  const items = t('manufacturingPage.whiteSpaces.items', { returnObjects: true }) as TitleBody[];
  return (
    <Section id={WHITE_SPACE_ANCHOR} background="charcoal" spacing="sm" className="scroll-mt-20">
      {/* Phones: stacked (text, then image). From md: text left, smaller image right. */}
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-12">
        <ScrollReveal className="md:col-span-7">
          <Eyebrow theme="dark">{t('manufacturingPage.whiteSpaces.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" theme="dark" className="mt-3 text-balance">
            {t('manufacturingPage.whiteSpaces.heading')}
          </Heading>
          <ClampedParagraphs id="mfg-white-space-text" paragraphs={body} dark />
          {/* Own row under "Read more" on phones, full width like the hero buttons; inline from sm. */}
          <div className="mt-3 md:mt-6">
            <ButtonLink href="/services/data-centers" variant="outline" theme="dark" trailingIcon={ArrowRight} className="w-full !border-white sm:w-auto">
              {t('manufacturingPage.whiteSpaces.cta')}
            </ButtonLink>
          </div>
        </ScrollReveal>
        <div className="md:col-span-5">
          <ImagePlaceholder dark label={t('manufacturingPage.whiteSpaces.placeholder')} className="aspect-[16/9] md:aspect-[4/3]" />
        </div>
      </div>
      <h3 className="mt-10 font-display text-caption font-semibold uppercase tracking-widest text-brand-400 rtl:tracking-normal md:mt-12">
        {t('manufacturingPage.whiteSpaces.scopeLabel')}
      </h3>
      <div className="mt-4">
{/* Cards on phones and desktop; plain ruled columns on tablet (client request 2026-11-23). */}
        <RailList dark gridClassName="sm:grid-cols-2 sm:gap-x-6 sm:gap-y-0 lg:grid-cols-5 lg:gap-4">
          {items.map((item, i) => (
            <li key={i} className="rounded-md border border-white/10 bg-white/[0.04] p-5 sm:rounded-none sm:border-0 sm:border-t sm:border-white/15 sm:bg-transparent sm:px-0 sm:pb-4 sm:pt-4 lg:rounded-md lg:border lg:border-white/10 lg:bg-white/[0.04] lg:p-5">
              <h4 className="font-display text-body font-semibold text-white">{item.title}</h4>
              <p className="mt-1.5 text-small leading-relaxed text-gray-400">{item.body}</p>
            </li>
          ))}
        </RailList>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------- 4. E-Houses */

function EHouses() {
  const { t } = useTranslation('services');
  const body = t('manufacturingPage.eHouses.body', { returnObjects: true }) as string[];
  const items = t('manufacturingPage.eHouses.items', { returnObjects: true }) as TitleBody[];
  return (
    <Section background="warmwhite" spacing="sm">
      {/* Phones: stacked (text, then image). From md: text left, smaller image right. */}
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-12">
        <ScrollReveal className="md:col-span-7">
          <Eyebrow>{t('manufacturingPage.eHouses.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('manufacturingPage.eHouses.heading')}
          </Heading>
          <ClampedParagraphs id="mfg-ehouse-text" paragraphs={body} />
        </ScrollReveal>
        <div className="md:col-span-5">
          <ImagePlaceholder label={t('manufacturingPage.eHouses.placeholder')} className="aspect-[16/9] md:aspect-[4/3]" />
        </div>
      </div>
      <div className="mt-8 md:mt-12">
{/* Cards on phones and desktop; plain ruled columns on tablet (client request 2026-11-23). */}
        <RailList gridClassName="sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0 lg:grid-cols-4 lg:gap-5">
          {items.map((item, i) => (
            <li key={i} className="rounded-md border border-gray-200 bg-white p-5 sm:rounded-none sm:border-0 sm:border-t sm:border-gray-300 sm:bg-transparent sm:px-0 sm:pb-4 sm:pt-4 lg:rounded-md lg:border lg:border-gray-200 lg:bg-white lg:p-6">
              <h3 className="font-display text-body font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-small leading-relaxed text-gray-600">{item.body}</p>
            </li>
          ))}
        </RailList>
      </div>
      <p className="mt-4 max-w-3xl text-small leading-relaxed text-gray-500">{t('manufacturingPage.eHouses.note')}</p>
    </Section>
  );
}

/* ------------------------------------------------------ 5. Product range */

function ProductRange() {
  const { t } = useTranslation('services');
  const topics = t('manufacturingPage.range.topics', { returnObjects: true }) as { title: string; body: string; items: string[] }[];
  return (
    <Section id={RANGE_ANCHOR} background="stone" spacing="sm" className="scroll-mt-20 pb-6 md:pb-8">
      {/* Compact layout (client request 2026-11-23): heading sits above the tabs and the intro above
          the panel, so there is no separate header row; the panel drops its repeated title and uses
          tight single-line rows. Phones: heading, intro, then tap-to-open rows (first open). */}
      <RowTabs
        idPrefix="mfg-range"
        label={t('manufacturingPage.range.heading')}
        lead={
          <>
            <Eyebrow>{t('manufacturingPage.range.eyebrow')}</Eyebrow>
            <Heading level="h2" as="h2" className="mt-3 text-balance">
              {t('manufacturingPage.range.heading')}
            </Heading>
          </>
        }
        aside={<p className="text-body leading-relaxed text-gray-600">{t('manufacturingPage.range.intro')}</p>}
        phone={
          <DisclosureList
            idPrefix="mfg-range-m"
            defaultOpen={0}
            items={topics.map((topic) => ({
              title: topic.title,
              content: (
                <>
                  <p className="text-small leading-relaxed text-gray-600">{topic.body}</p>
                  <ul role="list" className="mt-2">
                    {topic.items.map((item) => (
                      <li key={item} className="flex gap-3 py-1.5 text-small text-gray-700">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              ),
            }))}
          />
        }
        tabs={topics.map((topic) => ({
          title: topic.title,
          panel: (
            <>
              <p className="text-body leading-relaxed text-gray-600">{topic.body}</p>
              <BulletList items={topic.items} className="mt-3 [&>li]:py-2" />
            </>
          ),
        }))}
      />
    </Section>
  );
}

/* --------------------------------------------------- 6. Testing & quality */

function Testing() {
  const { t } = useTranslation('services');
  const items = t('manufacturingPage.testing.items', { returnObjects: true }) as TitleBody[];
  const standards = t('manufacturingPage.testing.standards', { returnObjects: true }) as { code: string; label: string }[];
  return (
    <Section background="warmwhite" spacing="sm" className="pt-8 md:pt-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Heading column pins below the site header while the tests and ISO list scroll past (same as EPC). */}
        <div className="lg:sticky lg:top-20 lg:col-span-5 lg:self-start desktop:top-28">
          <ScrollReveal>
            <Eyebrow>{t('manufacturingPage.testing.eyebrow')}</Eyebrow>
            <Heading level="h2" as="h2" className="mt-3 text-balance">
              {t('manufacturingPage.testing.heading')}
            </Heading>
            <p className="mt-4 text-body leading-relaxed text-gray-600">{t('manufacturingPage.testing.intro')}</p>
          </ScrollReveal>
        </div>
        {/* The factory tests first, then the certifications beneath them (client request). */}
        <div className="lg:col-span-7">
          <DisclosureList idPrefix="mfg-test" items={items.map((item) => ({ title: item.title, content: <p className="text-small leading-relaxed text-gray-600">{item.body}</p> }))} />
          <h3 className="mt-8 font-display text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{t('manufacturingPage.testing.standardsLabel')}</h3>
          {/* Phones: a clean ruled list (code | scope), no ragged wrapping. From sm: bordered chips. */}
          {/* Row rules are per-item borders, not divide-y: divide-y-0 at sm would strip the chips' top/bottom borders. */}
          <ul role="list" className="mt-3 border-t border-gray-300 sm:flex sm:flex-wrap sm:gap-2 sm:border-t-0">
            {standards.map((s) => (
              <li key={s.code} className="flex items-baseline justify-between gap-4 border-b border-gray-300 py-2.5 sm:block sm:rounded-md sm:border sm:px-3 sm:py-2">
                <span dir="ltr" className="block font-display text-small font-semibold text-ink">
                  {s.code}
                </span>
                <span className="block text-end text-caption text-gray-600 sm:text-start">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------- 7. Factories */

function Factories() {
  const { t } = useTranslation('services');
  const figures = t('manufacturingPage.factories.figures', { returnObjects: true }) as string[];
  const countries = t('manufacturingPage.factories.countries', { returnObjects: true }) as { name: string; body: string; values: string[]; imageAlt: string }[];
  return (
    <Section background="charcoal" spacing="sm">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-6">
          <Eyebrow theme="dark">{t('manufacturingPage.factories.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" theme="dark" className="mt-3 text-balance">
            {t('manufacturingPage.factories.heading')}
          </Heading>
        </div>
        <p className="text-body leading-relaxed text-gray-300 lg:col-span-6">{t('manufacturingPage.factories.intro')}</p>
      </div>
      {/* Phones: swipeable row with dots. From sm: three columns. */}
      <div className="mt-8">
        <RailList dark gridClassName="sm:grid-cols-3 sm:gap-4 md:gap-6">
        {countries.map((country, index) => (
          <li key={country.name} className="flex flex-col overflow-hidden rounded-md border border-white/10 bg-white/[0.04]">
            <div className="aspect-[16/10] overflow-hidden border-b border-white/10 bg-gray-900">
              <img src={FACTORY_IMAGES[index]} srcSet={`${FACTORY_IMAGES[index].replace('.webp', '-800.webp')} 800w, ${FACTORY_IMAGES[index]} 1200w`} sizes="(min-width: 768px) 33vw, 82vw" alt={country.imageAlt} loading="lazy" decoding="async" width={1200} height={750} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-h4 font-semibold text-white">{country.name}</h3>
              <p className="mt-2 text-small leading-relaxed text-gray-300">{country.body}</p>
              <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                {figures.map((label, i) => (
                  <div key={label}>
                    <dt className="text-caption text-gray-400">{label}</dt>
                    <dd dir="ltr" className="mt-1 font-display text-body font-semibold text-white rtl:text-end">
                      {country.values[i]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </li>
        ))}
        </RailList>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- 8. Sectors */

function Sectors() {
  const { t } = useTranslation('services');
  const items = t('manufacturingPage.sectors.items', { returnObjects: true }) as TitleBody[];
  return (
    <Section background="warmwhite" spacing="sm">
      <Eyebrow>{t('manufacturingPage.sectors.eyebrow')}</Eyebrow>
      <Heading level="h2" as="h2" className="mt-3 text-balance">
        {t('manufacturingPage.sectors.heading')}
      </Heading>
      <div className="mt-8">
        {/* Two columns on tablet and desktop alike (client request 2026-11-23). */}
        <RailList gridClassName="sm:grid-cols-2 sm:gap-x-6 sm:gap-y-0">
          {items.map((item, i) => (
            // Phones: white card like the other rails (client request 2026-11-23). From sm: the brand-ruled columns.
            <li key={i} className="rounded-md border border-gray-200 bg-white p-5 sm:rounded-none sm:border-0 sm:border-t-2 sm:border-brand-600 sm:bg-transparent sm:px-0 sm:pb-6 sm:pt-4">
              <h3 className="font-display text-body font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-small leading-relaxed text-gray-600">{item.body}</p>
            </li>
          ))}
        </RailList>
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------- 9. FAQ */

function Faq() {
  const { t } = useTranslation('services');
  const items = t('manufacturingPage.faq.items', { returnObjects: true }) as FaqAccordionItem[];
  return (
    <Section id="faq" background="stone" spacing="sm" aria-labelledby="mfg-faq-heading" className="scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <Eyebrow>{t('manufacturingPage.faq.eyebrow')}</Eyebrow>
        <h2 id="mfg-faq-heading" className="mt-3 font-display text-h2 font-semibold text-ink text-balance">
          {t('manufacturingPage.faq.heading')}
        </h2>
        <FaqAccordion items={Array.isArray(items) ? items : []} idPrefix="mfg-faq" className="mt-8" />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- Closing */

function Closing() {
  const { t } = useTranslation('services');
  return (
    <Section background="charcoal" spacing="sm">
      {/* Heading and line only: no buttons (client request 2026-11-22). */}
      <div className="max-w-2xl">
        <Heading level="h2" as="h2" theme="dark" className="text-balance">
          {t('manufacturingPage.closing.heading')}
        </Heading>
        <p className="mt-3 text-body leading-relaxed text-gray-300">{t('manufacturingPage.closing.description')}</p>
      </div>
    </Section>
  );
}
