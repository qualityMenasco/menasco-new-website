import { Building2, Hotel, Route, Server, Ticket } from 'lucide-react';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Grid } from '../../layout/Grid';
import { Stack } from '../../layout/Stack';
import { SectionHeader } from '../../typography/SectionHeader';
import { Heading, Text } from '../../typography/Typography';
import { accentClasses, accentTextClasses, chamferClipPath } from '../../cards/CurvedCard';
import { cn } from '../../../lib/utils';
import { sectors } from '../../../data/sectors';
import type { Accent, IconComponent } from '../../../types';

const sectorIcons: Record<string, typeof Hotel> = {
  building: Building2,
  hotel: Hotel,
  ticket: Ticket,
  server: Server,
  route: Route,
};

const sectorKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  'hospitality-landmark-entertainment': 'hospitalityLandmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
  'infrastructure-utilities': 'infrastructureUtilities',
};

const accentByIndex = ['brand', 'sand', 'gray'] as const;

interface SectorModuleProps {
  icon: IconComponent;
  title: string;
  description: string;
  accent: Accent;
}

/**
 * One sector "module" — a title card and a description card, stacked with a
 * small gap so they read as two layers of one unit rather than unrelated
 * boxes. Each module spans two rows of the parent grid as a subgrid, so the
 * title cards share one row height (the tallest title's) and the description
 * cards all start on the same line, however the titles wrap. Title sizing
 * lives in the .sector-title* rules in styles/index.css.
 */
function SectorModule({ icon: Icon, title, description, accent }: SectorModuleProps) {
  const { t } = useTranslation('common');
  const blurbId = useId();
  const blurbRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  // Blurbs are clamped to the same five lines on every card; "Read more" only
  // appears when the text actually runs past that at the current card width.
  const [clamped, setClamped] = useState(false);

  useLayoutEffect(() => {
    const text = blurbRef.current?.firstElementChild;
    if (!text || expanded) return;
    const measure = () => setClamped(text.scrollHeight > text.clientHeight + 1);
    measure();
    // Web fonts can change the wrap without changing the clamped box's size.
    document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    return () => observer.disconnect();
  }, [description, expanded]);

  return (
    <article className="group row-span-2 grid grid-rows-subgrid gap-2.5">
      <div className="sector-title-card flex flex-col gap-4 border border-gray-200 bg-warmwhite p-6 transition-colors duration-base ease-engineered group-hover:border-gray-300">
        <span className={cn('block h-1 w-16 transition-opacity duration-base', accentClasses[accent])} aria-hidden="true" />
        <div className="sector-title-row flex flex-1 gap-4">
          <span className={cn('inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-stone', accentTextClasses[accent])}>
            <Icon size={22} aria-hidden="true" />
          </span>
          <Heading level="h4" as="h3" className="sector-title min-w-0 leading-snug">
            {title}
          </Heading>
        </div>
      </div>

      {/* self-start: each description card is only as tall as its own text, so
          expanding one leaves its neighbours compact instead of stretching them. */}
      <div
        ref={blurbRef}
        style={chamferClipPath}
        className="flex flex-col items-start gap-2 self-start overflow-hidden border border-gray-200 bg-stone p-6 transition-colors duration-base ease-engineered group-hover:border-gray-300"
      >
        <Text id={blurbId} variant="small" muted className={cn(!expanded && 'line-clamp-5')}>
          {description}
        </Text>
        {/* Always rendered so every collapsed card is the same height; hidden
            (and unfocusable) when the text already fits in five lines. */}
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={blurbId}
          onClick={() => setExpanded((open) => !open)}
          className={cn(
            'text-small font-semibold text-ink underline decoration-gray-300 underline-offset-4 transition-colors duration-base hover:decoration-ink',
            !clamped && !expanded && 'invisible',
          )}
        >
          {expanded ? t('common:buttons.showLess') : t('common:buttons.readMore')}
        </button>
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
                // A homepage-specific title (home:sectors.items) wins over the
                // shared projects-page category title when one is set.
                title={t(`home:sectors.items.${key}.title`, t(`projects:categories.${key}.title`))}
                // Homepage blurbs live in home:sectors.items and are separate
                // from the projects-page category copy. A sector with no blurb
                // falls back to the site's neutral pending-content string
                // rather than i18next's missing-key text.
                description={t(`home:sectors.items.${key}.description`, t('common:pendingContent.notice'))}
                accent={accentByIndex[index % accentByIndex.length]}
              />
            );
          })}
        </Grid>
      </Stack>
    </Section>
  );
}
