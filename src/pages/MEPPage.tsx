import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { Button, ButtonLink } from '../components/ui/Button';
import { SmartLink } from '../lib/SmartLink';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { MepSystemsDiagram } from '../components/services/mep/MepSystemsDiagram';
import { FaqAccordion, type FaqAccordionItem } from '../components/common/FaqAccordion';
import { KeywordPills, type KeywordPill } from '../components/common/KeywordPills';
import { publishedProjects } from '../data/projects';
import { ProjectImage } from '../components/media/ProjectImage';
import { sectorKeys } from '../data/homeSectors';
import { SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';
import { cn } from '../lib/utils';

/**
 * MEP — MENASCO's core discipline (one responsive page for desktop, tablets
 * and phones). Industrial modernism × technical editorial:
 *   1. Hero — text left, real plant-room photograph right (photo on desktop only).
 *   2. Multidisciplinary coordination — the signature element: an isometric
 *      coordinated model with switchable discipline layers.
 *   3. Capability metrics — a slim row of compact cards (swipeable on phones).
 *   4. Technical disciplines — image-led cards linking to the four discipline
 *      pages (2×2 from tablets up; a swipeable row on phones).
 *   5. Selected MEP projects — six completed projects linking to their pages.
 *   6. FAQ — six technical questions in a single-column accordion.
 */

/** Real MENASCO plant-room photograph (Volante mechanical floor). */
const HERO_IMAGE = '/Mechanical_Floor_Volante-2-2-3.jpg';

/** Discipline card photos — PLACEHOLDERS (AI-generated / stock) until dedicated MENASCO photography per discipline is supplied. */
const DISCIPLINE_IMAGES = ['/mep/mechanical.webp', '/mep/electrical.webp', '/mep/plumbing.webp', '/mep/fire.webp'];

const DISCIPLINES_ANCHOR = 'mep-disciplines';

/**
 * Capability metrics. `value: null` = awaiting a verified figure (never
 * estimated or derived from the sample projects data); `pending` = a
 * user-provided figure still to be confirmed. Replace before launch.
 */
const METRICS: { key: 'engineers' | 'projects' | 'contractValue'; value: string | null; pending?: boolean }[] = [
  { key: 'engineers', value: '1,500+', pending: true }, // confirm employee classification and reporting period
  { key: 'projects', value: null }, // verified completed MEP project count
  { key: 'contractValue', value: null }, // cumulative awarded or completed value, clearly defined
];

interface DisciplineItem {
  label: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  imageAlt: string;
}

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
      />
      {/* Page h1 for phones/tablets; on desktop the active nav item is the h1 (DesktopNav). */}
      <SectionH1 />
      <Hero />
      <Integration />
      <Metrics />
      <Disciplines />
      <SelectedProjects />
      <Faq />
    </>
  );
}

function SectionH1() {
  const { t } = useTranslation('nav');
  return <h1 className="sr-only min-[1025px]:hidden">{t('services')}</h1>;
}

/* ------------------------------------------------------------------ 1. Hero */

function Hero() {
  const { t } = useTranslation('services');
  const keywordList = t('mepPage.hero.keywords.items', { returnObjects: true });
  const keywords = (Array.isArray(keywordList) ? keywordList : []) as KeywordPill[];
  const countryList = t('operatingCountries.items', { returnObjects: true });
  const countries = (Array.isArray(countryList) ? countryList : []) as KeywordPill[];
  const scrollToDisciplines = () =>
    document.getElementById(DISCIPLINES_ANCHOR)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

  return (
    <Section background="warmwhite" spacing="sm" className="md:pt-12">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <Eyebrow>{t('mepPage.hero.eyebrow')}</Eyebrow>
          <h2 className="mt-3 font-display text-h1 font-semibold text-ink text-balance">{t('mepPage.hero.title')}</h2>
          <p className="mt-4 max-w-2xl text-body text-gray-600 md:text-body-lg">{t('mepPage.hero.description')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" trailingIcon={ArrowDown} onClick={scrollToDisciplines}>
              {t('mepPage.hero.primaryCta')}
            </Button>
            <ButtonLink href="/projects/categories" variant="outline" trailingIcon={ArrowRight}>
              {t('mepPage.hero.secondaryCta')}
            </ButtonLink>
          </div>
        </div>
        {/* Photo + specialism pills only where text and image fit side by side (desktop); phones/tablets get text only.
            The pills stay in the DOM at every size (hidden visually below desktop), so crawlers always see them. */}
        <div className="hidden lg:col-span-6 lg:block">
          <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
            <img src={HERO_IMAGE} alt={t('mepPage.hero.imageAlt')} className="h-full w-full object-cover" loading="eager" />
          </div>
          <KeywordPills items={keywords} label={t('mepPage.hero.keywords.label')} className="mt-4" />
          <KeywordPills items={countries} label={t('operatingCountries.label')} showLabel className="mt-2" />
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
    <Section background="ink" spacing="sm">
      {/* Phones/tablets: heading → model → paragraphs, so the model leads. Desktop: text left, model right. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-5">
        <ScrollReveal className="lg:col-span-5 lg:row-start-1 lg:self-end">
          <Eyebrow theme="dark">{t('mepPage.integration.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" theme="dark" className="mt-3 text-balance">
            {t('mepPage.integration.heading')}
          </Heading>
        </ScrollReveal>
        <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center">
          <MepSystemsDiagram />
        </div>
        {/* Collapsed behind "Read more" (full text stays in the DOM): phones/tablets show three lines;
            desktop shows the first paragraph in full, so the column stays readable without a long section. */}
        <div className="lg:col-span-5 lg:row-start-2">
          <div id="mep-coordination-text">
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className={cn(
                  'text-body leading-relaxed text-gray-300',
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
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-400 transition-colors duration-base hover:text-brand-300"
          >
            {textOpen ? t('common:buttons.showLess') : t('common:buttons.readMore')}
            <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', textOpen && 'rotate-180')} />
          </button>
        </div>
      </div>
    </Section>
  );
}

/** Capability metrics — their own slim row of compact cards (swipeable on phones). */
function Metrics() {
  const { t } = useTranslation('services');
  return (
    <section aria-labelledby="mep-metrics-label" className="bg-warmwhite py-6 md:py-8">
      <Container>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <p id="mep-metrics-label" className="shrink-0 font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">
            {t('mepPage.stats.eyebrow')}
          </p>
          <dl className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-6 px-6 md:mx-0 md:grid md:flex-1 md:grid-cols-3 md:overflow-visible md:px-0">
            {METRICS.map((metric) => (
              <div key={metric.key} className="flex min-w-[15.5rem] shrink-0 snap-start items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 md:min-w-0">
                <dt className="min-w-0">
                  <span className="block text-small font-semibold leading-tight text-ink">{t(`mepPage.stats.${metric.key}`)}</span>
                  {(metric.pending || !metric.value) && (
                    <span className="mt-0.5 block text-caption font-semibold text-warning">{metric.value ? t('mepPage.stats.pending') : t('mepPage.stats.awaiting')}</span>
                  )}
                </dt>
                <dd className={cn('order-first shrink-0 font-display text-h3 font-semibold leading-none tracking-tight tabular-nums', metric.value ? 'text-brand-600' : 'text-gray-300')}>
                  {metric.value ?? '—'}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------- 3. Technical disciplines */

function Disciplines() {
  const { t } = useTranslation('services');
  const items = t('mepPage.disciplinesSection.items', { returnObjects: true }) as DisciplineItem[];
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Phones: which card the row is on (drives the dots). scrollLeft runs negative in RTL.
  const updateActive = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const travelled = Math.abs(rail.scrollLeft);
    const max = rail.scrollWidth - rail.clientWidth;
    const first = rail.firstElementChild as HTMLElement | null;
    const index = travelled >= max - 4 ? items.length - 1 : first ? Math.round(travelled / (first.offsetWidth + 16)) : 0;
    setActive(Math.min(items.length - 1, Math.max(0, index)));
  }, [items.length]);

  useEffect(() => {
    updateActive();
    window.addEventListener('resize', updateActive);
    return () => window.removeEventListener('resize', updateActive);
  }, [updateActive]);

  return (
    <Section id={DISCIPLINES_ANCHOR} background="stone" spacing="sm" className="scroll-mt-20">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
        <div>
          <Eyebrow>{t('mepPage.disciplinesSection.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('mepPage.disciplinesSection.heading')}
          </Heading>
        </div>
        <Text muted className="max-w-2xl">
          {t('mepPage.disciplinesSection.description')}
        </Text>
      </div>

      {/* Phones: swipeable row with dots. Tablets and up: 2×2 grid. */}
      <div
        ref={railRef}
        onScroll={updateActive}
        className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:mt-10 lg:gap-6"
      >
        {items.map((item, index) => (
          <article
            key={item.href}
            className="group relative flex w-[82vw] max-w-[22rem] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-shadow duration-base hover:shadow-lg focus-within:ring-2 focus-within:ring-brand-500 md:w-auto md:max-w-none md:shrink"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <img
                src={DISCIPLINE_IMAGES[index]}
                alt={item.imageAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.05] motion-reduce:transition-none"
              />
            </div>
            <div className="flex flex-1 flex-col p-5 md:p-6">
              <span className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{item.label}</span>
              <h3 className="mt-2 font-display text-h3 font-semibold text-ink">
                {/* Stretched link: the whole card opens the discipline page. */}
                <SmartLink href={item.href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                  {item.title}
                </SmartLink>
              </h3>
              <p className="mt-3 flex-1 text-body text-gray-600">{item.description}</p>
              <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-ink transition-colors duration-base group-hover:text-brand-600">
                {item.cta}
                <ArrowRight size={16} className="transition-transform duration-base group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </span>
            </div>
          </article>
        ))}
      </div>
      <div aria-hidden="true" className="flex justify-center gap-1.5 pt-4 md:hidden">
        {items.map((item, index) => (
          <span key={item.href} className={cn('h-1.5 rounded-full transition-all duration-base', index === active ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300')} />
        ))}
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
    <Section id="mep-projects" background="warmwhite" spacing="sm" aria-labelledby="mep-projects-heading">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-14">
        <div>
          <Eyebrow>{t('services:mepPage.projects.eyebrow')}</Eyebrow>
          <h2 id="mep-projects-heading" className="mt-3 font-display text-h2 font-semibold text-ink text-balance">
            {t('services:mepPage.projects.heading')}
          </h2>
        </div>
        <Text muted className="max-w-2xl">
          {t('services:mepPage.projects.intro')}
        </Text>
      </div>

      {/* Phones: swipeable row. Tablets: 2 columns. Desktop: 3 columns. */}
      <ul role="list" className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
        {projects.map((project) => {
          const key = `services:mepPage.projects.items.${project.slug}`;
          const sector = project.category ? t(`projects:categories.${sectorKeys[project.category] ?? project.category}.title`) : '';
          return (
            <li key={project.slug} className="group relative flex w-[82vw] max-w-[22rem] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-shadow duration-base hover:shadow-lg focus-within:ring-2 focus-within:ring-brand-500 md:w-auto md:max-w-none md:shrink">
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <ProjectImage src={`/mep/projects/${project.slug}.webp`} alt="" imgClassName="transition-transform duration-slow ease-engineered group-hover:scale-[1.05] motion-reduce:transition-none" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{sector}</span>
                <h3 className="mt-2 font-display text-h4 font-semibold text-ink">
                  {/* Stretched link: the whole card opens the project page. */}
                  <SmartLink href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                    {project.title}
                  </SmartLink>
                </h3>
                <p className="mt-1 text-small text-gray-500">
                  {[project.location, project.year].filter(Boolean).join(' · ')}
                </p>
                {/* Desktop: summaries clamped to two lines until "Read all" (full text stays in the DOM). */}
                <p id={`mep-project-summary-${project.slug}`} className={cn('mt-3 text-small leading-relaxed text-gray-600', !summariesOpen && 'lg:line-clamp-2')}>
                  {t(`${key}.summary`)}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="rounded-full bg-stone px-2.5 py-1 text-caption font-semibold text-ink tabular-nums">{t(`${key}.fact`)}</span>
                  <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-gray-400 transition-[transform,color] duration-base group-hover:translate-x-0.5 group-hover:text-brand-600 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <ButtonLink href="/projects/categories" variant="outline" trailingIcon={ArrowRight}>
          {t('services:mepPage.projects.viewAll')}
        </ButtonLink>
        <button
          type="button"
          aria-expanded={summariesOpen}
          aria-controls={projects.map((project) => `mep-project-summary-${project.slug}`).join(' ')}
          onClick={() => setSummariesOpen((open) => !open)}
          className="hidden min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700 lg:inline-flex"
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
