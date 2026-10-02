import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionHeader } from '../components/SectionHeader';
import { MobileCTA } from '../components/MobileCTA';
import { LocaleLink } from '../components/LocaleLink';
import { SEO } from '../../seo/SEO';
import {} from '../../seo/structuredData';
import { services } from '../../data/services';
import { dataCentreServiceLink, pendingContentPaths, servicesNavigationGroups } from '../../data/navigation';
import { slugify } from '../../lib/utils';

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
  'bim-digital-engineering': 'bimDigitalEngineering',
  'manufacturing-prefabrication': 'manufacturingPrefabrication',
};

const isPending = (href: string) => (pendingContentPaths as readonly string[]).includes(href);

/**
 * A clickable category title ("Civil →") shared by every top-level group
 * heading and the Data Centres heading below. The link and its arrow are
 * plain inline content (not flex) deliberately — flex would lay the arrow
 * out as its own item vertically centered against the whole (possibly
 * two-line) title block instead of flowing after the title's last word, so
 * wrapped titles like "Manufacturing & Prefabrication" would show the arrow
 * floating mid-row instead of right after "Prefabrication". Inline flow lets
 * the icon wrap naturally with the text, landing right after the final word
 * on whichever line it ends up on. The gap before the icon is a non-breaking
 * space (not a margin) so the browser can't choose to wrap the icon alone
 * onto its own line when the title's last word fits but title+icon together
 * don't — only the regular spaces between earlier words stay breakable.
 */
function ServiceGroupHeadingLink({ href, id, label }: { href: string; id: string; label: string }) {
  const words = label.split(' ');
  const lastWord = words.pop() ?? label;
  const leadingWords = words.join(' ');
  return (
    <LocaleLink
      to={href}
      id={id}
      className="group flex min-h-[44px] items-center text-caption font-semibold uppercase tracking-wide text-gray-600 transition-colors duration-base hover:text-brand-600"
    >
      {/*
        The outer link is flex only to vertically center this single span
        within the 44px tap target — the span itself is normal inline
        content, so the arrow flows and wraps with the label's text instead
        of being laid out as its own flex item against a possibly two-line
        label. The last word is further glued to the icon in its own
        `whitespace-nowrap` span, since a non-breaking space alone doesn't
        stop the browser breaking between it and a following inline-block
        icon — that unbreakable unit can still move to a new line as a
        whole, it just can never split the word away from the arrow.
      */}
      <span>
        {leadingWords && `${leadingWords} `}
        <span className="whitespace-nowrap">
          {lastWord}
          {' '}
          <ArrowRight size={14} aria-hidden="true" className="inline-block shrink-0 align-middle rtl:rotate-180" />
        </span>
      </span>
    </LocaleLink>
  );
}

/**
 * Compact editorial list row — thumbnail (when the destination has imagery),
 * name, one-line summary. Rows rather than 2-up cards keep every service
 * scannable within ~1.5 phone screens.
 */
function ServiceRow({ href, title, summary, image }: { href: string; title: string; summary: string; image?: string }) {
  return (
    <li>
      <LocaleLink to={href} className="group flex min-h-[44px] items-center gap-4 py-3">
        {image ? (
          <span className="h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-gray-100">
            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-display text-body-lg font-semibold text-ink">{title}</span>
          <span className="line-clamp-2 text-small text-gray-600">{summary}</span>
        </span>
        <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-gray-500 rtl:rotate-180" />
      </LocaleLink>
    </li>
  );
}

export default function ServicesPage() {
  const { t } = useTranslation(['services', 'common', 'nav']);

  const rowFor = (label: string, href: string) => {
    if (isPending(href)) {
      return <ServiceRow key={href} href={href} title={label} summary={t('common:pendingContent.detailsForthcoming')} />;
    }
    const service = services.find((entry) => `/services/${entry.slug}` === href);
    if (!service) return null;
    const key = serviceKeys[service.slug] ?? service.slug;
    return (
      <ServiceRow
        key={href}
        href={href}
        image={service.image}
        title={t(`services:items.${key}.name`)}
        summary={t(`services:items.${key}.shortDescription`)}
      />
    );
  };

  return (
    <>
      <SEO
        title={t('services:seo.title')}
        description={t('services:seo.description')}
        path="/services"
        pageType="CollectionPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }]}
      />

      <section className="px-4 py-8">
        <SectionHeader
          eyebrow={t('services:listing.eyebrow')}
          heading={t('services:listing.mobileHeading')}
          headingAs="h2"
          description={t('services:listing.description')}
        />

        <div className="mt-6 flex flex-col">
          {servicesNavigationGroups.map((group) => {
            const groupName = t(`nav:${group.i18nKey}`);
            const anchorId = slugify(group.label);
            // Every group with its own page gets a clickable heading. Its own
            // page ALSO appears as a row among the children only when
            // skipping it would either leave the section empty (no children
            // at all, e.g. Turnkey Developments) or would delete a genuine
            // already-built preview row (a real, non-pending page, e.g.
            // Manufacturing & Prefabrication) rather than a bare row that
            // merely repeats the now-clickable heading.
            const linkHeading = Boolean(group.href);
            const includeLeadRow = Boolean(group.href) && (group.links.length === 0 || !isPending(group.href!));
            return (
              <section key={group.i18nKey} id={anchorId} aria-labelledby={`${anchorId}-heading`} className="scroll-mt-20 border-t border-gray-200 pt-5 pb-3">
                {linkHeading ? (
                  <ServiceGroupHeadingLink href={group.href!} id={`${anchorId}-heading`} label={groupName} />
                ) : (
                  <h3 id={`${anchorId}-heading`} className="text-caption font-semibold uppercase tracking-wide text-gray-600">
                    {groupName}
                  </h3>
                )}
                <ul role="list" className="mt-1 divide-y divide-gray-200">
                  {includeLeadRow && rowFor(groupName, group.href!)}
                  {group.links.map((link) => rowFor(t(`nav:${link.i18nKey}`), link.href))}
                </ul>
              </section>
            );
          })}

          <section id="data-centres" aria-labelledby="data-centres-heading" className="scroll-mt-20 border-t border-gray-200 pt-5">
            <ServiceGroupHeadingLink
              href={dataCentreServiceLink.href}
              id="data-centres-heading"
              label={t(`nav:${dataCentreServiceLink.i18nKey}`)}
            />
            <ul role="list" className="mt-1">
              <ServiceRow
                href={dataCentreServiceLink.href}
                image="/data-center-poster.jpg"
                title={t('services:dataCenter.hero.eyebrow')}
                summary={t('services:dataCenter.hero.description')}
              />
            </ul>
          </section>
        </div>
      </section>

      <MobileCTA
        heading={t('services:listing.mobileCtaHeading')}
        description={t('services:listing.mobileCtaDescription')}
        primary={{ label: t('common:buttons.requestQuote'), href: '/contact?type=project' }}
      />
    </>
  );
}
