import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleImageGallery, type GalleryImage } from './ArticleImageGallery';

/**
 * Mock multi-image fixtures for local verification ONLY — never wired into
 * any real page/route, never shipped to Production. The real API
 * (`PublicArticleDetail.images`) already returns an array regardless of
 * length; this test proves the gallery itself correctly handles 0/1/many
 * without needing real multi-image admin/backend support to exist yet.
 */
const ONE_IMAGE: GalleryImage[] = [{ src: '/mock/image-1.jpg', alt: 'First image' }];
const THREE_IMAGES: GalleryImage[] = [
  { src: '/mock/image-1.jpg', alt: 'First image' },
  { src: '/mock/image-2.jpg', alt: 'Second image' },
  { src: '/mock/image-3.jpg', alt: 'Third image' },
];

const positionLabel = (current: number, total: number) => `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

function renderGallery(images: GalleryImage[]) {
  return render(
    <ArticleImageGallery images={images} previousLabel="Previous image" nextLabel="Next image" positionLabel={positionLabel} />,
  );
}

describe('ArticleImageGallery — 0 images', () => {
  it('renders nothing', () => {
    const { container } = renderGallery([]);
    expect(container.firstChild).toBeNull();
  });
});

describe('ArticleImageGallery — 1 image (current single-image article shape)', () => {
  it('renders the image with no navigation chrome', () => {
    renderGallery(ONE_IMAGE);
    expect(screen.getByAltText('First image')).toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  });

  it('shows no position counter', () => {
    renderGallery(ONE_IMAGE);
    expect(screen.queryByText(/01 \//)).not.toBeInTheDocument();
  });

  it('shows no dots of any kind', () => {
    const { container } = renderGallery(ONE_IMAGE);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});

describe('ArticleImageGallery — multiple images (mock data, local verification only)', () => {
  it('renders the first image initially', () => {
    renderGallery(THREE_IMAGES);
    expect(screen.getByAltText('First image')).toBeInTheDocument();
  });

  it('shows exactly prev/next arrows (no dots, no thumbnails)', () => {
    const { container } = renderGallery(THREE_IMAGES);
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    expect(container.querySelectorAll('button')).toHaveLength(2);
  });

  it('shows a zero-padded position counter', () => {
    renderGallery(THREE_IMAGES);
    expect(screen.getByText('01 / 03')).toBeInTheDocument();
  });

  it('next button advances to the second image and updates the counter', () => {
    renderGallery(THREE_IMAGES);
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('Second image')).toBeInTheDocument();
    expect(screen.getByText('02 / 03')).toBeInTheDocument();
  });

  it('does not wrap past the last image — Next is disabled on the last image', () => {
    renderGallery(THREE_IMAGES);
    fireEvent.click(screen.getByLabelText('Next image'));
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('Third image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('Third image')).toBeInTheDocument();
    expect(screen.getByText('03 / 03')).toBeInTheDocument();
  });

  it('does not wrap before the first image — Previous is disabled on the first image', () => {
    renderGallery(THREE_IMAGES);
    expect(screen.getByLabelText('Previous image')).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Previous image'));
    expect(screen.getByAltText('First image')).toBeInTheDocument();
    expect(screen.getByText('01 / 03')).toBeInTheDocument();
  });

  it('Previous re-enables once past the first image, Next re-enables once before the last', () => {
    renderGallery(THREE_IMAGES);
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByLabelText('Previous image')).toBeEnabled();
    expect(screen.getByLabelText('Next image')).toBeEnabled();
  });

  it('keyboard ArrowRight/ArrowLeft navigate the gallery and respect boundaries', () => {
    const { container } = renderGallery(THREE_IMAGES);
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.keyDown(wrapper, { key: 'ArrowLeft' });
    expect(screen.getByAltText('First image')).toBeInTheDocument();
    fireEvent.keyDown(wrapper, { key: 'ArrowRight' });
    expect(screen.getByAltText('Second image')).toBeInTheDocument();
    fireEvent.keyDown(wrapper, { key: 'ArrowRight' });
    expect(screen.getByAltText('Third image')).toBeInTheDocument();
    fireEvent.keyDown(wrapper, { key: 'ArrowRight' });
    expect(screen.getByAltText('Third image')).toBeInTheDocument();
  });

  it('touch swipe left advances to the next image (physical gesture, not RTL-dependent)', () => {
    const { container } = renderGallery(THREE_IMAGES);
    const imageBox = container.querySelector('.aspect-\\[16\\/10\\]') as HTMLElement;
    fireEvent.touchStart(imageBox, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(imageBox, { changedTouches: [{ clientX: 100 }] });
    expect(screen.getByAltText('Second image')).toBeInTheDocument();
  });

  it('touch swipe does not go past the last image', () => {
    const { container } = renderGallery(THREE_IMAGES);
    const imageBox = container.querySelector('.aspect-\\[16\\/10\\]') as HTMLElement;
    fireEvent.touchStart(imageBox, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(imageBox, { changedTouches: [{ clientX: 100 }] });
    fireEvent.touchStart(imageBox, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(imageBox, { changedTouches: [{ clientX: 100 }] });
    fireEvent.touchStart(imageBox, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(imageBox, { changedTouches: [{ clientX: 100 }] });
    expect(screen.getByAltText('Third image')).toBeInTheDocument();
  });

  it('a swipe shorter than the threshold does not navigate', () => {
    const { container } = renderGallery(THREE_IMAGES);
    const imageBox = container.querySelector('.aspect-\\[16\\/10\\]') as HTMLElement;
    fireEvent.touchStart(imageBox, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(imageBox, { changedTouches: [{ clientX: 190 }] });
    expect(screen.getByAltText('First image')).toBeInTheDocument();
  });
});

describe('ArticleImageGallery — aspect ratio matches the loading skeleton', () => {
  it('uses aspect-[16/10] to avoid a layout-shift mismatch with the skeleton placeholder', () => {
    const { container } = renderGallery(ONE_IMAGE);
    expect(container.querySelector('.aspect-\\[16\\/10\\]')).toBeInTheDocument();
  });
});
