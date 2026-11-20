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
 *   react one after another on the first scroll. Reduced motion: disabled.
 * - The hero server-hall drawing (HeroServerHall) stays as the hero visual (its old
 *   story-line start markers were removed).
 *
 * SUSTAINABILITY TAB (not yet aligned)
 * - Still uses the earlier palette (data blue, water teal) and per-section diagrams;
 *   the client has not yet asked for the story treatment there. Ask before changing.
 * ============================================================================
 */
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ArrowRight, Check, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../components/layout/Container';
import { Eyebrow } from '../components/typography/Typography';
import { HeroH1 } from '../components/typography/HeroH1';
import { ButtonLink } from '../components/ui/Button';
import { FaqAccordion } from '../components/common/FaqAccordion';
import { SmartLink } from '../lib/SmartLink';
import { dataCenterProjects, totalDataCenterMw } from '../data/projects';
import { dcTechnical as c } from '../data/dataCenterTechnical';
import { TECHNICAL_SOURCES } from '../data/dataCenterSources';
import { TopicTabs } from '../components/sections/quality/TopicTabs';
import { DC_SUSTAINABILITY_PATH, DC_TECHNICAL_PATH, ArabicDeferredNotice, DataCenterTabs, RAIL_CLASS, RailDots, RichText, useRail } from '../components/services/datacenter/shared';
import { PlaceholderImage, SourcesList } from '../components/services/datacenter/primitives';
import { HeroServerHall, ResilienceDiagram } from '../components/services/datacenter/technicalDiagrams';
import { TextReactions, ELEMENT_COLORS } from '../components/services/datacenter/TextReactions';
import { CapabilitySection, PrefabSection } from '../components/services/datacenter/CapabilitySection';
import { SEO } from '../seo/SEO';
import { faqPageJsonLd, serviceEntity } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';
import { cn } from '../lib/utils';

interface FaqEntry {
  id: string;
  title: string;
  content: string;
}

type Tone = 'dark' | 'light' | 'stone';
type Kind = 'power' | 'water' | 'data' | 'heat';
const TONE_BG: Record<Tone, string> = { dark: 'bg-charcoal', light: 'bg-warmwhite', stone: 'bg-stone' };

/** A page band: its background sits under the story lines, its content between the two line layers. */
function Band({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <section className={cn('relative', TONE_BG[tone])}>
      <Container className={cn('relative z-[2] py-20 md:py-28', className)}>{children}</Container>
    </section>
  );
}

/** Wraps text as a reaction target (see TextReactions). `hero` = a hero title word (reacts on the first scroll, in order). */
const T = ({ k, hero, children }: { k?: Kind; hero?: boolean; children: ReactNode }) =>
  k ? (
    <span data-flow-target={k} data-flow-hero={hero ? '' : undefined}>
      {children}
    </span>
  ) : (
    <>{children}</>
  );

/** Section heading: eyebrow (no "Chapter" label, client request), large heading, optional lead. */
function ChapterHead({ eyebrow, title, lead, dark = false, target }: { eyebrow: string; title: string; lead?: ReactNode; dark?: boolean; target?: Kind }) {
  return (
    <div>
      <p className={cn('font-display text-caption font-semibold uppercase tracking-widest rtl:tracking-normal', dark ? 'text-brand-400' : 'text-brand-600')}>{eyebrow}</p>
      <h2 className={cn('mt-5 font-display text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-semibold leading-[1.06] tracking-tight text-balance', dark ? 'text-white' : 'text-ink')}>
        <T k={target}>{title}</T>
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

/** The thread through every chapter: what MENASCO does about it. */
function Role({ children, dark = false, title }: { children: ReactNode; dark?: boolean; title?: string }) {
  return (
    <aside className={cn('mt-10 rounded-lg border-s-4 border-brand-500 p-6 md:p-7', dark ? 'bg-white/[0.04]' : 'bg-white/80 backdrop-blur-sm')}>
      <p className={cn('font-display text-caption font-semibold uppercase tracking-widest', dark ? 'text-brand-400' : 'text-brand-600')}>{c.roleLabel}</p>
      {title && <h3 className={cn('mt-2 font-display text-h4 font-semibold', dark ? 'text-white' : 'text-ink')}>{title}</h3>}
      <div className={cn('mt-3 text-body leading-relaxed', dark ? 'text-gray-200' : 'text-gray-700')}>{children}</div>
    </aside>
  );
}

/**
 * Slows mouse-wheel scrolling while the hero is on screen (client request), so
 * the hero drawing and title reactions are taken in. Desktop wheel only: touch,
 * keyboard and scrollbar scrolling stay native (hijacking touch momentum feels
 * broken on phones). Off for reduced-motion users.
 */
function useSlowHeroScroll(heroRef: RefObject<HTMLElement>, factor = 0.4) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let target = -1;
    let raf = 0;
    let expected = -1;
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      target = -1;
      expected = -1;
    };
    const glide = () => {
      // Someone else moved the page (scrollbar, keys, a link): drop the glide.
      if (expected >= 0 && Math.abs(window.scrollY - expected) > 2) return stop();
      const diff = target - window.scrollY;
      if (Math.abs(diff) < 0.5) return stop();
      expected = Math.round(window.scrollY + diff * 0.18);
      window.scrollTo({ top: expected, behavior: 'instant' as ScrollBehavior });
      raf = requestAnimationFrame(glide);
    };
    const onWheel = (e: WheelEvent) => {
      const hero = heroRef.current;
      if (!hero || e.ctrlKey) return;
      const bottom = hero.getBoundingClientRect().bottom;
      // Only while the hero still fills a good part of the screen.
      if (bottom < window.innerHeight * 0.35) {
        stop();
        return;
      }
      e.preventDefault();
      const base = target < 0 ? window.scrollY : target;
      const delta = (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * factor;
      target = Math.max(0, base + delta);
      if (!raf) raf = requestAnimationFrame(glide);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(raf);
    };
  }, [heroRef, factor]);
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
  const heroRef = useRef<HTMLDivElement>(null);
  useSlowHeroScroll(heroRef);
  const faq = t('dataCenter.faq', { returnObjects: true }) as FaqEntry[];
  const faqItems = Array.isArray(faq) ? faq.map((f) => ({ question: f.title, answer: f.content })) : [];
  const [failed, setFailed] = useState(false);
  const portfolio = useRail();
  const heroWord = (w: string, i: number) => {
    const k: Kind | undefined = /^Power/.test(w) ? 'power' : /^Cooling/.test(w) ? 'water' : /^Uptime/.test(w) ? 'data' : undefined;
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
        mainEntity={serviceEntity({ name: t('dataCenter.seo.title'), description: t('dataCenter.seo.description'), url: `${SITE_URL}${DC_TECHNICAL_PATH}` })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Data Centers', path: DC_TECHNICAL_PATH },
        ]}
        structuredData={faqItems.length ? faqPageJsonLd(faqItems) : undefined}
      />
      <DataCenterTabs active="technical" />
      <ArabicDeferredNotice />

      <div ref={pageRef} className="relative isolate overflow-hidden">
        <TextReactions containerRef={pageRef} />

        {/* Hero: the three things a data center must never lose */}
        <Band tone="dark" className="pb-14 pt-6 md:pb-20 md:pt-8">
          <div ref={heroRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />
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
          <dl className="mt-10 grid grid-cols-2 gap-y-6 border-t border-white/10 pt-6 md:grid-cols-4 md:gap-y-0">
            {[
              [String(dataCenterProjects.length), t('dataCenter.stats.featuredDataCenters')],
              [`${totalDataCenterMw.toFixed(1)} MW`, t('dataCenter.stats.megawatts')],
              [c.stats.tier, c.stats.tierLabel],
              [c.stats.ratings, c.stats.ratingsLabel],
            ].map(([value, label], i) => (
              <div key={i} className={cn('flex flex-col pe-4', i % 2 === 1 && 'border-s border-white/10 ps-4', i > 0 && 'md:border-s md:border-white/10 md:ps-6 lg:ps-8')}>
                <dt className="mt-2 text-caption text-gray-400 md:text-small">{label}</dt>
                <dd className="order-first whitespace-nowrap font-display text-[clamp(1rem,0.45rem+2.2vw,1.5rem)] font-semibold leading-tight text-white md:text-[clamp(1.125rem,0.35rem+1.5vw,1.875rem)]">{value}</dd>
              </div>
            ))}
          </dl>
        </Band>

        {/* MENASCO's data center capability (directly below the hero) */}
        <CapabilitySection />

        {/* Prefabrication: its own full-width section */}
        <PrefabSection />

        {/* Local energy markets: heading + intro, then the markets as topic tabs
            (same component and behaviour as the Quality, Health & Safety page). */}
        <Band tone="light" className="pb-14 pt-14 md:pb-20 md:pt-20">
          {/* Eyebrow on its own row so the heading and intro start on the same line (wide screens). */}
          <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{c.energy.eyebrow}</p>
          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-12">
            <h2 className="font-display text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] font-semibold leading-[1.06] tracking-tight text-ink text-balance lg:col-span-6">
              {c.energy.heading}
            </h2>
            <p className="text-body-lg leading-relaxed text-gray-700 lg:col-span-6">
              <RichText text={c.energy.intro} />
            </p>
          </div>
          <TopicTabs
            idPrefix="dc-energy-market"
            label={c.energy.eyebrow}
            className="mt-10"
            topics={c.energy.markets.map((m) => ({
              title: m.name,
              body: [],
              extra: (
                <p className="mt-3 max-w-3xl text-body leading-relaxed text-gray-700">
                  <RichText text={m.body} />
                </p>
              ),
            }))}
          />
        </Band>

        {/* 02 Uptime Tiers */}
        <Band tone="stone">
          <div className="max-w-3xl">
            <ChapterHead eyebrow={c.tiers.eyebrow} title={c.tiers.heading} lead={<RichText text={c.tiers.intro} />} />
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {c.tiers.items.map((item) => (
              <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-8 md:p-10">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="font-display text-caption font-semibold uppercase tracking-widest text-brand-600">{item.tagline}</p>
                    <h3 className="mt-2 font-display text-h3 font-semibold text-ink">{item.name}</h3>
                  </div>
                  <p className="font-display text-[clamp(2.75rem,2rem+2.5vw,4rem)] font-semibold leading-none tracking-tight text-ink">
                    <T k={item.id === 'tier-iv' ? 'power' : undefined}>{item.figure}</T>
                  </p>
                </div>
                <ul className="mt-8 space-y-4">
                  {item.points.map((p) => (
                    <li key={p} className="flex gap-3 text-body leading-relaxed text-gray-700">
                      <Check size={18} aria-hidden="true" className="mt-1 shrink-0 text-brand-600" />
                      <span>
                        <RichText text={p} />
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="max-w-3xl">
            <Role>
              <RichText text={c.tiers.certificationNote} />
            </Role>
          </div>
        </Band>

        {/* 03 Power resilience */}
        <Band tone="dark">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <ChapterHead eyebrow={c.power.eyebrow} title={c.power.heading} lead={c.power.intro} dark target="power" />
              <ul className="mt-8 space-y-3">
                {c.power.points.map((p) => (
                  <li key={p} className="flex gap-3 text-small leading-relaxed text-gray-300">
                    <Zap size={15} aria-hidden="true" className="mt-0.5 shrink-0" style={{ color: ELEMENT_COLORS.power }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7 lg:pt-14">
              <ResilienceDiagram failed={failed} />
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFailed((f) => !f)}
                  aria-pressed={failed}
                  className={cn(
                    'inline-flex min-h-10 items-center gap-2 rounded-full px-5 text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                    failed ? 'bg-white text-ink hover:bg-gray-200' : 'bg-brand-600 text-white hover:bg-brand-700',
                  )}
                >
                  <Zap size={16} aria-hidden="true" />
                  {failed ? c.power.restore : c.power.simulate}
                </button>
                <p aria-live="polite" className="text-small text-gray-400">
                  {failed ? c.power.states.failed : c.power.states.normal}
                </p>
              </div>
              <Role dark>{c.power.role}</Role>
            </div>
          </div>
        </Band>

        {/* 04 Cooling */}
        <Band tone="light">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ChapterHead eyebrow={c.cooling.eyebrow} title={c.cooling.heading} lead={c.cooling.intro} target="heat" />
              <Figure value={c.cooling.figure.value} label={c.cooling.figure.label} target="heat" />
            </div>
            <div className="space-y-6 lg:col-span-7 lg:pt-14">
              {c.cooling.items.map((item) => (
                <article key={item.id} className="rounded-lg border border-gray-200 bg-white p-7 md:p-8">
                  <h3 className="font-display text-h3 font-semibold text-ink">
                    <T k={item.id === 'crah' ? 'water' : undefined}>{item.name}</T>
                  </h3>
                  <p className="mt-3 text-body leading-relaxed text-gray-700">{item.description}</p>
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-caption font-semibold uppercase tracking-widest text-brand-600">Strengths</p>
                      <ul className="mt-2 space-y-1.5">
                        {item.strengths.map((s) => (
                          <li key={s} className="text-small leading-relaxed text-gray-700">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-caption font-semibold uppercase tracking-widest text-gray-500">Considerations</p>
                      <ul className="mt-2 space-y-1.5">
                        {item.considerations.map((s) => (
                          <li key={s} className="text-small leading-relaxed text-gray-700">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
              <p className="text-body leading-relaxed text-gray-700">
                <RichText text={c.cooling.ashrae} />
              </p>
              <Role>
                <T k="water">{c.cooling.liquid}</T>
              </Role>
            </div>
          </div>
        </Band>

        {/* 05 Greenfield and brownfield */}
        <Band tone="stone">
          <div className="max-w-3xl">
            <ChapterHead eyebrow={c.sites.eyebrow} title={c.sites.heading} />
          </div>
          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-0">
            {c.sites.items.map((s, i) => (
              <div key={s.id} className={cn(i === 1 && 'md:border-s md:border-gray-300 md:ps-12', i === 0 && 'md:pe-12')}>
                <h3 className="font-display text-h3 font-semibold text-ink">{s.title}</h3>
                <ul className="mt-6 divide-y divide-gray-300/70">
                  {s.points.map((p) => (
                    <li key={p} className="py-4 text-body leading-relaxed text-gray-700">
                      <T k={/^Utility capacity/i.test(p) ? 'power' : /liquid-cooling/i.test(p) ? 'water' : undefined}>{p}</T>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-3xl">
            <Role>{c.sites.role}</Role>
          </div>
        </Band>

        {/* 06 Proof: projects */}
        {dataCenterProjects.length > 0 && (
          <Band tone="light">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-3xl">
                <ChapterHead eyebrow={c.projects.eyebrow} title={c.projects.heading} lead={c.projects.role} target="data" />
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
            <RailDots count={dataCenterProjects.length} active={portfolio.active} />
          </Band>
        )}

        {/* 07 The next frontier: sustainability */}
        <Band tone="dark">
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

        {/* FAQ (unchanged copy) */}
        {faqItems.length > 0 && (
          <Band tone="stone">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Eyebrow>{t('dataCenter.faqHeading.eyebrow')}</Eyebrow>
                <h2 className="mt-4 font-display text-h2 font-semibold tracking-tight text-ink">
                  <T k="data">{t('dataCenter.faqHeading.heading')}</T>
                </h2>
              </div>
              <div className="lg:col-span-8">
                <FaqAccordion items={faqItems} idPrefix="dc-faq" className="bg-stone" />
              </div>
            </div>
          </Band>
        )}

        {/* Sources */}
        <Band tone="light">
          <SourcesList sources={TECHNICAL_SOURCES} heading={c.sources.heading} intro={c.sources.intro} />
        </Band>
      </div>
    </>
  );
}
