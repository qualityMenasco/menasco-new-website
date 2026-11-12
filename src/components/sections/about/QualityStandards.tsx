import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';
import { PhotoPlaceholder } from './PhotoPlaceholder';

/** Site photo (753×1280) shown in the 4:5 slot, framed low to keep both vests in view. Without a `src` the slot shows a placeholder. */
const photo: { src?: string; alt?: string } = {
  src: '/about/quality-site.jpg',
  alt: "MENASCO's QA/QC manager and an engineer in high-visibility vests inspecting a completed building",
};

export function QualityStandards() {
  const { t } = useTranslation('about');

  return (
    <Section background="warmwhite" spacing="lg" border="top" edgeFade>
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <Stack space="sm" className="lg:col-span-6">
          <Eyebrow>{t('qualityStandards.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3">
            {t('qualityStandards.heading')}
          </Heading>
          <Text variant="body-lg">{t('qualityStandards.paragraph1')}</Text>
          <Text variant="body-lg">{t('qualityStandards.paragraph2')}</Text>
          <div className="pt-2">
            <ButtonLink href="/quality-safety" variant="primary" trailingIcon={ArrowRight} className="w-fit">
              {t('qualityStandards.exploreMore')}
            </ButtonLink>
          </div>
        </Stack>

        {photo.src ? (
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-gray-100 lg:col-span-5 lg:col-start-8">
            <img src={photo.src} alt={photo.alt ?? ''} loading="lazy" decoding="async" className="h-full w-full object-cover object-[50%_75%]" />
          </div>
        ) : (
          <PhotoPlaceholder label={t('ourApproach.photoPlaceholder')} className="aspect-[4/5] bg-stone lg:col-span-5 lg:col-start-8" />
        )}
      </div>
    </Section>
  );
}
