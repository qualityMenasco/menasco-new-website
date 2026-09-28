import { Link } from 'react-router-dom';
import { SEO } from '../../seo/SEO';

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" noIndex />
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-display text-h1 font-semibold text-ink">Page Not Found</h1>
        <p className="mt-3 max-w-xs text-body text-gray-600">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="mt-6 flex h-12 items-center justify-center rounded-md bg-brand-600 px-6 text-body font-semibold text-warmwhite">
          Back to Home
        </Link>
      </section>
    </>
  );
}
