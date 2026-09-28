import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Section } from '../layout/Section';
import { Container } from '../layout/Container';
import { Stack } from '../layout/Stack';
import { Eyebrow, Heading, Text } from '../typography/Typography';
import { ArticleTopics } from './ArticleTopics';
import { ArticleImageGallery } from './ArticleImageGallery';
import { ArticleStructuredContent } from './ArticleStructuredContent';
import { SmartLink } from '../../lib/SmartLink';
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
 * real public NewsDetailPage and the Newsroom admin's "Preview Article"
 * overlay, so the two can never visually drift apart. Deliberately excludes
 * SEO/JSON-LD and the "Related stories" strip, which only make sense for a
 * real, published, routable article.
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
    <Section spacing="lg" background="warmwhite">
      <Container width="standard">
        {/*
          One grid for the whole article, not two independently-sized
          layouts stacked on top of each other — the left/right tracks
          (3fr/2fr) stay identical from the header down through the body,
          so the image and Related Topics genuinely share a column instead
          of only visually resembling one. Every left-column child gets
          `min-w-0`: a grid item's default min-width is `auto` (sized to
          its content), which lets long unbroken text (a long title,
          mid-word) overflow straight through the column boundary instead
          of wrapping — `min-w-0` is what allows the width constraint from
          the `3fr` track to actually apply to text sizing.
          The image is placed at the title's row and spans through the
          subtitle's row (`row-start-2` + `row-span-2`) — its top edge
          lands exactly on the title row's top edge, i.e. the title's
          first line, for any title length, with no fixed offset.
        */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-4 lg:grid-cols-[3fr_2fr] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
            <SmartLink
              href="/newsroom"
              onClick={onBackClick}
              className="inline-flex w-fit items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
            >
              <ArrowLeft size={15} aria-hidden="true" className="rtl:rotate-180" />
              {t('newsroom:backToNewsroom')}
            </SmartLink>

            <div className="flex flex-wrap items-center gap-3">
              {article.category && <Eyebrow>{categoryLabel(article.category)}</Eyebrow>}
              <Text variant="small" muted>
                <time dateTime={article.publishedAt}>{t('newsroom:publishedOn', { date: formatNewsDate(article.publishedAt, locale) })}</time>
              </Text>
            </div>
          </div>

          <Heading level="h1" as="h2" className="min-w-0 lg:col-start-1 lg:row-start-2">
            {article.title}
          </Heading>

          {article.subtitle && (
            <Text variant="body-lg" muted className="min-w-0 max-w-2xl lg:col-start-1 lg:row-start-3">
              {article.subtitle}
            </Text>
          )}

          {galleryImages.length > 0 && (
            <ArticleImageGallery
              images={galleryImages}
              previousLabel={t('newsroom:gallery.previousImage')}
              nextLabel={t('newsroom:gallery.nextImage')}
              positionLabel={(current, total) =>
                t('newsroom:gallery.position', { current: String(current).padStart(2, '0'), total: String(total).padStart(2, '0') })
              }
              className="mt-4 lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:mt-0"
            />
          )}

          <Stack space="lg" as="article" className="min-w-0 mt-4 max-w-2xl lg:col-start-1 lg:row-start-4">
            <ArticleStructuredContent sections={article.structuredContent.sections} images={article.images} />
          </Stack>

          {article.tags.length > 0 && (
            <aside className="min-w-0 mt-4 lg:col-start-2 lg:row-start-4">
              <ArticleTopics tags={article.tags} heading={t('newsroom:relatedTopics')} />
            </aside>
          )}
        </div>
      </Container>
    </Section>
  );
}
