import { ArrowRight, Cpu, HardHat, Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileStatsGrid } from '../components/MobileStatsGrid';
import { MobileCTA } from '../components/MobileCTA';
import { LocaleLink } from '../components/LocaleLink';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';

export default function AboutPage() {
  const { t } = useTranslation(['about', 'common']);

  return (
    <>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path="/about"
        pageType="AboutPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'About', path: '/about' }]}
      />

      <section className="px-4 py-8">
        <SectionHeader eyebrow={t('whoWeAre.eyebrow')} heading={t('whoWeAre.heading')} headingAs="h2" />
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-body leading-relaxed text-ink">{t('whoWeAre.paragraph1')}</p>
          <p className="text-body leading-relaxed text-ink">{t('whoWeAre.paragraph2')}</p>
          <p className="text-body leading-relaxed text-ink">{t('whoWeAre.paragraph3')}</p>
        </div>
        <p className="mt-4 border-s-2 border-brand-500 ps-4 text-body font-semibold text-ink">{t('whoWeAre.quote')}</p>
      </section>

      <section className="bg-stone px-4 py-8">
        <MobileStatsGrid />
      </section>

      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('mobile.leadershipEyebrow')}
          heading={t('mobile.leadershipHeading')}
          headingAs="h3"
          description={t('mobile.leadershipDescription')}
        />
        <LocaleLink to="/team" className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand-600 text-body font-semibold text-warmwhite">
          {t('whoWeAre.meetTheTeam')}
        </LocaleLink>
      </section>

      <section className="px-4 pb-8">
        <SectionHeader eyebrow={t('mobile.exploreEyebrow')} heading={t('mobile.exploreHeading')} headingAs="h3" />
        <div className="mt-4 flex flex-col gap-3">
          <div className="rounded-md border border-gray-200 bg-warmwhite p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-stone text-brand-600">
              <HardHat size={18} aria-hidden="true" />
            </span>
            <h3 className="mt-3 font-display text-h4 font-semibold text-ink">{t('mobile.qhseTitle')}</h3>
            <p className="mt-1 text-small text-gray-600">{t('mobile.qhseDescription')}</p>
            <div className="mt-3 flex flex-col gap-2">
              <LocaleLink to="/quality-safety" className="inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
                {t('mobile.qhseViewCertifications')}
                <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
              </LocaleLink>
              <a
                href="/certificates/qhse-policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-small font-semibold text-brand-600"
              >
                {t('qualityStandards.downloadPolicy')}
                <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
              </a>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-warmwhite p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-stone text-brand-600">
              <Cpu size={18} aria-hidden="true" />
            </span>
            <h3 className="mt-3 font-display text-h4 font-semibold text-ink">{t('mobile.innovationTitle')}</h3>
            <p className="mt-1 text-small text-gray-600">{t('mobile.innovationDescription')}</p>
            <LocaleLink to="/innovation-technology" className="mt-3 inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
              {t('mobile.innovationExplore')}
              <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
            </LocaleLink>
          </div>

          <div className="rounded-md border border-gray-200 bg-warmwhite p-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-stone text-brand-600">
              <Newspaper size={18} aria-hidden="true" />
            </span>
            <h3 className="mt-3 font-display text-h4 font-semibold text-ink">{t('mobile.newsroomTitle')}</h3>
            <p className="mt-1 text-small text-gray-600">{t('mobile.newsroomDescription')}</p>
            <LocaleLink to="/newsroom" className="mt-3 inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
              {t('mobile.newsroomExplore')}
              <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
            </LocaleLink>
          </div>
        </div>
      </section>

      <MobileCTA
        heading={t('finalCta.heading')}
        primary={{ label: t('common:buttons.exploreProjects'), href: '/projects/categories' }}
        secondary={{ label: t('common:buttons.ourCapabilities'), href: '/services' }}
      />
    </>
  );
}
