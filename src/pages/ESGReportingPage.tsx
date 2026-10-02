import { Globe, HardHat, HeartHandshake, Landmark, Leaf, Scale, TrendingUp, Users, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ScrollReveal, ScrollRevealGroup } from '../components/common/ScrollReveal';
import { SectionThemeContext } from '../lib/theme-context';
import { useTransparentHeader } from '../app/header-transparency';
import type { IconComponent } from '../types';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

interface PillarSection {
  heading: string;
  paragraphs: string[];
}

const pillarIcons: IconComponent[] = [Leaf, HeartHandshake, Scale, TrendingUp];
const highlightIcons: IconComponent[] = [Zap, HardHat, HeartHandshake, Landmark, Globe, Users];

function ESGHero() {
  const { t } = useTranslation('about');
  useTransparentHeader(true);
  return (
    <section className="relative flex min-h-[60vh] scroll-mt-24 items-end overflow-hidden bg-ink md:min-h-[65vh]">
      <img
        src="/esg-hero.jpg"
        alt="MENASCO team reviewing sustainable engineering plans on site"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent rtl:bg-gradient-to-l" />

      <Container className="relative z-10 pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="max-w-3xl">
          <Eyebrow theme="dark">{t('esg.hero.eyebrow')}</Eyebrow>
          <Heading level="display" as="h2" theme="dark" className="mt-4">
            {t('esg.hero.heading')}
          </Heading>
          <Text variant="body-lg" theme="dark" className="mt-6 max-w-xl text-gray-200">
            {t('esg.hero.description')}
          </Text>
        </div>
      </Container>
    </section>
  );
}

export default function ESGReportingPage() {
  const { t } = useTranslation('about');
  const pillars = (t('esg.pillars', { returnObjects: true }) as PillarSection[]).map((pillar, index) => ({
    ...pillar,
    icon: pillarIcons[index],
  }));
  const highlights = (t('esg.highlights', { returnObjects: true }) as { title: string; description: string }[]).map((highlight, index) => ({
    ...highlight,
    icon: highlightIcons[index],
  }));

  return (
    <>
      <SEO
        title={t('esg.seo.title')}
        description={t('esg.seo.description')}
        path="/esg-reporting"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'ESG Reporting', path: '/esg-reporting' },
        ]}
      />

      <ESGHero />

      <ScrollReveal>
        <Section spacing="md" background="stone" edgeFade>
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-x-8 md:gap-y-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.heading}
                className="flex flex-col gap-4 rounded-md border border-gray-200 bg-stone p-6 transition-colors duration-base ease-engineered hover:border-gray-300"
              >
                <div className="flex gap-4">
                  <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
                    <pillar.icon size={18} aria-hidden="true" />
                  </span>
                  <Stack space="xs">
                    <Heading level="h4" as="h3">
                      {pillar.heading}
                    </Heading>
                    {pillar.paragraphs.map((paragraph, index) => (
                      <Text key={index} variant="body">
                        {paragraph}
                      </Text>
                    ))}
                  </Stack>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <Section spacing="lg" background="warmwhite" edgeFade>
          <Stack space="xl">
            <Stack space="sm" className="max-w-2xl">
              <Heading level="h2" as="h3">
                {t('esg.highlightsHeading')}
              </Heading>
            </Stack>
            <ScrollRevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {highlights.map((highlight) => (
                <div key={highlight.title} className="flex flex-col gap-4 rounded-md border border-gray-200 bg-warmwhite p-6">
                  <div>
                    <Text className="font-display font-semibold text-ink">{highlight.title}</Text>
                    <Text variant="small" muted className="mt-1">
                      {highlight.description}
                    </Text>
                  </div>
                </div>
              ))}
            </ScrollRevealGroup>
          </Stack>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <SectionThemeContext.Provider value="dark">
          <section className="bg-gradient-to-br from-brand-800 via-brand-900 to-ink py-16 md:py-24">
            <Container>
              <div className="mx-auto max-w-2xl text-center">
                <Heading level="h1" as="h3" theme="dark">
                  {t('esg.closing.heading')}
                </Heading>
                <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
                  {t('esg.closing.description')}
                </Text>
              </div>
            </Container>
          </section>
        </SectionThemeContext.Provider>
      </ScrollReveal>
    </>
  );
}
