import type { LucideIcon } from 'lucide-react';
import { Database, Download, HardHat, Layers, ScanSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileCTA } from '../components/MobileCTA';
import { SEO } from '../../seo/SEO';
import { serviceEntity } from '../../seo/structuredData';
import { services } from '../../data/services';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../../seo/constants';

const bimService = services.find((entry) => entry.slug === 'bim-digital-engineering')!;

const capabilityIcons: LucideIcon[] = [Layers, ScanSearch, HardHat, Database];

interface TitleDescription {
  title: string;
  description: string;
}

interface WorkflowStep {
  eyebrow: string;
  title: string;
  description: string;
}

export default function BIMPage() {
  const { t } = useTranslation(['services']);
  const serviceName = t('services:items.bimDigitalEngineering.name', bimService.name);
  const heroDescription = t('services:items.bimDigitalEngineering.introduction', bimService.introduction);
  const capabilities = (t('services:bimPage.capabilities.items', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: capabilityIcons[index] }),
  );
  const workflowSteps = t('services:bimPage.workflow.steps', { returnObjects: true }) as WorkflowStep[];

  return (
    <>
      <SEO
        title={t('services:bimPage.seo.title')}
        description={t('services:bimPage.seo.description')}
        path="/services/bim-digital-engineering"
        mainEntity={serviceEntity({
          name: t('services:bimPage.seo.title'),
          description: t('services:bimPage.seo.description'),
          url: `${SITE_URL}/services/bim-digital-engineering`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: serviceName, path: '/services/bim-digital-engineering' },
        ]}
      />

      <section className="px-4 py-8">
        <SectionHeader eyebrow={t('services:bimPage.serviceEyebrow')} heading={serviceName} headingAs="h2" description={heroDescription} />
        <div className="mt-5 aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-100">
          <img src={bimService.image} alt="MENASCO engineers reviewing a coordinated BIM model" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="bg-stone px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:bimPage.intro.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:bimPage.intro.heading')}</h3>
        <p className="mt-4 text-body leading-relaxed text-gray-700">{t('services:bimPage.intro.paragraph')}</p>
      </section>

      <section className="px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('services:bimPage.capabilities.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{t('services:bimPage.capabilities.heading')}</h3>
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
        <a
          href={COMPANY_PROFILE_PATH}
          download="MENASCO-Company-Profile.pdf"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 text-small font-semibold text-ink"
        >
          <Download size={16} aria-hidden="true" />
          {t('services:bimPage.downloadCompanyProfile')}
        </a>
      </section>

      <section className="bg-ink px-4 py-8">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('services:bimPage.workflow.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite">{t('services:bimPage.workflow.heading')}</h3>

        <ol className="relative mt-6 flex flex-col gap-8">
          <span aria-hidden="true" className="absolute start-[15px] top-2 bottom-2 w-px bg-white/15" />
          {workflowSteps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4">
              <span className="relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-warmwhite bg-ink font-display text-caption font-semibold tabular-nums text-warmwhite">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-1 pt-0.5">
                <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{step.eyebrow}</span>
                <p className="font-display font-semibold text-warmwhite">{step.title}</p>
                <p className="text-small text-gray-300">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <MobileCTA
        heading={t('services:bimPage.closing.heading')}
        description={t('services:bimPage.closing.description')}
        primary={{ label: t('services:bimPage.closing.cta'), href: '/projects/categories' }}
      />
    </>
  );
}
