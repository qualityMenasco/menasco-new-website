import type { LucideIcon } from 'lucide-react';
import { Boxes, ClipboardList, Download, HardHat, Layers, Route, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileCTA } from '../components/MobileCTA';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../../seo/constants';

const capabilityIcons: LucideIcon[] = [HardHat, Layers, Boxes, Route, ClipboardList, ShieldCheck];
const qualityIcons: LucideIcon[] = [ClipboardList, Boxes, ShieldCheck, HardHat];

interface TitleDescription {
  title: string;
  description: string;
}

export default function CivilPage() {
  const { t } = useTranslation(['services']);
  const capabilities = (t('services:civilPageMobile.capabilities', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: capabilityIcons[index] }),
  );
  const qualityHighlights = (t('services:civilPageMobile.qualityHighlights', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: qualityIcons[index] }),
  );
  const benefits = t('services:civilPageMobile.benefits', { returnObjects: true }) as string[];

  return (
    <>
      <SEO
        title={t('services:civilPageMobile.seo.title')}
        description={t('services:civilPageMobile.seo.description')}
        path="/services/civil"
        mainEntity={serviceEntity({
          name: t('services:civilPageMobile.seo.title'),
          description: t('services:civilPageMobile.seo.description'),
          url: `${SITE_URL}/services/civil`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Civil', path: '/services/civil' },
        ]}
      />

      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('services:civilPageMobile.eyebrow')}
          heading={t('services:civilPageMobile.heading')}
          headingAs="h2"
          description={t('services:civilPageMobile.description')}
        />
        <div className="mt-5 aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src="/bim-digital-engineering-hero.jpg"
            alt="Civil and MEP works coordinated through a shared BIM model"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-stone px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:civilPageMobile.overview.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:civilPageMobile.overview.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:civilPageMobile.overview.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-700">{t('services:civilPageMobile.overview.paragraph2')}</p>
        <div className="mt-5 aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src="/company-intro-mep-hero.jpg"
            alt="MENASCO engineers coordinating civil and MEP interfaces"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:civilPageMobile.capabilitiesSection.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:civilPageMobile.capabilitiesSection.heading')}</h3>
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
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('services:civilPageMobile.integratedDelivery.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite">{t('services:civilPageMobile.integratedDelivery.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-300">{t('services:civilPageMobile.integratedDelivery.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-300">{t('services:civilPageMobile.integratedDelivery.paragraph2')}</p>
        <p className="mt-6 font-display font-semibold uppercase tracking-wide text-warmwhite">{t('services:civilPageMobile.integratedDelivery.benefitsLabel')}</p>
        <ul className="mt-3 flex flex-col">
          {benefits.map((benefit) => (
            <li key={benefit} className="border-t border-white/10 py-2.5 text-start text-body text-gray-200">
              {benefit}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:civilPageMobile.qualitySection.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:civilPageMobile.qualitySection.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:civilPageMobile.qualitySection.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-700">{t('services:civilPageMobile.qualitySection.paragraph2')}</p>
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
          {t('services:civilPageMobile.downloadCompanyProfile')}
        </a>
      </section>

      <MobileCTA
        heading={t('services:civilPageMobile.cta.heading')}
        description={t('services:civilPageMobile.cta.description')}
        primary={{ label: t('services:civilPageMobile.cta.primaryLabel'), href: '/projects/categories' }}
      />
    </>
  );
}
