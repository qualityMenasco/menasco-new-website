import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';

interface CardProps {
  id: string;
  image: string;
  alt: string;
  position: string;
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  cta: string;
}

/**
 * One full-bleed photo card with its text set over the lower part of the
 * image (bottom gradient for legibility), matching the phone/tablet
 * manufacturing card. The photo eases in on hover.
 */
function OverlayCard({ id, image, alt, position, eyebrow, heading, description, href, cta }: CardProps) {
  return (
    <article id={id} className="group relative flex min-h-[34rem] items-end overflow-hidden rounded-md bg-ink">
      <img
        src={image}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${position} transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none`}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/0" />
      <div className="relative flex flex-col p-8 xl:p-10">
        <Eyebrow theme="dark">{eyebrow}</Eyebrow>
        <Heading level="h3" as="h3" theme="dark" className="mt-3 text-balance">
          {heading}
        </Heading>
        <Text className="mt-3 max-w-xl text-gray-200" theme="dark">
          {description}
        </Text>
        <ButtonLink href={href} variant="outline" theme="dark" trailingIcon={ArrowRight} className="mt-6 w-fit">
          {cta}
        </ButtonLink>
      </div>
    </article>
  );
}

/**
 * BIM & digital engineering and modular MEP fabrication as one section
 * (desktop): two equal photo cards side by side, text over each image, each
 * with a button to its service page. Stone, between the warm-white Global
 * Hubs and the dark Quality & Safety band.
 */
export function EngineeringDelivery() {
  const { t } = useTranslation('home');

  return (
    <Section background="stone" spacing="md">
      <div className="grid grid-cols-2 gap-6">
        <OverlayCard
          id="bim"
          image="/home-bim-coordination.jpg"
          alt="Two Menasco engineers reviewing a coordinated 3D MEP model on a large display"
          position="object-[60%_35%]"
          eyebrow={t('digitalEngineering.eyebrow')}
          heading={t('digitalEngineering.heading')}
          description={t('digitalEngineering.description')}
          href="/services/bim-digital-engineering"
          cta={t('digitalEngineering.cta')}
        />
        <OverlayCard
          id="manufacturing"
          image="/manufacturing-prefab-hero.jpg"
          alt="Ductwork fabrication on the MENASCO manufacturing floor"
          position="object-center"
          eyebrow={t('prefabrication.eyebrow')}
          heading={t('prefabrication.heading')}
          description={t('prefabrication.mobileDescription')}
          href="/services/manufacturing-prefabrication"
          cta={t('prefabrication.cta')}
        />
      </div>
    </Section>
  );
}
