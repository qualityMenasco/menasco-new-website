import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Container } from '../layout/Container';
import { Heading, Text } from '../typography/Typography';
import { ButtonLink } from '../ui/Button';
import { useTransparentHeader, useHeaderThemeOverride } from '../../app/header-transparency';

export interface ServiceHeroProps {
  image: string;
  title: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Shared discipline-page hero — shorter than the full-bleed ProjectHeroBanner
 * used on the bespoke Manufacturing/EPC/MEP/Civil pages, matching the
 * compact treatment Mechanical/Electrical/Plumbing/Fire Protection already
 * use via ServiceDetailPage. Extracted so other discipline-shaped pages
 * (e.g. Modular, Custom) can reuse it exactly rather than duplicating it.
 */
export function ServiceHero({ image, title, description, ctaLabel, ctaHref }: ServiceHeroProps) {
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
      <section className="relative -mt-20 flex min-h-[52vh] w-full flex-col overflow-hidden bg-ink lg:min-h-[56vh]">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-ink/10" />

        <Container className="relative z-10 flex flex-1 items-end pb-10 pt-20 md:pb-14">
          <div className="max-w-3xl">
            <Heading level="h1" as="h2" theme="dark">
              {title}
            </Heading>
            {description && (
              <Text variant="body" theme="dark" className="mt-3 max-w-3xl !text-warmwhite whitespace-pre-line">
                {description}
              </Text>
            )}
            <div className="mt-5">
              <ButtonLink href={ctaHref} variant="outline" theme="dark" leadingIcon={Download}>
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
