import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleStructuredContent } from './ArticleStructuredContent';
import type { ArticleSection, ContentBlock, PublicImage } from '../../lib/newsroomPublicApi';

const image: PublicImage = { id: 'img-1', position: 0, mediaType: 'image', altText: 'A real photo', caption: 'A caption', role: null, url: '/api/newsroom/public/images/img-1' };
const video: PublicImage = { id: 'vid-1', position: 0, mediaType: 'video', altText: null, caption: 'A video caption', role: null, url: 'https://s3.example.com/vid-1.mp4?presigned=1' };

function section(blocks: ContentBlock[], heading?: string): ArticleSection {
  return heading ? { heading, blocks } : { blocks };
}

describe('ArticleStructuredContent', () => {
  it('renders every schema block type', () => {
    const sections: ArticleSection[] = [
      section([
        { type: 'paragraph', text: 'A real paragraph.' },
        { type: 'heading', text: 'A real heading', level: 3 },
        { type: 'bullet_list', items: ['Point one', 'Point two'] },
        { type: 'numbered_list', items: ['Step one', 'Step two'] },
        { type: 'quote', text: 'A real quote.' },
        { type: 'image', imageId: 'img-1' },
      ]),
    ];
    render(<ArticleStructuredContent sections={sections} images={[image]} />);

    expect(screen.getByText('A real paragraph.')).toBeInTheDocument();
    expect(screen.getByText('A real heading')).toBeInTheDocument();
    expect(screen.getByText('Point one')).toBeInTheDocument();
    expect(screen.getByText('Step one')).toBeInTheDocument();
    expect(screen.getByText('A real quote.')).toBeInTheDocument();
    const img = screen.getByAltText('A real photo');
    expect(img).toBeInTheDocument();
  });

  it('resolves an image block through the public image proxy URL — never a raw/private S3 path', () => {
    const sections = [section([{ type: 'image', imageId: 'img-1' }])];
    render(<ArticleStructuredContent sections={sections} images={[image]} />);
    const img = screen.getByAltText('A real photo');
    expect(img).toHaveAttribute('src', '/api/newsroom/public/images/img-1');
    expect(img.getAttribute('src')).not.toMatch(/s3\.amazonaws\.com|newsroom\/articles\//);
  });

  it('renders a section heading when present', () => {
    const sections = [section([{ type: 'paragraph', text: 'Body text.' }], 'A Section Heading')];
    render(<ArticleStructuredContent sections={sections} images={[]} />);
    expect(screen.getByText('A Section Heading')).toBeInTheDocument();
  });

  it('an image block referencing a missing/unknown imageId renders nothing for that block, without crashing the page', () => {
    const sections = [section([{ type: 'paragraph', text: 'Before.' }, { type: 'image', imageId: 'does-not-exist' }, { type: 'paragraph', text: 'After.' }])];
    expect(() => render(<ArticleStructuredContent sections={sections} images={[image]} />)).not.toThrow();
    expect(screen.getByText('Before.')).toBeInTheDocument();
    expect(screen.getByText('After.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('an unsupported/unknown block type is skipped, not rendered as raw HTML, and does not crash the page', () => {
    const sections = [
      section([
        { type: 'paragraph', text: 'Before the unknown block.' },
        // Real API responses aren't compile-time-checked — a future/unrecognized block type must degrade safely, not crash the article page.
        { type: 'video', url: 'https://example.com/clip.mp4' } as unknown as ContentBlock,
        { type: 'paragraph', text: 'After the unknown block.' },
      ]),
    ];
    expect(() => render(<ArticleStructuredContent sections={sections} images={[]} />)).not.toThrow();
    expect(screen.getByText('Before the unknown block.')).toBeInTheDocument();
    expect(screen.getByText('After the unknown block.')).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('<video');
    expect(document.body.innerHTML).not.toContain('example.com/clip.mp4');
  });

  it('renders the mobile variant with plain semantic tags, same content', () => {
    const sections = [section([{ type: 'paragraph', text: 'Mobile body text.' }], 'Mobile Heading')];
    render(<ArticleStructuredContent sections={sections} images={[]} mobile />);
    expect(screen.getByText('Mobile body text.')).toBeInTheDocument();
    expect(screen.getByText('Mobile Heading')).toBeInTheDocument();
  });

  it('linkifies a bare URL in paragraph text as a real, safe <a>, stripping trailing sentence punctuation from the href', () => {
    const sections = [section([{ type: 'paragraph', text: 'See https://menasco.com/press. for details.' }])];
    render(<ArticleStructuredContent sections={sections} images={[]} />);
    const link = screen.getByRole('link', { name: 'https://menasco.com/press' });
    expect(link).toHaveAttribute('href', 'https://menasco.com/press');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(/for details\.$/)).toBeInTheDocument();
  });

  it('renders markdown-style [label](url) links with custom link text, in paragraphs, quotes, and list items', () => {
    const sections = [
      section([
        { type: 'paragraph', text: 'Read the [full announcement](https://menasco.com/news/1) here.' },
        { type: 'quote', text: 'See [our profile](https://menasco.com/profile.pdf) for more.' },
        { type: 'bullet_list', items: ['Visit [the site](https://menasco.com)'] },
      ]),
    ];
    render(<ArticleStructuredContent sections={sections} images={[]} />);
    expect(screen.getByRole('link', { name: 'full announcement' })).toHaveAttribute('href', 'https://menasco.com/news/1');
    expect(screen.getByRole('link', { name: 'our profile' })).toHaveAttribute('href', 'https://menasco.com/profile.pdf');
    expect(screen.getByRole('link', { name: 'the site' })).toHaveAttribute('href', 'https://menasco.com');
  });

  it('never linkifies a non-http(s) scheme (e.g. javascript:) — it stays plain text', () => {
    const sections = [section([{ type: 'paragraph', text: 'Click [here](javascript:alert(1)) now.' }])];
    render(<ArticleStructuredContent sections={sections} images={[]} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Click [here](javascript:alert(1)) now.')).toBeInTheDocument();
  });

  it('an "image" block referencing a video-type media item renders a real <video>, not an <img>, with controls and the right src', () => {
    const sections = [section([{ type: 'image', imageId: 'vid-1', caption: 'A block caption' }])];
    const { container } = render(<ArticleStructuredContent sections={sections} images={[video]} />);
    const videoEl = container.querySelector('video');
    expect(videoEl).toBeInTheDocument();
    expect(videoEl).toHaveAttribute('src', video.url);
    expect(videoEl).toHaveAttribute('controls');
    expect(videoEl).toHaveAttribute('playsinline');
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByText('A block caption')).toBeInTheDocument();
  });

  it('falls back to the media item\'s own caption when the block has none', () => {
    const sections = [section([{ type: 'image', imageId: 'vid-1' }])];
    render(<ArticleStructuredContent sections={sections} images={[video]} />);
    expect(screen.getByText('A video caption')).toBeInTheDocument();
  });

  it('the mobile variant renders a video the same way (no figcaption, matching the existing mobile image convention)', () => {
    const sections = [section([{ type: 'image', imageId: 'vid-1', caption: 'Should not render on mobile' }])];
    const { container } = render(<ArticleStructuredContent sections={sections} images={[video]} mobile />);
    expect(container.querySelector('video')).toBeInTheDocument();
    expect(screen.queryByText('Should not render on mobile')).not.toBeInTheDocument();
  });
});
