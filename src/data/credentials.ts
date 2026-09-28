export type CredentialButtonVariant = 'filled' | 'outline';

export interface Credential {
  icon: 'document' | 'book' | 'shield';
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  // Path to the actual file/page. Update these once the real assets exist,
  // e.g. "/documents/menasco-company-profile.pdf".
  href: string;
  buttonVariant: CredentialButtonVariant;
}

const credentials: Credential[] = [
  {
    icon: 'document',
    eyebrow: 'Company Profile',
    title: 'Who We Are, On Paper.',
    description:
      'Our full company profile, history, capabilities, certifications, key projects and leadership, in one downloadable PDF.',
    buttonLabel: 'Download PDF ↓',
    href: '/menasco-company-profile.pdf',
    buttonVariant: 'filled',
  },
  {
    icon: 'book',
    eyebrow: 'Guidelines',
    title: 'MENASCO Guidelines',
    description:
      'Our internal engineering, QHSE & operational guidelines: the standards our team follows on every site.',
    buttonLabel: 'View Guidelines',
    href: '/documents/menasco-guidelines.pdf',
    buttonVariant: 'outline',
  },
  {
    icon: 'shield',
    eyebrow: 'Sustainability',
    title: 'MENASCO Sustainability Program',
    description:
      'How MENASCO builds responsibly: energy-efficient systems, safer sites and reduced environmental impact.',
    buttonLabel: 'View Report',
    href: '/documents/menasco-sustainability-report.pdf',
    buttonVariant: 'outline',
  },
];

export default credentials;