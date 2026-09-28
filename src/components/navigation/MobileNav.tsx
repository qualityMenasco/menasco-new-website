import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { SmartLink } from '../../lib/SmartLink';
import { useSectionTheme } from '../../lib/theme-context';
import { getLocaleFromPath } from '../../lib/locale';
import type { Theme } from '../../types';
import { IconButton } from '../ui/Button';
import type { NavItem } from './types';

export interface MobileNavProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  actions?: ReactNode;
  theme?: Theme;
}

export function MobileNav({ items, isOpen, onClose, actions, theme }: MobileNavProps) {
  const { t } = useTranslation('nav');
  const { pathname } = useLocation();
  const isRtl = getLocaleFromPath(pathname) === 'ar';
  const resolvedTheme = useSectionTheme(theme);
  const isDark = resolvedTheme === 'dark';
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-ink/60" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('siteNavigation')}
            initial={{ x: reducedMotion ? 0 : isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reducedMotion ? 0 : isRtl ? '-100%' : '100%' }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.22, 0.61, 0.36, 1] }}
            className={cn('absolute inset-y-0 end-0 flex w-full max-w-sm flex-col overflow-y-auto', isDark ? 'bg-charcoal' : 'bg-warmwhite')}
          >
            <div className={cn('flex items-center justify-between border-b p-6', borderColor)}>
              <span className={cn('text-small font-semibold uppercase tracking-wide', isDark ? 'text-warmwhite' : 'text-ink')}>{t('menu')}</span>
              <IconButton icon={X} label={t('closeMenu')} onClick={onClose} theme={resolvedTheme} />
            </div>

            <nav className="flex flex-1 flex-col p-6">
              {items.map((item) => {
                const flatLinks = item.dropdown ?? item.megaMenu?.columns.flatMap((column) => column.links);
                const isExpanded = expandedLabel === item.label;

                if (!flatLinks) {
                  return (
                    <SmartLink
                      key={item.label}
                      href={item.href ?? '#'}
                      onClick={onClose}
                      className={cn('border-b py-4 text-body font-semibold', borderColor, isDark ? 'text-warmwhite' : 'text-ink')}
                    >
                      {item.label}
                    </SmartLink>
                  );
                }

                const toggleExpanded = () => setExpandedLabel(isExpanded ? null : item.label);

                return (
                  <div key={item.label} className={cn('border-b', borderColor)}>
                    <div className="flex w-full items-center justify-between py-4">
                      {item.href ? (
                        <SmartLink
                          href={item.href}
                          onClick={onClose}
                          className={cn('text-body font-semibold', isDark ? 'text-warmwhite' : 'text-ink')}
                        >
                          {item.label}
                        </SmartLink>
                      ) : (
                        <button
                          type="button"
                          onClick={toggleExpanded}
                          className={cn('text-body font-semibold', isDark ? 'text-warmwhite' : 'text-ink')}
                        >
                          {item.label}
                        </button>
                      )}
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={item.label}
                        onClick={toggleExpanded}
                        className={cn('-me-2 flex h-9 w-9 items-center justify-center', isDark ? 'text-warmwhite' : 'text-ink')}
                      >
                        <ChevronDown size={18} aria-hidden="true" className={cn('transition-transform duration-base', isExpanded && 'rotate-180')} />
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <ul className="flex flex-col gap-1 pb-4 pl-2">
                            {flatLinks.map((link) => (
                              <li key={link.label}>
                                <SmartLink
                                  href={link.href}
                                  onClick={onClose}
                                  className={cn('block py-2 text-small', isDark ? 'text-gray-300 hover:text-warmwhite' : 'text-gray-600 hover:text-ink')}
                                >
                                  {link.label}
                                </SmartLink>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {actions && <div className={cn('border-t p-6', borderColor)}>{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
