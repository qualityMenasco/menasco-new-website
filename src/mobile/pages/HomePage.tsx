import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MobileHero } from '../components/MobileHero';
import { SectionHeader } from '../components/SectionHeader';
import { MobileStatsGrid } from '../components/MobileStatsGrid';
import { MobileServiceCard } from '../components/MobileServiceCard';
import { MobileProjectCard } from '../components/MobileProjectCard';
import { RegionalOfficeGrid } from '../components/RegionalOfficeGrid';
import { MobileCTA } from '../components/MobileCTA';
import { LocaleLink } from '../components/LocaleLink';
import { SEO } from '../../seo/SEO';
import { organizationJsonLd, websiteJsonLd } from '../../seo/structuredData';
import { services } from '../../data/services';
import { projects } from '../../data/projects';
import { getProjectImage } from '../../data/images';
import { foundingYear } from '../../data/companyStats';
import { translateProjectLocation } from '../../lib/projectLocation';

const EASE = [0.22, 0.61, 0.36, 1] as const;

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
  'bim-digital-engineering': 'bimDigitalEngineering',
  'manufacturing-prefabrication': 'manufacturingPrefabrication',
};

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  hotels: 'hospitality',
  'landmark-entertainment': 'landmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
};

const featuredProjects = projects.filter((project) => project.featured);

export default function HomePage() {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation(['home', 'services', 'projects', 'common']);

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

      {/* 4. Services — horizontal swipe row */}
      <section className="py-10">
        <div className="px-4">
          <SectionHeader eyebrow={t('home:servicesShowcase.eyebrow')} heading={t('home:servicesShowcase.mobileHeading')} headingAs="h3" />
        </div>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {services.map((service) => {
            const key = serviceKeys[service.slug] ?? service.slug;
            return (
              <MobileServiceCard
                key={service.id}
                image={service.image}
                title={t(`services:items.${key}.name`)}
                description={t(`services:items.${key}.shortDescription`)}
                href={`/services/${service.slug}`}
                className="w-64 shrink-0"
              />
            );
          })}
        </div>
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
              className="w-56 shrink-0"
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
