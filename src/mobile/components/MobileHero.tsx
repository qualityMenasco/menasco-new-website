import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MobileVideo } from './MobileVideo';
import { LocaleLink } from './LocaleLink';
import { foundingYear } from '../../data/companyStats';

/**
 * Compact mobile hero — short heading, one supporting line, primary CTA
 * visible without scrolling. Deliberately shorter than desktop's ~78vh hero
 * so the first useful content (company intro/stats) appears sooner.
 */
export function MobileHero() {
  const { t } = useTranslation(['home', 'common']);

  return (
    <section className="relative flex min-h-[62vh] w-full items-end overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <MobileVideo src="/menasco-landing-clean.mp4" poster="https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=70" alt="" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30" />

      <div className="relative z-10 flex flex-col gap-4 px-4 pb-10 pt-24">
        <span className="text-eyebrow font-semibold uppercase tracking-widest text-brand-400">
          {t('home:hero.eyebrow', { year: foundingYear })}
        </span>
        <h2 className="font-display text-h1 font-semibold leading-tight text-warmwhite">{t('home:hero.title')}</h2>
        <p className="max-w-sm text-body text-gray-200">{t('home:hero.description')}</p>
        <div className="mt-3">
          <LocaleLink
            to="/projects/categories"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-600 text-body font-semibold text-warmwhite"
          >
            {t('common:buttons.exploreProjects')}
            <ArrowRight size={18} aria-hidden="true" className="rtl:rotate-180" />
          </LocaleLink>
        </div>
      </div>
    </section>
  );
}
