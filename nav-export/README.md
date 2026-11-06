# MENASCO header — portable export

A standalone copy of the main site's **header navigation** (desktop header + mobile header + mobile slide-out menu) for use in another React app, e.g. the Careers app on Amplify. It needs React 18 and nothing else: no Tailwind, router, i18n, framer-motion or icon library.

## What's included

| File | Purpose |
|---|---|
| `MenascoHeader.tsx` | The component. Named + default export `MenascoHeader`. |
| `menasco-header.css` | All styles, scoped under `.mnh` with a subtree reset, so the host's Georgia/global styles don't bleed in. |
| `navigation.json` | Links + labels, EN + AR. Generated from the main site, so don't edit it by hand. |
| `menasco-logo.png` | Logo, the same asset as the main site's `/Menasco-Logo.png`. |
| `tsconfig.json` | Only for type-checking inside the main repo. Don't copy it. |

Scope: logo, the primary nav (About dropdown, Services mega menu incl. Data Centers, Projects / Sectors, Newsroom, Careers), the EN/AR switch and the "Get in contact" CTA. Mobile (≤1024px) adds the outlined "Get in contact" button, the company-profile download button, the hamburger and the full-screen menu with About/Services accordions. The footer is not included.

## Install in the host app

1. Copy `MenascoHeader.tsx`, `menasco-header.css`, `navigation.json` and `menasco-logo.png` into one folder, e.g. `src/components/menasco-header/`.
2. Render it once at the top of the layout:

```tsx
import MenascoHeader from './components/menasco-header/MenascoHeader';
import './components/menasco-header/menasco-header.css';

<MenascoHeader locale="en" activeItem="careers" currentPath="/careers" />
```

Vite handles the `.json` and `.png` imports natively. The host tsconfig needs `resolveJsonModule: true` and the `vite/client` types (the default Vite template already has both).

**Fonts.** The CSS `@import`s Inter, Sora and IBM Plex Sans Arabic from Google Fonts. For faster first paint, delete the `@import` line at the top of the CSS and add this to the host `index.html` instead:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" />
```

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `locale` | `'en' \| 'ar'` | `'en'` | `'ar'` switches to Arabic labels, `dir="rtl"` on the header root and `/ar/...` links. |
| `baseUrl` | `string` | `navigation.json` → `baseUrl` | The main-site origin that every link is built from. |
| `activeItem` | `string` | none | Marks a primary item as current (blue + underline): `about`, `services`, `projects`, `newsroom`, `careers`. |
| `currentPath` | `string` | none | Locale-neutral main-site path of this page, e.g. `/careers`. If set, EN/AR links go to `${baseUrl}/careers` and `${baseUrl}/ar/careers`. Otherwise they go to `${baseUrl}/` and `${baseUrl}/ar`. |
| `logoSrc` | `string` | bundled `menasco-logo.png` | Override the logo URL. |
| `sticky` | `boolean` | `true` | Sticks to the top of the viewport (`position: sticky`). |
| `data` | object | bundled `navigation.json` | Alternative data in the same shape. |
| `className` | `string` | none | Extra class on the `.mnh` root. |

## Changing the domain (one value)

Every link is absolute: `baseUrl + path`. The default is `https://menasco-new-website.vercel.app`. To change it, do **one** of these:

- **In the host app:** pass `baseUrl="https://menascogroup.com"`. Nothing else changes.
- **At the source:** regenerate the JSON with the new default (see below) using `NAV_EXPORT_BASE_URL=https://menascogroup.com npm run export:nav`, then re-copy `navigation.json`. To make that the permanent default, edit `DEFAULT_BASE_URL` in `scripts/export-nav.ts`.

## Regenerating `navigation.json`

From the main site repo:

```bash
npm run export:nav                                            # default base URL
NAV_EXPORT_BASE_URL=http://localhost:3000 npm run export:nav  # e.g. local link testing
```

The script reads the structure from `src/data/navigation.ts` and the labels from `public/locales/{en,ar}/{nav,common}.json`. It writes only `nav-export/navigation.json`. Run it after any change to the nav, then copy the new JSON into the host app. It fails loudly if a new primary item appears that it doesn't know about.

Each link is stored as a locale-prefixed `path` plus a resolved `url`. The component uses `path` with the active `baseUrl`, so `url` is for reference only.

## Behaviour

- **Desktop (≥1025px):**
  - The About dropdown and Services mega menu open on hover, or when their trigger gets keyboard focus.
  - They close on mouse-leave, on Escape (focus returns to the trigger), on a click outside, or when focus tabs out.
  - Triggers carry `aria-expanded` / `aria-haspopup`.
  - On touch screens, the first tap opens the panel and the second tap follows the link.
  - Clicking a trigger navigates to its page, the same as on the live site.
- **Mobile (≤1024px):**
  - The hamburger opens a full-screen menu: body scroll is locked, focus moves to the close button, Escape closes it and focus returns to the hamburger.
  - About and Services are accordions (`aria-expanded`). Everything else is a one-tap link.
- **Animations:** framer-motion is replaced by CSS transitions with the same timings (180ms panel fade/drop, 250ms accordion, 200ms menu fade). They respect `prefers-reduced-motion`.

## Known differences from the live header

- **Solid/light state only.** The live site's transparent and dark "over hero" variants aren't exported. The bar is translucent warm-white with a backdrop blur, so the host page background tints it slightly, exactly as on the live site.
- **Plain links.** Every link is a full-page `<a href>` to the main site. There is no client-side routing, and the homepage-anchor scrolling for primary items isn't replicated: every primary item links to its real page (About → `/about`, Services → `/services`, Projects / Sectors → `/projects/categories`, Newsroom → `/newsroom`, Careers → `/careers`).
- **Active state comes from the `activeItem` prop**, not from URL matching. The mobile menu highlights the matching flat link (Careers, etc.) and "All Services" for `services`. It doesn't highlight individual About or Services child pages. The live site also wraps the active desktop label in an `<h1>`, which the export omits so it doesn't add a second h1 to the host page.
- **The language switch is a pair of links**, not buttons that swap the route client-side.
- **Company-profile download:** the PDF is on the main site's domain, so browsers ignore the `download` attribute across origins. The PDF opens in a new page instead of downloading with the `MENASCO-Company-Profile.pdf` filename.
- **Stacking:** the root sits at `z-index: 40`, or 50 while the mobile menu is open. If the host has its own fixed elements above that, raise `.mnh` in host CSS. The mobile menu is `position: fixed`, so don't place the header inside an element that has a `transform` or `filter`.
- **Scoping limits:** the `.mnh` reset beats ordinary element and class selectors on the host. Host rules that use IDs or `!important` on generic elements (e.g. `#root a { … !important }`) can still win.
