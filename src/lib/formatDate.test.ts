import { describe, it, expect } from 'vitest';
import { formatNewsDate } from './formatDate';

/**
 * Regression coverage for the Production crash: publishing a real article
 * through /dev/newsroom-admin and visiting /newsroom threw
 * `RangeError: Invalid time value` from formatNewsDate, because the public
 * API's `publishedAt` is a full ISO 8601 datetime (e.g.
 * "2026-09-15T13:21:43.000Z"), not the bare "yyyy-mm-dd" date this function
 * used to assume for every caller.
 */
describe('formatNewsDate — full ISO 8601 datetime input (the real Newsroom API shape)', () => {
  it('formats a real publishedAt timestamp without throwing', () => {
    expect(() => formatNewsDate('2026-09-15T13:21:43.000Z', 'en')).not.toThrow();
  });

  it('renders the correct calendar date from a full timestamp', () => {
    expect(formatNewsDate('2026-09-15T13:21:43.000Z', 'en')).toBe('15 SEPT 2026');
  });

  it('renders correctly in Arabic for the same full timestamp', () => {
    const ar = formatNewsDate('2026-09-15T13:21:43.000Z', 'ar');
    expect(ar.length).toBeGreaterThan(0);
    expect(() => formatNewsDate('2026-09-15T13:21:43.000Z', 'ar')).not.toThrow();
  });

  it('a timestamp without milliseconds still parses correctly', () => {
    expect(formatNewsDate('2026-01-05T09:00:00Z', 'en')).toBe('05 JAN 2026');
  });
});

describe('formatNewsDate — bare "yyyy-mm-dd" input (existing static-page convention, unchanged)', () => {
  it('still formats a bare date exactly as before', () => {
    expect(formatNewsDate('2026-08-10', 'en')).toBe('10 AUG 2026');
  });

  it('bare-date behavior is unaffected by the datetime fix', () => {
    expect(() => formatNewsDate('2026-08-10', 'en')).not.toThrow();
  });
});

describe('formatNewsDate — genuinely invalid input (defensive fallback, not the primary fix)', () => {
  it('returns an empty string instead of throwing for unparseable input', () => {
    expect(() => formatNewsDate('not-a-date', 'en')).not.toThrow();
    expect(formatNewsDate('not-a-date', 'en')).toBe('');
  });

  it('returns an empty string for an empty input rather than crashing', () => {
    expect(() => formatNewsDate('', 'en')).not.toThrow();
    expect(formatNewsDate('', 'en')).toBe('');
  });
});
