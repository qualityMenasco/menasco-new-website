import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

/**
 * A paragraph hidden behind "Read more" at every screen size; "Show less" hides it again
 * (Quality & Safety results, client request 2026-11-25). The toggle sits above the text so it
 * never moves when the text opens. The text is always in the HTML (`hidden` attribute, not
 * removed), so it stays crawlable.
 */
export function ReadMoreText({ id, text, className, dark = false }: { id: string; text: string; className?: string; dark?: boolean }) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex min-h-11 items-center gap-1.5 text-small font-semibold transition-colors duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          dark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700',
        )}
      >
        {open ? t('buttons.showLess') : t('buttons.readMore')}
        <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform duration-base', open && 'rotate-180')} />
      </button>
      <p id={id} hidden={!open} className={cn('mt-2', className)}>
        {text}
      </p>
    </>
  );
}
