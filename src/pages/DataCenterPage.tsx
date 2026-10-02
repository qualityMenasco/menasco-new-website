import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Container } from '../components/layout/Container';
import { SectionHeader } from '../components/typography/SectionHeader';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ProfessionalList } from '../components/content/ProfessionalList';
import { SplitContent } from '../components/content/SplitContent';
import { Statistic } from '../components/content/Statistic';
import { ButtonLink } from '../components/ui/Button';
import { Accordion } from '../components/ui/Accordion';
import { projects } from '../data/projects';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';

/** Parses a capacity string like "12 MW IT" or "800 KW IT" into a plain MW number. */
function parseCapacityInMw(capacity?: string): number {
  const match = capacity?.match(/([\d.]+)\s*(MW|KW)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return match[2].toUpperCase() === 'KW' ? value / 1000 : value;
}

const dataCenterProjects = projects.filter((project) => project.category === 'advanced-technical-facilities');
const totalDataCenterMw = Math.round(dataCenterProjects.reduce((sum, project) => sum + parseCapacityInMw(project.capacity), 0) * 10) / 10;

interface FaqEntry {
  id: string;
  title: string;
  content: string;
}

export default function DataCenterPage() {
  const { t } = useTranslation('services');
  const introParagraphs = t('dataCenter.introParagraphs', { returnObjects: true }) as string[];
  const dataCenterCapabilities = t('dataCenter.capabilities', { returnObjects: true }) as { title: string; description: string }[];
  const dataCenterFaqItems = t('dataCenter.faq', { returnObjects: true }) as FaqEntry[];

  return (
    <>
      <SEO
        title={t('dataCenter.seo.title')}
        description={t('dataCenter.seo.description')}
        path="/services/data-centers"
        mainEntity={serviceEntity({
          name: t('dataCenter.seo.title'),
          description: t('dataCenter.seo.description'),
          url: `${SITE_URL}/services/data-centers`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Data Centres', path: '/services/data-centers' },
        ]}
      />

      <section className="relative flex min-h-[72vh] w-full items-end overflow-hidden bg-ink">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          src="/data-center.mp4"
          poster="/data-center-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/35 to-transparent" />

        <Container className="relative z-10 pb-20 pt-28 md:pb-24 md:pt-32">
          <div className="max-w-3xl">
            <Eyebrow theme="dark">{t('dataCenter.hero.eyebrow')}</Eyebrow>
            <Heading level="h1" as="h2" theme="dark" className="mt-4">
              {t('dataCenter.hero.heading')}
            </Heading>
            <Text variant="body-lg" theme="dark" className="mt-6 max-w-2xl text-gray-200">
              {t('dataCenter.hero.description')}
            </Text>
          </div>
        </Container>
      </section>

      <Section background="warmwhite" spacing="lg">
        <Stack space="lg">
          <SectionHeader
            eyebrow={t('dataCenter.introHeading.eyebrow')}
            heading={t('dataCenter.introHeading.heading')}
            headingAs="h3"
          />
          <Stack space="sm" className="max-w-3xl">
            {introParagraphs.map((paragraph) => (
              <Text key={paragraph} variant="body-lg">
                {paragraph}
              </Text>
            ))}
          </Stack>
          <ButtonLink
            href="/projects/categories?category=advanced-technical-facilities"
            variant="primary"
            trailingIcon={ArrowRight}
            className="w-fit"
          >
            {t('dataCenter.exploreProjectsCta')}
          </ButtonLink>
        </Stack>
      </Section>

      <Section background="ink" spacing="md" edgeFade>
        <Statistic
          layout="grid"
          columns={2}
          size="lg"
          theme="dark"
          items={[
            { value: String(dataCenterProjects.length), label: t('dataCenter.stats.featuredDataCenters'), animate: true, valueClassName: '!text-brand-500' },
            { value: `${totalDataCenterMw.toFixed(1)} MW`, label: t('dataCenter.stats.megawatts'), animate: true, valueClassName: '!text-brand-500' },
          ]}
        />
      </Section>

      <Section background="warmwhite" spacing="lg">
        <Stack space="lg">
          <SectionHeader
            eyebrow={t('dataCenter.capabilitiesHeading.eyebrow')}
            heading={t('dataCenter.capabilitiesHeading.heading')}
            headingAs="h3"
          />
          <ProfessionalList items={dataCenterCapabilities} variant="arrow" columns={2} />
        </Stack>
      </Section>

      <Section background="warmwhite" spacing="lg" joinTop>
        <SplitContent
          image="/data-centre-prefabrication-mep.webp"
          imageAlt="Data centre MEP infrastructure with server racks, cooling systems, pipework and cable containment"
          imageSide="right"
          eyebrow={t('dataCenter.prefab.eyebrow')}
          heading={t('dataCenter.prefab.heading')}
          headingAs="h3"
          description={t('dataCenter.prefab.description')}
          closingStatement={t('dataCenter.prefab.closingStatement')}
          stretch
        />
      </Section>

      <Section background="warmwhite" spacing="md" className="pb-20" joinTop>
        <Stack space="lg">
          <SectionHeader eyebrow={t('dataCenter.faqHeading.eyebrow')} heading={t('dataCenter.faqHeading.heading')} headingAs="h3" />
          <Accordion
            items={dataCenterFaqItems}
            defaultOpenIds={['what-does-a-data-center-contractor-provide']}
            triggerClassName="font-normal"
          />
        </Stack>
      </Section>
    </>
  );
}
