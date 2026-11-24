import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '../../layout/Container';
import { Eyebrow, Heading } from '../../typography/Typography';
import { SmartLink } from '../../../lib/SmartLink';

const POSTER = '/Menasco_Data_Center_Server_Racks_Film_Poster.jpg';

export function DataCenterFeature() {
  const { t } = useTranslation('home');
  const sectionRef = useRef<HTMLElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  // This section sits a full screen below the hero — its 3.9MB video has no
  // business competing with the hero's own LCP/critical-path bandwidth.
  // Mount the <video> (and only then start its network request) once the
  // section is close to the viewport, rather than on page load.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || shouldLoadVideo) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoadVideo(true);
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoadVideo]);

  // Sized to its content (≈60–65% of the screen) with the copy centred vertically, so there's no dead video space above it.
  return (
    <section ref={sectionRef} id="data-center" className="relative flex min-h-[62vh] w-full items-center overflow-hidden bg-ink">
      <img src={POSTER} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      {shouldLoadVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          src="/data-center.mp4"
          poster={POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
      {/* Even ink wash plus a start-side gradient: the copy (start-aligned, vertically centred) stays ≥4.5:1 over bright frames. */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/45" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent rtl:bg-gradient-to-l" />

      <Container className="relative z-10 py-20 md:py-24">
        <div className="max-w-2xl">
          <Eyebrow theme="dark">{t('dataCenter.eyebrow')}</Eyebrow>
          <Heading level="h1" as="h3" theme="dark" className="mt-4 max-w-xl">
            {t('dataCenter.title')}
          </Heading>

          <div className="mt-8">
            <SmartLink href="/services/data-centers" className="group inline-flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-warmwhite transition-colors duration-base group-hover:border-brand-600 group-hover:bg-brand-600">
                <ArrowRight className="h-6 w-6 rtl:rotate-180" aria-hidden="true" />
              </span>
              <span className="text-eyebrow font-semibold uppercase tracking-[0.2em] text-warmwhite">
                {t('dataCenter.cta')}
              </span>
            </SmartLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
