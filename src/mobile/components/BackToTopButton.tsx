import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Appears once the user has scrolled past one viewport height; scrolls smoothly back to the top. */
export function BackToTopButton() {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > window.innerHeight);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t('buttons.backToTop')}
      className="fixed bottom-20 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-warmwhite text-ink shadow-strong transition-opacity duration-base"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
