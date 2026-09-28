import { PreviewNav } from './PreviewNav';
import { FoundationsSection } from './sections/FoundationsSection';
import { LayoutSection } from './sections/LayoutSection';
import { ActionsSection } from './sections/ActionsSection';
import { CardsSection } from './sections/CardsSection';
import { DataSection } from './sections/DataSection';
import { ContentSection } from './sections/ContentSection';
import { InteractiveSection } from './sections/InteractiveSection';
import { FormsSection } from './sections/FormsSection';
import { NavigationSection } from './sections/NavigationSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { Container } from '../components/layout/Container';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { SEO } from '../seo/SEO';

/**
 * Developer-facing component preview only. This is not a website page —
 * it exists to review every component and its essential variants in one place.
 * Reachable at /dev/preview, not linked from the public site.
 */
export default function ComponentPreviewPage() {
  return (
    <div>
      <SEO title="Component Preview" description="Internal design-system component preview. Not a public page." path="/dev/preview" noIndex />
      <PreviewNav />

      <header className="border-b border-gray-200 bg-warmwhite py-16 md:py-20">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>MENASCO Design System</Eyebrow>
            <Heading level="h1" as="h1" className="mt-3">
              Component library preview
            </Heading>
            <Text variant="body-lg" className="mt-4">
              Every reusable component in this phase, shown with realistic MEP and engineering content. Use the bar
              above to jump between sections.
            </Text>
          </div>
        </Container>
      </header>

      <main>
        <FoundationsSection />
        <LayoutSection />
        <ActionsSection />
        <CardsSection />
        <DataSection />
        <ContentSection />
        <InteractiveSection />
        <FormsSection />
        <NavigationSection />
        <FeedbackSection />
      </main>
    </div>
  );
}
