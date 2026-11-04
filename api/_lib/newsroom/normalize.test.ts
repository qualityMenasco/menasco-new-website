import { describe, it, expect } from 'vitest';
import { normalizeToSections } from './normalize';
import type { CleanedPage } from './textClean';

function page(lines: string[], pageNumber = 1): CleanedPage {
  return { pageNumber, lines };
}

describe('normalizeToSections — English headings (regression)', () => {
  it('still detects a Title Case English heading', () => {
    const sections = normalizeToSections([page(['Project Update', 'This is the body text that follows the heading.'])]);
    expect(sections[0].heading).toBe('Project Update');
  });

  it('does not treat an ordinary sentence-case line as a heading', () => {
    const sections = normalizeToSections([page(['This controlled document is being used to verify extraction.'])]);
    expect(sections[0].heading).toBeUndefined();
  });
});

describe('normalizeToSections — Arabic headings (the bug: /^[A-Z0-9À-Ü]/ rejected every Arabic line)', () => {
  it('detects a short standalone Arabic line as a heading', () => {
    const sections = normalizeToSections([page(['تقرير المشروع', 'هذا نص الفقرة الذي يلي العنوان في التقرير الكامل.'])]);
    expect(sections[0].heading).toBe('تقرير المشروع');
  });

  it('does not classify a long Arabic sentence as a heading (avoids over-classifying every short-ish Arabic line)', () => {
    const sections = normalizeToSections([
      page(['هذه فقرة طويلة تحتوي على عدد كبير من الكلمات العربية ولا يجب اعتبارها عنواناً بأي شكل من الأشكال لأنها جملة كاملة.']),
    ]);
    expect(sections[0].heading).toBeUndefined();
  });

  it('does not classify an Arabic line ending in terminal punctuation as a heading', () => {
    const sections = normalizeToSections([page(['هذا سؤال؟', 'نص الفقرة التالية.'])]);
    expect(sections[0].heading).toBeUndefined();
  });

  it('decides a mixed-language short line by majority script (Arabic-dominant with an embedded English brand name)', () => {
    const sections = normalizeToSections([page(['تقرير MENASCO لعام 2026', 'نص الفقرة الذي يلي العنوان.'])]);
    expect(sections[0].heading).toBe('تقرير MENASCO لعام 2026');
  });
});

describe('normalizeToSections — paragraph boundaries', () => {
  it('flushes an Arabic paragraph ending in the Arabic question mark (؟), not just ASCII "?"', () => {
    const sections = normalizeToSections([page(['ما هي الخطوات القادمة؟', 'هذه فقرة جديدة منفصلة تماماً عن السابقة.'])]);
    const paragraphs = sections[0].blocks.filter((b) => b.type === 'paragraph');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toMatchObject({ text: 'ما هي الخطوات القادمة؟' });
  });

  it('keeps a mixed Arabic-English paragraph as one block, not split', () => {
    const sections = normalizeToSections([page(['تقرير MENASCO لعام 2026 يغطي التقدم المحرز في المشروع بالكامل.'])]);
    const paragraphs = sections[0].blocks.filter((b) => b.type === 'paragraph');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toMatchObject({ text: 'تقرير MENASCO لعام 2026 يغطي التقدم المحرز في المشروع بالكامل.' });
  });

  it('keeps a number/date embedded mid-sentence in an Arabic paragraph intact, without starting a new section', () => {
    const sections = normalizeToSections([page(['بدأ المشروع في عام 2024 ومن المتوقع أن ينتهي في عام 2026.'])]);
    expect(sections).toHaveLength(1);
    expect(sections[0].heading).toBeUndefined();
    const paragraphs = sections[0].blocks.filter((b) => b.type === 'paragraph');
    expect(paragraphs[0]).toMatchObject({ text: 'بدأ المشروع في عام 2024 ومن المتوقع أن ينتهي في عام 2026.' });
  });
});

describe('normalizeToSections — lists, English (regression) and Arabic (new)', () => {
  it('still builds an English bullet list', () => {
    const sections = normalizeToSections([page(['- Planning', '- Execution', '- Review'])]);
    expect(sections[0].blocks[0]).toMatchObject({ type: 'bullet_list', items: ['Planning', 'Execution', 'Review'] });
  });

  it('builds an Arabic bullet list, preserving Arabic item text exactly', () => {
    const sections = normalizeToSections([page(['- التخطيط', '- التنفيذ', '- المراجعة'])]);
    expect(sections[0].blocks[0]).toMatchObject({ type: 'bullet_list', items: ['التخطيط', 'التنفيذ', 'المراجعة'] });
  });

  it('still builds an English numbered list with ASCII digits', () => {
    const sections = normalizeToSections([page(['1. Phase One', '2. Phase Two'])]);
    expect(sections[0].blocks[0]).toMatchObject({ type: 'numbered_list', items: ['Phase One', 'Phase Two'] });
  });

  it('builds a numbered list using Eastern Arabic-Indic digits (١. ٢. …)', () => {
    const sections = normalizeToSections([page(['١. المرحلة الأولى', '٢. المرحلة الثانية'])]);
    expect(sections[0].blocks[0]).toMatchObject({ type: 'numbered_list', items: ['المرحلة الأولى', 'المرحلة الثانية'] });
  });
});
