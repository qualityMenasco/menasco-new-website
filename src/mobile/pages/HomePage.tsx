import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MobileHero } from '../components/MobileHero';
import { SectionHeader } from '../components/SectionHeader';
import { MobileStatsGrid } from '../components/MobileStatsGrid';
import { MobileProjectCard } from '../components/MobileProjectCard';
import { RegionalOfficeGrid } from '../components/RegionalOfficeGrid';
import { HomeIntroPager } from '../components/HomeIntroPager';
import { HomeSectorsRail } from '../components/HomeSectorsRail';
import { RegionalPresence } from '../../components/sections/home/RegionalPresence';
import { officeLocations } from '../../data/locations';
import { LocaleLink } from '../components/LocaleLink';
import { cn } from '../../lib/utils';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import { organizationJsonLd, websiteJsonLd } from '../../seo/structuredData';
import { publishedProjects } from '../../data/projects';
import { getProjectImage } from '../../data/images';
import { translateProjectLocation } from '../../lib/projectLocation';

const EASE = [0.22, 0.61, 0.36, 1] as const;

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

const featuredProjects = publishedProjects.filter((project) => project.featured);

const qhsePillars = [
  { key: 'qualityManagement', iso: 'ISO 9001:2015' },
  { key: 'healthSafety', iso: 'ISO 45001:2018' },
  { key: 'environmentalManagement', iso: 'ISO 14001:2015' },
] as const;

/** The two opportunity types in the Careers section (information only — the section's one link is its button). */
const careerPaths = [
  { key: 'internships', icon: BookOpen },
  { key: 'jobApplications', icon: Briefcase },
] as const;

export default function HomePage() {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation(['home', 'services', 'nav', 'projects', 'common']);

  // Featured projects rail — tablet arrows step one card at a time; each
  // arrow disables at its end of the rail. Direction-aware, so in RTL "next"
  // moves the way the content flows (scrollLeft runs negative there).
  const projectRailRef = useRef<HTMLDivElement>(null);
  const [projectScroll, setProjectScroll] = useState({ canPrev: false, canNext: true });
  const updateProjectScroll = useCallback(() => {
    const rail = projectRailRef.current;
    if (!rail) return;
    const travelled = Math.abs(rail.scrollLeft);
    const max = rail.scrollWidth - rail.clientWidth;
    setProjectScroll({ canPrev: travelled > 4, canNext: travelled < max - 4 });
  }, []);
  const scrollProjects = (step: 1 | -1) => {
    const rail = projectRailRef.current;
    if (!rail) return;
    const card = rail.firstElementChild as HTMLElement | null;
    const distance = card ? card.getBoundingClientRect().width + 12 : rail.clientWidth * 0.8;
    const rtl = getComputedStyle(rail).direction === 'rtl';
    rail.scrollBy({ left: step * distance * (rtl ? -1 : 1), behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  useEffect(() => {
    updateProjectScroll();
    window.addEventListener('resize', updateProjectScroll);
    return () => window.removeEventListener('resize', updateProjectScroll);
  }, [updateProjectScroll]);

  return (
    <>
      <NavSectionH1 section="home" />
      <SEO title={t('home:seo.title')} description={t('home:seo.description')} path="/" structuredData={[organizationJsonLd(), websiteJsonLd()]} />

      {/* 1. Mobile hero */}
      <MobileHero />

      {/* 2. Key statistics straight under the hero — numbers before paragraphs. */}
      <section className="px-4 py-6">
        <MobileStatsGrid compact />
      </section>

      {/* 3. Portfolio — featured projects, right after the stats (stone). */}
      <section className="bg-stone py-8">
        <div className="flex items-end justify-between gap-4 px-4">
          <SectionHeader
            eyebrow={t('home:featuredProjects.eyebrow')}
            heading={t('home:featuredProjects.heading')}
            headingAs="h3"
            description={t('home:featuredProjects.mobileDescription')}
          />
          {/* Tablets: arrows to step through the cards. Phones stay swipe-only. */}
          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollProjects(-1)}
              disabled={!projectScroll.canPrev}
              aria-label={t('common:buttons.previousProjects')}
              aria-controls="home-featured-projects"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base hover:border-ink disabled:cursor-default disabled:opacity-35"
            >
              <ChevronLeft size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollProjects(1)}
              disabled={!projectScroll.canNext}
              aria-label={t('common:buttons.nextProjects')}
              aria-controls="home-featured-projects"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-ink transition-colors duration-base hover:border-ink disabled:cursor-default disabled:opacity-35"
            >
              <ChevronRight size={18} aria-hidden="true" className="rtl:rotate-180" />
            </button>
          </div>
        </div>
        <div
          id="home-featured-projects"
          ref={projectRailRef}
          onScroll={updateProjectScroll}
          className="no-scrollbar mt-4 flex gap-3 overflow-x-auto scroll-smooth px-4 pb-1"
        >
          {featuredProjects.map((project) => (
            <MobileProjectCard
              key={project.id}
              image={getProjectImage(project.heroImage || undefined, project.slug)}
              title={project.title}
              categoryLabel={
                project.category && categoryKeys[project.category]
                  ? t(`projects:categories.${categoryKeys[project.category]}.title`)
                  : t(`projects:items.${project.slug}.sector`, { defaultValue: project.sector }) || undefined
              }
              location={translateProjectLocation(t, project.location)}
              href={`/projects/${project.slug}`}
              className="w-[78vw] max-w-[20rem] shrink-0"
            />
          ))}
        </div>
      </section>

      {/* 4. Data Centre Infrastructure — compact featured highlight, not a full service section */}
      <section className="relative overflow-hidden px-4 py-12">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/data-center.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/75 to-ink/90" />

        <motion.div
          className="relative z-10"
          initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">
            {t('home:dataCenter.mobileEyebrow')}
          </span>
          <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite">
            {t('home:dataCenter.mobileTitle')}
          </h3>
          <motion.div whileTap={reducedMotion ? undefined : { scale: 0.97 }} className="mt-5 inline-block">
            <LocaleLink
              to="/services/data-centers"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-600 px-5 text-small font-semibold text-warmwhite"
            >
              {t('home:dataCenter.mobileCta')}
              <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
            </LocaleLink>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. About MENASCO / What we deliver: one section, two swipeable pages with a tab switcher; the two buttons stay visible on both. */}
      <HomeIntroPager />

      {/* 7. Where we work: swipeable sector cards (enlarge in view, pop on hover; tablet arrows). */}
      <HomeSectorsRail />

      {/* 8. Modular prefabrication: text set over the photo (phones + tablets),
          with a bottom gradient for legibility and one outlined button. */}
      <section className="bg-stone px-4 py-8 md:px-8 md:py-12">
        <div className="relative flex min-h-[26rem] items-end overflow-hidden rounded-md bg-ink md:min-h-[24rem]">
          <img
            src="/manufacturing-prefab-hero.jpg"
            alt="Ductwork fabrication on the MENASCO manufacturing floor"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/10 md:bg-gradient-to-r md:from-ink/95 md:via-ink/70 md:to-ink/10 md:rtl:bg-gradient-to-l" />
          <div className="relative p-5 md:max-w-[60%] md:p-8">
            <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('home:prefabrication.eyebrow')}</span>
            <h3 className="mt-2 font-display text-h3 font-semibold tracking-tight text-warmwhite text-balance md:text-h2">{t('home:prefabrication.heading')}</h3>
            <p className="mt-3 text-small text-gray-200 md:text-body">{t('home:prefabrication.mobileDescription')}</p>
            <LocaleLink
              to="/services/manufacturing-prefabrication"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md border border-warmwhite/70 px-5 text-small font-semibold text-warmwhite transition-colors duration-base active:bg-white/10"
            >
              {t('home:prefabrication.cta')}
              <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
            </LocaleLink>
          </div>
        </div>
      </section>

      {/* 9. Regional presence — tablets get the desktop map + office card;
          phones keep the compact office grid + selected office details. */}
      {/* Anchor target for "/#regional-presence" (e.g. the country tags on the Services/MEP heroes). */}
      <div id="regional-presence" className="scroll-mt-16">
      <div className="hidden md:block">
        <RegionalPresence />
      </div>
      <section className="px-4 py-8 md:hidden">
        <SectionHeader eyebrow={t('home:regionalPresence.eyebrow')} heading={t('home:regionalPresence.heading', { count: officeLocations.length })} headingAs="h3" />
        <div className="mt-4">
          <RegionalOfficeGrid />
        </div>
      </section>
      </div>

      {/* 10. QHSE — dark band: the pillars and one button to the Quality & Safety page. */}
      <section className="bg-ink px-4 py-8 md:px-8 md:py-12">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('home:qualitySafety.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite text-balance">{t('home:qualitySafety.heading')}</h3>
        <ul role="list" className="mt-5 divide-y divide-white/10 border-y border-white/10 md:grid md:grid-cols-3 md:gap-6 md:divide-y-0">
          {qhsePillars.map(({ key, iso }) => (
            <li key={key} className="py-3">
              <span dir="ltr" className="block font-display text-h4 font-semibold text-warmwhite rtl:text-end">
                {iso}
              </span>
              <span className="mt-0.5 block text-small text-gray-400">{t(`home:qualitySafety.pillars.${key}.title`)}</span>
            </li>
          ))}
        </ul>
        <LocaleLink
          to="/quality-safety"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-brand-600 px-5 text-small font-semibold text-warmwhite"
        >
          {t('home:qualitySafety.cta')}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
        </LocaleLink>
      </section>

      {/* 11. Careers — one button only. Stacked on phones; the pitch + button
          beside the two opportunity types on tablets (same as desktop). */}
      <section className="px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-10">
          <div className="flex flex-col items-start">
            <SectionHeader eyebrow={t('home:careersPreview.eyebrow')} heading={t('home:careersPreview.heading')} headingAs="h3" />
            <LocaleLink
              to="/careers"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-brand-600 px-5 text-small font-semibold text-warmwhite max-md:hidden"
            >
              {t('home:careersPreview.cta')}
              <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
            </LocaleLink>
          </div>
          <div className="flex flex-col gap-5">
            <ul role="list" className="divide-y divide-gray-200 border-y border-gray-200">
              {careerPaths.map(({ key, icon: Icon }) => (
                <li key={key} className="flex items-start gap-3 py-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-stone text-brand-600">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-ink">{t(`home:careersPreview.${key}.title`)}</p>
                    <p className="mt-0.5 text-small text-gray-600">{t(`home:careersPreview.${key}.description`)}</p>
                  </div>
                </li>
              ))}
            </ul>
            {/* Phones: the single button follows the two points. */}
            <LocaleLink
              to="/careers"
              className="inline-flex h-11 w-fit items-center gap-2 rounded-md bg-brand-600 px-5 text-small font-semibold text-warmwhite md:hidden"
            >
              {t('home:careersPreview.cta')}
              <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
            </LocaleLink>
          </div>
        </div>
      </section>
    </>
  );
}
