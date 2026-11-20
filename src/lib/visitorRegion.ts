/**
 * Maps the visitor's browser time zone to one of the Data Center page's market
 * regions, so that region's tab can move up to second place (UAE, the HQ,
 * always stays first). Client request 2026-11-20: time zone only, no server
 * call, nothing stored. Returns null for any other region (order unchanged).
 */
export type MarketRegion = 'uae' | 'ksa' | 'egypt' | 'europe' | 'usa';

const US_ZONES = new Set([
  'America/New_York', 'America/Detroit', 'America/Chicago', 'America/Menominee', 'America/Denver', 'America/Boise',
  'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'America/Juneau', 'America/Sitka',
  'America/Metlakatla', 'America/Yakutat', 'America/Nome', 'America/Adak', 'Pacific/Honolulu',
]);
const US_PREFIXES = ['America/Indiana/', 'America/Kentucky/', 'America/North_Dakota/', 'US/'];
const EUROPE_ATLANTIC = new Set(['Atlantic/Canary', 'Atlantic/Madeira', 'Atlantic/Azores', 'Atlantic/Reykjavik', 'Atlantic/Faroe']);

export function regionFromTimeZone(timeZone: string | undefined | null): MarketRegion | null {
  if (!timeZone) return null;
  if (timeZone === 'Asia/Dubai') return 'uae';
  if (timeZone === 'Asia/Riyadh') return 'ksa';
  if (timeZone === 'Africa/Cairo' || timeZone === 'Egypt') return 'egypt';
  if (US_ZONES.has(timeZone) || US_PREFIXES.some((p) => timeZone.startsWith(p))) return 'usa';
  if (timeZone.startsWith('Europe/') || EUROPE_ATLANTIC.has(timeZone) || timeZone === 'GB' || timeZone === 'Eire') return 'europe';
  return null;
}

/** The visitor's region from the browser (null on the server or if unknown). */
export function visitorRegion(): MarketRegion | null {
  try {
    return regionFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return null;
  }
}

/** UAE first (HQ), then the visitor's region, then the rest in their original order. */
export function orderForVisitor<T extends { id: string }>(items: T[], region: MarketRegion | null): T[] {
  const uae = items.filter((m) => m.id === 'uae');
  const mine = region && region !== 'uae' ? items.filter((m) => m.id === region) : [];
  const rest = items.filter((m) => m.id !== 'uae' && !mine.includes(m));
  return [...uae, ...mine, ...rest];
}
