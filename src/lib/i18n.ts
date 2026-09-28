import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const I18N_NAMESPACES = [
  'common',
  'nav',
  'home',
  'about',
  'services',
  'projects',
  'contact',
  'seo',
  'newsroom',
  'careers',
  'legal',
] as const;

export const LOCALE_STORAGE_KEY = 'menasco-locale';

/**
 * Turns an unresolved key's last segment into a readable label as an
 * absolute last resort (e.g. "detail.downloadCompanyProfile" -> "Download
 * Company Profile"). This only fires if a key is missing from BOTH the
 * active locale and the `fallbackLng` ('en') resources — i18next's own
 * language fallback already covers "missing in ar only". A raw dotted key
 * path (or a bare namespace-qualified key) must never reach the UI.
 */
function humanizeMissingKey(key: string): string {
  const lastSegment = key.split('.').pop() ?? key;
  return lastSegment
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/**
 * Creates a standalone i18next instance (src/app/i18n.ts is the app's one
 * instance) rather than relying on i18next's default global singleton.
 */
export function createMenascoI18n(): i18n {
  const instance = i18next.createInstance();

  instance
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      supportedLngs: SUPPORTED_LOCALES,
      fallbackLng: 'en',
      ns: I18N_NAMESPACES,
      defaultNS: 'common',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['localStorage'],
        lookupLocalStorage: LOCALE_STORAGE_KEY,
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: true,
      },
      returnEmptyString: false,
      returnNull: false,
      // Defense in depth: even if a namespace fails to load (network hiccup,
      // stale cached bundle, a project added without its translation entry
      // yet), a raw "detail.downloadCompanyProfile"-style key must never
      // render to a user. In dev this also logs so the real gap gets fixed.
      saveMissing: import.meta.env.DEV,
      missingKeyHandler: (languages, namespace, key) => {
        if (import.meta.env.DEV) {
          console.warn(`[i18n] Missing translation key "${key}" in namespace "${namespace}" for locale(s): ${languages.join(', ')}`);
        }
      },
parseMissingKeyHandler: (key, defaultValue) => defaultValue || humanizeMissingKey(key),    });

  return instance;
}
