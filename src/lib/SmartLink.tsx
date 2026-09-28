import { forwardRef, useCallback } from 'react';
import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { scrollToSection } from './scrollToSection';
import { usePrefersReducedMotion } from './hooks';
import { getLocaleFromPath, withLocale } from './locale';

export interface SmartLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

const HOME_SECTION_PATTERN = /^\/#([\w-]+)$/;

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * Renders a client-side react-router `<Link>` for internal paths ("/services"),
 * a plain `<a>` for everything else (external URLs, "#anchor", "tel:", "mailto:").
 *
 * `href` is always given in its canonical English form (e.g. "/services") —
 * this component resolves it to the current locale's equivalent path (e.g.
 * "/ar/services") based on the URL, the single source of truth for locale
 * (see src/lib/locale.ts). Every internal link in the app goes through this
 * one component specifically so that locale-prefixing only has to be
 * implemented once.
 *
 * Hrefs shaped like "/#section-id" get special handling for the homepage's
 * scroll-spy nav: on the homepage, they smooth-scroll in place; from any
 * other route, they navigate home first and let HomePage's mount effect
 * scroll to the target once it's rendered. This is the one place that
 * behavior lives, so every consumer (header, footer, cards) gets it for free.
 */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(function SmartLink(
  { href, onClick, children, ...rest },
  ref,
) {
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const locale = getLocaleFromPath(location.pathname);
  const sectionMatch = href.match(HOME_SECTION_PATTERN);
  const homePath = withLocale('/', locale);

  const handleSectionClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || !sectionMatch || !isPlainLeftClick(event)) return;

      const id = sectionMatch[1];
      event.preventDefault();

      if (location.pathname === homePath) {
        const scrolled = scrollToSection(id, reducedMotion ? 'auto' : 'smooth');
        if (scrolled) navigate(`${homePath}#${id}`, { replace: true });
      } else {
        navigate(`${homePath}#${id}`);
      }
    },
    [onClick, sectionMatch, location.pathname, homePath, reducedMotion, navigate],
  );

  if (sectionMatch) {
    return (
      <a ref={ref} href={`${homePath}#${sectionMatch[1]}`} onClick={handleSectionClick} {...rest}>
        {children}
      </a>
    );
  }

  // A path with a file extension (e.g. "/menasco-company-profile.pdf") is a
  // direct asset download, not an SPA route — always let the browser handle
  // it natively (respecting a `download` attribute) rather than routing it
  // through react-router's <Link>, which has no matching route for it.
  const isFileDownload = /\.[a-z0-9]{2,4}$/i.test(href);
  const isInternal = href.startsWith('/') && !href.startsWith('//') && !isFileDownload;
  if (isInternal) {
    return (
      <Link ref={ref} to={withLocale(href, locale)} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a ref={ref} href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  );
});
