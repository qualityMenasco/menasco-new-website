import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Heading, Text } from '../components/typography/Typography';
import { NavSectionH1 } from '../components/typography/NavSectionH1';
import { primaryContact } from '../data/locations';
import { SEO } from '../seo/SEO';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation('legal');
  return (
    <>
      <NavSectionH1 section="home" />
      <SEO title={t('privacy.seo.title')} description={t('privacy.seo.description')} path="/privacy-policy" />
      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <Heading level="h1" as="h2">
            {t('privacy.heading')}
          </Heading>
          <Text variant="body-lg" className="max-w-2xl">
            {t('privacy.body')}
          </Text>
          <Text muted className="max-w-2xl">
            {t('privacy.contactNote', { email: primaryContact.email })}
          </Text>
        </Stack>
      </Section>
    </>
  );
}
