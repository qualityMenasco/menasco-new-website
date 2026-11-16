import { ArrowRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { ButtonLink } from '../components/ui/Button';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { SectionHeader } from '../components/typography/SectionHeader';
import { ScrollReveal } from '../components/common/ScrollReveal';
import { TopicAccordion, type AccordionTopic } from '../components/sections/quality/TopicAccordion';
import { useTransparentHeader } from '../app/header-transparency';
import { certifications } from '../data/certifications';
import { qhseAnnotations, qhseHeroPhoto, qualitySafetyPhotos } from '../data/siteSafety';
import { cn } from '../lib/utils';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

/*
 * Quality, Health & Safety, set with the site's standard section components
 * and type (Eyebrow / Heading / Text, as on the home page). Brand blue marks
 * quality; safety amber (the `warning` token) is kept for risk information only.
 */

const scopeKeys: Record<string, string> = {
  'ISO 9001:2015': 'qualityManagement',
  'ISO 14001:2015': 'environmentalManagement',
  'ISO 45001:2018': 'occupationalHealthSafety',
};

/** Dark hero: title and introduction beside a black-and-white site photo with fine-line callouts. */
function Hero() {
  useTransparentHeader(true);
  const { t, i18n } = useTranslation(['about', 'common']);
  const rtl = i18n.dir() === 'rtl';
  return (
    <Section spacing="lg" background="ink" className="pt-36 md:pt-40">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5 self-center">
          <Eyebrow>{t('qualitySafetyPage.eyebrow')}</Eyebrow>
          <Heading level="display" as="h2" className="mt-4">
            {t('qualitySafetyPage.heading')}
          </Heading>
          <Text variant="body-lg" muted className="mt-6">
            {t('qualitySafetyPage.description')}
          </Text>
          <ButtonLink href="/certificates/qhse-policy.pdf" download="MENASCO-QHSE-Policy-2026.pdf" variant="primary" leadingIcon={Download} className="mt-8 w-fit">
            {t('qualitySafetyPage.downloadPolicy')}
          </ButtonLink>
        </div>

        {/* Annotated photo. The frame keeps the photo's own aspect ratio so the callout
            coordinates (percentages) land on the right spot at any width. The photo takes
            58% of the column; labels fill the rest (≈72% of the photo's width). */}
        {/* Centred vertically on the text; the wider 7-column span keeps the photo large on smaller laptops. */}
        <div className="col-span-7 col-start-6 self-center">
          <div className="relative aspect-[753/1280] w-[58%]">
            <img src={qhseHeroPhoto.src} alt={qhseHeroPhoto.alt} className="h-full w-full rounded-md object-cover contrast-[1.08] grayscale" />
            {qhseAnnotations.map((a) => {
              const risk = a.kind === 'risk';
              return (
                <div key={a.key} aria-hidden="true">
                  {/* Points use physical left/top: the photo doesn't mirror in Arabic, so neither do
                      its features. The leader line runs to the edge on the labels' side. */}
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
            {qhseAnnotations.map((a) => (
              <div key={a.key} className="absolute start-[calc(100%+2rem)] w-[calc(72%-2rem)] -translate-y-1/2" style={{ top: `${a.y}%` }}>
                <span className={cn('block text-small font-semibold', a.kind === 'risk' ? 'text-warning' : 'text-brand-400')}>
                  {t(`qualitySafetyPage.hero.annotations.${a.key}.title`)}
                </span>
                <span className="mt-0.5 block text-small text-gray-300">{t(`qualitySafetyPage.hero.annotations.${a.key}.note`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

type DisciplineCopy = { tag: string; title: string; lead: string; points: string[] };

/** Quality and Safety side by side, each led by a site photo; distinguished by colour. */
function Disciplines() {
  const { t } = useTranslation('about');
  const columns = [
    { key: 'quality' as const, photo: qualitySafetyPhotos.portraits[1], focus: 'object-[50%_25%]', risk: false },
    { key: 'safety' as const, photo: qualitySafetyPhotos.landscape, focus: 'object-center', risk: true },
  ];
  return (
    <Section spacing="lg" background="warmwhite">
      <SectionHeader eyebrow={t('qualitySafetyPage.disciplines.eyebrow')} heading={t('qualitySafetyPage.disciplines.heading')} headingAs="h2" className="max-w-2xl" />
      <div className="mt-12 grid grid-cols-2 gap-8">
        {columns.map(({ key, photo, focus, risk }) => {
          const copy = t(`qualitySafetyPage.disciplines.${key}`, { returnObjects: true }) as DisciplineCopy;
          return (
            <article key={key} className="overflow-hidden rounded-md border border-gray-200 bg-stone">
              <div className="aspect-[4/3] bg-gray-100">
                <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className={cn('h-full w-full object-cover', focus)} />
              </div>
              <div className="p-8">
                <span className={cn('inline-flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-widest', risk ? 'text-warning' : 'text-brand-600')}>
                  <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', risk ? 'bg-warning' : 'bg-brand-600')} />
                  {copy.tag}
                </span>
                <Heading level="h3" as="h3" className="mt-3">
                  {copy.title}
                </Heading>
                <Text className="mt-3" muted>
                  {copy.lead}
                </Text>
                <ul className="mt-6 space-y-2.5">
                  {copy.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-body text-ink">
                      <span aria-hidden="true" className={cn('mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full', risk ? 'bg-warning' : 'bg-brand-600')} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

/** What clients can expect: the overview beside the site engineer's portrait at full length, then the detailed topics. */
function Commitment() {
  const { t } = useTranslation('about');
  const photo = qualitySafetyPhotos.portraits[0];
  const paragraphs = t('qualitySafetyPage.commitment.paragraphs', { returnObjects: true }) as string[];
  const topics = t('qualitySafetyPage.commitment.topics', { returnObjects: true }) as AccordionTopic[];
  return (
    <Section spacing="lg" background="warmwhite">
      <div className="grid grid-cols-12 items-center gap-12">
        <div className="col-span-6">
          <SectionHeader eyebrow={t('qualitySafetyPage.commitment.eyebrow')} heading={t('qualitySafetyPage.commitment.heading')} headingAs="h2" />
          {paragraphs.map((p, i) => (
            <Text key={i} variant="body-lg" className={i === 0 ? 'mt-6' : 'mt-4'}>
              {p}
            </Text>
          ))}
        </div>
        <div className="col-span-5 col-start-8 aspect-[4/5] overflow-hidden rounded-md bg-gray-100">
          <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </div>
      </div>
      {/* The detail behind the overview: six expandable topics, the first open. */}
      <TopicAccordion topics={topics} idPrefix="qhse-topic" className="mt-16" />
    </Section>
  );
}

type ResultGroup = { tag: string; stats: { value: string; label: string }[]; text: string };

/** Three-year safety and quality results on a dark band, one card per discipline. */
function Results() {
  const { t } = useTranslation('about');
  const groups = [
    { key: 'safety' as const, risk: true, span: 'col-span-7' },
    { key: 'quality' as const, risk: false, span: 'col-span-5' },
  ];
  return (
    <Section spacing="lg" background="charcoal">
      <SectionHeader eyebrow={t('qualitySafetyPage.results.eyebrow')} heading={t('qualitySafetyPage.results.heading')} headingAs="h2" />
      <div className="mt-12 grid grid-cols-12 gap-6">
        {groups.map(({ key, risk, span }) => {
          const g = t(`qualitySafetyPage.results.${key}`, { returnObjects: true }) as ResultGroup;
          return (
            <div key={key} className={cn('flex flex-col rounded-md border border-white/10 bg-graphite p-8', span)}>
              <span className={cn('inline-flex items-center gap-2 text-eyebrow font-semibold uppercase tracking-widest', risk ? 'text-warning' : 'text-brand-400')}>
                <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', risk ? 'bg-warning' : 'bg-brand-400')} />
                {g.tag}
              </span>
              <dl className={cn('mt-6 grid flex-1 content-start gap-8', g.stats.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
                {g.stats.map((s) => (
                  <div key={s.label}>
                    <dd dir="ltr" className="font-display text-stat font-semibold leading-none text-brand-400 rtl:text-end">
                      {s.value}
                    </dd>
                    <dt className="mt-3 text-small text-gray-300">{s.label}<span aria-hidden="true">*</span></dt>
                  </div>
                ))}
              </dl>
              <p className="mt-8 border-t border-white/10 pt-6 text-body text-gray-300">{g.text}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-small text-gray-400">* {t('qualitySafetyPage.results.footnote')}</p>
    </Section>
  );
}

/** The three ISO certificates, each linking to its PDF. */
function Certificates() {
  const { t } = useTranslation(['about', 'common']);
  return (
    <ScrollReveal>
      <Section spacing="lg" background="stone">
        <SectionHeader eyebrow={t('qualitySafetyPage.certs.eyebrow')} heading={t('qualitySafetyPage.certs.heading')} headingAs="h2" />
        <div className="mt-12 grid grid-cols-3 gap-6">
          {certifications.map((c) => {
            const scope = scopeKeys[c.name] ? t(`common:certifications.${scopeKeys[c.name]}`) : c.scope;
            const body = (
              <>
                <span dir="ltr" className="block font-display text-h3 font-semibold text-ink rtl:text-end">
                  {c.name}
                </span>
                <span className="mt-2 block text-small text-gray-600">{scope}</span>
                {c.fileUrl && (
                  <span className="mt-5 inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
                    {t('qualitySafetyPage.certs.viewCertificate')}
                    <ArrowRight size={14} aria-hidden="true" className="rtl:rotate-180" />
                  </span>
                )}
              </>
            );
            const card = 'block rounded-md border border-gray-200 bg-warmwhite p-6 transition-colors duration-base hover:border-brand-300';
            return c.fileUrl ? (
              <a key={c.name} href={c.fileUrl} target="_blank" rel="noopener noreferrer" className={card}>
                {body}
              </a>
            ) : (
              <div key={c.name} className={card}>
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
      <Results />
      <Commitment />
      <Certificates />
    </>
  );
}
