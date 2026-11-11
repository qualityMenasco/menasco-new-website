import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { ThreadsBrandIcon, XBrandIcon } from '../components/brand/SocialBrandIcons';
import type { SocialIconComponent } from '../components/navigation/SocialLinks';
import type { VerificationStatus } from '../types/content';

/**
 * MENASCO's social profiles, in the order the footers show them. Fill in
 * `href` and flip `verificationStatus` to "verified" once a URL is confirmed —
 * until then the icon still shows, but as a non-clickable placeholder.
 */
export interface SocialLinkEntry {
  platform: string;
  href: string;
  verificationStatus: VerificationStatus;
}

export const socialLinks: SocialLinkEntry[] = [
  { platform: 'Instagram', href: 'https://www.instagram.com/menasco_group/', verificationStatus: 'verified' },
  { platform: 'LinkedIn', href: 'https://www.linkedin.com/company/menascogroup/', verificationStatus: 'verified' },
  { platform: 'X', href: 'https://x.com/menasco_uae', verificationStatus: 'verified' },
  { platform: 'Facebook', href: 'https://www.facebook.com/people/Menascouae/61582379551611/', verificationStatus: 'verified' },
  { platform: 'Threads', href: 'https://www.threads.com/@menasco_uae', verificationStatus: 'verified' },
];

const socialIcons: Record<string, SocialIconComponent> = {
  Instagram,
  LinkedIn: Linkedin,
  X: XBrandIcon,
  Facebook,
  Threads: ThreadsBrandIcon,
};

/** Every profile with an icon; `href` is empty until the URL is verified. */
export const footerSocialLinks = socialLinks
  .filter((link) => socialIcons[link.platform])
  .map((link) => ({
    platform: link.platform,
    href: link.verificationStatus === 'verified' ? link.href : '',
    icon: socialIcons[link.platform],
  }));
