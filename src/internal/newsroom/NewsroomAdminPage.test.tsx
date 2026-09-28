import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NewsroomAdminPage from './NewsroomAdminPage';
import { newsroomAdminApi, isLoggedInLocally, uploadFileToS3 } from './newsroomAdminApi';
import { formatUaeDisplay } from './uaeTime';
import type { ArticleDetail, ArticleSummary } from './types';

// SEO pulls in react-router/react-helmet-async/i18next context this test suite doesn't otherwise
// need — it's irrelevant to the file-input-reset behavior under test, so it's stubbed out rather
// than standing up a full router/i18n/helmet harness just to satisfy an unrelated head-metadata component.
vi.mock('../../seo/SEO', () => ({ SEO: () => null }));

// The Preview Article feature renders the real public ArticleDetailView components, which call
// useTranslation — mocked to a simple passthrough (key, or defaultValue when given one) so these
// tests assert on data flow/structure rather than depending on real locale JSON copy.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}));

vi.mock('./newsroomAdminApi', () => ({
  isLoggedInLocally: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  uploadFileToS3: vi.fn(),
  NewsroomApiError: class NewsroomApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  newsroomAdminApi: {
    listArticles: vi.fn(),
    getArticle: vi.fn(),
    createDraft: vi.fn(),
    deleteArticle: vi.fn(),
    updateArticle: vi.fn(),
    processArticle: vi.fn(),
    publishArticle: vi.fn(),
    unpublishArticle: vi.fn(),
    getSourceUrl: vi.fn(),
    getImagePreviewUrl: vi.fn(),
    updateImageMeta: vi.fn(),
    reorderImages: vi.fn(),
    presignUpload: vi.fn(),
    finalizeUpload: vi.fn(),
  },
}));

const articleSummary: ArticleSummary = {
  id: 'article-1',
  slug: 'test-article',
  title: 'Test Article',
  category: 'company-news',
  featured: false,
  status: 'draft',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedAt: null,
  scheduledPublishAt: null,
  scheduledUnpublishAt: null,
};

const articleDetail: ArticleDetail = {
  id: 'article-1',
  slug: 'test-article',
  title: 'Test Article',
  subtitle: 'Subtitle',
  category: 'company-news',
  tags: [],
  featured: false,
  status: 'draft',
  structuredContent: null,
  sourcePdf: null,
  processingError: null,
  processedAt: null,
  images: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedAt: null,
  scheduledPublishAt: null,
  scheduledUnpublishAt: null,
  firstPublishedAt: null,
};

const articleWithContent: ArticleDetail = {
  ...articleDetail,
  structuredContent: {
    version: 1,
    source: { extractor: 'test', extractedAt: '2026-01-01T00:00:00.000Z', sourcePdfKey: 'source.pdf' },
    sections: [{ blocks: [{ type: 'paragraph', text: 'Original body paragraph.' }] }],
  },
  images: [
    { id: 'image-1', s3Key: 'articles/article-1/image-1.jpg', position: 0, altText: 'First image', caption: null, role: null },
    { id: 'image-2', s3Key: 'articles/article-1/image-2.jpg', position: 1, altText: 'Second image', caption: null, role: null },
  ],
  tags: [{ name: 'MEP', slug: 'mep' }],
};

function makeImageFile(name = 'photo.jpg') {
  return new File(['fake-image-bytes'], name, { type: 'image/jpeg' });
}

function renderAdminPage() {
  return render(
    <MemoryRouter>
      <NewsroomAdminPage />
    </MemoryRouter>,
  );
}

/** Renders the page, logs in, opens the one seeded article, and returns its file input + upload button. */
async function renderEditorWithImageUpload() {
  vi.mocked(isLoggedInLocally).mockReturnValue(true);
  vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue([articleSummary]);
  vi.mocked(newsroomAdminApi.getArticle).mockResolvedValue(articleDetail);

  renderAdminPage();

  const row = await screen.findByText('Test Article');
  fireEvent.click(row);

  const input = (await screen.findByLabelText('Choose image file')) as HTMLInputElement;
  const uploadButton = screen.getByRole('button', { name: 'Upload images' });
  return { input, uploadButton };
}

/** Renders the page, logs in, and opens an article seeded with structured content, tags, and two ordered images. */
async function renderEditorForPreview(article: ArticleDetail = articleWithContent) {
  vi.mocked(isLoggedInLocally).mockReturnValue(true);
  vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue([articleSummary]);
  vi.mocked(newsroomAdminApi.getArticle).mockResolvedValue(article);
  vi.mocked(newsroomAdminApi.getImagePreviewUrl).mockImplementation((_articleId, imageId) =>
    Promise.resolve({ url: `https://s3.example/${imageId}.jpg`, expiresIn: 900 }),
  );

  renderAdminPage();

  const row = await screen.findByText('Test Article');
  fireEvent.click(row);
  await screen.findByRole('button', { name: 'Preview Article' });
}

async function openPreview() {
  fireEvent.click(screen.getByRole('button', { name: 'Preview Article' }));
  const dialog = await screen.findByRole('dialog', { name: 'Article preview' });
  // Wait for the presigned image URLs to resolve so the gallery/images are actually rendered.
  await waitFor(() => expect(within(dialog).queryByText('Loading preview…')).not.toBeInTheDocument());
  return dialog;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Newsroom admin — image upload input reset', () => {
  it('shows the selected filename before upload', async () => {
    const { input, uploadButton } = await renderEditorWithImageUpload();

    fireEvent.change(input, { target: { files: [makeImageFile()] } });

    expect(input.files?.[0]?.name).toBe('photo.jpg');
    expect(uploadButton).toBeEnabled();
  });

  it('clears the file input after a successful upload', async () => {
    vi.mocked(newsroomAdminApi.presignUpload).mockResolvedValue({ uploadUrl: 'https://s3.example/upload', s3Key: 'articles/article-1/images/photo.jpg', expiresIn: 900 });
    vi.mocked(uploadFileToS3).mockResolvedValue(undefined);
    vi.mocked(newsroomAdminApi.finalizeUpload).mockResolvedValue({});

    const { input, uploadButton } = await renderEditorWithImageUpload();

    fireEvent.change(input, { target: { files: [makeImageFile()] } });
    expect(input.files?.[0]?.name).toBe('photo.jpg');

    fireEvent.click(uploadButton);

    await waitFor(() => expect(newsroomAdminApi.finalizeUpload).toHaveBeenCalled());
    // `.value = ''` is the only spec-legal way to reset a file input, and is exactly what real
    // browsers use to blank the displayed filename (this bug report's actual symptom) — jsdom
    // doesn't also simulate clearing `.files` as a side effect of that reset the way a real
    // browser does, so `.value` is the authoritative, browser-accurate signal to assert here.
    await waitFor(() => expect(input.value).toBe(''));
    expect(uploadButton).toBeDisabled();
  });

  it('keeps the selected file in the input after a failed upload', async () => {
    vi.mocked(newsroomAdminApi.presignUpload).mockRejectedValue(new Error('Upload failed'));

    const { input, uploadButton } = await renderEditorWithImageUpload();

    fireEvent.change(input, { target: { files: [makeImageFile()] } });
    fireEvent.click(uploadButton);

    await screen.findByText('Upload failed');

    expect(input.files?.[0]?.name).toBe('photo.jpg');
    expect(uploadButton).toBeEnabled();
  });

  it('allows selecting the same file again after a reset', async () => {
    vi.mocked(newsroomAdminApi.presignUpload).mockResolvedValue({ uploadUrl: 'https://s3.example/upload', s3Key: 'articles/article-1/images/photo.jpg', expiresIn: 900 });
    vi.mocked(uploadFileToS3).mockResolvedValue(undefined);
    vi.mocked(newsroomAdminApi.finalizeUpload).mockResolvedValue({});

    const { input, uploadButton } = await renderEditorWithImageUpload();
    const file = makeImageFile();

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(uploadButton);
    await waitFor(() => expect(input.value).toBe(''));

    // The reset (input.value = '') is what lets a real browser re-fire `change` for an
    // identical selection — simulate that same file being chosen again post-reset.
    fireEvent.change(input, { target: { files: [file] } });

    expect(input.files?.[0]?.name).toBe('photo.jpg');
    expect(uploadButton).toBeEnabled();
  });
});

describe('Newsroom admin — Preview Article', () => {
  it('shows a Preview Article button near the end of the editor', async () => {
    await renderEditorForPreview();
    expect(screen.getByRole('button', { name: 'Preview Article' })).toBeInTheDocument();
  });

  it('opens a preview overlay showing the current title and structured content', async () => {
    await renderEditorForPreview();
    const dialog = await openPreview();

    expect(within(dialog).getByText('Test Article')).toBeInTheDocument();
    expect(within(dialog).getByText('Original body paragraph.')).toBeInTheDocument();
    expect(within(dialog).getByText('Preview')).toBeInTheDocument();
  });

  it('closes the preview and preserves the editor state', async () => {
    await renderEditorForPreview();
    await openPreview();

    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));
    expect(screen.queryByRole('dialog', { name: 'Article preview' })).not.toBeInTheDocument();

    // The title field (and the rest of the editor) is untouched by opening/closing preview.
    expect(screen.getByLabelText('Title')).toHaveValue('Test Article');
  });

  it('reflects an unsaved title change once it has been blurred (auto-saved)', async () => {
    const updated: ArticleDetail = { ...articleWithContent, title: 'Updated Draft Title' };
    vi.mocked(newsroomAdminApi.updateArticle).mockResolvedValue(updated);

    await renderEditorForPreview();

    const titleField = screen.getByLabelText('Title');
    fireEvent.change(titleField, { target: { value: 'Updated Draft Title' } });
    fireEvent.blur(titleField);
    await waitFor(() => expect(newsroomAdminApi.updateArticle).toHaveBeenCalledWith('article-1', { title: 'Updated Draft Title' }));

    const dialog = await openPreview();
    expect(within(dialog).getByText('Updated Draft Title')).toBeInTheDocument();
  });

  it('reflects the current image order (sorted by position, not array order)', async () => {
    // Deliberately out of array order — image-2 (position 1) listed before image-1 (position 0) —
    // to prove the preview sorts by position rather than trusting the array's own order.
    const outOfOrder: ArticleDetail = {
      ...articleWithContent,
      images: [
        { id: 'image-2', s3Key: 'articles/article-1/image-2.jpg', position: 1, altText: 'Second image', caption: null, role: null },
        { id: 'image-1', s3Key: 'articles/article-1/image-1.jpg', position: 0, altText: 'First image', caption: null, role: null },
      ],
    };
    await renderEditorForPreview(outOfOrder);
    const dialog = await openPreview();

    expect(within(dialog).getByAltText('First image')).toBeInTheDocument();
    expect(within(dialog).queryByAltText('Second image')).not.toBeInTheDocument();
  });

  it('passes multiple images to the gallery with working navigation controls', async () => {
    await renderEditorForPreview();
    const dialog = await openPreview();

    const nextButton = within(dialog).getByLabelText('newsroom:gallery.nextImage');
    expect(within(dialog).getByAltText('First image')).toBeInTheDocument();

    fireEvent.click(nextButton);

    expect(within(dialog).getByAltText('Second image')).toBeInTheDocument();
  });

  it('toggles between desktop and mobile preview modes', async () => {
    await renderEditorForPreview();
    const dialog = await openPreview();

    const desktopToggle = within(dialog).getByRole('button', { name: 'Desktop' });
    const mobileToggle = within(dialog).getByRole('button', { name: 'Mobile' });
    expect(desktopToggle).toHaveAttribute('aria-pressed', 'true');
    expect(mobileToggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(mobileToggle);

    expect(mobileToggle).toHaveAttribute('aria-pressed', 'true');
    expect(desktopToggle).toHaveAttribute('aria-pressed', 'false');
    // Still the same article content, just re-rendered through the mobile ArticleDetailView.
    expect(within(dialog).getByText('Test Article')).toBeInTheDocument();
  });

  it('never publishes, unpublishes, or schedules the article from preview interactions', async () => {
    await renderEditorForPreview();
    const dialog = await openPreview();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Mobile' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));

    expect(newsroomAdminApi.publishArticle).not.toHaveBeenCalled();
    expect(newsroomAdminApi.unpublishArticle).not.toHaveBeenCalled();
    expect(newsroomAdminApi.updateArticle).not.toHaveBeenCalled();
  });
});

describe('Newsroom admin — Delete article', () => {
  const publishedSummary: ArticleSummary = { ...articleSummary, id: 'article-2', title: 'Published Article', status: 'published' };

  async function renderArticleList(articles: ArticleSummary[] = [articleSummary]) {
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue(articles);
    renderAdminPage();
    await screen.findByText(articles[0].title as string);
  }

  it('shows a delete action for each row', async () => {
    await renderArticleList();
    expect(screen.getByLabelText('Delete "Test Article"')).toBeInTheDocument();
  });

  it('clicking delete does not delete immediately — it opens a confirmation modal', async () => {
    await renderArticleList();
    fireEvent.click(screen.getByLabelText('Delete "Test Article"'));

    expect(newsroomAdminApi.deleteArticle).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Delete article?')).toBeInTheDocument();
    expect(within(dialog).getByText(/"Test Article"/)).toBeInTheDocument();
    expect(within(dialog).getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it('shows a stronger warning for a published article, and none for a draft', async () => {
    await renderArticleList([articleSummary, publishedSummary]);

    fireEvent.click(screen.getByLabelText('Delete "Test Article"'));
    let dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByText(/currently published/i)).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    fireEvent.click(screen.getByLabelText('Delete "Published Article"'));
    dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/currently published/i)).toBeInTheDocument();
  });

  it('Cancel closes the modal without deleting, and the row remains', async () => {
    await renderArticleList();
    fireEvent.click(screen.getByLabelText('Delete "Test Article"'));
    const dialog = await screen.findByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(newsroomAdminApi.deleteArticle).not.toHaveBeenCalled();
    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  it('shows "Deleting…" and disables the confirm button while the request is in flight, then removes the row on success', async () => {
    await renderArticleList();
    let resolveDelete: (value: { deleted: true; id: string }) => void = () => {};
    vi.mocked(newsroomAdminApi.deleteArticle).mockImplementation(() => new Promise((resolve) => { resolveDelete = resolve; }));

    fireEvent.click(screen.getByLabelText('Delete "Test Article"'));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete article' }));

    const confirmButton = await within(dialog).findByRole('button', { name: 'Deleting…' });
    expect(confirmButton).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();

    resolveDelete({ deleted: true, id: 'article-1' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByText('Test Article')).not.toBeInTheDocument();
    expect(newsroomAdminApi.deleteArticle).toHaveBeenCalledWith('article-1');
  });

  it('keeps the article and shows a clear error if deletion fails', async () => {
    await renderArticleList();
    vi.mocked(newsroomAdminApi.deleteArticle).mockRejectedValue(new Error('Failed to delete stored files'));

    fireEvent.click(screen.getByLabelText('Delete "Test Article"'));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete article' }));

    await within(dialog).findByText('Failed to delete stored files');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Delete article' })).toBeEnabled();
  });

  // Regression coverage for the Production screenshot bug: the modal showed "(untitled)" even
  // for a named article. Traced to be already correct in source (pendingDelete is always set
  // from the exact clicked row's own object) — these tests pin that against multiple distinct,
  // named rows so any future regression that mixes up rows is caught immediately.
  it('shows the correct title of the SPECIFIC row clicked, not another row or a generic fallback', async () => {
    const articleA: ArticleSummary = { ...articleSummary, id: 'article-a', title: 'Alpha Article' };
    const articleB: ArticleSummary = { ...articleSummary, id: 'article-b', title: 'Beta Article' };
    const articleC: ArticleSummary = { ...articleSummary, id: 'article-c', title: 'Gamma Article' };
    await renderArticleList([articleA, articleB, articleC]);

    fireEvent.click(screen.getByLabelText('Delete "Beta Article"'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('"Beta Article" and its associated content will be permanently deleted. This action cannot be undone.')).toBeInTheDocument();
    expect(within(dialog).queryByText(/Alpha Article/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/Gamma Article/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText('(untitled)')).not.toBeInTheDocument();
  });

  it('only shows "(untitled)" when the specific clicked article genuinely has no title', async () => {
    const namedArticle: ArticleSummary = { ...articleSummary, id: 'article-named', title: 'Named Article' };
    const untitledArticle: ArticleSummary = { ...articleSummary, id: 'article-blank', title: null };
    await renderArticleList([namedArticle, untitledArticle]);

    fireEvent.click(screen.getByLabelText('Delete "(untitled)"'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('"(untitled)" and its associated content will be permanently deleted. This action cannot be undone.')).toBeInTheDocument();
    expect(within(dialog).queryByText(/Named Article/)).not.toBeInTheDocument();
  });

  it('treats a whitespace-only title the same as no title', async () => {
    const whitespaceOnly: ArticleSummary = { ...articleSummary, title: '   ' };
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue([whitespaceOnly]);
    renderAdminPage();

    fireEvent.click(await screen.findByLabelText('Delete "(untitled)"'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('"(untitled)" and its associated content will be permanently deleted. This action cannot be undone.')).toBeInTheDocument();
  });
});

describe('Newsroom admin — simplified status labels', () => {
  it.each(['draft', 'ready', 'failed'] as const)(
    'shows the queue row for a "%s" article as "Draft", never the raw backend status',
    async (status) => {
      const summary: ArticleSummary = { ...articleSummary, status };
      vi.mocked(isLoggedInLocally).mockReturnValue(true);
      vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue([summary]);
      renderAdminPage();

      await screen.findByText('Test Article');
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.queryByText(status, { selector: 'span' })).not.toBeInTheDocument();
    },
  );

  it('shows the queue row for a "processing" article as a transient "Processing…" indicator, not "Draft" and not the raw status', async () => {
    const summary: ArticleSummary = { ...articleSummary, status: 'processing' };
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue([summary]);
    renderAdminPage();

    await screen.findByText('Test Article');
    expect(screen.getByText('Processing…')).toBeInTheDocument();
    expect(screen.queryByText('processing', { selector: 'span' })).not.toBeInTheDocument();
  });

  it('shows the queue row for a published article as "Published"', async () => {
    const summary: ArticleSummary = { ...articleSummary, status: 'published' };
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue([summary]);
    renderAdminPage();

    await screen.findByText('Test Article');
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('shows the editor header badge as "Draft" for a "ready" article, not "ready"', async () => {
    await renderEditorForPreview({ ...articleWithContent, status: 'ready' });
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('ready')).not.toBeInTheDocument();
  });

  it('never renders the word "ready" anywhere in the editor\'s publish guidance', async () => {
    await renderEditorForPreview({ ...articleWithContent, status: 'draft' });
    expect(screen.getByText('Process this article before publishing.')).toBeInTheDocument();
    expect(screen.queryByText(/"ready"/)).not.toBeInTheDocument();
  });

  it('Unpublish returns the editor badge visually to "Draft"', async () => {
    const published: ArticleDetail = { ...articleWithContent, status: 'published', publishedAt: '2026-01-05T00:00:00.000Z' };
    const afterUnpublish: ArticleDetail = { ...published, status: 'ready', publishedAt: null };
    vi.mocked(newsroomAdminApi.unpublishArticle).mockResolvedValue(afterUnpublish);

    await renderEditorForPreview(published);
    expect(screen.getByText('Published')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Unpublish' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument());
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('Published')).not.toBeInTheDocument();
  });
});

describe('Newsroom admin — queue Opens/Closes publication window', () => {
  const SCHEDULED_OPEN = '2026-05-01T06:00:00.000Z';
  const ACTUAL_PUBLISHED = '2026-04-10T09:30:00.000Z';
  const SCHEDULED_CLOSE = '2026-06-01T00:00:00.000Z';

  async function renderQueueRow(summary: ArticleSummary) {
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue([summary]);
    renderAdminPage();
    await screen.findByText('Test Article');
    return screen.getAllByRole('row')[1];
  }

  it('scheduled future opening: Draft status, Opens shows the scheduled date, Closes shows "—"', async () => {
    const row = await renderQueueRow({ ...articleSummary, status: 'ready', scheduledPublishAt: SCHEDULED_OPEN, scheduledUnpublishAt: null });
    expect(within(row).getByText('Draft')).toBeInTheDocument();
    expect(within(row).getByText(formatUaeDisplay(SCHEDULED_OPEN) as string)).toBeInTheDocument();
    expect(within(row).getAllByText('—').length).toBeGreaterThan(0);
  });

  it('opening occurred (manually published, no scheduled close): Published status, Opens shows the actual published date, Closes shows "—"', async () => {
    const row = await renderQueueRow({
      ...articleSummary,
      status: 'published',
      publishedAt: ACTUAL_PUBLISHED,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
    });
    expect(within(row).getByText('Published')).toBeInTheDocument();
    expect(within(row).getByText(formatUaeDisplay(ACTUAL_PUBLISHED) as string)).toBeInTheDocument();
  });

  it('published with a scheduled close: Published status, Opens shows published date, Closes shows the scheduled close date', async () => {
    const row = await renderQueueRow({
      ...articleSummary,
      status: 'published',
      publishedAt: ACTUAL_PUBLISHED,
      scheduledPublishAt: null,
      scheduledUnpublishAt: SCHEDULED_CLOSE,
    });
    expect(within(row).getByText('Published')).toBeInTheDocument();
    expect(within(row).getByText(formatUaeDisplay(ACTUAL_PUBLISHED) as string)).toBeInTheDocument();
    expect(within(row).getByText(formatUaeDisplay(SCHEDULED_CLOSE) as string)).toBeInTheDocument();
  });

  it('closing occurred (scheduling worker/manual unpublish already ran): Draft status, and both dates already cleared by the backend read back as "—"', async () => {
    // Exact post-close row shape: status back to 'ready' (-> Draft), published_at and
    // scheduled_unpublish_at both cleared — see runScheduledPublishingWorker/unpublishArticle.
    const row = await renderQueueRow({
      ...articleSummary,
      status: 'ready',
      publishedAt: null,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
    });
    expect(within(row).getByText('Draft')).toBeInTheDocument();
    expect(within(row).getAllByText('—').length).toBeGreaterThanOrEqual(2);
    // The article is still a real, selectable row in the queue — not removed, not a third status.
    expect(within(row).getByText('Test Article')).toBeInTheDocument();
  });

  it('no publication information at all (a brand-new draft): both columns show "—"', async () => {
    const row = await renderQueueRow({ ...articleSummary, status: 'draft', publishedAt: null, scheduledPublishAt: null, scheduledUnpublishAt: null });
    expect(within(row).getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('presents the same Opens/Closes values in a combined "Publication window" cell for narrow layouts', async () => {
    const row = await renderQueueRow({
      ...articleSummary,
      status: 'published',
      publishedAt: ACTUAL_PUBLISHED,
      scheduledPublishAt: null,
      scheduledUnpublishAt: SCHEDULED_CLOSE,
    });
    expect(within(row).getByText(`Opens: ${formatUaeDisplay(ACTUAL_PUBLISHED)}`)).toBeInTheDocument();
    expect(within(row).getByText(`Closes: ${formatUaeDisplay(SCHEDULED_CLOSE)}`)).toBeInTheDocument();
  });
});

describe('Newsroom admin — queue status control', () => {
  const draftDetail: ArticleDetail = { ...articleWithContent, status: 'published' }; // baseline for publish/unpublish return values below, overridden per test

  async function renderQueue(articles: ArticleSummary[] = [articleSummary]) {
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue(articles);
    renderAdminPage();
    await screen.findByText(articles[0].title as string);
  }

  function statusButton(title = 'Test Article') {
    return screen.getByRole('button', { name: `Change status for "${title}"` });
  }

  it('shows Draft with a Published option, and vice versa (correct dropdown mapping)', async () => {
    await renderQueue();
    fireEvent.click(statusButton());

    const listbox = screen.getByRole('listbox', { name: 'Change status' });
    const draftOption = within(listbox).getByRole('option', { name: 'Draft' });
    const publishedOption = within(listbox).getByRole('option', { name: 'Published' });
    expect(draftOption).toHaveAttribute('aria-selected', 'true');
    expect(publishedOption).toHaveAttribute('aria-selected', 'false');
  });

  it('Draft -> Published: opens a confirmation, then calls the existing publish API and updates the row', async () => {
    const published: ArticleDetail = { ...draftDetail, status: 'published', publishedAt: '2026-02-01T00:00:00.000Z' };
    vi.mocked(newsroomAdminApi.publishArticle).mockResolvedValue(published);

    await renderQueue();
    fireEvent.click(statusButton());
    fireEvent.click(screen.getByRole('option', { name: 'Published' }));

    // Confirmation required — no API call yet.
    expect(newsroomAdminApi.publishArticle).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Publish this article?')).toBeInTheDocument();
    expect(within(dialog).getByText('This will make the article publicly visible.')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Publish' }));

    await waitFor(() => expect(newsroomAdminApi.publishArticle).toHaveBeenCalledWith('article-1'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('Published -> Draft: opens a confirmation, then calls the existing unpublish API and updates the row', async () => {
    const publishedSummary: ArticleSummary = { ...articleSummary, status: 'published' };
    const afterUnpublish: ArticleDetail = { ...draftDetail, status: 'ready', publishedAt: null };
    vi.mocked(newsroomAdminApi.unpublishArticle).mockResolvedValue(afterUnpublish);

    await renderQueue([publishedSummary]);
    fireEvent.click(statusButton());
    fireEvent.click(screen.getByRole('option', { name: 'Draft' }));

    expect(newsroomAdminApi.unpublishArticle).not.toHaveBeenCalled();
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Move article to Draft?')).toBeInTheDocument();
    expect(within(dialog).getByText('This will remove the article from the public Newsroom.')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Move to Draft' }));

    await waitFor(() => expect(newsroomAdminApi.unpublishArticle).toHaveBeenCalledWith('article-1'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('Published')).not.toBeInTheDocument();
  });

  it('Cancel closes the confirmation without calling the API or changing the row', async () => {
    await renderQueue();
    fireEvent.click(statusButton());
    fireEvent.click(screen.getByRole('option', { name: 'Published' }));
    const dialog = await screen.findByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(newsroomAdminApi.publishArticle).not.toHaveBeenCalled();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('publish validation failure: keeps the row as Draft and shows the existing error, without changing status', async () => {
    vi.mocked(newsroomAdminApi.publishArticle).mockRejectedValue(new Error('Article has no title'));

    await renderQueue();
    fireEvent.click(statusButton());
    fireEvent.click(screen.getByRole('option', { name: 'Published' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publish' }));

    await within(dialog).findByText('Article has no title');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.queryByText('Published')).not.toBeInTheDocument();
  });

  it('API failure requires no rollback — the row was never optimistically changed before the failure', async () => {
    const publishedSummary: ArticleSummary = { ...articleSummary, status: 'published' };
    vi.mocked(newsroomAdminApi.unpublishArticle).mockRejectedValue(new Error('Network error'));

    await renderQueue([publishedSummary]);
    fireEvent.click(statusButton());
    fireEvent.click(screen.getByRole('option', { name: 'Draft' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Move to Draft' }));

    await within(dialog).findByText('Network error');
    // Still "Published" throughout — never flipped to Draft and then back.
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('disables the confirm button and prevents duplicate requests while updating', async () => {
    let resolvePublish: (value: ArticleDetail) => void = () => {};
    vi.mocked(newsroomAdminApi.publishArticle).mockImplementation(() => new Promise((resolve) => { resolvePublish = resolve; }));

    await renderQueue();
    fireEvent.click(statusButton());
    fireEvent.click(screen.getByRole('option', { name: 'Published' }));
    const dialog = await screen.findByRole('dialog');
    const confirmButton = within(dialog).getByRole('button', { name: 'Publish' });

    fireEvent.click(confirmButton);
    const updatingButton = await within(dialog).findByRole('button', { name: 'Updating…' });
    expect(updatingButton).toBeDisabled();

    // A second click while disabled must not fire a second request.
    fireEvent.click(updatingButton);
    expect(newsroomAdminApi.publishArticle).toHaveBeenCalledTimes(1);

    resolvePublish({ ...draftDetail, status: 'published', publishedAt: '2026-02-01T00:00:00.000Z' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not require opening the article editor to change status', async () => {
    vi.mocked(newsroomAdminApi.publishArticle).mockResolvedValue({ ...draftDetail, status: 'published', publishedAt: '2026-02-01T00:00:00.000Z' });
    await renderQueue();

    fireEvent.click(statusButton());
    fireEvent.click(screen.getByRole('option', { name: 'Published' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publish' }));
    await waitFor(() => expect(newsroomAdminApi.publishArticle).toHaveBeenCalled());

    // Still on the queue view (no editor-only heading like "Article Details" ever appeared).
    expect(screen.getByText('Review queue')).toBeInTheDocument();
    expect(screen.queryByText('Article Details')).not.toBeInTheDocument();
  });

  it('a scheduled draft published manually goes through the same existing publish API (no separate scheduled-specific path)', async () => {
    // The queue's ArticleSummary carries no scheduling fields at all — this control has no
    // knowledge of scheduling and always calls the one existing publishArticle(id) endpoint,
    // which already clears any pending scheduled_publish_at as part of that same update
    // (see api/_lib/articles.ts's publishArticle) — nothing new to duplicate here.
    vi.mocked(newsroomAdminApi.publishArticle).mockResolvedValue({ ...draftDetail, status: 'published', publishedAt: '2026-02-01T00:00:00.000Z' });
    await renderQueue();

    fireEvent.click(statusButton());
    fireEvent.click(screen.getByRole('option', { name: 'Published' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Publish' }));

    await waitFor(() => expect(newsroomAdminApi.publishArticle).toHaveBeenCalledWith('article-1'));
    expect(newsroomAdminApi.publishArticle).toHaveBeenCalledTimes(1);
  });
});

describe('Newsroom admin — queue Sort by control', () => {
  const oldestArticle: ArticleSummary = {
    ...articleSummary,
    id: 'article-old',
    title: 'Oldest Article',
    status: 'published',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z', // deliberately much later than createdAt
  };
  const middleArticle: ArticleSummary = {
    ...articleSummary,
    id: 'article-mid',
    title: 'Middle Article',
    status: 'draft',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  };
  const newestArticle: ArticleSummary = {
    ...articleSummary,
    id: 'article-new',
    title: 'Newest Article',
    status: 'draft',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-02T00:00:00.000Z',
  };

  async function renderQueueForSort() {
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(newsroomAdminApi.listArticles).mockResolvedValue([oldestArticle, newestArticle, middleArticle]);
    renderAdminPage();
    await screen.findByText('Oldest Article');
  }

  function titlesInOrder() {
    return screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent);
  }

  it('defaults to "Newest first" with the newest article on top', async () => {
    await renderQueueForSort();
    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
    expect(select.value).toBe('newest');
    expect(titlesInOrder()).toEqual(['Newest Article', 'Middle Article', 'Oldest Article']);
  });

  it('switching to "Oldest first" immediately re-orders the queue without a reload', async () => {
    await renderQueueForSort();
    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;

    fireEvent.change(select, { target: { value: 'oldest' } });

    expect(select.value).toBe('oldest');
    expect(titlesInOrder()).toEqual(['Oldest Article', 'Middle Article', 'Newest Article']);
  });

  it('switching back to "Newest first" restores the original order', async () => {
    await renderQueueForSort();
    const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;

    fireEvent.change(select, { target: { value: 'oldest' } });
    expect(titlesInOrder()).toEqual(['Oldest Article', 'Middle Article', 'Newest Article']);

    fireEvent.change(select, { target: { value: 'newest' } });
    expect(select.value).toBe('newest');
    expect(titlesInOrder()).toEqual(['Newest Article', 'Middle Article', 'Oldest Article']);
  });

  it('orders strictly by createdAt, ignoring updatedAt even when they disagree', async () => {
    // oldestArticle has the latest updatedAt of the three but the earliest createdAt.
    await renderQueueForSort();
    expect(titlesInOrder()[titlesInOrder().length - 1]).toBe('Oldest Article');
  });

  it('sorts mixed Draft/Published articles in the same chronological list', async () => {
    await renderQueueForSort();
    // Newest (draft), Middle (draft), Oldest (published) — status never separates them.
    expect(titlesInOrder()).toEqual(['Newest Article', 'Middle Article', 'Oldest Article']);
    const select = screen.getByLabelText('Sort by:');
    fireEvent.change(select, { target: { value: 'oldest' } });
    expect(titlesInOrder()).toEqual(['Oldest Article', 'Middle Article', 'Newest Article']);
  });

  it('renders compactly in a wrapping header so it stays usable at narrow (mobile) widths', async () => {
    await renderQueueForSort();
    const select = screen.getByLabelText('Sort by:');
    const header = select.closest('.flex.flex-wrap.items-center.justify-between');
    expect(header).not.toBeNull();
    // Sort control and "New draft" both live in the same wrapping row, not a separate oversized card.
    expect(within(header as HTMLElement).getByRole('button', { name: 'New draft' })).toBeInTheDocument();
  });

  it('is keyboard accessible via a native <select> with an associated label', async () => {
    await renderQueueForSort();
    const select = screen.getByLabelText('Sort by:');
    expect(select.tagName).toBe('SELECT');
    expect(within(select as HTMLElement).getAllByRole('option').map((o) => o.textContent)).toEqual(['Newest first', 'Oldest first']);
  });

  it('labels the date column "Created" and displays createdAt there, not updatedAt — so the visible order matches what is actually being sorted', async () => {
    await renderQueueForSort();
    const headerCells = within(screen.getAllByRole('row')[0]).getAllByRole('columnheader');
    expect(headerCells.map((c) => c.textContent)).toContain('Created');
    expect(screen.queryByRole('columnheader', { name: 'Updated' })).not.toBeInTheDocument();

    // oldestArticle's createdAt (2026-01-01) and updatedAt (2026-06-01) deliberately differ —
    // the rendered cell must reflect createdAt.
    const oldRow = screen.getByText('Oldest Article').closest('tr') as HTMLElement;
    const dateCell = within(oldRow).getAllByRole('cell')[3];
    expect(dateCell.textContent).toBe(new Date(oldestArticle.createdAt).toLocaleString());
    expect(dateCell.textContent).not.toBe(new Date(oldestArticle.updatedAt).toLocaleString());
  });
});
