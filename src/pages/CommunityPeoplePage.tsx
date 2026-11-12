import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { ButtonLink } from '../components/ui/Button';
import { AutoplayVideo } from '../components/common/AutoplayVideo';
import { VideoPlaceholder } from '../components/sections/community/VideoPlaceholder';
import { CERTIFICATION_TRAINING_PATH, communityMedia, type CommunityImage } from '../data/communityPeople';
import { SEO } from '../seo/SEO';

interface ChapterCopy {
  eyebrow: string;
  heading: string;
  caption: string;
}

/** Numbered chapter heading — the index, eyebrow and title on one line-up, caption beneath. */
function ChapterHeader({ index, copy, theme = 'light', children }: { index: number; copy: ChapterCopy; theme?: 'light' | 'dark'; children?: ReactNode }) {
  return (
    <div className="grid grid-cols-12 items-end gap-8">
      <div className="col-span-7">
        <div className="flex items-center gap-4">
          <span dir="ltr" className={theme === 'dark' ? 'font-display text-caption font-semibold text-gray-400' : 'font-display text-caption font-semibold text-gray-500'}>
            {String(index).padStart(2, '0')}
          </span>
          <Eyebrow theme={theme}>{copy.eyebrow}</Eyebrow>
        </div>
        <Heading level="h2" as="h3" theme={theme} className="mt-4 text-balance">
          {copy.heading}
        </Heading>
      </div>
      <div className="col-span-5">
        <Text variant="body-lg" theme={theme} muted={theme === 'light'} className={theme === 'dark' ? 'text-gray-300' : undefined}>
          {copy.caption}
        </Text>
        {children}
      </div>
    </div>
  );
}

function Photo({ image, className }: { image: CommunityImage; className?: string }) {
  return (
    <div className={`group overflow-hidden rounded-md bg-gray-100 ${className ?? ''}`}>
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-slow ease-engineered group-hover:scale-[1.03]"
      style={image.focus ? { objectPosition: image.focus } : undefined}
      />
    </div>
  );
}

/**
 * Community & People — a photo essay in six chapters (blood drive,
 * healthcare partnership, Culture Day, Dubai Run, career fairs, Training &
 * Mentoring Centre). No banner: the page opens on a
 * short title and goes straight to the imagery; copy stays to one line per
 * chapter. Media lives in src/data/communityPeople.ts.
 */
export default function CommunityPeoplePage() {
  const { t } = useTranslation(['about', 'nav']);
  const blood = t('community.bloodDrive', { returnObjects: true }) as ChapterCopy;
  const healthcare = t('community.healthcare', { returnObjects: true }) as ChapterCopy;
  const culture = t('community.cultureDay', { returnObjects: true }) as ChapterCopy;
  const run = t('community.dubaiRun', { returnObjects: true }) as ChapterCopy;
  const careers = t('community.careerFairs', { returnObjects: true }) as ChapterCopy;
  const [run1, run2, run3] = communityMedia.dubaiRun;
  const training = t('community.training', { returnObjects: true }) as ChapterCopy;

  return (
    <>
      <SEO
        title={t('community.seo.title')}
        description={t('community.seo.description')}
        path="/community-people"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Community & People', path: '/community-people' },
        ]}
      />

      <Section spacing="lg" background="warmwhite" className="!pb-12 md:!pb-16">
        <div className="max-w-4xl">
          <Eyebrow>{t('community.intro.eyebrow')}</Eyebrow>
          <Heading level="display" as="h2" className="mt-4 text-balance">
            {t('community.intro.heading')}
          </Heading>
          <Text variant="body-lg" muted className="mt-6 max-w-xl">
            {t('community.intro.description')}
          </Text>
        </div>
      </Section>

      {/* 01 — Blood drive: the group photo on its own card, the three donor photos in a row beneath. */}
      <ScrollReveal>
        <Section spacing="md" background="warmwhite" className="!pt-8">
          <ChapterHeader index={1} copy={blood} />
          <div className="mt-10 flex flex-col gap-4">
            <Photo image={communityMedia.bloodDriveGroup} className="aspect-[2/1]" />
            <div className="grid grid-cols-3 gap-4">
              {communityMedia.bloodDrive.map((photo) => (
                <Photo key={photo.src} image={photo} className="aspect-[16/10]" />
              ))}
            </div>
          </div>
        </Section>
      </ScrollReveal>

      {/* 02 — Investing in healthcare: copy over the (landscape) signing photo on the
          left, the portrait video standing on the right at about the same height. */}
      <ScrollReveal>
        <Section spacing="lg" background="stone">
          <div className="grid grid-cols-12 items-end gap-8">
            <div className="col-span-8">
              <div className="flex items-center gap-4">
                <span dir="ltr" className="font-display text-caption font-semibold text-gray-500">02</span>
                <Eyebrow>{healthcare.eyebrow}</Eyebrow>
              </div>
              <Heading level="h2" as="h3" className="mt-4 max-w-xl text-balance">
                {healthcare.heading}
              </Heading>
              <Text variant="body-lg" muted className="mt-5 max-w-xl">
                {healthcare.caption}
              </Text>
              <Photo image={communityMedia.healthcare.image} className="mt-10 aspect-[2/1]" />
            </div>
            {communityMedia.healthcare.video ? (
              <AutoplayVideo
                src={communityMedia.healthcare.video}
                poster={communityMedia.healthcare.poster}
                alt={t('community.healthcare.videoAlt')}
                className="col-span-4 aspect-[768/1116] w-full rounded-md"
              />
            ) : (
              <VideoPlaceholder className="col-span-4 aspect-[9/16] w-full" />
            )}
          </div>
        </Section>
      </ScrollReveal>

      {/* 03 — Culture Day: a dark, cinematic band. The film is portrait (9:16), so it
          stands beside the copy rather than spanning the width. */}
      <ScrollReveal>
        <Section spacing="lg" background="ink">
          <div className="grid grid-cols-12 items-center gap-8">
            <div className="col-span-6">
              <div className="flex items-center gap-4">
                <span dir="ltr" className="font-display text-caption font-semibold text-gray-400">03</span>
                <Eyebrow theme="dark">{culture.eyebrow}</Eyebrow>
              </div>
              <Heading level="h2" as="h3" theme="dark" className="mt-4 text-balance">
                {culture.heading}
              </Heading>
              <Text variant="body-lg" theme="dark" className="mt-5 max-w-md text-gray-300">
                {culture.caption}
              </Text>
            </div>
            <AutoplayVideo
              src={communityMedia.cultureDay.video}
              poster={communityMedia.cultureDay.poster}
              alt={communityMedia.cultureDay.alt}
              className="col-span-4 col-start-8 aspect-[9/16] w-full rounded-md"
            />
          </div>
        </Section>
      </ScrollReveal>

      {/* 04 — Dubai Run: portrait / landscape / portrait in a row, the group photo full width beneath
          (the blood drive's order, reversed). */}
      <ScrollReveal>
        <Section spacing="lg" background="stone">
          <ChapterHeader index={4} copy={run} />
          <div className="mt-10 flex flex-col gap-4">
            {/* Row shape set so the outer photos land at their own 3:4. */}
            <div className="grid aspect-[25/8] grid-cols-12 grid-rows-[minmax(0,1fr)] gap-4">
              <Photo image={run1} className="col-span-3" />
              <Photo image={run2} className="col-span-6" />
              <Photo image={run3} className="col-span-3" />
            </div>
            <Photo image={communityMedia.dubaiRunGroup} className="aspect-[2/1]" />
          </div>
        </Section>
      </ScrollReveal>

      {/* 05 — Career fairs: copy, then the two portrait photos standing beside it. */}
      <ScrollReveal>
        <Section spacing="lg" background="warmwhite">
          <div className="grid grid-cols-12 items-center gap-8">
            <div className="col-span-4">
              <div className="flex items-center gap-4">
                <span dir="ltr" className="font-display text-caption font-semibold text-gray-500">05</span>
                <Eyebrow>{careers.eyebrow}</Eyebrow>
              </div>
              <Heading level="h2" as="h3" className="mt-4 text-balance">
                {careers.heading}
              </Heading>
              <Text variant="body-lg" muted className="mt-5 max-w-md">
                {careers.caption}
              </Text>
            </div>
            {communityMedia.careerFairs.map((photo) => (
              <Photo key={photo.src} image={photo} className="col-span-4 aspect-[4/5]" />
            ))}
          </div>
        </Section>
      </ScrollReveal>

      {/* 06 — Training & Mentoring Centre: photo first, copy + link beside it. */}
      <ScrollReveal>
        <Section spacing="lg" background="stone">
          <div className="grid grid-cols-12 items-center gap-12">
            <Photo image={communityMedia.training} className="col-span-7 aspect-[4/3]" />
            <div className="col-span-5">
              <div className="flex items-center gap-4">
                <span dir="ltr" className="font-display text-caption font-semibold text-gray-500">06</span>
                <Eyebrow>{training.eyebrow}</Eyebrow>
              </div>
              <Heading level="h2" as="h3" className="mt-4 text-balance">
                {training.heading}
              </Heading>
              <Text variant="body-lg" muted className="mt-5">
                {training.caption}
              </Text>
              <ButtonLink href={CERTIFICATION_TRAINING_PATH} variant="primary" size="lg" trailingIcon={ArrowRight} className="mt-8">
                {t('nav:certificationTraining')}
              </ButtonLink>
            </div>
          </div>
        </Section>
      </ScrollReveal>
    </>
  );
}
