import { ArrowRight, Users } from 'lucide-react';
import { Section } from '../../layout/Section';
import { Container } from '../../layout/Container';
import { Row, Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { SectionHeader } from '../../typography/SectionHeader';
import { ButtonLink } from '../../ui/Button';
import { LeadershipCard } from '../../cards/LeadershipCard';
import { ScrollRevealGroup } from '../../common/ScrollReveal';
import { team } from '../../../data/team';

/**
 * No leadership profiles are published/verified yet (src/data/team.ts is
 * empty), so this renders an honest teaser rather than fabricated bios.
 * The card grid below is fully built and wired — the moment team.ts has 3+
 * verified entries, this component renders it automatically, no further
 * changes needed.
 */
export function LeadershipPreview() {
  if (team.length > 0) {
    return (
      <Section background="stone" spacing="lg" edgeFade>
        <Stack space="xl">
          <SectionHeader
            eyebrow="Leadership"
            heading="Engineering leadership behind every project"
            description="The team steering MENASCO's regional delivery."
            action={{ label: 'Meet the full team', href: '/team' }}
          />
          <ScrollRevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {team.slice(0, 3).map((member) => (
              <LeadershipCard
                key={member.id}
                photo={member.photo ?? ''}
                photoAlt={member.name}
                name={member.name}
                role={member.role}
                bio={member.bio}
                href="/team"
              />
            ))}
          </ScrollRevealGroup>
        </Stack>
      </Section>
    );
  }

  return (
    <Section background="stone" spacing="md" edgeFade>
      <Container>
        <Row justify="between" align="center" wrap className="gap-8">
          <Row space="md" align="center">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warmwhite text-brand-600">
              <Users size={22} aria-hidden="true" />
            </span>
            <div>
              <Eyebrow className="mb-1">Leadership</Eyebrow>
              <Heading level="h3">Engineering leadership behind every project</Heading>
              <Text variant="small" muted className="mt-1">
                Meet the team steering MENASCO's regional delivery.
              </Text>
            </div>
          </Row>
          <ButtonLink href="/team" variant="outline" trailingIcon={ArrowRight}>
            Meet the team
          </ButtonLink>
        </Row>
      </Container>
    </Section>
  );
}
