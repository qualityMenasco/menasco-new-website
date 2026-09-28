import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../../components/ui/Button';
import { Container } from '../../components/layout/Container';
import { Eyebrow, Heading, Text } from '../../components/typography/Typography';
import { projectsAdminApi } from './projectsAdminApi';
import { toPreviewProject } from './publicProjectPreview';
import type { AdminProject } from './types';

export interface ProjectPreviewProps {
  projectId: string;
  project: AdminProject;
  onClose: () => void;
}

/**
 * Full-screen "Preview Project" overlay — mirrors
 * src/internal/newsroom/ArticlePreview.tsx's shell (header badge, close
 * button, read-only) but renders a dedicated, self-contained layout rather
 * than the OLD public Projects page components (ProjectDetailPage/
 * ProjectCard), which are a completely different, unrelated static data
 * model (src/data/projects.ts) — reusing them here would either silently
 * fail to fit the new backend's fields or require reshaping this preview
 * into that old shape, exactly the "redesign/replace public Projects
 * pages" this phase was told not to do.
 *
 * Renders the CURRENT in-memory admin editor state (via toPreviewProject's
 * strict allowlist mapper — see publicProjectPreview.ts) so this can never
 * accidentally show a private field, and reflects unsaved edits without
 * ever publishing or writing anything.
 */
export function ProjectPreview({ projectId, project, onClose }: ProjectPreviewProps) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingImages(true);
    Promise.allSettled(project.images.map((image) => projectsAdminApi.getImagePreviewUrl(projectId, image.id).then((res) => [image.id, res.url] as const))).then((results) => {
      if (cancelled) return;
      const urls: Record<string, string> = {};
      for (const result of results) {
        if (result.status === 'fulfilled') urls[result.value[0]] = result.value[1];
      }
      setImageUrls(urls);
      setLoadingImages(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, project.images]);

  const preview = toPreviewProject(project, imageUrls);
  const primaryImage = preview.images.find((img) => img.isPrimary) ?? preview.images[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/50" role="dialog" aria-modal="true" aria-label="Project preview">
      <div className="flex min-h-0 flex-1 flex-col bg-warmwhite">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700 bg-ink px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-sm bg-brand-600 px-2 py-0.5 text-caption font-bold uppercase tracking-widest text-warmwhite">Preview</span>
            <span className="text-small font-semibold text-warmwhite">Preview Project</span>
          </div>
          <IconButton icon={X} label="Close preview" theme="dark" onClick={onClose} />
        </header>

        {!preview.slug && (
          <p className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-caption text-amber-800">
            Previewing draft. This project has no slug set yet, so it can't actually be published until one is added.
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
          {loadingImages ? (
            <p className="p-10 text-center text-body text-gray-500">Loading preview…</p>
          ) : (
            <div className="bg-warmwhite py-10">
              <Container width="standard">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-12">
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Eyebrow>{preview.category}</Eyebrow>
                      <Text variant="small" muted>
                        {preview.location}, {preview.country}
                      </Text>
                    </div>
                    <Heading level="h1" as="h2" className="min-w-0">
                      {preview.commonName}
                    </Heading>
                    <Text variant="body-lg" muted className="min-w-0 max-w-2xl">
                      {preview.publicDescription}
                    </Text>
                  </div>

                  {primaryImage?.url && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-100">
                      <img src={primaryImage.url} alt={primaryImage.altText ?? ''} className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                {preview.metrics.length > 0 && (
                  <div className="mt-10 grid grid-cols-2 gap-6 border-t border-gray-200 pt-6 sm:grid-cols-3">
                    {preview.metrics.map((m) => (
                      <div key={m.metricName + m.displayOrder}>
                        <Text variant="small" muted>
                          {m.metricName}
                        </Text>
                        <Text variant="body-lg" className="font-semibold text-ink">
                          {m.metricValue}
                          {m.metricUnit ? ` ${m.metricUnit}` : ''}
                        </Text>
                      </div>
                    ))}
                  </div>
                )}

                {preview.images.length > 1 && (
                  <div className="mt-10 grid grid-cols-2 gap-3 border-t border-gray-200 pt-6 sm:grid-cols-4">
                    {preview.images
                      .filter((img) => img.url && img.imageId !== primaryImage?.imageId)
                      .map((img) => (
                        <div key={img.imageId} className="aspect-square overflow-hidden rounded-sm bg-gray-100">
                          <img src={img.url} alt={img.altText ?? ''} className="h-full w-full object-cover" />
                        </div>
                      ))}
                  </div>
                )}
              </Container>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
