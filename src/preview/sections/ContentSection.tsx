import { Section } from '../../components/layout/Section';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { SplitContent } from '../../components/content/SplitContent';
import { FeatureBlock } from '../../components/content/FeatureBlock';
import { Timeline } from '../../components/content/Timeline';
import { ProcessSteps } from '../../components/content/ProcessSteps';
import { companyMilestones, deliveryProcess, featureBlocks, images } from '../../data/sample-content';

/**
 * Background is dark charcoal; every child below inherits the dark content
 * theme automatically from Section's context — no per-component theme props.
 */
export function ContentSection() {
  return (
    <Section id="content" background="charcoal" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Content Blocks"
          heading="Split sections, features, timeline & process"
          description="Rendered on a dark surface to show the theme context propagating automatically to every nested component."
        />

        <SplitContent
          image={images.engineerAtWork}
          imageAlt="Engineer reviewing mechanical drawings on site"
          imageSide="left"
          eyebrow="Digital Engineering"
          heading="Coordinated models before a single pipe is cut"
          description="Every discipline is federated into one LOD 400 model, so clashes are resolved on screen, not on site, and not on the client's budget."
          video="/BIM.mp4"
          statOverlay={{ value: '1,200+', label: 'Projects delivered' }}
          action={{ label: 'See our digital process', href: '#' }}
        />

        <SplitContent
          image={images.siteTeam}
          imageAlt="Site team reviewing installation progress"
          imageSide="right"
          eyebrow="Site Delivery"
          heading="Trade-coordinated execution, sequenced to programme"
          description="Site teams work against a single sequenced programme, with daily progress logged back into project controls."
          action={{ label: 'View our delivery process', href: '#' }}
        />

        <Stack space="md">
          <Heading level="h4">Feature blocks</Heading>
          <Grid variant="three" gap="md">
            {featureBlocks.slice(0, 3).map((block) => (
              <FeatureBlock key={block.heading} {...block} />
            ))}
          </Grid>
        </Stack>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <Stack space="md">
            <Heading level="h4">Timeline</Heading>
            <Timeline items={companyMilestones} />
          </Stack>
          <Stack space="md">
            <Heading level="h4">Process steps</Heading>
            <Text variant="small" muted>
              Wraps to a second row of four on desktop; a single connected column on mobile.
            </Text>
            <ProcessSteps steps={deliveryProcess} />
          </Stack>
        </div>
      </Stack>
    </Section>
  );
}
