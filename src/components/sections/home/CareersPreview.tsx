import { ArrowRight, BookOpen, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';

const careerPathIcons = { internships: BookOpen, jobApplications: Briefcase } as const;
const careerPathKeys = ['internships', 'jobApplications'] as const;

/**
 * Homepage Careers teaser — one call to action only. Left: the pitch and the
 * single button to the careers page. Right: the two opportunity types as
 * quiet, non-clickable information points (same left/right rhythm as the
 * QHSE and BIM intros).
 */
export function CareersPreview() {
  const { t } = useTranslation('home');

  return (
    <Section background="stone" spacing="lg" edgeFade>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-x-10">
        <div className="flex flex-col items-start gap-5 lg:col-span-6">
          <Eyebrow>{t('careersPreview.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3" className="text-balance">
            {t('careersPreview.heading')}
          </Heading>
          <Text variant="body-lg" muted>
            {t('careersPreview.description')}
          </Text>
          <ButtonLink href="/careers" variant="primary" trailingIcon={ArrowRight} className="mt-2">
            {t('careersPreview.cta')}
          </ButtonLink>
        </div>

        <ul role="list" className="divide-y divide-gray-200 border-y border-gray-200 lg:col-span-5 lg:col-start-8">
          {careerPathKeys.map((key) => {
            const Icon = careerPathIcons[key];
            return (
              <li key={key} className="flex items-start gap-4 py-6">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-warmwhite text-brand-600">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-display text-h4 font-semibold text-ink">{t(`careersPreview.${key}.title`)}</p>
                  <Text variant="small" muted>
                    {t(`careersPreview.${key}.description`)}
                  </Text>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
