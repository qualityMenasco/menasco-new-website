import { useState } from 'react';

export type MediaOrientation = 'landscape' | 'portrait';

/**
 * Detects an `<img>`/`<video>`'s own real aspect ratio (and derived
 * landscape/portrait orientation) from its intrinsic dimensions, so a
 * container can size itself to EXACTLY match the content instead of
 * guessing from a fixed small set of boxes. A fixed landscape-vs-portrait
 * bucket (e.g. always 4:3 or always 3:4) still leaves visible letterboxing
 * bars whenever the real clip's ratio doesn't match that bucket exactly —
 * a 9:19.5 phone screen-recording in a 3:4 box, for instance — so callers
 * should apply `aspectRatio` as an inline style (which overrides any
 * default Tailwind `aspect-[...]` className used as the loading placeholder)
 * rather than switching between a couple of preset classes.
 *
 * Deliberately client-side, not a stored DB column: the browser already has
 * to load the media element to render it, so reading `naturalWidth`/
 * `naturalHeight` (image) or `videoWidth`/`videoHeight` (video) at that point
 * is free — storing it server-side would mean either trusting an unverified
 * client-reported value at upload time or adding real video probing
 * (ffprobe) to the Lambda, a separate infra change this doesn't need.
 *
 * `null` until the first dimensions are known — callers should render a
 * sensible default box (e.g. today's existing fixed aspect ratio class)
 * while `aspectRatio` is still `null`, then switch once it resolves, rather
 * than blocking render on it.
 */
export function useMediaOrientation() {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const reportDimensions = (width: number, height: number) => {
    if (width > 0 && height > 0) setAspectRatio(width / height);
  };

  const onImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    reportDimensions(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight);
  };

  const onVideoLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    reportDimensions(event.currentTarget.videoWidth, event.currentTarget.videoHeight);
  };

  const orientation: MediaOrientation | null = aspectRatio === null ? null : aspectRatio >= 1 ? 'landscape' : 'portrait';

  return { aspectRatio, orientation, onImageLoad, onVideoLoadedMetadata };
}
