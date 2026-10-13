import { createMenascoI18n } from '../lib/i18n';
import { getLocaleFromPath } from '../lib/locale';

// `createMenascoI18n`'s `LanguageDetector` only checks `localStorage`
// (deliberately — a stored preference should win over the URL the next
// time someone switches language and navigates elsewhere) — on a FIRST
// visit, with nothing stored yet, that resolves to `fallbackLng: 'en'`.
// `RootLayout`'s `useLocaleSync` corrects this to match the URL, but only
// inside a `useEffect`, which runs after the first render/paint — too late
// for a direct hard-load of an `/ar/...` URL, whose very first client
// render needs to already say "ar" to match what was prerendered
// server-side (scripts/seo/prerender.ts explicitly sets `lng` from the
// URL). Passing it here makes the INITIAL state correct immediately for
// every load, not just prerendered ones — `useLocaleSync`'s own
// `changeLanguage` call becomes a no-op in the common case once a visitor
// is already on the right locale, and still does its job for a client-side
// locale switch later.
export const i18n = createMenascoI18n({ initialLng: getLocaleFromPath(typeof window !== 'undefined' ? window.location.pathname : '/') });
