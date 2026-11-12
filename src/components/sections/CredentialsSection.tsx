import { Cpu, FileText, Users, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import credentials, { type Credential } from '../../data/credentials';
import { Section } from '../layout/Section';
import { Eyebrow, Heading, Text } from '../typography/Typography';
import { ButtonLink } from '../ui/Button';

const credentialIcons: Record<Credential['icon'], LucideIcon> = {
  document: FileText,
  people: Users,
  chip: Cpu,
};

function CredentialIcon({ icon }: { icon: Credential['icon'] }) {
  const Icon = credentialIcons[icon] ?? FileText;
  return <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />;
}

export function CredentialsSection() {
  const { t } = useTranslation('about');

  return (
    // OurPeople directly above is also a warmwhite `lg` section on the About
    // page — a reduced top pad avoids a 96px + 96px stack without butting the
    // heading against the section above (as a full `joinTop` did).
    <Section background="warmwhite" spacing="lg" className="pt-8 md:pt-10">
      <div className="mb-12">
        <Heading level="h2" as="h3" className="uppercase tracking-tight">
          {t('credentials.heading1')} {t('credentials.heading2')}
        </Heading>
      </div>

      <div className="grid divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 bg-warmwhite md:grid-cols-3 md:divide-x md:divide-y-0">
        {credentials.map((credential) => {
          const key = credential.key;
          return (
            <div key={credential.title} className="flex flex-col p-8 md:p-10">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-sm bg-stone text-brand-600">
                <CredentialIcon icon={credential.icon} />
              </div>

              <Eyebrow className="mb-3">{t(`credentials.${key}.eyebrow`, { defaultValue: credential.eyebrow })}</Eyebrow>

              <Heading level="h4" as="h3" className="mb-4 uppercase">
                {t(`credentials.${key}.title`, { defaultValue: credential.title })}
              </Heading>

              <Text variant="body" muted className="mb-8 flex-1">
                {t(`credentials.${key}.description`, { defaultValue: credential.description })}
              </Text>

              {credential.buttonVariant === 'filled' ? (
                <ButtonLink href={credential.href} download variant="primary" size="lg" fullWidth>
                  {t(`credentials.${key}.buttonLabel`, { defaultValue: credential.buttonLabel })}
                </ButtonLink>
              ) : credential.internal ? (
                <ButtonLink href={credential.href} variant="outline" size="lg" fullWidth>
                  {t(`credentials.${key}.buttonLabel`, { defaultValue: credential.buttonLabel })}
                </ButtonLink>
              ) : (
                <ButtonLink href={credential.href} target="_blank" rel="noreferrer" variant="outline" size="lg" fullWidth>
                  {t(`credentials.${key}.buttonLabel`, { defaultValue: credential.buttonLabel })}
                </ButtonLink>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export default CredentialsSection;
