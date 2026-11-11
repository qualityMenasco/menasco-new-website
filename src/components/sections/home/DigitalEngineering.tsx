import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { placeholderImages } from '../../../data/images';

/** In workflow order — shown as a numbered 01–04 process strip. */
const capabilityKeys = ['federatedBim', 'clashDetection', 'constructability', 'dataDriven'] as const;

/**
 * Deliberately more technical and dark than the surrounding company sections.
 * Intro (eyebrow + heading), a wide image with the description living behind
 * it, then the four capabilities as a numbered process strip.
 */
export function DigitalEngineering() {
  const { t } = useTranslation('home');

  return (
    <Section background="charcoal" spacing="md" edgeFade>
      <Stack space="xl">
        <div className="flex flex-col gap-4">
          <Eyebrow theme="dark">{t('digitalEngineering.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3" theme="dark" className="text-balance">
            {t('digitalEngineering.heading')}
          </Heading>
        </div>

        {/* The description lives behind the image: hovering (or keyboard-
            focusing) the image fades the photo out and brings the text up.
            The text is always in the page, so screen readers read it too. */}
        <div tabIndex={0} className="group relative aspect-[21/9] overflow-hidden rounded-md bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
          <img
            src={placeholderImages.controlRoom}
            alt="Site team in high-visibility gear working on a rebar deck"
            className="h-full w-full object-cover transition-[opacity,transform] duration-500 ease-engineered group-hover:scale-[1.02] group-hover:opacity-15 group-focus-visible:scale-[1.02] group-focus-visible:opacity-15"
          />
          <div className="absolute inset-0 flex items-center justify-center p-8 opacity-0 transition-opacity duration-500 ease-engineered group-hover:opacity-100 group-focus-visible:opacity-100 lg:p-16">
            <Text variant="body-lg" theme="dark" className="max-w-3xl text-center !text-h4 !leading-relaxed !text-warmwhite">
              {t('digitalEngineering.description')}
            </Text>
          </div>
        </div>

        <ol role="list" className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {capabilityKeys.map((key, index) => (
            <li key={key} className="flex flex-col gap-2 border-t border-white/15 pt-5">
              <span className="font-display text-small font-semibold tracking-wide text-brand-400" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="font-semibold text-warmwhite">{t(`digitalEngineering.capabilities.${key}.title`)}</p>
              <Text variant="small" theme="dark" muted>
                {t(`digitalEngineering.capabilities.${key}.description`)}
              </Text>
            </li>
          ))}
        </ol>
      </Stack>
    </Section>
  );
}
