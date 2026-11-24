/**
 * Whether a navigation link (canonical English path, optionally with a #hash)
 * points at the page the visitor is on. `path` is the current pathname with any
 * locale prefix already stripped (see stripLocale). A link is current on its own
 * page and on every page nested under it, so /services/data-centers stays current
 * on /services/data-centers/sustainability. Shared by the desktop dropdowns and
 * the phone/tablet menu so both highlight the same item.
 */
export function isNavLinkActive(path: string, href: string): boolean {
  const target = href.split('#')[0];
  if (!target || target === '/') return path === '/';
  if (path === target || path.startsWith(`${target}/`)) return true;
  // Individual leader profiles (/leadership/<name>) belong to the Leadership Team page.
  return target === '/team' && path.startsWith('/leadership/');
}
