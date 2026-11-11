import { useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Briefcase, ChevronDown } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MobileHero } from '../components/MobileHero';
import { SectionHeader } from '../components/SectionHeader';
import { MobileStatsGrid } from '../components/MobileStatsGrid';
import { MobileProjectCard } from '../components/MobileProjectCard';
import { RegionalOfficeGrid } from '../components/RegionalOfficeGrid';
import { RegionalPresence } from '../../components/sections/home/RegionalPresence';
import { officeLocations } from '../../data/locations';
import { LocaleLink } from '../components/LocaleLink';
import { cn } from '../../lib/utils';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import { organizationJsonLd, websiteJsonLd } from '../../seo/structuredData';
import { serviceI18nKeys, showcaseDisplayGroups, showcaseGroupChildren } from '../../data/services';
import { publishedProjects } from '../../data/projects';
import { getProjectImage } from '../../data/images';
import { certifications } from '../../data/certifications';
import { foundingYear } from '../../data/companyStats';
import { translateProjectLocation } from '../../lib/projectLocation';

const EASE = [0.22, 0.61, 0.36, 1] as const;

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

const featuredProjects = publishedProjects.filter((project) => project.featured);

const qhseRows = [
  { pillar: 'qualityManagement', certification: 'ISO 9001:2015' },
  { pillar: 'healthSafety', certification: 'ISO 45001:2018' },
  { pillar: 'environmentalManagement', certification: 'ISO 14001:2015' },
] as const;

/** The two opportunity types in the Careers section (information only — the section's one link is its button). */
const careerPaths = [
  { key: 'internships', icon: BookOpen },
  { key: 'jobApplications', icon: Briefcase },
] as const;

export default function HomePage() {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation(['home', 'services', 'nav', 'projects', 'common']);

  // Collapsed-by-default vertical accordion, mirroring the desktop pattern
  // (src/components/sections/home/ServicesShowcase.tsx) — mobile has no
  // right-side preview panel, so a subservice tap here is a direct
  // navigation, same as the Services landing page's own mobile row. The whole
  // row toggles its dropdown, and the umbrella page is reached through the
  // "About" link inside it. Collapsed panels stay in the DOM (hidden, not
  // unmounted) so those links remain in the page for crawlers.
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  return (
    <>
      <NavSectionH1 section="home" />
      <SEO title={t('home:seo.title')} description={t('home:seo.description')} path="/" structuredData={[organizationJsonLd(), websiteJsonLd()]} />

      {/* 1. Mobile hero */}
      <MobileHero />

      {/* 2. About MENASCO introduction + key statistics — bespoke tight spacing rather than the
          shared SectionHeader, which other mobile sections still rely on at its current density. */}
      <section className="px-4 pb-6 pt-8">
        <div className="flex flex-col gap-1.5">
          <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('home:companyIntro.eyebrow')}</span>
          <h3 className="font-display text-h3 font-semibold tracking-tight text-ink">
            {t('home:companyIntro.mobileHeading', { years: new Date().getFullYear() - foundingYear })}
          </h3>
          <p className="text-small text-gray-600">{t('home:companyIntro.mobileDescription', { foundingYear })}</p>
        </div>
        <div className="mt-5">
          <MobileStatsGrid compact />
        </div>
      </section>

      {/* 4. Services — compact accordion, collapsed by default (stone, between the warm About block and warm Projects) */}
      <section className="bg-stone py-10">
        <div className="px-4">
          <SectionHeader eyebrow={t('home:servicesShowcase.eyebrow')} heading={t('home:servicesShowcase.mobileHeading')} headingAs="h3" />
        </div>
        <nav aria-label={t('home:servicesShowcase.eyebrow')} className="mt-4 flex flex-col px-4">
          {showcaseDisplayGroups.map((group) => {
            const children = showcaseGroupChildren(group);
            const isExpanded = expandedGroupKey === group.key;
            const groupName = t(`nav:${group.i18nKey}`);
            const childrenId = `mobile-services-${group.key}`;
            return (
              <div key={group.key} className="border-t border-gray-200">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={childrenId}
                  onClick={() => setExpandedGroupKey(isExpanded ? null : group.key)}
                  className="flex w-full items-center justify-between gap-4 py-3 text-start font-display text-h4 font-semibold text-ink"
                >
                  <span className="min-w-0">{groupName}</span>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={cn('shrink-0 transition-transform duration-base', isExpanded && 'rotate-180')}
                  />
                </button>

                <motion.div
                  id={childrenId}
                  initial={false}
                  animate={isExpanded ? { height: 'auto', opacity: 1, visibility: 'visible' } : { height: 0, opacity: 0, transitionEnd: { visibility: 'hidden' } }}
                  transition={{ duration: reducedMotion ? 0 : 0.25, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col pb-1.5">
                    <LocaleLink
                      to={group.href!}
                      className="flex min-h-11 items-center py-2 ps-4 text-body font-medium text-gray-600"
                    >
                      {t('home:servicesShowcase.aboutService', { name: groupName, defaultValue: 'About {{name}}' })}
                    </LocaleLink>
                    {children.map((leaf) => {
                      const leafServiceKey = leaf.service ? (serviceI18nKeys[leaf.service.slug] ?? leaf.service.slug) : null;
                      const leafName = leafServiceKey ? t(`services:items.${leafServiceKey}.name`) : t(`nav:${leaf.i18nKey}`);
                      return (
                        <LocaleLink
                          key={leaf.href}
                          to={leaf.href}
                          className="flex min-h-11 items-center py-2 ps-4 text-body font-medium text-gray-600"
                        >
                          {leafName}
                        </LocaleLink>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </nav>
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 pt-4">
          <LocaleLink to="/services" className="inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600">
            {t('common:buttons.viewAllServices')}
            <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
          </LocaleLink>
          <LocaleLink to="/about" className="inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600">
            {t('home:companyIntro.cta')}
            <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
          </LocaleLink>
        </div>
      </section>

      {/* 5. Portfolio — featured projects (warm, between stone Services and the dark Data Centre band) */}
      <section className="py-10">
        <div className="px-4">
          <SectionHeader
            eyebrow={t('home:featuredProjects.eyebrow')}
            heading={t('home:featuredProjects.heading')}
            headingAs="h3"
            description={t('home:featuredProjects.mobileDescription')}
          />
        </div>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
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

      {/* 6. Data Centre Infrastructure — compact featured highlight, not a full service section */}
      <section className="relative overflow-hidden px-4 py-14">
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
          <p className="mt-3 text-body text-gray-200">{t('home:dataCenter.mobileDescription')}</p>
          <motion.div whileTap={reducedMotion ? undefined : { scale: 0.97 }} className="mt-5 inline-block">
            <LocaleLink
              to="/projects/categories?category=advanced-technical-facilities"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-600 px-5 text-small font-semibold text-warmwhite"
            >
              {t('home:dataCenter.mobileCta')}
              <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
            </LocaleLink>
          </motion.div>
        </motion.div>
      </section>

      {/* 6a. Off-site manufacturing — photo + short pitch + one link. Stacked on
          phones; photo beside the text on tablets. */}
      <section className="px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-center md:gap-8">
          <div className="aspect-[16/10] overflow-hidden rounded-md bg-gray-100 md:aspect-[4/3]">
            <img
              src="/manufacturing-prefab-hero.jpg"
              alt="Ductwork fabrication on the MENASCO manufacturing floor"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <SectionHeader eyebrow={t('home:prefabrication.eyebrow')} heading={t('home:prefabrication.heading')} headingAs="h3" />
            <p className="mt-3 text-small text-gray-600 md:text-body">{t('home:prefabrication.mobileDescription')}</p>
            <LocaleLink
              to="/services/manufacturing-prefabrication"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md border border-brand-600 px-5 text-small font-semibold text-brand-600 transition-colors duration-base active:bg-brand-50"
            >
              {t('home:prefabrication.cta')}
              <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
            </LocaleLink>
          </div>
        </div>
      </section>

      {/* 6b. QHSE — pillar ↔ certificate evidence list, compact */}
      <section className="bg-stone px-4 py-10">
        <SectionHeader eyebrow={t('home:qualitySafety.eyebrow')} heading={t('home:qualitySafety.heading')} headingAs="h3" />
        <ul role="list" className="mt-4 border-t border-gray-200">
          {qhseRows.map(({ pillar, certification: certificationName }) => {
            const certification = certifications.find((item) => item.name === certificationName);
            return (
              <li key={pillar} className="flex items-center justify-between gap-4 border-b border-gray-200 py-3">
                <div className="min-w-0 text-start">
                  <p className="text-body font-semibold text-ink">{t(`home:qualitySafety.pillars.${pillar}.title`)}</p>
                  {certification && (
                    <p className="font-display text-small font-semibold text-gray-700">
                      <span dir="ltr">{certification.name}</span>
                    </p>
                  )}
                </div>
                {certification?.fileUrl && (
                  <a
                    href={certification.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t('common:certifications.viewCertificate')} — ${certification.name} (PDF)`}
                    className="-me-2.5 inline-flex h-11 w-11 shrink-0 items-center justify-center text-brand-600"
                  >
                    <ArrowUpRight size={16} aria-hidden="true" className="rtl:-scale-x-100" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* 7. Regional presence — tablets get the desktop map + office card;
          phones keep the compact office grid + selected office details. */}
      <div className="hidden md:block">
        <RegionalPresence />
      </div>
      <section className="px-4 py-10 md:hidden">
        <SectionHeader eyebrow={t('home:regionalPresence.eyebrow')} heading={t('home:regionalPresence.heading', { count: officeLocations.length })} headingAs="h3" />
        <div className="mt-4">
          <RegionalOfficeGrid />
        </div>
      </section>

      {/* 8. Careers — one button only. Stacked on phones; the pitch + button
          beside the two opportunity types on tablets (same as desktop). */}
      <section className="bg-stone px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-10">
          <div className="flex flex-col items-start">
            <SectionHeader eyebrow={t('home:careersPreview.eyebrow')} heading={t('home:careersPreview.heading')} headingAs="h3" />
            <p className="mt-3 text-small text-gray-600 md:text-body">{t('home:careersPreview.description')}</p>
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
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
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
