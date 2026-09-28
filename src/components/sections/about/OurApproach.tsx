import { Boxes, Handshake, ShieldCheck, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ScrollRevealGroup } from '../../common/ScrollReveal';
import type { IconComponent } from '../../../types';

const pillarIcons = { earlyEngagement: Handshake, bimCoordination: Boxes, disciplinedExecution: Target, reliableDelivery: ShieldCheck } as const;
const pillarKeys = ['earlyEngagement', 'bimCoordination', 'disciplinedExecution', 'reliableDelivery'] as const;

interface ApproachPillarProps {
  icon: IconComponent;
  title: string;
  description: string;
}

/**
 * Same split title-card/description-card system as SectorsShowcase's
 * "Where We Work" modules: a fixed-height title card (so varying title
 * lengths don't distort card proportions) stacked on an equal-height
 * description card, both stretched to match their row via CSS Grid,
 * animating as one hoverable unit.
 */
function ApproachPillar({ icon: Icon, title, description }: ApproachPillarProps) {
  return (
    <article className="group flex h-full flex-col gap-2.5">
      <div className="flex flex-col gap-4 rounded-md border border-gray-200 bg-warmwhite p-5 shadow-sm transition-colors duration-base ease-engineered group-hover:border-gray-300 sm:min-h-[172px]">
        <div className="flex flex-1 items-center gap-2.5">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-warmwhite text-brand-600">
            <Icon size={22} aria-hidden="true" />
          </span>
          {/* Custom size/line-height (not the shared h3 token) — tuned to fit
              two clean lines inside this card's narrower 4-column width
              without wrapping awkwardly to three lines or overflowing. */}
          <h3 className="min-w-0 flex-1 font-display text-[clamp(1.0625rem,0.9rem+0.55vw,1.375rem)] font-semibold leading-[1.1] text-ink">
            {title}
          </h3>
        </div>
      </div>

      <div className="flex-1 rounded-md border border-gray-200 bg-warmwhite p-6 shadow-sm transition-colors duration-base ease-engineered group-hover:border-gray-300">
        <Text>{description}</Text>
      </div>
    </article>
  );
}

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
        <ScrollRevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {pillarKeys.map((key) => (
            <ApproachPillar
              key={key}
              icon={pillarIcons[key]}
              title={t(`ourApproach.pillars.${key}.title`)}
              description={t(`ourApproach.pillars.${key}.description`)}
            />
          ))}
        </ScrollRevealGroup>
      </Stack>
    </Section>
  );
}
