import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireJsonBody, requireMethod, sendJson, withErrorHandling } from '../_lib/http.js';
import { requireProjectsCmsAuth } from '../_lib/projectsCmsAuth.js';
import { parseProjectUpload, ProjectUploadParseError, type ParsedProjectRow } from '../../src/internal/projects-cms/projectCsvJsonParser.js';
import { validateProjectUpload, type ProjectDiff } from '../../src/internal/projects-cms/validateProjectUpload.js';
import { getFile, putFile, GithubCommitError } from '../../src/internal/projects-cms/githubCommit.server.js';
import type { ProjectRecord } from '../../src/data/projects.js';

const PROJECTS_JSON_PATH = 'src/data/projects.json';
const AR_PROJECTS_JSON_PATH = 'public/locales/ar/projects.json';

interface ArProjectEntry {
  sector?: string;
  description?: string;
  menascoScope?: string;
  services?: string[];
  [key: string]: unknown;
}

interface ArProjectsFile {
  items: Record<string, ArProjectEntry>;
  [key: string]: unknown;
}

/** Applies a validated diff onto a freshly-fetched project array, producing the final dataset to commit. */
function applyDiffToDataset(freshProjects: ProjectRecord[], diff: ProjectDiff): ProjectRecord[] {
  const removedSlugs = new Set(diff.removed.map((r) => r.slug));
  let result = freshProjects.filter((p) => !removedSlugs.has(p.slug));
  result = result.map((p) => {
    const match = diff.updated.find((u) => u.before.slug === p.slug);
    return match ? match.after : p;
  });
  for (const added of diff.added) {
    if (!result.some((p) => p.slug === added.slug)) {
      result.push(added);
    }
  }
  return result;
}

/** Merges any AR fields present in the upload (plus slug renames/removals) into the existing ar/projects.json content. Returns null if nothing AR-related needs to change — the caller skips the second commit entirely in that case. */
function buildArUpdate(currentAr: ArProjectsFile, rows: ParsedProjectRow[], diff: ProjectDiff): ArProjectsFile | null {
  let changed = false;
  const items: Record<string, ArProjectEntry> = { ...currentAr.items };

  for (const { oldSlug, newSlug } of diff.slugChanged) {
    if (items[oldSlug] && !items[newSlug]) {
      items[newSlug] = items[oldSlug];
      delete items[oldSlug];
      changed = true;
    }
  }

  for (const row of rows) {
    if (!row.ar) continue;
    const key = row.slug;
    const existing = items[key] ?? {};
    const merged: ArProjectEntry = { ...existing };
    if (row.ar.sector !== undefined) merged.sector = row.ar.sector;
    if (row.ar.description !== undefined) merged.description = row.ar.description;
    if (row.ar.menascoScope !== undefined) merged.menascoScope = row.ar.menascoScope;
    if (row.ar.services !== undefined) merged.services = row.ar.services;
    items[key] = merged;
    changed = true;
  }

  for (const removed of diff.removed) {
    if (items[removed.slug]) {
      delete items[removed.slug];
      changed = true;
    }
  }

  if (!changed) return null;
  return { ...currentAr, items };
}

/**
 * POST /api/projects-cms/publish — session-protected. Requires `confirmed:
 * true` (the UI must have already shown the diff and gotten explicit
 * confirmation). Re-validates server-side against a FRESH read of
 * src/data/projects.json straight from GitHub (never this deployment's own
 * bundled copy) to avoid a lost-update race against a concurrent publish,
 * then commits the merged dataset. If any upload row carried Arabic
 * fields, commits an updated public/locales/ar/projects.json as a SEPARATE
 * commit (chosen over GitHub's lower-level Git Data API multi-file-atomic
 * commit — unnecessary complexity for a low-traffic internal tool with two
 * independent files; a failure between the two commits is surfaced
 * explicitly rather than claimed as a clean success or total failure).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'POST');
    requireProjectsCmsAuth(req);

    const body = requireJsonBody(req);
    const { content, format, fullReplacement, allowProtectedOverride, confirmed } = body as {
      content?: unknown;
      format?: unknown;
      fullReplacement?: unknown;
      allowProtectedOverride?: unknown;
      confirmed?: unknown;
    };

    if (confirmed !== true) {
      throw new HttpError(400, 'Publish requires an explicit confirmed: true flag after the user has reviewed the diff');
    }
    if (typeof content !== 'string' || content.length === 0) {
      throw new HttpError(400, 'Missing required field "content" (raw file text)');
    }
    if (format !== 'csv' && format !== 'json') {
      throw new HttpError(400, 'Field "format" must be "csv" or "json"');
    }

    let rows: ParsedProjectRow[];
    try {
      rows = parseProjectUpload(content, format);
    } catch (err) {
      if (err instanceof ProjectUploadParseError) {
        throw new HttpError(400, err.message);
      }
      throw err;
    }

    // Fresh read — never this deployment's own bundled src/data/projects.json.
    const freshFile = await getFile(PROJECTS_JSON_PATH);
    let freshProjects: ProjectRecord[];
    try {
      freshProjects = JSON.parse(freshFile.content) as ProjectRecord[];
    } catch {
      throw new HttpError(500, 'Could not parse the current src/data/projects.json fetched from GitHub');
    }

    const result = validateProjectUpload(rows, freshProjects, {
      fullReplacement: fullReplacement === true,
      allowProtectedOverride: allowProtectedOverride === true,
    });

    if (!result.valid) {
      sendJson(res, 400, { error: 'Validation failed against the current live dataset — nothing was published', ...result });
      return;
    }

    const finalProjects = applyDiffToDataset(freshProjects, result.diff);
    const newContent = `${JSON.stringify(finalProjects, null, 2)}\n`;

    let projectsCommitSha: string;
    try {
      const commitResult = await putFile(
        PROJECTS_JSON_PATH,
        newContent,
        freshFile.sha,
        `Projects CMS: update ${result.diff.added.length} added, ${result.diff.updated.length} updated, ${result.diff.removed.length} removed`,
      );
      projectsCommitSha = commitResult.commitSha;
    } catch (err) {
      if (err instanceof GithubCommitError) {
        throw new HttpError(err.isConflict ? 409 : 502, err.message);
      }
      throw err;
    }

    const hasArFields = rows.some((r) => r.ar !== undefined) || result.diff.slugChanged.length > 0 || result.diff.removed.length > 0;
    let arCommitSha: string | undefined;
    let arCommitError: string | undefined;

    if (hasArFields) {
      try {
        const freshAr = await getFile(AR_PROJECTS_JSON_PATH);
        const currentAr = JSON.parse(freshAr.content) as ArProjectsFile;
        const updatedAr = buildArUpdate(currentAr, rows, result.diff);
        if (updatedAr) {
          const arContent = `${JSON.stringify(updatedAr, null, 2)}\n`;
          const arCommitResult = await putFile(AR_PROJECTS_JSON_PATH, arContent, freshAr.sha, 'Projects CMS: update Arabic translations');
          arCommitSha = arCommitResult.commitSha;
        }
      } catch (err) {
        // The English projects.json commit already succeeded at this point — surface this
        // distinctly rather than claiming total success or total failure.
        arCommitError = err instanceof GithubCommitError ? err.message : (err as Error).message;
      }
    }

    sendJson(res, 200, {
      ok: true,
      projectsCommitSha,
      arCommitSha,
      arCommitError,
      message: arCommitError
        ? `Published src/data/projects.json (commit ${projectsCommitSha}), but the Arabic translations commit FAILED: ${arCommitError}. The English dataset is live; Arabic translations were not updated — retry the AR update separately.`
        : `Published successfully (commit ${projectsCommitSha}${arCommitSha ? `, AR commit ${arCommitSha}` : ''})`,
    });
  });
}
