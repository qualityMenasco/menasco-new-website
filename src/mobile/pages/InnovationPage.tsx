import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PhotoRail } from '../components/PhotoRail';
import { ExpandableText } from '../components/ExpandableText';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import { innovationHeroFilm, innovationHeroPhotos } from '../../data/innovationPhotos';
import { cn } from '../lib/utils';
import { splitAcronym } from '../../lib/splitAcronym';
import {} from '../../seo/structuredData';


type Chapter = {
  key: 'atlas' | 'lynxqc' | 'ai' | 'connect';
  image: string;
  imageAlt: string;
  theme: 'light' | 'stone' | 'dark';
};

/** Same order and images as the desktop page: ATLAS → LYNX → AI → MENASCO Connect. */
const chapters: Chapter[] = [
  {
    key: 'atlas',
    image: '/innovation/atlas.jpg',
    imageAlt: 'MENASCO engineers reviewing tender documents at a desk, with the word ATLAS and compliance-scan markers',
    // Applies to the short name "ATLAS"; its full meaning is set small beneath.
    theme: 'light',
  },
  {
    key: 'lynxqc',
    image: '/innovation/lynx.jpg',
    imageAlt: "MENASCO's QA/QC manager and an engineer inspecting ductwork on site, with the word LYNX and issue markers",
    theme: 'dark',
  },
  {
    key: 'ai',
    image: '/innovation/ai.jpg',
    imageAlt: 'MENASCO engineers working over MEP drawings, with the letters AI and quantity markers on the fixtures',
    // Sized so "ENGINEERING" (the longest word) always fits one line, down to 320px.
    theme: 'stone',
  },
  {
    key: 'connect',
    image: '/innovation/connect.jpg',
    imageAlt: 'MENASCO site workforce walking onto a construction site, with the word CONNECT and check-in markers',
    theme: 'light',
  },
];

const themeClasses: Record<Chapter['theme'], { section: string; text: string; muted: string; accent: string }> = {
  light: { section: 'bg-warmwhite', text: 'text-ink', muted: 'text-gray-600', accent: 'text-brand-600' },
  stone: { section: 'bg-stone', text: 'text-ink', muted: 'text-gray-600', accent: 'text-brand-600' },
  dark: { section: 'bg-ink', text: 'text-warmwhite', muted: 'text-gray-300', accent: 'text-brand-400' },
};

/**
 * Typographic-maximalist take on the desktop page for phones and tablets:
 * display type, index numbers and figures set in Inter, and
 * full-bleed section images, in the same section order as desktop. Display
 * sizes are in vw so each line fills the width at any phone/tablet size.
 */
/** Paragraphs longer than this show their first sentence with a "Read more" for the rest. */
const LONG_TEXT = 220;

/**
 * The desktop page's paragraph, unedited. Long ones collapse to their first
 * sentence on phones, with the rest one tap away (still in the DOM).
 */
function LongText({ text, className, textClassName, buttonClassName }: { text: string; className?: string; textClassName: string; buttonClassName?: string }) {
  const { t } = useTranslation('common');
  const sentences = text.split(/(?<=[.!?؟])\s+/);
  if (text.length <= LONG_TEXT || sentences.length < 2) return <p className={cn(textClassName, className)}>{text}</p>;
  return (
    <ExpandableText
      className={className}
      summary={sentences[0]}
      paragraphs={[sentences.slice(1).join(' ')]}
      expandLabel={t('buttons.readMore')}
      collapseLabel={t('buttons.showLess')}
      textClassName={textClassName}
      buttonClassName={buttonClassName}
    />
  );
}

/**
 * Phone layout for the four initiatives: a horizontal, snap-scrolling row of
 * cards (each in its chapter's colour theme), with position dots. Each card
 * holds the index, label, title, image and the desktop paragraph behind
 * "Read more".
 */
function ChapterRail() {
  const { t } = useTranslation('about');
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const onScroll = () => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return;
    setActive(Math.min(chapters.length - 1, Math.round(Math.abs(rail.scrollLeft) / (first.offsetWidth + 12))));
  };
  return (
    <section className="py-10 md:hidden">
      <div
        ref={railRef}
        onScroll={onScroll}
        role="group"
        aria-label={t('innovation.chaptersLabel')}
        className="no-scrollbar flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-px-4 px-4"
      >
        {chapters.map((chapter, index) => {
          const theme = themeClasses[chapter.theme];
          const copy = (field: 'eyebrow' | 'heading' | 'paragraph') => t(`innovation.sections.${chapter.key}.${field}`);
          const acronym = splitAcronym(copy('heading'));
          return (
            <article
              key={chapter.key}
              className={cn('flex w-[84vw] max-w-[22rem] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-gray-200', theme.section, chapter.theme === 'dark' && 'border-transparent')}
            >
              <div className="aspect-[16/10] bg-gray-100">
                <img src={chapter.image} alt={chapter.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-end gap-3">
                  <span dir="ltr" aria-hidden="true" className={cn('font-sans text-[2rem] font-normal leading-[0.85] tracking-[-0.03em] tabular-nums', theme.accent)}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={cn('pb-0.5 text-caption font-semibold uppercase tracking-widest', theme.accent)}>{copy('eyebrow')}</span>
                </div>
                <h3 className={cn('mt-3 font-display text-h2 font-bold uppercase leading-[0.95] tracking-[-0.03em]', theme.text)}>{acronym ? acronym.name : copy('heading')}</h3>
                <LongText text={copy('paragraph')} className="mt-4" textClassName={cn('text-body', theme.muted)} buttonClassName={theme.accent} />
              </div>
            </article>
          );
        })}
      </div>
      <div aria-hidden="true" className="mt-5 flex justify-center gap-1.5">
        {chapters.map((chapter, index) => (
          <span key={chapter.key} className={cn('h-1.5 rounded-full transition-all duration-base', index === active ? 'w-5 bg-ink' : 'w-1.5 bg-gray-300')} />
        ))}
      </div>
    </section>
  );
}

export default function InnovationPage() {
  const { t } = useTranslation('about');
  const heading = t('innovation.hero.heading');
  // English splits around the "&" into two poster lines ("&" leads the second line, never alone);
  // headings without one (Arabic) render as a single balanced block.
  const [lineOne, lineTwo] = heading.includes(' & ') ? heading.split(' & ') : [heading, null];

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={t('innovation.seo.title')}
        description={t('innovation.seo.description')}
        path="/innovation-technology"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Innovation & Technology', path: '/innovation-technology' },
        ]}
      />

      {/* Hero: the title as a poster, the intro, then the event photos (film behind the first). */}
      <section className="overflow-hidden px-4 pb-8 pt-6">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('innovation.hero.eyebrow')}</span>
        <h2 className="mt-3 font-display font-bold uppercase leading-[0.86] tracking-[-0.04em] text-ink">
          {lineTwo ? (
            <>
              <span className="block text-[10vw]">{lineOne}</span>
              <span className="block whitespace-nowrap text-[8.6vw]">
                <span className="text-brand-600">&amp; {lineTwo}</span>
              </span>
            </>
          ) : (
            <span className="block text-balance text-[11vw] leading-[1.05]">{lineOne}</span>
          )}
        </h2>
        <p className="mt-6 font-display text-body-lg font-semibold leading-snug text-ink">{t('innovation.hero.subheading')}</p>
        <LongText text={t('innovation.hero.description')} className="mt-4 border-s-4 border-brand-500 ps-4" textClassName="text-body-lg text-gray-700" />
        <PhotoRail
          images={innovationHeroPhotos.map((photo, index) => (index === 0 ? { ...photo, video: innovationHeroFilm.src } : photo))}
          label={heading}
          className="-mx-4 mt-6"
          gutterClassName="scroll-px-4 px-4"
          itemClassName="aspect-[4/5] w-[78vw] max-w-[22rem] md:w-[calc(50%-6px)] md:max-w-none"
        />
      </section>

      {/* The AI efficiency figure as a type-only moment. */}
      <section className="overflow-hidden bg-charcoal px-4 py-10">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('innovation.stat.eyebrow')}</span>
        <p dir="ltr" className="mt-2 font-sans text-[22vw] font-normal leading-[0.9] tracking-[-0.04em] tabular-nums text-brand-400 rtl:text-end md:text-[14vw]">
          {t('innovation.stat.value')}
        </p>
        <p className="mt-4 max-w-md font-display text-h4 font-semibold leading-snug text-warmwhite">{t('innovation.stat.label')}</p>
      </section>

      {/* Phones: the four initiatives as a swipeable row of cards. */}
      <ChapterRail />

      {/* Tablets: one section per initiative, image beside the text (never full width). */}
      {chapters.map((chapter, index) => {
        const theme = themeClasses[chapter.theme];
        const copy = (field: 'eyebrow' | 'heading' | 'paragraph') => t(`innovation.sections.${chapter.key}.${field}`);
        const acronym = splitAcronym(copy('heading'));
        return (
          <section key={chapter.key} className={cn('hidden px-8 py-12 md:block', theme.section)}>
            <div className="flex items-end gap-3">
              <span dir="ltr" aria-hidden="true" className={cn('font-sans text-[6vw] font-normal leading-[0.85] tracking-[-0.03em] tabular-nums', theme.accent)}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={cn('pb-1 text-eyebrow font-semibold uppercase tracking-widest', theme.accent)}>{copy('eyebrow')}</span>
            </div>
            {/* "Name (ACRONYM)" headings show the acronym alone, as on desktop. */}
            <h3 className={cn('mt-4 font-display text-[7vw] font-bold uppercase leading-[0.9] tracking-[-0.04em]', theme.text)}>{acronym ? acronym.name : copy('heading')}</h3>
            <div className={cn('mt-8 grid grid-cols-2 items-center gap-8', index % 2 === 1 && '[&>*:first-child]:order-2')}>
              <div className="aspect-[16/10] overflow-hidden rounded-md bg-gray-100">
                <img src={chapter.image} alt={chapter.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </div>
              {/* Full paragraph: beside the image there's room for all of it. */}
              <p className={cn('text-body', theme.muted)}>{copy('paragraph')}</p>
            </div>
          </section>
        );
      })}

      {/* Closing statement, as on desktop, set as two poster lines. */}
      <section className="overflow-hidden bg-ink px-4 py-12">
        <h3 className="font-display text-[10vw] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-warmwhite md:text-[7vw]">
          {t('innovation.closing.heading')
            .split(' ')
            .map((word, i) => (
              <span key={word} className={cn('block', i % 2 === 1 && 'text-brand-400')}>
                {word}
              </span>
            ))}
        </h3>
        <p className="mt-6 text-body-lg text-gray-300">{t('innovation.closing.description')}</p>
      </section>
    </>
  );
}
