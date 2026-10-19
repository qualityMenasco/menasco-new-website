import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getFile, putFile, GithubCommitError } from './githubCommit.server';

const ORIGINAL_FETCH = globalThis.fetch;
const ORIGINAL_TOKEN = process.env.PROJECTS_CMS_GITHUB_TOKEN;

describe('githubCommit.server', () => {
  beforeEach(() => {
    process.env.PROJECTS_CMS_GITHUB_TOKEN = 'test-token';
  });

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
    process.env.PROJECTS_CMS_GITHUB_TOKEN = ORIGINAL_TOKEN;
    vi.restoreAllMocks();
  });

  it('getFile decodes base64 content and returns the sha (successful read)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        content: Buffer.from('{"hello":"world"}').toString('base64'),
        encoding: 'base64',
        sha: 'abc123',
      }),
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    const result = await getFile('src/data/projects.json');
    expect(result).toEqual({ content: '{"hello":"world"}', sha: 'abc123' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/repos/qualityMenasco/menasco-new-website/contents/src/data/projects.json?ref=main'),
      expect.objectContaining({ method: 'GET', headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) }),
    );
  });

  it('putFile succeeds and returns the new content sha + commit sha', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: { sha: 'newsha' }, commit: { sha: 'commitsha' } }),
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    const result = await putFile('src/data/projects.json', '{"a":1}', 'oldsha', 'test commit');
    expect(result).toEqual({ sha: 'newsha', commitSha: 'commitsha' });

    const [, options] = mockFetch.mock.calls[0];
    const sentBody = JSON.parse((options as RequestInit).body as string);
    expect(sentBody.sha).toBe('oldsha');
    expect(sentBody.branch).toBe('main');
    expect(sentBody.message).toBe('test commit');
    expect(Buffer.from(sentBody.content, 'base64').toString('utf8')).toBe('{"a":1}');
  });

  it('putFile surfaces a sha-conflict (409) as a clear, non-retried GithubCommitError', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      text: async () => 'sha mismatch',
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    await expect(putFile('src/data/projects.json', '{}', 'stale-sha', 'msg')).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(GithubCommitError);
      expect((err as GithubCommitError).isConflict).toBe(true);
      expect((err as GithubCommitError).message).toMatch(/refresh and retry/i);
      return true;
    });
    expect(mockFetch).toHaveBeenCalledTimes(1); // no blind retry
  });

  it('putFile surfaces a 422 as a conflict too', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      text: async () => 'sha mismatch',
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    await expect(putFile('src/data/projects.json', '{}', 'stale-sha', 'msg')).rejects.toMatchObject({ isConflict: true });
  });

  it('getFile surfaces a non-200, non-conflict GitHub error clearly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'something broke',
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    await expect(getFile('src/data/projects.json')).rejects.toSatisfy((err: unknown) => {
      expect(err).toBeInstanceOf(GithubCommitError);
      expect((err as GithubCommitError).isConflict).toBe(false);
      expect((err as GithubCommitError).status).toBe(500);
      return true;
    });
  });

  it('throws clearly when PROJECTS_CMS_GITHUB_TOKEN is not configured', async () => {
    delete process.env.PROJECTS_CMS_GITHUB_TOKEN;
    const mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    await expect(getFile('src/data/projects.json')).rejects.toThrow(/PROJECTS_CMS_GITHUB_TOKEN/);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
