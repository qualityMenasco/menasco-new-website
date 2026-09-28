import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Heading, Text } from '../components/typography/Typography';
import { NavSectionH1 } from '../components/typography/NavSectionH1';
import { ProfessionalList } from '../components/content/ProfessionalList';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';
import {
  lynxqcPrivacyPolicySections,
  lynxqcPrivacyPolicyLastUpdated,
  lynxqcPrivacyPolicyContactEmail,
  type LynxqcPolicySubsection,
  type PolicyBlock,
} from '../data/lynxqcPrivacyPolicy';

/** Renders `**bold**` spans from the source policy text as <strong>. */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}

function Blocks({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === 'list' ? (
          <ProfessionalList key={i} variant="bullet" items={block.items.map((item) => ({ title: item }))} className="max-w-2xl" />
        ) : (
          <Text key={i} className="max-w-2xl">
            <InlineText text={block.text} />
          </Text>
        ),
      )}
    </>
  );
}

function Subsection({ subsection }: { subsection: LynxqcPolicySubsection }) {
  return (
    <Stack space="xs">
      {subsection.heading && (
        <Text className="font-display font-semibold uppercase tracking-wide text-ink">{subsection.heading}</Text>
      )}
      <Blocks blocks={subsection.blocks} />
    </Stack>
  );
}

/**
 * Single shared implementation for both desktop and mobile (like /contact
 * and /dev/preview) — a long-form legal document doesn't need a divergent
 * visual treatment per breakpoint; the existing Section/Stack/Heading/Text
 * components it reuses are already responsive.
 */
export default function LynxqcPrivacyPolicyPage() {
  const { t } = useTranslation('legal');

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={t('lynxqcPrivacy.seo.title')}
        description={t('lynxqcPrivacy.seo.description')}
        path="/lynxqc/privacy-policy"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Innovation & Technology', path: '/innovation-technology' },
          { label: 'LYNXqc Privacy Policy', path: '/lynxqc/privacy-policy' },
        ]}
      />

      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <Stack space="xs">
            <Heading level="h1" as="h2">
              {t('lynxqcPrivacy.heading')}
            </Heading>
            <Text muted>{t('lynxqcPrivacy.lastUpdated', { date: lynxqcPrivacyPolicyLastUpdated })}</Text>
            <Text variant="small" muted className="max-w-2xl">
              {t('lynxqcPrivacy.englishOnlyNote')}
            </Text>
          </Stack>

          {/* The policy text itself is always English (see the note above) —
              set explicitly regardless of the page's own locale/direction so
              it reads naturally left-to-right rather than being mirrored by
              the surrounding Arabic RTL context. */}
          <Stack space="lg" dir="ltr" className="text-left">
            {lynxqcPrivacyPolicySections.map((section) => (
              <Stack key={section.heading} space="sm" className="border-t border-gray-200 pt-8 first:border-t-0 first:pt-0">
                <Heading level="h3" as="h3">
                  {section.heading}
                </Heading>
                {section.blocks && <Blocks blocks={section.blocks} />}
                {section.subsections && (
                  <Stack space="md">
                    {section.subsections.map((subsection) => (
                      <Subsection key={subsection.heading ?? section.heading} subsection={subsection} />
                    ))}
                  </Stack>
                )}
                {section.heading === '12. Contact Information' && (
                  <Text className="max-w-2xl">
                    <a href={`mailto:${lynxqcPrivacyPolicyContactEmail}`} className="font-semibold text-brand-600 hover:text-brand-700">
                      {lynxqcPrivacyPolicyContactEmail}
                    </a>
                  </Text>
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Section>
    </>
  );
}
