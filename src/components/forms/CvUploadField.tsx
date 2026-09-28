import { useId } from 'react';
import { Paperclip, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { CV_ACCEPTED_EXTENSIONS } from '../../lib/useContactForm';

export interface CvUploadFieldProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

/**
 * CV / résumé upload — validated and held client-side (accepted formats,
 * size cap) but not yet transmitted anywhere: no upload backend exists in
 * this repository. The honest disclosure below the field says so, matching
 * the same pattern already established for this form's attachment field
 * before this rework (see contact.json's fields.cvBackendNote).
 */
export function CvUploadField({ value, onChange, error }: CvUploadFieldProps) {
  const { t } = useTranslation('contact');
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-semibold text-ink">
        {t('fields.cv')}
        <span className="ms-0.5 text-brand-600" aria-hidden="true">
          *
        </span>
      </label>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className={cn(
            'flex h-12 flex-1 cursor-pointer items-center gap-2 truncate rounded-md border bg-warmwhite px-3.5 text-body text-gray-600',
            error ? 'border-error' : 'border-dashed border-gray-300',
          )}
        >
          <Paperclip size={16} aria-hidden="true" className="shrink-0 text-gray-500" />
          <span className="truncate">{value ? value.name : t('fields.cvChoose')}</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={t('fields.cvRemove')}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-500 hover:text-ink"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <input
        id={id}
        type="file"
        accept={CV_ACCEPTED_EXTENSIONS}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span className="text-caption text-gray-500">{t('fields.cvHelper')}</span>
      <span className="text-caption text-gray-400">{t('fields.cvBackendNote')}</span>
      {error && (
        <span id={errorId} role="alert" className="text-caption font-medium text-error">
          {error}
        </span>
      )}
    </div>
  );
}
