# MENASCO Website

One React app, one router, one URL structure. Desktop and mobile presentation
are chosen automatically at render time based on viewport width — not by
separate apps, separate URLs, or a separate deployment.

```
src/
  app/            router, root layout (desktop/mobile shell switch), i18n, SEO shell
  pages/          desktop page implementations
  mobile/
    pages/          mobile page implementations
    components/     mobile-only UI components
    hooks/          mobile-only hooks (e.g. useScrollLock)
    lib/            mobile-only utilities (contact form submission stub, etc.)
  components/     desktop UI components
  data/           the single source of truth for all content — projects,
                   services, offices, leadership, newsroom, translations, etc.
  lib/            shared utilities (locale, i18n factory, useMediaQuery, ...)
  seo/            shared SEO component + structured data
public/           shared static assets (images, videos, PDFs, locale JSON)
```

## Running it

```bash
npm install
npm run dev
```
→ http://localhost:3000 — resize the window (or open DevTools' device
toolbar) to see the layout switch live at the 1024px breakpoint. No reload,
no separate server.

## How the desktop/mobile switch works

`useIsDesktop()` (in `src/lib/hooks.ts`) wraps a `matchMedia('(min-width: 1025px)')`
listener — above 1024px renders desktop, at or below renders mobile, and it
updates live on resize.

Two places read it, always in agreement since they share the same query:

- **`src/app/RootLayout.tsx`** — picks the header/nav/footer chrome:
  `SiteHeader`/`SiteFooter` above the breakpoint, `MobileHeader`/`MobileMenu`/
  `MobileFooter`/`MobileBottomNav` at or below it.
- **`src/app/router.tsx`** — each route that has both a desktop and mobile
  implementation uses `responsivePage(desktopImporter, mobileImporter)`
  instead of the plain `lazyPage(importer)` used for single-implementation
  routes. Because each side is `React.lazy()`, only the branch actually
  rendered ever triggers its dynamic `import()` — a mobile visitor never
  downloads or mounts desktop's hero video / GSAP scroll-frame sequence, and
  vice versa. The two trees are never mounted at the same time.

The route itself never changes — `/about`, `/services/mechanical`,
`/projects/categories`, etc. are the same URL regardless of viewport, in both
English and `/ar` locales. Language and route survive a resize untouched;
only the rendered component tree swaps.

Some routes currently only have one implementation and render it regardless
of viewport until a counterpart is built: `/contact` (mobile only, no desktop
page yet) and the leadership bio pages, `/services/data-centers`, and a
handful of legacy redirects (desktop only, no mobile page yet). See
`src/app/router.tsx` for the exact list.

## Where content lives

All approved MENASCO content (names, titles, service descriptions, project
records, leadership bios, office addresses, stats, translations, etc.) lives
in `src/data/*.ts` and `public/locales/*.json` — one copy, imported directly
by both desktop and mobile pages. There is no re-export bridge to keep in
sync; editing a file in `src/data/*` updates both presentations at once.

## Design notes carried over from the mobile build

- **Project detail pages** use a simpler, single-image layout on mobile
  rather than desktop's cinematic scroll-frame sequence for VELA — that
  experience is deliberately heavy (240 sequential frames) and a poorer fit
  for typical mobile data connections.
- **Regional Presence** is a plain, tappable office list on mobile (city,
  country, tap-to-call) rather than desktop's interactive network map — the
  map is a genuinely large, hover/JS-heavy component; a straightforward list
  serves one-handed phone browsing better.
- **News detail, individual project case-study pages beyond the simple
  version above, and a couple of legal/QHSE sub-pages** carry real approved
  text but with lighter visual treatment than desktop.

## SEO

`src/seo/SEO.tsx` and `src/seo/constants.ts` are the single implementation
used by every page regardless of which viewport rendered it — one canonical
URL per route per locale (`SITE_URL` + the route path, with `/ar` for
Arabic), one set of hreflang alternates, one JSON-LD payload. Since only one
tree is ever mounted for a given page load, there is never a competing
canonical or a duplicate indexable URL to reconcile.
