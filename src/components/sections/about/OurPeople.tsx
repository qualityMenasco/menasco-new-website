import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';

// Portrait, cropped to the height of the text beside it (framed on his face and vest).
const OUR_PEOPLE_IMAGE = '/Menasco_Our_People_Engineer_Portrait.jpg';

/** "Our People" — alternates image-left against WhoWeAre's image-right above. */
export function OurPeople() {
  const { t } = useTranslation('about');

  return (
    <Section background="warmwhite" spacing="md" edgeFade>
      <div className="flex flex-col gap-8">
        <div className="w-full">
          <Eyebrow>{t('ourPeople.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3" className="mt-2">
            {t('ourPeople.heading')}
          </Heading>
        </div>

        {/* Photo + copy as one group, centred on the page (equal space either side). Body-size
            copy (as elsewhere on the page) sets the row height; the photo column has a fixed
            width, stretches to that height and the image is absolutely positioned so it never
            adds height of its own. */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[17rem_minmax(0,30rem)] md:justify-center md:gap-14 lg:grid-cols-[21rem_minmax(0,33rem)] lg:gap-20 xl:grid-cols-[23rem_minmax(0,33rem)] xl:gap-24">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-gray-100 md:aspect-auto">
            <img
              src={OUR_PEOPLE_IMAGE}
              alt="A MENASCO engineer in a high-visibility vest at the MENASCO office"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[50%_40%]"
            />
          </div>

          <Stack space="sm" as="article">
            <Text variant="body-lg">{t('ourPeople.paragraph1')}</Text>
            <Text variant="body-lg">{t('ourPeople.paragraph2')}</Text>
            <Text variant="body-lg">{t('ourPeople.paragraph3')}</Text>
          </Stack>
        </div>
      </div>
    </Section>
  );
}
