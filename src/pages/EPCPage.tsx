import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Eyebrow, Heading } from '../components/typography/Typography';
import { HeroH1 } from '../components/typography/HeroH1';
import { Button, ButtonLink } from '../components/ui/Button';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { FaqAccordion, type FaqAccordionItem } from '../components/common/FaqAccordion';
import { BulletList, ClampedParagraphs, DisclosureList, ImagePlaceholder, RailList, RowTabs } from '../components/services/ServiceBlocks';
import { useTransparentHeader } from '../app/header-transparency';
import { SmartLink } from '../lib/SmartLink';
import { SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity, servicesFaqJsonLd } from '../seo/structuredData';
import { cn } from '../lib/utils';
import { sectorImages } from '../data/homeSectors';

/**
 * EPC — Engineering, Procurement & Construction (/services/turnkey-developments):
 * one responsive page for desktop, tablets and phones, built from the shared
 * service blocks (same language as Manufacturing & Prefabrication and MEP).
 *   1. Hero (warm white): integrated EPC delivery; scroll-to-capabilities + View Projects.
 *   Backgrounds then alternate: stone, warm white, charcoal, warm white, stone,
 *   warm white, charcoal.
 *   2. The EPC approach: single-point accountability, with a fragmented vs
 *      integrated contract diagram (toggle).
 *   3. Core capabilities: Engineering / Procurement / Construction cards.
 *   4. What sets MENASCO EPC apart: procurement, civil & MEP integration and
 *      manufacturing as tabs (the page's central message, stated once).
 *   5. Project controls: five controls as rows.
 *   6. Industry applications: four sectors, each linking to its projects.
 *   7. FAQ, then the closing enquiry (the page's one closing CTA: contact).
 *
 * Calls to action: buttons only in the hero and the closing band; elsewhere one
 * contextual text link where it helps the reader go deeper.
 * No "Selected EPC projects" section until EPC project scopes are verified
 * (client decision 2026-11-23). Copy: services `epcPage.*` (EN + AR).
 * Images are placeholders until photography is supplied, except the sector cards,
 * which reuse the home page sector photos.
 */

const PATH = '/services/turnkey-developments';
const CAPABILITIES_ANCHOR = 'epc-capabilities';
const ADVANTAGE_ANCHOR = 'epc-advantage';

const LINKS = {
  mep: '/services/mep',
  civil: '/services/civil',
  manufacturing: '/services/manufacturing-prefabrication',
  dataCenters: '/services/data-centers',
  quality: '/quality-safety',
  projects: '/projects/categories',
  contact: '/contact',
};

/** Capability card links, in the order of `capabilities.items[].links`. */
const CAPABILITY_LINKS = [[LINKS.mep], [`#${ADVANTAGE_ANCHOR}`], [LINKS.civil, LINKS.mep]];
/**
 * Sector cards, in the order of `industries.items` (photo + onward link).
 * Photos read live from the home page's "Where we work" tiles
 * (src/data/homeSectors.ts), so changing a home tile photo changes the matching
 * EPC card too, except Energy & utilities, which shows a DEWA substation project
 * photo (dewa-substations-5 hero, self-hosted: the Drive original is 738px wide).
 * Client decisions 2026-11-23.
 */
// Every card opens the project portfolio with its own sector filter selected (client request 2026-11-23).
const INDUSTRIES: { image: string; href: string }[] = [
  { image: sectorImages['advanced-technical-facilities'], href: `${LINKS.projects}?category=advanced-technical-facilities` },
  { image: '/epc/energy-substation.webp', href: `${LINKS.projects}?category=infrastructure-utilities` },
  { image: sectorImages['hospitality-landmark-entertainment'], href: `${LINKS.projects}?category=hospitality-landmark-entertainment` },
  { image: sectorImages['residential-commercial'], href: `${LINKS.projects}?category=residential-commercial` },
];

interface TitleBody {
  title: string;
  body: string;
}

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

export default function EPCPage() {
  const { t } = useTranslation('services');
  return (
    <>
      <SEO
        title={t('epcPage.seo.title')}
        description={t('epcPage.seo.description')}
        path={PATH}
        mainEntity={serviceEntity({ name: t('epcPage.seo.title'), description: t('epcPage.seo.description'), url: `${SITE_URL}${PATH}` })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'EPC', path: PATH },
        ]}
        structuredData={servicesFaqJsonLd(t('epcPage.faq.items', { returnObjects: true }))}
      />
      <Hero />
      <Approach />
      <Capabilities />
      <Advantage />
      <Controls />
      <Industries />
      <Faq />
      <Closing />
    </>
  );
}

/* ------------------------------------------------------------ Shared bits */

/** Inline text link with an arrow: the page's default way to point deeper. */
function TextLink({ href, children, dark = false, className }: { href: string; children: ReactNode; dark?: boolean; className?: string }) {
  const inPage = href.startsWith('#');
  const cls = cn(
    'group inline-flex min-h-11 items-center gap-1.5 text-small font-semibold transition-colors duration-base',
    dark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700',
    className,
  );
  const arrow = <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-base group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />;
  return inPage ? (
    <button type="button" className={cls} onClick={() => scrollTo(href.slice(1))}>
      {children}
      {arrow}
    </button>
  ) : (
    <SmartLink href={href} className={cls}>
      {children}
      {arrow}
    </SmartLink>
  );
}

/** Eyebrow + h2 on the left, intro on the right (stacked on phones). */
function SectionHead({ eyebrow, heading, intro, dark = false }: { eyebrow: string; heading: string; intro?: string; dark?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end lg:gap-12">
      <div className="lg:col-span-6">
        <Eyebrow theme={dark ? 'dark' : undefined}>{eyebrow}</Eyebrow>
        <Heading level="h2" as="h2" theme={dark ? 'dark' : undefined} className="mt-3 text-balance">
          {heading}
        </Heading>
      </div>
      {intro && <p className={cn('text-body leading-relaxed lg:col-span-6', dark ? 'text-gray-300' : 'text-gray-600')}>{intro}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ 1. Hero */

function Hero() {
  const { t } = useTranslation('services');
  useTransparentHeader(true);
  return (
    // Warm white hero (client request 2026-11-23); the transparent header follows it.
    <Section background="warmwhite" spacing="sm" className="md:pt-12 desktop:pt-32">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <HeroH1
            eyebrow={
              <Eyebrow as="span" className="block">
                {t('epcPage.hero.eyebrow')}
              </Eyebrow>
            }
            title={<span className="mt-3 block font-display text-h1 font-semibold text-ink text-balance">{t('epcPage.hero.title')}</span>}
          />
          <p className="mt-4 max-w-2xl text-body text-gray-600 md:text-body-lg">{t('epcPage.hero.description')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" trailingIcon={ArrowDown} onClick={() => scrollTo(CAPABILITIES_ANCHOR)}>
              {t('epcPage.hero.primaryCta')}
            </Button>
            <ButtonLink href={LINKS.projects} variant="outline" theme="light" trailingIcon={ArrowRight}>
              {t('epcPage.hero.secondaryCta')}
            </ButtonLink>
          </div>
        </div>
        {/* Portrait placeholder only where text and image sit side by side (desktop). */}
        <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
          <ImagePlaceholder label={t('epcPage.hero.placeholder')} className="aspect-[4/5]" />
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------- 2. Approach */

function Approach() {
  const { t } = useTranslation('services');
  const paragraphs = t('epcPage.approach.paragraphs', { returnObjects: true }) as string[];
  return (
    <Section background="stone" spacing="sm">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10 lg:gap-12">
        <ScrollReveal className="md:col-span-6">
          <Eyebrow>{t('epcPage.approach.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('epcPage.approach.heading')}
          </Heading>
          <ClampedParagraphs id="epc-approach-text" paragraphs={paragraphs} />
        </ScrollReveal>
        <div className="md:col-span-6">
          <ContractDiagram />
        </div>
      </div>
    </Section>
  );
}

/**
 * Fragmented vs integrated contracting, drawn in SVG (no image asset): the
 * client either holds six separate contracts and every interface between
 * them, or one contract with MENASCO managing the rest. A two-way toggle
 * switches views, so the comparison costs one diagram's height.
 */
function ContractDiagram() {
  const { t, i18n } = useTranslation('services');
  // Always opens on "Separate contracts" (client request 2026-11-23), so the comparison reads problem → solution.
  const [integrated, setIntegrated] = useState(false);
  const labels = t('epcPage.approach.diagram.nodes', { returnObjects: true }) as string[];
  // Arabic reads right to left: the first party sits on the right.
  const nodes = i18n?.dir?.() === 'rtl' ? [...labels].reverse() : labels;
  // Geometry adapts to the number of parties (six: design, procurement, manufacturing, civil, MEP, execution).
  const W = 420;
  const CX = W / 2;
  const GAP = 4;
  const NODE_W = (W - 8 - GAP * (nodes.length - 1)) / nodes.length;
  const xs = nodes.map((_, i) => 4 + NODE_W / 2 + i * (NODE_W + GAP));
  const NODE_Y = 176;
  const pill = (active: boolean) =>
    cn(
      'min-h-10 flex-1 whitespace-nowrap rounded-sm px-2 text-caption font-semibold transition-colors sm:px-3 sm:text-small duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      active ? 'bg-charcoal text-white' : 'text-gray-600 hover:text-ink',
    );
  return (
    <figure className="rounded-md border border-gray-200 bg-white p-4 sm:p-6">
      <div role="group" aria-label={t('epcPage.approach.diagram.label')} className="flex gap-1 rounded-md border border-gray-200 bg-stone p-1">
        <button type="button" aria-pressed={!integrated} onClick={() => setIntegrated(false)} className={pill(!integrated)}>
          {t('epcPage.approach.diagram.fragmented')}
        </button>
        <button type="button" aria-pressed={integrated} onClick={() => setIntegrated(true)} className={pill(integrated)}>
          {t('epcPage.approach.diagram.integrated')}
        </button>
      </div>
      <svg viewBox={`0 0 ${W} 236`} className="mt-4 w-full" role="img" aria-label={integrated ? t('epcPage.approach.diagram.integratedNote') : t('epcPage.approach.diagram.fragmentedNote')}>
        {/* Fragmented: a line from the client to every party, plus the interfaces between parties. */}
        <g className={cn('transition-opacity duration-slow', integrated ? 'opacity-0' : 'opacity-100')}>
          {xs.map((x) => (
            <line key={`c${x}`} x1={CX} y1="44" x2={x} y2={NODE_Y - 14} className="stroke-gray-400" strokeWidth="1.25" />
          ))}
          {xs.slice(0, -1).map((x, i) => (
            <path key={`i${x}`} d={`M${x} ${NODE_Y + 14} Q ${(x + xs[i + 1]) / 2} ${NODE_Y + 34} ${xs[i + 1]} ${NODE_Y + 14}`} fill="none" className="stroke-gray-400" strokeWidth="1.25" strokeDasharray="3 3" />
          ))}
          <path d={`M${xs[0]} ${NODE_Y + 14} Q ${CX} ${NODE_Y + 62} ${xs[xs.length - 1]} ${NODE_Y + 14}`} fill="none" className="stroke-gray-300" strokeWidth="1.25" strokeDasharray="3 3" />
        </g>
        {/* Integrated: client -> MENASCO -> every party. MENASCO sits just under the client,
            so its fan of lines keeps nearly the same shape as the client's fan in the other view. */}
        <g className={cn('transition-opacity duration-slow', integrated ? 'opacity-100' : 'opacity-0')}>
          <line x1={CX} y1="44" x2={CX} y2="56" className="stroke-brand-600" strokeWidth="2" />
          {xs.map((x) => (
            <line key={`m${x}`} x1={CX} y1="84" x2={x} y2={NODE_Y - 14} className="stroke-brand-400" strokeWidth="1.5" />
          ))}
          <rect x={CX - 52} y="56" width="104" height="28" rx="6" className="fill-brand-600" />
          <text x={CX} y="74.5" textAnchor="middle" className="fill-white font-display text-[11px] font-semibold">
            {t('epcPage.approach.diagram.menasco')}
          </text>
        </g>
        <rect x={CX - 40} y="16" width="80" height="28" rx="6" className="fill-charcoal" />
        <text x={CX} y="34.5" textAnchor="middle" className="fill-white font-display text-[11px] font-semibold">
          {t('epcPage.approach.diagram.client')}
        </text>
        {xs.map((x, i) => (
          <g key={`n${x}`}>
            <rect x={x - NODE_W / 2} y={NODE_Y - 14} width={NODE_W} height="28" rx="6" className={cn('stroke-gray-300', integrated ? 'fill-brand-50' : 'fill-stone')} strokeWidth="1" />
            <text x={x} y={NODE_Y + 4} textAnchor="middle" className="fill-ink text-[8.5px] font-semibold">
              {nodes[i]}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-3 text-small leading-relaxed text-gray-600" aria-live="polite">
        {integrated ? t('epcPage.approach.diagram.integratedNote') : t('epcPage.approach.diagram.fragmentedNote')}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------ 3. Capabilities */

interface Capability {
  title: string;
  subtitle: string;
  body: string;
  activities: string[];
  links: string[];
}

function Capabilities() {
  const { t } = useTranslation('services');
  const items = t('epcPage.capabilities.items', { returnObjects: true }) as Capability[];
  return (
    <Section id={CAPABILITIES_ANCHOR} background="warmwhite" spacing="sm" className="scroll-mt-20">
      <SectionHead eyebrow={t('epcPage.capabilities.eyebrow')} heading={t('epcPage.capabilities.heading')} intro={t('epcPage.capabilities.intro')} />
      <div className="mt-8">
        {/* Phones: swipe rail. Tablet: two columns, the third card full width. Desktop: three columns. */}
        <RailList gridClassName="sm:grid-cols-2 sm:gap-6 sm:[&>li:last-child]:col-span-2 lg:grid-cols-3 lg:[&>li:last-child]:col-span-1">
          {items.map((item, i) => (
            <CapabilityCard key={item.title} item={item} index={i} activitiesLabel={t('epcPage.capabilities.activitiesLabel')} />
          ))}
        </RailList>
      </div>
    </Section>
  );
}

/** One function card; its key activities sit behind a toggle on phones and show in full from md. */
function CapabilityCard({ item, index, activitiesLabel }: { item: Capability; index: number; activitiesLabel: string }) {
  const [open, setOpen] = useState(false);
  const listId = `epc-cap-activities-${index}`;
  return (
    <li className="flex flex-col rounded-md border border-gray-200 bg-white p-5 sm:p-6 lg:p-7">
      <span className="font-display text-caption font-semibold tabular-nums text-brand-600">{String(index + 1).padStart(2, '0')}</span>
      <h3 className="mt-2 font-display text-h3 font-semibold text-ink">{item.title}</h3>
      <p className="mt-1 text-small font-semibold text-gray-500">{item.subtitle}</p>
      <p className="mt-3 text-small leading-relaxed text-gray-600">{item.body}</p>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 self-start text-small font-semibold text-brand-600 md:hidden"
      >
        {activitiesLabel}
        <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', open && 'rotate-180')} />
      </button>
      <div id={listId} className={cn('mt-1 md:mt-4 md:block', !open && 'hidden')}>
        <p className="hidden text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal md:block">{activitiesLabel}</p>
        <BulletList items={item.activities} className="mt-2" />
      </div>
      <div className="mt-auto flex flex-wrap gap-x-5 pt-3">
        {item.links.map((label, j) => (
          <TextLink key={label} href={CAPABILITY_LINKS[index]?.[j] ?? LINKS.mep}>
            {label}
          </TextLink>
        ))}
      </div>
    </li>
  );
}

/* --------------------------------------------------------- 4. Advantage */

interface AdvantageTab {
  title: string;
  heading: string;
  paragraphs: string[];
  listLabel: string;
  items: TitleBody[];
}

function Advantage() {
  const { t } = useTranslation('services');
  const tabs = t('epcPage.advantage.tabs', { returnObjects: true }) as AdvantageTab[];
  const links = t('epcPage.advantage.links', { returnObjects: true }) as Record<'civil' | 'mep' | 'manufacturing', string>;
  /** Each tab's onward links: procurement none, civil & MEP both, manufacturing its page. */
  const tabLinks: { href: string; label: string }[][] = [[], [{ href: LINKS.civil, label: links.civil }, { href: LINKS.mep, label: links.mep }], [{ href: LINKS.manufacturing, label: links.manufacturing }]];

  const body = (tab: AdvantageTab, i: number, phone: boolean) => (
    <>
      {!phone && <h3 className="font-display text-h4 font-semibold text-white">{tab.heading}</h3>}
      {phone ? (
        <>
          <p className="font-display text-body font-semibold text-white">{tab.heading}</p>
          <ClampedParagraphs id={`epc-adv-text-${i}`} paragraphs={tab.paragraphs} dark />
        </>
      ) : (
        tab.paragraphs.map((p, k) => (
          <p key={k} className="mt-3 text-body leading-relaxed text-gray-300">
            {p}
          </p>
        ))
      )}
      <p className="mt-5 font-display text-caption font-semibold uppercase tracking-widest text-brand-400 rtl:tracking-normal">{tab.listLabel}</p>
      <ul role="list" className="mt-2 grid grid-cols-1 gap-x-6 lg:grid-cols-2">
        {tab.items.map((item) => (
          <li key={item.title} className="border-t border-white/10 py-3">
            <p className="text-small font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-small leading-relaxed text-gray-400">{item.body}</p>
          </li>
        ))}
      </ul>
      {tabLinks[i].length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-5">
          {tabLinks[i].map((l) => (
            <TextLink key={l.href} href={l.href} dark>
              {l.label}
            </TextLink>
          ))}
        </div>
      )}
    </>
  );

  return (
    <Section id={ADVANTAGE_ANCHOR} background="charcoal" spacing="sm" className="scroll-mt-20">
      {/* Tablet/desktop: heading + tabs pinned together on the left, intro above the panel on the right.
          Phones: heading, intro, then tap-to-open rows (first open). */}
      <RowTabs
        dark
        sticky
        idPrefix="epc-adv"
        label={t('epcPage.advantage.heading')}
        lead={
          <>
            <Eyebrow theme="dark">{t('epcPage.advantage.eyebrow')}</Eyebrow>
            <Heading level="h2" as="h2" theme="dark" className="mt-3 text-balance">
              {t('epcPage.advantage.heading')}
            </Heading>
          </>
        }
        aside={<p className="text-body leading-relaxed text-gray-300">{t('epcPage.advantage.intro')}</p>}
        phone={<DisclosureList dark numbered={false} idPrefix="epc-adv-m" defaultOpen={0} items={tabs.map((tab, i) => ({ title: tab.title, content: body(tab, i, true) }))} />}
        tabs={tabs.map((tab, i) => ({ title: tab.title, panel: body(tab, i, false) }))}
      />
    </Section>
  );
}

/* ---------------------------------------------------------- 5. Controls */

function Controls() {
  const { t } = useTranslation('services');
  const paragraphs = t('epcPage.controls.paragraphs', { returnObjects: true }) as string[];
  const items = t('epcPage.controls.items', { returnObjects: true }) as TitleBody[];
  return (
    <Section background="warmwhite" spacing="sm">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <ScrollReveal className="lg:col-span-5">
          <Eyebrow>{t('epcPage.controls.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('epcPage.controls.heading')}
          </Heading>
          <ClampedParagraphs id="epc-controls-text" paragraphs={paragraphs} />
          {/* Own row, so it never sits beside "Read more" on phones. */}
          <div className="md:mt-2">
            <TextLink href={LINKS.quality}>{t('epcPage.controls.link')}</TextLink>
          </div>
        </ScrollReveal>
        <div className="lg:col-span-7">
          <DisclosureList idPrefix="epc-ctrl" items={items.map((item) => ({ title: item.title, content: <p className="text-small leading-relaxed text-gray-600">{item.body}</p> }))} />
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------- 6. Industries */

function Industries() {
  const { t } = useTranslation('services');
  const items = t('epcPage.industries.items', { returnObjects: true }) as (TitleBody & { link: string })[];
  return (
    <Section background="stone" spacing="sm">
      <SectionHead eyebrow={t('epcPage.industries.eyebrow')} heading={t('epcPage.industries.heading')} intro={t('epcPage.industries.intro')} />
      <div className="mt-8">
        <RailList gridClassName="sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {items.map((item, i) => (
            <li key={item.title} className="flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white">
              <div className="aspect-[16/10] overflow-hidden border-b border-gray-200 bg-gray-100">
                {/* Decorative: the sector title sits right below. */}
                <img src={INDUSTRIES[i]?.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-h4 font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-small leading-relaxed text-gray-600">{item.body}</p>
                <TextLink href={INDUSTRIES[i]?.href ?? LINKS.projects} className="mt-auto pt-2">
                  {item.link}
                </TextLink>
              </div>
            </li>
          ))}
        </RailList>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ 7. FAQ */

function Faq() {
  const { t } = useTranslation('services');
  const items = t('epcPage.faq.items', { returnObjects: true }) as FaqAccordionItem[];
  return (
    <Section id="faq" background="warmwhite" spacing="sm" aria-labelledby="epc-faq-heading" className="scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <Eyebrow>{t('epcPage.faq.eyebrow')}</Eyebrow>
        <h2 id="epc-faq-heading" className="mt-3 font-display text-h2 font-semibold text-ink text-balance">
          {t('epcPage.faq.heading')}
        </h2>
        <FaqAccordion items={Array.isArray(items) ? items : []} idPrefix="epc-faq" className="mt-8" />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- Closing */

function Closing() {
  const { t } = useTranslation('services');
  return (
    <Section background="charcoal" spacing="sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-2xl">
          <Heading level="h2" as="h2" theme="dark" className="text-balance">
            {t('epcPage.closing.heading')}
          </Heading>
          <p className="mt-3 text-body leading-relaxed text-gray-300">{t('epcPage.closing.description')}</p>
        </div>
        <ButtonLink href={LINKS.contact} variant="primary" trailingIcon={ArrowRight} className="w-full shrink-0 sm:w-auto">
          {t('epcPage.closing.cta')}
        </ButtonLink>
      </div>
    </Section>
  );
}
