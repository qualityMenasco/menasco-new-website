/**
 * UAE (Asia/Dubai, UTC+4, no DST) wall-clock <-> UTC ISO-8601 conversion for
 * the temporary Newsroom admin UI's scheduling fields. Every function here
 * uses an EXPLICIT timezone (either the hardcoded +04:00 UAE offset, or
 * Intl.DateTimeFormat's `timeZone: 'Asia/Dubai'` option) — never the
 * browser's own local timezone (`new Date(localString)`,
 * `.toLocaleString()`) and never bare date-only parsing, both of which
 * would silently produce the wrong instant for an editor whose OS/browser
 * isn't set to Gulf time. The backend (api/_lib/validation.ts's
 * isValidScheduledAt) independently re-validates that whatever crosses the
 * API boundary is unambiguous — this module's correctness is a UX property,
 * not the actual security/correctness boundary.
 */

const UAE_OFFSET = '+04:00';

/**
 * Converts a `<input type="datetime-local">` value ("YYYY-MM-DDTHH:mm"),
 * interpreted as Asia/Dubai wall-clock time, into a full ISO-8601 UTC
 * string with an explicit `Z`. Returns null for an empty/invalid input.
 */
export function uaeLocalInputToIso(localValue: string): string | null {
  if (!localValue) return null;
  const date = new Date(`${localValue}:00${UAE_OFFSET}`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/**
 * Converts a stored ISO-8601 UTC timestamp back into a
 * `<input type="datetime-local">`-compatible value representing that same
 * instant in Asia/Dubai wall-clock time.
 */
export function isoToUaeLocalInput(iso: string | null): string {
  if (!iso) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** e.g. "20 Sep 2026 · 09:00 UAE" for a stored ISO-8601 UTC timestamp. */
export function formatUaeDisplay(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  const timePart = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  return `${datePart} · ${timePart} UAE`;
}
