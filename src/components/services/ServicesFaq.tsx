import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface FaqItem {
  question: string;
  answer: string;
}

/** Questions shown before "View more questions". */
const INITIAL_VISIBLE = 6;

/**
 * Services FAQ — two columns on desktop (heading + intro fixed on the left at
 * ~35%, accordion on the right at ~65%), stacked on phones and tablets. Only
 * one answer is open at a time; answers stay in the DOM (collapsed, inert)
 * so they remain crawlable. The first six questions show by default; the
 * rest sit behind a "View more questions" control.
 *
 * No FAQPage structured data: Google limits FAQ rich results to well-known
 * government and health sites, so the value here is helping visitors, not a
 * search enhancement.
 */
export function ServicesFaq() {
  const { t } = useTranslation('services');
  const items = t('listing.faq.items', { returnObjects: true }) as FaqItem[];
  const [open, setOpen] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);
  const hasMore = items.length > INITIAL_VISIBLE;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[35%_1fr] lg:gap-14">
      <div className="lg:sticky lg:top-[105px] lg:self-start">
        <h2 id="services-faq-heading" className="font-display text-h2 font-semibold text-ink text-balance">
          {t('listing.faq.heading')}
        </h2>
        <p className="mt-4 max-w-sm text-body text-gray-600">{t('listing.faq.intro')}</p>
      </div>

      <div>
        <div className="border-t border-gray-200">
          {items.map((item, i) => {
            const isOpen = open === i;
            const hidden = !showAll && i >= INITIAL_VISIBLE;
            return (
              <div key={item.question} hidden={hidden} className="relative border-b border-gray-200">
                {/* Subtle cerulean indicator on the active question. */}
                <span
                  aria-hidden="true"
                  className={cn('absolute -start-px top-0 h-full w-0.5 bg-brand-500 transition-opacity duration-base', isOpen ? 'opacity-100' : 'opacity-0')}
                />
                <h3>
                  <button
                    type="button"
                    id={`svc-faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`svc-faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 ps-5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                  >
                    <span className={cn('font-display text-body-lg font-semibold transition-colors duration-base', isOpen ? 'text-brand-600' : 'text-charcoal')}>
                      {item.question}
                    </span>
                    <ChevronDown
                      size={20}
                      aria-hidden="true"
                      className={cn('shrink-0 transition-transform duration-base', isOpen ? 'rotate-180 text-brand-500' : 'text-gray-400')}
                    />
                  </button>
                </h3>
                {/* Collapsed answers stay in the DOM; grid rows animate the height. */}
                <div
                  id={`svc-faq-a-${i}`}
                  role="region"
                  aria-labelledby={`svc-faq-q-${i}`}
                  {...(isOpen ? {} : { inert: '' })}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 ps-5 text-body leading-relaxed text-gray-600">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => {
              if (showAll && open !== null && open >= INITIAL_VISIBLE) setOpen(null);
              setShowAll((value) => !value);
            }}
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-brand-600 transition-colors duration-base hover:text-brand-700"
          >
            {showAll ? t('listing.faq.viewLess') : t('listing.faq.viewMore')}
            <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', showAll && 'rotate-180')} />
          </button>
        )}
      </div>
    </div>
  );
}
