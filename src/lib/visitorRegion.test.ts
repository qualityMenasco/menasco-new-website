import { describe, expect, it } from 'vitest';
import { orderForVisitor, regionFromTimeZone } from './visitorRegion';

describe('regionFromTimeZone', () => {
  it.each([
    ['Asia/Dubai', 'uae'],
    ['Asia/Riyadh', 'ksa'],
    ['Africa/Cairo', 'egypt'],
    ['Europe/London', 'europe'],
    ['Europe/Berlin', 'europe'],
    ['Atlantic/Canary', 'europe'],
    ['America/New_York', 'usa'],
    ['America/Los_Angeles', 'usa'],
    ['America/Indiana/Indianapolis', 'usa'],
    ['Pacific/Honolulu', 'usa'],
  ])('%s -> %s', (tz, region) => {
    expect(regionFromTimeZone(tz)).toBe(region);
  });

  it.each(['America/Toronto', 'America/Mexico_City', 'Asia/Karachi', 'Asia/Qatar', '', undefined])('%s -> null', (tz) => {
    expect(regionFromTimeZone(tz)).toBeNull();
  });
});

describe('orderForVisitor', () => {
  const markets = ['uae', 'ksa', 'egypt', 'europe', 'usa'].map((id) => ({ id }));
  const ids = (r: Parameters<typeof orderForVisitor>[1]) => orderForVisitor(markets, r).map((m) => m.id);

  it('keeps UAE first and moves the visitor region to second', () => {
    expect(ids('usa')).toEqual(['uae', 'usa', 'ksa', 'egypt', 'europe']);
    expect(ids('europe')).toEqual(['uae', 'europe', 'ksa', 'egypt', 'usa']);
    expect(ids('egypt')).toEqual(['uae', 'egypt', 'ksa', 'europe', 'usa']);
  });

  it('leaves the order unchanged for UAE, Saudi Arabia (already second) or unknown visitors', () => {
    const canonical = ['uae', 'ksa', 'egypt', 'europe', 'usa'];
    expect(ids('uae')).toEqual(canonical);
    expect(ids('ksa')).toEqual(canonical);
    expect(ids(null)).toEqual(canonical);
  });
});
