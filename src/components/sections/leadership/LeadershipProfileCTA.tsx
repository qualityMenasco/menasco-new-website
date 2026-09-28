import { useTranslation } from 'react-i18next';
import { SectionThemeContext } from '../../../lib/theme-context';
import { Container } from '../../layout/Container';
import { Row } from '../../layout/Stack';
import { Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';

/** Shared bottom CTA for both leadership profile pages. */
export function LeadershipProfileCTA() {
  const { t } = useTranslation('about');
  return (
    <SectionThemeContext.Provider value="dark">
      <section className="bg-gradient-to-br from-brand-800 via-brand-900 to-ink py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Heading level="h1" as="h3" theme="dark">
              {t('team.profileCta.heading')}
            </Heading>
            <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
              {t('team.profileCta.description')}
            </Text>
            <Row space="md" justify="center" wrap className="mt-8">
              <ButtonLink href="/team" variant="secondary" size="lg" theme="dark">
                {t('team.profileCta.meetTheTeam')}
              </ButtonLink>
              <ButtonLink href="/about" variant="outline" size="lg" theme="dark">
                {t('team.profileCta.exploreMenasco')}
              </ButtonLink>
            </Row>
          </div>
        </Container>
      </section>
    </SectionThemeContext.Provider>
  );
}
