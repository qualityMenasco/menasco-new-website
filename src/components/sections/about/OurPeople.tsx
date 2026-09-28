import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';

const OUR_PEOPLE_IMAGE = '/civil-engineer-reviews-construction-plans-urban-construction-site_146671-151367.avif';

/** "Our People" — alternates image-left against WhoWeAre's image-right above. */
export function OurPeople() {
  const { t } = useTranslation('about');

  return (
    <Section background="warmwhite" spacing="lg" edgeFade>
      <div className="flex flex-col gap-8">
        <div className="w-full">
          <Eyebrow>{t('ourPeople.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3" className="mt-2">
            {t('ourPeople.heading')}
          </Heading>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-gray-100">
              <img
                src={OUR_PEOPLE_IMAGE}
                alt="MENASCO engineer reviewing construction drawings on an active site"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <Stack space="md" as="article">
            <Stack space="sm">
              <Text variant="body-lg">{t('ourPeople.paragraph1')}</Text>
              <Text variant="body-lg">{t('ourPeople.paragraph2')}</Text>
              <Text variant="body-lg">{t('ourPeople.paragraph3')}</Text>
            </Stack>
          </Stack>
        </div>
      </div>
    </Section>
  );
}
