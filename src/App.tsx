import { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from 'react-router-dom';
import { HeaderTransparencyProvider } from './app/header-transparency';
import { router } from './app/router';
import { i18n } from './app/i18n';
import { PageLoadingFallback } from './app/PageLoadingFallback';

export default function App() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <I18nextProvider i18n={i18n}>
        <HelmetProvider>
          <HeaderTransparencyProvider>
            <RouterProvider router={router} />
          </HeaderTransparencyProvider>
        </HelmetProvider>
      </I18nextProvider>
    </Suspense>
  );
}
