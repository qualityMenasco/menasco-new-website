import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';

export interface LeadershipHeroProps {
  personName: string;
  photo: string;
  photoAlt: string;
  eyebrow: string;
  role: string;
  /** Founder's optional intro paragraph, or the CEO's statement + supporting line. */
  children?: ReactNode;
}

/** Compact two-column hero shared by both leadership profile pages — portrait left, identity right. */
export function LeadershipHero({ personName, photo, photoAlt, eyebrow, role, children }: LeadershipHeroProps) {
  const { t } = useTranslation('about');
  return (
    <Section spacing="md" background="warmwhite">
      <Stack space="lg">
        <ButtonLink href="/about" variant="text" size="sm" leadingIcon={ArrowLeft} className="w-fit">
          {t('team.backToAbout')}
        </ButtonLink>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[2fr_3fr] lg:gap-14">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-md bg-gray-100 lg:mx-0">
            <div className="aspect-[4/5] overflow-hidden">
              <img src={photo} alt={photoAlt} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="flex gap-5">
            <span aria-hidden="true" className="mt-1 hidden w-0.5 shrink-0 self-stretch bg-brand-500 sm:block" />
            <Stack space="sm">
              <Eyebrow>{eyebrow}</Eyebrow>
              <Heading level="h1" as="h2">
                {personName}
              </Heading>
              <Text variant="body-lg" className="font-semibold text-brand-600">
                {role}
              </Text>
              {children}
            </Stack>
          </div>
        </div>
      </Stack>
    </Section>
  );
}
