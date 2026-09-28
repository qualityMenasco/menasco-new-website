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
  images: [{ id: 'img-1', position: 0, altText: 'Hero image', caption: null, role: null, url: '/api/newsroom/public/images/img-1' }],
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
 * placement + min-width reset classes) that implements both required fixes,
 * so a future change that silently drops `min-w-0` or the row placement
 * would fail a test instead of only being visible in a screenshot.
 */
describe('ArticleDetailView — desktop two-column grid', () => {
  it('gives every left-column text element min-w-0 so long content wraps within its own column instead of overflowing into the image column', () => {
    renderArticle();
    expect(getTitle().className).toMatch(/\bmin-w-0\b/);

    const subtitle = screen.getByText(baseArticle.subtitle as string);
    expect(subtitle.className).toMatch(/\bmin-w-0\b/);
  });

  it("places the image at the title's grid row so its top edge aligns with the title's first line, not the back link or the published date", () => {
    renderArticle();
    const heading = getTitle();
    const galleryContainer = screen.getByAltText('Hero image').closest('.group') as HTMLElement;

    expect(heading.className).toMatch(/lg:row-start-2\b/);
    expect(galleryContainer.className).toMatch(/lg:row-start-2\b/);

    // Neither the back link nor the published-date row shares the title's row —
    // confirms the image is anchored to the title specifically, not the header as a whole.
    const backLink = screen.getByRole('link', { name: /backToNewsroom/i });
    const metaRow = screen.getByText(/publishedOn/).closest('div') as HTMLElement;
    expect(backLink.closest('div')?.className).not.toMatch(/lg:row-start-2\b/);
    expect(metaRow.className).not.toMatch(/lg:row-start-2\b/);
  });

  it('spans the image down through the subtitle row so it sits beside both, and keeps it in the right-hand column', () => {
    renderArticle();
    const galleryContainer = screen.getByAltText('Hero image').closest('.group') as HTMLElement;
    expect(galleryContainer.className).toMatch(/lg:col-start-2\b/);
    expect(galleryContainer.className).toMatch(/lg:row-span-2\b/);
  });

  it('keeps Related Topics in the same right-hand column as the image, positioned below it', () => {
    renderArticle();
    const heading = getTitle();
    const topics = screen.getByRole('navigation', { name: /relatedTopics/i }).closest('aside') as HTMLElement;

    expect(topics.className).toMatch(/lg:col-start-2\b/);
    // Same column-2 as the image, and never the title's row (row-start-2) — i.e. genuinely
    // below the image, not beside the header.
    expect(heading.className).toMatch(/lg:col-start-1\b/);
    expect(topics.className).not.toMatch(/lg:row-start-2\b/);
  });

  it('renders the title before the image in DOM order, so mobile (no lg: grid placement applies) stacks text above the image exactly as before', () => {
    renderArticle();
    const heading = getTitle();
    const galleryContainer = screen.getByAltText('Hero image').closest('.group') as HTMLElement;
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
