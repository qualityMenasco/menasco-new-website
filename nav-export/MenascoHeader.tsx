/**
 * MENASCO site header — standalone export.
 *
 * React-only (no router, i18n, Tailwind, framer-motion or icon libraries).
 * Data: ./navigation.json, generated from the main site by `npm run export:nav`.
 * Styles: ./menasco-header.css (everything scoped under `.mnh`). Import it once.
 *
 * Every link is an absolute URL to the main site: `${baseUrl}${path}`. Change
 * the domain in ONE place — the `baseUrl` prop, or regenerate navigation.json
 * with NAV_EXPORT_BASE_URL.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import navigationJson from './navigation.json';
import defaultLogoSrc from './menasco-logo.png';

// ---------------------------------------------------------------------------
// Data types (shape of navigation.json)
// ---------------------------------------------------------------------------

export type MenascoLocale = 'en' | 'ar';

export interface MnhLink {
  label: string;
  /** Locale-prefixed path on the main site, e.g. "/ar/about". */
  path: string;
  /** Absolute URL at generation time — informational; the component rebuilds from `path` + baseUrl. */
  url: string;
  id?: string;
}

export interface MnhServiceGroup {
  id: string;
  label: string;
  path?: string;
  url?: string;
  links: MnhLink[];
}

export interface MnhPrimaryItem extends MnhLink {
  id: string;
  dropdown?: MnhLink[];
  megaMenu?: {
    groups: MnhServiceGroup[];
    footerLinks: MnhLink[];
    allServices: MnhLink;
    dataCenters: MnhLink;
  };
}

export interface MnhLocaleData {
  locale: MenascoLocale;
  dir: 'ltr' | 'rtl';
  labels: {
    home: string;
    menu: string;
    openMenu: string;
    closeMenu: string;
    siteNavigation: string;
    primaryNavigation: string;
    menascoHome: string;
    languageSwitch: string;
  };
  logo: MnhLink & { alt: string };
  primary: MnhPrimaryItem[];
  mobileDirectLinks: MnhLink[];
  cta: MnhLink;
  contact: MnhLink & { ariaLabel: string };
  companyProfile: MnhLink & { download: string };
  languageSwitch: {
    label: string;
    options: (MnhLink & { locale: MenascoLocale })[];
  };
}

export interface MnhNavigationData {
  baseUrl: string;
  generatedAt: string;
  locales: Record<MenascoLocale, MnhLocaleData>;
}

const defaultData = navigationJson as unknown as MnhNavigationData;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MenascoHeaderProps {
  /** Header language. "ar" renders Arabic labels, dir="rtl" and /ar links. Default "en". */
  locale?: MenascoLocale;
  /** Main-site origin every link is built from. Defaults to navigation.json's baseUrl. */
  baseUrl?: string;
  /** Primary item to show as current: "about" | "services" | "projects" | "newsroom" | "careers". */
  activeItem?: string;
  /**
   * Locale-neutral main-site path of the current page (e.g. "/careers"). When
   * given, the EN/AR switch links to that page in the other language;
   * otherwise it links to the main site's home page in each language.
   */
  currentPath?: string;
  /** Override the logo image URL (defaults to the bundled ./menasco-logo.png). */
  logoSrc?: string;
  /** Stick to the top of the viewport while scrolling. Default true. */
  sticky?: boolean;
  /** Alternative navigation data (same shape as navigation.json). */
  data?: MnhNavigationData;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function trimBase(url: string): string {
  return url.replace(/\/+$/, '');
}

function stripLocalePath(path: string): string {
  if (path === '/ar') return '/';
  if (path.startsWith('/ar/') || path.startsWith('/ar?')) return path.slice(3) || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function localisePath(path: string, locale: MenascoLocale): string {
  const base = stripLocalePath(path);
  if (locale === 'en') return base;
  return base === '/' ? '/ar' : base.startsWith('/?') ? `/ar${base.slice(1)}` : `/ar${base}`;
}

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Inline icons (lucide geometry, 24x24 viewBox, 2px stroke)
// ---------------------------------------------------------------------------

function Icon({ size, className, children }: { size: number; className?: string; children: ReactNode }) {
  return (
    <svg
      className={cx('mnh-icon', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

const ChevronDownIcon = (p: { size: number; className?: string }) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
const ArrowRightIcon = (p: { size: number; className?: string }) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);
const MenuIcon = (p: { size: number; className?: string }) => (
  <Icon {...p}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </Icon>
);
const CloseIcon = (p: { size: number; className?: string }) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);
const DownloadIcon = (p: { size: number; className?: string }) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </Icon>
);

// ---------------------------------------------------------------------------
// Language switch (shared by desktop header + mobile menu)
// ---------------------------------------------------------------------------

function LanguageSwitch({ data, locale, href }: { data: MnhLocaleData; locale: MenascoLocale; href: (locale: MenascoLocale) => string }) {
  return (
    <div className="mnh-lang" role="group" aria-label={data.languageSwitch.label}>
      {data.languageSwitch.options.map((option) => {
        const isCurrent = option.locale === locale;
        return (
          <a
            key={option.locale}
            href={href(option.locale)}
            hrefLang={option.locale}
            lang={option.locale}
            aria-current={isCurrent ? 'true' : undefined}
            className={cx('mnh-lang__opt', isCurrent && 'mnh-is-current')}
          >
            {option.label}
          </a>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile accordion
// ---------------------------------------------------------------------------

function Accordion({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  const panelId = `mnh-acc-${id}`;
  return (
    <div className={cx('mnh-acc', open && 'mnh-is-open')}>
      <button type="button" className="mnh-acc__btn" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span className="mnh-acc__title">{title}</span>
        <ChevronDownIcon size={20} className="mnh-acc__chev" />
      </button>
      <div id={panelId} className="mnh-acc__panel" data-open={open ? 'true' : 'false'}>
        <div className="mnh-acc__clip">
          <div className="mnh-acc__body">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export function MenascoHeader({
  locale = 'en',
  baseUrl,
  activeItem,
  currentPath,
  logoSrc,
  sticky = true,
  data = defaultData,
  className,
}: MenascoHeaderProps) {
  const t = data.locales[locale] ?? data.locales.en;
  const base = trimBase(baseUrl ?? data.baseUrl);
  const href = useCallback((path: string) => `${base}${path}`, [base]);
  const langHref = useCallback(
    (target: MenascoLocale) => {
      if (currentPath) return href(localisePath(currentPath, target));
      const option = t.languageSwitch.options.find((o) => o.locale === target);
      return href(option ? option.path : localisePath('/', target));
    },
    [currentPath, href, t],
  );
  const logo = logoSrc ?? defaultLogoSrc;

  // ---- Desktop dropdown / mega menu state ---------------------------------
  const [openId, setOpenId] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const triggerRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const openIdRef = useRef<string | null>(null);
  openIdRef.current = openId;
  // Touch has no hover: remember the pointer type and whether the panel was
  // already open at pointerdown (focus opens it before the click lands).
  const pointerState = useRef<{ type: string; wasOpen: boolean }>({ type: 'mouse', wasOpen: false });
  // Escape hands focus back to the trigger; that focus must not reopen the panel.
  const suppressFocusOpen = useRef(false);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenId(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const current = openIdRef.current;
      if (!current) return;
      setOpenId(null);
      if (navRef.current?.contains(document.activeElement)) {
        suppressFocusOpen.current = true;
        triggerRefs.current[current]?.focus();
        suppressFocusOpen.current = false;
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // ---- Mobile menu state ---------------------------------------------------
  const [menuOpen, setMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<Record<string, boolean>>({});
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpen = useRef(false);

  useEffect(() => {
    if (menuOpen) {
      wasMenuOpen.current = true;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setMenuOpen(false);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', onKeyDown);
      };
    }
    if (wasMenuOpen.current) {
      wasMenuOpen.current = false;
      menuButtonRef.current?.focus();
    }
    return undefined;
  }, [menuOpen]);

  // Close the drawer if the viewport grows into the desktop layout.
  useEffect(() => {
    if (!menuOpen || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 1025px)');
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [menuOpen]);

  const about = t.primary.find((item) => item.id === 'about');
  const services = t.primary.find((item) => item.id === 'services');

  return (
    <div
      className={cx('mnh', sticky && 'mnh--sticky', menuOpen && 'mnh--menu-open', className)}
      dir={t.dir}
      lang={t.locale}
    >
      {/* ------------------------------ Desktop ------------------------------ */}
      <header className="mnh-desktop">
        <div className="mnh-desktop__container">
          <div className="mnh-desktop__row">
            <div className="mnh-desktop__logo">
              <a href={href(t.logo.path)} className="mnh-logo" aria-label={t.labels.menascoHome}>
                <img src={logo} alt={t.logo.alt} className="mnh-logo__img mnh-logo__img--desktop" />
              </a>
            </div>

            <nav className="mnh-desktop__nav" aria-label={t.labels.primaryNavigation}>
              <ul ref={navRef} className="mnh-nav">
                {t.primary.map((item) => {
                  const hasPanel = Boolean(item.dropdown || item.megaMenu);
                  const isOpen = openId === item.id;
                  const isActive = activeItem === item.id;
                  const open = () => hasPanel && setOpenId(item.id);
                  const close = () => hasPanel && setOpenId(null);
                  return (
                    <li
                      key={item.id}
                      className={cx('mnh-nav__item', !item.megaMenu && 'mnh-nav__item--anchor')}
                      onMouseEnter={open}
                      onMouseLeave={close}
                      onBlur={(event: FocusEvent<HTMLLIElement>) => {
                        if (isOpen && !event.currentTarget.contains(event.relatedTarget as Node)) setOpenId(null);
                      }}
                    >
                      <a
                        ref={(el) => {
                          triggerRefs.current[item.id] = el;
                        }}
                        href={href(item.path)}
                        className={cx('mnh-nav__link', isActive && 'mnh-is-active', isOpen && 'mnh-is-open')}
                        aria-current={isActive ? 'page' : undefined}
                        aria-expanded={hasPanel ? isOpen : undefined}
                        aria-haspopup={hasPanel ? 'true' : undefined}
                        onFocus={() => {
                          if (!suppressFocusOpen.current) open();
                        }}
                        onPointerDown={(event: ReactPointerEvent<HTMLAnchorElement>) => {
                          pointerState.current = { type: event.pointerType, wasOpen: isOpen };
                        }}
                        onClick={(event: ReactMouseEvent<HTMLAnchorElement>) => {
                          // Touch has no hover: first tap opens the panel, second tap follows the link.
                          const { type, wasOpen } = pointerState.current;
                          pointerState.current = { type: 'mouse', wasOpen: false };
                          if (hasPanel && type === 'touch' && !wasOpen) {
                            event.preventDefault();
                            setOpenId(item.id);
                          }
                        }}
                      >
                        {item.label}
                        {hasPanel && <ChevronDownIcon size={15} className="mnh-nav__chev" />}
                        <span className="mnh-nav__underline" aria-hidden="true" />
                      </a>

                      {item.dropdown && (
                        <div className="mnh-dd" data-open={isOpen ? 'true' : 'false'}>
                          <div className="mnh-dd__panel">
                            <ul className="mnh-dd__list">
                              {item.dropdown.map((link) => (
                                <li key={link.path}>
                                  <a href={href(link.path)} className="mnh-dd__link">
                                    {link.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {item.megaMenu && (
                        <div className="mnh-mm" data-open={isOpen ? 'true' : 'false'}>
                          <div
                            className="mnh-mm__panel"
                            style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(item.megaMenu.groups.length, 1), 4)}, minmax(0, 1fr))` }}
                          >
                            {item.megaMenu.groups.map((group) => (
                              <div key={group.id} className="mnh-mm__col">
                                {group.path ? (
                                  <a href={href(group.path)} className="mnh-mm__heading">
                                    {group.label}
                                    <ArrowRightIcon size={14} className="mnh-arrow mnh-arrow--nudge" />
                                  </a>
                                ) : (
                                  <span className="mnh-mm__label">{group.label}</span>
                                )}
                                {group.links.length > 0 && (
                                  <ul className={cx('mnh-mm__links', group.path && 'mnh-mm__links--ruled')}>
                                    {group.links.map((link) => (
                                      <li key={link.path}>
                                        <a href={href(link.path)} className="mnh-mm__link">
                                          {link.label}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                            {item.megaMenu.footerLinks.length > 0 && (
                              <ul className="mnh-mm__footer">
                                {item.megaMenu.footerLinks.map((link) => (
                                  <li key={link.path}>
                                    <a href={href(link.path)} className="mnh-mm__footer-link">
                                      {link.label}
                                      <ArrowRightIcon size={14} className="mnh-arrow" />
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mnh-desktop__actions">
              <div className="mnh-desktop__actions-inner">
                <LanguageSwitch data={t} locale={t.locale} href={langHref} />
                <a href={href(t.cta.path)} className="mnh-btn mnh-btn--primary">
                  <span>{t.cta.label}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------ Mobile ------------------------------- */}
      <header className="mnh-mobile">
        <div className="mnh-mobile__row">
          <a href={href(t.logo.path)} className="mnh-logo" aria-label={t.labels.menascoHome}>
            <img src={logo} alt={t.logo.alt} className="mnh-logo__img mnh-logo__img--mobile" />
          </a>
          <div className="mnh-mobile__actions">
            <a href={href(t.contact.path)} className="mnh-mobile__contact" aria-label={t.contact.ariaLabel}>
              {t.contact.label}
            </a>
            <a
              href={href(t.companyProfile.path)}
              download={t.companyProfile.download}
              aria-label={t.companyProfile.label}
              className="mnh-mobile__profile"
            >
              <DownloadIcon size={13} />
              <span className="mnh-mobile__profile-label">{t.companyProfile.label}</span>
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              className="mnh-iconbtn mnh-iconbtn--menu"
              aria-label={t.labels.openMenu}
              aria-expanded={menuOpen}
              aria-controls="mnh-drawer"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* --------------------------- Mobile drawer --------------------------- */}
      <div
        id="mnh-drawer"
        className="mnh-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t.labels.siteNavigation}
        aria-hidden={menuOpen ? undefined : true}
        data-open={menuOpen ? 'true' : 'false'}
      >
        <div className="mnh-drawer__top">
          <span className="mnh-drawer__title">{t.labels.menu}</span>
          <div className="mnh-drawer__top-actions">
            <LanguageSwitch data={t} locale={t.locale} href={langHref} />
            <button
              ref={closeButtonRef}
              type="button"
              className="mnh-iconbtn mnh-iconbtn--close"
              aria-label={t.labels.closeMenu}
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon size={22} />
            </button>
          </div>
        </div>

        <nav className="mnh-drawer__nav" aria-label={t.labels.primaryNavigation}>
          <a href={href(t.logo.path)} className="mnh-drawer__link">
            {t.labels.home}
          </a>

          {about?.dropdown && (
            <Accordion
              id="about"
              title={about.label}
              open={Boolean(openAccordion.about)}
              onToggle={() => setOpenAccordion((s) => ({ ...s, about: !s.about }))}
            >
              <div className="mnh-acc__stack">
                {about.dropdown.map((link) => (
                  <a key={link.path} href={href(link.path)} className="mnh-acc__link">
                    {link.label}
                  </a>
                ))}
              </div>
            </Accordion>
          )}

          {services?.megaMenu && (
            <Accordion
              id="services"
              title={services.label}
              open={Boolean(openAccordion.services)}
              onToggle={() => setOpenAccordion((s) => ({ ...s, services: !s.services }))}
            >
              <div className="mnh-acc__stack">
                <a href={href(services.megaMenu.allServices.path)} className={cx('mnh-acc__parent', activeItem === 'services' && 'mnh-is-active')}>
                  {services.megaMenu.allServices.label}
                  <ArrowRightIcon size={16} className="mnh-arrow mnh-arrow--muted" />
                </a>
                {services.megaMenu.groups.map((group) => (
                  <div key={group.id} className="mnh-acc__group">
                    {group.path ? (
                      <a href={href(group.path)} className="mnh-acc__parent mnh-acc__parent--spaced">
                        {group.label}
                        <ArrowRightIcon size={16} className="mnh-arrow mnh-arrow--muted" />
                      </a>
                    ) : (
                      <p className="mnh-acc__label">{group.label}</p>
                    )}
                    {group.links.map((link) => (
                      <a key={link.path} href={href(link.path)} className="mnh-acc__child">
                        {link.label}
                      </a>
                    ))}
                  </div>
                ))}
                <a href={href(services.megaMenu.dataCenters.path)} className="mnh-acc__parent mnh-acc__parent--spaced mnh-acc__parent--ruled">
                  {services.megaMenu.dataCenters.label}
                  <ArrowRightIcon size={16} className="mnh-arrow mnh-arrow--muted" />
                </a>
              </div>
            </Accordion>
          )}

          {t.mobileDirectLinks.map((link) => {
            const isActive = Boolean(link.id && link.id === activeItem);
            return (
              <a
                key={link.path}
                href={href(link.path)}
                className={cx('mnh-drawer__link', isActive && 'mnh-is-active')}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="mnh-drawer__footer">
          <a href={href(t.cta.path)} className="mnh-drawer__cta">
            {t.cta.label}
          </a>
        </div>
      </div>
    </div>
  );
}

export default MenascoHeader;
