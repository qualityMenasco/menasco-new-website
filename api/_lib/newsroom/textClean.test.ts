import { describe, it, expect } from 'vitest';
import { cleanExtractedPages } from './textClean';

describe('cleanExtractedPages — page-number stripping, Arabic coverage', () => {
  it('still strips ASCII "Page X of Y" boilerplate (regression)', () => {
    const cleaned = cleanExtractedPages(['Report Title\nPage 3 of 12\nReal body text.']);
    expect(cleaned[0].lines).not.toContain('Page 3 of 12');
    expect(cleaned[0].lines).toContain('Real body text.');
  });

  it('strips an Eastern Arabic-Indic numeral used as a standalone page number', () => {
    const cleaned = cleanExtractedPages(['محتوى حقيقي.\n٣']);
    expect(cleaned[0].lines).not.toContain('٣');
    expect(cleaned[0].lines).toContain('محتوى حقيقي.');
  });

  it('strips "صفحة X من Y" (Arabic for "Page X of Y")', () => {
    const cleaned = cleanExtractedPages(['محتوى حقيقي.\nصفحة ٣ من ١٢']);
    expect(cleaned[0].lines).not.toContain('صفحة ٣ من ١٢');
    expect(cleaned[0].lines).toContain('محتوى حقيقي.');
  });

  it('does not mistake a real short Arabic sentence for a page-number line', () => {
    const cleaned = cleanExtractedPages(['هذا نص حقيقي وليس رقم صفحة.']);
    expect(cleaned[0].lines).toContain('هذا نص حقيقي وليس رقم صفحة.');
  });
});

describe('cleanExtractedPages — repeated header/footer removal is language-agnostic', () => {
  it('strips an Arabic running header repeated across most pages', () => {
    const cleaned = cleanExtractedPages([
      'منسكو الأخبار\nمحتوى الصفحة الأولى.',
      'منسكو الأخبار\nمحتوى الصفحة الثانية.',
      'منسكو الأخبار\nمحتوى الصفحة الثالثة.',
    ]);
    for (const page of cleaned) {
      expect(page.lines).not.toContain('منسكو الأخبار');
    }
  });
});

describe('cleanExtractedPages — Arabic punctuation and content are preserved', () => {
  it('keeps the Arabic question mark (؟) intact', () => {
    const cleaned = cleanExtractedPages(['ما هي الخطوات القادمة؟']);
    expect(cleaned[0].lines).toContain('ما هي الخطوات القادمة؟');
  });

  it('keeps the Arabic comma (،) intact', () => {
    const cleaned = cleanExtractedPages(['أولاً، ثانياً، ثالثاً.']);
    expect(cleaned[0].lines).toContain('أولاً، ثانياً، ثالثاً.');
  });

  it('keeps a mixed Arabic/English line fully intact', () => {
    const cleaned = cleanExtractedPages(['تقرير MENASCO لعام 2026.']);
    expect(cleaned[0].lines).toContain('تقرير MENASCO لعام 2026.');
  });
});

describe('cleanExtractedPages — English hyphenation merge still works (regression) and never fires into Arabic', () => {
  it('merges an English hyphenated line-wrap', () => {
    const cleaned = cleanExtractedPages(['This is a well-\nknown fact.']);
    expect(cleaned[0].lines).toContain('This is a wellknown fact.');
  });

  it('does not merge when the line ending in "-" is followed by an Arabic line', () => {
    const cleaned = cleanExtractedPages(['Some text-\nمحتوى عربي.']);
    expect(cleaned[0].lines).toEqual(['Some text-', 'محتوى عربي.']);
  });
});
