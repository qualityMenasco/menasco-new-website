import { describe, expect, it } from 'vitest';
import { parseProjectCsv, parseProjectJson, parseProjectUpload, ProjectUploadParseError } from './projectCsvJsonParser';

describe('parseProjectCsv', () => {
  it('parses a valid CSV with multiple rows and semicolon lists', () => {
    const csv = [
      'slug,title,location,services,gallery,featured,keyMetric1Label,keyMetric1Value,publishState',
      'new-tower,New Tower,"Dubai, UAE","MEP design;Fit-out","/a.jpg;/b.jpg",true,Workforce Hours,500000,draft',
      'casa-cavalli,,,,,,,,',
    ].join('\n');

    const rows = parseProjectCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      slug: 'new-tower',
      title: 'New Tower',
      location: 'Dubai, UAE',
      services: ['MEP design', 'Fit-out'],
      gallery: ['/a.jpg', '/b.jpg'],
      featured: true,
      publishState: 'draft',
      keyMetrics: [{ label: 'Workforce Hours', value: '500000' }],
    });
    expect(rows[1]).toEqual({ slug: 'casa-cavalli' });
  });

  it('parses AR fields from _ar columns', () => {
    const csv = ['slug,title,description_ar,sector_ar,services_ar', 'x,X,وصف,قطاع,خدمة1;خدمة2'].join('\n');
    const rows = parseProjectCsv(csv);
    expect(rows[0].ar).toEqual({ description: 'وصف', sector: 'قطاع', services: ['خدمة1', 'خدمة2'] });
  });

  it('parses an oldSlug rename column', () => {
    const csv = ['slug,oldSlug,title', 'new-slug,old-slug,Renamed'].join('\n');
    const rows = parseProjectCsv(csv);
    expect(rows[0]).toMatchObject({ slug: 'new-slug', oldSlug: 'old-slug', title: 'Renamed' });
  });

  it('throws on empty CSV', () => {
    expect(() => parseProjectCsv('')).toThrow(ProjectUploadParseError);
  });

  it('throws when the slug column is missing entirely', () => {
    expect(() => parseProjectCsv('title,location\nFoo,Bar')).toThrow(ProjectUploadParseError);
  });

  it('throws when a data row has an empty slug value', () => {
    expect(() => parseProjectCsv('slug,title\n,Foo')).toThrow(ProjectUploadParseError);
  });

  it('rejects an invalid publishState value', () => {
    expect(() => parseProjectCsv('slug,publishState\nfoo,nonsense')).toThrow(ProjectUploadParseError);
  });
});

describe('parseProjectJson', () => {
  it('parses a valid JSON array including nested keyMetrics and ar', () => {
    const json = JSON.stringify([
      {
        slug: 'new-tower',
        title: 'New Tower',
        services: ['A', 'B'],
        keyMetrics: [{ label: 'Workforce Hours', value: '500000' }],
        ar: { description: 'وصف', services: ['خدمة1'] },
        featured: true,
        publishState: 'published',
      },
    ]);
    const rows = parseProjectJson(json);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      slug: 'new-tower',
      title: 'New Tower',
      services: ['A', 'B'],
      keyMetrics: [{ label: 'Workforce Hours', value: '500000' }],
      ar: { description: 'وصف', services: ['خدمة1'] },
      featured: true,
      publishState: 'published',
    });
  });

  it('throws on malformed JSON text', () => {
    expect(() => parseProjectJson('{not valid json')).toThrow(ProjectUploadParseError);
  });

  it('throws when the top level is not an array', () => {
    expect(() => parseProjectJson(JSON.stringify({ slug: 'x' }))).toThrow(ProjectUploadParseError);
  });

  it('throws when an item is missing slug', () => {
    expect(() => parseProjectJson(JSON.stringify([{ title: 'No slug' }]))).toThrow(ProjectUploadParseError);
  });

  it('throws on an invalid keyMetrics entry shape', () => {
    expect(() => parseProjectJson(JSON.stringify([{ slug: 'x', keyMetrics: [{ label: 'Only label' }] }]))).toThrow(ProjectUploadParseError);
  });
});

describe('parseProjectUpload', () => {
  it('dispatches to CSV or JSON based on format', () => {
    expect(parseProjectUpload('slug,title\nx,X', 'csv')).toEqual([{ slug: 'x', title: 'X' }]);
    expect(parseProjectUpload(JSON.stringify([{ slug: 'x', title: 'X' }]), 'json')).toEqual([{ slug: 'x', title: 'X' }]);
  });

  it('throws on an unknown format', () => {
    // @ts-expect-error intentionally invalid format for the test
    expect(() => parseProjectUpload('x', 'xml')).toThrow(ProjectUploadParseError);
  });
});
