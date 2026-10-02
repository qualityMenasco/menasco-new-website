import { HeartHandshake, Layers, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Container } from '../components/layout/Container';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ScrollReveal, ScrollRevealGroup } from '../components/common/ScrollReveal';
import { LeadershipHero } from '../components/sections/leadership/LeadershipHero';
import { LeadershipProfileCTA } from '../components/sections/leadership/LeadershipProfileCTA';
import { NavSectionH1 } from '../components/typography/NavSectionH1';
import { getLeadershipProfile } from '../data/leadership';
import { placeholderImages } from '../data/images';
import { SEO } from '../seo/SEO';
import { personEntity } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';

const profile = getLeadershipProfile('bahaa-badawiyeh')!;

const PAGE_TITLE = "Building MENASCO's Legacy of Engineering Excellence";

const pillarIcons = [TrendingUp, Layers, HeartHandshake];
const pillars = [
  {
    icon: TrendingUp,
    title: 'Strategic Growth',
    description:
      "Guiding MENASCO's regional expansion and strengthening the company's position across key engineering markets.",
  },
  {
    icon: Layers,
    title: 'Innovation & Integration',
    description:
      'Advancing technical capability, digital coordination, operational efficiency, and vertical integration through initiatives such as MACS.',
  },
  {
    icon: HeartHandshake,
    title: 'People & Purpose',
    description: 'Building a culture rooted in teamwork, ethics, transparency, inclusion, and shared responsibility.',
  },
];

/** English data.ts/local strings stay the fallback; about.json's `leadershipProfiles.<slug>`/`team` supply Arabic. Same overlay pattern as getProjectField. */
function overlay(t: (key: string) => string, key: string, fallback: string) {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export default function BahaaBadawiyehPage() {
  const { t } = useTranslation('about');
  const base = `leadershipProfiles.${profile.slug}`;
  const fullRole = overlay(t, `${base}.fullRole`, profile.fullRole);
  const messageEyebrow = overlay(t, `${base}.messageEyebrow`, profile.messageEyebrow);
  const bioParagraphs = t(`${base}.messageParagraphs`, { returnObjects: true, defaultValue: profile.messageParagraphs }) as string[];
  const closingLine = overlay(t, `${base}.closingLine`, profile.closingLine!);
  const seoTitle = overlay(t, `${base}.seoTitle`, 'Eng. Bahaa H. Badawiyeh, CEO');
  const seoDescription = overlay(
    t,
    `${base}.seoDescription`,
    'Meet Eng. Bahaa H. Badawiyeh, CEO of MENASCO, and explore his leadership approach to innovation, regional growth, sustainability, and engineering excellence.',
  );
  const pageTitle = overlay(t, `${base}.pageTitle`, PAGE_TITLE);
  const heroIntro = overlay(
    t,
    `${base}.heroIntro`,
    'Leading MENASCO through innovation-driven growth, operational excellence, and a people-first engineering culture.',
  );
  const pullQuote = overlay(
    t,
    `${base}.pullQuote`,
    'True engineering leadership is not only about building systems. It is about building innovation, integrity, sustainability, and a better tomorrow.',
  );
  const pillarsEyebrow = overlay(t, `${base}.pillarsEyebrow`, 'Leadership Pillars');
  const pillarsHeading = overlay(t, `${base}.pillarsHeading`, 'What Guides His Leadership');
  const translatedPillars = (
    t(`${base}.pillars`, { returnObjects: true, defaultValue: pillars }) as { title: string; description: string }[]
  ).map((pillar, index) => ({ ...pillar, icon: pillarIcons[index] }));

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={seoTitle}
        description={seoDescription}
        path="/leadership/bahaa-badawiyeh"
        mainEntity={personEntity({
          name: profile.fullName,
          jobTitle: fullRole,
          url: `${SITE_URL}/leadership/bahaa-badawiyeh`,
          image: profile.photo ? `${SITE_URL}${profile.photo}` : undefined,
          sameAs: profile.linkedinHref ? [profile.linkedinHref] : undefined,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'About', path: '/about' },
          { label: 'Leadership', path: '/about' },
          { label: profile.fullName, path: '/leadership/bahaa-badawiyeh' },
        ]}
      />

      <LeadershipHero
        personName={profile.fullName}
        photo={profile.photo}
        photoAlt={t('team.portraitAlt', { name: profile.fullName, role: fullRole, defaultValue: `Portrait of ${profile.fullName}, ${fullRole} of MENASCO` })}
        eyebrow={messageEyebrow}
        role={fullRole}
      >
        <Text as="p" className="font-display text-h3 font-semibold text-ink">
          {pageTitle}
        </Text>
        <Text variant="body-lg" muted>
          {heroIntro}
        </Text>
      </LeadershipHero>

      <ScrollReveal>
        <Section background="warmwhite" spacing="lg" edgeFade>
          <div className="mx-auto max-w-3xl">
            <Stack space="lg">
              <Heading level="h2" as="h3">
                {pageTitle}
              </Heading>
              <Stack space="sm">
                {bioParagraphs.map((paragraph, index) => (
                  <Text key={index} variant="body-lg" className="whitespace-pre-line leading-relaxed">
                    {paragraph}
                  </Text>
                ))}
              </Stack>
              <Text variant="body-lg" className="border-s-2 border-brand-500 ps-4 font-semibold text-ink">
                {closingLine}
              </Text>
            </Stack>
          </div>
        </Section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="relative overflow-hidden bg-ink py-20 md:py-28">
          <img
            src={placeholderImages.dubaiSkylineNight}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/85 to-ink" />
          <Container className="relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <span aria-hidden="true" className="mx-auto mb-4 block h-0.5 w-16 bg-brand-500" />
              <span aria-hidden="true" className="block font-display text-h1 leading-none text-brand-400">
                &ldquo;
              </span>
              <Text
                as="blockquote"
                theme="dark"
                className="mt-2 font-display text-h1 font-semibold leading-tight tracking-tight text-warmwhite"
              >
                {pullQuote}
              </Text>
              <Text variant="body-lg" theme="dark" className="mt-8 font-semibold text-warmwhite">
                {profile.fullName}
              </Text>
              <Text variant="small" theme="dark" muted>
                {fullRole}, MENASCO
              </Text>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <Section background="stone" spacing="lg" edgeFade>
          <Stack space="xl">
            <Stack space="sm" className="max-w-2xl">
              <Eyebrow>{pillarsEyebrow}</Eyebrow>
              <Heading level="h2" as="h3">
                {pillarsHeading}
              </Heading>
            </Stack>
            <ScrollRevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-8">
              {translatedPillars.map((pillar) => (
                <div key={pillar.title} className="flex h-full flex-col gap-4 rounded-md border border-gray-200 bg-warmwhite p-6 md:p-7">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-stone text-brand-600">
                    <pillar.icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <Text className="font-display font-semibold text-ink">{pillar.title}</Text>
                    <Text variant="small" muted className="mt-1">
                      {pillar.description}
                    </Text>
                  </div>
                </div>
              ))}
            </ScrollRevealGroup>
          </Stack>
        </Section>
      </ScrollReveal>

      <LeadershipProfileCTA />
    </>
  );
}
