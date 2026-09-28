import type { ReactNode } from 'react';
import { FolderSearch } from 'lucide-react';
import { Section } from '../../components/layout/Section';
import { Stack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { Skeleton } from '../../components/feedback/Skeleton';
import { SuccessState } from '../../components/feedback/SuccessState';

export function FeedbackSection() {
  return (
    <Section id="feedback" background="warmwhite" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Feedback States"
          heading="Loading, empty, error & success"
          description="A minimal set of states for asynchronous content. No toast library or notification system included."
        />

        <Stack space="md">
          <Heading level="h4">Loading skeleton</Heading>
          <div className="max-w-md rounded-md border border-gray-200 p-6">
            <Stack space="md">
              <Row>
                <Skeleton variant="circle" className="h-12 w-12" />
                <Stack space="xs" className="flex-1">
                  <Skeleton variant="text" className="w-1/2" />
                  <Skeleton variant="text" className="w-1/3" />
                </Stack>
              </Row>
              <Skeleton variant="block" className="h-40 w-full" />
              <Stack space="xs">
                <Skeleton variant="text" />
                <Skeleton variant="text" className="w-5/6" />
                <Skeleton variant="text" className="w-2/3" />
              </Stack>
            </Stack>
          </div>
        </Stack>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <EmptyState
            icon={FolderSearch}
            title="No projects match your filters"
            description="Adjust the sector or location filters to see more MENASCO project work."
            action={{ label: 'Reset filters', href: '#' }}
          />
          <ErrorState
            title="Couldn't load project data"
            description="Something went wrong while fetching this content. Please try again."
            onRetry={() => undefined}
          />
          <SuccessState
            title="Enquiry received"
            description="A member of our engineering team will respond within one business day."
            action={{ label: 'Back to projects', href: '#' }}
          />
        </div>

        <Text variant="caption" muted>
          These states use plain conditional rendering. No notification or toast system is included in this phase.
        </Text>
      </Stack>
    </Section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-4">{children}</div>;
}
