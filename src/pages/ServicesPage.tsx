import { useTranslation } from 'react-i18next';
import { Grid } from '../components/layout/Grid';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { SectionHeader } from '../components/typography/SectionHeader';
import { ServiceCard } from '../components/cards/ServiceCard';
import { services } from '../data/services';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
  'bim-digital-engineering': 'bimDigitalEngineering',
  'manufacturing-prefabrication': 'manufacturingPrefabrication',
};

export default function ServicesPage() {
  const { t } = useTranslation('services');

  return (
    <>
      <SEO
        title={t('seo.title')}
        description={t('seo.description')}
        path="/services"
        pageType="CollectionPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }]}
      />
      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <SectionHeader
            eyebrow={t('listing.eyebrow')}
            heading={t('listing.heading')}
            headingAs="h2"
            description={t('listing.description')}
          />
          <Grid variant="three" gap="md">
            {services.map((service) => {
              const key = serviceKeys[service.slug] ?? service.slug;
              const name = t(`items.${key}.name`);
              return (
                <ServiceCard
                  key={service.id}
                  image={service.image}
                  imageAlt={`MENASCO ${name} services`}
                  title={name}
                  description={t(`items.${key}.shortDescription`)}
                  link={{ label: t('listing.exploreService', { name }), href: `/services/${service.slug}` }}
                />
              );
            })}
          </Grid>
        </Stack>
      </Section>
    </>
  );
}
