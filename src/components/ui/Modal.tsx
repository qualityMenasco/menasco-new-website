import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const { t } = useTranslation('common');
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={cn(
          'relative w-full max-w-2xl overflow-hidden rounded-md border border-gray-200 bg-warmwhite shadow-strong',
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            {title ? <h3 className="font-display text-h4 font-semibold text-ink">{title}</h3> : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('buttons.closeDialog')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-ink transition-colors hover:border-gray-300 hover:bg-gray-100"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
