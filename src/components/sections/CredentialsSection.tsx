import { useTranslation } from 'react-i18next';
import credentials, { type Credential } from '../../data/credentials';
import { Section } from '../layout/Section';
import { Eyebrow, Heading, Text } from '../typography/Typography';

const credentialKeys: Record<string, string> = {
  'Who We Are, On Paper.': 'companyProfile',
  'MENASCO Guidelines': 'guidelines',
  'MENASCO Sustainability Program': 'sustainability',
};

function CredentialIcon({ icon }: { icon: Credential['icon'] }) {
  const common = {
    className: 'h-7 w-7',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    viewBox: '0 0 24 24',
  };

  if (icon === 'document') {
    return (
      <svg {...common}>
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-6z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    );
  }

  if (icon === 'book') {
    return (
      <svg {...common}>
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5V4.5z" />
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3z" />
    </svg>
  );
}

export function CredentialsSection() {
  const { t } = useTranslation('about');

  return (
    <Section background="warmwhite" spacing="lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Heading level="h2" as="h3" className="uppercase tracking-tight">
            {t('credentials.heading1')} {t('credentials.heading2')}
          </Heading>
        </div>

        <div className="grid divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
          {credentials.map((credential) => {
            const key = credentialKeys[credential.title];
            return (
              <div key={credential.title} className="flex flex-col p-8 md:p-10">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-stone text-brand-600">
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
                  <a
                    href={credential.href}
                    download
                    className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-4 font-mono text-sm uppercase tracking-widest text-white transition hover:bg-brand-700"
                  >
                    {key ? t(`credentials.${key}.buttonLabel`) : credential.buttonLabel}
                  </a>
                ) : (
                  <a
                    href={credential.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-brand-600 px-6 py-4 font-mono text-sm uppercase tracking-widest text-brand-600 transition hover:bg-brand-50"
                  >
                    {key ? t(`credentials.${key}.buttonLabel`) : credential.buttonLabel}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export default CredentialsSection;
