import { Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { SectionHeader } from '../components/typography/SectionHeader';
import { EmptyState } from '../components/feedback/EmptyState';
import { primaryContact } from '../data/locations';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

export default function CareersPage() {
  const { t } = useTranslation('careers');
  return (
    <>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path="/careers"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Careers', path: '/careers' }]}
      />
      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <SectionHeader
            eyebrow={t('eyebrow')}
            heading={t('heading')}
            headingAs="h2"
            description={t('description')}
          />
          <EmptyState
            icon={Briefcase}
            title={t('emptyState.title')}
            headingAs="h3"
            description={t('emptyState.description', { email: primaryContact.email })}
            action={{ label: t('emptyState.cta'), href: '/contact?type=career' }}
          />
        </Stack>
      </Section>
    </>
  );
}
