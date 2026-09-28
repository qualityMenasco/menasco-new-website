import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronDown, Trash2 } from 'lucide-react';
import { Container } from '../../components/layout/Container';
import { Eyebrow, Heading, Text } from '../../components/typography/Typography';
import { TextField } from '../../components/forms/TextField';
import { Textarea } from '../../components/forms/Textarea';
import { Checkbox } from '../../components/forms/Checkbox';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../seo/SEO';
import { cn } from '../../lib/utils';
import { newsroomAdminApi, isLoggedInLocally, login, logout, uploadFileToS3, NewsroomApiError } from './newsroomAdminApi';
import { StructuredContentEditor } from './StructuredContentEditor';
import { ImageManager } from './ImageManager';
import { TagsInput } from './TagsInput';
import { ArticlePreview } from './ArticlePreview';
import { adminStatusLabel, adminStatusBadgeClassName } from './articleStatusLabel';
import { sortArticlesByCreatedAt } from './queueSort';
import type { QueueSortOrder } from './queueSort';
import { uaeLocalInputToIso, isoToUaeLocalInput, formatUaeDisplay } from './uaeTime';
import { deriveOpensDisplay, deriveClosesDisplay } from './publicationWindow';
import type { ArticleDetail, ArticleSummary, ArticleTag, StructuredContent } from './types';

type ArticleUpdate = Partial<{
  title: string | null;
  slug: string | null;
  subtitle: string | null;
  category: string | null;
  tags: ArticleTag[] | null;
  featured: boolean;
  structuredContent: StructuredContent;
  scheduledPublishAt: string | null;
  scheduledUnpublishAt: string | null;
}>;

/**
 * Internal editorial review + publishing workflow (Phase 3, auth
 * redesigned for Phase 6B). Reachable only at /dev/newsroom-admin, never
 * linked from the public site, `noIndex` — same unlisted-internal-tool
 * convention as /dev/preview. Every write goes through
 * `/api/newsroom-admin-proxy/*` (a same-origin Vercel function, session-
 * cookie authenticated) rather than ever holding the real
 * `NEWSROOM_ADMIN_API_KEY` in this page — see newsroomAdminApi.ts's own
 * header comment for the full architecture.
 */

function LoginGate({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!password) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(password);
      onLoggedIn();
    } catch (err) {
      setError(err instanceof NewsroomApiError ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 py-24">
      <Heading level="h3" as="h1">
        Newsroom admin access
      </Heading>
      <Text variant="body">
        Enter the Newsroom admin password. This is a separate credential from the backend&apos;s own API key: it never
        leaves this login step, and the browser never holds the permanent API key at all.
      </Text>
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      {error && <p className="text-body text-error">{error}</p>}
      <Button onClick={handleSubmit} disabled={!password} loading={submitting}>
        Continue
      </Button>
    </div>
  );
}

/** Single source of truth for "does this article have a real title" — used by the queue row, the delete button's aria-label, the status control's aria-label, and the delete confirmation modal, so none of them can ever disagree about the same article. A whitespace-only title counts as untitled too, not just null/empty. */
function articleDisplayTitle(title: string | null): string {
  const trimmed = title?.trim();
  return trimmed ? trimmed : '(untitled)';
}

function DeleteArticleModal({
  article,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  article: ArticleSummary;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const displayTitle = articleDisplayTitle(article.title);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-article-heading">
      <div className="w-full max-w-sm space-y-4 rounded-lg bg-warmwhite p-6 shadow-strong">
        <Heading level="h4" as="h2" id="delete-article-heading">
          Delete article?
        </Heading>
        <Text variant="body">&quot;{displayTitle}&quot; and its associated content will be permanently deleted. This action cannot be undone.</Text>
        {article.status === 'published' && (
          <Text variant="body" className="font-semibold text-error">
            This article is currently published. Deleting it will immediately remove it from the public Newsroom.
          </Text>
        )}
        {error && <Text variant="small" className="text-error">{error}</Text>}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center rounded-md border border-error px-5 text-body font-semibold text-error transition-colors duration-base hover:bg-error hover:text-warmwhite disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            {deleting ? 'Deleting…' : 'Delete article'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Picks just the ArticleSummary fields back out of a full ArticleDetail — publishArticle/unpublishArticle both return the detail shape, but the queue row only ever tracks the summary. */
function toArticleSummary(detail: ArticleDetail): ArticleSummary {
  return {
    id: detail.id,
    slug: detail.slug,
    title: detail.title,
    category: detail.category,
    featured: detail.featured,
    status: detail.status,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    publishedAt: detail.publishedAt,
    scheduledPublishAt: detail.scheduledPublishAt,
    scheduledUnpublishAt: detail.scheduledUnpublishAt,
  };
}

function StatusChangeModal({
  action,
  updating,
  error,
  onCancel,
  onConfirm,
}: {
  action: 'publish' | 'unpublish';
  updating: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isPublish = action === 'publish';
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-change-heading"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="w-full max-w-sm space-y-4 rounded-lg bg-warmwhite p-6 shadow-strong">
        <Heading level="h4" as="h2" id="status-change-heading">
          {isPublish ? 'Publish this article?' : 'Move article to Draft?'}
        </Heading>
        <Text variant="body">
          {isPublish ? 'This will make the article publicly visible.' : 'This will remove the article from the public Newsroom.'}
        </Text>
        {error && <Text variant="small" className="text-error">{error}</Text>}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={updating}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={updating} disabled={updating}>
            {updating ? 'Updating…' : isPublish ? 'Publish' : 'Move to Draft'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Compact status control for a single queue row — turns the status badge into a Draft/Published dropdown backed by the existing publish/unpublish API (never a direct status write). */
function StatusControl({ article, onChanged }: { article: ArticleSummary; onChanged: (updated: ArticleSummary) => void }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'publish' | 'unpublish' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const isPublished = article.status === 'published';

  async function applyChange(action: 'publish' | 'unpublish') {
    if (updating) return; // prevent duplicate/overlapping requests
    setUpdating(true);
    setError(null);
    try {
      const updated = action === 'publish' ? await newsroomAdminApi.publishArticle(article.id) : await newsroomAdminApi.unpublishArticle(article.id);
      onChanged(toArticleSummary(updated));
      setPendingAction(null);
    } catch (err) {
      // Deliberately never touches `article`/calls onChanged here — the row's displayed status
      // is only ever updated after a confirmed API success, so a failure needs no rollback: the
      // previous status was never left.
      setError((err as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => !updating && setOpen((o) => !o)}
        disabled={updating}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change status for "${articleDisplayTitle(article.title)}"`}
        className={cn(
          'inline-flex items-center gap-1 rounded px-2 py-0.5 text-caption transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-70',
          adminStatusBadgeClassName(article.status),
        )}
      >
        {updating ? 'Updating…' : adminStatusLabel(article.status)}
        <ChevronDown size={12} aria-hidden="true" className={cn('transition-transform duration-fast', open && 'rotate-180')} />
      </button>

      {open && (
        <div role="listbox" aria-label="Change status" className="absolute z-10 mt-1 w-36 rounded-md border border-gray-200 bg-warmwhite py-1 shadow-strong">
          {(['draft', 'published'] as const).map((option) => {
            const selected = (option === 'published') === isPublished;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setOpen(false);
                  if (selected) return;
                  setError(null);
                  setPendingAction(option === 'published' ? 'publish' : 'unpublish');
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-caption hover:bg-gray-100',
                  selected && 'font-semibold text-brand-600',
                )}
              >
                {option === 'published' ? 'Published' : 'Draft'}
                {selected && <Check size={12} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}

      {pendingAction && (
        <StatusChangeModal
          action={pendingAction}
          updating={updating}
          error={error}
          onCancel={() => {
            if (updating) return;
            setPendingAction(null);
            setError(null);
          }}
          onConfirm={() => applyChange(pendingAction)}
        />
      )}
    </div>
  );
}

function ArticleList({
  onSelect,
  onCreated,
  sortOrder,
  onSortOrderChange,
}: {
  onSelect: (id: string) => void;
  onCreated: (id: string) => void;
  sortOrder: QueueSortOrder;
  onSortOrderChange: (order: QueueSortOrder) => void;
}) {
  const [articles, setArticles] = useState<ArticleSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ArticleSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(() => {
    newsroomAdminApi
      .listArticles()
      .then(setArticles)
      .catch((err) => setError((err as Error).message));
  }, []);

  useEffect(load, [load]);

  async function createDraft() {
    setCreating(true);
    setError(null);
    try {
      const { id } = await newsroomAdminApi.createDraft();
      onCreated(id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  function closeDeleteModal() {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await newsroomAdminApi.deleteArticle(pendingDelete.id);
      setArticles((current) => (current ? current.filter((a) => a.id !== pendingDelete.id) : current));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  const sortedArticles = articles ? sortArticlesByCreatedAt(articles, sortOrder) : articles;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level="h3" as="h2">
          Review queue
        </Heading>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label htmlFor="queue-sort-order" className="text-caption text-gray-500">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="queue-sort-order"
                value={sortOrder}
                onChange={(event) => onSortOrderChange(event.target.value as QueueSortOrder)}
                className="appearance-none rounded-md border border-gray-300 bg-warmwhite py-1.5 ps-3 pe-7 text-caption text-ink"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
              <ChevronDown size={12} aria-hidden="true" className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <Button onClick={createDraft} loading={creating}>
            New draft
          </Button>
        </div>
      </div>
      {error && <p className="text-body text-error">{error}</p>}
      {!sortedArticles ? (
        <p className="text-body text-gray-500">Loading…</p>
      ) : sortedArticles.length === 0 ? (
        <p className="text-body text-gray-500">No articles yet.</p>
      ) : (
        <table className="w-full border-collapse text-left text-body">
          <thead>
            <tr className="border-b border-gray-300 text-caption uppercase text-gray-500">
              <th className="py-2 pr-4">Title</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Created</th>
              <th className="hidden py-2 pr-4 md:table-cell">Opens</th>
              <th className="hidden py-2 pr-4 md:table-cell">Closes</th>
              <th className="py-2 pr-4 md:hidden">Publication window</th>
              <th className="py-2 pl-4 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedArticles.map((a) => (
              <tr key={a.id} className="cursor-pointer border-b border-gray-200 hover:bg-gray-50" onClick={() => onSelect(a.id)}>
                <td className="py-2 pr-4">{a.title || <span className="text-gray-400">(untitled)</span>}</td>
                <td className="py-2 pr-4">
                  <StatusControl
                    article={a}
                    onChanged={(updated) =>
                      setArticles((current) => (current ? current.map((x) => (x.id === updated.id ? updated : x)) : current))
                    }
                  />
                  {a.featured && <span className="ml-1 rounded bg-brand-100 px-2 py-0.5 text-caption text-brand-700">featured</span>}
                </td>
                <td className="py-2 pr-4">{a.category ?? '-'}</td>
                <td className="py-2 pr-4">{new Date(a.createdAt).toLocaleString()}</td>
                <td className="hidden py-2 pr-4 text-caption text-gray-600 md:table-cell">{deriveOpensDisplay(a)}</td>
                <td className="hidden py-2 pr-4 text-caption text-gray-600 md:table-cell">{deriveClosesDisplay(a)}</td>
                <td className="py-2 pr-4 text-caption text-gray-600 md:hidden">
                  <div>Opens: {deriveOpensDisplay(a)}</div>
                  <div>Closes: {deriveClosesDisplay(a)}</div>
                </td>
                <td className="py-2 pl-4 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteError(null);
                      setPendingDelete(a);
                    }}
                    aria-label={`Delete "${articleDisplayTitle(a.title)}"`}
                    className="rounded p-1.5 text-gray-400 transition-colors duration-fast hover:bg-error/10 hover:text-error"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pendingDelete && (
        <DeleteArticleModal article={pendingDelete} deleting={deleting} error={deleteError} onCancel={closeDeleteModal} onConfirm={confirmDelete} />
      )}
    </div>
  );
}

/**
 * Consistent section rhythm for the article editor: a compact heading row
 * (with an optional right-aligned action/meta) separated from the section
 * above it by a thin divider rather than a boxed card, so the editor reads
 * as one continuous document instead of a stack of dashboard widgets.
 */
function EditorSection({
  title,
  action,
  helperText,
  first = false,
  children,
}: {
  title: string;
  action?: ReactNode;
  helperText?: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={cn('space-y-3', !first && 'border-t border-gray-200 pt-6')}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Heading level="h4" as="h2">
          {title}
        </Heading>
        {action}
      </div>
      {helperText && (
        <Text variant="small" className="text-gray-500">
          {helperText}
        </Text>
      )}
      {children}
    </section>
  );
}

/** Compact, editorial treatment for native file inputs — restyles the browser's own picker button via Tailwind's `file:` variant rather than replacing the input, so selection/keyboard/screen-reader behavior is untouched. */
const fileInputClassName =
  'text-caption text-gray-600 file:mr-3 file:rounded-sm file:border file:border-gray-300 file:bg-warmwhite file:px-3 file:py-1.5 file:text-caption file:font-semibold file:text-ink hover:file:border-ink';

function ArticleEditor({ articleId, onBack }: { articleId: string; onBack: () => void }) {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [structuredContentExpanded, setStructuredContentExpanded] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const imageUploadInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    newsroomAdminApi
      .getArticle(articleId)
      .then(setArticle)
      .catch((err) => setLoadError((err as Error).message));
  }, [articleId]);

  useEffect(load, [load]);
  // Collapsed by default for every article — ArticleEditor isn't remounted when the admin
  // switches between articles (no `key` on it), so this resets it explicitly per articleId
  // rather than relying on initial state, which would only apply to the very first article opened.
  useEffect(() => setStructuredContentExpanded(false), [articleId]);

  async function save(update: ArticleUpdate) {
    setSaveState('saving');
    setSaveError(null);
    try {
      const updated = await newsroomAdminApi.updateArticle(articleId, update);
      setArticle(updated);
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof NewsroomApiError ? err.message : 'Save failed');
    }
  }

  async function handleProcess() {
    setProcessing(true);
    setActionError(null);
    try {
      await newsroomAdminApi.processArticle(articleId);
      load();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setProcessing(false);
    }
  }

  async function handlePublish() {
    setActionError(null);
    try {
      const updated = await newsroomAdminApi.publishArticle(articleId);
      setArticle(updated);
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleUnpublish() {
    setActionError(null);
    try {
      const updated = await newsroomAdminApi.unpublishArticle(articleId);
      setArticle(updated);
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleViewSource() {
    setActionError(null);
    try {
      const { url } = await newsroomAdminApi.getSourceUrl(articleId);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleUploadPdf() {
    if (!pdfFile) return;
    setUploading(true);
    setActionError(null);
    try {
      const presign = await newsroomAdminApi.presignUpload(articleId, { type: 'pdf', filename: pdfFile.name, contentType: 'application/pdf' });
      await uploadFileToS3(presign.uploadUrl, pdfFile);
      await newsroomAdminApi.finalizeUpload(articleId, { type: 'pdf', s3Key: presign.s3Key });
      setPdfFile(null);
      load();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleUploadImage() {
    if (!imageFile || !article) return;
    setUploading(true);
    setActionError(null);
    try {
      const position = article.images.length;
      const presign = await newsroomAdminApi.presignUpload(articleId, { type: 'image', filename: imageFile.name, contentType: imageFile.type, position });
      await uploadFileToS3(presign.uploadUrl, imageFile);
      await newsroomAdminApi.finalizeUpload(articleId, { type: 'image', s3Key: presign.s3Key, position });
      setImageFile(null);
      // The file <input> is uncontrolled — React state alone doesn't clear its displayed
      // filename, and this reset must only happen on success so a failed upload leaves the
      // selection in place for the editor to retry without re-picking the file.
      if (imageUploadInputRef.current) imageUploadInputRef.current.value = '';
      load();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  if (loadError) return <p className="text-body text-error">{loadError}</p>;
  if (!article) return <p className="text-body text-gray-500">Loading…</p>;

  const canPublish = article.status === 'ready' || article.status === 'published';
  const imageCount = article.images.length;
  const imageCountLabel =
    imageCount === 0 ? 'No images uploaded yet. You can add multiple images.' : `${imageCount} ${imageCount === 1 ? 'image' : 'images'} uploaded`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <Button variant="text" onClick={onBack}>
          ← Back to queue
        </Button>
        <div className="flex items-center gap-2">
          <span className={cn('rounded px-2 py-1 text-caption', adminStatusBadgeClassName(article.status))}>{adminStatusLabel(article.status)}</span>
          {saveState === 'saving' && <span className="text-caption text-gray-500">Saving…</span>}
          {saveState === 'saved' && <span className="text-caption text-success">Saved</span>}
        </div>
      </div>

      {actionError && <p className="text-body text-error">{actionError}</p>}
      {saveError && <p className="text-body text-error">{saveError}</p>}

      <EditorSection title="Article Details" first>
        <TextField label="Title" defaultValue={article.title ?? ''} onBlur={(e) => e.target.value !== (article.title ?? '') && save({ title: e.target.value })} />
        <Textarea label="Subtitle" rows={2} defaultValue={article.subtitle ?? ''} onBlur={(e) => e.target.value !== (article.subtitle ?? '') && save({ subtitle: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Slug" defaultValue={article.slug ?? ''} onBlur={(e) => e.target.value !== (article.slug ?? '') && save({ slug: e.target.value })} />
          <TextField label="Category" defaultValue={article.category ?? ''} onBlur={(e) => e.target.value !== (article.category ?? '') && save({ category: e.target.value })} />
        </div>
        <Checkbox label="Featured" checked={article.featured} onChange={(e) => save({ featured: e.target.checked })} />
      </EditorSection>

      <EditorSection title="Source & Content">
        {article.sourcePdf ? (
          <div className="flex flex-wrap items-center gap-3">
            <Text variant="small" className="truncate text-gray-600">{article.sourcePdf.s3Key}</Text>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleViewSource}>
                View (5-min link)
              </Button>
              <Button variant="outline" size="sm" onClick={handleProcess} loading={processing}>
                {article.structuredContent ? 'Reprocess' : 'Process'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <input type="file" accept="application/pdf" className={fileInputClassName} onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} />
            <Button variant="outline" size="sm" onClick={handleUploadPdf} disabled={!pdfFile} loading={uploading}>
              Upload PDF
            </Button>
          </div>
        )}

        {article.structuredContent && (
          <div className="rounded-sm border border-gray-200">
            <button
              type="button"
              onClick={() => setStructuredContentExpanded((expanded) => !expanded)}
              aria-expanded={structuredContentExpanded}
              aria-controls="structured-content-panel"
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-start"
            >
              <div>
                <Text variant="small" className="font-semibold text-ink">
                  Structured Content
                </Text>
                <Text variant="caption" className="text-gray-500">
                  Advanced article layout editing
                </Text>
              </div>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={cn('shrink-0 text-gray-400 transition-transform duration-200', structuredContentExpanded && 'rotate-180')}
              />
            </button>
            <div
              id="structured-content-panel"
              className={cn(
                'grid transition-[grid-template-rows] duration-200 ease-out',
                structuredContentExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-4 border-t border-gray-200 p-4">
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => article.structuredContent && save({ structuredContent: article.structuredContent as StructuredContent })}
                    >
                      Save content
                    </Button>
                  </div>
                  <StructuredContentEditor
                    value={article.structuredContent as StructuredContent}
                    images={article.images}
                    onChange={(sc) => setArticle({ ...article, structuredContent: sc })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </EditorSection>

      <EditorSection
        title="Images"
        action={
          <p className="text-caption text-gray-500">
            {imageCountLabel}
            {imageCount > 0 && (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={() => imageUploadInputRef.current?.click()}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  Add more
                </button>
              </>
            )}
          </p>
        }
      >
        <ImageManager articleId={articleId} images={article.images} onImagesChanged={(images) => setArticle({ ...article, images })} />
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3">
          <input
            ref={imageUploadInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choose image file"
            className={fileInputClassName}
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="outline" size="sm" onClick={handleUploadImage} disabled={!imageFile} loading={uploading}>
            Upload images
          </Button>
        </div>
      </EditorSection>

      <EditorSection title="Related Topics & Keywords" helperText="Topics connect readers with related Newsroom content and are more specific than Category.">
        <TagsInput tags={article.tags} onChange={(tags) => save({ tags })} />
      </EditorSection>

      <EditorSection title="Publishing">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="small" className="text-gray-500">
            Preview your article before publishing.
          </Text>
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            Preview Article
          </Button>
        </div>

        {previewOpen && <ArticlePreview articleId={articleId} article={article} onClose={() => setPreviewOpen(false)} />}

        <div className="grid gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2">
          <TextField
            type="datetime-local"
            label="Publish start (UAE time)"
            defaultValue={isoToUaeLocalInput(article.scheduledPublishAt)}
            onBlur={(e) => {
              const iso = uaeLocalInputToIso(e.target.value);
              if (iso !== article.scheduledPublishAt) save({ scheduledPublishAt: iso });
            }}
            disabled={article.status !== 'ready'}
          />
          <TextField
            type="datetime-local"
            label="Auto-unpublish (optional, UAE time)"
            defaultValue={isoToUaeLocalInput(article.scheduledUnpublishAt)}
            onBlur={(e) => {
              const iso = uaeLocalInputToIso(e.target.value);
              if (iso !== article.scheduledUnpublishAt) save({ scheduledUnpublishAt: iso });
            }}
            disabled={article.status !== 'ready' && article.status !== 'published'}
          />
        </div>
        {article.scheduledPublishAt && <p className="text-caption text-gray-500">Scheduled for: {formatUaeDisplay(article.scheduledPublishAt)}</p>}
        {article.scheduledUnpublishAt && <p className="text-caption text-gray-500">Ends: {formatUaeDisplay(article.scheduledUnpublishAt)}</p>}
        {article.scheduledPublishAt && new Date(article.scheduledPublishAt) <= new Date() && article.status !== 'published' && (
          <p className="text-caption text-error">
            Scheduled publish is overdue and has not executed. The article is currently "{adminStatusLabel(article.status)}": check whether it's
            processable, or publish manually.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
          {!canPublish && <Text variant="small" className="mr-auto text-gray-500">Process this article before publishing.</Text>}
          {article.publishedAt && <Text variant="small" className="mr-auto text-gray-500">Last published: {new Date(article.publishedAt).toLocaleString()}</Text>}
          {article.status === 'published' ? (
            <Button variant="outline" className="border-error text-error hover:bg-error hover:text-warmwhite" onClick={handleUnpublish}>
              Unpublish
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={!canPublish}>
              Publish
            </Button>
          )}
        </div>
      </EditorSection>

      <details className="border-t border-gray-200 pt-4">
        <summary className="cursor-pointer text-caption text-gray-500">Raw JSON (debug view)</summary>
        <pre className="mt-3 overflow-auto text-caption">{JSON.stringify(article, null, 2)}</pre>
      </details>
    </div>
  );
}

export default function NewsroomAdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => isLoggedInLocally());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Lifted above ArticleList (rather than local to it) so the chosen sort order survives
  // navigating into an article and back to the queue within the same session.
  const [sortOrder, setSortOrder] = useState<QueueSortOrder>('newest');

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
    setSelectedId(null);
  }

  return (
    <div>
      <SEO title="Newsroom Admin" description="Internal Newsroom editorial review and publishing tool. Not a public page." path="/dev/newsroom-admin" noIndex />
      <Container width="wide" className="py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Eyebrow>MENASCO Internal</Eyebrow>
            <Heading level="h2" as="h1" className="mt-2">
              Newsroom editorial review
            </Heading>
          </div>
          {loggedIn && (
            <Button variant="text" onClick={handleLogout}>
              Log out
            </Button>
          )}
        </div>

        {!loggedIn ? (
          <LoginGate onLoggedIn={() => setLoggedIn(true)} />
        ) : selectedId ? (
          <ArticleEditor articleId={selectedId} onBack={() => setSelectedId(null)} />
        ) : (
          <ArticleList onSelect={setSelectedId} onCreated={setSelectedId} sortOrder={sortOrder} onSortOrderChange={setSortOrder} />
        )}
      </Container>
    </div>
  );
}
