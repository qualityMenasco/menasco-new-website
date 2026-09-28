import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export interface CurrencyAmountFieldProps {
  currency: string;
  onCurrencyChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
}

/** Currencies MENASCO actually operates in, plus the two most common international currencies a client might quote in. */
const CURRENCIES = ['AED', 'SAR', 'USD', 'EUR', 'GBP', 'EGP'];

/** Expected Project Value — a currency select paired with a free-text amount, both optional. */
export function CurrencyAmountField({ currency, onCurrencyChange, amount, onAmountChange }: CurrencyAmountFieldProps) {
  const { t } = useTranslation('contact');
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-semibold text-ink">
        {t('fields.projectValue')} <span className="ms-1 font-normal text-gray-500">{t('fields.optional')}</span>
      </label>
      <div className="flex gap-2">
        <select
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value)}
          aria-label={t('fields.currency')}
          className={cn(
            'h-12 w-24 shrink-0 rounded-md border border-gray-300 bg-warmwhite px-2.5 text-body text-ink',
            'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-0',
          )}
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          dir="ltr"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          className={cn(
            'h-12 w-full rounded-md border border-gray-300 bg-warmwhite px-3.5 text-body text-ink placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-0',
          )}
        />
      </div>
      <span className="text-caption text-gray-500">{t('fields.projectValueHelper')}</span>
    </div>
  );
}
