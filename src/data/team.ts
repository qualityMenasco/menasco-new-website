import type { VerificationStatus } from '../types/content';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  group: 'leadership' | 'executive' | 'department-head' | 'regional-leadership';
  bio: string;
  photo?: string;
  verificationStatus: VerificationStatus;
}

/**
 * menascouae.com links to a "MENASCO Team" page, but its URL and content
 * weren't retrievable (404 on the expected /team path). No names or titles
 * are published anywhere else I could access — this stays empty rather than
 * inventing leadership profiles. Populate once the correct source is provided.
 */
export const team: TeamMember[] = [];
