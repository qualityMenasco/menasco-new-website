export type CredentialButtonVariant = 'filled' | 'outline';

export interface Credential {
  /** about.json `credentials.<key>` block holding the translated copy. */
  key: 'companyProfile' | 'community' | 'innovation';
  icon: 'document' | 'people' | 'chip';
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  // Path to the actual file/page. Update these once the real assets exist,
  // e.g. "/documents/menasco-company-profile.pdf".
  href: string;
  buttonVariant: CredentialButtonVariant;
  /** An on-site page (opens in the same tab) rather than a document. */
  internal?: boolean;
}

const credentials: Credential[] = [
  {
    key: 'companyProfile',
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
    key: 'community',
    icon: 'people',
    eyebrow: 'Community & People',
    title: 'Our Community',
    description:
      'Blood drives, Culture Day, career fairs and our training centre: the people and causes behind MENASCO.',
    buttonLabel: 'Explore Our Community',
    href: '/community-people',
    buttonVariant: 'outline',
    internal: true,
  },
  {
    key: 'innovation',
    icon: 'chip',
    eyebrow: 'Innovation & Technology',
    title: 'Paving The Future',
    description:
      'ATLAS, LYNX, and AI: the digital tools behind how MENASCO tenders, builds and delivers.',
    buttonLabel: 'Discover More',
    href: '/innovation-technology',
    buttonVariant: 'outline',
    internal: true,
  },
];

export default credentials;