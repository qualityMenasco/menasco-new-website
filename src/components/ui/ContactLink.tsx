import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface ContactLinkProps {
  kind: 'tel' | 'email';
  /** The phone number or email address, as displayed and copied. */
  value: string;
  className?: string;
  /** Optional leading icon, kept visible while "Copied" shows. */
  icon?: ReactNode;
  /** Classes for the text span (e.g. `truncate`). */
  textClassName?: string;
}

const COPIED_MS = 1800;

/**
 * Phone / email link. On touch devices it's a normal `tel:` / `mailto:` link
 * (dial, open the mail app). Mouse-driven desktops usually have nothing set up
 * to open those, so a click there copies the value instead and the link reads
 * "Copied" for a moment. Detection is by input type, not screen width, so a
 * narrow desktop window still copies and a large touch tablet still dials.
 */
export function ContactLink({ kind, value, className, icon, textClassName }: ContactLinkProps) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const href = kind === 'tel' ? `tel:${value.replace(/\s+/g, '')}` : `mailto:${value}`;
  const copyOnClick = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — legacy fallback.
      const field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <a href={href} onClick={handleClick} title={copyOnClick ? t('contactLink.copyHint') : undefined} className={className}>
      {icon}
      {/* Numbers and addresses always read left-to-right, even on Arabic pages. */}
      <span aria-live="polite" dir={copied ? undefined : 'ltr'} className={textClassName}>
        {copied ? t('contactLink.copied') : value}
      </span>
    </a>
  );
}
