import { useTranslation } from 'react-i18next';
import { StatusScreen } from '../components/feedback/StatusScreen';
import { SEO } from '../seo/SEO';

/** 404 page (the router's catch-all route) — shown inside the normal site header and footer. */
export default function NotFoundPage() {
  const { t } = useTranslation('common');
  return (
    <>
      <SEO title={t('errorPages.notFound.seoTitle')} description={t('errorPages.notFound.description')} path="/404" noIndex />
      <StatusScreen kind="notFound" />
    </>
  );
}
