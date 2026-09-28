import { useState } from 'react';
import { ArrowDown, ArrowUp, ExternalLink } from 'lucide-react';
import { TextField } from '../../components/forms/TextField';
import { Button, IconButton } from '../../components/ui/Button';
import { newsroomAdminApi } from './newsroomAdminApi';
import type { ArticleImage } from './types';

export interface ImageManagerProps {
  articleId: string;
  images: ArticleImage[];
  onImagesChanged: (images: ArticleImage[]) => void;
}

/** Position is the canonical ordering field (per Phase 1's `(article_id, position)` unique index) — reordering here always goes through `reorderArticleImages`, never a direct per-row position edit, so it can never collide with that constraint. */
export function ImageManager({ articleId, images, onImagesChanged }: ImageManagerProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  async function reorder(fromIndex: number, direction: -1 | 1) {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= images.length) return;
    const reordered = [...images];
    [reordered[fromIndex], reordered[toIndex]] = [reordered[toIndex], reordered[fromIndex]];
    setError(null);
    try {
      await newsroomAdminApi.reorderImages(articleId, reordered.map((img) => img.id));
      onImagesChanged(reordered.map((img, i) => ({ ...img, position: i })));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function saveMeta(imageId: string, update: { altText?: string; caption?: string }) {
    setBusyId(imageId);
    setError(null);
    try {
      await newsroomAdminApi.updateImageMeta(articleId, imageId, update);
      onImagesChanged(images.map((img) => (img.id === imageId ? { ...img, ...('altText' in update ? { altText: update.altText ?? null } : {}), ...('caption' in update ? { caption: update.caption ?? null } : {}) } : img)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function loadPreview(imageId: string) {
    try {
      const { url } = await newsroomAdminApi.getImagePreviewUrl(articleId, imageId);
      setPreviewUrls((prev) => ({ ...prev, [imageId]: url }));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  // Empty state is communicated by the count label in NewsroomAdminPage's section header instead of here, to avoid two redundant "no images" messages stacked on top of each other.
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-body text-error">{error}</p>}
      {images.map((image, i) => (
        <div key={image.id} className="flex gap-3 rounded-sm border border-gray-200 bg-warmwhite p-2.5">
          <div className="flex w-20 shrink-0 flex-col items-center gap-1.5">
            {previewUrls[image.id] ? (
              <img src={previewUrls[image.id]} alt={image.altText ?? ''} className="h-16 w-20 rounded-sm object-cover" />
            ) : (
              <Button variant="outline" size="sm" onClick={() => loadPreview(image.id)}>
                Preview
              </Button>
            )}
            <span className="text-caption font-semibold text-gray-500">Image {i + 1}</span>
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
            <p className="truncate text-caption text-gray-400">{image.s3Key}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <IconButton icon={ArrowUp} label="Move up" size="sm" onClick={() => reorder(i, -1)} disabled={i === 0} />
            <IconButton icon={ArrowDown} label="Move down" size="sm" onClick={() => reorder(i, 1)} disabled={i === images.length - 1} />
            {previewUrls[image.id] && (
              <IconButton icon={ExternalLink} label="Open full image" size="sm" onClick={() => window.open(previewUrls[image.id], '_blank', 'noopener')} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
