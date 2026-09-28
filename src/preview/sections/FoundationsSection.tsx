import { Section } from '../../components/layout/Section';
import { Stack } from '../../components/layout/Stack';
import { Eyebrow, Heading, StatText, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';

const colorGroups: { name: string; swatches: { label: string; className: string }[] }[] = [
  {
    name: 'Brand red',
    swatches: [
      { label: '400', className: 'bg-brand-400' },
      { label: '600', className: 'bg-brand-600' },
      { label: '800', className: 'bg-brand-800' },
      { label: '950', className: 'bg-brand-950' },
    ],
  },
  {
    name: 'Dark surfaces',
    swatches: [
      { label: 'ink', className: 'bg-ink' },
      { label: 'charcoal', className: 'bg-charcoal' },
      { label: 'graphite', className: 'bg-graphite' },
      { label: 'slatealt', className: 'bg-slatealt' },
    ],
  },
  {
    name: 'Light surfaces',
    swatches: [
      { label: 'warmwhite', className: 'bg-warmwhite border border-gray-200' },
      { label: 'stone', className: 'bg-stone' },
      { label: 'gray-100', className: 'bg-gray-100' },
      { label: 'gray-300', className: 'bg-gray-300' },
    ],
  },
  {
    name: 'Sand / metallic accent',
    swatches: [
      { label: '200', className: 'bg-sand-200' },
      { label: '400', className: 'bg-sand-400' },
      { label: '500', className: 'bg-sand-500' },
      { label: '600', className: 'bg-sand-600' },
    ],
  },
  {
    name: 'Status',
    swatches: [
      { label: 'success', className: 'bg-success' },
      { label: 'warning', className: 'bg-warning' },
      { label: 'error', className: 'bg-error' },
      { label: 'info', className: 'bg-info' },
    ],
  },
];

const spacingTokens = [
  { label: 'space-2', className: 'w-2' },
  { label: 'space-4', className: 'w-4' },
  { label: 'space-6', className: 'w-6' },
  { label: 'space-8', className: 'w-8' },
  { label: 'space-12', className: 'w-12' },
  { label: 'space-18', className: 'w-18' },
  { label: 'space-22', className: 'w-22' },
  { label: 'space-30', className: 'w-30' },
];

const radiusTokens = [
  { label: 'sm', className: 'rounded-sm' },
  { label: 'DEFAULT', className: 'rounded' },
  { label: 'md', className: 'rounded-md' },
  { label: 'lg', className: 'rounded-lg' },
  { label: 'xl2', className: 'rounded-xl2' },
];

const shadowTokens = [
  { label: 'soft', className: 'shadow-soft' },
  { label: 'strong', className: 'shadow-strong' },
];

export function FoundationsSection() {
  return (
    <Section id="foundations" background="warmwhite" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Design System"
          heading="Foundations"
          description="Color, typography, spacing, radius, and shadow tokens are defined once in tailwind.config.js and consumed consistently across every component."
        />

        <Stack space="lg">
          <Heading level="h4">Color</Heading>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {colorGroups.map((group) => (
              <Stack key={group.name} space="sm">
                <Text variant="small" muted className="font-semibold">
                  {group.name}
                </Text>
                <div className="flex gap-2">
                  {group.swatches.map((swatch) => (
                    <div key={swatch.label} className="flex flex-col items-center gap-1.5">
                      <div className={`h-12 w-12 rounded-sm ${swatch.className}`} />
                      <Text variant="caption" muted>
                        {swatch.label}
                      </Text>
                    </div>
                  ))}
                </div>
              </Stack>
            ))}
          </div>
        </Stack>

        <Stack space="lg">
          <Heading level="h4">Typography</Heading>
          <Stack space="md">
            <div>
              <Text variant="caption" muted className="mb-1">
                Display
              </Text>
              <Heading level="display">Engineering excellence, delivered</Heading>
            </div>
            <div>
              <Text variant="caption" muted className="mb-1">
                H1
              </Text>
              <Heading level="h1">Mechanical, electrical & plumbing systems</Heading>
            </div>
            <div>
              <Text variant="caption" muted className="mb-1">
                H2
              </Text>
              <Heading level="h2">Fire and life safety engineering</Heading>
            </div>
            <div>
              <Text variant="caption" muted className="mb-1">
                H3
              </Text>
              <Heading level="h3">BIM-coordinated project delivery</Heading>
            </div>
            <div>
              <Text variant="caption" muted className="mb-1">
                H4
              </Text>
              <Heading level="h4">Off-site manufacturing capability</Heading>
            </div>
            <div>
              <Text variant="caption" muted className="mb-1">
                Body Large
              </Text>
              <Text variant="body-lg">MENASCO delivers design-build MEP contracts across every emirate, from concept through commissioning.</Text>
            </div>
            <div>
              <Text variant="caption" muted className="mb-1">
                Body
              </Text>
              <Text variant="body">Our engineering teams coordinate mechanical, electrical, and fire systems under a single federated model.</Text>
            </div>
            <div>
              <Text variant="caption" muted className="mb-1">
                Small
              </Text>
              <Text variant="small">Certified to ISO 9001, ISO 14001, and ISO 45001 across all active sites.</Text>
            </div>
            <div className="flex flex-wrap items-end gap-8">
              <div>
                <Text variant="caption" muted className="mb-1">
                  Eyebrow
                </Text>
                <Eyebrow>Fire & Life Safety</Eyebrow>
              </div>
              <div>
                <Text variant="caption" muted className="mb-1">
                  Caption
                </Text>
                <Text variant="caption">Photographed on site, Dubai South, 2023.</Text>
              </div>
              <div>
                <Text variant="caption" muted className="mb-1">
                  Statistic
                </Text>
                <StatText>1,200+</StatText>
              </div>
            </div>
          </Stack>
        </Stack>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          <Stack space="md">
            <Heading level="h4">Radius</Heading>
            <div className="flex flex-wrap gap-4">
              {radiusTokens.map((token) => (
                <div key={token.label} className="flex flex-col items-center gap-1.5">
                  <div className={`h-14 w-14 border border-gray-300 bg-stone ${token.className}`} />
                  <Text variant="caption" muted>
                    {token.label}
                  </Text>
                </div>
              ))}
            </div>
          </Stack>
          <Stack space="md">
            <Heading level="h4">Shadow</Heading>
            <div className="flex flex-wrap gap-6">
              {shadowTokens.map((token) => (
                <div key={token.label} className="flex flex-col items-center gap-1.5">
                  <div className={`h-14 w-14 rounded-md bg-warmwhite ${token.className}`} />
                  <Text variant="caption" muted>
                    {token.label}
                  </Text>
                </div>
              ))}
            </div>
          </Stack>
        </div>

        <Stack space="md">
          <Heading level="h4">Spacing</Heading>
          <Stack space="xs">
            {spacingTokens.map((token) => (
              <div key={token.label} className="flex items-center gap-3">
                <div className={`h-3 bg-brand-500 ${token.className}`} />
                <Text variant="caption" muted>
                  {token.label}
                </Text>
              </div>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Section>
  );
}
