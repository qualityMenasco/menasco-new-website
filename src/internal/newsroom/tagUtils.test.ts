import { describe, it, expect } from 'vitest';
import { addTopic, removeTopic, slugifyTopic, MAX_TOPICS, MAX_TOPIC_LENGTH } from './tagUtils';
import type { ArticleTag } from './types';

describe('slugifyTopic', () => {
  it('slugifies multi-word topics', () => {
    expect(slugifyTopic('Digital Coordination')).toBe('digital-coordination');
    expect(slugifyTopic('Mission Critical')).toBe('mission-critical');
    expect(slugifyTopic('MEP Prefabrication')).toBe('mep-prefabrication');
  });

  it('is case-insensitive', () => {
    expect(slugifyTopic('MEP')).toBe(slugifyTopic('mep'));
    expect(slugifyTopic('BIM')).toBe('bim');
  });

  it('collapses whitespace and trims', () => {
    expect(slugifyTopic('  Data   Centres  ')).toBe('data-centres');
  });
});

describe('addTopic', () => {
  it('adds a new topic with a computed slug', () => {
    const result = addTopic([], 'MEP');
    expect(result.error).toBeNull();
    expect(result.tags).toEqual([{ name: 'MEP', slug: 'mep' }]);
  });

  it('supports multi-word topics without forcing single-word SEO keywords', () => {
    const result = addTopic([], 'Digital Coordination');
    expect(result.tags).toEqual([{ name: 'Digital Coordination', slug: 'digital-coordination' }]);
  });

  it('trims surrounding whitespace', () => {
    const result = addTopic([], '   BIM   ');
    expect(result.tags[0]).toEqual({ name: 'BIM', slug: 'bim' });
  });

  it('ignores empty input without error', () => {
    const result = addTopic([], '   ');
    expect(result.tags).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('rejects a duplicate (exact case)', () => {
    const existing: ArticleTag[] = [{ name: 'MEP', slug: 'mep' }];
    const result = addTopic(existing, 'MEP');
    expect(result.tags).toBe(existing);
    expect(result.error).toMatch(/already been added/);
  });

  it('rejects a case-insensitive duplicate — "MEP" and "mep" collapse to one tag', () => {
    const existing: ArticleTag[] = [{ name: 'MEP', slug: 'mep' }];
    const result = addTopic(existing, 'mep');
    expect(result.tags).toBe(existing);
    expect(result.error).toMatch(/already been added/);
  });

  it('rejects a topic over the max length instead of truncating', () => {
    const longTopic = 'a'.repeat(MAX_TOPIC_LENGTH + 1);
    const result = addTopic([], longTopic);
    expect(result.tags).toEqual([]);
    expect(result.error).toMatch(new RegExp(`${MAX_TOPIC_LENGTH} characters or fewer`));
  });

  it('accepts a topic exactly at the max length', () => {
    const topic = 'a'.repeat(MAX_TOPIC_LENGTH);
    const result = addTopic([], topic);
    expect(result.error).toBeNull();
    expect(result.tags).toHaveLength(1);
  });

  it('enforces the maximum topic count with a validation message, not silent truncation', () => {
    const existing: ArticleTag[] = Array.from({ length: MAX_TOPICS }, (_, i) => ({ name: `Topic ${i}`, slug: `topic-${i}` }));
    const result = addTopic(existing, 'One more');
    expect(result.tags).toBe(existing);
    expect(result.error).toMatch(new RegExp(`up to ${MAX_TOPICS} topics`));
  });

  it('rejects a topic that slugifies to nothing (symbols only)', () => {
    const result = addTopic([], '###');
    expect(result.tags).toEqual([]);
    expect(result.error).toMatch(/at least one letter or number/);
  });
});

describe('removeTopic', () => {
  it('removes the topic at the given index', () => {
    const existing: ArticleTag[] = [
      { name: 'MEP', slug: 'mep' },
      { name: 'BIM', slug: 'bim' },
    ];
    expect(removeTopic(existing, 0)).toEqual([{ name: 'BIM', slug: 'bim' }]);
  });
});
