import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { Container } from '../../components/layout/Container';
import { Heading, Text } from '../../components/typography/Typography';
import { TextField } from '../../components/forms/TextField';
import { Checkbox } from '../../components/forms/Checkbox';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../seo/SEO';
import { cn } from '../../lib/utils';
import {
  isLoggedInLocally,
  login,
  logout,
  validateUpload,
  publishUpload,
  exportCurrentDataset,
  ProjectsCmsApiError,
  type ValidationResultDto,
  type PublishResultDto,
} from './projectsCmsApi';
import { PROTECTED_SLUGS } from './protectedSlugs';

/**
 * Internal GitHub-backed Projects CMS. Reachable only at /dev/projects-cms,
 * never linked from the public site, noIndex, desktop-only (same unlisted
 * internal-tool convention as /dev/projects-admin and /dev/newsroom-admin).
 * Flow: login -> upload a CSV/JSON file -> server-side validate + diff
 * preview -> explicit confirm -> publish (commits straight to GitHub `main`,
 * which auto-triggers a Vercel redeploy — this page never calls Vercel).
 */

// ---------------------------------------------------------------------------
// Login gate — mirrors ProjectsAdminPage.tsx's LoginGate exactly (UI/UX
// precedent only; this is new, independent code against a new endpoint).
// ---------------------------------------------------------------------------
function LoginGate({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(password);
      onLoggedIn();
    } catch (err) {
      setError(err instanceof ProjectsCmsApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container width="narrow">
      <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 py-24">
        <Heading level="h3" as="h1">
          Projects CMS
        </Heading>
        <TextField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
        {error && <p className="text-body text-error">{error}</p>}
        <Button type="submit" loading={loading} fullWidth>
          Sign in
        </Button>
      </form>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// File upload + options
// ---------------------------------------------------------------------------
function detectFormat(fileName: string): 'csv' | 'json' | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.json')) return 'json';
  return null;
}

interface UploadBoxProps {
  onFileLoaded: (content: string, format: 'csv' | 'json', fileName: string) => void;
  error: string | null;
}

function UploadBox({ onFileLoaded, error }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function readFile(file: File) {
    const format = detectFormat(file.name);
    if (!format) {
      onFileLoaded('', 'csv', file.name); // triggers the parent's "unsupported format" path via empty content + mismatched name handling below
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onFileLoaded(String(reader.result ?? ''), format, file.name);
    reader.readAsText(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) readFile(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) readFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'cursor-pointer rounded-sm border-2 border-dashed p-8 text-center transition-colors',
        dragOver ? 'border-ink bg-gray-50' : 'border-gray-300',
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".csv,.json" className="hidden" onChange={handleChange} />
      <Text variant="body" className="text-gray-700">
        Drop a .csv or .json file here, or click to choose one.
      </Text>
      {error && <p className="mt-2 text-body text-error">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Diff preview
// ---------------------------------------------------------------------------
function DiffPreview({ result }: { result: ValidationResultDto }) {
  const { diff, errors } = result;
  const protectedErrors = errors.filter((e) => e.field === 'protected');
  const otherErrors = errors.filter((e) => e.field !== 'protected');

  return (
    <div className="space-y-4">
      {protectedErrors.length > 0 && (
        <div className="rounded-sm border-2 border-error bg-error/10 p-3">
          <Text variant="body" className="font-semibold text-error">
            Protected project conflict
          </Text>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-small text-error">
            {protectedErrors.map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {diff.slugChanged.length > 0 && (
        <div className="rounded-sm border-2 border-amber-500 bg-amber-50 p-3">
          <Text variant="body" className="font-semibold text-amber-800">
            Slug changes
          </Text>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-small text-amber-800">
            {diff.slugChanged.map((s, i) => (
              <li key={i}>
                "{s.oldSlug}" → "{s.newSlug}"
              </li>
            ))}
          </ul>
        </div>
      )}

      {otherErrors.length > 0 && (
        <div className="rounded-sm border border-error bg-error/5 p-3">
          <Text variant="body" className="font-semibold text-error">
            Validation errors ({otherErrors.length}) — publishing is blocked until these are fixed
          </Text>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-small text-error">
            {otherErrors.map((e, i) => (
              <li key={i}>
                <strong>{e.row}</strong> ({e.field}): {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.added.length > 0 && (
        <div className="rounded-sm border border-green-600 bg-green-50 p-3">
          <Text variant="body" className="font-semibold text-green-800">
            Added ({diff.added.length})
          </Text>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-small text-green-800">
            {diff.added.map((p) => (
              <li key={p.slug}>
                {p.title} ({p.slug})
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.updated.length > 0 && (
        <div className="rounded-sm border border-amber-500 bg-amber-50 p-3">
          <Text variant="body" className="font-semibold text-amber-800">
            Updated ({diff.updated.length})
          </Text>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-small text-amber-800">
            {diff.updated.map((u) => (
              <li key={u.slug}>
                {u.after.title} ({u.slug}) — changed: {u.changedFields.join(', ')}
                {PROTECTED_SLUGS.has(u.before.slug) && <strong> [PROTECTED]</strong>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.removed.length > 0 && (
        <div className="rounded-sm border border-error bg-error/5 p-3">
          <Text variant="body" className="font-semibold text-error">
            Removed ({diff.removed.length})
          </Text>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-small text-error">
            {diff.removed.map((r) => (
              <li key={r.slug}>
                {r.title} ({r.slug})
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.added.length === 0 && diff.updated.length === 0 && diff.removed.length === 0 && errors.length === 0 && (
        <Text variant="body" className="text-gray-500">
          No changes detected.
        </Text>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level page
// ---------------------------------------------------------------------------
export default function ProjectsCmsPage() {
  const [loggedIn, setLoggedIn] = useState(() => isLoggedInLocally());
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [format, setFormat] = useState<'csv' | 'json'>('json');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fullReplacement, setFullReplacement] = useState(false);
  const [allowProtectedOverride, setAllowProtectedOverride] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResultDto | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResultDto | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
  }

  /** Downloads the live dataset as-is — this is what makes a safe deletion practical: download, remove the entry you don't want, re-upload with "full dataset replacement" checked, instead of hand-assembling the whole project list from memory and risking an accidental omission. */
  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      const data = await exportCurrentDataset();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `menasco-projects-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof ProjectsCmsApiError ? err.message : 'Download request failed');
    } finally {
      setDownloading(false);
    }
  }

  const runValidation = useCallback(
    async (content: string, fmt: 'csv' | 'json', replacement: boolean, override: boolean) => {
      setValidating(true);
      setValidationError(null);
      setValidation(null);
      setPublishResult(null);
      setPublishError(null);
      try {
        const result = await validateUpload({ content, format: fmt, fullReplacement: replacement, allowProtectedOverride: override });
        setValidation(result);
      } catch (err) {
        setValidationError(err instanceof ProjectsCmsApiError ? err.message : 'Validation request failed');
      } finally {
        setValidating(false);
      }
    },
    [],
  );

  function handleFileLoaded(content: string, fmt: 'csv' | 'json', name: string) {
    if (!content) {
      setFileError(`Unsupported file "${name}" — only .csv and .json are accepted.`);
      return;
    }
    setFileError(null);
    setFileContent(content);
    setFormat(fmt);
    setFileName(name);
    void runValidation(content, fmt, fullReplacement, allowProtectedOverride);
  }

  function handleToggleFullReplacement(checked: boolean) {
    setFullReplacement(checked);
    if (fileContent) void runValidation(fileContent, format, checked, allowProtectedOverride);
  }

  function handleToggleOverride(checked: boolean) {
    setAllowProtectedOverride(checked);
    if (fileContent) void runValidation(fileContent, format, fullReplacement, checked);
  }

  async function handlePublish() {
    if (!fileContent || !validation || !validation.valid) return;

    const { diff } = validation;
    const summary = [
      `Added: ${diff.added.length}`,
      `Updated: ${diff.updated.length}`,
      `Removed: ${diff.removed.length}`,
      `Slug changes: ${diff.slugChanged.length}`,
    ].join('\n');
    const confirmed = window.confirm(`Publish these changes to the live site?\n\n${summary}\n\nThis commits directly to GitHub main and will trigger a production deploy.`);
    if (!confirmed) return;

    setPublishing(true);
    setPublishError(null);
    setPublishResult(null);
    try {
      const result = await publishUpload({ content: fileContent, format, fullReplacement, allowProtectedOverride });
      setPublishResult(result);
    } catch (err) {
      setPublishError(err instanceof ProjectsCmsApiError ? err.message : 'Publish request failed');
    } finally {
      setPublishing(false);
    }
  }

  const hasProtectedConflict = Boolean(validation?.errors.some((e) => e.field === 'protected'));
  const canPublish = Boolean(validation?.valid) && !publishing;

  return (
    <>
      <SEO title="Projects CMS" description="Internal GitHub-backed Projects CMS. Not a public page." path="/dev/projects-cms" noIndex />
      <Container width="standard">
        <div className="py-8">
          {!loggedIn ? (
            <LoginGate onLoggedIn={() => setLoggedIn(true)} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <Heading level="h3" as="h1">
                  Projects CMS
                </Heading>
                <Button variant="text" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>

              <Text variant="body" className="text-gray-600">
                Upload a CSV or JSON file describing new or updated projects. Nothing is written until you review the diff below and
                explicitly confirm publishing.
              </Text>

              <div className="flex items-center justify-between gap-3 rounded-sm border border-gray-200 bg-gray-50 p-3">
                <Text variant="small" className="text-gray-600">
                  Deleting a project? Download the current live dataset, remove the entry you don't want, then re-upload it below with
                  "full dataset replacement" checked.
                </Text>
                <Button variant="secondary" size="sm" onClick={handleDownload} loading={downloading}>
                  Download current dataset
                </Button>
              </div>
              {downloadError && <p className="text-body text-error">{downloadError}</p>}

              <UploadBox onFileLoaded={handleFileLoaded} error={fileError} />
              {fileName && (
                <Text variant="caption" className="text-gray-500">
                  Loaded: {fileName} ({format.toUpperCase()})
                </Text>
              )}

              <div className="flex flex-wrap items-start gap-6 border-t border-gray-200 pt-4">
                <Checkbox
                  label="This is a full dataset replacement (missing slugs will be deleted)"
                  checked={fullReplacement}
                  onChange={(e) => handleToggleFullReplacement(e.target.checked)}
                />
                {hasProtectedConflict && (
                  <Checkbox
                    label="I understand this includes changes to a protected project (VELA / Qiddiya) and want to proceed"
                    checked={allowProtectedOverride}
                    onChange={(e) => handleToggleOverride(e.target.checked)}
                  />
                )}
              </div>

              {validating && <Text variant="body" className="text-gray-500">Validating…</Text>}
              {validationError && <p className="text-body text-error">{validationError}</p>}
              {validation && <DiffPreview result={validation} />}

              {validation && (
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                  {!validation.valid && (
                    <Text variant="small" className="mr-auto text-error">
                      Fix all validation errors above before publishing.
                    </Text>
                  )}
                  <Button onClick={handlePublish} disabled={!canPublish} loading={publishing}>
                    Publish
                  </Button>
                </div>
              )}

              {publishError && <p className="text-body text-error">{publishError}</p>}
              {publishResult && (
                <div className={cn('rounded-sm border p-3', publishResult.arCommitError ? 'border-amber-500 bg-amber-50' : 'border-green-600 bg-green-50')}>
                  <Text variant="body" className={publishResult.arCommitError ? 'font-semibold text-amber-800' : 'font-semibold text-green-800'}>
                    {publishResult.message}
                  </Text>
                  <Text variant="caption" className="mt-1 block text-gray-600">
                    projects.json commit: {publishResult.projectsCommitSha}
                    {publishResult.arCommitSha && ` · ar/projects.json commit: ${publishResult.arCommitSha}`}
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
