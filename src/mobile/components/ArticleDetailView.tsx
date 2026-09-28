import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { LocaleLink } from './LocaleLink';
import { ArticleTopics } from '../../components/news/ArticleTopics';
import { ArticleImageGallery } from '../../components/news/ArticleImageGallery';
import { ArticleStructuredContent } from '../../components/news/ArticleStructuredContent';
import { formatNewsDate } from '../../lib/formatDate';
import type { Locale } from '../../lib/i18n';
import type { PublicArticleTag, PublicImage, StructuredContent } from '../../lib/newsroomPublicApi';

const categoryKeys: Record<string, string> = {
  'company-news': 'companyNews',
  'project-news': 'projectNews',
  insights: 'insights',
};

function humanizeCategory(category: string): string {
  return category.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export interface ArticleDetailViewArticle {
  title: string;
  subtitle: string | null;
  category: string | null;
  publishedAt: string;
  tags: PublicArticleTag[];
  images: PublicImage[];
  structuredContent: StructuredContent;
}

export interface ArticleDetailViewProps {
  article: ArticleDetailViewArticle;
  locale: Locale;
  /** Intercepts the "Back to Newsroom" link — used by the Newsroom admin's Preview Article overlay so opening a preview can never navigate away from the editor. Omit for the real public page, where it should behave as a normal link. */
  onBackClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * The article body — back link, category/date, title/subtitle, image
 * gallery, structured content, and topics — shared verbatim between the
 * real public mobile NewsDetailPage and the Newsroom admin's "Preview
 * Article" overlay (mobile mode), so the two can never visually drift
 * apart. Deliberately excludes SEO/JSON-LD and the "Related stories" strip,
 * which only make sense for a real, published, routable article.
 */
export function ArticleDetailView({ article, locale, onBackClick }: ArticleDetailViewProps) {
  const { t } = useTranslation(['newsroom', 'common']);

  const categoryLabel = (category: string | null) => {
    if (!category) return '';
    const key = categoryKeys[category];
    return key ? t(`newsroom:categories.${key}`) : humanizeCategory(category);
  };

  const galleryImages = article.images.length > 0 ? article.images.map((img) => ({ src: img.url, alt: img.altText ?? '' })) : [];

  return (
    <section className="px-4 py-8">
      <LocaleLink to="/newsroom" onClick={onBackClick} className="inline-flex items-center gap-1.5 text-small font-semibold text-brand-600">
        <ArrowLeft size={15} aria-hidden="true" className="rtl:rotate-180" />
        {t('newsroom:backToNewsroom')}
      </LocaleLink>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {article.category && (
          <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{categoryLabel(article.category)}</span>
        )}
        <time dateTime={article.publishedAt} className="text-small text-gray-500">
          {t('newsroom:publishedOn', { date: formatNewsDate(article.publishedAt, locale) })}
        </time>
      </div>
      <h2 className="mt-2 font-display text-h2 font-semibold tracking-tight text-ink">{article.title}</h2>
      {article.subtitle && <p className="mt-2 text-body text-gray-600">{article.subtitle}</p>}

      {galleryImages.length > 0 && (
        <div className="mt-6">
          <ArticleImageGallery
            images={galleryImages}
            previousLabel={t('newsroom:gallery.previousImage')}
            nextLabel={t('newsroom:gallery.nextImage')}
            positionLabel={(current, total) =>
              t('newsroom:gallery.position', { current: String(current).padStart(2, '0'), total: String(total).padStart(2, '0') })
            }
          />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <ArticleStructuredContent sections={article.structuredContent.sections} images={article.images} mobile />
      </div>

      {article.tags.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <ArticleTopics tags={article.tags} heading={t('newsroom:relatedTopics')} />
        </div>
      )}
    </section>
  );
}
