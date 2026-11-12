import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { ButtonLink } from '../../components/ui/Button';
import { AutoplayVideo } from '../../components/common/AutoplayVideo';
import { PhotoWithVideo } from '../../components/sections/community/PhotoWithVideo';
import { CERTIFICATION_TRAINING_PATH, communityMedia, type CommunityImage } from '../../data/communityPeople';
import { SEO } from '../../seo/SEO';
import { PhotoRail } from '../components/PhotoRail';

interface ChapterCopy {
  eyebrow: string;
  heading: string;
  caption: string;
}

function ChapterHeader({ index, copy, dark = false }: { index: number; copy: ChapterCopy; dark?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span dir="ltr" className="font-display text-caption font-semibold text-gray-400">
          {String(index).padStart(2, '0')}
        </span>
        <span className={`text-caption font-semibold uppercase tracking-wider ${dark ? 'text-brand-300' : 'text-brand-600'}`}>{copy.eyebrow}</span>
      </div>
      <h3 className={`mt-3 text-balance font-display text-h3 font-semibold ${dark ? 'text-warmwhite' : 'text-ink'}`}>{copy.heading}</h3>
      <p className={`mt-2 text-body ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{copy.caption}</p>
    </div>
  );
}

function Photo({ image, className }: { image: CommunityImage; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-md bg-gray-100 ${className ?? ''}`}>
      <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" style={image.focus ? { objectPosition: image.focus } : undefined} />
    </div>
  );
}

/**
 * Phone/tablet Community & People — the desktop photo essay's six chapters,
 * with multi-photo chapters as swipeable rows (dots on phones, arrows on
 * tablets; two-photo rows simply fit side by side on tablets).
 */
export default function CommunityPeoplePage() {
  const { t } = useTranslation(['about', 'nav']);
  const blood = t('community.bloodDrive', { returnObjects: true }) as ChapterCopy;
  const healthcare = t('community.healthcare', { returnObjects: true }) as ChapterCopy;
  const culture = t('community.cultureDay', { returnObjects: true }) as ChapterCopy;
  const run = t('community.dubaiRun', { returnObjects: true }) as ChapterCopy;
  const careers = t('community.careerFairs', { returnObjects: true }) as ChapterCopy;
  const training = t('community.training', { returnObjects: true }) as ChapterCopy;

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={t('community.seo.title')}
        description={t('community.seo.description')}
        path="/community-people"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Community & People', path: '/community-people' }]}
      />

      <section className="px-4 pb-2 pt-8 md:px-8 md:pt-12">
        <p className="text-caption font-semibold uppercase tracking-wider text-brand-600">{t('community.intro.eyebrow')}</p>
        <h2 className="mt-3 text-balance font-display text-h1 font-semibold text-ink">{t('community.intro.heading')}</h2>
        <p className="mt-3 max-w-xl text-body-lg text-gray-600">{t('community.intro.description')}</p>
      </section>

      {/* 01 — Blood drive: the group photo on its own card, then the donor photos as a swipeable row. */}
      <section className="py-8">
        <div className="px-4 md:px-8">
          <ChapterHeader index={1} copy={blood} />
        </div>
        <div className="-mb-2 mt-5 px-4 md:px-8">
          <Photo image={communityMedia.bloodDriveGroup} className="aspect-[16/10]" />
        </div>
        <PhotoRail images={communityMedia.bloodDrive} label={blood.eyebrow} itemClassName="aspect-[4/3] w-[66vw] max-w-[20rem] md:w-[42vw] md:max-w-none" />
      </section>

      {/* 02 — Investing in healthcare: the signing photo with a play button that opens the
          portrait video full screen (no tall video stacked under the photo). */}
      <section className="bg-stone px-4 py-8 md:px-8">
        <ChapterHeader index={2} copy={healthcare} />
        <PhotoWithVideo image={communityMedia.healthcare.image} video={communityMedia.healthcare.video} className="mt-5 aspect-[16/10]" />
      </section>

      {/* 03 — Culture Day. */}
      <section className="bg-ink px-4 py-8 md:px-8">
        <ChapterHeader index={3} copy={culture} dark />
        <AutoplayVideo
          src={communityMedia.cultureDay.video}
          poster={communityMedia.cultureDay.poster}
          alt={communityMedia.cultureDay.alt}
          className="mx-auto mt-5 aspect-[9/16] w-full max-w-[calc(70svh*9/16)] rounded-md"
        />
      </section>

      {/* 04 — Dubai Run: the group photo on its own card, then the other three as a swipeable row. */}
      <section className="bg-stone py-8">
        <div className="px-4 md:px-8">
          <ChapterHeader index={4} copy={run} />
        </div>
        <div className="-mb-2 mt-5 px-4 md:px-8">
          <Photo image={communityMedia.dubaiRunGroup} className="aspect-[4/3] md:aspect-[16/10]" />
        </div>
        <PhotoRail images={communityMedia.dubaiRun} label={run.eyebrow} itemClassName="aspect-[4/5] w-[66vw] max-w-[20rem] md:w-[42vw] md:max-w-none" />
      </section>

      {/* 05 — Career fairs: the two portrait photos as a swipeable row (side by side on tablets). */}
      <section className="py-8">
        <div className="px-4 md:px-8">
          <ChapterHeader index={5} copy={careers} />
        </div>
        <PhotoRail images={communityMedia.careerFairs} label={careers.eyebrow} itemClassName="aspect-[4/5] w-[78vw] max-w-[22rem] md:w-[calc(50%-6px)] md:max-w-none" />
      </section>

      {/* 06 — Training & Mentoring Centre. */}
      <section className="bg-stone px-4 py-8 md:px-8">
        <ChapterHeader index={6} copy={training} />
        <Photo image={communityMedia.training} className="mt-5 aspect-[4/3] md:aspect-[16/9]" />
        <div>
          <ButtonLink href={CERTIFICATION_TRAINING_PATH} variant="primary" size="lg" trailingIcon={ArrowRight} fullWidth className="mt-6 md:w-auto">
            {t('nav:certificationTraining')}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
