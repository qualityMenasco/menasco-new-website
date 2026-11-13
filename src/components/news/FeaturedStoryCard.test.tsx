import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeaturedStoryCard } from './FeaturedStoryCard';

function renderCard(props: Partial<Parameters<typeof FeaturedStoryCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <FeaturedStoryCard
        href="/newsroom/a"
        categoryLabel="Company News"
        date="01 Jan 2026"
        title="A Real Headline"
        subtitle="A real subtitle"
        readMoreLabel="Read more"
        {...props}
      />
    </MemoryRouter>,
  );
}

describe('FeaturedStoryCard — image (default, unchanged behavior)', () => {
  it('renders an <img>, not a <video>, and keeps the shared aspect-[4/3] box', () => {
    const { container } = renderCard({ image: '/mock/photo.jpg' });
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeInTheDocument();
  });
});

describe('FeaturedStoryCard — video', () => {
  it('renders a real <video> that autoplays muted and loops, not an <img>', () => {
    const { container } = renderCard({ image: '/mock/clip.mp4', mediaType: 'video' });
    const videoEl = container.querySelector('video');
    expect(videoEl).toBeInTheDocument();
    expect(videoEl).toHaveAttribute('src', '/mock/clip.mp4');
    expect(videoEl).toHaveAttribute('autoplay');
    expect((videoEl as HTMLVideoElement).muted).toBe(true);
    expect(videoEl).toHaveAttribute('loop');
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('defaults to the same aspect-[4/3] box as an image until orientation is known', () => {
    const { container } = renderCard({ image: '/mock/clip.mp4', mediaType: 'video' });
    expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeInTheDocument();
  });
});
