import { ArrowRight, Cpu, FileText, Users, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { ExpandableText } from '../components/ExpandableText';
import { MobileStatsGrid } from '../components/MobileStatsGrid';
import { LocaleLink } from '../components/LocaleLink';
import { PhotoWithVideo } from '../../components/sections/community/PhotoWithVideo';
import { leadershipProfiles } from '../../data/leadership';
import credentials, { type Credential } from '../../data/credentials';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';

/** Same values, in the same order, as the desktop VisionMissionValues section. */
const valueKeys = ['innovation', 'integrity', 'excellence'] as const;

const credentialIcons: Record<Credential['icon'], LucideIcon> = { document: FileText, people: Users, chip: Cpu };

export default function AboutPage() {
  const { t } = useTranslation(['about', 'common']);

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path="/about"
        pageType="AboutPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'About', path: '/about' }]}
      />

      {/* Phones stack heading, cover photo, copy. Tablets put the copy beside a
          portrait cover photo (same children, placed on a two-column grid). */}
      <section className="grid px-4 py-8 md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-x-8 md:py-12">
        <SectionHeader eyebrow={t('whoWeAre.eyebrow')} heading={t('whoWeAre.heading')} headingAs="h2" />
        {/* The desktop header's people film behind a cover photo: only the photo loads
            until it's tapped, then the film plays full screen (it's a silent clip). */}
        <PhotoWithVideo
          image={{ src: '/about/approach-engineer.jpg', alt: t('hero.filmAlt') }}
          video="/about/about-hero-film.mp4"
          hasAudio={false}
          className="mt-5 aspect-[4/3] md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0 md:aspect-[4/5] [&_img]:object-[50%_38%]"
        />
        <div className="md:col-start-1 md:row-start-2">
          <ExpandableText
            className="mt-5"
            summary={t('whoWeAre.paragraph1')}
            paragraphs={[t('whoWeAre.paragraph2'), t('whoWeAre.paragraph3')]}
            expandLabel={t('common:buttons.readMore')}
            collapseLabel={t('common:buttons.showLess')}
          />
          <p className="mt-4 border-s-2 border-brand-500 ps-4 text-body font-semibold text-ink">{t('whoWeAre.quote')}</p>
        </div>
      </section>

      <section className="bg-stone px-4 py-8 md:py-10">
        <MobileStatsGrid />
      </section>

      {/* Phones: heading, portraits, button. Tablets: heading and button beside the portraits. */}
      <section className="grid px-4 py-8 md:grid-cols-2 md:grid-rows-2 md:items-center md:gap-x-8 md:py-12">
        <SectionHeader
          className="md:self-end"
          eyebrow={t('mobile.leadershipEyebrow')}
          heading={t('mobile.leadershipHeading')}
          headingAs="h3"
          description={t('mobile.leadershipDescription')}
        />
        {/* Founder and CEO portraits, each opening their profile page. */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0">
          {leadershipProfiles.map((leader) => (
            <LocaleLink key={leader.slug} to={`/leadership/${leader.slug}`} className="group block">
              <div className="aspect-[4/5] overflow-hidden rounded-md bg-gray-100">
                <img src={leader.photo} alt={leader.cardPhotoAlt} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
              </div>
              <span className="mt-2 block font-display text-small font-semibold leading-tight text-ink">{leader.cardName}</span>
              <span className="block text-caption text-gray-600">{t(`team.titles.${leader.role}`, { defaultValue: leader.role })}</span>
            </LocaleLink>
          ))}
        </div>
        <LocaleLink
          to="/team"
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-brand-600 text-body font-semibold text-warmwhite md:w-fit md:self-start md:px-8"
        >
          {t('whoWeAre.meetTheTeam')}
        </LocaleLink>
      </section>

      {/* Vision, mission and values — the desktop page's charcoal section, condensed:
          mission and vision as two short blocks, the values as a swipeable row (three across on tablets). */}
      <section className="bg-charcoal px-4 py-8 md:py-12">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('visionMissionValues.eyebrow')}</span>
        <h3 className="mt-2 font-display text-h2 font-semibold tracking-tight text-warmwhite">{t('visionMissionValues.heading')}</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(['mission', 'vision'] as const).map((key) => (
            <div key={key} className="rounded-md border border-white/10 bg-graphite p-4">
              <span className="text-caption font-semibold uppercase tracking-widest text-brand-400">{t(`visionMissionValues.${key}.title`)}</span>
              <p className="mt-1.5 text-body text-gray-200">{t(`visionMissionValues.${key}.description`)}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-small font-semibold uppercase tracking-wide text-warmwhite">{t('visionMissionValues.ourValues')}</p>
        <ul className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {valueKeys.map((key) => (
            <li key={key} className="w-[62vw] max-w-[16rem] shrink-0 snap-start rounded-md border border-white/10 bg-graphite p-4 md:w-auto md:max-w-none">
              <span className="font-display text-body font-semibold text-warmwhite">{t(`visionMissionValues.values.${key}.title`)}</span>
              <p className="mt-1 text-small text-gray-400">{t(`visionMissionValues.values.${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Commitment to Quality — the desktop section adapted: the site photo, the heading,
          the first paragraph with the second behind "Read more", and the Explore More button.
          Tablets put the copy beside the photo. */}
      <section className="grid px-4 py-8 md:grid-cols-2 md:items-center md:gap-x-8 md:py-12">
        <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100 md:order-2 md:aspect-[4/5]">
          <img
            src="/about/quality-site.jpg"
            alt="MENASCO's QA/QC manager and an engineer in high-visibility vests inspecting a completed building"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-[50%_75%]"
          />
        </div>
        <div className="mt-6 md:mt-0">
          <SectionHeader eyebrow={t('qualityStandards.eyebrow')} heading={t('qualityStandards.heading')} headingAs="h3" />
          <ExpandableText
            className="mt-4"
            summary={t('qualityStandards.paragraph1')}
            paragraphs={[t('qualityStandards.paragraph2')]}
            expandLabel={t('common:buttons.readMore')}
            collapseLabel={t('common:buttons.showLess')}
          />
          <LocaleLink
            to="/quality-safety"
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-600 text-body font-semibold text-warmwhite md:w-fit md:px-8"
          >
            {t('qualityStandards.exploreMore')}
            <ArrowRight size={16} aria-hidden="true" className="rtl:rotate-180" />
          </LocaleLink>
        </div>
      </section>

      {/* Mirrors the desktop page's closing "Learn More" cards (same data and copy), as a swipeable row (three across on tablets). */}
      <section className="py-8 md:py-12">
        <div className="px-4">
          <SectionHeader heading={`${t('credentials.heading1')} ${t('credentials.heading2')}`} headingAs="h3" />
        </div>
        <div className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4">
          {credentials.map((credential) => {
            const Icon = credentialIcons[credential.icon];
            const copy = (field: 'eyebrow' | 'title' | 'description' | 'buttonLabel') =>
              t(`credentials.${credential.key}.${field}`, { defaultValue: credential[field] });
            const buttonClass =
              credential.buttonVariant === 'filled'
                ? 'mt-auto inline-flex h-11 items-center justify-center rounded-md border border-ink bg-white px-4 text-small font-semibold text-ink'
                : 'mt-auto inline-flex h-11 items-center justify-center rounded-md border border-ink px-4 text-small font-semibold text-ink';
            return (
              <article
                key={credential.key}
                className="flex w-[78vw] max-w-[20rem] shrink-0 snap-start flex-col rounded-md border border-gray-200 bg-warmwhite p-5 md:w-[calc((100%-24px)/3)] md:max-w-none"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-stone text-brand-600">
                  <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="mt-5 text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{copy('eyebrow')}</span>
                <h3 className="mt-2 font-display text-h4 font-semibold uppercase text-ink">{copy('title')}</h3>
                <p className="mb-5 mt-2 text-small text-gray-600">{copy('description')}</p>
                {credential.internal ? (
                  <LocaleLink to={credential.href} className={buttonClass}>
                    {copy('buttonLabel')}
                  </LocaleLink>
                ) : (
                  <a href={credential.href} download className={buttonClass}>
                    {copy('buttonLabel')}
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
