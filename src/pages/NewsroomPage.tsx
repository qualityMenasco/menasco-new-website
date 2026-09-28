import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { SectionHeader } from '../components/typography/SectionHeader';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { FeaturedStoryCard } from '../components/news/FeaturedStoryCard';
import { ArchiveRow } from '../components/news/ArchiveRow';
import { Skeleton } from '../components/feedback/Skeleton';
import { SmartLink } from '../lib/SmartLink';
import { useNewsroomArticles } from '../lib/newsroomPublicApi';
import { getLocaleFromPath } from '../lib/locale';
import { formatNewsDate } from '../lib/formatDate';
import { SEO } from '../seo/SEO';

/** Humanizes a raw slug (e.g. an unrecognized ?tag= value) into a readable fallback label. */
function humanizeSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

const categoryKeys: Record<string, string> = {
  'company-news': 'companyNews',
  'project-news': 'projectNews',
  insights: 'insights',
};

function humanizeCategory(category: string): string {
  return category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Newsroom — up to 3 Featured stories, followed by the full News Archive as
 * chronological rows. Phase 4: reads from the public Newsroom API
 * (published RDS articles only) instead of the static `src/data/news.ts`
 * array; order is derived from each article's `publishedAt`, same as the
 * old `date`-based sort. No article content is currently available in
 * Arabic (see NewsDetailPage's comment) — this page's own chrome strings
 * still come from `newsroom.json` via `t()`.
 */
export default function NewsroomPage() {
  const { t } = useTranslation(['newsroom', 'common']);
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const [searchParams] = useSearchParams();
  const tagSlug = searchParams.get('tag');
  const state = useNewsroomArticles();

  const articles = state.status === 'success' ? state.data : [];
  const byNewestFirst = [...articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const featured = byNewestFirst.filter((article) => article.featured).slice(0, 3);
  const archive = byNewestFirst.filter((article) => !featured.includes(article));

  const taggedArticles = tagSlug ? byNewestFirst.filter((article) => article.tags.some((tag) => tag.slug === tagSlug)) : [];
  const matchedTag = tagSlug ? taggedArticles[0]?.tags.find((tag) => tag.slug === tagSlug) : undefined;
  const activeTagName = tagSlug ? (matchedTag ? matchedTag.name : humanizeSlug(tagSlug)) : '';

  const categoryLabel = (category: string | null) => {
    if (!category) return '';
    const key = categoryKeys[category];
    return key ? t(`newsroom:categories.${key}`) : humanizeCategory(category);
  };

  return (
    <>
      <SEO
        title={t('newsroom:seo.title')}
        description={t('newsroom:seo.description')}
        path="/newsroom"
        pageType="CollectionPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Newsroom', path: '/newsroom' }]}
      />

      <Section spacing="sm" background="warmwhite" className="!pb-6">
        <SectionHeader
          eyebrow={t('newsroom:eyebrow')}
          heading={t('newsroom:heading')}
          description={t('newsroom:description')}
          headingAs="h2"
        />
      </Section>

      {state.status === 'loading' && (
        <section className="bg-warmwhite pb-16 md:pb-24" aria-busy="true" aria-live="polite">
          <Container>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton variant="text" className="w-1/3" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" className="w-2/3" />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {state.status === 'error' && (
        <section className="bg-warmwhite pb-16 md:pb-24">
          <Container>
            <Text variant="body-lg" muted role="alert">
              {t('newsroom:loadError', { defaultValue: "We couldn't load the Newsroom right now. Please try again shortly." })}
            </Text>
          </Container>
        </section>
      )}

      {state.status === 'success' && articles.length === 0 && !tagSlug && (
        <section className="bg-warmwhite pb-16 md:pb-24">
          <Container>
            <Text variant="body-lg" muted>
              {t('newsroom:noArticles', { defaultValue: 'No articles have been published yet. Check back soon.' })}
            </Text>
          </Container>
        </section>
      )}

      {state.status === 'success' && tagSlug ? (
        <section className="bg-warmwhite pb-16 pt-4 md:pb-24 md:pt-6">
          <Container>
            <Stack space="sm">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Heading level="h4" as="h3">
                  {t('newsroom:taggedHeading', { tag: activeTagName })}
                </Heading>
                <SmartLink
                  href="/newsroom"
                  className="text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
                >
                  {t('newsroom:clearFilter')}
                </SmartLink>
              </div>

              {taggedArticles.length > 0 ? (
                <div className="flex flex-col">
                  {taggedArticles.map((article) => (
                    <ArchiveRow
                      key={article.id}
                      href={`/newsroom/${article.slug}`}
                      categoryLabel={categoryLabel(article.category)}
                      date={formatNewsDate(article.publishedAt, locale)}
                      title={article.title}
                      readMoreLabel={t('newsroom:readMore')}
                    />
                  ))}
                </div>
              ) : (
                <Text variant="body-lg" muted>
                  {t('newsroom:noTaggedArticles')}
                </Text>
              )}
            </Stack>
          </Container>
        </section>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="bg-warmwhite pb-10 md:pb-14">
              <Container>
                <Stack space="md">
                  <Eyebrow>{t('newsroom:featuredLabel')}</Eyebrow>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    {featured.map((article) => (
                      <FeaturedStoryCard
                        key={article.id}
                        href={`/newsroom/${article.slug}`}
                        image={article.primaryImage?.url}
                        categoryLabel={categoryLabel(article.category)}
                        date={formatNewsDate(article.publishedAt, locale)}
                        title={article.title}
                        subtitle={article.subtitle ?? ''}
                        readMoreLabel={t('newsroom:readMore')}
                      />
                    ))}
                  </div>
                </Stack>
              </Container>
            </section>
          )}

          {archive.length > 0 && (
            <section className="bg-warmwhite pb-16 pt-4 md:pb-24 md:pt-6">
              <Container>
                <Stack space="sm">
                  <Eyebrow>{t('newsroom:archiveLabel')}</Eyebrow>
                  <div className="flex flex-col">
                    {archive.map((article) => (
                      <ArchiveRow
                        key={article.id}
                        href={`/newsroom/${article.slug}`}
                        categoryLabel={categoryLabel(article.category)}
                        date={formatNewsDate(article.publishedAt, locale)}
                        title={article.title}
                        readMoreLabel={t('newsroom:readMore')}
                      />
                    ))}
                  </div>
                </Stack>
              </Container>
            </section>
          )}
        </>
      )}
    </>
  );
}
