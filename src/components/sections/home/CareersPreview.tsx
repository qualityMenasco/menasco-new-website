import { BookOpen, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { SectionHeader } from '../../typography/SectionHeader';
import { CareerPathCard } from '../../cards/CareerPathCard';
import { ScrollRevealGroup } from '../../common/ScrollReveal';

const careerPathIcons = { internships: BookOpen, jobApplications: Briefcase } as const;
const careerPathKeys = ['internships', 'jobApplications'] as const;

export function CareersPreview() {
  const { t } = useTranslation('home');

  return (
    <Section background="stone" spacing="lg" edgeFade>
      <Stack space="xl">
        <SectionHeader
          eyebrow={t('careersPreview.eyebrow')}
          heading={t('careersPreview.heading')}
          headingAs="h3"
          description={t('careersPreview.description')}
          action={{ label: t('careersPreview.cta'), href: '/careers' }}
        />

        <ScrollRevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
          {careerPathKeys.map((key) => (
            <CareerPathCard
              key={key}
              icon={careerPathIcons[key]}
              title={t(`careersPreview.${key}.title`)}
              description={t(`careersPreview.${key}.description`)}
              href="/careers"
            />
          ))}
        </ScrollRevealGroup>
      </Stack>
    </Section>
  );
}
