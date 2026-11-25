/*
 * ============================================================================
 * DATA CENTER PAGES — DESIGN RULES & DECISIONS (agreed with the client, Nov 2026)
 * Read this before changing /services/data-centers or its sustainability tab.
 * Applies to: this file, DataCenterSustainabilityPage.tsx,
 * src/components/services/datacenter/*, src/data/dataCenter*.ts.
 * ============================================================================
 *
 * STRUCTURE & SEO
 * - Two real pages presented as tabs (sticky Technical | Sustainability switch,
 *   DataCenterTabs): /services/data-centers and /services/data-centers/sustainability.
 *   Separate pages (not in-page tabs) so each ranks for its own searches with its
 *   own title, description, H1, breadcrumb, sitemap entry and llms.txt.
 * - This is one of MENASCO's most important pages: everything must be in the HTML.
 *   Toggled/hidden content is rendered and hidden (hidden attribute / CSS), never
 *   conditionally unmounted.
 * - One H1 per page = visible eyebrow + creative title (HeroH1). Visible titles stay
 *   creative; keywords live in eyebrows, SEO titles and descriptions.
 * - FAQPage JSON-LD on both pages (runtime SEO + scripts/seo/routes.ts for prerender).
 *   The sustainability page also has TechArticle JSON-LD with its sources as citations.
 * - Both pages are prerendered (scripts/seo/prerender.ts PRERENDER_PATHS).
 *
 * CONTENT RULES
 * - Cite reputable sources inline with [[n]] markers (RichText -> superscript link) and a
 *   numbered Sources list (src/data/dataCenterSources.ts). Every figure must be sourced.
 * - Verified facts (2026-11-20): IEA "Key Questions on Energy and AI" (2026): 485 TWh
 *   (2025) -> 950 TWh (2030). Germany EnEfG: PUE <= 1.2 for new sites from July 2026;
 *   the 2026 amendment is PENDING (not law) — say so. EU Reg 2024/1364: 500 kW+ sites
 *   report KPIs; EU A–G label grades PUE/WUE. LBNL: US 4.4% (2023) -> 6.7–12% (2028).
 *   LEED Gold = 60–79 points. Estidama: 1 Pearl minimum, 2 Pearls for govt-funded.
 * - Uptime Tiers: say "Tier III & Tier IV". Uptime certifies FACILITIES/designs only;
 *   never claim MENASCO is Tier-certified. Phrase as delivering the MEP/topology the
 *   design requires.
 * - Technical page: no "How we deliver" section (client removed it; copy kept in
 *   dataCenterTechnical.ts -> delivery, unused).
 * - The existing FAQ (services:dataCenter.faq, EN + AR) stays unchanged.
 * - Copy is English-only for now (src/data/dataCenterTechnical.ts, dataCenterSustainability.ts).
 *   Arabic translation is DEFERRED: /ar routes show English plus the notice
 *   "تم تأجيل الترجمة العربية" (ArabicDeferredNotice). Move copy into locales when translating.
 * - Imagery: black placeholders only (PlaceholderImage) until final MENASCO photography.
 *   Never reuse unrelated site images or stock/non-MENASCO content. Alt text deferred
 *   until images are final.
 * - Data center projects = published projects named "data center/centre" in the
 *   advanced-technical-facilities sector (dataCenterProjects in src/data/projects.ts).
 *
 * NARRATIVE (technical page)
 * - Told as sections: industry context -> what matters -> "MENASCO's role" strip
 *   (Role component). Local energy markets has no role strip (client request).
 * - Eyebrows are the label only: no "Chapter 01" numbering (client request).
 * - Order: Hero -> MENASCO in data centers (CapabilitySection: intro, 6 capabilities,
 *   prefabrication; no text reactions here) -> 01 Local energy markets -> 02 Uptime Tiers -> 03 Power resilience
 *   -> 04 Cooling (CRAC vs CRAH) -> 05 Greenfield & brownfield -> 06 Projects (proof)
 *   -> 07 Sustainability teaser (LEED Gold & Estidama Pearl, links to the 2nd tab)
 *   -> FAQ -> Sources.
 * - Role lines marked "NEW copy" in dataCenterTechnical.ts were written for review;
 *   confirm wording with the client before treating them as final.
 * - Large display typography (chapter figures: N+1/2N, 18–27 °C) gives the
 *   story animation something to strike and anchors each chapter.
 *
 * VISUALS
 * - Only two drawings on the technical page: the hero server hall (HeroServerHall,
 *   the story's origin point) and the electrical resilience simulation
 *   (ResilienceDiagram). Everything else is typography + the story animation.
 * - Design language follows the rest of the site: charcoal / warm-white / stone bands
 *   (charcoal = the site's primary dark section token; graphite for panels on dark),
 *   brand blue, Sora + Inter, thin linework.
 *
 * TEXT REACTIONS (TextReactions.tsx) — the page's signature
 * - 2026-11-20: the client REMOVED all animated lines/paths (the lightning, raindrop,
 *   data-trace and heat-plume entry/exit paths were too distracting). Do not
 *   reintroduce travelling lines. Only the effect on the text remains.
 * - ELEMENT VOCABULARY (what the client means). Effects follow the client's
 *   "physical + system" direction (2026-11-20): realistic, restrained, unique.
 *     "electricity" / "power" / "lightning" -> 'power' -> ENERGISE: a bright filament
 *                                                edge sweeps through the letters + warm bloom
 *     "water" / "cooling" / "rain" / "flood" -> 'water' -> LIQUID FILL: blue liquid rises
 *                                                with a moving wave surface and meniscus
 *     "data" / "digital" / "binary"          -> 'data'  -> DECODE: letters scramble
 *                                                through 0/1 and resolve left to right
 *     "heat" / "thermal"                     -> 'heat'  -> THERMAL: a thermal-camera
 *                                                gradient passes through + faint heat haze
 *   Overlays are ::after copies of the text; the real text is never hidden.
 *   Colours: power #E9B23A, water #3B9EE6, data #3DBE7A, heat #E0765C (ELEMENT_COLORS).
 *   Keyframes and styles live in src/styles/index.css ("text reactions").
 * - Targets: wrap words in <span data-flow-target="kind"> (the T helper). Targets must be
 *   semantically related (power text zaps, cooling/water text floods, data/metering text
 *   glitches, heat/temperature text shimmers). The client may ask to change which text
 *   reacts and with which element: just move/change these attributes.
 * - Current targets: hero words Power (power), Cooling (water), Uptime (data); 230 GW
 *   (power); United States (power); "Metering at every level…" (data); 2N (power);
 *   "Power that never drops" (power); cooling heading + 18–27 °C (heat); CRAH title
 *   (water); liquid-cooling role (water); utility-capacity point (power); liquid-cooling
 *   retrofit point (water); "Mission-critical projects" (data); sustainability teaser
 *   heading (water); FAQ heading (data).
 * - Timing: a target reacts as it comes into view (top passes ~80% down the viewport),
 *   stays lit while on screen and resets when it leaves. Hero words (data-flow-hero)
 *   react one after another on page entry (timed, not on scroll). Reduced motion: disabled.
 * - The hero server-hall drawing (HeroServerHall) stays as the hero visual (its old
 *   story-line start markers were removed).
 *
 * SUSTAINABILITY TAB (not yet aligned)
 * - Still uses the earlier palette (data blue, water teal) and per-section diagrams;
 *   the client has not yet asked for the story treatment there. Ask before changing.
 * ============================================================================
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Eyebrow } from '../components/typography/Typography';
import { HeroH1 } from '../components/typography/HeroH1';
import { ButtonLink } from '../components/ui/Button';
import { FaqAccordion } from '../components/common/FaqAccordion';
import { SmartLink } from '../lib/SmartLink';
import { dataCenterProjects } from '../data/projects';
import { dcTechnical as c } from '../data/dataCenterTechnical';
import { TECHNICAL_SOURCES } from '../data/dataCenterSources';
import { DC_SUSTAINABILITY_PATH, DC_TECHNICAL_PATH, ArabicDeferredNotice, DataCenterTabs, RAIL_CLASS, RailDots, RichText, useRail } from '../components/services/datacenter/shared';
import { PlaceholderImage, SourcesList } from '../components/services/datacenter/primitives';
import { HeroServerHall, Segmented } from '../components/services/datacenter/technicalDiagrams';
import { TextReactions } from '../components/services/datacenter/TextReactions';
import { CapabilitySection, PrefabSection } from '../components/services/datacenter/CapabilitySection';
import { SEO } from '../seo/SEO';
import { faqPageJsonLd, serviceEntity } from '../seo/structuredData';
import { dataCenterAreaServed, dataCenterRegionsJsonLd } from '../seo/dataCenterRegionsJsonLd';
import { orderForVisitor, visitorRegion } from '../lib/visitorRegion';
import { SITE_URL } from '../seo/constants';
import { cn } from '../lib/utils';
import { SECTION_SCROLL_MARGIN, type JumpSection } from '../components/services/SectionJumpMenu';

interface FaqEntry {
  id: string;
  title: string;
  content: string;
}

type Tone = 'dark' | 'light' | 'stone';
type Kind = 'power' | 'water' | 'data' | 'heat';
const TONE_BG: Record<Tone, string> = { dark: 'bg-charcoal', light: 'bg-warmwhite', stone: 'bg-stone' };

/** A page band: its background sits under the story lines, its content between the two line layers. */
function Band({ tone, children, className, id }: { tone: Tone; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('relative', TONE_BG[tone], id && SECTION_SCROLL_MARGIN)}>
      <Container className={cn('relative z-[2] py-20 md:py-28', className)}>{children}</Container>
    </section>
  );
}

/** Wraps text as a reaction target (see TextReactions). `hero` = a hero title word (reacts on page entry, one after another).
 *  `slow` = a slower in-page animation (the cooling comparison titles); `fast` = a quicker data decode. */
const T = ({ k, hero, slow, fast, children }: { k?: Kind; hero?: boolean; slow?: boolean; fast?: boolean; children: ReactNode }) =>
  k ? (
    <span data-flow-target={k} data-flow-hero={hero ? '' : undefined} data-flow-slow={slow ? '' : undefined} data-flow-fast={fast ? '' : undefined}>
      {children}
    </span>
  ) : (
    <>{children}</>
  );

/** Section heading: eyebrow (no "Chapter" label, client request), large heading, optional lead. */
function ChapterHead({ eyebrow, title, lead, dark = false, target, fast }: { eyebrow: string; title: string; lead?: ReactNode; dark?: boolean; target?: Kind; fast?: boolean }) {
  return (
    <div>
      <p className={cn('font-display text-caption font-semibold uppercase tracking-widest rtl:tracking-normal', dark ? 'text-brand-400' : 'text-brand-600')}>{eyebrow}</p>
      <h2 className={cn('mt-5 font-display text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-semibold leading-[1.06] tracking-tight text-balance', dark ? 'text-white' : 'text-ink')}>
        <T k={target} fast={fast}>
          {title}
        </T>
      </h2>
      {lead && <p className={cn('mt-6 text-body-lg leading-relaxed', dark ? 'text-gray-300' : 'text-gray-600')}>{lead}</p>}
    </div>
  );
}

/** A large display figure with a caption. */
function Figure({ value, label, target, dark = false }: { value: string; label: string; target?: Kind; dark?: boolean }) {
  return (
    <figure className="mt-10">
      <p className={cn('font-display text-[clamp(3.5rem,2rem+6vw,6.5rem)] font-semibold leading-none tracking-tight', dark ? 'text-white' : 'text-ink')}>
        <T k={target}>{value}</T>
      </p>
      <figcaption className={cn('mt-4 max-w-sm text-small leading-relaxed', dark ? 'text-gray-400' : 'text-gray-600')}>
        <RichText text={label} />
      </figcaption>
    </figure>
  );
}

/**
 * Data Center technical page (/services/data-centers), the first of two
 * tabs. Told as chapters: what is happening in the industry, what matters,
 * and MENASCO's role in each. Key words react as they scroll into view
 * (TextReactions: power zaps, water floods, data glitches, heat shimmers). Copy: src/data/dataCenterTechnical.ts (English; Arabic deferred). FAQ:
 * services:dataCenter.faq (EN + AR), unchanged.
 */
export default function DataCenterPage() {
  const { t } = useTranslation('services');
  const pageRef = useRef<HTMLDivElement>(null);
  const faq = t('dataCenter.faq', { returnObjects: true }) as FaqEntry[];
  const faqItems = Array.isArray(faq) ? faq.map((f) => ({ question: f.title, answer: f.content })) : [];
  const [coolingView, setCoolingView] = useState<'units' | 'approach'>('units');
  // Cooling cards: a swipe rail per comparison below md; switching starts the new rail at its first card.
  const coolingRails = { units: useRail(), approach: useRail() };
  const sitesRail = useRail();
  // Local energy markets comparison: phone swipe rail + which market's detail is open.
  const marketsRail = useRail();
  const [openMarket, setOpenMarket] = useState<string | null>(null);
  const switchCooling = (v: string) => {
    const id = v as 'units' | 'approach';
    coolingRails[id].railRef.current?.scrollTo({ left: 0 });
    setCoolingView(id);
  };
  const portfolio = useRail();
  // Tier cards: swipe row only while both cards can't fit side by side (measured).
  const tiersRail = useRail();
  const [tiersOverflow, setTiersOverflow] = useState(false);
  useEffect(() => {
    const el = tiersRail.railRef.current;
    if (!el) return;
    // Swipe while the row can't give every card its minimum width (16.5rem) plus the gaps.
    // Measured against the available width, not scrollWidth, so widening the cards in
    // swipe mode can't keep it stuck in swipe mode.
    const measure = () => {
      const cs = getComputedStyle(el);
      const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const n = el.children.length;
      setTiersOverflow(avail + 0.5 < n * 16.5 * rem + (n - 1) * (parseFloat(cs.columnGap) || 0));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Local energy markets: UAE (HQ) first, then the visitor's own region (from the
  // browser time zone), then the rest. Reordered after mount only, so the
  // prerendered HTML (what search engines index) keeps the canonical order.
  const [markets, setMarkets] = useState(c.energy.markets);
  useEffect(() => {
    setMarkets(orderForVisitor(c.energy.markets, visitorRegion()));
  }, []);
  // "On this page" section switcher in the sticky tab bar (client keeps this, 2026-11-24).
  const sections = useMemo<JumpSection[]>(
    () => [
      { id: 'dc-capability', label: c.capability.eyebrow },
      { id: 'dc-prefab', label: t('dataCenter.prefab.eyebrow') },
      { id: 'dc-energy', label: c.energy.eyebrow },
      { id: 'dc-tiers', label: c.tiers.eyebrow },
      { id: 'dc-sustainability', label: c.sustainabilityTeaser.eyebrow },
      { id: 'dc-cooling', label: c.cooling.eyebrow },
      { id: 'dc-sites', label: c.sites.eyebrow },
      ...(dataCenterProjects.length > 0 ? [{ id: 'dc-projects', label: c.projects.eyebrow }] : []),
      ...(faqItems.length > 0 ? [{ id: 'dc-faq', label: t('dataCenter.faqHeading.eyebrow') }] : []),
      { id: 'dc-sources', label: c.sources.heading },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, faqItems.length],
  );
  const heroWord = (w: string, i: number) => {
    // Only "Cooling" reacts (water); Power/Uptime reactions removed (client request), matching the sustainability hero.
    const k: Kind | undefined = /^Cooling/.test(w) ? 'water' : undefined;
    return (
      <span key={i}>
        <T k={k} hero>
          {w}
        </T>{' '}
      </span>
    );
  };

  return (
    <>
      <SEO
        title={t('dataCenter.seo.title')}
        description={t('dataCenter.seo.description')}
        path={DC_TECHNICAL_PATH}
        mainEntity={serviceEntity({
          name: t('dataCenter.seo.title'),
          description: t('dataCenter.seo.description'),
          url: `${SITE_URL}${DC_TECHNICAL_PATH}`,
          areaServed: dataCenterAreaServed,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Data Centers', path: DC_TECHNICAL_PATH },
        ]}
        structuredData={[
          ...(faqItems.length ? [faqPageJsonLd(faqItems)] : []),
          // One Service per market region, from the Local energy markets copy (SEO; shared with the prerender config).
          ...dataCenterRegionsJsonLd(),
        ]}
      />
      <DataCenterTabs active="technical" sections={sections} />
      <ArabicDeferredNotice />

      <div ref={pageRef} className="relative isolate overflow-hidden">
        <TextReactions containerRef={pageRef} />

        {/* Hero: the three things a data center must never lose */}
        <Band tone="dark" className="pb-14 pt-6 md:pb-20 md:pt-8">
          {/* Slightly wider than the text column: bleeds into the side gutters. */}
          <div className="-mx-6 md:-mx-14 lg:-mx-28">
            <HeroServerHall />
          </div>
          <div className="mt-4 max-w-5xl md:mt-2">
            <HeroH1
              eyebrow={
                <Eyebrow as="span" theme="dark" className="block">
                  {c.hero.eyebrow}
                </Eyebrow>
              }
              title={
                <span className="mt-4 block font-display text-[clamp(2.75rem,1.6rem+4.6vw,5.5rem)] font-semibold leading-[1.02] tracking-tight text-white text-balance">
                  {c.hero.title.split(' ').map(heroWord)}
                </span>
              }
            />
            <p className="mt-6 max-w-2xl text-body-lg leading-relaxed text-gray-300">{c.hero.intro}</p>
          </div>
          <dl className="mt-10 grid grid-cols-2 border-t border-white/10 pt-6 md:max-w-xl">
            {[
              [c.stats.tier, c.stats.tierLabel],
              [c.stats.ratings, c.stats.ratingsLabel],
            ].map(([value, label], i) => (
              <div key={i} className={cn('flex flex-col pe-4', i === 1 && 'border-s border-white/10 ps-4 md:ps-6 lg:ps-8')}>
                <dt className="mt-2 text-caption text-gray-400 md:text-small">{label}</dt>
                <dd className="order-first whitespace-nowrap font-display text-[clamp(1rem,0.45rem+2.2vw,1.5rem)] font-semibold leading-tight text-white md:text-[clamp(1.125rem,0.35rem+1.5vw,1.875rem)]">{value}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink href="/projects/categories?category=advanced-technical-facilities" variant="outline" theme="dark" trailingIcon={ArrowRight} className="mt-10 !border-white">
            {c.hero.cta}
          </ButtonLink>
        </Band>

        {/* MENASCO's data center capability (directly below the hero) */}
        <div id="dc-capability" className={SECTION_SCROLL_MARGIN}>
          <CapabilitySection />
        </div>

        {/* Prefabrication: its own full-width section */}
        <div id="dc-prefab" className={SECTION_SCROLL_MARGIN}>
          <PrefabSection />
        </div>

        {/* Local energy markets: heading, then the markets as one comparison (below). Intro paragraph removed (client request 2026-11-24). */}
        <Band id="dc-energy" tone="light" className="pb-12 pt-12 md:pb-16 md:pt-16">
          <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.energy.eyebrow}</p>
          {/* Smaller heading than the other sections (client request). */}
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.625rem,1.2rem+1.5vw,2.375rem)] font-semibold leading-[1.1] tracking-tight text-ink text-balance">
            {c.energy.heading}
          </h2>
          {/* Client-approved 2026-11-24: the markets as one comparison instead of five
              flip cards. Tablets/desktop: a table-like grid (market | constraints | MENASCO
              advantage), so markets can be compared at a glance. Phones: the same rows as a
              swipeable card rail with dots, so the section stays one card tall. Each market's
              full prose (market context + how MENASCO helps) sits in a per-row "Market detail"
              expander, always in the HTML (hidden attribute). Row ids keep the #slug anchors
              used by the structured data and llms.txt. */}
          <div className="mt-8 hidden grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-8 border-b border-gray-300 pb-3 md:grid lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-10">
            <span className="font-display text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{c.energy.marketLabel}</span>
            <span className="font-display text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{c.energy.constraintsLabel}</span>
            <span className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.energy.advantageLabel}</span>
          </div>
          <ul
            ref={(el) => {
              marketsRail.railRef.current = el;
            }}
            onScroll={marketsRail.onScroll}
            className="no-scrollbar -mx-6 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-1 md:mx-0 md:mt-0 md:block md:snap-none md:overflow-visible md:px-0 md:pb-0"
          >
            {markets.map((m) => {
              const isOpen = openMarket === m.id;
              const bullets = (items: string[], tone: 'gray' | 'brand') => (
                <ul className="mt-2 space-y-1.5 md:mt-0">
                  {items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[0.8125rem] leading-[1.55] text-gray-700 md:text-small md:leading-relaxed">
                      <span aria-hidden="true" className={cn('mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full md:mt-2', tone === 'brand' ? 'bg-brand-500' : 'bg-gray-400')} />
                      {item}
                    </li>
                  ))}
                </ul>
              );
              return (
                <li
                  key={m.id}
                  id={m.slug}
                  className={cn(
                    SECTION_SCROLL_MARGIN,
                    'flex w-[86%] max-w-md shrink-0 snap-start flex-col rounded-lg border border-gray-200 bg-white p-5',
                    'md:grid md:w-auto md:max-w-none md:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[auto_1fr_auto] md:gap-x-8 md:rounded-none md:border-0 md:border-b md:border-gray-200 md:bg-transparent md:px-0 md:py-5',
                    'lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-10',
                  )}
                >
                  {/* Tablet/desktop placement: name + detail toggle in column 1, bullets in columns 2-3, detail across the row. */}
                  <h3 className="font-display text-h4 font-semibold leading-snug text-ink md:col-start-1 md:row-start-1">{m.name}</h3>
                  <div className="mt-4 md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0">
                    <p className="font-display text-caption font-semibold uppercase tracking-widest text-gray-500 md:hidden rtl:tracking-normal">{c.energy.constraintsLabel}</p>
                    {bullets(m.constraints, 'gray')}
                  </div>
                  <div className="mt-4 md:col-start-3 md:row-span-2 md:row-start-1 md:mt-0">
                    <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 md:hidden rtl:tracking-normal">{c.energy.advantageLabel}</p>
                    {bullets(m.advantage, 'brand')}
                  </div>
                  <div className="mt-auto pt-4 md:col-start-1 md:row-start-2 md:mt-0 md:self-start md:pt-2">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`dc-market-detail-${m.id}`}
                      onClick={() => setOpenMarket(isOpen ? null : m.id)}
                      className="inline-flex min-h-10 items-center gap-1.5 font-display text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      {c.energy.detailLabel}
                      <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', isOpen && 'rotate-180')} />
                    </button>
                  </div>
                  {/* The hidden attribute sits on a wrapper with no display utility (a `grid` class would override it). */}
                  <div id={`dc-market-detail-${m.id}`} hidden={!isOpen} className="md:col-span-3 md:col-start-1 md:row-start-3">
                    <div className="mt-2 grid gap-5 border-t border-gray-100 pt-4 lg:grid-cols-2 lg:gap-10">
                      <div>
                        <p className="font-display text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{c.energy.contextLabel}</p>
                        <p className="mt-2 text-[0.8125rem] leading-[1.6] text-gray-700 md:text-small md:leading-relaxed">
                          <RichText text={m.body} />
                        </p>
                      </div>
                      <div>
                        <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.energy.helpLabel}</p>
                        <p className="mt-2 text-[0.8125rem] leading-[1.6] text-gray-700 md:text-small md:leading-relaxed">
                          <RichText text={m.help} />
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="md:hidden">
            <RailDots count={markets.length} active={marketsRail.active} rail={marketsRail} />
          </div>
        </Band>

        {/* 02 Uptime Tiers (tightened; no MENASCO role strip, client request) */}
        <Band id="dc-tiers" tone="stone" className="pb-12 pt-12 md:pb-16 md:pt-16">
          {/* Smaller heading + lead than the default section head (client request). Uptime Institute logo removed (client request 2026-11-21). */}
          <div className="max-w-3xl">
            <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.tiers.eyebrow}</p>
            <h2 className="mt-3 font-display text-[clamp(1.625rem,1.2rem+1.5vw,2.375rem)] font-semibold leading-[1.1] tracking-tight text-ink text-balance">{c.tiers.heading}</h2>
            <p className="mt-4 text-body leading-relaxed text-gray-600">
              <RichText text={c.tiers.intro} />
            </p>
          </div>
          {/* Tier cards: side by side while each can be at least ~16.5rem wide; when the row is
              too narrow for both it becomes a snapping swipe row with position dots. */}
          <div
            ref={(el) => {
              tiersRail.railRef.current = el;
            }}
            onScroll={tiersRail.onScroll}
            className="no-scrollbar -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 md:-mx-10 md:scroll-px-10 md:px-10 lg:mx-0 lg:gap-6 lg:overflow-visible lg:px-0"
          >
            {c.tiers.items.map((item) => (
              <article key={item.id} className={cn('flex flex-1 basis-0 snap-start flex-col rounded-lg border border-gray-200 bg-white p-5 sm:p-6 lg:p-8', tiersOverflow ? 'min-w-[86%]' : 'min-w-[min(16.5rem,86%)]')}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{item.tagline}</p>
                    <h3 className="mt-2 font-display text-h4 font-semibold text-ink">{item.name}</h3>
                  </div>
                  <p className="font-display text-[clamp(2.25rem,1.6rem+2vw,3.25rem)] font-semibold leading-none tracking-tight text-ink">
                    <T k={item.id === 'tier-iv' ? 'power' : undefined}>{item.figure}</T>
                  </p>
                </div>
                <ul className="mt-6 space-y-3">
                  {item.points.map((p) => (
                    <li key={p} className="flex gap-3 text-small leading-relaxed text-gray-700">
                      <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                      <span>
                        <RichText text={p} />
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          {tiersOverflow && <RailDots count={c.tiers.items.length} active={tiersRail.active} alwaysShow rail={tiersRail} />}
        </Band>

        {/* 03 The next frontier: sustainability (replaces the Electrical resilience section, client request 2026-11-21).
            Shown at every width. */}
        <Band id="dc-sustainability" tone="dark" className="pb-12 pt-12 md:pb-16 md:pt-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <ChapterHead eyebrow={c.sustainabilityTeaser.eyebrow} title={c.sustainabilityTeaser.heading} lead={c.sustainabilityTeaser.body} dark target="water" />
              <ButtonLink href={DC_SUSTAINABILITY_PATH} variant="primary" trailingIcon={ArrowRight} className="mt-10">
                {c.sustainabilityTeaser.cta}
              </ButtonLink>
            </div>
            <div className="flex gap-3 lg:col-span-4 lg:justify-end">
              {['LEED Gold', 'Estidama Pearl'].map((name) => (
                <span key={name} className="rounded-full border border-white/20 px-4 py-2 font-display text-small font-semibold text-white">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Band>

        {/* 04 Cooling: two comparisons behind a toggle (CRAC vs CRAH; air vs direct-to-chip).
            Both comparisons stay in the HTML (stacked in one grid cell, so switching never
            changes the section height). No MENASCO role strip (client request). */}
        <Band id="dc-cooling" tone="light" className="pb-12 pt-12 md:pb-16 md:pt-16">
          <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.cooling.eyebrow}</p>
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center lg:gap-12">
            <h2 className="font-display text-[clamp(1.625rem,1.2rem+1.5vw,2.375rem)] font-semibold leading-[1.1] tracking-tight text-ink text-balance lg:col-span-6">
              {c.cooling.heading}
            </h2>
            <p className="text-body leading-relaxed text-gray-700 lg:col-span-6">{c.cooling.intro}</p>
          </div>

          <div className="mt-8">
            <Segmented
              label={c.cooling.eyebrow}
              value={coolingView}
              onChange={switchCooling}
              options={c.cooling.comparisons.map((cmp) => ({ id: cmp.id, label: cmp.label }))}
            />
          </div>

          <div className="mt-5 grid">
            {c.cooling.comparisons.map((cmp) => {
              const shown = cmp.id === coolingView;
              return (
                <div
                  key={cmp.id}
                  ref={(el) => {
                    coolingRails[cmp.id as 'units' | 'approach'].railRef.current = el;
                  }}
                  onScroll={coolingRails[cmp.id as 'units' | 'approach'].onScroll}
                  aria-hidden={!shown}
                  {...(shown ? {} : { inert: '' })}
                  className={cn(
                    'col-start-1 row-start-1 transition-opacity duration-300 motion-reduce:transition-none',
                    RAIL_CLASS,
                    'md:grid-cols-2 lg:gap-6',
                    shown ? 'visible opacity-100' : 'invisible opacity-0',
                  )}
                >
                  {cmp.items.map((item) => (
                    <article key={item.id} className="flex w-[86%] shrink-0 snap-start flex-col rounded-lg border border-gray-200 bg-white p-5 sm:w-[70%] sm:p-6 md:w-auto lg:p-7">
                      <h3 className="font-display text-h4 font-semibold text-ink">
                        <T k={item.id === 'crah' || item.id === 'dtc' ? 'water' : undefined} slow>
                          {item.name}
                        </T>
                      </h3>
                      <p className="mt-2 text-small leading-relaxed text-gray-700">{item.description}</p>
                      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
                        <div>
                          <p className="text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.cooling.strengthsLabel}</p>
                          <ul className="mt-2 space-y-1.5">
                            {item.strengths.map((s) => (
                              <li key={s} className="flex gap-2 text-small leading-snug text-gray-700">
                                <span aria-hidden="true" className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-caption font-semibold uppercase tracking-widest text-gray-500 rtl:tracking-normal">{c.cooling.considerationsLabel}</p>
                          <ul className="mt-2 space-y-1.5">
                            {item.considerations.map((s) => (
                              <li key={s} className="flex gap-2 text-small leading-snug text-gray-700">
                                <span aria-hidden="true" className="mt-[0.45rem] h-1 w-2.5 shrink-0 rounded-full bg-gray-400" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              );
            })}
          </div>
          {/* Phones: position dots for the comparison on show. */}
          <RailDots count={2} active={coolingRails[coolingView].active} rail={coolingRails[coolingView]} />

          {/* ASHRAE inlet range as a compact strip */}
          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white/70 p-5 sm:flex-row sm:items-center sm:gap-6 lg:px-7">
            <p className="shrink-0 font-display text-[clamp(1.75rem,1.4rem+1vw,2.25rem)] font-semibold leading-none tracking-tight text-ink">
              <T k="heat">{c.cooling.figure.value}</T>
            </p>
            <p className="text-small leading-relaxed text-gray-700">
              <RichText text={c.cooling.ashrae} />
            </p>
          </div>
        </Band>

        {/* 05 Greenfield and brownfield: eyebrow, heading, white cards, no text animation. Phones: a swipe
            rail with dots; side by side from md. Intro line removed (client request 2026-11-25). */}
        <Band id="dc-sites" tone="stone" className="pb-12 pt-12 md:pb-16 md:pt-16">
          <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.sites.eyebrow}</p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.625rem,1.2rem+1.5vw,2.375rem)] font-semibold leading-[1.1] tracking-tight text-ink text-balance">
            {c.sites.heading}
          </h2>

          <div
            ref={(el) => {
              sitesRail.railRef.current = el;
            }}
            onScroll={sitesRail.onScroll}
            className={cn('mt-8', RAIL_CLASS, 'md:grid-cols-2 lg:gap-6')}
          >
            {c.sites.items.map((site) => {
              const [label, ...rest] = site.title.split(': ');
              const title = rest.join(': ');
              return (
                <article key={site.id} className="flex w-[86%] shrink-0 snap-start flex-col rounded-lg border border-gray-200 bg-white p-5 sm:w-[70%] sm:p-6 md:w-auto lg:p-7">
                  <p className="text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{label}</p>
                  <h3 className="mt-1.5 font-display text-h4 font-semibold text-ink">{title ? title.charAt(0).toUpperCase() + title.slice(1) : site.title}</h3>
                  <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                    {site.points.map((pt) => (
                      <li key={pt} className="flex gap-2.5 text-small leading-relaxed text-gray-700">
                        <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <RailDots count={c.sites.items.length} active={sitesRail.active} rail={sitesRail} />
        </Band>

        {/* 06 Proof: projects */}
        {dataCenterProjects.length > 0 && (
          <Band id="dc-projects" tone="light">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-3xl">
                <ChapterHead eyebrow={c.projects.eyebrow} title={c.projects.heading} lead={c.projects.role} target="data" fast />
              </div>
              <ButtonLink href="/projects/categories" variant="outline" trailingIcon={ArrowRight}>
                {c.projects.viewAll}
              </ButtonLink>
            </div>
            {/* Grid from tablet (md) up; below md a swipe rail with position dots. */}
            <ul
              ref={(el) => {
                portfolio.railRef.current = el;
              }}
              onScroll={portfolio.onScroll}
              className={cn('mt-14', RAIL_CLASS, 'md:grid-cols-2 md:gap-6 lg:grid-cols-3')}
            >
              {dataCenterProjects.map((p) => (
                <li
                  key={p.slug}
                  className="group relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-gray-200 bg-white sm:w-[60%] md:w-auto"
                >
                  <PlaceholderImage className="aspect-[16/10] rounded-none" />
                  <div className="p-6">
                    <h3 className="font-display text-h4 font-semibold text-ink">
                      <SmartLink href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-['']">
                        {p.title}
                      </SmartLink>
                    </h3>
                    <p className="mt-1 text-small text-gray-500">{[p.location, p.capacity].filter(Boolean).join(' · ')}</p>
                  </div>
                </li>
              ))}
            </ul>
            <RailDots count={dataCenterProjects.length} active={portfolio.active} rail={portfolio} />
          </Band>
        )}

        {/* FAQ (unchanged copy) */}
        {faqItems.length > 0 && (
          <Band id="dc-faq" tone="stone">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Eyebrow>{t('dataCenter.faqHeading.eyebrow')}</Eyebrow>
                <h2 className="mt-4 font-display text-h2 font-semibold tracking-tight text-ink">
                  {t('dataCenter.faqHeading.heading')}
                </h2>
              </div>
              <div className="lg:col-span-8">
                <FaqAccordion items={faqItems} idPrefix="dc-faq" className="bg-stone" />
              </div>
            </div>
          </Band>
        )}

        {/* Sources */}
        <Band id="dc-sources" tone="light">
          <SourcesList sources={TECHNICAL_SOURCES} heading={c.sources.heading} intro={c.sources.intro} />
        </Band>
      </div>
    </>
  );
}
