import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';

export interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
}

/** Shared stand-in for routes whose full content hasn't been published yet — keeps navigation, SEO, and layout consistent while content is pending. */
export function PagePlaceholder({ eyebrow, title, description }: PagePlaceholderProps) {
  return (
    <Section spacing="lg" background="warmwhite">
      <Stack space="md">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading level="h1" as="h1">
          {title}
        </Heading>
        <Text variant="body-lg" className="max-w-2xl">
          {description}
        </Text>
      </Stack>
    </Section>
  );
}
