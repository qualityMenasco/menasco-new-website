import { useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MobileHero } from '../components/MobileHero';
import { SectionHeader } from '../components/SectionHeader';
import { MobileStatsGrid } from '../components/MobileStatsGrid';
import { MobileProjectCard } from '../components/MobileProjectCard';
import { RegionalOfficeGrid } from '../components/RegionalOfficeGrid';
import { MobileCTA } from '../components/MobileCTA';
import { LocaleLink } from '../components/LocaleLink';
import { cn } from '../../lib/utils';
import { SEO } from '../../seo/SEO';
import { organizationJsonLd, websiteJsonLd } from '../../seo/structuredData';
import { serviceI18nKeys, showcaseDisplayGroups, showcaseGroupChildren } from '../../data/services';
import { projects } from '../../data/projects';
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

const featuredProjects = projects.filter((project) => project.featured);

const qhseRows = [
  { pillar: 'qualityManagement', certification: 'ISO 9001:2015' },
  { pillar: 'healthSafety', certification: 'ISO 45001:2018' },
  { pillar: 'environmentalManagement', certification: 'ISO 14001:2015' },
] as const;

export default function HomePage() {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation(['home', 'services', 'nav', 'projects', 'common']);

  // Collapsed-by-default vertical accordion, mirroring the desktop pattern
  // (src/components/sections/home/ServicesShowcase.tsx) — mobile has no
  // right-side preview panel, so a subservice tap here is a direct
  // navigation, same as the Services landing page's own mobile row. Whether
  // a group gets a chevron derives purely from `showcaseGroupChildren`
  // (service data), never hardcoded per category.
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  return (
    <>
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
        <LocaleLink to="/about" className="mt-2.5 inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
          {t('home:companyIntro.cta')}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
        </LocaleLink>
        <div className="mt-5">
          <MobileStatsGrid compact />
        </div>
      </section>

      {/* 4. Services — compact accordion, collapsed by default */}
      <section className="py-10">
        <div className="px-4">
          <SectionHeader eyebrow={t('home:servicesShowcase.eyebrow')} heading={t('home:servicesShowcase.mobileHeading')} headingAs="h3" />
        </div>
        <nav aria-label={t('home:servicesShowcase.eyebrow')} className="mt-4 flex flex-col px-4">
          {showcaseDisplayGroups.map((group) => {
            const children = showcaseGroupChildren(group);
            const isExpandable = children.length > 0;
            const isExpanded = expandedGroupKey === group.key;
            const groupName = t(`nav:${group.i18nKey}`);
            const childrenId = `mobile-services-${group.key}`;
            return (
              <div key={group.key} className="border-t border-gray-200">
                <div className="flex items-center">
                  <LocaleLink
                    to={group.href!}
                    className="flex min-w-0 flex-1 items-center py-3 font-display text-h4 font-semibold text-ink"
                  >
                    {groupName}
                  </LocaleLink>
                  {isExpandable && (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={childrenId}
                      aria-label={t(isExpanded ? 'common:collapseSection' : 'common:expandSection', { name: groupName })}
                      onClick={() => setExpandedGroupKey(isExpanded ? null : group.key)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center text-gray-500"
                    >
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className={cn('transition-transform duration-base', isExpanded && 'rotate-180')}
                      />
                    </button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isExpandable && isExpanded && (
                    <motion.div
                      id={childrenId}
                      initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col pb-1.5">
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
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
        <div className="px-4 pt-4">
          <LocaleLink to="/services" className="inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
            {t('common:buttons.viewAllServices')}
            <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
          </LocaleLink>
        </div>
      </section>

      {/* 5. Portfolio — featured projects + Browse All Projects CTA */}
      <section className="bg-stone py-10">
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
                  : (() => {
                      const key = `projects:items.${project.slug}.sector`;
                      const translated = t(key);
                      return (translated === key ? project.sector : translated) || undefined;
                    })()
              }
              location={translateProjectLocation(t, project.location)}
              href={`/projects/${project.slug}`}
              className="w-[78vw] max-w-[20rem] shrink-0"
            />
          ))}
        </div>
        <div className="px-4 pt-5">
          <LocaleLink
            to="/projects/categories"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-600 text-body font-semibold text-warmwhite"
          >
            {t('home:featuredProjects.mobileCta')}
            <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
          </LocaleLink>
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

      {/* 6b. QHSE — pillar ↔ certificate evidence list, compact */}
      <section className="bg-stone px-4 py-10">
        <SectionHeader eyebrow={t('home:qualitySafety.eyebrow')} heading={t('home:qualitySafety.heading')} headingAs="h3" />
        <p className="mt-3 text-balance text-small text-gray-600">{t('home:qualitySafety.standardsCaption').replace(/\n/g, ' ')}</p>
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
        <LocaleLink to="/quality-safety" className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600">
          {t('home:qualitySafety.cta')}
          <ArrowRight size={15} aria-hidden="true" className="rtl:rotate-180" />
        </LocaleLink>
      </section>

      {/* 7. Regional presence — 2×2 office grid + selected office details */}
      <section className="px-4 py-10">
        <SectionHeader eyebrow={t('home:regionalPresence.eyebrow')} heading={t('home:regionalPresence.heading')} headingAs="h3" />
        <div className="mt-4">
          <RegionalOfficeGrid />
        </div>
      </section>

      {/* 8. Final call to action */}
      <MobileCTA
        heading={t('home:finalCta.heading')}
        description={t('home:finalCta.description')}
        primary={{ label: t('common:buttons.requestQuote'), href: '/contact?type=project' }}
        secondary={{ label: t('common:buttons.viewAllServices'), href: '/services' }}
      />
    </>
  );
}
