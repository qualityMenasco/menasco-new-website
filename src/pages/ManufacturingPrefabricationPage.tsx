import { ArrowRight, Boxes, Cable, ClipboardList, Download, FolderKanban, Gauge, Route, Settings2, Wind, Wrench, Zap } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ButtonLink } from '../components/ui/Button';
import { ProfessionalList } from '../components/content/ProfessionalList';
import { ScrollReveal, ScrollRevealGroup } from '../components/common/ScrollReveal';
import { SectionThemeContext } from '../lib/theme-context';
import { useTranslation } from 'react-i18next';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';
import type { IconComponent } from '../types';

const capabilityIcons: IconComponent[] = [Wind, Boxes, Route, Wrench, Cable, Settings2];
const qualityIcons: IconComponent[] = [Gauge, ClipboardList, Zap, FolderKanban];

// Use the shared ProjectHeroBanner for the full-bleed service hero.
import { ProjectHeroBanner } from '../components/projects/ProjectHeroBanner';

interface TitleDescription {
  title: string;
  description: string;
}

export default function ManufacturingPrefabricationPage() {
  const { t } = useTranslation(['services']);
  const capabilities = (t('services:manufacturingPage.capabilities', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: capabilityIcons[index] }),
  );
  const qualityHighlights = (t('services:manufacturingPage.qualityHighlights', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: qualityIcons[index] }),
  );
  const benefits = t('services:manufacturingPage.benefits', { returnObjects: true }) as string[];

  return (
    <>
      <SEO
        title={t('services:manufacturingPage.seo.title')}
        description={t('services:manufacturingPage.seo.description')}
        path="/services/manufacturing-prefabrication"
        mainEntity={serviceEntity({
          name: t('services:manufacturingPage.seo.title'),
          description: t('services:manufacturingPage.seo.description'),
          url: `${SITE_URL}/services/manufacturing-prefabrication`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'Manufacturing & Prefabrication', path: '/services/manufacturing-prefabrication' },
        ]}
      />

      <ProjectHeroBanner
        image="/manufacturing-prefab-service-hero.jpg"
        title={t('services:manufacturingPage.hero.title')}
        description={t('services:manufacturingPage.hero.description')}
        ctaLabel={t('services:detail.downloadCompanyProfile')}
        ctaHref={COMPANY_PROFILE_PATH}
        ctaDownload="MENASCO-Company-Profile.pdf"
      />

      {/* Overview — text left, premium image right, matching the established two-column editorial layout used across About/Innovation. */}
      <ScrollReveal>
        <Section background="warmwhite" spacing="lg" edgeFade>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Stack space="sm" as="article">
              <Eyebrow>{t('services:manufacturingPage.overview.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:manufacturingPage.overview.heading')}
              </Heading>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:manufacturingPage.overview.paragraph1')}
              </Text>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:manufacturingPage.overview.paragraph2')}
              </Text>
            </Stack>
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
              <img
                src="/manufacturing-prefab-hero.jpg"
                alt="Prefabricated MEP modules produced in a controlled manufacturing environment"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Section>
      </ScrollReveal>

      {/* Capabilities grid */}
      <ScrollReveal>
        <Section background="stone" spacing="lg" edgeFade>
          <Stack space="xl">
            <Stack space="sm" className="max-w-2xl">
              <Eyebrow>{t('services:manufacturingPage.capabilitiesSection.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:manufacturingPage.capabilitiesSection.heading')}
              </Heading>
            </Stack>
            <ScrollRevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {capabilities.map((capability) => (
                <div key={capability.title} className="flex flex-col gap-4 rounded-md border border-gray-200 bg-warmwhite p-6 sm:min-h-[206px]">
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
          </Stack>
        </Section>
      </ScrollReveal>

      {/* Off-site prefabrication — dark full-width section for visual rhythm, text left + benefits list right. */}
      <ScrollReveal>
        <Section background="ink" spacing="lg" edgeFade>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <Stack space="sm" as="article">
              <Eyebrow theme="dark">{t('services:manufacturingPage.offSite.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3" theme="dark">
                {t('services:manufacturingPage.offSite.heading')}
              </Heading>
              <Text variant="body-lg" theme="dark" className="leading-relaxed text-gray-300">
                {t('services:manufacturingPage.offSite.paragraph1')}
              </Text>
              <Text variant="body-lg" theme="dark" className="leading-relaxed text-gray-300">
                {t('services:manufacturingPage.offSite.paragraph2')}
              </Text>
            </Stack>
            <Stack space="sm" className="lg:mt-11">
              <Text theme="dark" className="font-display font-semibold uppercase tracking-wide text-warmwhite">
                {t('services:manufacturingPage.offSite.benefitsLabel')}
              </Text>
              <ProfessionalList
                variant="divided"
                theme="dark"
                columns={2}
                items={benefits.map((benefit) => ({ title: benefit }))}
              />
            </Stack>
          </div>
        </Section>
      </ScrollReveal>

      {/* Quality through manufacturing — paragraph + four highlight cards below. */}
      <ScrollReveal>
        <Section background="warmwhite" spacing="lg" edgeFade>
          <Stack space="xl">
            <Stack space="sm" className="max-w-3xl">
              <Eyebrow>{t('services:manufacturingPage.qualitySection.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:manufacturingPage.qualitySection.heading')}
              </Heading>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:manufacturingPage.qualitySection.paragraph1')}
              </Text>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:manufacturingPage.qualitySection.paragraph2')}
              </Text>
            </Stack>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {qualityHighlights.map((item) => (
                <div key={item.title} className="flex flex-col items-start gap-3 rounded-md border border-gray-200 bg-stone px-5 py-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
                    <item.icon size={18} aria-hidden="true" />
                  </span>
                  <Text className="font-display font-semibold text-ink">{item.title}</Text>
                  <Text variant="small" muted>
                    {item.description}
                  </Text>
                </div>
              ))}
            </div>
            <ButtonLink
              href={COMPANY_PROFILE_PATH}
              download="MENASCO-Company-Profile.pdf"
              variant="outline"
              leadingIcon={Download}
              className="w-fit"
            >
              {t('services:manufacturingPage.downloadCompanyProfile')}
            </ButtonLink>
          </Stack>
        </Section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <SectionThemeContext.Provider value="dark">
          <section className="bg-gradient-to-br from-brand-800 via-brand-900 to-ink py-16 md:py-24">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <Heading level="h2" as="h3" theme="dark">
                  {t('services:manufacturingPage.closing.heading')}
                </Heading>
                <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
                  {t('services:manufacturingPage.closing.description')}
                </Text>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <ButtonLink href="/projects/categories" variant="primary" trailingIcon={ArrowRight}>
                    {t('services:manufacturingPage.closing.cta')}
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
