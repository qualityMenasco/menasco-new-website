import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { FeaturedLeadershipCarousel } from '../components/FeaturedLeadershipCarousel';
import { MobileLeadershipCard } from '../components/MobileLeadershipCard';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { executiveTeam, leadershipProfiles, type LeadershipProfile } from '../../data/leadership';

const bahaaProfile = leadershipProfiles.find((profile) => profile.slug === 'bahaa-badawiyeh')!;
const helmiProfile = leadershipProfiles.find((profile) => profile.slug === 'helmi-badawiyeh')!;
const executiveLeadership = executiveTeam.filter((member) => member.group === 'executive');
const engineeringAndSupportLeads = executiveTeam.filter((member) => member.group === 'engineering-support');

/** English data.ts strings stay the fallback; about.json's `leadershipProfiles.<slug>`/`team` supply Arabic. Same overlay pattern as getProjectField. */
function overlay(t: (key: string) => string, key: string, fallback: string) {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

/**
 * Builds a fully-translated copy of a leadership profile so downstream
 * components (FeaturedLeadershipCarousel, MobileFeaturedLeaderCard,
 * LeadershipProfileModal) can keep reading straight from `profile.*` without
 * each needing its own translation wiring.
 */
function translateProfile(t: (key: string, options?: Record<string, unknown>) => unknown, profile: LeadershipProfile): LeadershipProfile {
  const base = `leadershipProfiles.${profile.slug}`;
  return {
    ...profile,
    fullRole: overlay(t as (key: string) => string, `${base}.fullRole`, profile.fullRole),
    role: overlay(t as (key: string) => string, `team.titles.${profile.role}`, profile.role),
    messageEyebrow: overlay(t as (key: string) => string, `${base}.messageEyebrow`, profile.messageEyebrow),
    messageParagraphs: t(`${base}.messageParagraphs`, { returnObjects: true, defaultValue: profile.messageParagraphs }) as string[],
    closingLine: profile.closingLine ? overlay(t as (key: string) => string, `${base}.closingLine`, profile.closingLine) : undefined,
  };
}

export default function TeamPage() {
  const { t } = useTranslation('about');
  const translatedHelmi = translateProfile(t, helmiProfile);
  const translatedBahaa = translateProfile(t, bahaaProfile);
  const translatedTitle = (title: string) => overlay(t, `team.titles.${title}`, title);

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={t('team.seo.title')}
        description={t('team.seo.description')}
        path="/team"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Team', path: '/team' }]}
      />

      {/* Featured Leadership */}
      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('team.featured.eyebrow')}
          heading={t('team.featured.heading')}
          headingAs="h2"
          description={t('team.featured.description')}
        />
        <div className="mt-5">
          <FeaturedLeadershipCarousel leaders={[translatedHelmi, translatedBahaa]} />
        </div>
      </section>

      {/* Executive Leadership */}
      <section className="bg-stone px-4 py-8">
        <SectionHeader eyebrow={t('team.executive.eyebrow')} heading={t('team.executive.heading')} headingAs="h3" description={t('team.executive.description')} />
        <div className="mt-5 grid grid-cols-2 gap-3">
          {executiveLeadership.map((member) => (
            <MobileLeadershipCard
              key={member.name}
              photo={member.photo}
              photoAlt={t('team.portraitAlt', { name: member.name, role: translatedTitle(member.title), defaultValue: member.photoAlt })}
              name={member.name}
              title={translatedTitle(member.title)}
              linkedinHref={member.linkedinHref}
            />
          ))}
        </div>
      </section>

      {/* Engineering and Support Leads */}
      <section className="px-4 py-8">
        <SectionHeader eyebrow={t('team.engineeringSupport.eyebrow')} heading={t('team.engineeringSupport.heading')} headingAs="h3" description={t('team.engineeringSupport.description')} />
        <div className="mt-5 grid grid-cols-2 gap-3">
          {engineeringAndSupportLeads.map((member) => (
            <MobileLeadershipCard
              key={member.name}
              photo={member.photo}
              photoAlt={t('team.portraitAlt', { name: member.name, role: translatedTitle(member.title), defaultValue: member.photoAlt })}
              name={member.name}
              title={translatedTitle(member.title)}
              linkedinHref={member.linkedinHref}
            />
          ))}
        </div>
      </section>
    </>
  );
}
