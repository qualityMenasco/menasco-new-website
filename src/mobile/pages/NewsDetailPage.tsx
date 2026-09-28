import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NewsArchiveRow } from '../components/NewsArchiveRow';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { ArticleDetailView } from '../components/ArticleDetailView';
import { Skeleton } from '../../components/feedback/Skeleton';
import { useNewsroomArticle, useNewsroomArticles } from '../../lib/newsroomPublicApi';
import { getLocaleFromPath } from '../../lib/locale';
import { formatNewsDate } from '../../lib/formatDate';
import { SEO } from '../../seo/SEO';
import { articleJsonLd } from '../../seo/structuredData';
import { toAbsoluteUrl } from '../../seo/constants';

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
  const listState = useNewsroomArticles();

  if (state.status === 'loading') {
    return (
      <section className="px-4 py-8" aria-busy="true" aria-live="polite">
        <div className="flex flex-col gap-4">
          <Skeleton variant="text" className="w-32" />
          <Skeleton variant="text" className="h-8 w-3/4" />
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      </section>
    );
  }
  if (state.status === 'error') {
    return (
      <section className="px-4 py-8">
        <p className="text-body text-gray-600" role="alert">
          {t('newsroom:loadError', { defaultValue: "We couldn't load this article right now. Please try again shortly." })}
        </p>
      </section>
    );
  }
  const article = state.data;
  if (!article) return <Navigate to="/404" replace />;

  const categoryLabel = (category: string | null) => {
    if (!category) return '';
    const key = categoryKeys[category];
    return key ? t(`newsroom:categories.${key}`) : humanizeCategory(category);
  };

  // Same-origin relative URL for the <img> tag itself (fine, proxied by a Vercel rewrite);
  // absolute for OG/Twitter/JSON-LD, which crawlers can't resolve relative to the page.
  const primaryImageUrl = article.primaryImage?.url ? toAbsoluteUrl(article.primaryImage.url) : undefined;

  const related = (listState.status === 'success' ? listState.data : [])
    .filter((entry) => entry.slug !== article.slug)
    .sort((a, b) => (a.category === article.category ? -1 : 1) - (b.category === article.category ? -1 : 1) || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);

  return (
    <>
      <NavSectionH1 section="newsroom" />
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
        <section className="bg-stone px-4 py-8">
          <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('newsroom:relatedStories')}</span>
          <div className="mt-3 flex flex-col">
            {related.map((entry) => (
              <NewsArchiveRow
                key={entry.id}
                href={`/newsroom/${entry.slug}`}
                categoryLabel={categoryLabel(entry.category)}
                date={formatNewsDate(entry.publishedAt, locale)}
                title={entry.title}
                readMoreLabel={t('newsroom:readMore')}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
