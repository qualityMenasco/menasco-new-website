import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../../components/ui/Button';
import { ArticleDetailView } from '../../components/news/ArticleDetailView';
import { ArticleDetailView as MobileArticleDetailView } from '../../mobile/components/ArticleDetailView';
import { cn } from '../../lib/utils';
import { newsroomAdminApi } from './newsroomAdminApi';
import { buildPreviewArticle, getMissingPublishRequirements } from './articlePreviewAdapter';
import type { ArticleDetail } from './types';

export interface ArticlePreviewProps {
  articleId: string;
  article: ArticleDetail;
  onClose: () => void;
}

type PreviewMode = 'desktop' | 'mobile';

/**
 * Full-screen "Preview Article" overlay. Renders the CURRENT in-memory
 * admin editor state (see articlePreviewAdapter.ts) through the exact same
 * ArticleDetailView components the real public article page uses, so this
 * can never visually drift from what actually ships. Read-only: the only
 * network calls it makes are short-lived presigned GET requests for image
 * preview URLs (the same admin-only endpoint ImageManager's own per-image
 * "Preview" button already uses) — nothing is published, scheduled, or
 * written to RDS/S3, and closing it never touches the editor's state.
 */
export function ArticlePreview({ articleId, article, onClose }: ArticlePreviewProps) {
  const [mode, setMode] = useState<PreviewMode>('desktop');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingImages(true);
    Promise.allSettled(article.images.map((image) => newsroomAdminApi.getImagePreviewUrl(articleId, image.id).then((res) => [image.id, res.url] as const))).then(
      (results) => {
        if (cancelled) return;
        const urls: Record<string, string> = {};
        for (const result of results) {
          if (result.status === 'fulfilled') urls[result.value[0]] = result.value[1];
        }
        setImageUrls(urls);
        setLoadingImages(false);
      },
    );
    return () => {
      cancelled = true;
    };
    // Re-resolves whenever the preview is reopened or the article's own image set changes,
    // so a newly uploaded/reordered image is reflected without a stale URL cache.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, article.images]);

  function handleBackClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onClose();
  }

  const previewArticle = buildPreviewArticle(article, imageUrls);
  const missingRequirements = getMissingPublishRequirements(article);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/50" role="dialog" aria-modal="true" aria-label="Article preview">
      <div className="flex min-h-0 flex-1 flex-col bg-warmwhite">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 bg-ink px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-sm bg-brand-600 px-2 py-0.5 text-caption font-bold uppercase tracking-widest text-warmwhite">Preview</span>
            <span className="text-small font-semibold text-warmwhite">Preview Article</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-md border border-white/20">
              <button
                type="button"
                onClick={() => setMode('desktop')}
                aria-pressed={mode === 'desktop'}
                className={cn(
                  'px-3 py-1.5 text-small font-semibold transition-colors duration-fast',
                  mode === 'desktop' ? 'bg-warmwhite text-ink' : 'text-warmwhite/80 hover:bg-white/10',
                )}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setMode('mobile')}
                aria-pressed={mode === 'mobile'}
                className={cn(
                  'px-3 py-1.5 text-small font-semibold transition-colors duration-fast',
                  mode === 'mobile' ? 'bg-warmwhite text-ink' : 'text-warmwhite/80 hover:bg-white/10',
                )}
              >
                Mobile
              </button>
            </div>
            <IconButton icon={X} label="Close preview" theme="dark" onClick={onClose} />
          </div>
        </header>

        {missingRequirements.length > 0 && (
          <p className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-caption text-amber-800">
            Previewing draft. Some publishing requirements are incomplete: missing {missingRequirements.join(', ')}.
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
          {loadingImages ? (
            <p className="p-10 text-center text-body text-gray-500">Loading preview…</p>
          ) : mode === 'desktop' ? (
            <ArticleDetailView article={previewArticle} locale="en" onBackClick={handleBackClick} />
          ) : (
            <div className="mx-auto max-w-[390px] border-x border-gray-300">
              <MobileArticleDetailView article={previewArticle} locale="en" onBackClick={handleBackClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
