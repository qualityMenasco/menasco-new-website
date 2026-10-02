import { BookOpen, FileText, Leaf, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import credentials, { type Credential } from '../../data/credentials';
import { Section } from '../layout/Section';
import { Eyebrow, Heading, Text } from '../typography/Typography';
import { ButtonLink } from '../ui/Button';

const credentialKeys: Record<string, string> = {
  'Who We Are, On Paper.': 'companyProfile',
  'MENASCO Guidelines': 'guidelines',
  'MENASCO Sustainability Program': 'sustainability',
};

const credentialIcons: Record<Credential['icon'], LucideIcon> = {
  document: FileText,
  book: BookOpen,
  // Data key is 'shield' but the card is the Sustainability Program — show a subject icon, not a tick.
  shield: Leaf,
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
          const key = credentialKeys[credential.title];
          return (
            <div key={credential.title} className="flex flex-col p-8 md:p-10">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-sm bg-stone text-brand-600">
                <CredentialIcon icon={credential.icon} />
              </div>

              <Eyebrow className="mb-3">{key ? t(`credentials.${key}.eyebrow`) : credential.eyebrow}</Eyebrow>

              <Heading level="h4" as="h3" className="mb-4 uppercase">
                {key ? t(`credentials.${key}.title`) : credential.title}
              </Heading>

              <Text variant="body" muted className="mb-8 flex-1">
                {key ? t(`credentials.${key}.description`) : credential.description}
              </Text>

              {credential.buttonVariant === 'filled' ? (
                <ButtonLink href={credential.href} download variant="primary" size="lg" fullWidth>
                  {key ? t(`credentials.${key}.buttonLabel`) : credential.buttonLabel}
                </ButtonLink>
              ) : (
                <ButtonLink href={credential.href} target="_blank" rel="noreferrer" variant="outline" size="lg" fullWidth>
                  {key ? t(`credentials.${key}.buttonLabel`) : credential.buttonLabel}
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
