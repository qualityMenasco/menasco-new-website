import type { LucideIcon } from 'lucide-react';
import { Compass, Truck, HardHat, Settings2, ClipboardList, ShieldCheck, ClipboardCheck, Gauge, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileCTA } from '../components/MobileCTA';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../../seo/constants';

const capabilityIcons: LucideIcon[] = [Compass, Truck, HardHat, Settings2, ClipboardList, ShieldCheck];
const qualityIcons: LucideIcon[] = [Compass, ClipboardCheck, Gauge, ShieldCheck];

interface TitleDescription {
  title: string;
  description: string;
}

export default function EPCPage() {
  const { t } = useTranslation(['services']);
  const capabilities = (t('services:epcPageMobile.capabilities', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: capabilityIcons[index] }),
  );
  const qualityHighlights = (t('services:epcPageMobile.qualityHighlights', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: qualityIcons[index] }),
  );
  const benefits = t('services:epcPageMobile.benefits', { returnObjects: true }) as string[];

  return (
    <>
      <SEO
        title={t('services:epcPageMobile.seo.title')}
        description={t('services:epcPageMobile.seo.description')}
        path="/services/turnkey-developments"
        mainEntity={serviceEntity({
          name: t('services:epcPageMobile.seo.title'),
          description: t('services:epcPageMobile.seo.description'),
          url: `${SITE_URL}/services/turnkey-developments`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'EPC', path: '/services/turnkey-developments' },
        ]}
      />

      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('services:epcPageMobile.eyebrow')}
          heading={t('services:epcPageMobile.heading')}
          headingAs="h2"
          description={t('services:epcPageMobile.description')}
        />
        <div className="mt-5 aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src="/Mechanical_Floor_Volante-2-2-3.jpg"
            alt="MEP plant room delivered through MENASCO's EPC model"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-stone px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:epcPageMobile.overview.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:epcPageMobile.overview.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:epcPageMobile.overview.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-700">{t('services:epcPageMobile.overview.paragraph2')}</p>
        <div className="mt-5 aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src="/company-intro-mep-hero.jpg"
            alt="MENASCO engineers coordinating MEP design and site delivery"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:epcPageMobile.capabilitiesSection.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:epcPageMobile.capabilitiesSection.heading')}</h3>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('services:epcPageMobile.integratedDelivery.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite">{t('services:epcPageMobile.integratedDelivery.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-300">{t('services:epcPageMobile.integratedDelivery.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-300">{t('services:epcPageMobile.integratedDelivery.paragraph2')}</p>
        <p className="mt-6 font-display font-semibold uppercase tracking-wide text-warmwhite">{t('services:epcPageMobile.integratedDelivery.benefitsLabel')}</p>
        <ul className="mt-3 flex flex-col">
          {benefits.map((benefit) => (
            <li key={benefit} className="border-t border-white/10 py-2.5 text-start text-body text-gray-200">
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:epcPageMobile.qualitySection.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:epcPageMobile.qualitySection.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:epcPageMobile.qualitySection.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-700">{t('services:epcPageMobile.qualitySection.paragraph2')}</p>
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
          {t('services:epcPageMobile.downloadCompanyProfile')}
        </a>
      </section>

      <MobileCTA
        heading={t('services:epcPageMobile.cta.heading')}
        description={t('services:epcPageMobile.cta.description')}
        primary={{ label: t('services:epcPageMobile.cta.primaryLabel'), href: '/projects/categories' }}
      />
    </>
  );
}
