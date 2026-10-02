import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export interface CurrencyAmountFieldProps {
  currency: string;
  onCurrencyChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

/** Currencies MENASCO actually operates in, plus the two most common international currencies a client might quote in. */
const CURRENCIES = ['AED', 'SAR', 'USD', 'EUR', 'GBP', 'EGP'];

/** Expected Project Value — a currency select paired with a free-text amount. Required on the Project enquiry, where this field is the only place it's used. */
export function CurrencyAmountField({ currency, onCurrencyChange, amount, onAmountChange, disabled, required, error }: CurrencyAmountFieldProps) {
  const { t } = useTranslation('contact');
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-semibold text-ink">
        {t('fields.projectValue')}
        {required && (
          <span className="ms-0.5 text-brand-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="flex gap-2">
        <select
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value)}
          aria-label={t('fields.currency')}
          disabled={disabled}
          className={cn(
            'h-12 w-24 shrink-0 rounded-md border border-gray-300 bg-warmwhite px-2.5 text-body text-ink',
            'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400',
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
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          disabled={disabled}
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          className={cn(
            'h-12 w-full rounded-md border bg-warmwhite px-3.5 text-body text-ink placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400',
            error ? 'border-error' : 'border-gray-300',
          )}
        />
      </div>
      {error ? (
        <span id={errorId} role="alert" className="text-caption font-medium text-error">
          {error}
        </span>
      ) : (
        <span id={helperId} className="text-caption text-gray-500">
          {t('fields.projectValueHelper')}
        </span>
      )}
    </div>
  );
}
