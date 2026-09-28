import { Database, Download, HardHat, Layers, ScanSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ButtonLink } from '../components/ui/Button';
import { ProjectHeroBanner } from '../components/projects/ProjectHeroBanner';
import { ScrollReveal, ScrollRevealGroup } from '../components/common/ScrollReveal';
import { ProcessSteps, type ProcessStepData } from '../components/content/ProcessSteps';
import { SectionThemeContext } from '../lib/theme-context';
import { services } from '../data/services';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';
import type { IconComponent } from '../types';

const bimService = services.find((entry) => entry.slug === 'bim-digital-engineering')!;

const capabilityIcons: IconComponent[] = [Layers, ScanSearch, HardHat, Database];

interface TitleDescription {
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
  const workflowSteps = t('services:bimPage.workflow.steps', { returnObjects: true }) as ProcessStepData[];

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

      <ProjectHeroBanner
        image={bimService.image}
        title={serviceName}
        description={heroDescription}
        ctaLabel={t('services:detail.downloadCompanyProfile')}
        ctaHref={COMPANY_PROFILE_PATH}
        ctaDownload="MENASCO-Company-Profile.pdf"
      />

      {/* BIM at MENASCO — short, scannable intro rather than a wall of text. */}
      <ScrollReveal>
        <Section background="warmwhite" spacing="lg" edgeFade>
          <Stack space="sm" className="max-w-2xl">
            <Eyebrow>{t('services:bimPage.intro.eyebrow')}</Eyebrow>
            <Heading level="h2" as="h3">
              {t('services:bimPage.intro.heading')}
            </Heading>
            <Text variant="body-lg" className="leading-relaxed">
              {t('services:bimPage.intro.paragraph')}
            </Text>
          </Stack>
        </Section>
      </ScrollReveal>

      {/* Core BIM Capabilities */}
      <ScrollReveal>
        <Section background="stone" spacing="lg" edgeFade>
          <Stack space="xl">
            <Stack space="sm" className="max-w-2xl">
              <Eyebrow>{t('services:bimPage.capabilities.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:bimPage.capabilities.heading')}
              </Heading>
            </Stack>
            <ScrollRevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
              {capabilities.map((capability) => (
                <div
                  key={capability.title}
                  className="flex flex-col gap-4 rounded-md border border-gray-200 bg-warmwhite p-6 sm:min-h-[180px]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-stone text-brand-600">
                    <capability.icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <Text className="font-display font-semibold text-ink">{capability.title}</Text>
                    <Text variant="small" muted className="mt-1">
                      {capability.description}
                    </Text>
                  </div>
                </div>
              ))}
            </ScrollRevealGroup>
            <ButtonLink
              href={COMPANY_PROFILE_PATH}
              download="MENASCO-Company-Profile.pdf"
              variant="outline"
              leadingIcon={Download}
              className="w-fit"
            >
              {t('services:bimPage.downloadCompanyProfile')}
            </ButtonLink>
          </Stack>
        </Section>
      </ScrollReveal>

      {/* BIM through the project lifecycle — dark section for visual rhythm, matching the site's other service pages. */}
      <ScrollReveal>
        <Section background="ink" spacing="lg" edgeFade>
          <Stack space="xl">
            <Stack space="sm" className="max-w-2xl">
              <Eyebrow theme="dark">{t('services:bimPage.workflow.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3" theme="dark">
                {t('services:bimPage.workflow.heading')}
              </Heading>
            </Stack>
            <ProcessSteps steps={workflowSteps} className="pt-4" />
          </Stack>
        </Section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <SectionThemeContext.Provider value="dark">
          <section className="bg-gradient-to-br from-brand-800 via-brand-900 to-ink py-16 md:py-24">
            <Container>
              <div className="max-w-2xl">
                <Heading level="h2" as="h3" theme="dark">
                  {t('services:bimPage.closing.heading')}
                </Heading>
                <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
                  {t('services:bimPage.closing.description')}
                </Text>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <ButtonLink href="/projects/categories" variant="primary">
                    {t('services:bimPage.closing.cta')}
                  </ButtonLink>
                </div>
              </div>
            </Container>
          </section>
        </SectionThemeContext.Provider>
      </ScrollReveal>
    </>
  );
}
