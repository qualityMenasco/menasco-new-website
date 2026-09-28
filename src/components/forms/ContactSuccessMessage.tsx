import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SmartLink } from '../../lib/SmartLink';
import { Button } from '../ui/Button';
import type { ContactEnquiryType } from '../../lib/contactApi';

export interface ContactSuccessMessageProps {
  enquiryType: ContactEnquiryType;
  onSendAnother: () => void;
}

/** Confirmation shown in place of the form after a successful submission — shared by desktop and mobile. */
export function ContactSuccessMessage({ enquiryType, onSendAnother }: ContactSuccessMessageProps) {
  const { t } = useTranslation('contact');

  return (
    <div className="flex flex-col items-center gap-4 rounded-md border border-gray-200 bg-warmwhite px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success-subtle text-success">
        <CheckCircle2 size={28} aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-display text-h3 font-semibold text-ink">{t(`success.${enquiryType}.title`)}</h3>
        <p className="mx-auto mt-2 max-w-sm text-body text-gray-600">{t(`success.${enquiryType}.description`)}</p>
      </div>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={onSendAnother}>
          {t('success.sendAnother')}
        </Button>
        <SmartLink
          href="/"
          className="flex h-10 items-center justify-center rounded-md bg-brand-600 px-5 text-body font-semibold text-warmwhite transition-colors duration-base hover:bg-brand-700"
        >
          {t('success.backToHome')}
        </SmartLink>
      </div>
    </div>
  );
}
