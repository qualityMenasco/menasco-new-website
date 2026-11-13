import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Eyebrow } from '../components/typography/Typography';
import { SmartLink } from '../lib/SmartLink';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { placeholderImages } from '../data/images';
import { innovationHeroFilm, innovationHeroPhotos } from '../data/innovationPhotos';
import { AutoplayVideo } from '../components/common/AutoplayVideo';
import { PhotoWithVideo } from '../components/sections/community/PhotoWithVideo';
import { splitAcronym, textOutline } from '../lib/textOutline';
import { cn } from '../lib/utils';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

/*
 * Typographic-maximalist page (same approach as the mobile tree): poster-scale
 * display type and giant outlined index numbers and figures. Display sizes use
 * clamp(…vw…) so lines fill the container from 1025px up and stop growing once
 * the container reaches its max width.
 */

/** Keeps an "&" attached to the word before it so it never wraps onto a line alone. */
const keepAmpersand = (text: string) => text.replace(' & ', ' & ');

/**
 * Opens with the title as a full-width poster, then the subheading and
 * introduction beside the portrait film and the two event photos stacked on
 * its right. The film's aspect ratio sets the row height; the photos stretch
 * to match.
 *
 * Below 1280px the container stops being full width and the film would have
 * to shrink, so the row collapses to text + the two photos side by side,
 * with a "Watch the video" button on the first photo that opens the film
 * full screen (the inline film is display:none there, so it never downloads).
 */
function InnovationHero() {
  const { t } = useTranslation('about');
  const heading = t('innovation.hero.heading');
  // English splits around the "&" into two poster lines ("&" leads the second line);
  // headings without one (Arabic) render as a single line.
  const [lineOne, lineTwo] = heading.includes(' & ') ? heading.split(' & ') : [heading, null];
  return (
    <Section spacing="lg" background="stone">
      <Eyebrow>{t('innovation.hero.eyebrow')}</Eyebrow>
      <h2 className="mt-4 font-display font-bold uppercase leading-[0.86] tracking-[-0.04em] text-ink">
        {lineTwo ? (
          <>
            <span className="block text-[clamp(6rem,11.4vw,10.25rem)]">{lineOne}</span>
            <span className="block whitespace-nowrap text-[clamp(5rem,9.4vw,8.5rem)]">
              <span className="text-brand-600">&amp; {lineTwo}</span>
            </span>
          </>
        ) : (
          <span className="block text-[clamp(5rem,10vw,9rem)] leading-[1.05]">{lineOne}</span>
        )}
      </h2>
      <div className="mt-12 grid grid-cols-12 gap-8">
        <div className="col-span-4 self-center">
          <p className="font-display text-h3 font-semibold uppercase leading-tight tracking-tight text-ink">{t('innovation.hero.subheading')}</p>
          <p className="mt-5 border-s-4 border-brand-500 ps-4 text-body-lg text-gray-700">{t('innovation.hero.description')}</p>
        </div>
        <AutoplayVideo
          src={innovationHeroFilm.src}
          poster={innovationHeroFilm.poster}
          alt={t('innovation.hero.filmAlt')}
          className="col-span-4 hidden aspect-[768/1376] rounded-md min-[1280px]:block"
        />
        <div className="col-span-8 grid grid-cols-2 gap-8 min-[1280px]:col-span-4 min-[1280px]:min-h-0 min-[1280px]:grid-cols-1 min-[1280px]:grid-rows-[repeat(2,minmax(0,1fr))]">
          {innovationHeroPhotos.map((photo, index) => (
            // 4:5 tiles side by side when collapsed; stacked beside the film they fill its
            // height, absolutely positioned so their own size never stretches the row.
            <div key={photo.src} className="relative aspect-[4/5] overflow-hidden rounded-md bg-gray-100 min-[1280px]:aspect-auto">
              {index === 0 ? (
                <PhotoWithVideo
                  image={photo}
                  video={innovationHeroFilm.src}
                  className="!absolute inset-0 [&_img]:object-[50%_0%]"
                  overlayClassName="min-[1280px]:hidden"
                />
              ) : (
                <img
                  src={photo.src}
                  alt={photo.alt}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={photo.focus ? { objectPosition: photo.focus } : undefined}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/** The AI efficiency figure as a type-only moment. */
function EfficiencyStat() {
  const { t } = useTranslation('about');
  return (
    <ScrollReveal>
      <Section spacing="lg" background="charcoal" className="overflow-hidden">
        <div className="grid grid-cols-12 items-end gap-8">
          <p dir="ltr" className="col-span-8 font-display text-[clamp(10rem,19vw,17rem)] font-bold leading-[0.78] tracking-[-0.06em] text-brand-400 rtl:text-end">
            {t('innovation.stat.value')}
          </p>
          <div className="col-span-4 pb-4">
            <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('innovation.sections.ai.eyebrow')}</span>
            <p className="mt-3 font-display text-h2 font-bold uppercase leading-[0.95] tracking-tight text-warmwhite">{t('innovation.stat.label')}</p>
          </div>
        </div>
      </Section>
    </ScrollReveal>
  );
}

type ChapterKey = 'atlas' | 'lynxqc' | 'ai' | 'connect';

type Chapter = {
  key: ChapterKey;
  image: string;
  imageAlt: string;
  /** Title size: short names go poster-sized, long ones stay readable. */
  titleClass: string;
  theme: 'light' | 'stone' | 'dark';
  /** Image before or after the paragraph, alternating down the page. */
  imageSide: 'start' | 'end';
};

/** Same order and images as before the redesign: ATLAS → LYNX → AI → MENASCO Connect. */
const chapters: Chapter[] = [
  {
    key: 'atlas',
    image: '/intelligent-compliance-hero.jpg',
    imageAlt: 'Precision-engineered modern architecture reflecting regulatory and design compliance',
    // Applies to the short name "ATLAS"; its full meaning is set small beneath.
    titleClass: 'text-[clamp(13rem,25vw,22rem)] !leading-[0.8]',
    theme: 'light',
    imageSide: 'end',
  },
  {
    key: 'lynxqc',
    image: '/mobile-applications-hero.jpg',
    imageAlt: 'Engineer using LYNX on a mobile device to log a field quality issue on site',
    titleClass: 'text-[clamp(14rem,27vw,24rem)] !leading-[0.8]',
    theme: 'dark',
    imageSide: 'start',
  },
  {
    key: 'ai',
    image: '/ai-automation-hero.jpg',
    imageAlt: 'Modern engineering design reflecting intelligent, technology-driven construction',
    titleClass: 'text-[clamp(6rem,11vw,9.75rem)]',
    theme: 'stone',
    imageSide: 'end',
  },
  {
    key: 'connect',
    image: placeholderImages.blueprintReview,
    imageAlt: 'Engineering documentation and coordinated business processes',
    titleClass: 'text-[clamp(6rem,11vw,9.75rem)]',
    theme: 'light',
    imageSide: 'start',
  },
];

const themeClasses: Record<Chapter['theme'], { background: 'warmwhite' | 'stone' | 'ink'; text: string; muted: string; accent: string }> = {
  light: { background: 'warmwhite', text: 'text-ink', muted: 'text-gray-700', accent: 'text-brand-600' },
  stone: { background: 'stone', text: 'text-ink', muted: 'text-gray-700', accent: 'text-brand-600' },
  dark: { background: 'ink', text: 'text-warmwhite', muted: 'text-gray-300', accent: 'text-brand-400' },
};

interface TranslatedSection {
  eyebrow: string;
  heading: string;
  paragraph: string;
  privacyPolicyLink?: string;
}

/** One technology: giant outlined index + label, poster title across the full width, then the image beside the paragraph. */
function ChapterSection({ chapter, index, copy }: { chapter: Chapter; index: number; copy: TranslatedSection }) {
  const theme = themeClasses[chapter.theme];
  const acronym = splitAcronym(copy.heading);
  const image = (
    <div className="col-span-7 aspect-[16/10] overflow-hidden rounded-md bg-gray-100">
      <img src={chapter.image} alt={chapter.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </div>
  );
  const text = (
    <div className="col-span-5 self-center">
      <p className={cn('text-body-lg', theme.muted)}>{copy.paragraph}</p>
      {chapter.key === 'lynxqc' && copy.privacyPolicyLink && (
        <SmartLink href="/lynxqc/privacy-policy" className={cn('mt-5 inline-flex items-center gap-1.5 text-small font-semibold', theme.accent)}>
          {copy.privacyPolicyLink}
          <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
        </SmartLink>
      )}
    </div>
  );
  return (
    <ScrollReveal>
      <Section spacing="lg" background={theme.background} className="overflow-hidden">
        <div className="flex items-end gap-5">
          <span
            dir="ltr"
            aria-hidden="true"
            className={cn('font-display text-[clamp(8rem,13vw,11.5rem)] font-bold leading-[0.75] tracking-[-0.05em]', theme.accent)}
            style={textOutline(2)}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={cn('pb-2 text-eyebrow font-semibold uppercase tracking-widest', theme.accent)}>{copy.eyebrow}</span>
        </div>
        {acronym ? (
          // "Name (ACRONYM)" headings: the acronym as the poster, the meaning beneath, no parentheses.
          <h3 className={theme.text}>
            <span className={cn('mt-6 block font-display font-bold uppercase leading-[0.92] tracking-[-0.04em]', chapter.titleClass)}>{acronym.name}</span>
            <span className="mt-4 block font-display text-h3 font-semibold uppercase tracking-tight">{acronym.meaning}</span>
          </h3>
        ) : (
          <h3 className={cn('mt-6 font-display font-bold uppercase leading-[0.92] tracking-[-0.04em]', chapter.titleClass, theme.text)}>
            {keepAmpersand(copy.heading)}
          </h3>
        )}
        <div className="mt-12 grid grid-cols-12 gap-12">
          {chapter.imageSide === 'start' ? (
            <>
              {image}
              {text}
            </>
          ) : (
            <>
              {text}
              {image}
            </>
          )}
        </div>
      </Section>
    </ScrollReveal>
  );
}

export default function InnovationTechnologyPage() {
  const { t } = useTranslation('about');
  const s = t('innovation.sections', { returnObjects: true }) as Record<ChapterKey, TranslatedSection>;

  return (
    <>
      <SEO
        title={t('innovation.seo.title')}
        description={t('innovation.seo.description')}
        path="/innovation-technology"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Innovation & Technology', path: '/innovation-technology' },
        ]}
      />

      <InnovationHero />
      <EfficiencyStat />

      {chapters.map((chapter, index) => (
        <ChapterSection key={chapter.key} chapter={chapter} index={index} copy={s[chapter.key]} />
      ))}

      {/* Closing statement as two poster lines, the second word in brand blue. */}
      <ScrollReveal>
        <Section spacing="lg" background="ink" className="overflow-hidden">
          <div>
            <h3 className="font-display text-[clamp(5rem,10.4vw,9.25rem)] font-bold uppercase leading-[0.88] tracking-[-0.04em] text-warmwhite">
              {t('innovation.closing.heading')
                .split(' ')
                .map((word, i) => (
                  <span key={word} className={cn('block', i % 2 === 1 && 'text-brand-400')}>
                    {word}
                  </span>
                ))}
            </h3>
            <p className="mt-8 max-w-2xl text-body-lg text-gray-300">{t('innovation.closing.description')}</p>
          </div>
        </Section>
      </ScrollReveal>
    </>
  );
}
