import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectGalleryCarousel, type ProjectGalleryImage } from './ProjectGalleryCarousel';

const ONE_IMAGE: ProjectGalleryImage[] = [{ src: '/mock/hero.jpg', alt: 'Project Hero' }];
const THREE_IMAGES: ProjectGalleryImage[] = [
  { src: '/mock/image-1.jpg', alt: 'First image' },
  { src: '/mock/image-2.jpg', alt: 'Second image' },
  { src: '/mock/image-3.jpg', alt: 'Third image' },
];

const dotLabel = (index: number) => `Go to image ${index + 1}`;

function renderCarousel(images: ProjectGalleryImage[]) {
  return render(<ProjectGalleryCarousel images={images} previousLabel="Previous image" nextLabel="Next image" dotLabel={dotLabel} />);
}

describe('ProjectGalleryCarousel — empty gallery (hero-image-only fallback)', () => {
  it('renders nothing when given an empty array — the caller is responsible for the hero-image fallback slide', () => {
    const { container } = renderCarousel([]);
    expect(container.firstChild).toBeNull();
  });
});

describe('ProjectGalleryCarousel — single image (gallery falls back to the hero image)', () => {
  it('renders the image with no arrows or dots', () => {
    renderCarousel(ONE_IMAGE);
    expect(screen.getByAltText('Project Hero')).toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Go to image/)).not.toBeInTheDocument();
  });
});

describe('ProjectGalleryCarousel — multiple images', () => {
  it('renders arrows and one dot per image', () => {
    renderCarousel(THREE_IMAGES);
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to image 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to image 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to image 3')).toBeInTheDocument();
  });

  it('Next advances to the next image', () => {
    renderCarousel(THREE_IMAGES);
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('Second image')).toBeInTheDocument();
  });

  it('Next wraps around from the last image back to the first', () => {
    renderCarousel(THREE_IMAGES);
    fireEvent.click(screen.getByLabelText('Next image'));
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('Third image')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('First image')).toBeInTheDocument();
  });

  it('Previous wraps around from the first image back to the last', () => {
    renderCarousel(THREE_IMAGES);
    fireEvent.click(screen.getByLabelText('Previous image'));
    expect(screen.getByAltText('Third image')).toBeInTheDocument();
  });

  it('clicking a dot jumps directly to that image', () => {
    renderCarousel(THREE_IMAGES);
    fireEvent.click(screen.getByLabelText('Go to image 3'));
    expect(screen.getByAltText('Third image')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Go to image 1'));
    expect(screen.getByAltText('First image')).toBeInTheDocument();
  });
});
