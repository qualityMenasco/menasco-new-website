import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Boxes, CheckCircle2, ClipboardCheck, Download, Droplet, Flame, Gauge, ShieldCheck, Wind, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileCTA } from '../components/MobileCTA';
import { SmartLink } from '../../lib/SmartLink';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../../seo/constants';

const capabilityIcons: LucideIcon[] = [Wind, Zap, Droplet, Flame, Boxes, CheckCircle2];
const qualityIcons: LucideIcon[] = [ShieldCheck, ClipboardCheck, Gauge, CheckCircle2];

interface TitleDescription {
  title: string;
  description: string;
}

interface DisciplineLink extends TitleDescription {
  href: string;
}

export default function MEPPage() {
  const { t } = useTranslation(['services']);
  const capabilities = (t('services:mepPageMobile.capabilities', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: capabilityIcons[index] }),
  );
  const qualityHighlights = (t('services:mepPageMobile.qualityHighlights', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: qualityIcons[index] }),
  );
  const disciplines = t('services:mepPageMobile.disciplines.items', { returnObjects: true }) as DisciplineLink[];

  return (
    <>
      <SEO
        title={t('services:mepPageMobile.seo.title')}
        description={t('services:mepPageMobile.seo.description')}
        path="/services/mep"
        mainEntity={serviceEntity({
          name: t('services:mepPageMobile.seo.title'),
          description: t('services:mepPageMobile.seo.description'),
          url: `${SITE_URL}/services/mep`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'MEP', path: '/services/mep' },
        ]}
      />

      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('services:mepPageMobile.eyebrow')}
          heading={t('services:mepPageMobile.heading')}
          headingAs="h2"
          description={t('services:mepPageMobile.description')}
        />
        <div className="mt-5 aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src="/electrical-switchgear-room.jpg"
            alt="MEP infrastructure coordinated by MENASCO's in-house engineering team"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="bg-stone px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:mepPageMobile.overview.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:mepPageMobile.overview.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:mepPageMobile.overview.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-700">{t('services:mepPageMobile.overview.paragraph2')}</p>
        <div className="mt-5 aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src="/mechanical-plant-room.jpg"
            alt="MEP plant room coordinated by MENASCO's in-house engineering team"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:mepPageMobile.capabilitiesSection.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:mepPageMobile.capabilitiesSection.heading')}</h3>
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
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('services:mepPageMobile.disciplines.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite">{t('services:mepPageMobile.disciplines.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-300">{t('services:mepPageMobile.disciplines.paragraph1')}</p>
        <div className="mt-5 flex flex-col gap-3">
          {disciplines.map((discipline) => (
            <SmartLink
              key={discipline.title}
              href={discipline.href}
              className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] p-4"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-display font-semibold text-warmwhite">{discipline.title}</span>
                <span className="text-small text-gray-400">{discipline.description}</span>
              </span>
              <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-gray-400 rtl:rotate-180" />
            </SmartLink>
          ))}
        </div>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:mepPageMobile.qualitySection.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:mepPageMobile.qualitySection.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:mepPageMobile.qualitySection.paragraph1')}</p>
        <p className="mt-3 text-body leading-relaxed text-gray-700">{t('services:mepPageMobile.qualitySection.paragraph2')}</p>
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
          {t('services:mepPageMobile.downloadCompanyProfile')}
        </a>
      </section>

      <MobileCTA
        heading={t('services:mepPageMobile.cta.heading')}
        description={t('services:mepPageMobile.cta.description')}
        primary={{ label: t('services:mepPageMobile.cta.primaryLabel'), href: '/projects/categories' }}
      />
    </>
  );
}
