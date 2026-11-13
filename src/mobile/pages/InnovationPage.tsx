import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PhotoRail } from '../components/PhotoRail';
import { ExpandableText } from '../components/ExpandableText';
import { LocaleLink } from '../components/LocaleLink';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { SEO } from '../../seo/SEO';
import { innovationHeroFilm, innovationHeroPhotos } from '../../data/innovationPhotos';
import { placeholderImages } from '../../data/images';
import { cn } from '../lib/utils';
import { splitAcronym, textOutline } from '../../lib/textOutline';
import {} from '../../seo/structuredData';

const outline = textOutline;

type Chapter = {
  key: 'atlas' | 'lynxqc' | 'ai' | 'connect';
  image: string;
  imageAlt: string;
  /** Title size: short names go poster-sized, long ones stay readable. Scales with viewport width. */
  titleClass: string;
  theme: 'light' | 'stone' | 'dark';
  link?: { href: string };
};

/** Same order and images as the desktop page: ATLAS → LYNX → AI → MENASCO Connect. */
const chapters: Chapter[] = [
  {
    key: 'atlas',
    image: '/intelligent-compliance-hero.jpg',
    imageAlt: 'Precision-engineered modern architecture reflecting regulatory and design compliance',
    // Applies to the short name "ATLAS"; its full meaning is set small beneath.
    titleClass: 'text-[29vw] md:text-[22vw] !leading-[0.8]',
    theme: 'light',
  },
  {
    key: 'lynxqc',
    image: '/mobile-applications-hero.jpg',
    imageAlt: 'Engineer using LYNX on a mobile device to log a field quality issue on site',
    titleClass: 'text-[31vw] md:text-[24vw]',
    theme: 'dark',
    link: { href: '/lynxqc/privacy-policy' },
  },
  {
    key: 'ai',
    image: '/ai-automation-hero.jpg',
    imageAlt: 'Modern engineering design reflecting intelligent, technology-driven construction',
    // Sized so "ENGINEERING" (the longest word) always fits one line, down to 320px.
    titleClass: 'text-[12vw] md:text-[10vw]',
    theme: 'stone',
  },
  {
    key: 'connect',
    image: placeholderImages.blueprintReview,
    imageAlt: 'Engineering documentation and coordinated business processes',
    titleClass: 'text-[13vw] md:text-[10vw]',
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
 * poster-scale display type, giant outlined index numbers and figures, and
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
              <span className="block text-[12.8vw]">{lineOne}</span>
              <span className="block whitespace-nowrap text-[11vw]">
                <span className="text-brand-600">&amp; {lineTwo}</span>
              </span>
            </>
          ) : (
            <span className="block text-balance text-[14vw] leading-[1.05]">{lineOne}</span>
          )}
        </h2>
        <p className="mt-6 font-display text-h4 font-semibold uppercase leading-tight tracking-tight text-ink">{t('innovation.hero.subheading')}</p>
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
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">{t('innovation.sections.ai.eyebrow')}</span>
        <p dir="ltr" className="mt-2 font-display text-[38vw] font-bold leading-[0.8] tracking-[-0.06em] text-brand-400 rtl:text-end md:text-[28vw]">
          {t('innovation.stat.value')}
        </p>
        <p className="mt-4 max-w-md font-display text-h3 font-semibold uppercase leading-tight tracking-tight text-warmwhite">{t('innovation.stat.label')}</p>
      </section>

      {chapters.map((chapter, index) => {
        const theme = themeClasses[chapter.theme];
        // Same copy as the desktop page.
        const copy = (field: 'eyebrow' | 'heading' | 'paragraph' | 'privacyPolicyLink') => t(`innovation.sections.${chapter.key}.${field}`);
        const acronym = splitAcronym(copy('heading'));
        return (
          <section key={chapter.key} className={cn('overflow-hidden py-10', theme.section)}>
            <div className="px-4">
              <div className="flex items-end gap-3">
                <span dir="ltr" aria-hidden="true" className={cn('font-display text-[24vw] font-bold leading-[0.75] tracking-[-0.05em] md:text-[16vw]', theme.accent)} style={outline(2)}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={cn('pb-1 text-eyebrow font-semibold uppercase tracking-widest', theme.accent)}>{copy('eyebrow')}</span>
              </div>
              {acronym ? (
                // "Name (ACRONYM)" headings: the acronym as the poster, the meaning beneath, no parentheses.
                <h3 className={theme.text}>
                  <span className={cn('mt-4 block font-display font-bold uppercase leading-[0.9] tracking-[-0.04em]', chapter.titleClass)}>{acronym.name}</span>
                  <span className="mt-3 block font-display text-h4 font-semibold uppercase tracking-tight">{acronym.meaning}</span>
                </h3>
              ) : (
                <h3 className={cn('mt-4 break-words font-display font-bold uppercase leading-[0.9] tracking-[-0.04em]', chapter.titleClass, theme.text)}>
                  {copy('heading')}
                </h3>
              )}
            </div>
            <div className="mt-6 aspect-[16/10] bg-gray-100 md:mx-4 md:overflow-hidden md:rounded-md">
              <img src={chapter.image} alt={chapter.imageAlt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </div>
            <div className="px-4">
              <LongText
                text={copy('paragraph')}
                className="mt-6"
                textClassName={cn('text-body-lg', theme.muted)}
                buttonClassName={theme.accent}
              />
              {chapter.link && (
                <LocaleLink to={chapter.link.href} className={cn('mt-4 inline-flex items-center gap-1.5 text-small font-semibold', theme.accent)}>
                  {copy('privacyPolicyLink')}
                  <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
                </LocaleLink>
              )}
            </div>
          </section>
        );
      })}

      {/* Closing statement, as on desktop, set as two poster lines. */}
      <section className="overflow-hidden bg-ink px-4 py-12">
        <h3 className="font-display text-[12.5vw] font-bold uppercase leading-[0.88] tracking-[-0.04em] text-warmwhite md:text-[10vw]">
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
