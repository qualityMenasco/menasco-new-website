import { forwardRef } from 'react';
import { Link, useLocation, type LinkProps } from 'react-router-dom';
import { getLocaleFromPath, withLocale } from '../../lib/locale';

export interface LocaleLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

/**
 * Drop-in replacement for react-router's `<Link>` — `to` is always given in
 * its canonical English form (e.g. "/services"); this resolves it to the
 * current locale's equivalent path (e.g. "/ar/services") based on the URL,
 * the single source of truth for locale (see src/lib/locale.ts).
 */
export const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(function LocaleLink({ to, ...rest }, ref) {
  const location = useLocation();
  const locale = getLocaleFromPath(location.pathname);
  return <Link ref={ref} to={withLocale(to, locale)} {...rest} />;
});
