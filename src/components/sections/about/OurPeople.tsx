import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';

// Portrait frame, anchored to the bottom so both his face and the MENASCO logo on the vest show.
const OUR_PEOPLE_IMAGE = '/about-our-people.jpg';

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

        {/* The photo is 4:5 at most widths; where the copy wraps taller (narrow laptops)
            it stretches to the text's height instead, cropping in from the sides. */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-md bg-gray-100 lg:h-full">
              <img
                src={OUR_PEOPLE_IMAGE}
                alt="A MENASCO engineer in a high-visibility vest at the MENASCO office"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-bottom"
              />
            </div>
          </div>

          <Stack space="md" as="article" className="lg:self-center">
            {/* Set larger than body-lg on desktop (stepping up on wider screens) so the copy balances the portrait beside it. */}
            <Stack space="sm" className="lg:gap-7">
              <Text variant="body-lg" className="lg:text-[1.3125rem] lg:leading-[1.6] xl:text-[1.5rem]">{t('ourPeople.paragraph1')}</Text>
              <Text variant="body-lg" className="lg:text-[1.3125rem] lg:leading-[1.6] xl:text-[1.5rem]">{t('ourPeople.paragraph2')}</Text>
              <Text variant="body-lg" className="lg:text-[1.3125rem] lg:leading-[1.6] xl:text-[1.5rem]">{t('ourPeople.paragraph3')}</Text>
            </Stack>
          </Stack>
        </div>
      </div>
    </Section>
  );
}
