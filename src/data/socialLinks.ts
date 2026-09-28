import type { VerificationStatus } from '../types/content';

/**
 * menascouae.com links out to LinkedIn, Instagram, Facebook, X, and Threads,
 * but the exact profile URLs weren't retrievable via automated fetch.
 * Fill in `href` and flip `verificationStatus` to "verified" once confirmed —
 * SocialLinks (component) only renders entries with a non-empty href.
 */
export interface SocialLinkEntry {
  platform: string;
  href: string;
  verificationStatus: VerificationStatus;
}

export const socialLinks: SocialLinkEntry[] = [
  { platform: 'LinkedIn', href: '', verificationStatus: 'pending' },
  { platform: 'Instagram', href: '', verificationStatus: 'pending' },
  { platform: 'Facebook', href: '', verificationStatus: 'pending' },
  { platform: 'X', href: '', verificationStatus: 'pending' },
];
