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

  const galleryImages = article.images.length > 0 ? article.images.map((img) => ({ src: img.url, alt: img.altText ?? '', mediaType: img.mediaType })) : [];

  return (
    <Section spacing="lg" background="warmwhite">
      <Container width="standard">
        {/*
          Two grid items only: the text column (back link through Related
          Topics, all stacked together) and the media column (just the
          gallery) — not one grid item per piece of content, the way this
          used to be split into 6 explicitly row-placed items. That's a
          deliberate choice for "sticky side media": a CSS Grid item only
          keeps its `position: sticky` in effect for the full height of its
          OWN row track, so the gallery has to be the sole occupant of a row
          that's exactly as tall as the text column — splitting Related
          Topics into a second item sharing the media column (the previous
          layout) would carve that row into two shorter ones, and the
          gallery would stop sticking almost immediately after it started.
          Related Topics therefore moved into the text column, right after
          the body — not the sidebar — which is also why `lg:items-start` on
          the grid still matters: without it, the short gallery item would
          stretch to match the much taller text column instead of sitting
          at its natural height and sticking within the leftover space.
          `min-w-0` goes on the text column wrapper only (not each child):
          now that the column's children are plain block elements inside a
          flex column rather than grid items themselves, the "a grid item's
          default min-width is auto" quirk that let long unbroken text
          overflow the column only needs fixing once, at the wrapper.
          `order-first lg:order-none` on the gallery is for the narrow/
          stacked fallback (this component only ever renders at desktop
          widths — real phones use `src/mobile/components/ArticleDetailView`
          — so this just covers a resized-narrow desktop window): showing
          the hero media first there reads better than it landing after
          Related Topics at the very bottom.
        */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-[3fr_2fr] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6 lg:col-start-1">
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

            <Heading level="h1" as="h2" dir="auto">
              {article.title}
            </Heading>

            {article.subtitle && (
              <Text variant="body-lg" muted dir="auto" className="max-w-2xl">
                {article.subtitle}
              </Text>
            )}

            <Stack space="lg" as="article" className="max-w-2xl">
              <ArticleStructuredContent sections={article.structuredContent.sections} images={article.images} />
            </Stack>

            {article.tags.length > 0 && (
              <aside>
                <ArticleTopics tags={article.tags} heading={t('newsroom:relatedTopics')} />
              </aside>
            )}
          </div>

          {galleryImages.length > 0 && (
            <ArticleImageGallery
              images={galleryImages}
              previousLabel={t('newsroom:gallery.previousImage')}
              nextLabel={t('newsroom:gallery.nextImage')}
              positionLabel={(current, total) =>
                t('newsroom:gallery.position', { current: String(current).padStart(2, '0'), total: String(total).padStart(2, '0') })
              }
              className="order-first min-w-0 lg:order-none lg:col-start-2 lg:sticky lg:top-28 lg:self-start"
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
