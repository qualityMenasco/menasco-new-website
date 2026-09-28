import { useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink, Star, Trash2 } from 'lucide-react';
import { TextField } from '../../components/forms/TextField';
import { Button, IconButton } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { projectsAdminApi } from './projectsAdminApi';
import type { ProjectImage } from './types';

export interface ProjectImageManagerProps {
  projectId: string;
  images: ProjectImage[];
  onImagesChanged: (images: ProjectImage[]) => void;
}

/**
 * Mirrors src/internal/newsroom/ImageManager.tsx's structure (reorder,
 * per-image preview, alt text/caption) with two Projects-specific
 * additions: a "Set primary" action (delegates to the backend's
 * transactional invariant — never guesses/duplicates that logic here) and
 * per-image delete with confirmation. Deliberately never renders
 * `image.s3Key` anywhere — the raw S3 key stays out of this UI even though
 * the admin API response includes it, per the Phase 4 spec's explicit
 * "never expose raw S3 keys in the UI" instruction (stricter than
 * Newsroom's own ImageManager, which does show it — a deliberate,
 * Projects-specific choice, not an oversight).
 */
export function ProjectImageManager({ projectId, images, onImagesChanged }: ProjectImageManagerProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  async function reorder(fromIndex: number, direction: -1 | 1) {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= images.length) return;
    const reordered = [...images];
    [reordered[fromIndex], reordered[toIndex]] = [reordered[toIndex], reordered[fromIndex]];
    setError(null);
    try {
      const updated = await projectsAdminApi.reorderImages(projectId, reordered.map((img) => img.id));
      onImagesChanged(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveMeta(imageId: string, update: { altText?: string | null; caption?: string | null }) {
    setBusyId(imageId);
    setError(null);
    try {
      await projectsAdminApi.updateImageMeta(projectId, imageId, update);
      onImagesChanged(
        images.map((img) =>
          img.id === imageId
            ? { ...img, ...('altText' in update ? { altText: update.altText ?? null } : {}), ...('caption' in update ? { caption: update.caption ?? null } : {}) }
            : img,
        ),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function loadPreview(imageId: string) {
    try {
      const { url } = await projectsAdminApi.getImagePreviewUrl(projectId, imageId);
      setPreviewUrls((prev) => ({ ...prev, [imageId]: url }));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function setPrimary(imageId: string) {
    setBusyId(imageId);
    setError(null);
    try {
      await projectsAdminApi.setPrimaryImage(projectId, imageId);
      onImagesChanged(images.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const deletingId = pendingDeleteId;
    setBusyId(deletingId);
    setError(null);
    try {
      await projectsAdminApi.deleteImage(projectId, deletingId);
      // The backend deterministically promotes the lowest-position remaining
      // image to primary when the deleted image was primary — mirror that
      // client-side rather than re-fetching, so the UI reflects it instantly.
      const wasPrimary = images.find((img) => img.id === deletingId)?.isPrimary ?? false;
      const remaining = images.filter((img) => img.id !== deletingId).sort((a, b) => a.position - b.position);
      const next = wasPrimary && remaining.length > 0 ? remaining.map((img, i) => ({ ...img, isPrimary: i === 0 })) : remaining;
      onImagesChanged(next);
      setPendingDeleteId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      {error && <p className="text-body text-error">{error}</p>}
      {images.map((image, i) => (
        <div key={image.id} className={cn('flex gap-3 rounded-sm border p-2.5', image.isPrimary ? 'border-brand-400 bg-brand-50/40' : 'border-gray-200 bg-warmwhite')}>
          <div className="flex w-20 shrink-0 flex-col items-center gap-1.5">
            {previewUrls[image.id] ? (
              <img src={previewUrls[image.id]} alt={image.altText ?? ''} className="h-16 w-20 rounded-sm object-cover" />
            ) : (
              <Button variant="outline" size="sm" onClick={() => loadPreview(image.id)}>
                Preview
              </Button>
            )}
            <span className="text-caption font-semibold text-gray-500">Image {i + 1}</span>
            {image.isPrimary && (
              <span className="flex items-center gap-1 text-caption font-semibold text-brand-600">
                <Star size={11} aria-hidden="true" fill="currentColor" /> Primary
              </span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <TextField
              label="Alt text"
              defaultValue={image.altText ?? ''}
              onBlur={(e) => e.target.value !== (image.altText ?? '') && saveMeta(image.id, { altText: e.target.value })}
              disabled={busyId === image.id}
            />
            <TextField
              label="Caption"
              defaultValue={image.caption ?? ''}
              onBlur={(e) => e.target.value !== (image.caption ?? '') && saveMeta(image.id, { caption: e.target.value })}
              disabled={busyId === image.id}
            />
            {!image.isPrimary && (
              <Button variant="text" size="sm" onClick={() => setPrimary(image.id)} disabled={busyId === image.id}>
                Set as primary
              </Button>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <IconButton icon={ArrowUp} label="Move up" size="sm" onClick={() => reorder(i, -1)} disabled={i === 0} />
            <IconButton icon={ArrowDown} label="Move down" size="sm" onClick={() => reorder(i, 1)} disabled={i === images.length - 1} />
            {previewUrls[image.id] && (
              <IconButton icon={ExternalLink} label="Open full image" size="sm" onClick={() => window.open(previewUrls[image.id], '_blank', 'noopener')} />
            )}
            <IconButton icon={Trash2} label={`Delete image ${i + 1}`} size="sm" onClick={() => setPendingDeleteId(image.id)} className="text-error hover:bg-error/10" />
          </div>
        </div>
      ))}

      {pendingDeleteId && (
        <div role="dialog" aria-modal="true" aria-label="Delete image?" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="w-full max-w-sm rounded-md bg-warmwhite p-5 shadow-lg">
            <p className="text-body font-semibold text-ink">Delete this image?</p>
            <p className="mt-1 text-small text-gray-600">This permanently removes the image and its stored file. This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPendingDeleteId(null)} disabled={busyId === pendingDeleteId}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmDelete}
                loading={busyId === pendingDeleteId}
                className="bg-error hover:bg-error/90"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
