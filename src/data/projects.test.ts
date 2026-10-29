import { describe, expect, it } from 'vitest';
import { deriveCapacityBadge, getMainContractor, projects } from './projects';

describe('projects.json migration integrity', () => {
  it('never drops below the 23 pre-CMS project records (src/data/projects.json is now live-edited via the Projects CMS, so new additions are expected and this only guards against accidental data loss)', () => {
    expect(projects.length).toBeGreaterThanOrEqual(23);
  });

  it('flags only vela-by-omniyat and qiddiya as protected — the two slugs hardcoded into ProjectDetailPage.tsx\'s CINEMATIC_PROJECTS map', () => {
    const protectedSlugs = projects.filter((p) => p.protected).map((p) => p.slug).sort();
    expect(protectedSlugs).toEqual(['qiddiya', 'vela-by-omniyat']);
  });

  it('defaults every pre-CMS project to publishState "published", preserving current live/indexed behavior', () => {
    expect(projects.every((p) => p.publishState === 'published')).toBe(true);
  });

  it('every project has a keyMetrics array (possibly empty, never undefined)', () => {
    expect(projects.every((p) => Array.isArray(p.keyMetrics))).toBe(true);
  });

  it('spot-checks a known verified value survived the migration unchanged', () => {
    const casaCavalli = projects.find((p) => p.slug === 'casa-cavalli');
    expect(casaCavalli?.keyMetrics).toContainEqual({ label: 'Workforce Hours', value: '1,661,538 hours' });
    expect(casaCavalli?.heroImage).toBe('https://menascouae.com/wp-content/uploads/2025/12/Casa-Cavalli-scaled.png');
  });
});

describe('getMainContractor', () => {
  it('defaults to MENASCO for a project with no mainContractor set — the case every future project starts in via draftProject()', () => {
    expect(getMainContractor({ mainContractor: '' })).toBe('MENASCO');
  });

  it('respects an explicit override rather than forcing MENASCO', () => {
    expect(getMainContractor({ mainContractor: 'Some Other Co.' })).toBe('Some Other Co.');
  });

  it('every current project resolves to MENASCO today, since none has overridden mainContractor', () => {
    for (const project of projects) {
      expect(getMainContractor(project)).toBe('MENASCO');
    }
  });
});

describe('deriveCapacityBadge', () => {
  it('respects an explicit capacity override over everything else', () => {
    expect(deriveCapacityBadge({ capacity: '99 MW IT', keyMetrics: [{ label: 'Voltage', value: '132/11 kV' }] })).toBe('99 MW IT');
  });

  it('derives an IT-capacity badge from keyMetrics, appending "IT" when the value does not already say it', () => {
    expect(deriveCapacityBadge({ capacity: undefined, keyMetrics: [{ label: 'IT Capacity', value: '18 MW' }] })).toBe('18 MW IT');
  });

  it('does not double up "IT" when the keyMetric value already includes it', () => {
    expect(deriveCapacityBadge({ capacity: undefined, keyMetrics: [{ label: 'IT Capacity', value: '18 MW IT' }] })).toBe('18 MW IT');
  });

  it('derives a voltage badge as-is, with no suffix, for substation projects', () => {
    expect(deriveCapacityBadge({ capacity: undefined, keyMetrics: [{ label: 'Voltage', value: '132/11 kV' }] })).toBe('132/11 kV');
  });

  it('prefers IT capacity over voltage when (implausibly) both are present', () => {
    expect(
      deriveCapacityBadge({
        capacity: undefined,
        keyMetrics: [
          { label: 'Voltage', value: '132/11 kV' },
          { label: 'IT Capacity', value: '18 MW' },
        ],
      }),
    ).toBe('18 MW IT');
  });

  it('returns undefined when neither capacity nor a matching keyMetric exists', () => {
    expect(deriveCapacityBadge({ capacity: undefined, keyMetrics: [{ label: 'Units', value: '417' }] })).toBeUndefined();
    expect(deriveCapacityBadge({ capacity: undefined, keyMetrics: [] })).toBeUndefined();
  });

  it('matches every existing data-centre project\'s own stored capacity value', () => {
    for (const project of projects) {
      if (project.capacity) {
        expect(deriveCapacityBadge(project)).toBe(project.capacity);
      }
    }
  });
});
