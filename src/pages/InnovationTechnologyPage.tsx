import { Brain, ClipboardCheck, Database, Network, Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { SmartLink } from '../lib/SmartLink';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { SectionThemeContext } from '../lib/theme-context';
import { placeholderImages } from '../data/images';
import { innovationHeroFilm, innovationHeroPhotos } from '../data/innovationPhotos';
import { AutoplayVideo } from '../components/common/AutoplayVideo';
import { PhotoWithVideo } from '../components/sections/community/PhotoWithVideo';
import type { IconComponent } from '../types';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

/**
 * Opens the page with the title and introduction beside the portrait film and
 * the two event photos stacked on its right (the page has no dark cover image,
 * so the header stays in its light theme). The film's aspect ratio sets the
 * row height; the photo column stretches to match.
 *
 * Below 1280px the container stops being full width and the film would have
 * to shrink, so the layout collapses to text + the two photos side by side,
 * with a "Watch the video" button on the first photo that opens the film
 * full screen (the inline film is display:none there, so it never downloads).
 */
function InnovationHero() {
  const { t } = useTranslation('about');
  return (
    <Section spacing="lg" background="stone">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4 self-center">
          <Eyebrow>{t('innovation.hero.eyebrow')}</Eyebrow>
          <Heading level="h1" as="h2" className="mt-4 text-balance">
            {/* Non-breaking space keeps the "&" with "Innovation" so it never wraps onto a line alone. */}
            {t('innovation.hero.heading').replace(' & ', ' & ')}
          </Heading>
          <Text className="mt-4 font-display text-h4 font-semibold text-ink">{t('innovation.hero.subheading')}</Text>
          <Text variant="body-lg" muted className="mt-5">
            {t('innovation.hero.description')}
          </Text>
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

interface EcosystemSectionProps {
  icon: IconComponent;
  eyebrow: string;
  heading: string;
  background: 'warmwhite' | 'stone';
  imageSrc: string;
  imageAlt: string;
  /** Places a half-width image beside the text, alternating sides down the page for visual rhythm. */
  layout: 'left' | 'right';
  paragraph: string;
  caption?: string;
  /** Small secondary link (e.g. a product's privacy policy) — never the section's primary CTA. */
  secondaryLink?: { label: string; href: string };
}

/**
 * Shared shell for every Technology Ecosystem section (including ATLAS —
 * see the "Intelligent Compliance" call below): one short paragraph beside
 * a prominent image — no lists or highlight tiles. The
 * image-left/image-right variants alternate across sections to create
 * visual rhythm down the page. Every section — including the first —
 * shares this exact same structure, proportions, typography, and
 * animation so the page reads as one continuous story.
 */
function EcosystemSection({ icon: Icon, eyebrow, heading, background, imageSrc, imageAlt, layout, paragraph, caption, secondaryLink }: EcosystemSectionProps) {
  const header = (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
      <Icon size={18} aria-hidden="true" />
    </span>
  );

  const textColumn = (
    <Stack space="sm" as="article">
      {header}
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading level="h2" as="h3">
        {heading}
      </Heading>
      <Text variant="body-lg">{paragraph}</Text>
      {caption && (
        <Text variant="small" muted>
          {caption}
        </Text>
      )}
      {secondaryLink && (
        <SmartLink href={secondaryLink.href} className="self-start text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700">
          {secondaryLink.label}
        </SmartLink>
      )}
    </Stack>
  );

  const imageColumn = (
    <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
      <img src={imageSrc} alt={imageAlt} className="h-full w-full object-cover" />
    </div>
  );

  return (
    <ScrollReveal>
      <Section background={background} spacing="md" edgeFade>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {layout === 'left' ? (
            <>
              {imageColumn}
              {textColumn}
            </>
          ) : (
            <>
              {textColumn}
              {imageColumn}
            </>
          )}
        </div>
      </Section>
    </ScrollReveal>
  );
}

interface TranslatedSection {
  eyebrow: string;
  heading: string;
  paragraph: string;
  privacyPolicyLink?: string;
}

export default function InnovationTechnologyPage() {
  const { t } = useTranslation('about');
  const s = t('innovation.sections', { returnObjects: true }) as Record<
    'atlas' | 'lynxqc' | 'ai' | 'dataLake' | 'connect',
    TranslatedSection
  >;

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

      {/* Opens the page's technology story — first by position and content
          importance, not by a special layout. Uses the exact same shared
          section shell (image-right this time, alternating into AI's
          image-left) as every other ecosystem section below it. */}
      <EcosystemSection
        icon={Scale}
        eyebrow={s.atlas.eyebrow}
        heading={s.atlas.heading}
        background="warmwhite"
        imageSrc="/intelligent-compliance-hero.jpg"
        imageAlt="Precision-engineered modern architecture reflecting regulatory and design compliance"
        layout="right"
        paragraph={s.atlas.paragraph}
      />

      {/* LYNX — MENASCO's field quality management platform. Second by
          position, directly beneath ATLAS, per the approved page order. */}
      <EcosystemSection
        icon={ClipboardCheck}
        eyebrow={s.lynxqc.eyebrow}
        heading={s.lynxqc.heading}
        background="stone"
        imageSrc="/mobile-applications-hero.jpg"
        imageAlt="Engineer using LYNX on a mobile device to log a field quality issue on site"
        layout="left"
        paragraph={s.lynxqc.paragraph}
        secondaryLink={s.lynxqc.privacyPolicyLink ? { label: s.lynxqc.privacyPolicyLink, href: '/lynxqc/privacy-policy' } : undefined}
      />

      <EcosystemSection
        icon={Brain}
        eyebrow={s.ai.eyebrow}
        heading={s.ai.heading}
        background="warmwhite"
        imageSrc="/ai-automation-hero.jpg"
        imageAlt="Modern engineering design reflecting intelligent, technology-driven construction"
        layout="right"
        paragraph={s.ai.paragraph}
      />

      <EcosystemSection
        icon={Database}
        eyebrow={s.dataLake.eyebrow}
        heading={s.dataLake.heading}
        background="stone"
        imageSrc="/enterprise-data-lake-hero.jpg"
        imageAlt="Modern engineering facility representing enterprise-scale infrastructure"
        layout="left"
        paragraph={s.dataLake.paragraph}
      />

      <EcosystemSection
        icon={Network}
        eyebrow={s.connect.eyebrow}
        heading={s.connect.heading}
        background="warmwhite"
        imageSrc={placeholderImages.blueprintReview}
        imageAlt="Engineering documentation and coordinated business processes"
        layout="right"
        paragraph={s.connect.paragraph}
      />

      <ScrollReveal>
        <SectionThemeContext.Provider value="dark">
          <section className="relative overflow-hidden bg-ink py-16 md:py-24">
            <img
              src={placeholderImages.glassFacade}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/90 to-ink" />
            <Container className="relative z-10">
              <div className="mx-auto max-w-2xl text-center">
                <Heading level="h2" as="h3" theme="dark">
                  {t('innovation.closing.heading')}
                </Heading>
                <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
                  {t('innovation.closing.description')}
                </Text>
              </div>
            </Container>
          </section>
        </SectionThemeContext.Provider>
      </ScrollReveal>
    </>
  );
}
