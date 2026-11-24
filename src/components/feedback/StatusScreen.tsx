import { ArrowRight, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { Button, ButtonLink } from '../ui/Button';

export interface StatusScreenProps {
  /** 'notFound' for a missing page (404); 'error' for anything that crashed or failed to load. */
  kind: 'notFound' | 'error';
  /**
   * True when rendered as a route errorElement — the site header/footer are
   * not on screen then (the layout itself may be what failed), so the screen
   * fills the viewport and shows the logo as its own home link.
   */
  standalone?: boolean;
  /** "Try again" action for the error screen (defaults to a page reload). */
  onRetry?: () => void;
}

/**
 * The branded status screen behind both the 404 page (NotFoundPage, inside
 * the normal header/footer) and the router's error boundary
 * (RouteErrorBoundary). Friendly copy, the MENASCO logo, and a clear way
 * back: home plus services/contact, or "Try again" after an error.
 */
export function StatusScreen({ kind, standalone = false, onRetry }: StatusScreenProps) {
  const { t } = useTranslation('common');
  const key = `errorPages.${kind}`;

  return (
    <div className={cn('flex items-center justify-center bg-warmwhite px-6', standalone ? 'min-h-svh py-16' : 'min-h-[70svh] py-20 md:py-28')}>
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        {standalone ? (
          <SmartLink href="/" aria-label={t('errorPages.homeLabel')}>
            <img src="/Menasco_Logo.png" alt="MENASCO" className="h-10 w-auto md:h-12" />
          </SmartLink>
        ) : (
          <img src="/Menasco_Logo.png" alt="MENASCO" className="h-10 w-auto md:h-12" />
        )}

        <p className="mt-10 font-display text-[clamp(4.5rem,3.5rem+4vw,7rem)] font-semibold leading-none tracking-tight text-brand-600/15" aria-hidden="true">
          {kind === 'notFound' ? '404' : '500'}
        </p>
        <p className="mt-2 text-eyebrow font-semibold uppercase tracking-widest text-brand-600 rtl:tracking-normal">{t(`${key}.eyebrow`)}</p>
        <h1 className="mt-3 text-balance font-display text-h2 font-semibold tracking-tight text-ink">{t(`${key}.title`)}</h1>
        <p className="mt-4 max-w-md text-body text-gray-600 md:text-body-lg">{t(`${key}.description`)}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {kind === 'error' && (
            <Button variant="primary" trailingIcon={RotateCw} onClick={onRetry ?? (() => window.location.reload())}>
              {t('errorPages.error.retry')}
            </Button>
          )}
          <ButtonLink href="/" variant={kind === 'error' ? 'outline' : 'primary'} trailingIcon={kind === 'error' ? undefined : ArrowRight}>
            {t('errorPages.backHome')}
          </ButtonLink>
          {kind === 'notFound' && (
            <ButtonLink href="/services" variant="outline">
              {t('errorPages.notFound.services')}
            </ButtonLink>
          )}
        </div>

        <p className="mt-8 text-small text-gray-500">
          {t('errorPages.helpPrefix')}{' '}
          <SmartLink href="/contact" className="font-semibold text-brand-600 underline-offset-4 hover:underline">
            {t('errorPages.contactLink')}
          </SmartLink>
        </p>
      </div>
    </div>
  );
}
