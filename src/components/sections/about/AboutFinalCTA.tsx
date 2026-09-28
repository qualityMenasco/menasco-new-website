import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionThemeContext } from '../../../lib/theme-context';
import { Container } from '../../layout/Container';
import { Row } from '../../layout/Stack';
import { Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';
import { COMPANY_PROFILE_PATH } from '../../../seo/constants';

export function AboutFinalCTA() {
  const { t } = useTranslation(['about', 'common']);

  return (
    <SectionThemeContext.Provider value="dark">
      <section className="bg-gradient-to-br from-brand-800 via-brand-900 to-ink py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Heading level="h1" as="h3" theme="dark">
              {t('about:finalCta.heading')}
            </Heading>
            <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
              {t('about:finalCta.description')}
            </Text>
            <Row space="md" justify="center" wrap className="mt-8">
              <ButtonLink href="/projects/categories" variant="secondary" size="lg" theme="dark" trailingIcon={ArrowRight}>
                {t('common:buttons.exploreProjects')}
              </ButtonLink>
              <ButtonLink
                href={COMPANY_PROFILE_PATH}
                download="MENASCO-Company-Profile.pdf"
                variant="outline"
                size="lg"
                theme="dark"
                leadingIcon={Download}
              >
                {t('common:buttons.downloadCompanyProfile')}
              </ButtonLink>
            </Row>
          </div>
        </Container>
      </section>
    </SectionThemeContext.Provider>
  );
}
