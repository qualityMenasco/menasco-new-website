import { describe, it, expect } from 'vitest';
import { toPreviewProject, STRICTLY_PRIVATE_PROJECT_FIELDS } from './publicProjectPreview';
import type { AdminProject } from './types';

function collectAllKeysDeep(value: unknown, keys: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectAllKeysDeep(item, keys);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      keys.add(key);
      collectAllKeysDeep(val, keys);
    }
  }
  return keys;
}

const fullProject: AdminProject = {
  id: 'internal-uuid-1',
  epromiseId: 'EP-SECRET-001',
  epromiseName: 'Epromise Internal Codename',
  commonName: 'Vela by Omniyat',
  slug: 'vela-by-omniyat',
  projectClass: 'Residential',
  projectType: 'High-rise',
  category: 'residential',
  location: 'Business Bay',
  country: 'UAE',
  consultant: 'Confidential Consultant LLC',
  client: 'Confidential Client Holdings',
  completionDate: '2026-06-01',
  completionStatus: 'completed',
  publicDescription: 'A landmark residential tower.',
  privateDescription: 'Internal margin notes — never public.',
  durationMonths: 36,
  peakWorkforce: 1200,
  builtAreaSqm: 85000,
  valueAmount: 420_000_000,
  valueCurrency: 'AED',
  floors: 72,
  featured: true,
  status: 'published',
  metrics: [
    { id: 'metric-1', metricName: 'Built Area', metricValue: '85,000', metricUnit: 'm²', displayOrder: 1 },
    { id: 'metric-2', metricName: 'Workforce', metricValue: '1,200', metricUnit: 'people', displayOrder: 0 },
  ],
  images: [
    { id: 'image-1', s3Key: 'projects/images/internal-uuid-1/image-1.jpg', position: 0, altText: 'Tower at dusk', caption: null, isPrimary: true },
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-06-01T00:00:00.000Z',
};

describe('toPreviewProject — the same privacy allowlist as the real public API, enforced client-side', () => {
  it('includes only the allowlisted public fields', () => {
    const preview = toPreviewProject(fullProject, { 'image-1': 'https://s3.example/presigned-preview' });
    expect(Object.keys(preview).sort()).toEqual(
      [
        'slug',
        'commonName',
        'projectClass',
        'projectType',
        'category',
        'location',
        'country',
        'completionDate',
        'completionStatus',
        'publicDescription',
        'peakWorkforce',
        'builtAreaSqm',
        'floors',
        'featured',
        'metrics',
        'images',
      ].sort(),
    );
  });

  it.each(STRICTLY_PRIVATE_PROJECT_FIELDS)('never exposes the strictly-private field "%s" anywhere, including nested metrics/images', (forbiddenKey) => {
    const preview = toPreviewProject(fullProject, { 'image-1': 'https://s3.example/presigned-preview' });
    expect(collectAllKeysDeep(preview).has(forbiddenKey)).toBe(false);
  });

  it('never leaks the raw S3 key, consultant, client, private description, or Epromise identity in the serialized preview', () => {
    const serialized = JSON.stringify(toPreviewProject(fullProject, { 'image-1': 'https://s3.example/presigned-preview' }));
    expect(serialized).not.toContain('projects/images/internal-uuid-1');
    expect(serialized).not.toContain('Confidential Consultant');
    expect(serialized).not.toContain('Confidential Client');
    expect(serialized).not.toContain('Internal margin notes');
    expect(serialized).not.toContain('EP-SECRET-001');
    expect(serialized).not.toContain('Epromise Internal Codename');
    expect(serialized).not.toContain('420000000');
  });

  it('images expose only imageId (a resolved preview url), never s3Key', () => {
    const preview = toPreviewProject(fullProject, { 'image-1': 'https://s3.example/presigned-preview' });
    expect(preview.images[0]).toEqual({
      imageId: 'image-1',
      url: 'https://s3.example/presigned-preview',
      altText: 'Tower at dusk',
      caption: null,
      isPrimary: true,
      position: 0,
    });
    expect('s3Key' in preview.images[0]).toBe(false);
  });

  it('metrics are sorted by displayOrder regardless of input order', () => {
    const preview = toPreviewProject(fullProject, {});
    expect(preview.metrics.map((m) => m.metricName)).toEqual(['Workforce', 'Built Area']);
  });

  it('an image with no resolved preview url yet renders an empty url rather than throwing', () => {
    const preview = toPreviewProject(fullProject, {});
    expect(preview.images[0].url).toBe('');
  });
});
