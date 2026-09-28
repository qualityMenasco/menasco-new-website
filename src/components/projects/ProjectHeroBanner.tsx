import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { useTransparentHeader, useHeaderThemeOverride } from '../../app/header-transparency';
import { Container } from '../layout/Container';
import { Heading, Text } from '../typography/Typography';
import { Badge } from '../ui/Badge';
import { ButtonLink } from '../ui/Button';

export interface ProjectHeroBannerProps {
  image: string;
  title: string;
  /** Accepted for backward compatibility but no longer rendered — a duplicate eyebrow/status badge here just added clutter and pushed content up into the header. */
  eyebrow?: string;
  statusLabel?: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
  /** Set to give the CTA a `download` attribute instead of a normal navigation. */
  ctaDownload?: string;
  showVerificationBadge?: boolean;
}

/**
 * Full-bleed static hero for standard project pages — a single background
 * photo with a dark gradient overlay and white text, matching the look of
 * the cinematic project heroes (Vela, Qiddiya) but without requiring a
 * frame sequence or scroll-jacking. Used by every project on the default
 * (non-cinematic) template.
 */
export function ProjectHeroBanner({
  image,
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaDownload,
  showVerificationBadge,
}: ProjectHeroBannerProps) {
  // The header stays transparent (light text) while the hero is on screen,
  // then the site's own scroll logic drops it to a solid bar once the user
  // scrolls past — this sentinel just tells us when that's happened so we
  // can release our forced-dark override back to the default.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const handleScroll = () => setPastHero(el.getBoundingClientRect().top < 80);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useTransparentHeader(true);
  useHeaderThemeOverride(pastHero ? null : 'dark');

  return (
    <>
      <section className="relative -mt-20 flex min-h-[85vh] w-full flex-col overflow-hidden bg-ink">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/10"
        />

        <Container className="relative z-10 flex flex-1 items-end pb-16 pt-24 md:pb-24">
          <div className="max-w-2xl">
            {showVerificationBadge && (
              <div className="mb-3">
                <Badge variant="status" theme="dark">
                  Details Pending Verification
                </Badge>
              </div>
            )}
            <Heading level="display" as="h2" theme="dark">
              {title}
            </Heading>
            {description && (
              <Text variant="body" theme="dark" className="mt-4 max-w-lg !text-warmwhite">
                {description}
              </Text>
            )}
            <div className="mt-7">
              <ButtonLink href={ctaHref} download={ctaDownload} variant="outline" theme="dark" leadingIcon={Download}>
                {ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </>
  );
}
