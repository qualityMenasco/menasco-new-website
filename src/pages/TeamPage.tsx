import { ArrowRight, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack, Row } from '../components/layout/Stack';
import { SectionHeader } from '../components/typography/SectionHeader';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ButtonLink } from '../components/ui/Button';
import { LeadershipTeamCard } from '../components/cards/LeadershipTeamCard';
import { ScrollReveal, ScrollRevealGroup } from '../components/common/ScrollReveal';
import { cn } from '../lib/utils';
import { executiveTeam, leadershipProfiles, type LeadershipProfile } from '../data/leadership';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

/** English data.ts strings stay the fallback; about.json's `team`/`leadershipProfiles` supply Arabic. Same overlay pattern as getProjectField. */
function overlay(t: (key: string) => string, key: string, fallback: string) {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

const bahaaProfile = leadershipProfiles.find((profile) => profile.slug === 'bahaa-badawiyeh')!;
const helmiProfile = leadershipProfiles.find((profile) => profile.slug === 'helmi-badawiyeh')!;

const executiveLeadership = executiveTeam.filter((member) => member.group === 'executive');
const engineeringAndSupportLeads = executiveTeam.filter((member) => member.group === 'engineering-support');

interface FeaturedLeaderProps {
  profile: LeadershipProfile;
  imageSide: 'left' | 'right';
}

/** Large editorial profile for the two most senior leaders — portrait, full message, LinkedIn, and a link to their complete dedicated page. */
function FeaturedLeader({ profile, imageSide }: FeaturedLeaderProps) {
  const { t } = useTranslation('about');
  const imageFirst = imageSide === 'left';
  const isBahaa = profile.slug === 'bahaa-badawiyeh';

  const base = `leadershipProfiles.${profile.slug}`;
  const fullRole = overlay(t, `${base}.fullRole`, profile.fullRole);
  const messageEyebrow = overlay(t, `${base}.messageEyebrow`, profile.messageEyebrow);
  const translatedParagraphs = t(`${base}.messageParagraphs`, { returnObjects: true, defaultValue: profile.messageParagraphs }) as string[];
  const closingLine = profile.closingLine ? overlay(t, `${base}.closingLine`, profile.closingLine) : undefined;

  // Both messages are excerpted to keep the text block from growing
  // unbounded — each links through to the complete, unedited message/bio on
  // their own dedicated page (nothing here is shortened permanently; the
  // full text still exists in full there).
  const paragraphs = translatedParagraphs.slice(0, isBahaa ? 4 : 3);

  const imageBlock = (
    <div className={cn('aspect-[4/5] w-full max-w-[22rem] overflow-hidden rounded-md border border-gray-200 bg-gray-100 shadow-soft', imageFirst ? 'mx-auto md:mx-0' : 'mx-auto md:ml-auto md:mr-0')}>
      <img
        src={profile.photo}
        alt={t('team.portraitAlt', { name: profile.fullName, role: fullRole, defaultValue: `Portrait of ${profile.fullName}, ${fullRole} of MENASCO` })}
        className="h-full w-full object-cover"
      />
    </div>
  );

  const textBlock = (
    <div className="flex flex-col gap-3.5">
      <Eyebrow>{messageEyebrow}</Eyebrow>
      <div>
        <Heading level="h2" as="h3">
          {profile.fullName}
        </Heading>
        <Text variant="body-lg" className="mt-1 font-semibold text-brand-600">
          {fullRole}
        </Text>
      </div>
      <Stack space="xs">
        {paragraphs.map((paragraph, index) => (
          <Text key={index} variant="body" className="text-[0.9375rem] leading-[1.55]">
            {paragraph}
          </Text>
        ))}
        {isBahaa && closingLine && (
          <Text
            variant="body"
            className="mt-3 border-s-2 border-brand-500 ps-4 text-[0.9375rem] font-semibold leading-[1.55] text-ink"
          >
            {closingLine}
          </Text>
        )}
      </Stack>
      <Row space="md" wrap className="pt-1">
        <ButtonLink href={`/leadership/${profile.slug}`} variant="primary" trailingIcon={ArrowRight}>
          {isBahaa ? t('team.readFullProfile') : t('team.readFounderMessage')}
        </ButtonLink>
        {profile.linkedinHref && (
          <ButtonLink href={profile.linkedinHref} variant="outline" leadingIcon={Linkedin}>
            LinkedIn
          </ButtonLink>
        )}
      </Row>
    </div>
  );

  // The narrow/wide grid tracks are assigned directly via grid-template-columns
  // (not via `order`, which would reorder auto-placement on this asymmetric
  // template and put the wrong block in the wrong track) so the portrait
  // always lands in the narrow track and the text always lands in the wide
  // one, however the two are arranged in the DOM.
  return (
    <div
      className={cn(
        'grid grid-cols-1 items-start gap-8 md:gap-10 lg:gap-12',
        imageFirst ? 'md:grid-cols-[3fr_5fr]' : 'md:grid-cols-[5fr_3fr]',
      )}
    >
      {imageFirst ? (
        <>
          {imageBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {imageBlock}
        </>
      )}
    </div>
  );
}

function TeamMemberCard({ member }: { member: (typeof executiveTeam)[number] }) {
  const { t } = useTranslation('about');
  const translatedTitle = overlay(t, `team.titles.${member.title}`, member.title);
  const translatedBio = member.bio
    ? (t(`team.bios.${member.name}`, { returnObjects: true, defaultValue: member.bio }) as string[])
    : undefined;
  const photoAlt = t('team.portraitAlt', { name: member.name, role: translatedTitle, defaultValue: member.photoAlt });

  return (
    <LeadershipTeamCard
      photo={member.photo}
      photoAlt={photoAlt}
      name={member.name}
      title={translatedTitle}
      linkedinHref={member.linkedinHref}
      profileHref={member.profileHref}
      bio={translatedBio}
    />
  );
}

export default function TeamPage() {
  const { t } = useTranslation('about');

  return (
    <>
      <SEO
        title={t('team.seo.title')}
        description={t('team.seo.description')}
        path="/team"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Team', path: '/team' }]}
      />

      {/* Featured Leadership */}
      <Section spacing="lg" background="warmwhite">
        <Stack space="xl">
          <Stack space="sm">
            <SectionHeader
              eyebrow={t('team.featured.eyebrow')}
              heading={t('team.featured.heading')}
              headingAs="h2"
              description={t('team.featured.description')}
            />
          </Stack>
          <ScrollReveal>
            <FeaturedLeader profile={helmiProfile} imageSide="left" />
          </ScrollReveal>
          <ScrollReveal>
            <div className="border-t border-gray-200 pt-14">
              <FeaturedLeader profile={bahaaProfile} imageSide="right" />
            </div>
          </ScrollReveal>
        </Stack>
      </Section>

      {/* Executive Leadership */}
      <Section spacing="lg" background="stone" edgeFade>
        <Stack space="lg">
          <SectionHeader
            eyebrow={t('team.executive.eyebrow')}
            heading={t('team.executive.heading')}
            headingAs="h3"
            description={t('team.executive.description')}
          />
          <ScrollRevealGroup amount="some" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
            {executiveLeadership.map((member) => (
              <TeamMemberCard key={member.name} member={member} />
            ))}
          </ScrollRevealGroup>
        </Stack>
      </Section>

      {/* Engineering and Support Leads */}
      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <SectionHeader
            eyebrow={t('team.engineeringSupport.eyebrow')}
            heading={t('team.engineeringSupport.heading')}
            headingAs="h3"
            description={t('team.engineeringSupport.description')}
          />
          <ScrollRevealGroup amount="some" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {engineeringAndSupportLeads.map((member) => (
              <TeamMemberCard key={member.name} member={member} />
            ))}
          </ScrollRevealGroup>
        </Stack>
      </Section>
    </>
  );
}
