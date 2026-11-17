import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArticleDetailView } from './ArticleDetailView';
import type { ArticleDetailViewArticle } from './ArticleDetailView';

// ArticleDetailView calls useTranslation directly (no test-only indirection) — mocked to a
// simple passthrough (key, or defaultValue when given one) so these tests assert on structure
// rather than depending on real locale JSON copy, matching NewsroomAdminPage.test.tsx's pattern.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string; date?: string }) => options?.defaultValue ?? key }),
}));

const baseArticle: ArticleDetailViewArticle = {
  title: 'A Real Article Title',
  subtitle: 'A real subtitle',
  category: 'company-news',
  publishedAt: '2026-01-01T00:00:00.000Z',
  tags: [{ name: 'MEP', slug: 'mep' }],
  images: [{ id: 'img-1', position: 0, mediaType: 'image', altText: 'Hero image', caption: null, role: null, url: '/api/newsroom/public/images/img-1' }],
  structuredContent: {
    version: 1,
    sections: [{ blocks: [{ type: 'paragraph', text: 'Body paragraph.' }] }],
  },
};

function renderArticle(article: ArticleDetailViewArticle = baseArticle) {
  return render(
    <MemoryRouter>
      <ArticleDetailView article={article} locale="en" />
    </MemoryRouter>,
  );
}

// The title renders as a real <h2> (level="h1" only controls its styling, `as="h2"` its actual
// tag — this page already has its own h1 elsewhere), so queries target level 2.
function getTitle() {
  return screen.getByRole('heading', { level: 2, name: baseArticle.title });
}

/**
 * jsdom doesn't compute real CSS layout, so these tests can't measure actual
 * pixel positions — instead they pin the structural contract (grid
 * placement, sticky classes, and which column Related Topics ends up in)
 * that "sticky side media" actually depends on, so a future change that
 * silently drops `lg:sticky` or moves Related Topics back into the media
 * column would fail a test instead of only being visible in a screenshot.
 */
describe('ArticleDetailView — sticky side media', () => {
  it('gives the text column wrapper min-w-0 so long content wraps within its own column instead of overflowing into the media column', () => {
    renderArticle();
    const heading = getTitle();
    const textColumn = heading.closest('.lg\\:col-start-1') as HTMLElement;
    expect(textColumn).toBeTruthy();
    expect(textColumn.className).toMatch(/\bmin-w-0\b/);
  });

  it('makes the gallery sticky, pinned near the top of the viewport, in its own right-hand column', () => {
    renderArticle();
    const galleryContainer = screen.getByAltText('Hero image').closest('.group') as HTMLElement;
    expect(galleryContainer.className).toMatch(/lg:col-start-2\b/);
    expect(galleryContainer.className).toMatch(/lg:sticky\b/);
    expect(galleryContainer.className).toMatch(/lg:top-28\b/);
    expect(galleryContainer.className).toMatch(/lg:self-start\b/);
  });

  it("keeps Related Topics in the TEXT column (not the sticky media column) — splitting it into the media column would break the gallery's full-height sticky range", () => {
    renderArticle();
    const topics = screen.getByRole('navigation', { name: /relatedTopics/i }).closest('aside') as HTMLElement;
    const textColumn = topics.closest('.lg\\:col-start-1') as HTMLElement;
    expect(textColumn).toBeTruthy();

    const galleryContainer = screen.getByAltText('Hero image').closest('.group') as HTMLElement;
    expect(galleryContainer.className).not.toBe(textColumn.className);
    expect(topics.closest('.lg\\:col-start-2')).toBeNull();
  });

  it('renders Related Topics after the article body in the text column', () => {
    renderArticle();
    const body = screen.getByText('Body paragraph.');
    const topics = screen.getByRole('navigation', { name: /relatedTopics/i }).closest('aside') as HTMLElement;
    // eslint-disable-next-line no-bitwise
    expect(body.compareDocumentPosition(topics) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('visually leads with the gallery when stacked (order-first), but keeps it after the text column in real DOM/source order', () => {
    renderArticle();
    const heading = getTitle();
    const galleryContainer = screen.getByAltText('Hero image').closest('.group') as HTMLElement;

    expect(galleryContainer.className).toMatch(/\border-first\b/);
    expect(galleryContainer.className).toMatch(/lg:order-none\b/);
    // eslint-disable-next-line no-bitwise
    expect(heading.compareDocumentPosition(galleryContainer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('still renders without an image (no gallery in the grid) and without a subtitle', () => {
    const article: ArticleDetailViewArticle = { ...baseArticle, subtitle: null, images: [] };
    renderArticle(article);
    expect(getTitle()).toBeInTheDocument();
    expect(screen.queryByText(baseArticle.subtitle as string)).not.toBeInTheDocument();
  });
});
