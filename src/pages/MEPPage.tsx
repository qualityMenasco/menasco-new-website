import { ArrowRight, Boxes, CheckCircle2, ClipboardCheck, Download, Droplet, Flame, Gauge, ShieldCheck, Wind, Zap } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ButtonLink } from '../components/ui/Button';
import { SmartLink } from '../lib/SmartLink';
import { ScrollReveal, ScrollRevealGroup } from '../components/common/ScrollReveal';
import { SectionThemeContext } from '../lib/theme-context';
import { useTranslation } from 'react-i18next';
import { COMPANY_PROFILE_PATH, SITE_URL } from '../seo/constants';
import { SEO } from '../seo/SEO';
import { serviceEntity } from '../seo/structuredData';
import type { IconComponent } from '../types';

const capabilityIcons: IconComponent[] = [Wind, Zap, Droplet, Flame, Boxes, CheckCircle2];
const qualityIcons: IconComponent[] = [ShieldCheck, ClipboardCheck, Gauge, CheckCircle2];

// Use the shared ProjectHeroBanner for the full-bleed service hero.
import { ProjectHeroBanner } from '../components/projects/ProjectHeroBanner';

interface TitleDescription {
  title: string;
  description: string;
}

interface DisciplineLink extends TitleDescription {
  href: string;
}

export default function MEPPage() {
  const { t } = useTranslation(['services']);
  const capabilities = (t('services:mepPage.capabilities', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: capabilityIcons[index] }),
  );
  const qualityHighlights = (t('services:mepPage.qualityHighlights', { returnObjects: true }) as TitleDescription[]).map(
    (item, index) => ({ ...item, icon: qualityIcons[index] }),
  );
  const disciplines = t('services:mepPage.disciplines.items', { returnObjects: true }) as DisciplineLink[];

  return (
    <>
      <SEO
        title={t('services:mepPage.seo.title')}
        description={t('services:mepPage.seo.description')}
        path="/services/mep"
        mainEntity={serviceEntity({
          name: t('services:mepPage.seo.title'),
          description: t('services:mepPage.seo.description'),
          url: `${SITE_URL}/services/mep`,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Services', path: '/services' },
          { label: 'MEP', path: '/services/mep' },
        ]}
      />

      <ProjectHeroBanner
        image="/electrical-switchgear-room.jpg"
        title={t('services:mepPage.hero.title')}
        description={t('services:mepPage.hero.description')}
        ctaLabel={t('services:detail.downloadCompanyProfile')}
        ctaHref={COMPANY_PROFILE_PATH}
        ctaDownload="MENASCO-Company-Profile.pdf"
      />

      {/* Overview — text left, premium image right, matching the established two-column editorial layout used across About/Innovation. */}
      <ScrollReveal>
        <Section background="warmwhite" spacing="lg" edgeFade>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Stack space="sm" as="article">
              <Eyebrow>{t('services:mepPage.overview.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:mepPage.overview.heading')}
              </Heading>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:mepPage.overview.paragraph1')}
              </Text>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:mepPage.overview.paragraph2')}
              </Text>
            </Stack>
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
              <img
                src="/mechanical-plant-room.jpg"
                alt="MEP plant room coordinated by MENASCO's in-house engineering team"
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
              <Eyebrow>{t('services:mepPage.capabilitiesSection.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:mepPage.capabilitiesSection.heading')}
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

      {/* Our disciplines — dark full-width section for visual rhythm, text left + clickable discipline cards right, linking out to each real service page. */}
      <ScrollReveal>
        <Section background="ink" spacing="lg" edgeFade>
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <Stack space="sm" as="article">
              <Eyebrow theme="dark">{t('services:mepPage.disciplines.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3" theme="dark">
                {t('services:mepPage.disciplines.heading')}
              </Heading>
              <Text variant="body-lg" theme="dark" className="leading-relaxed text-gray-300">
                {t('services:mepPage.disciplines.paragraph1')}
              </Text>
            </Stack>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {disciplines.map((discipline) => (
                <SmartLink
                  key={discipline.title}
                  href={discipline.href}
                  className="group flex flex-col gap-1 rounded-md border border-white/10 bg-white/[0.03] p-5 transition-colors duration-base hover:border-brand-400/40 hover:bg-white/[0.06]"
                >
                  <span className="flex items-center justify-between gap-2 font-display font-semibold text-warmwhite">
                    {discipline.title}
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 text-gray-400 transition-transform duration-base group-hover:translate-x-0.5 group-hover:text-brand-400 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    />
                  </span>
                  <span className="text-small text-gray-400">{discipline.description}</span>
                </SmartLink>
              ))}
            </div>
          </div>
        </Section>
      </ScrollReveal>

      {/* Quality through coordination — paragraph + four highlight cards below. */}
      <ScrollReveal>
        <Section background="warmwhite" spacing="lg" edgeFade>
          <Stack space="xl">
            <Stack space="sm" className="max-w-3xl">
              <Eyebrow>{t('services:mepPage.qualitySection.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3">
                {t('services:mepPage.qualitySection.heading')}
              </Heading>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:mepPage.qualitySection.paragraph1')}
              </Text>
              <Text variant="body-lg" className="leading-relaxed">
                {t('services:mepPage.qualitySection.paragraph2')}
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
              {t('services:mepPage.downloadCompanyProfile')}
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
                  {t('services:mepPage.closing.heading')}
                </Heading>
                <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
                  {t('services:mepPage.closing.description')}
                </Text>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <ButtonLink href="/projects/categories" variant="primary" trailingIcon={ArrowRight}>
                    {t('services:mepPage.closing.cta')}
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
