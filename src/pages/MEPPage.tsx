import { useState } from 'react';
import { HeroH1 } from '../components/typography/HeroH1';
import { ArrowDown, ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { Button, ButtonLink } from '../components/ui/Button';
import { SmartLink } from '../lib/SmartLink';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { MepSystemsDiagram } from '../components/services/mep/MepSystemsDiagram';
import { MepDisciplineSheets } from '../components/services/mep/MepDisciplineSheets';
import { MEP_DISCIPLINE_ANCHORS } from '../data/mepDisciplines';
import { FaqAccordion, type FaqAccordionItem } from '../components/common/FaqAccordion';
import { publishedProjects } from '../data/projects';
import { ProjectImage } from '../components/media/ProjectImage';
import { sectorKeys } from '../data/homeSectors';
import { SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { useTransparentHeader } from '../app/header-transparency';
import { serviceEntity, servicesFaqJsonLd } from '../seo/structuredData';
import { cn } from '../lib/utils';

/**
 * MEP — MENASCO's core discipline (one responsive page for desktop, tablets
 * and phones). Industrial modernism × technical editorial:
 *   1. Hero — text left, real plant-room photograph right (photo on desktop only).
 *   2. Multidisciplinary coordination — the signature element: an isometric
 *      coordinated model with switchable discipline layers.
 *   3. Capability metrics — a row inside the coordination section.
 *   4. Technical disciplines — the four disciplines as drawing sheets (folder
 *      tabs from tablets up; stacked, unfolding rows on phones).
 *   5. Selected MEP projects — six completed projects linking to their pages.
 *   6. FAQ — six technical questions in a single-column accordion.
 */

/** Real MENASCO plant-room photograph (Volante mechanical floor). */
const HERO_IMAGE = '/Mechanical_Floor_Volante-2-2-3.jpg';

const DISCIPLINES_ANCHOR = 'mep-disciplines';

/** Capability metrics (company-confirmed figures). Labels: services `mepPage.stats.*`. */
const METRICS: { key: 'projects' | 'bimEngineers' | 'workforce'; value: string }[] = [
  { key: 'projects', value: '350+' },
  { key: 'bimEngineers', value: '140' },
  { key: 'workforce', value: '6,000' },
];


export default function MEPPage() {
  const { t } = useTranslation('services');

  return (
    <>
      <SEO
        title={t('mepPage.seo.title')}
        description={t('mepPage.seo.description')}
        path="/services/mep"
        mainEntity={serviceEntity({
          name: t('mepPage.seo.title'),
          description: t('mepPage.seo.description'),
          url: `${SITE_URL}/services/mep`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'MEP', path: '/services/mep' },
        ]}
        structuredData={servicesFaqJsonLd(t('mepPage.faq.items', { returnObjects: true }))}
      />
      <Hero />
      <Integration />
      <Disciplines />
      <SelectedProjects />
      <Faq />
    </>
  );
}

/* ------------------------------------------------------------------ 1. Hero */

function Hero() {
  const { t } = useTranslation('services');
  // Desktop: the header floats over this dark hero, so it starts dark and then
  // follows whatever section is behind it as the page scrolls.
  useTransparentHeader(true);
  const scrollToDisciplines = () =>
    document.getElementById(DISCIPLINES_ANCHOR)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

  return (
    <Section background="ink" spacing="sm" className="md:pt-12 desktop:pt-32">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <HeroH1
            eyebrow={
              <Eyebrow as="span" theme="dark" className="block">
                {t('mepPage.hero.eyebrow')}
              </Eyebrow>
            }
            title={<span className="mt-3 block font-display text-h1 font-semibold text-white text-balance">{t('mepPage.hero.title')}</span>}
          />
          <p className="mt-4 max-w-2xl text-body text-gray-300 md:text-body-lg">{t('mepPage.hero.description')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" trailingIcon={ArrowDown} onClick={scrollToDisciplines}>
              {t('mepPage.hero.primaryCta')}
            </Button>
            <ButtonLink href="/projects/categories" variant="outline" theme="dark" trailingIcon={ArrowRight}>
              {t('mepPage.hero.secondaryCta')}
            </ButtonLink>
          </div>
        </div>
        {/* Portrait (4:5) photo only where text and image fit side by side (desktop); phones/tablets get text only. */}
        <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-gray-900">
            <img src={HERO_IMAGE} alt={t('mepPage.hero.imageAlt')} className="h-full w-full object-cover object-[60%_50%]" loading="eager" />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------- 2. Multidisciplinary coordination + capability */

function Integration() {
  const { t } = useTranslation(['services', 'common']);
  const [textOpen, setTextOpen] = useState(false);
  const paragraphs = t('mepPage.integration.paragraphs', { returnObjects: true }) as string[];

  return (
    <Section background="warmwhite" spacing="sm">
      {/* Phones: heading → model → paragraphs, so the model leads. Tablet and desktop: text left, model right. */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-x-8 md:gap-y-5 lg:gap-x-12">
        <ScrollReveal className="md:col-span-5 md:row-start-1 md:self-end">
          <Eyebrow>{t('mepPage.integration.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('mepPage.integration.heading')}
          </Heading>
        </ScrollReveal>
        <div className="md:col-span-7 md:col-start-6 md:row-span-2 md:row-start-1 md:self-center lg:row-span-3">
          <MepSystemsDiagram />
        </div>
        {/* Collapsed behind "Read more" (full text stays in the DOM): phones and tablets show three lines;
            desktop shows the first paragraph in full, so the column stays readable without a long section. */}
        <div className="md:col-span-5 md:row-start-2">
          <div id="mep-coordination-text">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={cn(
                  'text-body leading-relaxed text-gray-600',
                  i > 0 && 'mt-4',
                  !textOpen && (i === 0 ? 'line-clamp-3 lg:line-clamp-none' : 'hidden'),
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <button
            type="button"
            aria-expanded={textOpen}
            aria-controls="mep-coordination-text"
            onClick={() => setTextOpen((open) => !open)}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
          >
            {textOpen ? t('common:buttons.showLess') : t('common:buttons.readMore')}
            <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', textOpen && 'rotate-180')} />
          </button>
        </div>
        <MetricsRow />
      </div>
    </Section>
  );
}

/**
 * Capability metrics, part of the coordination section's grid. Desktop: under
 * the text column, beside the model. Tablet: full width beneath text and model.
 * Phones: after the text. Large figures, short label beneath, hairline dividers.
 */
function MetricsRow() {
  const { t } = useTranslation('services');
  return (
    <section aria-label={t('mepPage.stats.eyebrow')} className="pt-3 md:col-span-12 md:row-start-3 md:pt-4 lg:col-span-5 lg:pt-6">
      <dl className="grid grid-cols-3">
        {METRICS.map((metric, i) => (
          <div key={metric.key} className={cn('flex flex-col', i > 0 && 'border-s border-gray-300 ps-4 lg:ps-6', i < METRICS.length - 1 && 'pe-4 lg:pe-6')}>
            <dt className="mt-2 text-small text-gray-600">{t(`mepPage.stats.${metric.key}`)}</dt>
            <dd dir="ltr" className="order-first font-display text-h2 font-semibold leading-none tracking-tight text-ink tabular-nums rtl:text-end">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* --------------------------------------------------- 3. Technical disciplines */

function Disciplines() {
  const { t } = useTranslation('services');
  return (
    <Section id={DISCIPLINES_ANCHOR} background="stone" spacing="sm" className="scroll-mt-20">
      {/* /services/mep#mechanical etc.: the site's hash scroll lands here (tablet/desktop); the sheets open that discipline. */}
      <div className="relative hidden md:block" aria-hidden="true">
        {Object.values(MEP_DISCIPLINE_ANCHORS).map((anchor) => (
          <span key={anchor} id={anchor} className="absolute top-0 scroll-mt-28" />
        ))}
      </div>
      <Eyebrow>{t('mepPage.disciplinesSection.eyebrow')}</Eyebrow>
      <Heading level="h2" as="h2" className="mt-3 text-balance lg:whitespace-nowrap">
        {t('mepPage.disciplinesSection.heading')}
      </Heading>
      <div className="mt-6 md:mt-8">
        <MepDisciplineSheets />
      </div>
    </Section>
  );
}

/* ---------------------------------------------------- 5. Selected MEP projects */

/**
 * Completed projects featured on the MEP page (slugs from src/data/projects.json;
 * copy in services:mepPage.projects.items). Photos are self-hosted copies in
 * public/mep/projects/ — the records' hotlinked Google Drive images are
 * unreliable in browsers (several return HTML / are blocked by ORB).
 */
const FEATURED_PROJECT_SLUGS = [
  'volante-ii-tower',
  'pcfc-headquarters-building',
  'town-square-development',
  'sparkle-tower',
  'radisson-blu-resort-fujairah',
  'burj-khalifa-substation',
];

function SelectedProjects() {
  const { t } = useTranslation(['services', 'projects']);
  const [summariesOpen, setSummariesOpen] = useState(false);
  const projects = FEATURED_PROJECT_SLUGS.map((slug) => publishedProjects.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <Section id="mep-projects" background="ink" spacing="sm" aria-labelledby="mep-projects-heading">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14 desktop:grid-cols-1">
        <div>
          <Eyebrow theme="dark">{t('services:mepPage.projects.eyebrow')}</Eyebrow>
          <h2 id="mep-projects-heading" className="mt-3 font-display text-h2 font-semibold text-white text-balance desktop:whitespace-nowrap">
            {t('services:mepPage.projects.heading')}
          </h2>
        </div>
        <Text theme="dark" className="max-w-2xl text-gray-300 desktop:hidden">
          {t('services:mepPage.projects.intro')}
        </Text>
      </div>

      {/* Phones: swipeable row. Tablets: 2 columns. Desktop: 3 columns. */}
      <ul role="list" className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
        {projects.map((project) => {
          const key = `services:mepPage.projects.items.${project.slug}`;
          const sector = project.category ? t(`projects:categories.${sectorKeys[project.category] ?? project.category}.title`) : '';
          return (
            <li key={project.slug} className="group relative flex w-[82vw] max-w-[22rem] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-white/10 bg-white/[0.04] transition-colors duration-base hover:border-white/25 hover:bg-white/[0.07] focus-within:ring-2 focus-within:ring-brand-400 md:w-auto md:max-w-none md:shrink">
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-900 md:aspect-[2/1] desktop:aspect-[16/10]">
                <ProjectImage src={`/mep/projects/${project.slug}.webp`} alt="" imgClassName="transition-transform duration-slow ease-engineered group-hover:scale-[1.05] motion-reduce:transition-none" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="font-display text-caption font-semibold uppercase tracking-widest text-brand-400 rtl:tracking-normal">{sector}</span>
                <h3 className="mt-2 font-display text-h4 font-semibold text-white">
                  {/* Stretched link: the whole card opens the project page. */}
                  <SmartLink href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                    {project.title}
                  </SmartLink>
                </h3>
                <p className="mt-1 text-small text-gray-400">
                  {[project.location, project.year].filter(Boolean).join(' · ')}
                </p>
                {/* Desktop only: summaries clamped to two lines until "Read all". Hidden on phones and tablets. */}
                <p id={`mep-project-summary-${project.slug}`} className={cn('mt-3 hidden text-small leading-relaxed text-gray-300', summariesOpen ? 'desktop:block' : 'desktop:line-clamp-2')}>
                  {t(`${key}.summary`)}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-caption font-semibold text-white tabular-nums">{t(`${key}.fact`)}</span>
                  <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-gray-500 transition-[transform,color] duration-base group-hover:translate-x-0.5 group-hover:text-brand-400 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <ButtonLink href="/projects/categories" variant="outline" theme="dark" trailingIcon={ArrowRight}>
          {t('services:mepPage.projects.viewAll')}
        </ButtonLink>
        <button
          type="button"
          aria-expanded={summariesOpen}
          aria-controls={projects.map((project) => `mep-project-summary-${project.slug}`).join(' ')}
          onClick={() => setSummariesOpen((open) => !open)}
          className="hidden min-h-11 items-center gap-1.5 text-small font-semibold text-brand-400 transition-colors duration-base hover:text-brand-300 desktop:inline-flex"
        >
          {summariesOpen ? t('services:mepPage.projects.showLess') : t('services:mepPage.projects.readAll')}
          <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', summariesOpen && 'rotate-180')} />
        </button>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------------- 5. FAQ */

function Faq() {
  const { t } = useTranslation('services');
  const items = t('mepPage.faq.items', { returnObjects: true }) as FaqAccordionItem[];
  return (
    <Section id="faq" background="stone" spacing="sm" aria-labelledby="mep-faq-heading" className="scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <Eyebrow>{t('mepPage.faq.eyebrow')}</Eyebrow>
        <h2 id="mep-faq-heading" className="mt-3 font-display text-h2 font-semibold text-ink text-balance">
          {t('mepPage.faq.heading')}
        </h2>
        <FaqAccordion items={Array.isArray(items) ? items : []} idPrefix="mep-faq" className="mt-8" />
      </div>
    </Section>
  );
}
