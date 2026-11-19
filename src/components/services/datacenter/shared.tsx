import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { SmartLink } from '../../../lib/SmartLink';
import { cn } from '../../../lib/utils';
import { getLocaleFromPath } from '../../../lib/locale';
import { dcTechnical } from '../../../data/dataCenterTechnical';
import { Cite } from './primitives';

export const DC_TECHNICAL_PATH = '/services/data-centers';
export const DC_SUSTAINABILITY_PATH = '/services/data-centers/sustainability';

/** Renders copy containing [[n]] citation markers as text with superscript source links. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/\[\[(\d+)\]\]/);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <Cite key={i} n={Number(part)} /> : <Fragment key={i}>{part}</Fragment>))}
    </>
  );
}

/** Plain text with citation markers removed (for structured data and llms.txt). */
export function stripCites(text: string) {
  return text.replace(/\s*\[\[\d+\]\]/g, '');
}

/**
 * The two Data Center pages presented as tabs: a sticky segmented switch
 * under the header. Each tab is a real page (its own URL, title and H1).
 */
export function DataCenterTabs({ active }: { active: 'technical' | 'sustainability' }) {
  const tabs = [
    { id: 'technical' as const, href: DC_TECHNICAL_PATH, label: dcTechnical.tabs.technical },
    { id: 'sustainability' as const, href: DC_SUSTAINABILITY_PATH, label: dcTechnical.tabs.sustainability },
  ];
  return (
    <nav aria-label="Data center" className="sticky top-14 z-30 border-b border-white/10 bg-ink/95 backdrop-blur-md desktop:top-20">
      <div className="mx-auto flex max-w-container justify-center px-4 py-3 md:px-8">
        <div className="relative grid w-full max-w-md grid-cols-2 rounded-full border border-white/15 bg-white/5 p-1">
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-brand-600 transition-transform duration-500 ease-out motion-reduce:transition-none',
              active === 'technical' ? 'translate-x-1 rtl:-translate-x-1' : 'translate-x-[calc(100%+0.25rem)] rtl:-translate-x-[calc(100%+0.25rem)]',
            )}
          />
          {tabs.map((tab) => (
            <SmartLink
              key={tab.id}
              href={tab.href}
              aria-current={active === tab.id ? 'page' : undefined}
              className={cn(
                'relative z-10 flex min-h-10 items-center justify-center rounded-full text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                active === tab.id ? 'text-white' : 'text-gray-400 hover:text-white',
              )}
            >
              {tab.label}
            </SmartLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

/** Arabic route only: notes that these pages are not yet translated. */
export function ArabicDeferredNotice() {
  const { pathname } = useLocation();
  if (getLocaleFromPath(pathname) !== 'ar') return null;
  return (
    <div lang="ar" dir="rtl" className="bg-warning-subtle px-4 py-2 text-center text-small font-semibold text-ink">
      {dcTechnical.arabicNotice}
    </div>
  );
}
