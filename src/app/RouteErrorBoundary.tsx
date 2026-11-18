import { useEffect } from 'react';
import { isRouteErrorResponse, useLocation, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatusScreen } from '../components/feedback/StatusScreen';
import { SEO } from '../seo/SEO';
import { directionForLocale, getLocaleFromPath } from '../lib/locale';
import { isChunkLoadError, reloadForStaleBuild } from '../lib/staleBuild';

/**
 * The router's errorElement (both root routes, src/app/router.tsx). Replaces
 * React Router's default "Unexpected Application Error" screen with the
 * branded StatusScreen:
 *  - a 404 route response -> the friendly "page not found" screen;
 *  - a missing lazy chunk after a deploy -> one reload onto the current build
 *    (the same stale-build recovery the lazy routes use);
 *  - anything else -> "something went wrong" with Try again / Back home.
 * It renders without RootLayout (the layout itself may be what failed), so it
 * keeps the document language/direction in sync itself.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation('common');
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    const locale = getLocaleFromPath(pathname);
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = directionForLocale(locale);
  }, [pathname, i18n]);

  useEffect(() => {
    if (!notFound && isChunkLoadError(error)) reloadForStaleBuild();
    if (!notFound && import.meta.env.DEV) console.error(error);
  }, [error, notFound]);

  const kind = notFound ? 'notFound' : 'error';
  return (
    <>
      <SEO title={t(`errorPages.${kind}.seoTitle`)} description={t(`errorPages.${kind}.description`)} path={pathname.replace(/^\/ar(?=\/|$)/, '') || '/'} noIndex />
      <main id="main-content">
        <StatusScreen kind={kind} standalone />
      </main>
    </>
  );
}
