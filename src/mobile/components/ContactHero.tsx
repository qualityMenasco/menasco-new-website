import { useTranslation } from 'react-i18next';

export function ContactHero() {
  const { t } = useTranslation('contact');

  return (
    <section className="px-4 pb-2 pt-8">
      <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-600">{t('hero.eyebrow')}</span>
      <h2 className="mt-2 font-display text-h1 font-semibold text-ink">{t('hero.title')}</h2>
      <p className="mt-3 text-body text-gray-600">{t('hero.description')}</p>
    </section>
  );
}
