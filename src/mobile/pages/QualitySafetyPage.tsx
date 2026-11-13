import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PhotoRail } from '../components/PhotoRail';
import { ExpandableText } from '../components/ExpandableText';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { VideoPlaceholder } from '../../components/sections/community/VideoPlaceholder';
import { PhotoWithVideo } from '../../components/sections/community/PhotoWithVideo';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { certifications } from '../../data/certifications';
import { qhseAnnotations, qhseAwardVideo, qhseHeroPhoto, qhseMetrics, qualitySafetyPhotos } from '../../data/siteSafety';
import { cn } from '../lib/utils';

/*
 * Phone/tablet version of the Quality, Health & Safety assurance page — same
 * copy, sections and colour rules as desktop (brand blue for quality and the
 * system, safety amber only for risk), stacked and condensed: the hero
 * callouts become a numbered key under the photo, long text sits behind
 * "Read more", and photo rows swipe.
 */

const label = 'text-caption font-semibold uppercase tracking-[0.14em]';

function Opener({ index, eyebrow, heading, dark = false }: { index: string; eyebrow: string; heading: string; dark?: boolean }) {
  return (
    <div className={cn('border-t pt-3', dark ? 'border-white/30' : 'border-ink')}>
      <div className="flex gap-4">
        <span dir="ltr" className={cn('tabular-nums', label, dark ? 'text-gray-400' : 'text-gray-500')}>
          {index}
        </span>
        <span className={cn(label, dark ? 'text-brand-400' : 'text-brand-600')}>{eyebrow}</span>
      </div>
      <h3 className={cn('mt-4 font-display text-h2 font-bold tracking-[-0.02em]', dark ? 'text-warmwhite' : 'text-ink')}>{heading}</h3>
    </div>
  );
}

type DisciplineCopy = { tag: string; title: string; lead: string; points: string[] };

export default function QualitySafetyPage() {
  const { t } = useTranslation(['about', 'common']);
  const steps = t('qualitySafetyPage.process.steps', { returnObjects: true }) as { title: string; text: string }[];
  const scopeKeys: Record<string, string> = {
    'ISO 9001:2015': 'qualityManagement',
    'ISO 14001:2015': 'environmentalManagement',
    'ISO 45001:2018': 'occupationalHealthSafety',
  };

  return (
    <>
      <NavSectionH1 section="about" />
      <SEO
        title={t('qualitySafetyPage.seo.title')}
        description={t('qualitySafetyPage.seo.description')}
        path="/quality-safety"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Quality, Health & Safety', path: '/quality-safety' }]}
      />

      {/* Hero: title, intro, certifications and policy, then the annotated photo with a numbered key. */}
      <section className="bg-ink px-4 pb-10 pt-8">
        <span className={cn(label, 'text-brand-400')}>{t('qualitySafetyPage.hero.eyebrow')}</span>
        <h2 className="mt-4 font-display text-[12vw] font-bold leading-[0.95] tracking-[-0.035em] text-warmwhite md:text-[8vw]">{t('qualitySafetyPage.heading')}</h2>
        <p className="mt-5 text-body text-gray-300">{t('qualitySafetyPage.description')}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {certifications.map((c) => (
            <span key={c.name} dir="ltr" className={cn('border border-white/25 px-2.5 py-1 text-warmwhite', label)}>
              {c.name}
            </span>
          ))}
        </div>
        <a
          href="/certificates/qhse-policy.pdf"
          download="MENASCO-QHSE-Policy-2026.pdf"
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-600 text-body font-semibold text-warmwhite md:w-fit md:px-8"
        >
          <Download size={16} aria-hidden="true" />
          {t('qualitySafetyPage.downloadPolicy')}
        </a>

        <figure className="mt-8 md:grid md:grid-cols-2 md:items-center md:gap-8">
          <div className="relative mx-auto aspect-[753/1280] w-full max-w-[22rem]">
            <img src={qhseHeroPhoto.src} alt={qhseHeroPhoto.alt} className="h-full w-full object-cover contrast-[1.08] grayscale" />
            {qhseAnnotations.map((a, i) => (
              // Physical left/top: the photo doesn't mirror in Arabic, so neither do its features.
              <span
                key={a.key}
                aria-hidden="true"
                className={cn(
                  'absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-ink/70 text-[0.6875rem] font-bold tabular-nums',
                  a.kind === 'risk' ? 'border-warning text-warning' : 'border-brand-400 text-brand-400',
                )}
                style={{ left: `${a.x}%`, top: `${a.y}%` }}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <div className="mt-5 md:mt-0">
            <ol className="border-t border-white/20">
              {qhseAnnotations.map((a, i) => (
                <li key={a.key} className="grid grid-cols-[2rem_1fr] items-baseline border-b border-white/20 py-3">
                  <span dir="ltr" className={cn('tabular-nums', label, a.kind === 'risk' ? 'text-warning' : 'text-brand-400')}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className={cn('block', label, a.kind === 'risk' ? 'text-warning' : 'text-brand-400')}>
                      {t(`qualitySafetyPage.hero.annotations.${a.key}.title`)}
                    </span>
                    <span className="mt-0.5 block text-small text-gray-300">{t(`qualitySafetyPage.hero.annotations.${a.key}.note`)}</span>
                  </span>
                </li>
              ))}
            </ol>
            <figcaption className="mt-3 text-caption text-gray-400">{t('qualitySafetyPage.hero.figureCaption')}</figcaption>
          </div>
        </figure>
      </section>

      {/* 01 — Quality and Safety, stacked (side by side on tablets). */}
      <section className="px-4 py-10">
        <Opener index="01" eyebrow={t('qualitySafetyPage.disciplines.eyebrow')} heading={t('qualitySafetyPage.disciplines.heading')} />
        <div className="mt-8 grid gap-px bg-gray-300 md:grid-cols-2">
          {(['quality', 'safety'] as const).map((key) => {
            const copy = t(`qualitySafetyPage.disciplines.${key}`, { returnObjects: true }) as DisciplineCopy;
            const risk = key === 'safety';
            return (
              <div key={key} className="bg-warmwhite py-6 md:p-6">
                <span className={cn('inline-flex items-center gap-2', label, risk ? 'text-warning' : 'text-brand-600')}>
                  <span aria-hidden="true" className={cn('h-2.5 w-2.5', risk ? 'bg-warning' : 'bg-brand-600')} />
                  {copy.tag}
                </span>
                <h4 className="mt-4 font-display text-h3 font-bold tracking-[-0.015em] text-ink">{copy.title}</h4>
                <p className="mt-3 text-body text-gray-700">{copy.lead}</p>
                <ol className="mt-5 border-t border-gray-300">
                  {copy.points.map((point, i) => (
                    <li key={point} className="grid grid-cols-[2rem_1fr] items-baseline border-b border-gray-300 py-2.5">
                      <span dir="ltr" className={cn('tabular-nums', label, risk ? 'text-warning' : 'text-brand-600')}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-small text-ink">{point}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>

      {/* 02 — The process as a vertical procedure with a blue spine. */}
      <section className="bg-stone px-4 py-10">
        <Opener index="02" eyebrow={t('qualitySafetyPage.process.eyebrow')} heading={t('qualitySafetyPage.process.heading')} />
        <ol className="ms-1.5 mt-8 border-s-2 border-brand-600">
          {steps.map((step, i) => (
            <li key={step.title} className="relative pb-6 ps-6 last:pb-0">
              <span aria-hidden="true" className="absolute -start-[7px] top-1 h-3 w-3 bg-brand-600" />
              <span dir="ltr" className={cn('block tabular-nums text-gray-500 rtl:text-end', label)}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="mt-1 block font-display text-h4 font-bold text-ink">{step.title}</span>
              <span className="mt-1 block text-small text-gray-700">{step.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 03 — Measured values (placeholders until verified figures are supplied). */}
      <section className="bg-charcoal px-4 py-10">
        <Opener dark index="03" eyebrow={t('qualitySafetyPage.metrics.eyebrow')} heading={t('qualitySafetyPage.metrics.heading')} />
        <dl className="mt-8 grid grid-cols-2 gap-px bg-white/15 md:grid-cols-4">
          {qhseMetrics.map((m) => (
            <div key={m.key} className="bg-charcoal p-4">
              <dd dir="ltr" className="font-display text-[2.5rem] font-bold leading-none tracking-[-0.03em] text-brand-400 rtl:text-end">
                {m.value ?? '—'}
              </dd>
              <dt className="mt-3 text-small text-gray-300">{t(`qualitySafetyPage.metrics.items.${m.key}`)}</dt>
            </div>
          ))}
        </dl>
        {qhseMetrics.some((m) => !m.value) && <p className={cn('mt-5 text-gray-500', label)}>{t('qualitySafetyPage.metrics.pending')}</p>}
      </section>

      {/* 04 — The policy statement, first paragraph with the second behind "Read more". */}
      <section className="px-4 py-10">
        <Opener index="04" eyebrow={t('qualitySafetyPage.commitment.eyebrow')} heading={t('qualitySafetyPage.commitment.heading')} />
        <ExpandableText
          className="mt-6"
          summary={t('qualitySafetyPage.paragraph1')}
          paragraphs={[`${t('qualitySafetyPage.paragraph2Prefix')} ${t('qualitySafetyPage.continuousImprovement')}${t('qualitySafetyPage.paragraph2Suffix')}`]}
          expandLabel={t('common:buttons.readMore')}
          collapseLabel={t('common:buttons.showLess')}
          textClassName="text-body text-gray-700"
        />
      </section>

      {/* 05 — Field photos as a swipeable row, then the award film (placeholder until supplied). */}
      <section className="bg-stone py-10">
        <div className="px-4">
          <Opener index="05" eyebrow={t('qualitySafetyPage.field.eyebrow')} heading={t('qualitySafetyPage.field.heading')} />
        </div>
        <PhotoRail
          images={[...qualitySafetyPhotos.portraits, qualitySafetyPhotos.landscape]}
          label={t('qualitySafetyPage.field.heading')}
          className="mt-8"
          gutterClassName="scroll-px-4 px-4"
          itemClassName="aspect-[4/5] w-[70vw] max-w-[20rem] md:w-[calc((100%-24px)/3)] md:max-w-none"
        />
        <figure className="mt-6 px-4">
          {qhseAwardVideo ? (
            <PhotoWithVideo
              image={{ src: qualitySafetyPhotos.landscape.src, alt: t('qualitySafetyPage.field.captions.award') }}
              video={qhseAwardVideo}
              className="aspect-[16/10]"
            />
          ) : (
            <VideoPlaceholder className="aspect-[16/10] w-full" />
          )}
          <figcaption className="mt-3 text-caption text-gray-500">{t('qualitySafetyPage.field.captions.award')}</figcaption>
        </figure>
      </section>

      {/* 06 — Certificates as dark plates. */}
      <section className="px-4 py-10">
        <Opener index="06" eyebrow={t('qualitySafetyPage.certs.eyebrow')} heading={t('qualitySafetyPage.certs.heading')} />
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {certifications.map((c) => {
            const [code, year] = c.name.split(':');
            const scope = scopeKeys[c.name] ? t(`common:certifications.${scopeKeys[c.name]}`) : c.scope;
            const body = (
              <>
                <span className="flex items-baseline justify-between gap-3">
                  <span dir="ltr" className="font-display text-[2.25rem] font-bold leading-none tracking-[-0.03em] text-warmwhite">
                    {code}
                  </span>
                  <span dir="ltr" className={cn('text-brand-400', label)}>
                    {year}
                  </span>
                </span>
                <span className="mt-4 block text-small text-gray-300">{scope}</span>
                {c.fileUrl && (
                  <span className={cn('mt-4 inline-flex items-center gap-2 text-brand-400', label)}>
                    {t('qualitySafetyPage.certs.viewCertificate')}
                    <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
                  </span>
                )}
              </>
            );
            return c.fileUrl ? (
              <a key={c.name} href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="block bg-ink p-5">
                {body}
              </a>
            ) : (
              <div key={c.name} className="bg-ink p-5">
                {body}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
