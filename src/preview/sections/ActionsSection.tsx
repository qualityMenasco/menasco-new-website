import { ArrowRight, Download, Mail, Settings } from 'lucide-react';
import { Section } from '../../components/layout/Section';
import { Row, Stack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button, IconButton } from '../../components/ui/Button';

const variants = ['primary', 'secondary', 'outline', 'ghost', 'text'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

export function ActionsSection() {
  return (
    <Section id="actions" background="warmwhite" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Actions"
          heading="Buttons & badges"
          description="One button component covers every call-to-action pattern the site needs, from primary conversions to inline text links."
        />

        <Stack space="md">
          <Heading level="h4">Variants</Heading>
          <Row space="md" wrap>
            {variants.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant === 'primary' ? 'Request a proposal' : variant === 'text' ? 'View all projects' : `${variant} button`}
              </Button>
            ))}
          </Row>
        </Stack>

        <Stack space="md">
          <Heading level="h4">Sizes</Heading>
          <Row space="md" align="center" wrap>
            {sizes.map((size) => (
              <Button key={size} size={size} variant="primary">
                Size {size}
              </Button>
            ))}
          </Row>
        </Stack>

        <Stack space="md">
          <Heading level="h4">Icons, loading & disabled</Heading>
          <Row space="md" wrap>
            <Button variant="primary" trailingIcon={ArrowRight}>
              Explore services
            </Button>
            <Button variant="outline" leadingIcon={Download}>
              Download brochure
            </Button>
            <Button variant="primary" loading>
              Submitting
            </Button>
            <Button variant="primary" disabled>
              Unavailable
            </Button>
          </Row>
        </Stack>

        <Stack space="md">
          <Heading level="h4">Full width</Heading>
          <div className="max-w-sm">
            <Button variant="primary" fullWidth trailingIcon={ArrowRight}>
              Start a project enquiry
            </Button>
          </div>
        </Stack>

        <Stack space="md">
          <Heading level="h4">Icon buttons</Heading>
          <Row space="sm">
            <IconButton icon={Mail} label="Email us" variant="outline" />
            <IconButton icon={Settings} label="Settings" variant="ghost" />
            <IconButton icon={ArrowRight} label="Next" variant="primary" />
          </Row>
        </Stack>

        <Stack space="md">
          <Heading level="h4">Badges</Heading>
          <Row space="sm" wrap>
            <Badge variant="category">MEP Contracting</Badge>
            <Badge variant="location">Dubai, UAE</Badge>
            <Badge variant="sector">Industrial</Badge>
            <Badge variant="status">Ongoing</Badge>
            <Badge variant="certification">ISO 9001</Badge>
          </Row>
        </Stack>

        <Text variant="caption" muted>
          Focus styles are applied globally via `:focus-visible`. Tab through the controls above to verify.
        </Text>
      </Stack>
    </Section>
  );
}
