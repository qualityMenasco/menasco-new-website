import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Container } from '../../components/layout/Container';
import { Heading, Text } from '../../components/typography/Typography';
import { TextField } from '../../components/forms/TextField';
import { Textarea } from '../../components/forms/Textarea';
import { Checkbox } from '../../components/forms/Checkbox';
import { Button } from '../../components/ui/Button';
import { SEO } from '../../seo/SEO';
import { cn } from '../../lib/utils';
import { projectsAdminApi, isLoggedInLocally, login, logout, uploadFileToS3, ProjectsApiError } from './projectsAdminApi';
import { ProjectMetricsManager } from './ProjectMetricsManager';
import { ProjectImageManager } from './ProjectImageManager';
import { ProjectPreview } from './ProjectPreview';
import type { AdminProject, CreateProjectInput, ProjectCompletionStatus, ProjectStatus } from './types';

/**
 * Internal Projects data-entry workflow (Phase 4). Reachable only at
 * /dev/projects-admin, never linked from the public site, `noIndex` — same
 * unlisted-internal-tool convention as /dev/newsroom-admin. Every write
 * goes through /api/projects-admin-proxy/* (a same-origin Vercel function,
 * session-cookie authenticated) rather than ever holding the real
 * PROJECTS_ADMIN_API_KEY in this page — see projectsAdminApi.ts's own
 * header comment.
 */

const COMPLETION_STATUSES: ProjectCompletionStatus[] = ['ongoing', 'completed', 'on_hold'];

function completionStatusLabel(status: ProjectCompletionStatus): string {
  if (status === 'ongoing') return 'Ongoing';
  if (status === 'completed') return 'Completed';
  return 'On Hold';
}

function statusBadgeClassName(status: ProjectStatus): string {
  return status === 'published' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700';
}

// ---------------------------------------------------------------------------
// Login gate — mirrors src/internal/newsroom/NewsroomAdminPage.tsx's LoginGate exactly.
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
      setError(err instanceof ProjectsApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container width="narrow">
      <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 py-24">
        <Heading level="h3" as="h1">
          Projects Admin
        </Heading>
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
        {error && <p className="text-body text-error">{error}</p>}
        <Button type="submit" loading={loading} fullWidth>
          Sign in
        </Button>
      </form>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// Shared section layout — mirrors NewsroomAdminPage.tsx's EditorSection.
// ---------------------------------------------------------------------------
function EditorSection({ title, action, first = false, children }: { title: string; action?: ReactNode; first?: boolean; children: ReactNode }) {
  return (
    <section className={cn('space-y-3', !first && 'border-t border-gray-200 pt-6')}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Heading level="h4" as="h2">
          {title}
        </Heading>
        {action}
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Dashboard + queue
// ---------------------------------------------------------------------------
type SortKey = 'commonName' | 'category' | 'location' | 'completionStatus' | 'status' | 'featured';

function ProjectDashboard({ onSelect, onCreate }: { onSelect: (id: string) => void; onCreate: () => void }) {
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('commonName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [pendingDelete, setPendingDelete] = useState<AdminProject | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<AdminProject | null>(null);

  const load = useCallback(() => {
    projectsAdminApi
      .listProjects()
      .then(setProjects)
      .catch((err) => setError((err as Error).message));
  }, []);

  useEffect(load, [load]);

  const stats = useMemo(() => {
    const list = projects ?? [];
    return {
      total: list.length,
      published: list.filter((p) => p.status === 'published').length,
      draft: list.filter((p) => p.status === 'draft').length,
      featured: list.filter((p) => p.featured).length,
    };
  }, [projects]);

  const filteredSorted = useMemo(() => {
    const list = projects ?? [];
    const q = search.trim().toLowerCase();
    const filtered = q
      ? list.filter((p) => [p.commonName, p.category, p.location, p.projectClass].some((f) => f.toLowerCase().includes(q)))
      : list;
    const sorted = [...filtered].sort((a, b) => {
      const av = sortKey === 'featured' ? Number(a.featured) : a[sortKey];
      const bv = sortKey === 'featured' ? Number(b.featured) : b[sortKey];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [projects, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function SortHeader({ label, sortKey: key }: { label: string; sortKey: SortKey }) {
    return (
      <th className="py-2 pr-4">
        <button type="button" onClick={() => toggleSort(key)} className="flex items-center gap-1 text-caption uppercase text-gray-500 hover:text-ink">
          {label}
          {sortKey === key && (sortDir === 'asc' ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />)}
        </button>
      </th>
    );
  }

  async function togglePublish(project: AdminProject) {
    setBusyId(project.id);
    setError(null);
    try {
      const updated = await projectsAdminApi.updateProject(project.id, { status: project.status === 'published' ? 'draft' : 'published' });
      setProjects((current) => (current ? current.map((p) => (p.id === updated.id ? updated : p)) : current));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    setError(null);
    try {
      await projectsAdminApi.deleteProject(pendingDelete.id);
      setProjects((current) => (current ? current.filter((p) => p.id !== pendingDelete.id) : current));
      setPendingDelete(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function openPreview(id: string) {
    setError(null);
    try {
      const project = await projectsAdminApi.getProject(id);
      setPreviewProject(project);
      setPreviewId(id);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level="h3" as="h1">
          Projects
        </Heading>
        <Button onClick={onCreate}>New Project</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Published', value: stats.published },
          { label: 'Draft', value: stats.draft },
          { label: 'Featured', value: stats.featured },
        ].map((stat) => (
          <div key={stat.label} className="rounded-sm border border-gray-200 bg-warmwhite p-3">
            <Text variant="caption" className="text-gray-500">
              {stat.label}
            </Text>
            <Text variant="body-lg" className="font-semibold text-ink">
              {stat.value}
            </Text>
          </div>
        ))}
      </div>

      {error && <p className="text-body text-error">{error}</p>}

      <TextField
        label="Search"
        containerClassName="max-w-sm"
        placeholder="Search by name, category, location…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search projects"
      />

      {!filteredSorted && !projects ? (
        <p className="text-body text-gray-500">Loading…</p>
      ) : projects && projects.length === 0 ? (
        <p className="text-body text-gray-500">No projects yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-body">
            <thead>
              <tr className="border-b border-gray-300 text-caption uppercase text-gray-500">
                <SortHeader label="Common Name" sortKey="commonName" />
                <SortHeader label="Category" sortKey="category" />
                <SortHeader label="Location" sortKey="location" />
                <SortHeader label="Completion" sortKey="completionStatus" />
                <SortHeader label="Status" sortKey="status" />
                <SortHeader label="Featured" sortKey="featured" />
                <th className="py-2 pl-4 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((p) => (
                <tr key={p.id} className="cursor-pointer border-b border-gray-200 hover:bg-gray-50" onClick={() => onSelect(p.id)}>
                  <td className="py-2 pr-4">{p.commonName}</td>
                  <td className="py-2 pr-4">{p.category}</td>
                  <td className="py-2 pr-4">{p.location}</td>
                  <td className="py-2 pr-4">{completionStatusLabel(p.completionStatus)}</td>
                  <td className="py-2 pr-4">
                    <span className={cn('rounded px-2 py-1 text-caption', statusBadgeClassName(p.status))}>{p.status === 'published' ? 'Published' : 'Draft'}</span>
                  </td>
                  <td className="py-2 pr-4">{p.featured ? 'Yes' : '—'}</td>
                  <td className="py-2 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1.5">
                      <Button variant="text" size="sm" onClick={() => openPreview(p.id)}>
                        Preview
                      </Button>
                      <Button variant="text" size="sm" onClick={() => togglePublish(p)} loading={busyId === p.id}>
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(p)}
                        aria-label={`Delete "${p.commonName}"`}
                        className="rounded px-2 py-1 text-caption text-error hover:bg-error/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingDelete && (
        <div role="dialog" aria-modal="true" aria-label="Delete project?" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-sm rounded-md bg-warmwhite p-5 shadow-lg">
            <p className="text-body font-semibold text-ink">Delete project?</p>
            <p className="mt-1 text-small text-gray-600">
              "{pendingDelete.commonName}" and all of its metrics and images will be permanently deleted. This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPendingDelete(null)} disabled={busyId === pendingDelete.id}>
                Cancel
              </Button>
              <Button size="sm" onClick={confirmDelete} loading={busyId === pendingDelete.id} className="bg-error hover:bg-error/90">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {previewId && previewProject && (
        <ProjectPreview
          projectId={previewId}
          project={previewProject}
          onClose={() => {
            setPreviewId(null);
            setPreviewProject(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create form — collects every required field up front (project_records has
// almost no nullable columns; there is no "empty draft" concept here).
// ---------------------------------------------------------------------------
const EMPTY_CREATE_INPUT: CreateProjectInput = {
  epromiseId: '',
  epromiseName: '',
  commonName: '',
  slug: '',
  projectClass: '',
  projectType: '',
  category: '',
  location: '',
  country: '',
  consultant: '',
  client: '',
  completionDate: '',
  completionStatus: 'ongoing',
  publicDescription: '',
  privateDescription: '',
  durationMonths: 0,
  peakWorkforce: 0,
  builtAreaSqm: 0,
  valueAmount: 0,
  valueCurrency: 'AED',
  floors: 0,
  featured: false,
};

function CreateProjectForm({ onCreated, onCancel }: { onCreated: (id: string) => void; onCancel: () => void }) {
  const [input, setInput] = useState<CreateProjectInput>(EMPTY_CREATE_INPUT);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function set<K extends keyof CreateProjectInput>(key: K, value: CreateProjectInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const requiredMissing =
    !input.epromiseId.trim() ||
    !input.epromiseName.trim() ||
    !input.commonName.trim() ||
    !input.projectClass.trim() ||
    !input.projectType.trim() ||
    !input.category.trim() ||
    !input.location.trim() ||
    !input.country.trim() ||
    !input.consultant.trim() ||
    !input.client.trim() ||
    !input.publicDescription.trim() ||
    !input.durationMonths ||
    !input.peakWorkforce ||
    !input.builtAreaSqm ||
    !input.valueAmount ||
    !input.floors;

  async function submit() {
    setCreating(true);
    setError(null);
    try {
      const created = await projectsAdminApi.createProject({ ...input, slug: input.slug || null });
      onCreated(created.id);
    } catch (err) {
      setError(err instanceof ProjectsApiError ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <Button variant="text" onClick={onCancel}>
          ← Back to queue
        </Button>
        <Heading level="h4" as="h1">
          New Project
        </Heading>
      </div>

      {error && <p className="text-body text-error">{error}</p>}

      <EditorSection title="Identity" first>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Epromise ID" required value={input.epromiseId} onChange={(e) => set('epromiseId', e.target.value)} />
          <TextField label="Epromise Name" required value={input.epromiseName} onChange={(e) => set('epromiseName', e.target.value)} />
        </div>
        <TextField label="Common Name" required value={input.commonName} onChange={(e) => set('commonName', e.target.value)} />
        <TextField label="Slug" helperText="URL-safe, e.g. vela-by-omniyat. Required before publishing." value={input.slug ?? ''} onChange={(e) => set('slug', e.target.value)} />
      </EditorSection>

      <EditorSection title="Classification">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Project Class" required value={input.projectClass} onChange={(e) => set('projectClass', e.target.value)} />
          <TextField label="Project Type" required value={input.projectType} onChange={(e) => set('projectType', e.target.value)} />
          <TextField label="Category" required value={input.category} onChange={(e) => set('category', e.target.value)} helperText="Lowercase, hyphenated (e.g. residential)" />
          <TextField label="Location" required value={input.location} onChange={(e) => set('location', e.target.value)} />
          <TextField label="Country" required value={input.country} onChange={(e) => set('country', e.target.value)} />
        </div>
      </EditorSection>

      <EditorSection title="Parties">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Consultant" required value={input.consultant} onChange={(e) => set('consultant', e.target.value)} />
          <TextField label="Client" required value={input.client} onChange={(e) => set('client', e.target.value)} />
        </div>
      </EditorSection>

      <EditorSection title="Completion">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField type="text" label="Completion Date" placeholder="YYYY-MM-DD" value={input.completionDate ?? ''} onChange={(e) => set('completionDate', e.target.value)} />
          <div>
            <label htmlFor="create-completion-status" className="mb-1.5 block text-small font-semibold text-ink">
              Completion Status<span className="ml-0.5 text-brand-600">*</span>
            </label>
            <select
              id="create-completion-status"
              value={input.completionStatus}
              onChange={(e) => set('completionStatus', e.target.value as ProjectCompletionStatus)}
              className="w-full rounded-sm border border-gray-300 bg-warmwhite px-3.5 py-2 text-body"
            >
              {COMPLETION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {completionStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </EditorSection>

      <EditorSection title="Descriptions">
        <Textarea label="Public Description" required rows={3} value={input.publicDescription} onChange={(e) => set('publicDescription', e.target.value)} />
        <Textarea label="Private Description" helperText="Internal only — never shown publicly." rows={3} value={input.privateDescription ?? ''} onChange={(e) => set('privateDescription', e.target.value)} />
      </EditorSection>

      <EditorSection title="Project Facts">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField type="text" inputMode="numeric" label="Duration (months)" required value={String(input.durationMonths || '')} onChange={(e) => set('durationMonths', Number(e.target.value) || 0)} />
          <TextField type="text" inputMode="numeric" label="Peak Workforce" required value={String(input.peakWorkforce || '')} onChange={(e) => set('peakWorkforce', Number(e.target.value) || 0)} />
          <TextField type="text" inputMode="decimal" label="Built Area (m²)" required value={String(input.builtAreaSqm || '')} onChange={(e) => set('builtAreaSqm', Number(e.target.value) || 0)} />
          <TextField type="text" inputMode="decimal" label="Value Amount" required value={String(input.valueAmount || '')} onChange={(e) => set('valueAmount', Number(e.target.value) || 0)} />
          <TextField label="Value Currency" value={input.valueCurrency ?? 'AED'} onChange={(e) => set('valueCurrency', e.target.value.toUpperCase())} maxLength={3} />
          <TextField type="text" inputMode="numeric" label="Floors" required value={String(input.floors || '')} onChange={(e) => set('floors', Number(e.target.value) || 0)} />
        </div>
      </EditorSection>

      <EditorSection title="Presentation">
        <Checkbox label="Featured" checked={Boolean(input.featured)} onChange={(e) => set('featured', e.target.checked)} />
      </EditorSection>

      <div className="flex justify-end border-t border-gray-200 pt-4">
        <Button onClick={submit} loading={creating} disabled={requiredMissing}>
          Create Project
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor — existing project
// ---------------------------------------------------------------------------
function ProjectEditor({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const [project, setProject] = useState<AdminProject | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    projectsAdminApi
      .getProject(projectId)
      .then(setProject)
      .catch((err) => setLoadError((err as Error).message));
  }, [projectId]);

  useEffect(load, [load]);

  async function save(update: Partial<CreateProjectInput & { status: ProjectStatus }>) {
    setSaveState('saving');
    setSaveError(null);
    try {
      const updated = await projectsAdminApi.updateProject(projectId, update);
      setProject(updated);
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof ProjectsApiError ? err.message : 'Save failed');
    }
  }

  async function handlePublishToggle() {
    if (!project) return;
    setActionError(null);
    try {
      const updated = await projectsAdminApi.updateProject(projectId, { status: project.status === 'published' ? 'draft' : 'published' });
      setProject(updated);
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleUploadImage() {
    if (!imageFile || !project) return;
    setUploading(true);
    setActionError(null);
    try {
      const position = project.images.length;
      const presign = await projectsAdminApi.presignImageUpload(projectId, { contentType: imageFile.type, position });
      await uploadFileToS3(presign.uploadUrl, imageFile);
      const images = await projectsAdminApi.finalizeImageUpload(projectId, { s3Key: presign.s3Key, position });
      setProject((current) => (current ? { ...current, images } : current));
      setImageFile(null);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  if (loadError) return <p className="text-body text-error">{loadError}</p>;
  if (!project) return <p className="text-body text-gray-500">Loading…</p>;

  const canPublish = Boolean(project.slug);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <Button variant="text" onClick={onBack}>
          ← Back to queue
        </Button>
        <div className="flex items-center gap-2">
          <span className={cn('rounded px-2 py-1 text-caption', statusBadgeClassName(project.status))}>{project.status === 'published' ? 'Published' : 'Draft'}</span>
          {saveState === 'saving' && <span className="text-caption text-gray-500">Saving…</span>}
          {saveState === 'saved' && <span className="text-caption text-success">Saved</span>}
        </div>
      </div>

      {actionError && <p className="text-body text-error">{actionError}</p>}
      {saveError && <p className="text-body text-error">{saveError}</p>}

      <EditorSection title="Identity" first>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Epromise ID" defaultValue={project.epromiseId} onBlur={(e) => e.target.value !== project.epromiseId && save({ epromiseId: e.target.value })} />
          <TextField label="Epromise Name" defaultValue={project.epromiseName} onBlur={(e) => e.target.value !== project.epromiseName && save({ epromiseName: e.target.value })} />
        </div>
        <TextField label="Common Name" defaultValue={project.commonName} onBlur={(e) => e.target.value !== project.commonName && save({ commonName: e.target.value })} />
        <TextField
          label="Slug"
          helperText="Required before publishing."
          defaultValue={project.slug ?? ''}
          onBlur={(e) => e.target.value !== (project.slug ?? '') && save({ slug: e.target.value || null })}
        />
      </EditorSection>

      <EditorSection title="Classification">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Project Class" defaultValue={project.projectClass} onBlur={(e) => e.target.value !== project.projectClass && save({ projectClass: e.target.value })} />
          <TextField label="Project Type" defaultValue={project.projectType} onBlur={(e) => e.target.value !== project.projectType && save({ projectType: e.target.value })} />
          <TextField label="Category" defaultValue={project.category} onBlur={(e) => e.target.value !== project.category && save({ category: e.target.value })} />
          <TextField label="Location" defaultValue={project.location} onBlur={(e) => e.target.value !== project.location && save({ location: e.target.value })} />
          <TextField label="Country" defaultValue={project.country} onBlur={(e) => e.target.value !== project.country && save({ country: e.target.value })} />
        </div>
      </EditorSection>

      <EditorSection title="Parties">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Consultant" defaultValue={project.consultant} onBlur={(e) => e.target.value !== project.consultant && save({ consultant: e.target.value })} />
          <TextField label="Client" defaultValue={project.client} onBlur={(e) => e.target.value !== project.client && save({ client: e.target.value })} />
        </div>
      </EditorSection>

      <EditorSection title="Completion">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            type="text"
            label="Completion Date"
            placeholder="YYYY-MM-DD"
            defaultValue={project.completionDate ?? ''}
            onBlur={(e) => e.target.value !== (project.completionDate ?? '') && save({ completionDate: e.target.value || null })}
          />
          <div>
            <label htmlFor="edit-completion-status" className="mb-1.5 block text-small font-semibold text-ink">
              Completion Status
            </label>
            <select
              id="edit-completion-status"
              defaultValue={project.completionStatus}
              onChange={(e) => save({ completionStatus: e.target.value as ProjectCompletionStatus })}
              className="w-full rounded-sm border border-gray-300 bg-warmwhite px-3.5 py-2 text-body"
            >
              {COMPLETION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {completionStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </EditorSection>

      <EditorSection title="Descriptions">
        <Textarea label="Public Description" rows={3} defaultValue={project.publicDescription} onBlur={(e) => e.target.value !== project.publicDescription && save({ publicDescription: e.target.value })} />
        <Textarea
          label="Private Description"
          helperText="Internal only — never shown publicly."
          rows={3}
          defaultValue={project.privateDescription ?? ''}
          onBlur={(e) => e.target.value !== (project.privateDescription ?? '') && save({ privateDescription: e.target.value || null })}
        />
      </EditorSection>

      <EditorSection title="Project Facts">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField type="text" inputMode="numeric" label="Duration (months)" defaultValue={String(project.durationMonths)} onBlur={(e) => Number(e.target.value) !== project.durationMonths && save({ durationMonths: Number(e.target.value) })} />
          <TextField type="text" inputMode="numeric" label="Peak Workforce" defaultValue={String(project.peakWorkforce)} onBlur={(e) => Number(e.target.value) !== project.peakWorkforce && save({ peakWorkforce: Number(e.target.value) })} />
          <TextField type="text" inputMode="decimal" label="Built Area (m²)" defaultValue={String(project.builtAreaSqm)} onBlur={(e) => Number(e.target.value) !== project.builtAreaSqm && save({ builtAreaSqm: Number(e.target.value) })} />
          <TextField type="text" inputMode="decimal" label="Value Amount" defaultValue={String(project.valueAmount)} onBlur={(e) => Number(e.target.value) !== project.valueAmount && save({ valueAmount: Number(e.target.value) })} />
          <TextField label="Value Currency" defaultValue={project.valueCurrency} maxLength={3} onBlur={(e) => e.target.value.toUpperCase() !== project.valueCurrency && save({ valueCurrency: e.target.value.toUpperCase() })} />
          <TextField type="text" inputMode="numeric" label="Floors" defaultValue={String(project.floors)} onBlur={(e) => Number(e.target.value) !== project.floors && save({ floors: Number(e.target.value) })} />
        </div>
      </EditorSection>

      <EditorSection title="Presentation">
        <Checkbox label="Featured" checked={project.featured} onChange={(e) => save({ featured: e.target.checked })} />
      </EditorSection>

      <EditorSection title="Key Metrics">
        <ProjectMetricsManager projectId={projectId} metrics={project.metrics} onMetricsChanged={(metrics) => setProject({ ...project, metrics })} />
      </EditorSection>

      <EditorSection
        title="Images"
        action={
          <Text variant="caption" className="text-gray-500">
            {project.images.length === 0 ? 'No images uploaded yet.' : `${project.images.length} image${project.images.length === 1 ? '' : 's'} uploaded`}
          </Text>
        }
      >
        <ProjectImageManager projectId={projectId} images={project.images} onImagesChanged={(images) => setProject({ ...project, images })} />
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choose image file"
            className="text-caption text-gray-600 file:mr-3 file:rounded-sm file:border file:border-gray-300 file:bg-warmwhite file:px-3 file:py-1.5 file:text-caption file:font-semibold file:text-ink hover:file:border-ink"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="outline" size="sm" onClick={handleUploadImage} disabled={!imageFile} loading={uploading}>
            Upload image
          </Button>
        </div>
      </EditorSection>

      <EditorSection title="Publishing">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="small" className="text-gray-500">
            Preview this project before publishing.
          </Text>
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            Preview Project
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4">
          {!canPublish && (
            <Text variant="small" className="mr-auto text-gray-500">
              Set a slug before publishing.
            </Text>
          )}
          {project.status === 'published' ? (
            <Button variant="outline" className="border-error text-error hover:bg-error hover:text-warmwhite" onClick={handlePublishToggle}>
              Unpublish
            </Button>
          ) : (
            <Button onClick={handlePublishToggle} disabled={!canPublish}>
              Publish
            </Button>
          )}
        </div>
      </EditorSection>

      {previewOpen && <ProjectPreview projectId={projectId} project={project} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level page
// ---------------------------------------------------------------------------
type View = { name: 'list' } | { name: 'create' } | { name: 'edit'; id: string };

export default function ProjectsAdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => isLoggedInLocally());
  const [view, setView] = useState<View>({ name: 'list' });

  async function handleLogout() {
    await logout();
    setLoggedIn(false);
  }

  return (
    <>
      <SEO title="Projects Admin" description="Internal Projects data-entry tool. Not a public page." path="/dev/projects-admin" noIndex />
      <Container width="standard">
        <div className="py-8">
          {!loggedIn ? (
            <LoginGate onLoggedIn={() => setLoggedIn(true)} />
          ) : (
            <>
              <div className="mb-4 flex justify-end">
                <Button variant="text" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
              {view.name === 'list' && (
                <ProjectDashboard onSelect={(id) => setView({ name: 'edit', id })} onCreate={() => setView({ name: 'create' })} />
              )}
              {view.name === 'create' && (
                <CreateProjectForm onCreated={(id) => setView({ name: 'edit', id })} onCancel={() => setView({ name: 'list' })} />
              )}
              {view.name === 'edit' && <ProjectEditor projectId={view.id} onBack={() => setView({ name: 'list' })} />}
            </>
          )}
        </div>
      </Container>
    </>
  );
}
