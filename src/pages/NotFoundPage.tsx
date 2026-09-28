import { Compass } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { EmptyState } from '../components/feedback/EmptyState';
import { SEO } from '../seo/SEO';

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" noIndex />
      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <EmptyState
            icon={Compass}
            title="Page not found"
            description="The page you're looking for may have moved or no longer exists."
            action={{ label: 'Back to homepage', href: '/' }}
            headingAs="h1"
          />
        </Stack>
      </Section>
    </>
  );
}
