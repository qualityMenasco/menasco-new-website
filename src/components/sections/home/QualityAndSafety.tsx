import { useLayoutEffect, useRef, type RefObject } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { certifications } from '../../../data/certifications';

/** Pillar ↔ certificate pairing, in display order. */
const evidenceRows = [
  { pillar: 'qualityManagement', certification: 'ISO 9001:2015' },
  { pillar: 'healthSafety', certification: 'ISO 45001:2018' },
  { pillar: 'environmentalManagement', certification: 'ISO 14001:2015' },
] as const;

const certificationScopeKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

/**
 * Fits the eyebrow to the heading's width (a typographic lockup): tightens the
 * eyebrow's letter-spacing so it ends exactly where the heading's widest line
 * ends. Only ever tightens, and only for left-to-right text — Arabic letters
 * join, so letter-spacing would break them, and stretching the shorter Arabic
 * eyebrow would just open wide gaps between its words.
 */
function useEyebrowFitToHeading(lockupRef: RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    const lockup = lockupRef.current;
    const eyebrow = lockup?.firstElementChild as HTMLElement | null;
    const heading = lockup?.querySelector('h3');
    if (!lockup || !eyebrow || !heading) return;

    const fit = () => {
      eyebrow.style.letterSpacing = '';
      eyebrow.style.whiteSpace = '';
      if (getComputedStyle(eyebrow).direction === 'rtl') return;
      // Measure (and keep) the eyebrow on one line — a narrow column would
      // otherwise wrap it before it can be fitted.
      eyebrow.style.whiteSpace = 'nowrap';
      const range = document.createRange();
      range.selectNodeContents(heading);
      const headingWidth = Math.max(0, ...Array.from(range.getClientRects()).map((rect) => rect.width));
      range.selectNodeContents(eyebrow);
      const eyebrowWidth = range.getBoundingClientRect().width;
      const characters = eyebrow.textContent?.length ?? 0;
      if (!headingWidth || !characters || eyebrowWidth <= headingWidth) return;
      const baseTracking = parseFloat(getComputedStyle(eyebrow).letterSpacing) || 0;
      eyebrow.style.letterSpacing = `${baseTracking - (eyebrowWidth - headingWidth) / characters}px`;
    };

    fit();
    document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(lockup);
    return () => observer.disconnect();
  }, [lockupRef]);
}

export function QualityAndSafety() {
  const { t } = useTranslation(['home', 'common']);
  const lockupRef = useRef<HTMLDivElement>(null);
  useEyebrowFitToHeading(lockupRef);

  return (
    <Section background="stone" spacing="md" edgeFade>
      <Stack space="xl">
        {/* Intro — eyebrow + quiet heading as one block in a narrower left
            column, vertically centred against the paragraph, which leads. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-10">
          <div ref={lockupRef} className="flex flex-col gap-4 lg:col-span-5 xl:col-span-4">
            <Eyebrow>{t('qualitySafety.eyebrow')}</Eyebrow>
            <Heading level="h2" as="h3" className="text-balance">
              {t('qualitySafety.heading')}
            </Heading>
          </div>
          <div className="lg:col-span-7 xl:col-span-8">
            <Text variant="body-lg">{t('qualitySafety.description')}</Text>
          </div>
        </div>

        {/* Standards — one card per ISO certification, side by side. */}
        <div>
          <p className="text-small font-semibold text-ink">{t('qualitySafety.standardsHeading')}</p>
          <ul role="list" className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            {evidenceRows.map(({ pillar, certification: certificationName }) => {
              const certification = certifications.find((item) => item.name === certificationName);
              const scopeKey = certification ? certificationScopeKeys[certification.name] : undefined;
              const viewLabel = t('common:certifications.viewCertificate');

              return (
                <li key={pillar} className="flex flex-col gap-3 rounded-md border border-gray-200 bg-warmwhite p-5 xl:p-6">
                  {certification && (
                    <div>
                      <p className="font-display text-h4 font-semibold text-ink">
                        <span dir="ltr">{certification.name}</span>
                      </p>
                      <Text variant="caption" className="mt-1">
                        {scopeKey ? t(`common:certifications.${scopeKey}`) : certification.scope}
                      </Text>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <p className="font-semibold text-ink">{t(`qualitySafety.pillars.${pillar}.title`)}</p>
                    <Text variant="small" muted className="mt-1">
                      {t(`qualitySafety.pillars.${pillar}.description`)}
                    </Text>
                  </div>
                  {certification?.fileUrl && (
                    <a
                      href={certification.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${viewLabel} — ${certification.name} (PDF)`}
                      className="mt-auto inline-flex min-h-[44px] w-fit items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base ease-engineered hover:text-brand-700"
                    >
                      {viewLabel}
                      <ArrowUpRight size={14} aria-hidden="true" className="rtl:-scale-x-100" />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Stack>
    </Section>
  );
}
