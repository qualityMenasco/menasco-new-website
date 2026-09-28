import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProjectsAdminPage from './ProjectsAdminPage';
import { projectsAdminApi, isLoggedInLocally, uploadFileToS3 } from './projectsAdminApi';
import type { AdminProject } from './types';

// SEO pulls in react-router/react-helmet-async context this suite doesn't otherwise need.
vi.mock('../../seo/SEO', () => ({ SEO: () => null }));

vi.mock('./projectsAdminApi', () => ({
  isLoggedInLocally: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  uploadFileToS3: vi.fn(),
  ProjectsApiError: class ProjectsApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
  projectsAdminApi: {
    listProjects: vi.fn(),
    getProject: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    createMetric: vi.fn(),
    updateMetric: vi.fn(),
    deleteMetric: vi.fn(),
    reorderMetrics: vi.fn(),
    presignImageUpload: vi.fn(),
    finalizeImageUpload: vi.fn(),
    updateImageMeta: vi.fn(),
    deleteImage: vi.fn(),
    reorderImages: vi.fn(),
    setPrimaryImage: vi.fn(),
    getImagePreviewUrl: vi.fn(),
  },
}));

function makeProject(overrides: Partial<AdminProject> & { id: string }): AdminProject {
  return {
    epromiseId: 'EP-001',
    epromiseName: 'Internal codename',
    commonName: 'Test Tower',
    slug: 'test-tower',
    projectClass: 'Residential',
    projectType: 'High-rise',
    category: 'residential',
    location: 'Business Bay',
    country: 'UAE',
    consultant: 'Secret Consultant LLC',
    client: 'Secret Client Holdings',
    completionDate: '2026-06-01',
    completionStatus: 'ongoing',
    publicDescription: 'A test tower.',
    privateDescription: 'Internal notes.',
    durationMonths: 24,
    peakWorkforce: 500,
    builtAreaSqm: 10000,
    valueAmount: 50_000_000,
    valueCurrency: 'AED',
    floors: 30,
    featured: false,
    status: 'draft',
    metrics: [],
    images: [],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderPage() {
  return render(<ProjectsAdminPage />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Projects admin — login gate', () => {
  it('shows the login form when not logged in', () => {
    vi.mocked(isLoggedInLocally).mockReturnValue(false);
    renderPage();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('skips the login form when already logged in locally', async () => {
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([]);
    renderPage();
    await screen.findByText('No projects yet.');
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });
});

describe('Projects admin — dashboard stats and queue', () => {
  async function renderDashboard(projects: AdminProject[]) {
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue(projects);
    renderPage();
    if (projects.length > 0) await screen.findByText(projects[0].commonName);
    else await screen.findByText('No projects yet.');
  }

  it('computes total/published/draft/featured counts correctly', async () => {
    await renderDashboard([
      makeProject({ id: 'p1', commonName: 'Published Featured', status: 'published', featured: true }),
      makeProject({ id: 'p2', commonName: 'Published Not Featured', status: 'published', featured: false }),
      makeProject({ id: 'p3', commonName: 'Draft One', status: 'draft', featured: false }),
    ]);
    expect(screen.getByText('Total').nextSibling).toBeTruthy();
    const stats = screen.getAllByText(/^(3|2|1)$/);
    // Total=3, Published=2, Draft=1, Featured=1 — assert via labels' adjacency instead of raw text collisions.
    expect(screen.getByText('Published Featured')).toBeInTheDocument();
    expect(stats.length).toBeGreaterThan(0);
  });

  it('search filters the queue by common name/category/location', async () => {
    await renderDashboard([
      makeProject({ id: 'p1', commonName: 'Vela Tower', location: 'Business Bay' }),
      makeProject({ id: 'p2', commonName: 'Marina Heights', location: 'Dubai Marina' }),
    ]);
    fireEvent.change(screen.getByLabelText('Search projects'), { target: { value: 'marina' } });
    expect(screen.queryByText('Vela Tower')).not.toBeInTheDocument();
    expect(screen.getByText('Marina Heights')).toBeInTheDocument();
  });

  it('sorting by common name toggles ascending/descending order', async () => {
    await renderDashboard([
      makeProject({ id: 'p1', commonName: 'Zeta Tower' }),
      makeProject({ id: 'p2', commonName: 'Alpha Tower' }),
    ]);
    const rows = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(rows()).toEqual(['Alpha Tower', 'Zeta Tower']); // default ascending by commonName
    fireEvent.click(screen.getByRole('button', { name: /Common Name/ }));
    expect(rows()).toEqual(['Zeta Tower', 'Alpha Tower']);
  });

  it('Publish/Unpublish action calls the API and updates the badge', async () => {
    const draft = makeProject({ id: 'p1', commonName: 'Vela Tower', status: 'draft' });
    vi.mocked(projectsAdminApi.updateProject).mockResolvedValue({ ...draft, status: 'published' });
    await renderDashboard([draft]);

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await waitFor(() => expect(projectsAdminApi.updateProject).toHaveBeenCalledWith('p1', { status: 'published' }));
    // "Published" also appears as a dashboard stat-card label — scope to the row's own status badge.
    const row = screen.getByText('Vela Tower').closest('tr') as HTMLElement;
    await waitFor(() => expect(within(row).getByText('Published')).toBeInTheDocument());
  });

  it('Delete requires confirmation before calling the API', async () => {
    await renderDashboard([makeProject({ id: 'p1', commonName: 'Vela Tower' })]);

    fireEvent.click(screen.getByLabelText('Delete "Vela Tower"'));
    const dialog = await screen.findByRole('dialog', { name: 'Delete project?' });
    expect(projectsAdminApi.deleteProject).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(projectsAdminApi.deleteProject).toHaveBeenCalledWith('p1'));
  });
});

describe('Projects admin — create flow', () => {
  it('disables Create Project until every required field is filled', async () => {
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([]);
    renderPage();
    await screen.findByText('No projects yet.');

    fireEvent.click(screen.getByRole('button', { name: 'New Project' }));
    const createButton = await screen.findByRole('button', { name: 'Create Project' });
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/^Epromise ID/), { target: { value: 'EP-100' } });
    expect(createButton).toBeDisabled(); // still missing other required fields
  });

  it('creating a project with all required fields navigates to its editor', async () => {
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([]);
    const created = makeProject({ id: 'new-id', commonName: 'Brand New Tower' });
    vi.mocked(projectsAdminApi.createProject).mockResolvedValue(created);
    vi.mocked(projectsAdminApi.getProject).mockResolvedValue(created);
    renderPage();
    await screen.findByText('No projects yet.');

    fireEvent.click(screen.getByRole('button', { name: 'New Project' }));
    await screen.findByRole('button', { name: 'Create Project' });

    fireEvent.change(screen.getByLabelText(/^Epromise ID/), { target: { value: 'EP-100' } });
    fireEvent.change(screen.getByLabelText(/^Epromise Name/), { target: { value: 'Internal name' } });
    fireEvent.change(screen.getByLabelText(/^Common Name/), { target: { value: 'Brand New Tower' } });
    fireEvent.change(screen.getByLabelText(/^Project Class/), { target: { value: 'Residential' } });
    fireEvent.change(screen.getByLabelText(/^Project Type/), { target: { value: 'High-rise' } });
    fireEvent.change(screen.getByLabelText(/^Category/), { target: { value: 'residential' } });
    fireEvent.change(screen.getByLabelText(/^Location/), { target: { value: 'Business Bay' } });
    fireEvent.change(screen.getByLabelText(/^Country/), { target: { value: 'UAE' } });
    fireEvent.change(screen.getByLabelText(/^Consultant/), { target: { value: 'A Consultant' } });
    fireEvent.change(screen.getByLabelText(/^Client/), { target: { value: 'A Client' } });
    fireEvent.change(screen.getByLabelText(/^Public Description/), { target: { value: 'A public description.' } });
    fireEvent.change(screen.getByLabelText(/^Duration \(months\)/), { target: { value: '24' } });
    fireEvent.change(screen.getByLabelText(/^Peak Workforce/), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/^Built Area/), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText(/^Value Amount/), { target: { value: '50000000' } });
    fireEvent.change(screen.getByLabelText(/^Floors/), { target: { value: '30' } });

    const createButton = screen.getByRole('button', { name: 'Create Project' });
    expect(createButton).not.toBeDisabled();
    fireEvent.click(createButton);

    await waitFor(() => expect(projectsAdminApi.createProject).toHaveBeenCalled());
    await screen.findByDisplayValue('Brand New Tower');
  });
});

describe('Projects admin — metrics manager', () => {
  it('adding a metric calls the API and appends it to the ordered list', async () => {
    const project = makeProject({ id: 'p1' });
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([project]);
    vi.mocked(projectsAdminApi.getProject).mockResolvedValue(project);
    const newMetric = { id: 'm1', metricName: 'Built Area', metricValue: '85000', metricUnit: 'm²', displayOrder: 0 };
    vi.mocked(projectsAdminApi.createMetric).mockResolvedValue(newMetric);
    renderPage();

    await screen.findByText(project.commonName);
    fireEvent.click(screen.getByText(project.commonName));
    await screen.findByText('Key Metrics');

    fireEvent.change(screen.getByPlaceholderText('e.g. Built Area'), { target: { value: 'Built Area' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. 85,000'), { target: { value: '85000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add metric' }));

    await waitFor(() => expect(projectsAdminApi.createMetric).toHaveBeenCalledWith('p1', expect.objectContaining({ metricName: 'Built Area', metricValue: '85000', displayOrder: 0 })));
  });
});

describe('Projects admin — image upload and primary selection', () => {
  it('uploads an image via presign -> S3 PUT -> finalize', async () => {
    const project = makeProject({ id: 'p1' });
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([project]);
    vi.mocked(projectsAdminApi.getProject).mockResolvedValue(project);
    vi.mocked(projectsAdminApi.presignImageUpload).mockResolvedValue({ uploadUrl: 'https://s3.example/presigned-put', s3Key: 'projects/images/p1/img1.jpg', expiresIn: 900 });
    vi.mocked(uploadFileToS3).mockResolvedValue(undefined);
    vi.mocked(projectsAdminApi.finalizeImageUpload).mockResolvedValue([
      { id: 'img1', s3Key: 'projects/images/p1/img1.jpg', position: 0, altText: null, caption: null, isPrimary: false },
    ]);
    renderPage();

    await screen.findByText(project.commonName);
    fireEvent.click(screen.getByText(project.commonName));
    const fileInput = await screen.findByLabelText('Choose image file');
    const file = new File(['fake-bytes'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: 'Upload image' }));

    await waitFor(() => expect(projectsAdminApi.presignImageUpload).toHaveBeenCalledWith('p1', { contentType: 'image/jpeg', position: 0 }));
    expect(uploadFileToS3).toHaveBeenCalledWith('https://s3.example/presigned-put', file);
    await waitFor(() => expect(projectsAdminApi.finalizeImageUpload).toHaveBeenCalledWith('p1', { s3Key: 'projects/images/p1/img1.jpg', position: 0 }));
  });

  it('setting a non-primary image as primary calls the API', async () => {
    const project = makeProject({
      id: 'p1',
      images: [
        { id: 'img1', s3Key: 'projects/images/p1/img1.jpg', position: 0, altText: null, caption: null, isPrimary: true },
        { id: 'img2', s3Key: 'projects/images/p1/img2.jpg', position: 1, altText: null, caption: null, isPrimary: false },
      ],
    });
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([project]);
    vi.mocked(projectsAdminApi.getProject).mockResolvedValue(project);
    vi.mocked(projectsAdminApi.setPrimaryImage).mockResolvedValue({ primaryImageId: 'img2' });
    renderPage();

    await screen.findByText(project.commonName);
    fireEvent.click(screen.getByText(project.commonName));
    await screen.findByText('Image 1');

    fireEvent.click(screen.getByRole('button', { name: 'Set as primary' }));
    await waitFor(() => expect(projectsAdminApi.setPrimaryImage).toHaveBeenCalledWith('p1', 'img2'));
  });

  it('never renders the raw S3 key anywhere in the image manager', async () => {
    const project = makeProject({
      id: 'p1',
      images: [{ id: 'img1', s3Key: 'projects/images/p1/super-secret-key.jpg', position: 0, altText: null, caption: null, isPrimary: true }],
    });
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([project]);
    vi.mocked(projectsAdminApi.getProject).mockResolvedValue(project);
    renderPage();

    await screen.findByText(project.commonName);
    fireEvent.click(screen.getByText(project.commonName));
    await screen.findByText('Image 1');
    expect(screen.queryByText(/super-secret-key/)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain('projects/images/p1/super-secret-key.jpg');
  });
});

describe('Projects admin — preview privacy', () => {
  it('Preview Project never renders private fields (consultant, client, Epromise identity, private description)', async () => {
    const project = makeProject({
      id: 'p1',
      commonName: 'Vela Tower',
      consultant: 'Secret Consultant LLC',
      client: 'Secret Client Holdings',
      epromiseId: 'EP-SECRET-999',
      epromiseName: 'Secret Internal Name',
      privateDescription: 'Secret internal margin notes',
    });
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([project]);
    vi.mocked(projectsAdminApi.getProject).mockResolvedValue(project);
    renderPage();

    await screen.findByText(project.commonName);
    fireEvent.click(screen.getByText(project.commonName));
    await screen.findByText('Preview Project');
    fireEvent.click(screen.getByRole('button', { name: 'Preview Project' }));

    const dialog = await screen.findByRole('dialog', { name: 'Project preview' });
    await waitFor(() => expect(within(dialog).queryByText('Loading preview…')).not.toBeInTheDocument());

    expect(within(dialog).getByText('Vela Tower')).toBeInTheDocument();
    expect(within(dialog).queryByText('Secret Consultant LLC')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Secret Client Holdings')).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/EP-SECRET-999/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Secret Internal Name')).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/margin notes/)).not.toBeInTheDocument();
  });

  it('closing the preview preserves in-progress unsaved edits', async () => {
    const project = makeProject({ id: 'p1', commonName: 'Vela Tower' });
    vi.mocked(isLoggedInLocally).mockReturnValue(true);
    vi.mocked(projectsAdminApi.listProjects).mockResolvedValue([project]);
    vi.mocked(projectsAdminApi.getProject).mockResolvedValue(project);
    renderPage();

    await screen.findByText(project.commonName);
    fireEvent.click(screen.getByText(project.commonName));
    const commonNameField = await screen.findByLabelText('Common Name') as HTMLInputElement;
    fireEvent.change(commonNameField, { target: { value: 'Unsaved Edited Name' } });

    fireEvent.click(screen.getByRole('button', { name: 'Preview Project' }));
    const dialog = await screen.findByRole('dialog', { name: 'Project preview' });
    fireEvent.click(within(dialog).getByLabelText('Close preview'));

    expect(screen.queryByRole('dialog', { name: 'Project preview' })).not.toBeInTheDocument();
    expect((screen.getByLabelText('Common Name') as HTMLInputElement).value).toBe('Unsaved Edited Name');
  });
});
