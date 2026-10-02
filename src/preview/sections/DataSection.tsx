import { Section } from '../../components/layout/Section';
import { Stack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { Statistic } from '../../components/content/Statistic';
import { KeyValueList, ProfessionalList } from '../../components/content/ProfessionalList';
import { capabilityChecklist, companyStats, projectSpecSheet, singleStat } from '../../data/sample-content';

export function DataSection() {
  return (
    <Section id="data" background="stone" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Data Display"
          heading="Statistics & lists"
          description="One statistic component covers single figures, rows, and grids. One list component covers bullets, rules, hairline dividers, numbering, and technical spec sheets."
        />

        <Stack space="md">
          <Heading level="h4">Single statistic</Heading>
          <Statistic layout="single" items={singleStat} />
        </Stack>

        <Stack space="md">
          <Heading level="h4">Statistics row</Heading>
          <Statistic layout="row" items={companyStats} />
        </Stack>

        <Stack space="md">
          <Heading level="h4">Statistics grid</Heading>
          <Statistic layout="grid" columns={4} items={companyStats} />
        </Stack>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <Stack space="sm">
            <Text variant="small" muted className="font-semibold">
              Rule marker
            </Text>
            <ProfessionalList items={capabilityChecklist} variant="rule" />
          </Stack>
          <Stack space="sm">
            <Text variant="small" muted className="font-semibold">
              Numbered
            </Text>
            <ProfessionalList
              variant="numbered"
              items={[
                { title: 'Design', description: 'Engineering concept and load calculations.' },
                { title: 'Coordination', description: 'BIM clash detection across disciplines.' },
                { title: 'Installation', description: 'Sequenced, trade-coordinated site execution.' },
              ]}
            />
          </Stack>
          <Stack space="sm">
            <Text variant="small" muted className="font-semibold">
              Technical key-value layout
            </Text>
            <KeyValueList items={projectSpecSheet} />
          </Stack>
        </div>

        <Stack space="sm">
          <Text variant="small" muted className="font-semibold">
            Arrow icons, two-column layout
          </Text>
          <ProfessionalList
            variant="arrow"
            columns={2}
            items={[
              { title: 'Design-build and EPC contracting' },
              { title: 'In-house BIM coordination' },
              { title: 'Off-site fabrication capability' },
              { title: 'ISO 9001 certified operations' },
              { title: 'NFPA compliant fire systems' },
              { title: 'Regional delivery across the UAE' },
            ]}
          />
        </Stack>
      </Stack>
    </Section>
  );
}
