import { cn } from '../../lib/utils';
import { useSectionTheme } from '../../lib/theme-context';
import type { HeadingLevel, Theme } from '../../types';
import { Eyebrow, Heading, StatText, Text, type HeadingLevelStyle } from '../typography/Typography';
import { ButtonLink } from '../ui/Button';

export interface SplitContentProps {
  image: string;
  imageAlt?: string;
  /** Optional background video — when set, replaces the still image in the same media frame (image is kept as its `poster`, so layout never shifts while the video loads). */
  video?: string;
  imageSide?: 'left' | 'right';
  eyebrow?: string;
  heading: string;
  headingLevel?: HeadingLevelStyle;
  headingAs?: HeadingLevel;
  description?: string;
  /** Extra emphasized line rendered after the description, inside the same text column — never a separate full-width block below the grid. */
  closingStatement?: string;
  statOverlay?: { value: string; label: string };
  action?: { label: string; href: string };
  theme?: Theme;
  className?: string;
  /**
   * Stretches both columns to the taller side's height (image fills it via
   * object-cover) instead of the default fixed 4:3 aspect ratio + vertically
   * centered layout. Off by default so existing callers are unaffected —
   * opt in when the text column's length should drive the image's height.
   */
  stretch?: boolean;
}

export function SplitContent({
  image,
  imageAlt = '',
  video,
  imageSide = 'left',
  eyebrow,
  heading,
  headingLevel = 'h2',
  headingAs,
  description,
  closingStatement,
  statOverlay,
  action,
  theme,
  className,
  stretch = false,
}: SplitContentProps) {
  const resolvedTheme = useSectionTheme(theme);
  const imageFirst = imageSide === 'left';

  return (
    <div className={cn('grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16', stretch && 'lg:items-stretch', className)}>
      <div className={cn('relative', imageFirst ? 'lg:order-1' : 'lg:order-2')}>
        <div className={cn('overflow-hidden rounded-md bg-gray-100', stretch ? 'aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-[4/3]')}>
          {video ? (
            <video
              className="h-full w-full object-cover object-center"
              poster={image}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload noplaybackrate"
              aria-label={imageAlt || undefined}
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            <img src={image} alt={imageAlt} className="h-full w-full object-cover" />
          )}
        </div>
        {statOverlay && (
          <div
            className={cn(
              'absolute bottom-4 end-4 flex flex-col gap-0.5 rounded-md border p-5 shadow-strong sm:bottom-8 sm:end-8 sm:p-6',
              resolvedTheme === 'dark' ? 'border-white/10 bg-charcoal' : 'border-gray-200 bg-warmwhite',
            )}
          >
            <StatText theme={resolvedTheme} className="!text-h2">
              {statOverlay.value}
            </StatText>
            <Text variant="small" theme={resolvedTheme} muted>
              {statOverlay.label}
            </Text>
          </div>
        )}
      </div>

      <div className={cn('flex flex-col gap-5', imageFirst ? 'lg:order-2' : 'lg:order-1')}>
        {eyebrow && <Eyebrow theme={resolvedTheme}>{eyebrow}</Eyebrow>}
        <Heading level={headingLevel} as={headingAs} theme={resolvedTheme}>
          {heading}
        </Heading>
        {description && (
          <Text variant="body-lg" theme={resolvedTheme} className="whitespace-pre-line">
            {description}
          </Text>
        )}
        {closingStatement && (
          <Text variant="body-lg" theme={resolvedTheme} className="font-semibold">
            {closingStatement}
          </Text>
        )}
        {action && (
          <ButtonLink href={action.href} variant="primary" theme={resolvedTheme} className="mt-2 self-start">
            {action.label}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
