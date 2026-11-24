import { ArrowDown, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';
import { foundingYear } from '../../../data/companyStats';

/**
 * About MENASCO (desktop home): the company introduction beside a static
 * photo of a MENASCO technician at a control panel, directly under the hero. "What we deliver" is its own
 * section further down (ServicesShowcase).
 */
export function CompanyIntro() {
  const { t } = useTranslation('home');
  return (
    <Section background="stone" spacing="sm">
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-12 md:items-center">
        {/* Left: the introduction and a link to the About page. */}
        <Stack space="sm" className="md:col-span-7 lg:col-span-6 lg:row-start-1">
          <Eyebrow>{t('home:companyIntro.eyebrow')}</Eyebrow>
          <Heading level="h3" as="h3" className="max-w-3xl text-balance">
            {t('home:companyIntro.heading', { years: new Date().getFullYear() - foundingYear })}
          </Heading>
          <Text className="max-w-2xl">
            {t('home:companyIntro.description', { foundingYear })}
          </Text>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/about" variant="primary" trailingIcon={ArrowRight}>
              {t('home:companyIntro.cta')}
            </ButtonLink>
            {/* Scrolls down to "What we deliver" on this page (SmartLink handles "/#id"). */}
            <ButtonLink href="/#services" variant="outline" trailingIcon={ArrowDown}>
              {t('home:companyIntro.exploreServices')}
            </ButtonLink>
          </div>
        </Stack>

        {/* Desktop: a short brand-blue rule between the text and the photo (decorative). */}
        <span aria-hidden="true" className="hidden h-3/5 w-0.5 self-center justify-self-center bg-brand-600/40 lg:col-start-7 lg:row-start-1 lg:block" />

        {/* Right: one static portrait photo, centred in the last five columns: a MENASCO
            technician at an electrical control panel (supplied by the client 2026-11-24;
            720 x 1280 source, framed to keep the hard hat and the MENASCO logo on the coveralls). */}
        <div className="md:col-span-5 lg:col-start-8 lg:row-start-1">
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-gray-100 lg:mx-auto lg:max-w-[22rem]">
            <img
              src="/about/Menasco_Technician_At_Electrical_Control_Panel.jpg"
              alt="A MENASCO technician in a yellow hard hat and branded coveralls working on an electrical control panel"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-[50%_78%]"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
