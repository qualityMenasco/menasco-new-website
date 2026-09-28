import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { FeaturedNewsCarousel } from '../components/FeaturedNewsCarousel';
import { NewsArchiveRow } from '../components/NewsArchiveRow';
import { NavSectionH1 } from '../../components/typography/NavSectionH1';
import { Skeleton } from '../../components/feedback/Skeleton';
import { SEO } from '../../seo/SEO';
import { SmartLink } from '../../lib/SmartLink';
import { useNewsroomArticles } from '../../lib/newsroomPublicApi';
import { getLocaleFromPath } from '../../lib/locale';
import { formatNewsDate } from '../../lib/formatDate';

const categoryKeys: Record<string, string> = {
  'company-news': 'companyNews',
  'project-news': 'projectNews',
  insights: 'insights',
};

function humanizeCategory(category: string): string {
  return category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Humanizes a raw slug (e.g. an unrecognized ?tag= value) into a readable fallback label. */
function humanizeSlug(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

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
  const carouselStories = featured.map((article) => ({
    id: article.id,
    slug: article.slug,
    category: article.category,
    date: article.publishedAt,
    title: article.title,
    subtitle: article.subtitle,
    images: article.primaryImage ? [{ src: article.primaryImage.url }] : [],
  }));

  const taggedArticles = tagSlug ? byNewestFirst.filter((article) => article.tags.some((tag) => tag.slug === tagSlug)) : [];
  const matchedTag = tagSlug ? taggedArticles[0]?.tags.find((tag) => tag.slug === tagSlug) : undefined;
  const activeTagName = tagSlug ? (matchedTag ? matchedTag.name : humanizeSlug(tagSlug)) : '';

  const categoryLabel = (category: string) => {
    const key = categoryKeys[category];
    return key ? t(`newsroom:categories.${key}`) : humanizeCategory(category);
  };
  const dateLabel = (date: string) => formatNewsDate(date, locale);

  return (
    <>
      <NavSectionH1 section="newsroom" />
      <SEO
        title={t('newsroom:seo.title')}
        description={t('newsroom:seo.description')}
        path="/newsroom"
        pageType="CollectionPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Newsroom', path: '/newsroom' }]}
      />

      <section className="px-4 pb-2 pt-6">
        <SectionHeader
          eyebrow={t('newsroom:eyebrow')}
          heading={t('newsroom:heading')}
          headingAs="h2"
          description={t('newsroom:description')}
        />
      </section>

      {state.status === 'loading' && (
        <section className="px-4 pb-10" aria-busy="true" aria-live="polite">
          <div className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" />
          </div>
        </section>
      )}

      {state.status === 'error' && (
        <section className="px-4 pb-10">
          <p className="text-body text-gray-600" role="alert">
            {t('newsroom:loadError', { defaultValue: "We couldn't load the Newsroom right now. Please try again shortly." })}
          </p>
        </section>
      )}

      {state.status === 'success' && articles.length === 0 && !tagSlug && (
        <section className="px-4 pb-10">
          <p className="text-body text-gray-600">{t('newsroom:noArticles', { defaultValue: 'No articles have been published yet. Check back soon.' })}</p>
        </section>
      )}

      {state.status === 'success' && tagSlug ? (
        <section className="px-4 pb-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-h4 font-semibold tracking-tight text-ink">
              {t('newsroom:taggedHeading', { tag: activeTagName })}
            </h3>
            <SmartLink href="/newsroom" className="text-small font-semibold text-brand-600">
              {t('newsroom:clearFilter')}
            </SmartLink>
          </div>

          {taggedArticles.length > 0 ? (
            <div className="mt-3 flex flex-col">
              {taggedArticles.map((article) => (
                <NewsArchiveRow
                  key={article.id}
                  href={`/newsroom/${article.slug}`}
                  categoryLabel={article.category ? categoryLabel(article.category) : ''}
                  date={dateLabel(article.publishedAt)}
                  title={article.title}
                  readMoreLabel={t('newsroom:readMore')}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-body text-gray-600">{t('newsroom:noTaggedArticles')}</p>
          )}
        </section>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="pb-8">
              <div className="mb-4 px-4">
                <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('newsroom:featuredLabel')}</span>
              </div>
              <FeaturedNewsCarousel stories={carouselStories} categoryLabel={categoryLabel} formatDate={dateLabel} />
            </section>
          )}

          {archive.length > 0 && (
            <section className="px-4 pb-10">
              <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('newsroom:archiveLabel')}</span>
              <div className="mt-3 flex flex-col">
                {archive.map((article) => (
                  <NewsArchiveRow
                    key={article.id}
                    href={`/newsroom/${article.slug}`}
                    categoryLabel={article.category ? categoryLabel(article.category) : ''}
                    date={dateLabel(article.publishedAt)}
                    title={article.title}
                    readMoreLabel={t('newsroom:readMore')}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
