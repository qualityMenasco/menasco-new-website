/**
 * Content-verification flag. Data marked "pending" must be either hidden or
 * clearly labeled as unconfirmed in the UI — never presented as fact.
 * See docs/CONTENT_GUIDE.md.
 */
export type VerificationStatus = 'verified' | 'pending';
