import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { AutoplayVideo } from '../../common/AutoplayVideo';

/** "What drives every milestone" reel, trimmed and cleaned of its Instagram overlay. 768×1104 portrait. */
const FILM = { src: '/about/what-drives-every-milestone.mp4', poster: '/about/what-drives-every-milestone-poster.jpg' };

/** Photo beside the film, with the approach statement beneath it. */
const PHOTO = {
  src: '/about/approach-engineer.jpg',
  alt: 'A MENASCO engineer in a hard hat and high-visibility vest reviewing drawings, under the MENASCO name',
};

/** "Our Approach" — the section heading over the film, a photo and the approach statement beneath it. */
export function OurApproach() {
  const { t } = useTranslation('about');

  return (
    <Section background="stone" spacing="lg" edgeFade>
      <Stack space="xl">
        <Stack space="sm" className="max-w-2xl">
          <Eyebrow>{t('ourApproach.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3">
            {t('ourApproach.heading')}
          </Heading>
        </Stack>
        {/* Film on the left; the photo with the statement beneath it in a narrower
            column aligned to the right edge, centred on the film. */}
        <div className="grid grid-cols-12 items-center gap-8">
          <AutoplayVideo
            src={FILM.src}
            poster={FILM.poster}
            alt={t('ourApproach.filmAlt')}
            className="col-span-4 aspect-[768/1104] w-full rounded-md"
          />
          {/* Thin rule centred in the gap between the film and the right column, inset from top and bottom. */}
          <div aria-hidden="true" className="col-span-2 col-start-5 flex items-center justify-center self-stretch">
            <span className="h-4/5 w-px bg-gray-300" />
          </div>
          <div className="col-span-6 col-start-7">
            <div className="aspect-[2/1] overflow-hidden rounded-md bg-gray-100">
              {/* Keeps the MENASCO lettering and the engineer in frame. */}
              <img src={PHOTO.src} alt={PHOTO.alt} loading="lazy" decoding="async" className="h-full w-full object-cover object-[50%_32%]" />
            </div>
            <Text variant="body-lg" className="mt-6">
              {t('ourApproach.description')}
            </Text>
          </div>
        </div>
      </Stack>
    </Section>
  );
}
