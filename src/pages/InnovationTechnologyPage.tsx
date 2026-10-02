import { Brain, Camera, ClipboardCheck, ClipboardList, Cpu, Database, FileSearch, LineChart, Network, Scale, ScanSearch, Users, Workflow } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { SmartLink } from '../lib/SmartLink';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { SectionThemeContext, useSectionTheme } from '../lib/theme-context';
import { useTransparentHeader } from '../app/header-transparency';
import { placeholderImages } from '../data/images';
import { cn } from '../lib/utils';
import type { IconComponent, Theme } from '../types';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

/** Icon + title only — no description. Shared by "Where We're Investing" and each ecosystem section's 2–4 highlights. */
function MiniHighlight({ icon: Icon, title, theme, className }: { icon: IconComponent; title: string; theme?: Theme; className?: string }) {
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-md border px-5 py-5',
        isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-warmwhite',
        className,
      )}
    >
      <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-sm', isDark ? 'bg-white/10 text-brand-400' : 'bg-stone text-brand-600')}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <Text theme={resolvedTheme} className="font-display font-semibold">
        {title}
      </Text>
    </div>
  );
}

function InnovationHero() {
  const { t } = useTranslation('about');
  useTransparentHeader(true);
  return (
    <section className="relative flex min-h-[70vh] scroll-mt-24 items-end overflow-hidden bg-ink md:min-h-[75vh]">
      <img
        src="/innovation-technology-hero.jpg"
        alt="MENASCO engineer using an AI-powered digital dashboard on the factory floor"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-transparent rtl:bg-gradient-to-l" />

      <Container className="relative z-10 pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="max-w-3xl">
          <Eyebrow theme="dark">{t('innovation.hero.eyebrow')}</Eyebrow>
          <Heading level="display" as="h2" theme="dark" className="mt-4">
            {t('innovation.hero.heading')}
          </Heading>
          <Text theme="dark" className="mt-4 font-display text-h3 font-semibold text-warmwhite">
            {t('innovation.hero.subheading')}
          </Text>
          <Text variant="body-lg" theme="dark" className="mt-6 max-w-xl text-gray-200">
            {t('innovation.hero.description')}
          </Text>
        </div>
      </Container>
    </section>
  );
}

interface Highlight {
  icon: IconComponent;
  title: string;
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
  highlights: Highlight[];
  /** Small secondary link (e.g. a product's privacy policy) — never the section's primary CTA. */
  secondaryLink?: { label: string; href: string };
}

/**
 * Shared shell for every Technology Ecosystem section (including ATLAS —
 * see the "Intelligent Compliance" call below): one short paragraph, a
 * prominent image, and 2–4 icon+title highlights — no long lists. The
 * image-left/image-right variants alternate across sections to create
 * visual rhythm down the page. Every section — including the first —
 * shares this exact same structure, proportions, typography, and
 * animation so the page reads as one continuous story.
 */
function EcosystemSection({ icon: Icon, eyebrow, heading, background, imageSrc, imageAlt, layout, paragraph, caption, highlights, secondaryLink }: EcosystemSectionProps) {
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
        <Stack space="lg">
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {highlights.map((item) => (
              <MiniHighlight key={item.title} icon={item.icon} title={item.title} />
            ))}
          </div>
          {secondaryLink && (
            <SmartLink href={secondaryLink.href} className="text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700">
              {secondaryLink.label}
            </SmartLink>
          )}
        </Stack>
      </Section>
    </ScrollReveal>
  );
}

interface TranslatedSection {
  eyebrow: string;
  heading: string;
  paragraph: string;
  highlights: string[];
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
        highlights={[
          { icon: FileSearch, title: s.atlas.highlights[0] },
          { icon: Workflow, title: s.atlas.highlights[1] },
          { icon: Brain, title: s.atlas.highlights[2] },
          { icon: Database, title: s.atlas.highlights[3] },
        ]}
      />

      {/* LYNXqc — MENASCO's field quality management platform. Second by
          position, directly beneath ATLAS, per the approved page order. */}
      <EcosystemSection
        icon={ClipboardCheck}
        eyebrow={s.lynxqc.eyebrow}
        heading={s.lynxqc.heading}
        background="stone"
        imageSrc="/mobile-applications-hero.jpg"
        imageAlt="Engineer using LYNXqc on a mobile device to log a field quality issue on site"
        layout="left"
        paragraph={s.lynxqc.paragraph}
        highlights={[
          { icon: Brain, title: s.lynxqc.highlights[0] },
          { icon: Camera, title: s.lynxqc.highlights[1] },
          { icon: Workflow, title: s.lynxqc.highlights[2] },
          { icon: ClipboardList, title: s.lynxqc.highlights[3] },
        ]}
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
        highlights={[
          { icon: LineChart, title: s.ai.highlights[0] },
          { icon: Workflow, title: s.ai.highlights[1] },
          { icon: Brain, title: s.ai.highlights[2] },
          { icon: ScanSearch, title: s.ai.highlights[3] },
        ]}
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
        highlights={[
          { icon: LineChart, title: s.dataLake.highlights[0] },
          { icon: Database, title: s.dataLake.highlights[1] },
          { icon: Cpu, title: s.dataLake.highlights[2] },
          { icon: Brain, title: s.dataLake.highlights[3] },
        ]}
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
        highlights={[
          { icon: Workflow, title: s.connect.highlights[0] },
          { icon: Network, title: s.connect.highlights[1] },
          { icon: LineChart, title: s.connect.highlights[2] },
          { icon: Users, title: s.connect.highlights[3] },
        ]}
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
