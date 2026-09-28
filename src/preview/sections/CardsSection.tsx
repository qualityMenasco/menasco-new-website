import { Boxes, Cpu } from 'lucide-react';
import { Section } from '../../components/layout/Section';
import { Grid } from '../../components/layout/Grid';
import { Stack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { Card } from '../../components/cards/Card';
import { CurvedCard } from '../../components/cards/CurvedCard';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { ProjectCard } from '../../components/cards/ProjectCard';
import { images, projects, services } from '../../data/sample-content';

export function CardsSection() {
  return (
    <Section id="cards" background="warmwhite" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Content Cards"
          heading="Four card types, one visual language"
          description="A neutral standard card, a signature chamfered panel, a discipline-focused service card, and a data-forward project card."
        />

        <Stack space="md">
          <Heading level="h4">Standard card, vertical & horizontal</Heading>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card
              image={images.controlRoom}
              imageAlt="Engineer reviewing building systems on a control room display"
              label="Digital Engineering"
              title="Federated BIM coordination"
              description="Every discipline model is merged weekly to resolve clashes before they reach site."
              link={{ label: 'Learn more', href: '#' }}
            />
            <Card
              layout="horizontal"
              image={images.fabrication}
              imageAlt="Ductwork fabrication in the MENASCO manufacturing facility"
              icon={Boxes}
              title="Off-site prefabrication"
              description="Ductwork and piping skids are fabricated to tolerance before delivery to site."
              link={{ label: 'View capability', href: '#' }}
            />
          </div>
        </Stack>

        <Stack space="md">
          <Heading level="h4">Architectural curved-corner card</Heading>
          <Grid variant="three" gap="md">
            <CurvedCard
              number="01"
              icon={Cpu}
              title="Mechanical Engineering"
              description="Chilled water and HVAC systems engineered for UAE climate loads."
              link={{ label: 'Read more', href: '#' }}
              accent="brand"
            />
            <CurvedCard
              number="02"
              icon={Boxes}
              title="BIM & Digital Engineering"
              description="Coordinated LOD 400 models across every discipline."
              link={{ label: 'Read more', href: '#' }}
              accent="sand"
            />
            <CurvedCard
              image={images.factoryFloor}
              imageAlt="Manufacturing floor with fabrication equipment"
              number="03"
              title="Manufacturing & Prefabrication"
              description="In-house fabrication for ductwork, piping, and modular assemblies."
              link={{ label: 'Read more', href: '#' }}
              accent="gray"
            />
          </Grid>
        </Stack>

        <Stack space="md">
          <Heading level="h4">Service cards</Heading>
          <Grid variant="three" gap="md">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </Grid>
        </Stack>

        <Stack space="md">
          <Heading level="h4">Project cards</Heading>
          <Text variant="small" muted>
            Location, sector, scope, and status are always visible, nothing is gated behind hover.
          </Text>
          <div className="flex flex-col gap-6">
            <ProjectCard {...projects[0]} layout="featured" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ProjectCard {...projects[1]} />
              <ProjectCard {...projects[2]} />
            </div>
            <ProjectCard {...projects[3]} layout="horizontal" />
          </div>
        </Stack>
      </Stack>
    </Section>
  );
}
