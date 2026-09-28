import { describe, it, expect } from 'vitest';
import {
  toPublicProject,
  toPublicProjectMetric,
  toPublicProjectImage,
  STRICTLY_PRIVATE_PROJECT_FIELDS,
} from './publicProjects';
import type { ProjectImageRow, ProjectMetricRow, ProjectRecordRow } from '../projects';

// `Omit<..., 'constructor'>`: RowDataPacket (the base interface every Row type
// extends) declares a real `constructor: { name: 'RowDataPacket' }` property —
// a plain object literal's inherited Object.prototype.constructor doesn't
// structurally match that narrow branded type under TS's fresh-object-literal
// checking. Excluded here since these tests never touch it; the final
// `as ...Row` cast still produces a fully-typed row for the real function
// signatures. Same pattern as api/_lib/articles.schedule.test.ts's makeArticle.
function makeProjectRecord(overrides: Partial<Omit<ProjectRecordRow, 'constructor'>> = {}): ProjectRecordRow {
  return {
    id: 'project-1',
    epromise_id: 'EP-001',
    epromise_name: 'Epromise Internal Name',
    common_name: 'Vela by Omniyat',
    slug: 'vela-by-omniyat',
    project_class: 'Residential',
    project_type: 'High-rise',
    category: 'residential',
    location: 'Business Bay',
    country: 'UAE',
    consultant: 'Secret Consultant LLC',
    client: 'Secret Client Holdings',
    completion_date: new Date('2026-06-01T00:00:00.000Z'),
    completion_status: 'completed',
    public_description: 'A landmark residential tower.',
    private_description: 'Internal margin notes — never public.',
    duration_months: 36,
    peak_workforce: 1200,
    built_area_sqm: 85000,
    value_amount: 420_000_000,
    value_currency: 'AED',
    floors: 72,
    featured: 1,
    status: 'published',
    created_at: new Date('2025-01-01T00:00:00.000Z'),
    updated_at: new Date('2025-06-01T00:00:00.000Z'),
    ...overrides,
  } as ProjectRecordRow;
}

function makeProjectMetric(overrides: Partial<Omit<ProjectMetricRow, 'constructor'>> = {}): ProjectMetricRow {
  return {
    id: 'metric-1',
    project_id: 'project-1',
    metric_name: 'Built Area',
    metric_value: '85,000',
    metric_unit: 'm²',
    display_order: 0,
    created_at: new Date('2025-01-01T00:00:00.000Z'),
    updated_at: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  } as ProjectMetricRow;
}

function makeProjectImage(overrides: Partial<Omit<ProjectImageRow, 'constructor'>> = {}): ProjectImageRow {
  return {
    id: 'image-1',
    project_id: 'project-1',
    s3_key: 'projects/images/project-1/image-1.jpg',
    position: 0,
    alt_text: 'The tower at dusk',
    caption: 'Hero shot',
    is_primary: 1,
    created_at: new Date('2025-01-01T00:00:00.000Z'),
    updated_at: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  } as ProjectImageRow;
}

/** Recursively collects every object key anywhere in a value — the actual mechanism the security regression tests below (and, later, the real Projects API's own tests) use to prove a forbidden field never appears, at any depth, under any name. */
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

describe('toPublicProjectMetric', () => {
  it('includes only the allowlisted public metric fields', () => {
    const result = toPublicProjectMetric(makeProjectMetric());
    expect(result).toEqual({
      metricName: 'Built Area',
      metricValue: '85,000',
      metricUnit: 'm²',
      displayOrder: 0,
    });
  });

  it('never includes the metric row\'s own id, project_id, or timestamps', () => {
    const keys = collectAllKeysDeep(toPublicProjectMetric(makeProjectMetric()));
    for (const forbidden of ['id', 'project_id', 'projectId', 'created_at', 'createdAt', 'updated_at', 'updatedAt']) {
      expect(keys.has(forbidden)).toBe(false);
    }
  });
});

describe('toPublicProjectImage', () => {
  it('includes only the allowlisted public image fields, keyed by imageId rather than id', () => {
    const result = toPublicProjectImage(makeProjectImage());
    expect(result).toEqual({
      imageId: 'image-1',
      url: '/api/projects/public/images/image-1',
      altText: 'The tower at dusk',
      caption: 'Hero shot',
      isPrimary: true,
      position: 0,
    });
  });

  it('never includes the raw S3 key, in either naming form', () => {
    const serialized = JSON.stringify(toPublicProjectImage(makeProjectImage()));
    expect(serialized).not.toContain('s3_key');
    expect(serialized).not.toContain('s3Key');
    expect(serialized).not.toContain('projects/images/project-1/image-1.jpg');
  });

  it('never includes a bare "id" key — only the explicitly-named imageId', () => {
    const keys = collectAllKeysDeep(toPublicProjectImage(makeProjectImage()));
    expect(keys.has('id')).toBe(false);
    expect(keys.has('imageId')).toBe(true);
  });
});

describe('toPublicProject — the locked Projects privacy model', () => {
  it('includes exactly the allowlisted public fields, nothing more', () => {
    const result = toPublicProject(makeProjectRecord(), [makeProjectMetric()], [makeProjectImage()]);
    expect(Object.keys(result).sort()).toEqual(
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

  it('uses slug as the identifier, never the internal id/epromise_id/epromise_name', () => {
    const result = toPublicProject(makeProjectRecord(), [], []);
    expect(result.slug).toBe('vela-by-omniyat');
  });

  it.each(STRICTLY_PRIVATE_PROJECT_FIELDS)('never exposes the strictly-private field "%s" anywhere in the response, including nested metrics/images', (forbiddenKey) => {
    const result = toPublicProject(makeProjectRecord(), [makeProjectMetric()], [makeProjectImage()]);
    const keys = collectAllKeysDeep(result);
    expect(keys.has(forbiddenKey)).toBe(false);
  });

  it('never leaks the private description, consultant, client, or raw value anywhere in the serialized output', () => {
    const serialized = JSON.stringify(toPublicProject(makeProjectRecord(), [], []));
    expect(serialized).not.toContain('Internal margin notes');
    expect(serialized).not.toContain('Secret Consultant');
    expect(serialized).not.toContain('Secret Client');
    expect(serialized).not.toContain('420000000');
    expect(serialized).not.toContain('EP-001');
    expect(serialized).not.toContain('Epromise Internal Name');
  });

  it('handles a project with no metrics or images', () => {
    const result = toPublicProject(makeProjectRecord(), [], []);
    expect(result.metrics).toEqual([]);
    expect(result.images).toEqual([]);
  });

  it('renders completionDate as a plain YYYY-MM-DD, or null when unset', () => {
    expect(toPublicProject(makeProjectRecord(), [], []).completionDate).toBe('2026-06-01');
    expect(toPublicProject(makeProjectRecord({ completion_date: null }), [], []).completionDate).toBeNull();
  });
});
