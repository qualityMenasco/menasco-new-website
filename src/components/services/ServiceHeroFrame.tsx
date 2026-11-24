import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Phones and tablets (below the `desktop` breakpoint): frames the service-page hero (MEP,
 * Civil, Manufacturing & Prefabrication, EPC) in a bordered panel, so arriving on a service
 * page reads as a new page rather than another section (client request 2026-11-24; an
 * oversized outlined service name behind it was tried and removed). Desktop: no frame; the
 * hero renders exactly as before.
 */
export function ServiceHeroFrame({ tone, children }: { tone: 'dark' | 'light'; children: ReactNode }) {
  return (
    <div
      className={cn(
        '-mx-3 rounded-lg border px-5 py-8 md:-mx-4 md:px-8 md:py-10',
        'desktop:mx-0 desktop:rounded-none desktop:border-0 desktop:p-0',
        tone === 'dark' ? 'border-white/15' : 'border-gray-300',
      )}
    >
      {children}
    </div>
  );
}
