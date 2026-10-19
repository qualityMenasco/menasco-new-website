import { describe, expect, it } from 'vitest';
import { getMainContractor, projects } from './projects';

describe('projects.json migration integrity', () => {
  it('preserves all 23 pre-CMS project records', () => {
    expect(projects).toHaveLength(23);
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
