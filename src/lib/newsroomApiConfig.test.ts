import { describe, it, expect, vi, afterEach } from 'vitest';

/**
 * `import.meta.env.VITE_NEWSROOM_API_BASE_URL` is read once at module load,
 * so each case that needs a different value re-imports the module fresh
 * via `vi.resetModules()` + dynamic `import()`.
 */
async function loadWithBaseUrl(baseUrl: string | undefined) {
  vi.resetModules();
  vi.stubEnv('VITE_NEWSROOM_API_BASE_URL', baseUrl as string);
  return import('./newsroomApiConfig');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildNewsroomApiUrl', () => {
  it('stays relative when no base URL is configured (unchanged same-origin Vercel behavior)', async () => {
    const { buildNewsroomApiUrl } = await loadWithBaseUrl(undefined);
    expect(buildNewsroomApiUrl('/api/newsroom/public/articles')).toBe('/api/newsroom/public/articles');
  });

  it('prefixes with the configured base URL', async () => {
    const { buildNewsroomApiUrl } = await loadWithBaseUrl('https://wvojo9g543.execute-api.ap-south-1.amazonaws.com');
    expect(buildNewsroomApiUrl('/api/newsroom/public/articles')).toBe(
      'https://wvojo9g543.execute-api.ap-south-1.amazonaws.com/api/newsroom/public/articles',
    );
  });

  it('never produces a double slash when the base URL has a trailing slash', async () => {
    const { buildNewsroomApiUrl } = await loadWithBaseUrl('https://wvojo9g543.execute-api.ap-south-1.amazonaws.com/');
    const url = buildNewsroomApiUrl('/api/newsroom/public/articles');
    expect(url).toBe('https://wvojo9g543.execute-api.ap-south-1.amazonaws.com/api/newsroom/public/articles');
    expect(url).not.toContain('//api');
  });

  it('rejects a path that does not start with "/" rather than silently producing a malformed URL', async () => {
    const { buildNewsroomApiUrl } = await loadWithBaseUrl(undefined);
    expect(() => buildNewsroomApiUrl('api/newsroom/public/articles')).toThrow();
  });
});
