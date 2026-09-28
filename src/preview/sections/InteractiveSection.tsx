import { Section } from '../../components/layout/Section';
import { Stack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { Accordion } from '../../components/ui/Accordion';
import { Tabs } from '../../components/ui/Tabs';
import { capabilitySummaries, capabilityTabLabels, faqItems } from '../../data/sample-content';

const underlineTabs = capabilityTabLabels.map((label) => ({
  id: label.toLowerCase().replace(/[^a-z]+/g, '-'),
  label,
  content: <Text>{capabilitySummaries[label]}</Text>,
}));

const pillTabs = underlineTabs;

export function InteractiveSection() {
  return (
    <Section id="interactive" background="warmwhite" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Interactive"
          heading="Accordion & tabs"
          description="Fully keyboard-navigable with correct ARIA roles. Arrow keys move focus, and panels animate only when motion is allowed."
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Stack space="md">
            <Heading level="h4">Tabs, underline</Heading>
            <Tabs tabs={underlineTabs} variant="underline" />
          </Stack>
          <Stack space="md">
            <Heading level="h4">Tabs, pill</Heading>
            <Tabs tabs={pillTabs} variant="pill" />
          </Stack>
        </div>

        <Stack space="md">
          <Heading level="h4">Accordion, single-open</Heading>
          <Accordion items={faqItems} defaultOpenIds={[faqItems[0].id]} />
        </Stack>
      </Stack>
    </Section>
  );
}
