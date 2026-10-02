import { describe, expect, it } from 'vitest';
import { getMainContractor, projects } from './projects';

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
