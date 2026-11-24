import { useRef, useState, type TouchEvent } from 'react';
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Eyebrow, Heading } from '../components/typography/Typography';
import { HeroH1 } from '../components/typography/HeroH1';
import { Button, ButtonLink } from '../components/ui/Button';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { FaqAccordion, type FaqAccordionItem } from '../components/common/FaqAccordion';
import { BulletList, ClampedParagraphs, DisclosureList, ImagePlaceholder, RailList, RowTabs, SectionHead, TextLink, scrollToId } from '../components/services/ServiceBlocks';
import { useTransparentHeader } from '../app/header-transparency';
import { SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity, servicesFaqJsonLd } from '../seo/structuredData';
import { cn } from '../lib/utils';

/**
 * Civil & Structural Works (/services/civil): one responsive page for desktop,
 * tablets and phones, built from the shared service blocks (same language as
 * EPC and Manufacturing & Prefabrication). MENASCO never presents itself as a
 * standalone civil contractor: civil works are delivered with specialist civil
 * partners (plural, unnamed) and coordinated with MENASCO's MEP scope.
 *   1. Hero (warm white): scroll-to-capabilities + View Projects.
 *   Backgrounds then: stone, warm white, charcoal, warm white, stone,
 *   warm white, warm white (FAQ), charcoal (client request 2026-11-23).
 *   2. Approach: why one programme, with four benefits.
 *   3. Core capabilities: four scope areas as row tabs.
 *   4. Civil & MEP integration: interactive cross-section, four interfaces.
 *   5. BIM & Digital Engineering (the Services menu item jumps here).
 *   6. Data centers & mission-critical civil works.
 *   7. How civil delivery is managed: sequencing, quality & safety, delivery model.
 *   8. FAQ, 9. Closing enquiry (the page's one closing CTA). No sectors section
 *   (removed 2026-11-23, client request).
 *
 * Calls to action: buttons only in the hero and the closing band; elsewhere one
 * contextual text link where it helps the reader go deeper. No projects or
 * statistics section until civil scopes and figures are verified (client
 * decision 2026-11-23). Hero is a CC0 photo; other images are placeholders. Copy: services `civilPage.*`.
 */

const PATH = '/services/civil';
const CAPABILITIES_ANCHOR = 'civil-capabilities';
/**
 * Hero photo: aerial view into a foundation excavation (rebar, formwork, cranes).
 * "View Above Construction Site" by chuttersnap (Unsplash, 2017), CC0 public domain
 * dedication via Wikimedia Commons: no attribution required. Cropped to 4:5
 * (1200 x 1500, plus an 800 px copy). Added 2026-11-24, client request.
 */
const HERO_IMAGE = '/civil/Menasco_Civil_Foundation_Excavation_Aerial.jpg';
const HERO_IMAGE_800 = '/civil/Menasco_Civil_Foundation_Excavation_Aerial_800.jpg';
/** Anchor for the "BIM & Digital Engineering" item in the Services menu (src/data/navigation.ts). */
const BIM_ANCHOR = 'bim-digital-engineering';

const LINKS = {
  epc: '/services/turnkey-developments',
  mep: '/services/mep',
  dataCenters: '/services/data-centers',
  quality: '/quality-safety',
  about: '/about',
  projects: '/projects/categories',
  contact: '/contact',
};

/** Delivery rows' onward links, in the order of `delivery.rows`. */
const DELIVERY_LINKS = [LINKS.epc, LINKS.quality, LINKS.about];

interface TitleBody {
  title: string;
  body: string;
}

export default function CivilPage() {
  const { t } = useTranslation('services');
  return (
    <>
      <SEO
        title={t('civilPage.seo.title')}
        description={t('civilPage.seo.description')}
        path={PATH}
        mainEntity={serviceEntity({ name: t('civilPage.seo.title'), description: t('civilPage.seo.description'), url: `${SITE_URL}${PATH}` })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Civil', path: PATH },
        ]}
        structuredData={servicesFaqJsonLd(t('civilPage.faq.items', { returnObjects: true }))}
      />
      <Hero />
      <Approach />
      <Capabilities />
      <Integration />
      <Bim />
      <MissionCritical />
      <Delivery />
      <Faq />
      <Closing />
    </>
  );
}

/** Numbered item that is a card on phones and desktop, a plain ruled row on tablets (as on Modular Fabrication). */
const NUMBERED_ITEM = 'rounded-md border border-gray-200 bg-white p-5 sm:rounded-none sm:border-0 sm:border-t sm:border-gray-300 sm:bg-transparent sm:px-0 sm:pb-4 sm:pt-4 lg:rounded-md lg:border lg:border-gray-200 lg:bg-white lg:p-5';
const pad = (i: number) => String(i + 1).padStart(2, '0');

/* ------------------------------------------------------------------ 1. Hero */

function Hero() {
  const { t } = useTranslation('services');
  useTransparentHeader(true);
  return (
    <Section background="warmwhite" spacing="sm" className="md:pt-12 desktop:pt-32">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <HeroH1
            eyebrow={
              <Eyebrow as="span" className="block">
                {t('civilPage.hero.eyebrow')}
              </Eyebrow>
            }
            title={<span className="mt-3 block font-display text-h1 font-semibold text-ink text-balance">{t('civilPage.hero.title')}</span>}
          />
          <p className="mt-4 max-w-2xl text-body text-gray-600 md:text-body-lg">{t('civilPage.hero.description')}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" trailingIcon={ArrowDown} onClick={() => scrollToId(CAPABILITIES_ANCHOR)}>
              {t('civilPage.hero.primaryCta')}
            </Button>
            <ButtonLink href={LINKS.projects} variant="outline" theme="light" trailingIcon={ArrowRight}>
              {t('civilPage.hero.secondaryCta')}
            </ButtonLink>
          </div>
        </div>
        {/* Photo only where text and image sit side by side (desktop); phones and tablets keep the hero short. */}
        <div className="hidden lg:col-span-5 lg:col-start-8 lg:block">
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-gray-100">
            <img
              src={HERO_IMAGE}
              srcSet={`${HERO_IMAGE_800} 800w, ${HERO_IMAGE} 1200w`}
              sizes="(min-width: 1280px) 490px, 40vw"
              alt={t('civilPage.hero.imageAlt')}
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------- 2. Approach */

function Approach() {
  const { t } = useTranslation('services');
  const paragraphs = t('civilPage.approach.paragraphs', { returnObjects: true }) as string[];
  const items = t('civilPage.approach.items', { returnObjects: true }) as TitleBody[];
  return (
    <Section background="stone" spacing="sm">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <ScrollReveal className="lg:col-span-5">
          <Eyebrow>{t('civilPage.approach.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('civilPage.approach.heading')}
          </Heading>
          <ClampedParagraphs id="civil-approach-text" paragraphs={paragraphs} />
          <div className="md:mt-2">
            <TextLink href={LINKS.epc}>{t('civilPage.approach.link')}</TextLink>
          </div>
        </ScrollReveal>
        {/* Phones: swipe rail of cards. Tablets: two ruled columns. Desktop: 2 × 2 cards. */}
        <div className="lg:col-span-7">
          <RailList gridClassName="sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0 lg:gap-4">
            {items.map((item, i) => (
              <li key={item.title} className={NUMBERED_ITEM}>
                <span className="font-display text-caption font-semibold tabular-nums text-brand-600">{pad(i)}</span>
                <h3 className="mt-1.5 font-display text-body font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-small leading-relaxed text-gray-600">{item.body}</p>
              </li>
            ))}
          </RailList>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------ 3. Capabilities */

interface CapabilityTab {
  title: string;
  heading: string;
  paragraphs: string[];
  activities: string[];
}

function Capabilities() {
  const { t } = useTranslation('services');
  const tabs = t('civilPage.capabilities.tabs', { returnObjects: true }) as CapabilityTab[];
  const label = t('civilPage.capabilities.activitiesLabel');

  const body = (tab: CapabilityTab, i: number, phone: boolean) => (
    <>
      {phone ? (
        <>
          <p className="font-display text-body font-semibold text-ink">{tab.heading}</p>
          <ClampedParagraphs id={`civil-cap-text-${i}`} paragraphs={tab.paragraphs} />
        </>
      ) : (
        <>
          <h3 className="font-display text-h4 font-semibold text-ink">{tab.heading}</h3>
          {tab.paragraphs.map((p, k) => (
            <p key={k} className="mt-3 text-body leading-relaxed text-gray-600">
              {p}
            </p>
          ))}
        </>
      )}
      <p className="mt-5 text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{label}</p>
      <BulletList items={tab.activities} className="mt-2" />
    </>
  );

  return (
    <Section id={CAPABILITIES_ANCHOR} background="warmwhite" spacing="sm" className="scroll-mt-20">
      <RowTabs
        sticky
        idPrefix="civil-cap"
        label={t('civilPage.capabilities.heading')}
        lead={
          <>
            <Eyebrow>{t('civilPage.capabilities.eyebrow')}</Eyebrow>
            <Heading level="h2" as="h2" className="mt-3 text-balance">
              {t('civilPage.capabilities.heading')}
            </Heading>
          </>
        }
        aside={<p className="text-body leading-relaxed text-gray-600">{t('civilPage.capabilities.intro')}</p>}
        phone={<DisclosureList boxed numbered={false} idPrefix="civil-cap-m" items={tabs.map((tab, i) => ({ title: tab.title, content: body(tab, i, true) }))} />}
        tabs={tabs.map((tab, i) => ({ title: tab.title, panel: body(tab, i, false) }))}
      />
    </Section>
  );
}

/* ------------------------------------------------------- 4. Integration */

function Integration() {
  const { t } = useTranslation('services');
  const paragraphs = t('civilPage.integration.paragraphs', { returnObjects: true }) as string[];
  return (
    <Section background="charcoal" spacing="sm">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <ScrollReveal className="lg:col-span-5">
          <Eyebrow theme="dark">{t('civilPage.integration.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" theme="dark" className="mt-3 text-balance">
            {t('civilPage.integration.heading')}
          </Heading>
          <ClampedParagraphs id="civil-integration-text" paragraphs={paragraphs} dark />
          <div className="md:mt-2">
            <TextLink href={LINKS.mep} dark>
              {t('civilPage.integration.link')}
            </TextLink>
          </div>
        </ScrollReveal>
        <div className="lg:col-span-7">
          <InterfaceDiagram />
        </div>
      </div>
    </Section>
  );
}

/** Hotspot positions on the drawing (viewBox 480 × 290), in the order of `integration.points`. */
const HOTSPOTS = [
  { x: 132, y: 104 }, // slab penetration
  { x: 252, y: 128 }, // equipment on its plinth
  { x: 330, y: 238 }, // duct bank
  { x: 380, y: 132 }, // equipment route into the plantroom
];

/**
 * A building cross-section drawn in SVG (no image asset) with the four civil/MEP
 * interfaces marked: a riser through a slab, plant on its foundation, an
 * underground duct bank to a chamber, and the equipment route into the
 * plantroom. Numbered hotspots select a point; the panel underneath explains it
 * (prev/next arrows, or swipe on touch). Every point's text stays in the DOM.
 */
function InterfaceDiagram() {
  const { t } = useTranslation('services');
  const points = t('civilPage.integration.points', { returnObjects: true }) as TitleBody[];
  const [active, setActive] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = (i: number) => setActive((i + points.length) % points.length);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touch.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touch.current;
    touch.current = null;
    const end = e.changedTouches[0];
    if (!start || !end) return;
    const dx = end.clientX - start.x;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(end.clientY - start.y) * 1.5) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    go(active + ((dx < 0) !== rtl ? 1 : -1));
  };

  /** Stroke/fill for a part of the drawing: brand blue when it belongs to the selected point. */
  const part = (i: number) => (active === i ? 'stroke-brand-400 fill-brand-400/20' : 'stroke-white/40 fill-white/[0.04]');
  const line = (i: number) => (active === i ? 'stroke-brand-400' : 'stroke-white/40');
  const arrowBtn =
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors duration-base hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400';

  return (
    <figure className="rounded-md border border-white/10 bg-white/[0.04] p-4 sm:p-6">
      <div className="relative" dir="ltr">
        <svg viewBox="0 0 480 290" className="w-full" role="img" aria-label={t('civilPage.integration.diagram.label')}>
          {/* Ground and soil */}
          <rect x="0" y="184" width="480" height="106" className="fill-white/[0.03]" />
          <line x1="0" y1="184" x2="480" y2="184" className="stroke-white/50" strokeWidth="1.5" />
          {/* Foundations under the columns */}
          {[48, 164, 280].map((x) => (
            <rect key={x} x={x - 18} y="184" width="36" height="18" className="fill-white/[0.06] stroke-white/40" strokeWidth="1" />
          ))}
          {/* Columns and slabs */}
          {[48, 164, 280].map((x) => (
            <rect key={`c${x}`} x={x - 4} y="36" width="8" height="140" className="fill-white/10" />
          ))}
          <rect x="40" y="30" width="248" height="8" className="fill-white/20" />
          <rect x="40" y="100" width="248" height="8" className="fill-white/20" />
          <rect x="40" y="176" width="248" height="8" className="fill-white/20" />
          {/* 1. Riser through the first-floor slab, with its sleeve */}
          <rect x="96" y="38" width="12" height="138" className={cn(line(0), 'fill-none')} strokeWidth="1.25" />
          <rect x="90" y="96" width="24" height="16" rx="2" className={part(0)} strokeWidth="1.5" />
          {/* 2. Plant on its foundation plinth */}
          <rect x="200" y="140" width="64" height="28" rx="3" className={part(1)} strokeWidth="1.5" />
          <rect x="192" y="168" width="80" height="8" className={part(1)} strokeWidth="1.5" />
          {[212, 232, 252].map((x) => (
            <line key={x} x1={x} y1="146" x2={x} y2="162" className={line(1)} strokeWidth="1" />
          ))}
          {/* 3. Duct bank from the building to a chamber */}
          <rect x="230" y="226" width="160" height="20" rx="2" className={part(2)} strokeWidth="1.5" />
          {[244, 262, 280].map((x) => (
            <circle key={x} cx={x} cy="236" r="4" className={cn(line(2), 'fill-none')} strokeWidth="1" />
          ))}
          <rect x="390" y="184" width="34" height="74" className={part(2)} strokeWidth="1.5" />
          <line x1="230" y1="202" x2="230" y2="226" className={line(2)} strokeWidth="1.25" strokeDasharray="3 3" />
          {/* 4. Equipment route and lifting beam into the plantroom (opening in the end wall) */}
          <line x1="180" y1="118" x2="282" y2="118" className={line(3)} strokeWidth="2" />
          <line x1="232" y1="118" x2="232" y2="132" className={line(3)} strokeWidth="1" />
          <path d="M452 160 H300" className={cn(line(3), 'fill-none')} strokeWidth="1.5" strokeDasharray="5 4" />
          <path d="M306 154 L298 160 L306 166" className={cn(line(3), 'fill-none')} strokeWidth="1.5" />
          <rect x="436" y="146" width="22" height="30" rx="2" className={part(3)} strokeWidth="1.25" />
        </svg>
        {HOTSPOTS.map((spot, i) => (
          <button
            key={i}
            type="button"
            aria-label={points[i]?.title}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            style={{ left: `${(spot.x / 480) * 100}%`, top: `${(spot.y / 290) * 100}%` }}
            className={cn(
              'absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-caption font-semibold tabular-nums ring-2 transition-colors duration-base before:absolute before:-inset-2 before:content-[""] focus-visible:outline-none focus-visible:ring-white',
              active === i ? 'bg-brand-500 text-white ring-brand-300' : 'bg-charcoal text-white ring-white/50 hover:ring-white',
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <p className="mt-3 text-caption text-gray-500">{t('civilPage.integration.diagram.hint')}</p>
      {/* Selected point: swipe (touch) or arrows to move between points. */}
      <div className="mt-3 touch-pan-y border-t border-white/10 pt-4" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="flex items-center justify-between gap-4">
          <p className="font-display text-caption font-semibold tabular-nums text-brand-400">
            {pad(active)} / {pad(points.length - 1)}
          </p>
          <div className="flex gap-2">
            <button type="button" aria-label={t('common:buttons.previous')} onClick={() => go(active - 1)} className={arrowBtn}>
              <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
            <button type="button" aria-label={t('common:buttons.next')} onClick={() => go(active + 1)} className={arrowBtn}>
              <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
          </div>
        </div>
        <div aria-live="polite" className="grid">
          {points.map((p, i) => (
            <div key={p.title} hidden={active !== i} className="[grid-area:1/1]">
              <h3 className="mt-1 font-display text-body font-semibold text-white">{p.title}</h3>
              <p className="mt-1.5 text-small leading-relaxed text-gray-300">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}

/* -------------------------------------------------------------- 5. BIM */

function Bim() {
  const { t } = useTranslation('services');
  const paragraphs = t('civilPage.bim.paragraphs', { returnObjects: true }) as string[];
  const items = t('civilPage.bim.items', { returnObjects: true }) as TitleBody[];
  return (
    <Section id={BIM_ANCHOR} background="warmwhite" spacing="sm" className="scroll-mt-20">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center md:gap-10 lg:gap-12">
        <div className="md:col-span-7">
          <Eyebrow>{t('civilPage.bim.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('civilPage.bim.heading')}
          </Heading>
          {paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="mt-4 text-body leading-relaxed text-gray-600">
              {p}
            </p>
          ))}
          <ul role="list" className="mt-6 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.title} className="border-t border-gray-300 py-3">
                <h3 className="font-display text-small font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-small leading-relaxed text-gray-600">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
        {/* Image beside the text from md; phones skip it to keep the section short. */}
        <div className="hidden md:col-span-5 md:block">
          <ImagePlaceholder label={t('civilPage.bim.placeholder')} className="aspect-[4/5] lg:aspect-[4/3]" />
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------- 6. Mission-critical */

function MissionCritical() {
  const { t } = useTranslation('services');
  const paragraphs = t('civilPage.missionCritical.paragraphs', { returnObjects: true }) as string[];
  const items = t('civilPage.missionCritical.items', { returnObjects: true }) as TitleBody[];
  return (
    <Section background="stone" spacing="sm">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        <ScrollReveal className="lg:col-span-5">
          <Eyebrow>{t('civilPage.missionCritical.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h2" className="mt-3 text-balance">
            {t('civilPage.missionCritical.heading')}
          </Heading>
          <ClampedParagraphs id="civil-mc-text" paragraphs={paragraphs} />
          <div className="md:mt-2">
            <TextLink href={LINKS.dataCenters}>{t('civilPage.missionCritical.link')}</TextLink>
          </div>
        </ScrollReveal>
        {/* Phones: swipe rail. Tablets and desktop: two columns, the fifth card full width. */}
        <div className="lg:col-span-7">
          <RailList gridClassName="sm:grid-cols-2 sm:gap-4 sm:[&>li:last-child]:col-span-2">
            {items.map((item, i) => (
              <li key={item.title} className="rounded-md border border-gray-200 bg-white p-5">
                <span className="font-display text-caption font-semibold tabular-nums text-brand-600">{pad(i)}</span>
                <h3 className="mt-1.5 font-display text-body font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-small leading-relaxed text-gray-600">{item.body}</p>
              </li>
            ))}
          </RailList>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------- 7. Delivery */

interface DeliveryRow {
  title: string;
  body: string;
  items: string[];
  link: string;
}

function Delivery() {
  const { t } = useTranslation('services');
  const rows = t('civilPage.delivery.rows', { returnObjects: true }) as DeliveryRow[];
  const content = (row: DeliveryRow, i: number) => (
    <>
      <p className="text-small leading-relaxed text-gray-600">{row.body}</p>
      <BulletList items={row.items} className="mt-3" />
      <TextLink href={DELIVERY_LINKS[i] ?? LINKS.contact} className="mt-1">
        {row.link}
      </TextLink>
    </>
  );
  return (
    <Section background="warmwhite" spacing="sm">
      <SectionHead eyebrow={t('civilPage.delivery.eyebrow')} heading={t('civilPage.delivery.heading')} intro={t('civilPage.delivery.intro')} />
      {/* Phones: boxed tap-to-open rows (all closed). Tablets: the same rows, all open. Desktop: three cards. */}
      <div className="mt-8 lg:hidden">
        <DisclosureList boxed numbered={false} idPrefix="civil-delivery" items={rows.map((row, i) => ({ title: row.title, content: content(row, i) }))} />
      </div>
      <ul role="list" className="mt-8 hidden gap-6 lg:grid lg:grid-cols-3">
        {rows.map((row, i) => (
          <li key={row.title} className="flex flex-col rounded-md border border-gray-200 bg-white p-6">
            <h3 className="font-display text-h4 font-semibold text-ink">{row.title}</h3>
            <div className="mt-3 flex flex-1 flex-col [&>a]:mt-auto [&>a]:pt-2">{content(row, i)}</div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ 8. FAQ */

function Faq() {
  const { t } = useTranslation('services');
  const items = t('civilPage.faq.items', { returnObjects: true }) as FaqAccordionItem[];
  return (
    <Section id="faq" background="warmwhite" spacing="sm" aria-labelledby="civil-faq-heading" className="scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <Eyebrow>{t('civilPage.faq.eyebrow')}</Eyebrow>
        <h2 id="civil-faq-heading" className="mt-3 font-display text-h2 font-semibold text-ink text-balance">
          {t('civilPage.faq.heading')}
        </h2>
        <FaqAccordion items={Array.isArray(items) ? items : []} idPrefix="civil-faq" className="mt-8" />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- 9. Closing */

function Closing() {
  const { t } = useTranslation('services');
  return (
    <Section background="charcoal" spacing="sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-2xl">
          <Heading level="h2" as="h2" theme="dark" className="text-balance">
            {t('civilPage.closing.heading')}
          </Heading>
          <p className="mt-3 text-body leading-relaxed text-gray-300">{t('civilPage.closing.description')}</p>
        </div>
        <ButtonLink href={LINKS.contact} variant="primary" trailingIcon={ArrowRight} className="w-full shrink-0 sm:w-auto">
          {t('civilPage.closing.cta')}
        </ButtonLink>
      </div>
    </Section>
  );
}
