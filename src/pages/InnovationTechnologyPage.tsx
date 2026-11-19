import { useTranslation } from 'react-i18next';
import { HeroH1 } from '../components/typography/HeroH1';
import { Section } from '../components/layout/Section';
import { Eyebrow } from '../components/typography/Typography';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { innovationHeroFilm, innovationHeroPhotos } from '../data/innovationPhotos';
import { AutoplayVideo } from '../components/common/AutoplayVideo';
import { PhotoWithVideo } from '../components/sections/community/PhotoWithVideo';
import { splitAcronym } from '../lib/splitAcronym';
import { cn } from '../lib/utils';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

/*
 * Typographic-maximalist page (same approach as the mobile tree): poster-scale
 * display type with index numbers and figures set in Inter. Display sizes use
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
      <HeroH1
        eyebrow={
          <Eyebrow as="span" className="block">
            {t('innovation.hero.eyebrow')}
          </Eyebrow>
        }
        title={
          <span className="mt-4 block font-display font-bold uppercase leading-[0.86] tracking-[-0.04em] text-ink">
            {lineTwo ? (
              <>
                <span className="block text-[clamp(4rem,7vw,6.25rem)]">{lineOne}</span>{' '}
                <span className="block whitespace-nowrap text-[clamp(3.25rem,5.8vw,5.25rem)]">
                  <span className="text-brand-600">&amp; {lineTwo}</span>
                </span>
              </>
            ) : (
              <span className="block text-[clamp(3.5rem,6vw,5.5rem)] leading-[1.05]">{lineOne}</span>
            )}
          </span>
        }
      />
      <div className="mt-12 grid grid-cols-12 gap-8">
        <div className="col-span-4 self-center">
          <p className="border-s-4 border-brand-500 ps-4 text-body-lg text-gray-700">{t('innovation.hero.description')}</p>
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
          <p
            dir="ltr"
            className="col-span-5 font-sans text-[clamp(6rem,10vw,8.5rem)] font-normal leading-[0.9] tracking-[-0.04em] tabular-nums text-brand-400 rtl:text-end"
          >
            {t('innovation.stat.value')}
          </p>
          <div className="col-span-6 col-start-7 pb-4">
            <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('innovation.stat.eyebrow')}</span>
            <p className="mt-3 font-display text-h3 font-semibold leading-tight tracking-tight text-warmwhite">{t('innovation.stat.label')}</p>
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
    image: '/innovation/atlas.jpg',
    imageAlt: 'MENASCO engineers reviewing tender documents at a desk, with the word ATLAS and compliance-scan markers',
    // Applies to the short name "ATLAS"; its full meaning is set small beneath.
    titleClass: 'text-[clamp(3.25rem,5.6vw,5rem)]',
    theme: 'light',
    imageSide: 'end',
  },
  {
    key: 'lynxqc',
    image: '/innovation/lynx.jpg',
    imageAlt: "MENASCO's QA/QC manager and an engineer inspecting ductwork on site, with the word LYNX and issue markers",
    titleClass: 'text-[clamp(3.25rem,5.6vw,5rem)]',
    theme: 'dark',
    imageSide: 'start',
  },
  {
    key: 'ai',
    image: '/innovation/ai.jpg',
    imageAlt: 'MENASCO engineers working over MEP drawings, with the letters AI and quantity markers on the fixtures',
    titleClass: 'text-[clamp(3.25rem,5.6vw,5rem)]',
    theme: 'stone',
    imageSide: 'end',
  },
  {
    key: 'connect',
    image: '/innovation/connect.jpg',
    imageAlt: 'MENASCO site workforce walking onto a construction site, with the word CONNECT and check-in markers',
    titleClass: 'text-[clamp(3.25rem,5.6vw,5rem)]',
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

/** One technology: index number + label, title across the full width, then the image beside the paragraph. */
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
    </div>
  );
  return (
    <ScrollReveal>
      <Section spacing="lg" background={theme.background} className="overflow-hidden">
        <div className="flex items-end gap-5">
          <span
            dir="ltr"
            aria-hidden="true"
            className={cn('font-sans text-[clamp(2.5rem,3.6vw,3.25rem)] font-normal leading-[0.85] tracking-[-0.03em] tabular-nums', theme.accent)}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={cn('pb-2 text-eyebrow font-semibold uppercase tracking-widest', theme.accent)}>{copy.eyebrow}</span>
        </div>
        {/* "Name (ACRONYM)" headings show the acronym alone; the full name stays in the copy (and llms.txt). */}
        <h3 className={cn('mt-6 font-display font-bold uppercase leading-[0.92] tracking-[-0.04em]', chapter.titleClass, theme.text)}>
          {acronym ? acronym.name : keepAmpersand(copy.heading)}
        </h3>
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
            <h3 className="font-display text-[clamp(3.5rem,6vw,5.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-warmwhite">
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
