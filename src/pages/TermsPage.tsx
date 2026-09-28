import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Heading, Text } from '../components/typography/Typography';
import { NavSectionH1 } from '../components/typography/NavSectionH1';
import { SEO } from '../seo/SEO';

export default function TermsPage() {
  const { t } = useTranslation('legal');
  return (
    <>
      <NavSectionH1 section="home" />
      <SEO title={t('terms.seo.title')} description={t('terms.seo.description')} path="/terms" />
      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <Heading level="h1" as="h2">
            {t('terms.heading')}
          </Heading>
          <Text variant="body-lg" className="max-w-2xl">
            {t('terms.body')}
          </Text>
        </Stack>
      </Section>
    </>
  );
}
