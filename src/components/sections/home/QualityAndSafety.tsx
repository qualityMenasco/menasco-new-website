import { useLayoutEffect, useRef, type RefObject } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ButtonLink } from '../../ui/Button';
import { ScrollRevealGroup } from '../../common/ScrollReveal';

/** Each pillar with the ISO standard it's certified to (shown as the card title; no links). */
const pillars = [
  { key: 'qualityManagement', iso: 'ISO 9001:2015' },
  { key: 'healthSafety', iso: 'ISO 45001:2018' },
  { key: 'environmentalManagement', iso: 'ISO 14001:2015' },
] as const;

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

/**
 * Quality, health, safety & environment on a dark band (separating it from the
 * light manufacturing section above): the intro and lead paragraph, the three
 * pillars, and one button through to the Quality & Safety page.
 */
export function QualityAndSafety() {
  const { t } = useTranslation(['home', 'common']);
  const lockupRef = useRef<HTMLDivElement>(null);
  useEyebrowFitToHeading(lockupRef);

  return (
    <Section background="charcoal" spacing="md">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-10">
        <div ref={lockupRef} className="flex flex-col gap-4 lg:col-span-5 xl:col-span-4">
          <Eyebrow theme="dark">{t('qualitySafety.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3" theme="dark" className="text-balance">
            {t('qualitySafety.heading')}
          </Heading>
        </div>
        <div className="lg:col-span-7 xl:col-span-8">
          <Text variant="body-lg" theme="dark" className="text-gray-300">
            {t('qualitySafety.description')}
          </Text>
        </div>
      </div>

      <ScrollRevealGroup className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-md bg-white/10 md:grid-cols-3">
        {pillars.map(({ key, iso }) => (
          <div key={key} className="flex h-full flex-col gap-1.5 bg-graphite p-6">
            <p dir="ltr" className="font-display text-h3 font-semibold text-warmwhite rtl:text-end">
              {iso}
            </p>
            <Text variant="small" theme="dark" muted>
              {t(`qualitySafety.pillars.${key}.title`)}
            </Text>
          </div>
        ))}
      </ScrollRevealGroup>

      <ButtonLink href="/quality-safety" variant="primary" trailingIcon={ArrowRight} className="mt-10 w-fit">
        {t('qualitySafety.cta')}
      </ButtonLink>
    </Section>
  );
}
