import { Leaf, HeartHandshake, Scale, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { ExpandableText } from '../components/ExpandableText';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';

interface PillarCopy {
  paragraphs: string[];
}

const pillarMeta: { icon: LucideIcon; heading: string }[] = [
  { icon: Leaf, heading: 'Environmental' },
  { icon: HeartHandshake, heading: 'Social' },
  { icon: Scale, heading: 'Governance' },
  { icon: TrendingUp, heading: 'Continuous Improvement' },
];

export default function ESGReportingPage() {
  const { t } = useTranslation(['about', 'common']);
  const pillarHeadings = t('esg.pillars', { returnObjects: true }) as { heading: string }[];
  const pillarCopy = t('esgMobile.pillars', { returnObjects: true }) as PillarCopy[];
  const pillars = pillarMeta.map((meta, index) => ({
    icon: meta.icon,
    heading: pillarHeadings[index]?.heading ?? meta.heading,
    paragraphs: pillarCopy[index].paragraphs,
  }));

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={t('esgMobile.seo.title')}
        description={t('esgMobile.seo.description')}
        path="/esg-reporting"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'ESG Reporting', path: '/esg-reporting' }]}
      />
      <section className="px-4 py-8">
        <SectionHeader eyebrow={t('esgMobile.eyebrow')} heading={t('esgMobile.heading')} headingAs="h2" />
        <div className="mt-4 flex flex-col gap-4">
          {pillars.map((pillar) => (
            <div key={pillar.heading} className="rounded-md border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-stone text-brand-600">
                  <pillar.icon size={18} aria-hidden="true" />
                </span>
                <h3 className="font-display text-h4 font-semibold text-ink">{pillar.heading}</h3>
              </div>
              <ExpandableText
                className="mt-3"
                summary={pillar.paragraphs[0]}
                paragraphs={pillar.paragraphs.slice(1)}
                expandLabel={t('common:buttons.readMore')}
                collapseLabel={t('common:buttons.showLess')}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
