import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { SectionHeader } from '../components/typography/SectionHeader';
import { Heading, Text } from '../components/typography/Typography';
import { ServiceCard } from '../components/cards/ServiceCard';
import { CtaBand } from '../components/sections/CtaBand';
import { services, serviceI18nKeys as serviceKeys } from '../data/services';
import { dataCentreServiceLink, pendingContentPaths, servicesNavigationGroups } from '../data/navigation';
import { SmartLink } from '../lib/SmartLink';
import { slugify } from '../lib/utils';
import { SEO } from '../seo/SEO';
import {} from '../seo/structuredData';

const isPending = (href: string) => (pendingContentPaths as readonly string[]).includes(href);
const serviceByHref = (href: string) => services.find((service) => `/services/${service.slug}` === href);

/**
 * A clickable category title ("Civil →") shared by every top-level group
 * heading and the Data Centres heading below. The link is plain inline
 * content (not flex) deliberately — flex would lay the arrow out as its own
 * item vertically centered against the whole (possibly two-line) title block
 * instead of flowing after the title's last word, so wrapped titles like
 * "Manufacturing & Prefabrication" would show the arrow floating mid-column
 * instead of right after "Prefabrication". The title's last word and the
 * arrow are further wrapped together in a `whitespace-nowrap` span: a
 * non-breaking space alone isn't enough (Chromium can still break the line
 * between an nbsp and a following inline-block element), so the last word is
 * split off and glued to the icon as one unbreakable unit — that unit can
 * still move to a new line as a whole, it just can never be split apart
 * internally, which is what actually guarantees the arrow never floats away
 * from the text it belongs to, in any language.
 */
function ServiceGroupHeadingLink({ href, id, label }: { href: string; id: string; label: string }) {
  const words = label.split(' ');
  const lastWord = words.pop() ?? label;
  const leadingWords = words.join(' ');
  return (
    <Heading level="h3" as="h3" id={id}>
      <SmartLink href={href} className="group inline transition-colors duration-base hover:text-brand-600">
        {leadingWords && `${leadingWords} `}
        <span className="whitespace-nowrap">
          {lastWord}
          {' '}
          <ArrowRight
            size={18}
            aria-hidden="true"
            className="inline-block shrink-0 align-middle text-gray-500 transition-transform duration-base group-hover:translate-x-0.5 group-hover:text-brand-600 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          />
        </span>
      </SmartLink>
    </Heading>
  );
}

/** Compact row for a structure-only destination — name, "details coming soon", real link. */
function PendingServiceRow({ label, href }: { label: string; href: string }) {
  const { t } = useTranslation('common');
  return (
    <li>
      <SmartLink
        href={href}
        className="group flex items-center justify-between gap-4 py-4 transition-colors duration-base hover:text-brand-600"
      >
        <span className="flex flex-col gap-0.5">
          <span className="font-display text-h4 font-semibold text-ink transition-colors duration-base group-hover:text-brand-600">
            {label}
          </span>
          <span className="text-small text-gray-600">{t('pendingContent.detailsForthcoming')}</span>
        </span>
        <ArrowRight
          size={18}
          aria-hidden="true"
          className="shrink-0 text-gray-500 transition-transform duration-base group-hover:translate-x-0.5 group-hover:text-brand-600 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
        />
      </SmartLink>
    </li>
  );
}

export default function ServicesPage() {
  const { t } = useTranslation(['services', 'nav', 'common']);

  const renderServiceCard = (href: string) => {
    const service = serviceByHref(href);
    if (!service) return null;
    const key = serviceKeys[service.slug] ?? service.slug;
    const name = t(`services:items.${key}.name`);
    return (
      <ServiceCard
        key={service.id}
        image={service.image}
        imageAlt={`MENASCO ${name} services`}
        title={name}
        description={t(`services:items.${key}.shortDescription`)}
        link={{ label: t('services:listing.exploreService', { name }), href }}
        headingAs="h4"
      />
    );
  };

  const dataCentreName = t(`nav:${dataCentreServiceLink.i18nKey}`);

  return (
    <>
      <SEO
        title={t('services:seo.title')}
        description={t('services:seo.description')}
        path="/services"
        pageType="CollectionPage"
        breadcrumb={[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }]}
      />
      <Section spacing="lg" background="warmwhite">
        <Stack space="lg">
          <SectionHeader
            eyebrow={t('services:listing.eyebrow')}
            heading={t('services:listing.heading')}
            headingAs="h2"
            description={t('services:listing.description')}
          />

          <div className="flex flex-col">
            {servicesNavigationGroups.map((group) => {
              const groupName = t(`nav:${group.i18nKey}`);
              // Every group with its own page gets a clickable heading. Its
              // own page ALSO appears as a destination among the children
              // (a card, or — while pending — a "coming soon" row) only when
              // skipping it would either leave the content column empty (no
              // children at all, e.g. Turnkey Developments) or would delete
              // a genuine already-built preview card (a real, non-pending
              // page, e.g. Manufacturing & Prefabrication) rather than a
              // bare row that merely repeats the now-clickable heading.
              const groupHeadingHref = group.href;
              const includeLeadDestination = Boolean(group.href) && (group.links.length === 0 || !isPending(group.href!));
              const destinations = [
                ...(includeLeadDestination ? [{ label: groupName, href: group.href! }] : []),
                ...group.links.map((link) => ({ label: t(`nav:${link.i18nKey}`), href: link.href })),
              ];
              const live = destinations.filter((destination) => !isPending(destination.href));
              const pending = destinations.filter((destination) => isPending(destination.href));
              const anchorId = slugify(group.label);

              return (
                <section
                  key={group.i18nKey}
                  id={anchorId}
                  aria-labelledby={`${anchorId}-heading`}
                  className="grid scroll-mt-28 grid-cols-1 gap-8 border-t border-gray-200 py-12 lg:grid-cols-12 lg:gap-10"
                >
                  <div className="lg:col-span-4">
                    <div className="flex flex-col gap-3 lg:sticky lg:top-28">
                      {groupHeadingHref ? (
                        <ServiceGroupHeadingLink href={groupHeadingHref} id={`${anchorId}-heading`} label={groupName} />
                      ) : (
                        <Heading level="h3" as="h3" id={`${anchorId}-heading`}>
                          {groupName}
                        </Heading>
                      )}
                      <Text variant="small" muted>
                        {group.links.length > 0 ? group.links.map((link) => t(`nav:${link.i18nKey}`)).join(' · ') : null}
                      </Text>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6 lg:col-span-8">
                    {live.length > 0 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{live.map((destination) => renderServiceCard(destination.href))}</div>}
                    {pending.length > 0 && (
                      <ul role="list" className="divide-y divide-gray-200 border-y border-gray-200">
                        {pending.map((destination) => (
                          <PendingServiceRow key={destination.href} label={destination.label} href={destination.href} />
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              );
            })}

            {/* Data centre MEP — a sector solution alongside the four service groups, not a fifth discipline. */}
            <section
              id="data-centres"
              aria-labelledby="data-centres-heading"
              className="grid scroll-mt-28 grid-cols-1 gap-8 border-t border-gray-200 pt-12 lg:grid-cols-12 lg:gap-10"
            >
              <div className="lg:col-span-4">
                <ServiceGroupHeadingLink href={dataCentreServiceLink.href} id="data-centres-heading" label={dataCentreName} />
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8">
                <ServiceCard
                  image="/data-center-poster.jpg"
                  imageAlt={`MENASCO ${dataCentreName}`}
                  title={t('services:dataCenter.hero.eyebrow')}
                  description={t('services:dataCenter.hero.description')}
                  link={{ label: t('services:listing.exploreService', { name: dataCentreName }), href: dataCentreServiceLink.href }}
                  headingAs="h4"
                />
              </div>
            </section>
          </div>
        </Stack>
      </Section>
      <CtaBand
        heading={t('services:listing.mobileCtaHeading')}
        description={t('services:listing.mobileCtaDescription')}
        primary={{ label: t('common:buttons.requestQuote'), href: '/contact?type=project' }}
      />
    </>
  );
}
