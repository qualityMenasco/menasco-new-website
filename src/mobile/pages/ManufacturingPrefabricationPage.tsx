import type { LucideIcon } from 'lucide-react';
import { Boxes, Cable, Check, Download, FolderKanban, Gauge, Route, Settings2, ShieldCheck, Wind, Wrench, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileCTA } from '../components/MobileCTA';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../../seo/constants';

const capabilityIcons: LucideIcon[] = [Wind, Boxes, Route, Wrench, Cable, Settings2];
const qualityIcons: LucideIcon[] = [Gauge, ShieldCheck, Zap, FolderKanban];

interface TitleDescription {
  title: string;
  description: string;
}

export default function ManufacturingPrefabricationPage() {
  const { t } = useTranslation(['services']);
  const capabilities = (t('services:manufacturingPageMobile.capabilities', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: capabilityIcons[index] }),
  );
  const qualityHighlights = (t('services:manufacturingPageMobile.qualityHighlights', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: qualityIcons[index] }),
  );
  const benefits = t('services:manufacturingPageMobile.benefits', { returnObjects: true }) as string[];

  return (
    <>
      <SEO
        title={t('services:manufacturingPageMobile.seo.title')}
        description={t('services:manufacturingPageMobile.seo.description')}
        path="/services/manufacturing-prefabrication"
        mainEntity={serviceEntity({
          name: t('services:manufacturingPageMobile.seo.title'),
          description: t('services:manufacturingPageMobile.seo.description'),
          url: `${SITE_URL}/services/manufacturing-prefabrication`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Manufacturing & Prefabrication', path: '/services/manufacturing-prefabrication' },
        ]}
      />

      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('services:manufacturingPageMobile.eyebrow')}
          heading={t('services:manufacturingPageMobile.heading')}
          headingAs="h2"
          description={t('services:manufacturingPageMobile.description')}
        />
        <div className="mt-5 aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src="/manufacturing-prefab-service-hero.jpg"
            alt="MEP components fabricated off-site through MENASCO's manufacturing partners"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-stone px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:manufacturingPageMobile.overview.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:manufacturingPageMobile.overview.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:manufacturingPageMobile.overview.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-700">{t('services:manufacturingPageMobile.overview.paragraph2')}</p>
        <div className="mt-5 aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src="/manufacturing-prefab-hero.jpg"
            alt="Prefabricated MEP modules produced in a controlled manufacturing environment"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:manufacturingPageMobile.capabilitiesSection.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:manufacturingPageMobile.capabilitiesSection.heading')}</h3>
        <div className="mt-5 grid grid-cols-1 gap-4 xs:grid-cols-2">
          {capabilities.map((capability) => (
            <div key={capability.title} className="flex flex-col gap-3 rounded-md border border-gray-200 bg-warmwhite p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-stone text-brand-600">
                <capability.icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="font-display font-semibold text-ink">{capability.title}</p>
                <p className="mt-1 text-small text-gray-500">{capability.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('services:manufacturingPageMobile.offSite.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite">{t('services:manufacturingPageMobile.offSite.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-300">{t('services:manufacturingPageMobile.offSite.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-300">{t('services:manufacturingPageMobile.offSite.paragraph2')}</p>
        <p className="mt-6 font-display font-semibold uppercase tracking-wide text-warmwhite">{t('services:manufacturingPageMobile.offSite.benefitsLabel')}</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-body text-gray-200">
              <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-brand-400" />
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:manufacturingPageMobile.qualitySection.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:manufacturingPageMobile.qualitySection.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:manufacturingPageMobile.qualitySection.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-700">{t('services:manufacturingPageMobile.qualitySection.paragraph2')}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {qualityHighlights.map((item) => (
            <div key={item.title} className="flex flex-col items-start gap-2.5 rounded-md border border-gray-200 bg-stone p-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
                <item.icon size={16} aria-hidden="true" />
              </span>
              <p className="font-display text-small font-semibold text-ink">{item.title}</p>
              <p className="text-small text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
        <a
          href={COMPANY_PROFILE_PATH}
          download="MENASCO-Company-Profile.pdf"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 text-small font-semibold text-ink"
        >
          <Download size={16} aria-hidden="true" />
          {t('services:manufacturingPageMobile.downloadCompanyProfile')}
        </a>
      </section>

      <MobileCTA
        heading={t('services:manufacturingPageMobile.cta.heading')}
        description={t('services:manufacturingPageMobile.cta.description')}
        primary={{ label: t('services:manufacturingPageMobile.cta.primaryLabel'), href: '/projects/categories' }}
      />
    </>
  );
}
