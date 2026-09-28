import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';
import { LeadershipMiniCard } from '../../cards/LeadershipMiniCard';
import { leadershipProfiles } from '../../../data/leadership';

/** "Who We Are" — company overview beside a compact leadership feature, alternating with OurPeople below. */
export function WhoWeAre() {
  const { t } = useTranslation('about');

  return (
    <Section background="warmwhite" spacing="lg" edgeFade>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_2fr] lg:gap-12">
        <Stack space="md" as="article">
          <Eyebrow>{t('whoWeAre.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3">
            {t('whoWeAre.heading')}
          </Heading>
          <Stack space="sm">
            <Text variant="body-lg">{t('whoWeAre.paragraph1')}</Text>
            <Text variant="body-lg">{t('whoWeAre.paragraph2')}</Text>
            <Text variant="body-lg">{t('whoWeAre.paragraph3')}</Text>
          </Stack>
          <Text variant="body-lg" className="border-s-2 border-brand-500 ps-4 font-semibold text-ink">
            {t('whoWeAre.quote')}
          </Text>
        </Stack>

        <Stack space="sm" className="lg:mt-[100px]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {leadershipProfiles.map((leader) => {
              const translatedRole = (() => {
                const key = `team.titles.${leader.role}`;
                const translated = t(key);
                return translated === key ? leader.role : translated;
              })();
              return (
                <LeadershipMiniCard
                  key={leader.slug}
                  href={`/leadership/${leader.slug}`}
                  photo={leader.photo}
                  photoAlt={leader.cardPhotoAlt}
                  name={leader.cardName}
                  role={translatedRole}
                />
              );
            })}
          </div>
          <div className="flex justify-center pt-2">
            <ButtonLink href="/team" variant="outline" size="sm">
              {t('whoWeAre.meetTheTeam')}
            </ButtonLink>
          </div>
        </Stack>
      </div>
    </Section>
  );
}
