/**
 * Thin wrapper around GitHub's REST Contents API using plain `fetch` — this
 * repo has no Octokit dependency today (confirmed via `package.json`) and
 * the two operations the Projects CMS needs (GET a file's content+sha, PUT
 * an updated file using that sha) are a handful of lines each, so adding a
 * ~dozen-MB SDK dependency for them isn't justified.
 *
 * Node-only / server-only: reads `process.env.PROJECTS_CMS_GITHUB_TOKEN`
 * directly (never `import.meta.env`/`VITE_*`). The `.server.ts` suffix
 * flags it as never meant to be imported from client-bundled code, matching
 * how `api/_lib/*.ts` files in this repo are implicitly server-only by
 * virtue of living under `api/`; this module lives under `src/internal/`
 * instead (it's shared by two serverless functions,
 * api/projects-cms/validate.ts and api/projects-cms/publish.ts, so it can't
 * live inside either one's own folder) and relies on the suffix plus this
 * comment to communicate the same constraint.
 */

const GITHUB_API_BASE = 'https://api.github.com';
export const PROJECTS_CMS_REPO_OWNER = 'qualityMenasco';
export const PROJECTS_CMS_REPO_NAME = 'menasco-new-website';
export const PROJECTS_CMS_BRANCH = 'main';

export class GithubCommitError extends Error {
  status: number;
  /** True when this specifically represents a sha-conflict (someone else committed since the caller's GET) — callers should surface a "please refresh and retry" message rather than retrying blindly. */
  isConflict: boolean;
  constructor(message: string, status: number, isConflict = false) {
    super(message);
    this.status = status;
    this.isConflict = isConflict;
  }
}

export interface GithubFileContent {
  content: string;
  sha: string;
}

function authHeaders(): Record<string, string> {
  const token = process.env.PROJECTS_CMS_GITHUB_TOKEN;
  if (!token) {
    throw new GithubCommitError('PROJECTS_CMS_GITHUB_TOKEN is not configured in this environment', 500);
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function contentsUrl(path: string): string {
  return `${GITHUB_API_BASE}/repos/${PROJECTS_CMS_REPO_OWNER}/${PROJECTS_CMS_REPO_NAME}/contents/${path}`;
}

/** GETs a file's current decoded text content + blob sha on the `main` branch. Throws GithubCommitError on any non-200. */
export async function getFile(path: string): Promise<GithubFileContent> {
  const response = await fetch(`${contentsUrl(path)}?ref=${PROJECTS_CMS_BRANCH}`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new GithubCommitError(`GitHub API error reading "${path}": ${response.status} ${response.statusText} ${body}`, response.status);
  }

  const json = (await response.json()) as { content: string; encoding: string; sha: string };
  if (json.encoding !== 'base64') {
    throw new GithubCommitError(`Unexpected encoding "${json.encoding}" for "${path}" — expected base64`, 500);
  }
  const content = Buffer.from(json.content, 'base64').toString('utf8');
  return { content, sha: json.sha };
}

/**
 * True if `path` exists in the repo on `main`, false only for a genuine
 * 404 — any other failure (auth, rate limit, network) re-throws rather than
 * silently reporting "doesn't exist", which would misreport a real system
 * problem as an invalid image reference. Used by validateProjectUpload.ts
 * to check a project's local `/`-prefixed image paths: the obvious
 * `fs.existsSync` check works locally but can never succeed inside a Vercel
 * serverless function, since the function's deployment bundle doesn't
 * include the (large, image-heavy) public/ directory — confirmed by a real
 * false-positive "invalid image" on two existing, genuinely-correct
 * projects (qiddiya, alamein-towers) the first time this path was actually
 * exercised in production.
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await getFile(path);
    return true;
  } catch (err) {
    if (err instanceof GithubCommitError && err.status === 404) return false;
    throw err;
  }
}

/**
 * PUTs updated text content to `path`, using `previousSha` to avoid
 * clobbering a concurrent edit. A 409 or 422 from GitHub (sha mismatch) is
 * surfaced as a clearly-flagged conflict rather than retried automatically
 * — the caller (api/projects-cms/publish.ts) re-fetches and tells the user
 * to refresh and retry rather than silently overwriting someone else's commit.
 */
export async function putFile(path: string, newContent: string, previousSha: string, commitMessage: string): Promise<{ sha: string; commitSha: string }> {
  const response = await fetch(contentsUrl(path), {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(newContent, 'utf8').toString('base64'),
      sha: previousSha,
      branch: PROJECTS_CMS_BRANCH,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const isConflict = response.status === 409 || response.status === 422;
    const message = isConflict
      ? `Someone else published a change to "${path}" since you loaded this page — please refresh and retry.`
      : `GitHub API error writing "${path}": ${response.status} ${response.statusText} ${body}`;
    throw new GithubCommitError(message, response.status, isConflict);
  }

  const json = (await response.json()) as { content: { sha: string }; commit: { sha: string } };
  return { sha: json.content.sha, commitSha: json.commit.sha };
}
