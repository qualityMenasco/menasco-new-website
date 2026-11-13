import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { ButtonLink } from '../components/ui/Button';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { VideoPlaceholder } from '../components/sections/community/VideoPlaceholder';
import { AutoplayVideo } from '../components/common/AutoplayVideo';
import { SectionThemeContext } from '../lib/theme-context';
import { useTransparentHeader } from '../app/header-transparency';
import { certifications } from '../data/certifications';
import { qhseAnnotations, qhseAwardVideo, qhseHeroPhoto, qhseMetrics, qualitySafetyPhotos } from '../data/siteSafety';
import { cn } from '../lib/utils';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

/*
 * Quality, Health & Safety as an engineering assurance system:
 * Swiss functionalism for the grid (12 columns, hairline rules, flush-left
 * type, small structured labels), scientific editorialism for the content
 * (numbered figures and captions, a procedure, measured values) and
 * industrial wayfinding for the signals (discipline tags, plates, annotated
 * callouts). Brand blue marks quality and the system; safety amber (the
 * `warning` token) is reserved for genuine risk information.
 */

const label = 'text-caption font-semibold uppercase tracking-[0.14em]';

/** Small wayfinding tag: a coloured square + label. */
function Tag({ tone, children }: { tone: 'quality' | 'risk' | 'neutral'; children: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', label, tone === 'risk' ? 'text-warning' : tone === 'quality' ? 'text-brand-600' : 'text-gray-500')}>
      <span aria-hidden="true" className={cn('h-2.5 w-2.5', tone === 'risk' ? 'bg-warning' : tone === 'quality' ? 'bg-brand-600' : 'bg-gray-400')} />
      {children}
    </span>
  );
}

/** Section opener: index + eyebrow on a rule, then the heading. */
function Opener({ index, eyebrow, heading, dark = false }: { index: string; eyebrow: string; heading: string; dark?: boolean }) {
  return (
    <div className={cn('grid grid-cols-12 gap-8 border-t pt-4', dark ? 'border-white/30' : 'border-ink')}>
      <span dir="ltr" className={cn('col-span-2 tabular-nums rtl:text-end', label, dark ? 'text-gray-400' : 'text-gray-500')}>
        {index}
      </span>
      <span className={cn('col-span-10', label, dark ? 'text-brand-400' : 'text-brand-600')}>{eyebrow}</span>
      <h2 className={cn('col-span-10 col-start-3 mt-6 font-display text-h1 font-bold tracking-[-0.025em]', dark ? 'text-warmwhite' : 'text-ink')}>{heading}</h2>
    </div>
  );
}

/** Dark hero: title and introduction beside a black-and-white site photo with fine-line callouts. */
function Hero() {
  useTransparentHeader(true);
  const { t, i18n } = useTranslation(['about', 'common']);
  const rtl = i18n.dir() === 'rtl';
  return (
    <SectionThemeContext.Provider value="dark">
      <section className="bg-ink pb-20 pt-36">
        <Container>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-5 self-center">
              <span className={cn(label, 'text-brand-400')}>{t('qualitySafetyPage.hero.eyebrow')}</span>
              <h2 className="mt-5 font-display text-[clamp(3.5rem,5.6vw,5rem)] font-bold leading-[0.95] tracking-[-0.035em] text-warmwhite">
                {t('qualitySafetyPage.heading')}
              </h2>
              <p className="mt-6 text-body-lg text-gray-300">{t('qualitySafetyPage.description')}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {certifications.map((c) => (
                  <span key={c.name} dir="ltr" className={cn('border border-white/25 px-3 py-1.5 text-warmwhite', label)}>
                    {c.name}
                  </span>
                ))}
              </div>
              <ButtonLink
                href="/certificates/qhse-policy.pdf"
                download="MENASCO-QHSE-Policy-2026.pdf"
                variant="primary"
                leadingIcon={Download}
                className="mt-8 w-fit"
              >
                {t('qualitySafetyPage.downloadPolicy')}
              </ButtonLink>
            </div>

            {/* Annotated figure. The frame keeps the photo's own aspect ratio so callout
                coordinates (percentages) land on the right spot at any width. The photo
                takes 58% of the column; labels fill the remaining 42% beside it
                (42/58 ≈ 72% of the photo's width), so they never leave the column. */}
            <figure className="col-span-6 col-start-7">
              <div className="relative aspect-[753/1280] w-[58%]">
                <img src={qhseHeroPhoto.src} alt={qhseHeroPhoto.alt} className="h-full w-full object-cover contrast-[1.08] grayscale" />
                {qhseAnnotations.map((a) => {
                  const risk = a.kind === 'risk';
                  return (
                    <div key={a.key} aria-hidden="true">
                      {/* Points use physical left/top: the photo doesn't mirror in Arabic, so neither
                          do its features. The leader line runs from the point to just past the edge on
                          the labels' side (right in English, left in Arabic). */}
                      <span
                        className={cn('absolute h-px', risk ? 'bg-warning' : 'bg-brand-400')}
                        style={rtl ? { top: `${a.y}%`, left: '-1.5rem', right: `${100 - a.x}%` } : { top: `${a.y}%`, left: `${a.x}%`, right: '-1.5rem' }}
                      />
                      <span
                        className={cn('absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-ink/40', risk ? 'border-warning' : 'border-brand-400')}
                        style={{ top: `${a.y}%`, left: `${a.x}%` }}
                      />
                    </div>
                  );
                })}
                {/* Labels, aligned in a column just outside the photo. */}
                {qhseAnnotations.map((a) => {
                  const risk = a.kind === 'risk';
                  return (
                    <div key={a.key} className="absolute start-[calc(100%+2rem)] w-[calc(72%-2rem)] -translate-y-1/2" style={{ top: `${a.y}%` }}>
                      <span className={cn('block', label, risk ? 'text-warning' : 'text-brand-400')}>{t(`qualitySafetyPage.hero.annotations.${a.key}.title`)}</span>
                      <span className="mt-0.5 block text-small text-gray-300">{t(`qualitySafetyPage.hero.annotations.${a.key}.note`)}</span>
                    </div>
                  );
                })}
              </div>
              <figcaption className="mt-4 text-caption text-gray-400">{t('qualitySafetyPage.hero.figureCaption')}</figcaption>
            </figure>
          </div>
        </Container>
      </section>
    </SectionThemeContext.Provider>
  );
}

type DisciplineCopy = { tag: string; title: string; lead: string; points: string[] };

/** Quality and Safety side by side: same structure, distinguished by colour and tag. */
function Disciplines() {
  const { t } = useTranslation('about');
  const columns: { key: 'quality' | 'safety'; tone: 'quality' | 'risk' }[] = [
    { key: 'quality', tone: 'quality' },
    { key: 'safety', tone: 'risk' },
  ];
  return (
    <Section spacing="lg" background="warmwhite">
      <Opener index="01" eyebrow={t('qualitySafetyPage.disciplines.eyebrow')} heading={t('qualitySafetyPage.disciplines.heading')} />
      <div className="mt-16 grid grid-cols-2 gap-px bg-gray-300">
        {columns.map(({ key, tone }) => {
          const copy = t(`qualitySafetyPage.disciplines.${key}`, { returnObjects: true }) as DisciplineCopy;
          return (
            <div key={key} className="bg-warmwhite p-10">
              <Tag tone={tone}>{copy.tag}</Tag>
              <h3 className="mt-6 font-display text-h2 font-bold tracking-[-0.02em] text-ink">{copy.title}</h3>
              <p className="mt-4 max-w-md text-body-lg text-gray-700">{copy.lead}</p>
              <ol className="mt-8 border-t border-gray-300">
                {copy.points.map((point, i) => (
                  <li key={point} className="grid grid-cols-[2.5rem_1fr] items-baseline border-b border-gray-300 py-3">
                    <span dir="ltr" className={cn('tabular-nums rtl:text-end', label, tone === 'risk' ? 'text-warning' : 'text-brand-600')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-body text-ink">{point}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/** The assurance procedure as five numbered steps on a single line. */
function Process() {
  const { t } = useTranslation('about');
  const steps = t('qualitySafetyPage.process.steps', { returnObjects: true }) as { title: string; text: string }[];
  return (
    <Section spacing="lg" background="stone">
      <Opener index="02" eyebrow={t('qualitySafetyPage.process.eyebrow')} heading={t('qualitySafetyPage.process.heading')} />
      <ol className="mt-16 grid grid-cols-5 border-t-2 border-brand-600">
        {steps.map((step, i) => (
          <li key={step.title} className="relative border-e border-gray-300 pe-6 pt-6 last:border-e-0 [&:not(:first-child)]:ps-6">
            <span aria-hidden="true" className="absolute -top-[7px] start-0 h-3 w-3 bg-brand-600" />
            <span dir="ltr" className={cn('block tabular-nums text-gray-500 rtl:text-end', label)}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="mt-3 block font-display text-h3 font-bold tracking-[-0.015em] text-ink">{step.title}</span>
            <span className="mt-3 block text-small text-gray-700">{step.text}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** Measured values — placeholders until verified figures are supplied. */
function Metrics() {
  const { t } = useTranslation('about');
  return (
    <SectionThemeContext.Provider value="dark">
      <Section spacing="lg" background="charcoal">
        <Opener dark index="03" eyebrow={t('qualitySafetyPage.metrics.eyebrow')} heading={t('qualitySafetyPage.metrics.heading')} />
        <dl className="mt-16 grid grid-cols-4 gap-px bg-white/15">
          {qhseMetrics.map((m) => (
            <div key={m.key} className="bg-charcoal p-8">
              <dd dir="ltr" className="font-display text-[clamp(3rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.03em] text-brand-400 rtl:text-end">
                {m.value ?? '—'}
              </dd>
              <dt className="mt-4 text-small text-gray-300">{t(`qualitySafetyPage.metrics.items.${m.key}`)}</dt>
            </div>
          ))}
        </dl>
        {qhseMetrics.some((m) => !m.value) && <p className={cn('mt-6 text-gray-500', label)}>{t('qualitySafetyPage.metrics.pending')}</p>}
      </Section>
    </SectionThemeContext.Provider>
  );
}

/** The existing policy statement, set as a two-column editorial text. */
function Commitment() {
  const { t } = useTranslation('about');
  return (
    <Section spacing="lg" background="warmwhite">
      <Opener index="04" eyebrow={t('qualitySafetyPage.commitment.eyebrow')} heading={t('qualitySafetyPage.commitment.heading')} />
      <div className="mt-12 grid grid-cols-12 gap-8">
        <p className="col-span-5 col-start-3 text-body-lg text-gray-700">{t('qualitySafetyPage.paragraph1')}</p>
        <p className="col-span-5 text-body-lg text-gray-700">
          {t('qualitySafetyPage.paragraph2Prefix')} <strong className="font-semibold text-ink">{t('qualitySafetyPage.continuousImprovement')}</strong>
          {t('qualitySafetyPage.paragraph2Suffix')}
        </p>
      </div>
    </Section>
  );
}

/** Field photography as numbered figures, plus the award ceremony film (placeholder until supplied). */
function Field() {
  const { t } = useTranslation('about');
  const [engineer, team] = qualitySafetyPhotos.portraits;
  const figure = (src: string, alt: string, caption: string, frame: string) => (
    <figure className={frame}>
      <div className="h-full overflow-hidden bg-gray-100">
        <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
      <figcaption className="mt-3 text-caption text-gray-500">{caption}</figcaption>
    </figure>
  );
  return (
    <Section spacing="lg" background="stone">
      <Opener index="05" eyebrow={t('qualitySafetyPage.field.eyebrow')} heading={t('qualitySafetyPage.field.heading')} />
      <div className="mt-16 grid grid-cols-12 gap-8">
        <div className="col-span-8 grid grid-cols-2 gap-8">
          {figure(engineer.src, engineer.alt, t('qualitySafetyPage.field.captions.engineer'), 'aspect-[4/5]')}
          {figure(team.src, team.alt, t('qualitySafetyPage.field.captions.team'), 'aspect-[4/5]')}
          {figure(qualitySafetyPhotos.landscape.src, qualitySafetyPhotos.landscape.alt, t('qualitySafetyPage.field.captions.site'), 'col-span-2 aspect-[16/7]')}
        </div>
        <figure className="col-span-4">
          {qhseAwardVideo ? (
            <AutoplayVideo src={qhseAwardVideo} poster={qualitySafetyPhotos.landscape.src} alt={t('qualitySafetyPage.field.captions.award')} className="aspect-[9/16] w-full" />
          ) : (
            <VideoPlaceholder className="aspect-[9/16] w-full !rounded-none" />
          )}
          <figcaption className="mt-3 text-caption text-gray-500">{t('qualitySafetyPage.field.captions.award')}</figcaption>
        </figure>
      </div>
    </Section>
  );
}

/** Certificates as wayfinding plates: standard code, scope, link to the PDF. */
function Certificates() {
  const { t } = useTranslation(['about', 'common']);
  const scopeKeys: Record<string, string> = {
    'ISO 9001:2015': 'qualityManagement',
    'ISO 14001:2015': 'environmentalManagement',
    'ISO 45001:2018': 'occupationalHealthSafety',
  };
  return (
    <ScrollReveal>
      <Section spacing="lg" background="warmwhite">
        <Opener index="06" eyebrow={t('qualitySafetyPage.certs.eyebrow')} heading={t('qualitySafetyPage.certs.heading')} />
        <div className="mt-16 grid grid-cols-3 gap-8">
          {certifications.map((c) => {
            const [code, year] = c.name.split(':');
            const scope = scopeKeys[c.name] ? t(`common:certifications.${scopeKeys[c.name]}`) : c.scope;
            const body = (
              <>
                <span dir="ltr" className="block font-display text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-none tracking-[-0.03em] text-warmwhite rtl:text-end">
                  {code}
                </span>
                <span dir="ltr" className={cn('mt-2 block text-brand-400 rtl:text-end', label)}>
                  {year}
                </span>
                <span className="mt-8 block min-h-[3rem] text-small text-gray-300">{scope}</span>
                {c.fileUrl && (
                  <span className={cn('mt-6 inline-flex items-center gap-2 text-brand-400', label)}>
                    {t('qualitySafetyPage.certs.viewCertificate')}
                    <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
                  </span>
                )}
              </>
            );
            const plate = 'block bg-ink p-8 transition-colors duration-base hover:bg-charcoal';
            return c.fileUrl ? (
              <a key={c.name} href={c.fileUrl} target="_blank" rel="noopener noreferrer" className={plate}>
                {body}
              </a>
            ) : (
              <div key={c.name} className={plate}>
                {body}
              </div>
            );
          })}
        </div>
      </Section>
    </ScrollReveal>
  );
}

export default function QualitySafetyPage() {
  const { t } = useTranslation('about');
  return (
    <>
      <SEO
        title={t('qualitySafetyPage.seo.title')}
        description={t('qualitySafetyPage.seo.description')}
        path="/quality-safety"
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Quality, Health & Safety', path: '/quality-safety' },
        ]}
      />
      <Hero />
      <Disciplines />
      <Process />
      <Metrics />
      <Commitment />
      <Field />
      <Certificates />
    </>
  );
}
