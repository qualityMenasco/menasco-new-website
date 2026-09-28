import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Section } from '../../components/layout/Section';
import { Stack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/typography/Typography';
import { SectionHeader } from '../../components/typography/SectionHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { MenascoLogo } from '../../components/brand/MenascoLogo';
import {
  CertificationStrip,
  CompanySummary,
  ContactBlock,
  DesktopNav,
  FooterContainer,
  FooterLinkGroup,
  HeaderShell,
  LegalRow,
  LocationBlock,
  MobileNav,
  SocialLinks,
} from '../../components/navigation';
import { certifications, footerLinkGroups, legalLinks, officeLocations, primaryNav, socialLinks } from '../../data/sample-content';

function Logo() {
  return (
    <a href="#" className="flex items-center">
      <MenascoLogo className="h-9" />
    </a>
  );
}

export function NavigationSection() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Section id="navigation" background="warmwhite" spacing="lg">
      <Stack space="xl">
        <SectionHeader
          eyebrow="Site Chrome"
          heading="Header & footer building blocks"
          description="Structural pieces only. Final navigation content and routing are assembled in the next phase."
        />

        <Stack space="md">
          <Heading level="h4">Header shell: hover &quot;Services&quot; for the mega menu, &quot;Projects&quot; for a dropdown</Heading>
          <div className="overflow-visible rounded-md border border-gray-200">
            <HeaderShell
              logo={<Logo />}
              nav={<DesktopNav items={primaryNav} />}
              actions={
                <Button variant="primary" size="sm">
                  Request a proposal
                </Button>
              }
              mobileControl={<IconButton icon={Menu} label="Open menu" variant="ghost" onClick={() => setMobileNavOpen(true)} />}
              sticky={false}
            />
          </div>
          <Text variant="caption" muted>
            The mobile navigation panel is available at every viewport width for review. Open it with the button below.
          </Text>
          <div>
            <Button variant="outline" size="sm" leadingIcon={Menu} onClick={() => setMobileNavOpen(true)}>
              Preview mobile navigation
            </Button>
          </div>
          <MobileNav
            items={primaryNav}
            isOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
            actions={
              <Button variant="primary" fullWidth>
                Request a proposal
              </Button>
            }
          />
        </Stack>

        <Stack space="md">
          <Heading level="h4">Footer building blocks</Heading>
          <div className="overflow-hidden rounded-md border border-white/10">
            <FooterContainer theme="dark">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <CompanySummary
                  logo={<MenascoLogo className="h-10" onDark />}
                  description="A UAE-based MEP, engineering, construction, and manufacturing contractor delivering design-build projects since 1988."
                />
                {footerLinkGroups.map((group) => (
                  <FooterLinkGroup key={group.heading} heading={group.heading} links={group.links} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-12 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
                <ContactBlock phone="+971 4 000 0000" email="info@menascouae.com" address="Al Quoz Industrial Area 3, Dubai, UAE" />
                {officeLocations.slice(0, 2).map((location) => (
                  <LocationBlock key={location.name} {...location} />
                ))}
                <Stack space="md">
                  <Text variant="small" muted className="font-semibold uppercase tracking-wide">
                    Follow
                  </Text>
                  <SocialLinks links={socialLinks} />
                </Stack>
              </div>

              <CertificationStrip certifications={certifications} />

              <LegalRow copyrightText={`© ${new Date().getFullYear()} MENASCO. All rights reserved.`} links={legalLinks} />
            </FooterContainer>
          </div>
        </Stack>
      </Stack>
    </Section>
  );
}
