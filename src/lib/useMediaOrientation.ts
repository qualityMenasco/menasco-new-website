import { useState } from 'react';

export type MediaOrientation = 'landscape' | 'portrait';

/**
 * Detects whether an `<img>`/`<video>` is landscape or portrait from its own
 * intrinsic dimensions, so a container can size/fit itself accordingly.
 * Deliberately client-side, not a stored DB column: the browser already has
 * to load the media element to render it, so reading `naturalWidth`/
 * `naturalHeight` (image) or `videoWidth`/`videoHeight` (video) at that point
 * is free — storing orientation server-side would mean either trusting an
 * unverified client-reported value at upload time or adding real video
 * probing (ffprobe) to the Lambda, a separate infra change this doesn't need.
 *
 * `null` until the first dimensions are known — callers should render a
 * sensible default box (e.g. today's existing fixed aspect ratio) while
 * `orientation` is still `null`, then switch once it resolves, rather than
 * blocking render on it.
 */
export function useMediaOrientation() {
  const [orientation, setOrientation] = useState<MediaOrientation | null>(null);

  const reportDimensions = (width: number, height: number) => {
    if (width > 0 && height > 0) setOrientation(width >= height ? 'landscape' : 'portrait');
  };

  const onImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    reportDimensions(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight);
  };

  const onVideoLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    reportDimensions(event.currentTarget.videoWidth, event.currentTarget.videoHeight);
  };

  return { orientation, onImageLoad, onVideoLoadedMetadata };
}
