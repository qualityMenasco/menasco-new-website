import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Eyebrow } from '../../typography/Typography';
import { ProfessionalList } from '../../content/ProfessionalList';
import { ButtonLink } from '../../ui/Button';
import { TopicTabs, type TabTopic } from '../quality/TopicTabs';
import { SmartLink } from '../../../lib/SmartLink';
import { umbrellaServiceLinks } from '../../../data/navigation';

/** Home-specific preview copy (home:servicesShowcase.previews.*), keyed by each umbrella page. */
const homePreviewKeys: Record<string, string> = {
  '/services/mep': 'mep',
  '/services/civil': 'civil',
  '/services/manufacturing-prefabrication': 'manufacturingPrefabrication',
  '/services/turnkey-developments': 'epc',
  '/services/data-centers': 'dataCenters',
};

export function ServicesShowcase() {
  const { t, i18n } = useTranslation(['home', 'services', 'nav']);

  // One tab per umbrella service (no sub-pages): its home preview copy, three
  // key points and a link to the umbrella page. Every panel stays in the DOM.
  const topics: TabTopic[] = umbrellaServiceLinks.flatMap((group) => {
    const key = homePreviewKeys[group.href];
    if (!key) return [];
    const name = t(`nav:${group.i18nKey}`);
    const points = t(`home:servicesShowcase.previews.${key}.points`, { returnObjects: true }) as string[];
    return [{
      title: name,
      body: [t(`home:servicesShowcase.previews.${key}.description`)],
      extra: (
        <>
          <ProfessionalList variant="divided" gap="sm" className="mt-4 max-w-3xl" items={points.map((point) => ({ title: point }))} />
          <SmartLink
            href={group.href}
            className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
          >
            {/* A preview can override the generic "View {name} services" (e.g. singular "Data Center"). */}
            {i18n.exists(`home:servicesShowcase.previews.${key}.linkLabel`)
              ? t(`home:servicesShowcase.previews.${key}.linkLabel`)
              : t('home:servicesShowcase.viewService', { name })}
            <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
          </SmartLink>
        </>
      ),
    }];
  });

  return (
    // What we deliver (desktop): umbrella services as tabs (titles left, selected
    // service right), the same pattern as Quality & Safety's "Our commitment".
    // About MENASCO is its own section (CompanyIntro), directly under the hero.
    <Section background="warmwhite" spacing="sm">
      {/* Left: heading, the service tabs and "All services"; right: the selected service,
          vertically centred against the left column. */}
      <TopicTabs
        topics={topics}
        idPrefix="home-service"
        label={t('home:servicesShowcase.eyebrow')}
        layoutClassName="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-12 xl:gap-20"
        lead={
          <div className="mb-8 flex flex-col gap-2">
            <Eyebrow className="mb-0">{t('home:servicesShowcase.eyebrow')}</Eyebrow>
            <p className="text-balance font-display text-h2 font-semibold tracking-tight text-ink">{t('home:servicesShowcase.heading')}</p>
          </div>
        }
        footer={
          <div className="mt-8">
            <ButtonLink href="/services" variant="primary" trailingIcon={ArrowRight}>
              {t('home:servicesShowcase.cta')}
            </ButtonLink>
          </div>
        }
      />
    </Section>
  );
}
