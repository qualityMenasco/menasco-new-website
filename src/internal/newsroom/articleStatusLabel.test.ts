import { describe, it, expect } from 'vitest';
import { adminStatusLabel, adminStatusBadgeClassName } from './articleStatusLabel';
import type { ArticleStatus } from './types';

describe('adminStatusLabel', () => {
  it.each<[ArticleStatus, string]>([
    ['draft', 'Draft'],
    ['ready', 'Draft'],
    ['failed', 'Draft'],
    ['processing', 'Processing…'],
    ['published', 'Published'],
  ])('maps backend status "%s" to admin-visible label "%s"', (status, expected) => {
    expect(adminStatusLabel(status)).toBe(expected);
  });

  it('never surfaces the raw backend status word "ready" to editors', () => {
    const statuses: ArticleStatus[] = ['draft', 'processing', 'ready', 'published', 'failed'];
    for (const status of statuses) {
      expect(adminStatusLabel(status)).not.toMatch(/ready/i);
    }
  });

  it('collapses every non-published status to a value distinct from "Published"', () => {
    const nonPublished: ArticleStatus[] = ['draft', 'processing', 'ready', 'failed'];
    for (const status of nonPublished) {
      expect(adminStatusLabel(status)).not.toBe('Published');
    }
  });
});

describe('adminStatusBadgeClassName', () => {
  it('gives Published a distinct color from Draft/Processing', () => {
    expect(adminStatusBadgeClassName('published')).not.toBe(adminStatusBadgeClassName('draft'));
  });

  it('gives Processing its own transient color, distinct from plain Draft', () => {
    expect(adminStatusBadgeClassName('processing')).not.toBe(adminStatusBadgeClassName('draft'));
  });

  it('draft/ready/failed share the same Draft styling', () => {
    expect(adminStatusBadgeClassName('draft')).toBe(adminStatusBadgeClassName('ready'));
    expect(adminStatusBadgeClassName('draft')).toBe(adminStatusBadgeClassName('failed'));
  });
});
