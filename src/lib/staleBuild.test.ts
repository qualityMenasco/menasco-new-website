import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isChunkLoadError, withStaleBuildRecovery } from './staleBuild';

describe('isChunkLoadError', () => {
  it('recognises the browser messages for a missing lazy chunk', () => {
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/v2/MEPPage-abc.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });
});

describe('withStaleBuildRecovery', () => {
  const reload = vi.fn();
  beforeEach(() => {
    sessionStorage.clear();
    reload.mockReset();
    vi.stubGlobal('location', { ...window.location, reload });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('passes successful imports through', async () => {
    const mod = { default: () => null };
    await expect(withStaleBuildRecovery(() => Promise.resolve(mod))()).resolves.toBe(mod);
    expect(reload).not.toHaveBeenCalled();
  });

  it('reloads once on a missing chunk instead of rejecting', () => {
    void withStaleBuildRecovery(() => Promise.reject(new TypeError('Importing a module script failed.')))();
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        expect(reload).toHaveBeenCalledTimes(1);
        resolve();
      }, 0),
    );
  });

  it('rethrows when a reload already happened moments ago (no reload loop)', async () => {
    sessionStorage.setItem('menasco:stale-build-reload', String(Date.now()));
    await expect(withStaleBuildRecovery(() => Promise.reject(new TypeError('Importing a module script failed.')))()).rejects.toThrow();
    expect(reload).not.toHaveBeenCalled();
  });

  it('rethrows unrelated errors', async () => {
    await expect(withStaleBuildRecovery(() => Promise.reject(new Error('boom')))()).rejects.toThrow('boom');
    expect(reload).not.toHaveBeenCalled();
  });
});
