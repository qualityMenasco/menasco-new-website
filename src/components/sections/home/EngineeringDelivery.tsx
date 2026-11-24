import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { SmartLink } from '../../../lib/SmartLink';
import { ImagePlaceholder } from '../../services/ServiceBlocks';

interface CardProps {
  id: string;
  /** Omit to show a placeholder (captioned with `placeholder`) until a photo is supplied. */
  image?: string;
  alt?: string;
  placeholder?: string;
  position?: string;
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  linkLabel: string;
}

/**
 * A photo card: eyebrow and heading over the lower part of the image (bottom
 * gradient for legibility), a small "Learn More" in the top corner. The whole image is one
 * link to the service page and eases in on hover; the body text sits below
 * the image.
 */
function OverlayCard({ id, image, alt = '', placeholder = '', position = 'object-center', eyebrow, heading, description, href, linkLabel }: CardProps) {
  return (
    <article id={id} className="flex flex-col">
      <SmartLink
        href={href}
        className="group relative flex aspect-[16/10] items-end overflow-hidden rounded-md bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {image ? (
          <img
            src={image}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover ${position} transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none`}
          />
        ) : (
          // Caption sits in the upper part of the frame, clear of the heading at the bottom.
          <ImagePlaceholder dark label={placeholder} className="absolute inset-0 !justify-start !rounded-none !border-0 !pt-10" />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/0" />
        {/* Top corner (end side): small "Learn More" on a soft dark chip so it reads over any photo. */}
        <span className="absolute end-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-ink/45 px-3 py-1.5 text-small font-semibold text-warmwhite backdrop-blur-sm xl:end-6 xl:top-6">
          {linkLabel}
          <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-base group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </span>
        <div className="relative flex flex-col p-7 xl:p-8">
          <Eyebrow theme="dark">{eyebrow}</Eyebrow>
          <Heading level="h3" as="h3" theme="dark" className="mt-3 text-balance">
            {heading}
          </Heading>
        </div>
      </SmartLink>
      <Text muted className="mt-5 max-w-xl">
        {description}
      </Text>
    </article>
  );
}

/**
 * BIM & digital engineering and modular MEP fabrication as one section
 * (desktop): two equal photo cards side by side, each image linking to its
 * service page, with the body text below it. Stone, between the warm-white Global
 * Hubs and the dark Quality & Safety band.
 */
export function EngineeringDelivery() {
  const { t } = useTranslation('home');

  return (
    <Section background="stone" spacing="md">
      <div className="grid grid-cols-2 gap-6">
        <OverlayCard
          id="bim"
          image="/Menasco_Engineers_Reviewing_BIM_Model.jpg"
          alt="Two Menasco engineers reviewing a coordinated 3D MEP model on a large display"
          position="object-[60%_35%]"
          eyebrow={t('digitalEngineering.eyebrow')}
          heading={t('digitalEngineering.heading')}
          description={t('digitalEngineering.description')}
          href="/services/civil"
          linkLabel={t('engineeringLearnMore')}
        />
        <OverlayCard
          id="manufacturing"
          // Client-supplied pump-skid module photo (2026-11-24), with the Modular Fabrication page's photo finish.
          image="/home/Menasco_Pump_Skid_Module_Factory_Floor.jpg"
          alt={t('prefabrication.imageAlt')}
          eyebrow={t('prefabrication.eyebrow')}
          heading={t('prefabrication.heading')}
          description={t('prefabrication.mobileDescription')}
          href="/services/manufacturing-prefabrication"
          linkLabel={t('engineeringLearnMore')}
        />
      </div>
    </Section>
  );
}
