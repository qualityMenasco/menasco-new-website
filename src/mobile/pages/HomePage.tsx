import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Briefcase } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MobileHero } from '../components/MobileHero';
import { RailDots, useRail } from '../../components/services/datacenter/shared';
import { SectionHeader } from '../components/SectionHeader';
import { MobileProjectCard } from '../components/MobileProjectCard';
import { RegionalOfficeGrid } from '../components/RegionalOfficeGrid';
import { HomeIntroPager } from '../components/HomeIntroPager';
import { HomeSectorsRail } from '../components/HomeSectorsRail';
import { RegionalPresence } from '../../components/sections/home/RegionalPresence';
import { officeLocations } from '../../data/locations';
import { LocaleLink } from '../components/LocaleLink';
import { cn } from '../../lib/utils';
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

// Home rail: the first five featured projects only (client request 2026-11-24).
const featuredProjects = publishedProjects.filter((project) => project.featured).slice(0, 5);

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

  // Featured projects rail: dots everywhere, previous / next arrows below it except on real
  // phones (RailDots; same pattern as the MEP and Data Center rails, client request 2026-11-24).
  const projectRail = useRail();

  // Data-centre band: mount its video only when the section comes within ~600px of the screen.
  const dataCenterRef = useRef<HTMLElement>(null);
  const [dataCenterNear, setDataCenterNear] = useState(false);
  useEffect(() => {
    const el = dataCenterRef.current;
    if (!el || dataCenterNear) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setDataCenterNear(true), { rootMargin: '600px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [dataCenterNear]);

  return (
    <>
      <SEO title={t('home:seo.title')} description={t('home:seo.description')} path="/" structuredData={[organizationJsonLd(), websiteJsonLd()]} />

      {/* 1. Mobile hero, with the key statistics along its bottom edge (2026-11-24; they were a
          separate strip under it). */}
      <MobileHero />

      {/* 3. Portfolio — featured projects, right after the hero (stone). */}
      <section className="bg-stone py-8">
        <div className="flex items-end justify-between gap-4 px-4">
          <SectionHeader
            eyebrow={t('home:featuredProjects.eyebrow')}
            heading={t('home:featuredProjects.heading')}
            headingAs="h3"
            description={t('home:featuredProjects.mobileDescription')}
          />
        </div>
        <div
          id="home-featured-projects"
          ref={(el) => {
            projectRail.railRef.current = el;
          }}
          onScroll={projectRail.onScroll}
          className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1"
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
              className="w-[78vw] max-w-[20rem] shrink-0 snap-start"
            />
          ))}
        </div>
        <div className="px-4">
          <RailDots
            count={projectRail.positions || featuredProjects.length}
            active={projectRail.position}
            alwaysShow
            rail={projectRail}
            controls="home-featured-projects"
            labels={{ previous: t('common:buttons.previousProjects'), next: t('common:buttons.nextProjects') }}
          />
        </div>
      </section>

      {/* 4. Data Centre Infrastructure — compact featured highlight, not a full service section */}
      <section ref={dataCenterRef} className="relative overflow-hidden bg-ink px-4 py-12">
        {/* Mounted (and so downloaded) only once the section is near the screen; autoPlay
            would otherwise start the download on page load despite preload="none". */}
        {dataCenterNear && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/data-center.mp4"
            poster="/Menasco_Data_Center_Server_Racks_Film_Poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
          />
        )}
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
      <section className="bg-stone px-4 pb-8 pt-5 md:px-8 md:py-12">
        <div className="relative flex min-h-[26rem] items-end overflow-hidden rounded-md bg-ink md:min-h-[24rem]">
          {/* Client-supplied pump-skid module photo (2026-11-24), with the Modular Fabrication page's photo finish. */}
          <img
            src="/home/Menasco_Pump_Skid_Module_Factory_Floor.jpg"
            alt={t('home:prefabrication.imageAlt')}
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
      <section className="bg-charcoal px-4 py-8 md:px-8 md:py-12">
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
