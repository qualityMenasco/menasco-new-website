import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Text } from '../components/typography/Typography';
import { ButtonLink } from '../components/ui/Button';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { LeadershipHero } from '../components/sections/leadership/LeadershipHero';
import { LeadershipProfileCTA } from '../components/sections/leadership/LeadershipProfileCTA';
import { NavSectionH1 } from '../components/typography/NavSectionH1';
import { getLeadershipProfile } from '../data/leadership';
import { SEO } from '../seo/SEO';
import { personEntity } from '../seo/structuredData';
import { SITE_URL } from '../seo/constants';

const profile = getLeadershipProfile('helmi-badawiyeh')!;

/** English data.ts strings stay the fallback; about.json's `leadershipProfiles.<slug>`/`team` supply Arabic. Same overlay pattern as getProjectField. */
function overlay(t: (key: string) => string, key: string, fallback: string) {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export default function HelmiBadawiyehPage() {
  const { t } = useTranslation('about');
  const base = `leadershipProfiles.${profile.slug}`;
  const fullRole = overlay(t, `${base}.fullRole`, profile.fullRole);
  const messageEyebrow = overlay(t, `${base}.messageEyebrow`, profile.messageEyebrow);
  const messageParagraphs = t(`${base}.messageParagraphs`, { returnObjects: true, defaultValue: profile.messageParagraphs }) as string[];
  const seoTitle = overlay(t, `${base}.seoTitle`, 'Eng. Helmi Badawiyeh, Founder');
  const seoDescription = overlay(
    t,
    `${base}.seoDescription`,
    "Learn about Eng. Helmi Badawiyeh, Founder and General Manager of MENASCO, and his vision for quality, long-term value, and engineering excellence.",
  );
  const heroIntro = overlay(
    t,
    `${base}.heroIntro`,
    "A message from the founder of MENASCO on the company's journey, values, technical expertise, and commitment to long-term growth.",
  );

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={seoTitle}
        description={seoDescription}
        path="/leadership/helmi-badawiyeh"
        mainEntity={personEntity({
          name: profile.fullName,
          jobTitle: fullRole,
          url: `${SITE_URL}/leadership/helmi-badawiyeh`,
          image: profile.photo ? `${SITE_URL}${profile.photo}` : undefined,
          sameAs: profile.linkedinHref ? [profile.linkedinHref] : undefined,
        })}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'About', path: '/about' },
          { label: 'Leadership', path: '/about' },
          { label: profile.fullName, path: '/leadership/helmi-badawiyeh' },
        ]}
      />

      <LeadershipHero
        personName={profile.fullName}
        photo={profile.photo}
        photoAlt={t('team.portraitAlt', { name: profile.fullName, role: fullRole, defaultValue: `Portrait of ${profile.fullName}, ${fullRole} of MENASCO` })}
        eyebrow={messageEyebrow}
        role={fullRole}
      >
        <Text variant="body-lg" muted>
          {heroIntro}
        </Text>
      </LeadershipHero>

      <ScrollReveal>
        <Section background="stone" spacing="lg" edgeFade>
          <div className="mx-auto max-w-2xl">
            <Stack space="lg">
              <Eyebrow>{t('team.messageFromFounder')}</Eyebrow>

              <div className="relative pt-6 sm:pt-8">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-1 top-0 select-none font-display text-[3.5rem] leading-none text-brand-200 sm:text-[4.5rem]"
                >
                  &ldquo;
                </span>
                <Stack space="sm" className="relative">
                  {messageParagraphs.map((paragraph, index) => (
                    <Text key={index} variant="body-lg" className="whitespace-pre-line leading-relaxed">
                      {paragraph}
                    </Text>
                  ))}
                </Stack>
              </div>

              <div className="border-t border-gray-300 pt-6">
                <Text variant="body-lg" muted>
                  {t('team.regards')}
                </Text>
                <Text variant="body-lg" className="mt-3 font-display font-semibold text-ink">
                  {profile.fullName}
                </Text>
                <Text variant="small" muted>
                  {fullRole}
                </Text>
                <Text variant="small" muted>
                  MENASCO Mechanical Contracting LLC
                </Text>
              </div>

              <div className="pt-2">
                <ButtonLink href="/team" variant="primary" trailingIcon={ArrowRight}>
                  {t('team.meetOurLeadership')}
                </ButtonLink>
              </div>
            </Stack>
          </div>
        </Section>
      </ScrollReveal>

      <LeadershipProfileCTA />
    </>
  );
}
