import { Container } from '../../components/layout/Container';
import { Grid } from '../../components/layout/Grid';
import { Row, Stack } from '../../components/layout/Stack';
import { Section } from '../../components/layout/Section';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';

function DemoBlock({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div className={`flex items-center justify-center rounded-sm border border-dashed border-gray-300 bg-stone px-4 py-8 text-center ${tall ? 'h-full min-h-[10rem]' : ''}`}>
      <Text variant="small" muted className="font-semibold">
        {label}
      </Text>
    </div>
  );
}

const gridVariants = [
  { variant: 'two' as const, label: '2×2, two-column', items: ['Mechanical', 'Electrical', 'Plumbing', 'Fire & Life Safety'] },
  { variant: 'three' as const, label: 'Three-column', items: ['Mechanical', 'Electrical', 'Plumbing'] },
  { variant: 'four' as const, label: 'Four-column', items: ['Mechanical', 'Electrical', 'Plumbing', 'Fire Safety'] },
  { variant: 'asymmetrical' as const, label: 'Asymmetrical, 3fr / 2fr', items: ['Dubai South Logistics Hub', 'Project Fact Sheet'] },
  { variant: 'featured' as const, label: 'Featured, first item spans 2×2', items: ['Featured Project', 'Sector', 'Location', 'Status', 'Delivery'] },
];

export function LayoutSection() {
  return (
    <Section id="layout" background="stone" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Layout Primitives"
          heading="Container, Grid, and Stack"
          description="Four building blocks handle every layout composition in this system. No bespoke layout components required."
        />

        <Stack space="md">
          <Heading level="h4">Container widths</Heading>
          <Stack space="sm">
            {(['narrow', 'standard', 'wide', 'full'] as const).map((width) => (
              <Container key={width} width={width} gutter={width !== 'full'}>
                <div className="rounded-sm border border-gray-300 bg-warmwhite px-4 py-3">
                  <Text variant="small" muted className="font-semibold">
                    width=&quot;{width}&quot;
                  </Text>
                </div>
              </Container>
            ))}
          </Stack>
        </Stack>

        <Stack space="lg">
          <Heading level="h4">Grid variants</Heading>
          {gridVariants.map((demo) => (
            <Stack key={demo.variant} space="sm">
              <Text variant="small" muted className="font-semibold">
                {demo.label}
              </Text>
              <Grid variant={demo.variant} gap="sm">
                {demo.items.map((item) => (
                  <DemoBlock key={item} label={item} tall={demo.variant === 'featured'} />
                ))}
              </Grid>
            </Stack>
          ))}
        </Stack>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Stack space="sm">
            <Text variant="small" muted className="font-semibold">
              Stack, vertical, space=&quot;sm&quot;
            </Text>
            <Stack space="sm" className="rounded-sm border border-gray-300 bg-warmwhite p-4">
              <DemoBlock label="Design" />
              <DemoBlock label="Procurement" />
              <DemoBlock label="Installation" />
            </Stack>
          </Stack>
          <Stack space="sm">
            <Text variant="small" muted className="font-semibold">
              Row, responsive, wraps below sm
            </Text>
            <Row space="sm" className="rounded-sm border border-gray-300 bg-warmwhite p-4">
              <DemoBlock label="Testing" />
              <DemoBlock label="Commissioning" />
              <DemoBlock label="Handover" />
            </Row>
          </Stack>
        </div>
      </Stack>
    </Section>
  );
}
