import { describe, it, expect } from 'vitest';
import { uaeLocalInputToIso, isoToUaeLocalInput, formatUaeDisplay } from './uaeTime';

describe('uaeLocalInputToIso — UAE wall-clock input to unambiguous UTC ISO', () => {
  it('converts a UAE 09:00 local input to the correct UTC instant (05:00Z, UTC+4)', () => {
    expect(uaeLocalInputToIso('2026-09-20T09:00')).toBe('2026-09-20T05:00:00.000Z');
  });

  it('always produces a string containing Z (never ambiguous)', () => {
    const iso = uaeLocalInputToIso('2026-09-20T09:00');
    expect(iso).not.toBeNull();
    expect(iso).toContain('Z');
  });

  it('returns null for an empty input', () => {
    expect(uaeLocalInputToIso('')).toBeNull();
  });
});

describe('isoToUaeLocalInput / uaeLocalInputToIso — round trip', () => {
  it('a UAE local input converted to UTC and back produces the same local wall-clock value', () => {
    const original = '2026-09-20T09:00';
    const iso = uaeLocalInputToIso(original);
    expect(iso).not.toBeNull();
    expect(isoToUaeLocalInput(iso)).toBe(original);
  });

  it('DB UTC contract: the stored UTC instant is independent of the display conversion — isoToUaeLocalInput always reads Asia/Dubai explicitly, never the host/browser timezone', () => {
    // 05:00 UTC must always read back as 09:00 UAE regardless of what timezone this test runs in.
    expect(isoToUaeLocalInput('2026-09-20T05:00:00.000Z')).toBe('2026-09-20T09:00');
  });

  it('returns an empty string for a null input', () => {
    expect(isoToUaeLocalInput(null)).toBe('');
  });
});

describe('formatUaeDisplay', () => {
  it('formats a stored UTC timestamp as UAE date · time', () => {
    expect(formatUaeDisplay('2026-09-20T05:00:00.000Z')).toBe('20 Sept 2026 · 09:00 UAE');
  });

  it('returns null for a null input', () => {
    expect(formatUaeDisplay(null)).toBeNull();
  });
});
