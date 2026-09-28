import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Container } from '../components/layout/Container';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Text } from '../components/typography/Typography';
import { ArticleDetailView } from '../components/news/ArticleDetailView';
import { ArchiveRow } from '../components/news/ArchiveRow';
import { Skeleton } from '../components/feedback/Skeleton';
import { useNewsroomArticle, useNewsroomArticles } from '../lib/newsroomPublicApi';
import { getLocaleFromPath } from '../lib/locale';
import { formatNewsDate } from '../lib/formatDate';
import { SEO } from '../seo/SEO';
import { articleJsonLd } from '../seo/structuredData';
import { toAbsoluteUrl } from '../seo/constants';

/**
 * Phase 4: reads the published article from the public Newsroom API
 * (RDS-backed, `status = 'published'` only — see
 * `api/_lib/newsroom/publicArticles.ts`) instead of the static
 * `src/data/news.ts` array. Visual structure is unchanged; only the data
 * source and the body-content renderer changed (see
 * `ArticleStructuredContent`, which adapts `structured_content`'s block
 * model onto the exact same typography this page always used).
 *
 * No Arabic article content exists in RDS yet (Phase 1-3 built no
 * translation mechanism for `structured_content`) — the /ar route renders
 * the same English article content Phase 4 scope does not fabricate a
 * translation. Page chrome strings (back link, "Published on", category
 * labels) still come from `newsroom.json` via `t()`, same as before.
 */

const categoryKeys: Record<string, string> = {
  'company-news': 'companyNews',
  'project-news': 'projectNews',
  insights: 'insights',
};

function humanizeCategory(category: string): string {
  return category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function NewsDetailPage() {
  const { t } = useTranslation(['newsroom', 'common']);
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  const state = useNewsroomArticle(slug);
  // Fetched in parallel with the article detail (both trigger on mount, no dependency between them) — used only for the "Related stories" strip below, so a slow/failed list fetch never blocks the article itself from rendering.
  const listState = useNewsroomArticles();

  if (state.status === 'loading') {
    return (
      <Section spacing="lg" background="warmwhite">
        <Container width="standard">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-12" aria-busy="true" aria-live="polite">
            <div className="flex flex-col gap-4">
              <Skeleton variant="text" className="w-40" />
              <Skeleton variant="text" className="h-10 w-3/4" />
              <Skeleton variant="text" className="w-full" />
              <Skeleton variant="text" className="w-2/3" />
            </div>
            <Skeleton className="aspect-[16/10] w-full" />
          </div>
        </Container>
      </Section>
    );
  }
  if (state.status === 'error') {
    return (
      <Section spacing="lg" background="warmwhite">
        <Container width="standard">
          <Text variant="body-lg" muted role="alert">
            {t('newsroom:loadError', { defaultValue: "We couldn't load this article right now. Please try again shortly." })}
          </Text>
        </Container>
      </Section>
    );
  }
  const article = state.data;
  if (!article) return <Navigate to="/404" replace />;

  const related = (listState.status === 'success' ? listState.data : [])
    .filter((entry) => entry.slug !== article.slug)
    .sort((a, b) => (a.category === article.category ? -1 : 1) - (b.category === article.category ? -1 : 1) || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);

  const categoryLabel = (category: string | null) => {
    if (!category) return '';
    const key = categoryKeys[category];
    return key ? t(`newsroom:categories.${key}`) : humanizeCategory(category);
  };

  // Same-origin relative URL for the <img> tag itself (fine, proxied by a Vercel rewrite);
  // absolute for OG/Twitter/JSON-LD, which crawlers can't resolve relative to the page.
  const primaryImageUrl = article.primaryImage?.url ? toAbsoluteUrl(article.primaryImage.url) : undefined;

  return (
    <>
      <SEO
        title={article.title}
        description={article.subtitle ?? ''}
        path={`/newsroom/${article.slug}`}
        ogImage={primaryImageUrl}
        breadcrumb={[
          { label: 'Home', path: '/' },
          { label: 'Newsroom', path: '/newsroom' },
          { label: article.title, path: `/newsroom/${article.slug}` },
        ]}
        structuredData={articleJsonLd({
          title: article.title,
          description: article.subtitle ?? '',
          path: `/newsroom/${article.slug}`,
          datePublished: article.publishedAt,
          image: primaryImageUrl,
        })}
      />

      <ArticleDetailView article={article} locale={locale} />

      {related.length > 0 && (
        <Section spacing="lg" background="stone" edgeFade>
          <Stack space="sm">
            <Eyebrow>{t('newsroom:relatedStories')}</Eyebrow>
            <div className="flex flex-col">
              {related.map((entry) => (
                <ArchiveRow
                  key={entry.id}
                  href={`/newsroom/${entry.slug}`}
                  categoryLabel={categoryLabel(entry.category)}
                  date={formatNewsDate(entry.publishedAt, locale)}
                  title={entry.title}
                  readMoreLabel={t('newsroom:readMore')}
                />
              ))}
            </div>
          </Stack>
        </Section>
      )}
    </>
  );
}
