import { Section, type SectionSpacing } from '../layout/Section';
import { Stack } from '../layout/Stack';
import { Heading, Text } from '../typography/Typography';

export interface ProjectsHeroProps {
  title: string;
  description: string;
  spacing?: SectionSpacing;
}

/** Restrained editorial introduction shared by the Projects landing page and Project Categories page. */
export function ProjectsHero({ title, description, spacing = 'md' }: ProjectsHeroProps) {
  return (
    <Section spacing={spacing} background="warmwhite">
      <Stack space="sm" className="max-w-2xl">
        <Heading level="h1" as="h2">
          {title}
        </Heading>
        <Text variant="body-lg" className="max-w-xl">
          {description}
        </Text>
      </Stack>
    </Section>
  );
}
