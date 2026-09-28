import type { Locale } from './i18n';

/**
 * Formats a date as e.g. "10 AUG 2026" (en) or the Arabic equivalent,
 * locale-aware. Accepts either a bare "yyyy-mm-dd" date (the static
 * leadership/legal pages' convention) or a full ISO 8601 datetime string
 * (the real Newsroom public API's `publishedAt`/`createdAt`/`updatedAt`
 * shape, e.g. "2026-09-15T13:21:43.000Z") — only a bare date gets a
 * midnight time appended; a string that already carries a time component
 * (has a "T") is parsed as-is. Appending `T00:00:00` to an already-full
 * timestamp previously produced a malformed, unparseable string (e.g.
 * "2026-09-15T13:21:43.000ZT00:00:00"), which crashed the entire Newsroom
 * route with `RangeError: Invalid time value` the first time a real,
 * RDS-backed article (as opposed to the old bare-date placeholder content)
 * flowed through this function.
 *
 * Returns an empty string for a genuinely unparseable input — every caller
 * already renders `date` as plain text, so an empty string safely omits the
 * date instead of throwing. This is a last-resort guard for corrupt data,
 * not a substitute for the API always returning a valid date: normal published
 * articles never hit this branch.
 */
export function formatNewsDate(iso: string, locale: Locale): string {
  const date = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const formatted = new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
  return locale === 'ar' ? formatted : formatted.toUpperCase();
}
