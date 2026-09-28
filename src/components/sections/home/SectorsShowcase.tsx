import { ArrowRight, Building2, Hotel, Server, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Grid } from '../../layout/Grid';
import { Stack } from '../../layout/Stack';
import { SectionHeader } from '../../typography/SectionHeader';
import { Heading, Text } from '../../typography/Typography';
import { accentClasses, accentTextClasses, chamferClipPath } from '../../cards/CurvedCard';
import { SmartLink } from '../../../lib/SmartLink';
import { cn } from '../../../lib/utils';
import { sectors } from '../../../data/sectors';
import type { Accent, IconComponent } from '../../../types';

const sectorIcons: Record<string, typeof Hotel> = {
  building: Building2,
  hotel: Hotel,
  ticket: Ticket,
  server: Server,
};

const sectorKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  hotels: 'hospitality',
  'landmark-entertainment': 'landmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
};

const accentByIndex = ['brand', 'sand', 'gray'] as const;

interface SectorModuleProps {
  icon: IconComponent;
  title: string;
  description: string;
  accent: Accent;
  link: { label: string; href: string };
}

/**
 * One sector "module" — a title card and a description card, stacked with a
 * small gap so they read as two layers of one unit rather than unrelated
 * boxes. Both halves are grid items in the same row as their siblings, so
 * CSS Grid's default row-stretch already equalizes each module's total
 * height; the title card additionally gets a fixed height (desktop/tablet
 * only, sized to fit the longest title's worst-case wrap) so its own split
 * point lines up across all four modules too, which in turn makes the
 * description cards — and their CTAs — align.
 */
function SectorModule({ icon: Icon, title, description, accent, link }: SectorModuleProps) {
  return (
    <article className="group flex h-full flex-col gap-2.5">
      <div className="flex flex-col gap-4 border border-gray-200 bg-warmwhite p-6 transition-colors duration-base ease-engineered group-hover:border-gray-300 sm:h-[188px]">
        <span className={cn('block h-1 w-16 transition-opacity duration-base', accentClasses[accent])} aria-hidden="true" />
        <div className="flex flex-1 items-center gap-4">
          <span className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-stone', accentTextClasses[accent])}>
            <Icon size={22} aria-hidden="true" />
          </span>
          <Heading level="h4" as="h3" className="leading-snug">
            {title}
          </Heading>
        </div>
      </div>

      <div
        style={chamferClipPath}
        className="flex flex-1 flex-col justify-between gap-5 overflow-hidden border border-gray-200 bg-stone p-6 transition-colors duration-base ease-engineered group-hover:border-gray-300"
      >
        <Text variant="small" muted>
          {description}
        </Text>
        <SmartLink
          href={link.href}
          className={cn('inline-flex w-fit items-center gap-1.5 text-small font-semibold transition-colors duration-base', accentTextClasses[accent], 'hover:opacity-80')}
        >
          {link.label}
          <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-base ease-engineered group-hover:translate-x-0.5" />
        </SmartLink>
      </div>
    </article>
  );
}

export function SectorsShowcase() {
  const { t } = useTranslation(['home', 'projects', 'common']);

  return (
    <Section background="warmwhite" spacing="lg" containerWidth="wide" edgeFade>
      <Stack space="xl">
        <SectionHeader
          eyebrow={t('home:sectors.eyebrow')}
          heading={t('home:sectors.heading')}
          headingAs="h3"
          description={t('home:sectors.description')}
        />
        <Grid variant="four" gap="sm">
          {sectors.map((sector, index) => {
            const key = sectorKeys[sector.slug] ?? sector.slug;
            return (
              <SectorModule
                key={sector.id}
                icon={sectorIcons[sector.icon]}
                title={t(`projects:categories.${key}.title`)}
                description={t(`projects:categories.${key}.description`)}
                accent={accentByIndex[index % accentByIndex.length]}
                link={{ label: t('common:buttons.learnMore'), href: `/projects/categories?category=${sector.slug}` }}
              />
            );
          })}
        </Grid>
      </Stack>
    </Section>
  );
}
