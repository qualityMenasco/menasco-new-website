import type { ReactNode } from 'react';
import { Stack } from '../layout/Stack';
import { Heading, Text } from '../typography/Typography';
import type { ArticleSection, ContentBlock, PublicImage } from '../../lib/newsroomPublicApi';

/**
 * Renders `structured_content` (Phase 2's block model) using the site's
 * existing typography components/classes — an adapter, not a redesign.
 * Reuses the exact same visual treatment the old static
 * body/sections/pullQuote/secondaryImage/closing fields used to get
 * (see NewsDetailPage's pre-Phase-4 JSX): `Text variant="body-lg"` for
 * prose, `Heading level="h3" as="h3"` for section headings, the same
 * blockquote classes for `quote` blocks, the same aspect-ratio image
 * wrapper for `image` blocks. Never renders raw HTML — every block type is
 * mapped to real JSX explicitly.
 *
 * A missing image reference (a `type: 'image'` block whose `imageId` isn't
 * in the article's own `images[]`) is skipped rather than crashing the
 * page — `structured_content` is model output, not a guaranteed-consistent
 * hand-authored document, and an editor can also delete an image after a
 * block already references it.
 */

interface Props {
  sections: ArticleSection[];
  images: PublicImage[];
  /** Mobile pages use plain `<p>`/`<h3>` + Tailwind classes rather than the desktop `Text`/`Heading` components — matches each page's pre-existing convention exactly. */
  mobile?: boolean;
}

// Block text is plain data (see structuredContent.ts's zod schema), never
// HTML, so a live URL typed by a writer — either bare
// (`https://example.com`) or markdown-style (`[label](https://example.com)`
// for custom link text) — only becomes a clickable <a> through this parser,
// never via dangerouslySetInnerHTML. Only http(s) URLs are linkified;
// anything else (mailto:, javascript:, etc.) is left as plain text.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>"')\]]+)/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

function linkify(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    if (match[1] && match[2]) {
      nodes.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline decoration-1 underline-offset-2 hover:text-brand-700">
          {match[1]}
        </a>,
      );
    } else if (match[3]) {
      // A bare URL often has sentence punctuation stuck to it ("...site.com.")
      // — strip trailing punctuation from the link itself and render it as
      // plain text after, so the period/comma isn't swallowed into the href.
      const trailing = match[3].match(TRAILING_PUNCTUATION)?.[0] ?? '';
      const url = trailing ? match[3].slice(0, -trailing.length) : match[3];
      nodes.push(
        <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className="break-words text-brand-600 underline decoration-1 underline-offset-2 hover:text-brand-700">
          {url}
        </a>,
      );
      if (trailing) nodes.push(trailing);
    }

    lastIndex = LINK_PATTERN.lastIndex;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

// `dir="auto"` on every text-bearing element below — the browser picks
// LTR/RTL per element from the first strong-directional character in ITS
// OWN text (not a per-article or per-section flag), so an Arabic
// paragraph displays right-to-left and right-aligned, an English one
// stays left-to-right, and a section mixing both (e.g. an English
// paragraph under an Arabic heading, or vice versa) gets each element
// resolved independently and correctly rather than inheriting a single
// wrong direction from its neighbor. No language field is read and no
// string is ever reversed — `dir="auto"` is a native HTML behavior.

function DesktopBlock({ block, images }: { block: ContentBlock; images: PublicImage[] }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <Text variant="body-lg" dir="auto">
          {linkify(block.text)}
        </Text>
      );
    case 'heading':
      return (
        <Heading level={block.level === 2 ? 'h3' : 'h4'} as="h3" dir="auto">
          {linkify(block.text)}
        </Heading>
      );
    case 'bullet_list':
      return (
        <ul className="list-disc space-y-1.5 ps-5 text-body-lg text-ink" dir="auto">
          {block.items.map((item, i) => (
            <li key={i}>{linkify(item)}</li>
          ))}
        </ul>
      );
    case 'numbered_list':
      return (
        <ol className="list-decimal space-y-1.5 ps-5 text-body-lg text-ink" dir="auto">
          {block.items.map((item, i) => (
            <li key={i}>{linkify(item)}</li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote className="border-s-4 border-brand-600 py-1 ps-5 font-display text-h4 font-semibold leading-snug text-ink" dir="auto">
          {linkify(block.text)}
        </blockquote>
      );
    case 'image': {
      const image = images.find((img) => img.id === block.imageId);
      if (!image) return null;
      return (
        <figure className="my-2 aspect-[16/9] w-full overflow-hidden rounded-md bg-gray-100">
          <img src={image.url} alt={image.altText ?? ''} loading="lazy" className="h-full w-full object-cover" />
          {(block.caption || image.caption) && (
            <figcaption className="mt-2 text-caption text-gray-500" dir="auto">
              {block.caption || image.caption}
            </figcaption>
          )}
        </figure>
      );
    }
  }
}

function MobileBlock({ block, images }: { block: ContentBlock; images: PublicImage[] }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-body leading-relaxed text-gray-700" dir="auto">
          {linkify(block.text)}
        </p>
      );
    case 'heading':
      return (
        <h3 className="font-display text-h4 font-semibold tracking-tight text-ink" dir="auto">
          {linkify(block.text)}
        </h3>
      );
    case 'bullet_list':
      return (
        <ul className="list-disc space-y-1 ps-5 text-body text-gray-700" dir="auto">
          {block.items.map((item, i) => (
            <li key={i}>{linkify(item)}</li>
          ))}
        </ul>
      );
    case 'numbered_list':
      return (
        <ol className="list-decimal space-y-1 ps-5 text-body text-gray-700" dir="auto">
          {block.items.map((item, i) => (
            <li key={i}>{linkify(item)}</li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote className="border-s-4 border-brand-600 py-1 ps-4 font-display text-h4 font-semibold leading-snug text-ink" dir="auto">
          {linkify(block.text)}
        </blockquote>
      );
    case 'image': {
      const image = images.find((img) => img.id === block.imageId);
      if (!image) return null;
      return (
        <figure className="aspect-[16/10] w-full overflow-hidden rounded-md bg-gray-100">
          <img src={image.url} alt={image.altText ?? ''} loading="lazy" className="h-full w-full object-cover" />
        </figure>
      );
    }
  }
}

export function ArticleStructuredContent({ sections, images, mobile }: Props) {
  const Block = mobile ? MobileBlock : DesktopBlock;
  return (
    <>
      {sections.map((section, i) =>
        mobile ? (
          <div key={i} className="mt-8 flex flex-col gap-4 first:mt-6">
            {section.heading && (
              <h3 className="font-display text-h4 font-semibold tracking-tight text-ink" dir="auto">
                {section.heading}
              </h3>
            )}
            {section.blocks.map((block, j) => (
              <Block key={j} block={block} images={images} />
            ))}
          </div>
        ) : (
          <Stack space="sm" key={i}>
            {section.heading && (
              <Heading level="h3" as="h3" dir="auto">
                {section.heading}
              </Heading>
            )}
            {section.blocks.map((block, j) => (
              <Block key={j} block={block} images={images} />
            ))}
          </Stack>
        ),
      )}
    </>
  );
}
