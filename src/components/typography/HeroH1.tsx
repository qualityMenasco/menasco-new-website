import type { ReactNode } from 'react';

/**
 * A page's single <h1>, built from its visible hero eyebrow and title with no
 * change to wording or looks: the <h1> is `display: contents`, so the eyebrow
 * and title (rendered as block <span>s with their usual styles) lay out exactly
 * as before, while search engines and screen readers read one heading:
 * "Eyebrow: Title". Pages using this are listed in src/seo/pageH1.ts.
 */
export function HeroH1({ eyebrow, title }: { eyebrow: ReactNode; title: ReactNode }) {
  return (
    <h1 className="contents">
      {eyebrow}
      <span className="sr-only">: </span>
      {title}
    </h1>
  );
}
