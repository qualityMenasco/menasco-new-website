import { ArrowRight, Compass, Download, HardHat, ClipboardCheck, ClipboardList, Gauge, ShieldCheck, Settings2, Truck } from 'lucide-react';
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

const capabilityIcons: IconComponent[] = [Compass, Truck, HardHat, Settings2, ClipboardList, ShieldCheck];
const qualityIcons: IconComponent[] = [Compass, ClipboardCheck, Gauge, ShieldCheck];

// Use the shared ProjectHeroBanner for the full-bleed service hero.
import { ProjectHeroBanner } from '../components/projects/ProjectHeroBanner';

interface TitleDescription {
  title: string;
  description: string;
}

export default function EPCPage() {
  const { t } = useTranslation(['services']);
  const capabilities = (t('services:epcPage.capabilities', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: capabilityIcons[index] }),
  );
  const qualityHighlights = (t('services:epcPage.qualityHighlights', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: qualityIcons[index] }),
  );
  const benefits = t('services:epcPage.benefits', { returnObjects: true }) as string[];

  return (
    <>
      <SEO
        title={t('services:epcPage.seo.title')}
        description={t('services:epcPage.seo.description')}
        path="/services/turnkey-developments"
        mainEntity={serviceEntity({
          name: t('services:epcPage.seo.title'),
          description: t('services:epcPage.seo.description'),
          url: `${SITE_URL}/services/turnkey-developments`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'EPC', path: '/services/turnkey-developments' },
        ]}
      />

      <ProjectHeroBanner
        image="/Mechanical_Floor_Volante-2-2-3.jpg"
        title={t('services:epcPage.hero.title')}
        description={t('services:epcPage.hero.description')}
        ctaLabel={t('services:detail.downloadCompanyProfile')}
        ctaHref={COMPANY_PROFILE_PATH}
        ctaDownload="MENASCO-Company-Profile.pdf"
      />

      {/* Overview — text left, premium image right, matching the established two-column editorial layout used across About/Innovation. */}
      <ScrollReveal>
        <Section background="warmwhite" spacing="lg" edgeFade>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Stack space="sm" as="article">
              <Eyebrow>{t('services:epcPage.overview.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:epcPage.overview.heading')}
              </Heading>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:epcPage.overview.paragraph1')}
              </Text>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:epcPage.overview.paragraph2')}
              </Text>
            </Stack>
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
              <img
                src="/company-intro-mep-hero.jpg"
                alt="MENASCO engineers coordinating MEP design and site delivery"
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
              <Eyebrow>{t('services:epcPage.capabilitiesSection.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:epcPage.capabilitiesSection.heading')}
              </Heading>
            </Stack>
            <ScrollRevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {capabilities.map((capability) => (
                <div key={capability.title} className="flex flex-col gap-4 rounded-md border border-gray-200 bg-warmwhite p-6 sm:min-h-[240px]">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-stone text-brand-600">
                    <capability.icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <Text className="min-h-[3.3rem] font-display font-semibold text-ink">{capability.title}</Text>
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

      {/* Integrated delivery model — dark full-width section for visual rhythm, text left + benefits list right. */}
      <ScrollReveal>
        <Section background="ink" spacing="lg" edgeFade>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <Stack space="sm" as="article">
              <Eyebrow theme="dark">{t('services:epcPage.integratedDelivery.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3" theme="dark">
                {t('services:epcPage.integratedDelivery.heading')}
              </Heading>
              <Text variant="body-lg" theme="dark" className="leading-relaxed text-gray-300">
                {t('services:epcPage.integratedDelivery.paragraph1')}
              </Text>
              <Text variant="body-lg" theme="dark" className="leading-relaxed text-gray-300">
                {t('services:epcPage.integratedDelivery.paragraph2')}
              </Text>
            </Stack>
            <Stack space="sm" className="lg:mt-11">
              <Text theme="dark" className="font-display font-semibold uppercase tracking-wide text-warmwhite">
                {t('services:epcPage.integratedDelivery.benefitsLabel')}
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

      {/* Quality across the full scope — paragraph + four highlight cards below. */}
      <ScrollReveal>
        <Section background="warmwhite" spacing="lg" edgeFade>
          <Stack space="xl">
            <Stack space="sm" className="max-w-3xl">
              <Eyebrow>{t('services:epcPage.qualitySection.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:epcPage.qualitySection.heading')}
              </Heading>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:epcPage.qualitySection.paragraph1')}
              </Text>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:epcPage.qualitySection.paragraph2')}
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
              {t('services:epcPage.downloadCompanyProfile')}
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
                  {t('services:epcPage.closing.heading')}
                </Heading>
                <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
                  {t('services:epcPage.closing.description')}
                </Text>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <ButtonLink href="/projects/categories" variant="primary" trailingIcon={ArrowRight}>
                    {t('services:epcPage.closing.cta')}
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
