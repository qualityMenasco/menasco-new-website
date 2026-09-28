import { describe, it, expect } from 'vitest';
import {
  isValidScheduledAt,
  isValidEpromiseId,
  isValidEpromiseName,
  isValidCommonName,
  isValidProjectClass,
  isValidProjectType,
  isValidLocation,
  isValidCountry,
  isValidConsultant,
  isValidClient,
  isValidCompletionStatus,
  isValidPublicDescription,
  isValidPrivateDescription,
  isValidDurationMonths,
  isValidPeakWorkforce,
  isValidFloors,
  isValidBuiltAreaSqm,
  isValidValueAmount,
  isValidCurrencyCode,
  isValidProjectStatus,
} from './validation';

/** TIME — Phase 6 scheduled publishing's timezone contract. */
describe('isValidScheduledAt', () => {
  it('accepts an explicit Z', () => {
    expect(isValidScheduledAt('2026-09-20T05:00:00Z')).toBe(true);
  });

  it('accepts an explicit numeric offset (e.g. UAE +04:00)', () => {
    expect(isValidScheduledAt('2026-09-20T09:00:00+04:00')).toBe(true);
  });

  it('accepts milliseconds with Z', () => {
    expect(isValidScheduledAt('2026-09-20T05:00:00.000Z')).toBe(true);
  });

  it('rejects a bare date with no time component', () => {
    expect(isValidScheduledAt('2026-09-20')).toBe(false);
  });

  it('rejects a timezone-less "datetime-local"-looking string', () => {
    expect(isValidScheduledAt('2026-09-20T09:00')).toBe(false);
    expect(isValidScheduledAt('2026-09-20T09:00:00')).toBe(false);
  });

  it('rejects a malformed offset', () => {
    expect(isValidScheduledAt('2026-09-20T09:00:00+4')).toBe(false);
    expect(isValidScheduledAt('2026-09-20T09:00:00+0400')).toBe(false);
  });

  it('rejects a syntactically-shaped but calendar-invalid datetime', () => {
    expect(isValidScheduledAt('2026-13-40T09:00:00Z')).toBe(false);
  });

  it('rejects non-string input', () => {
    expect(isValidScheduledAt(12345)).toBe(false);
    expect(isValidScheduledAt(null)).toBe(false);
    expect(isValidScheduledAt(undefined)).toBe(false);
  });
});

/** Projects Phase 1 — see migrations/005_create_project_tables.sql. No Projects API exists yet; these guards are exercised directly. */
describe('Projects field validation', () => {
  it.each([
    ['isValidEpromiseId', isValidEpromiseId, 100],
    ['isValidEpromiseName', isValidEpromiseName, 500],
    ['isValidCommonName', isValidCommonName, 500],
    ['isValidProjectClass', isValidProjectClass, 100],
    ['isValidProjectType', isValidProjectType, 100],
    ['isValidLocation', isValidLocation, 255],
    ['isValidCountry', isValidCountry, 100],
    ['isValidConsultant', isValidConsultant, 500],
    ['isValidClient', isValidClient, 500],
    ['isValidPublicDescription', isValidPublicDescription, 20_000],
  ] as const)('%s accepts a non-empty string within its length limit and rejects one over it, blank, or non-string', (_name, fn, max) => {
    expect(fn('a real value')).toBe(true);
    expect(fn('x'.repeat(max))).toBe(true);
    expect(fn('x'.repeat(max + 1))).toBe(false);
    expect(fn('')).toBe(false);
    expect(fn('   ')).toBe(false);
    expect(fn(123)).toBe(false);
    expect(fn(null)).toBe(false);
    expect(fn(undefined)).toBe(false);
  });

  describe('isValidPrivateDescription', () => {
    it('accepts null — not every project has internal-only notes', () => {
      expect(isValidPrivateDescription(null)).toBe(true);
    });

    it('accepts a real string and rejects one over the length limit', () => {
      expect(isValidPrivateDescription('internal notes')).toBe(true);
      expect(isValidPrivateDescription('x'.repeat(20_001))).toBe(false);
    });

    it('rejects undefined and non-string values (only null represents "absent")', () => {
      expect(isValidPrivateDescription(undefined)).toBe(false);
      expect(isValidPrivateDescription(123)).toBe(false);
    });
  });

  describe('isValidDurationMonths / isValidPeakWorkforce / isValidFloors', () => {
    it('accept a positive integer', () => {
      expect(isValidDurationMonths(24)).toBe(true);
      expect(isValidPeakWorkforce(1200)).toBe(true);
      expect(isValidFloors(12)).toBe(true);
    });

    it('reject zero, negative, non-integer, and non-number values', () => {
      for (const fn of [isValidDurationMonths, isValidPeakWorkforce, isValidFloors]) {
        expect(fn(0)).toBe(false);
        expect(fn(-1)).toBe(false);
        expect(fn(1.5)).toBe(false);
        expect(fn('12')).toBe(false);
        expect(fn(null)).toBe(false);
      }
    });

    it('reject a duration/floor count past their documented sanity caps', () => {
      expect(isValidDurationMonths(601)).toBe(false);
      expect(isValidFloors(301)).toBe(false);
    });
  });

  describe('isValidBuiltAreaSqm / isValidValueAmount', () => {
    it('accept a positive finite number, including a decimal', () => {
      expect(isValidBuiltAreaSqm(85_000)).toBe(true);
      expect(isValidBuiltAreaSqm(85_000.5)).toBe(true);
      expect(isValidValueAmount(420_000_000)).toBe(true);
    });

    it('reject zero, negative, non-finite, and non-number values', () => {
      for (const fn of [isValidBuiltAreaSqm, isValidValueAmount]) {
        expect(fn(0)).toBe(false);
        expect(fn(-1)).toBe(false);
        expect(fn(Infinity)).toBe(false);
        expect(fn(NaN)).toBe(false);
        expect(fn('85000')).toBe(false);
      }
    });
  });

  describe('isValidCurrencyCode', () => {
    it('accepts a 3-letter uppercase code', () => {
      expect(isValidCurrencyCode('AED')).toBe(true);
      expect(isValidCurrencyCode('USD')).toBe(true);
    });

    it('rejects lowercase, wrong length, and non-string values', () => {
      expect(isValidCurrencyCode('aed')).toBe(false);
      expect(isValidCurrencyCode('AE')).toBe(false);
      expect(isValidCurrencyCode('AEDD')).toBe(false);
      expect(isValidCurrencyCode(123)).toBe(false);
    });
  });

  describe('isValidCompletionStatus', () => {
    it('accepts exactly the approved taxonomy: "ongoing", "completed", "on_hold"', () => {
      expect(isValidCompletionStatus('ongoing')).toBe(true);
      expect(isValidCompletionStatus('completed')).toBe(true);
      expect(isValidCompletionStatus('on_hold')).toBe(true);
    });

    it('rejects any other value — matches migration 005\'s chk_project_records_completion_status CHECK exactly', () => {
      expect(isValidCompletionStatus('on-hold')).toBe(false); // hyphen, not underscore
      expect(isValidCompletionStatus('Completed')).toBe(false);
      expect(isValidCompletionStatus('draft')).toBe(false);
      expect(isValidCompletionStatus('')).toBe(false);
      expect(isValidCompletionStatus(null)).toBe(false);
    });
  });

  describe('isValidProjectStatus', () => {
    it('accepts exactly "draft" and "published"', () => {
      expect(isValidProjectStatus('draft')).toBe(true);
      expect(isValidProjectStatus('published')).toBe(true);
    });

    it('rejects any other value, including a Newsroom-style status or a made-up third state', () => {
      expect(isValidProjectStatus('ready')).toBe(false);
      expect(isValidProjectStatus('scheduled')).toBe(false);
      expect(isValidProjectStatus('archived')).toBe(false);
      expect(isValidProjectStatus('Draft')).toBe(false);
      expect(isValidProjectStatus(null)).toBe(false);
    });
  });
});
