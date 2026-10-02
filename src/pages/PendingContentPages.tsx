import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '../components/ui/Button';
import { servicesNavigationGroups } from '../data/navigation';
import { SEO } from '../seo/SEO';
import { PagePlaceholder } from './PagePlaceholder';

/**
 * Structure-only pages for IA nodes that don't yet have approved content
 * (see `pendingContentPaths` in src/data/navigation.ts). Each renders only
 * verified wording — an existing approved capability line where one exists,
 * otherwise just the name — plus onward links. All are `noIndex` and are
 * excluded from the sitemap and llms.txt until real content replaces them.
 *
 * Single shared implementation for both desktop and mobile (like
 * LynxqcPrivacyPolicyPage): a short holding page needs no divergent layout.
 */

const CONTACT_HREF = '/contact?type=project';

function ContactButton() {
  const { t } = useTranslation('common');
  return (
    <ButtonLink href={CONTACT_HREF} variant="primary">
      {t('buttons.requestQuote')}
    </ButtonLink>
  );
}

function ParentLink({ label, href }: { label: string; href: string }) {
  return (
    <ButtonLink href={href} variant="outline" trailingIcon={ArrowRight}>
      {label}
    </ButtonLink>
  );
}

/** A child of Manufacturing & Prefabrication — `capabilityIndex` points at its approved line in services.json `manufacturingPage.capabilities`. */
function ManufacturingChildPage({ path, navKey, capabilityIndex }: { path: string; navKey: string; capabilityIndex: number }) {
  const { t } = useTranslation(['nav', 'services', 'common']);
  const title = t(`nav:${navKey}`);
  const parentName = t('nav:servicesGroups.manufacturingPrefabrication');
  const capability = t(`services:manufacturingPage.capabilities.${capabilityIndex}`, { returnObjects: true }) as { title?: string; description?: string };
  const lead = capability?.title && capability?.description ? `${capability.title}: ${capability.description}` : undefined;
  return (
    <>
      <SEO title={`${title} | ${parentName}`} description={t('common:pendingContent.notice')} path={path} noIndex follow />
      <PagePlaceholder
        eyebrow={parentName}
        title={title}
        lead={lead}
        description={t('common:pendingContent.notice')}
        actions={
          <>
            <ContactButton />
            <ParentLink label={t('services:listing.exploreService', { name: parentName })} href="/services/manufacturing-prefabrication" />
          </>
        }
      />
    </>
  );
}

/**
 * A Services group whose own page has no approved content yet, but whose
 * children (Mechanical, Electrical, BIM & Digital Engineering, ...) are
 * real, published pages — MEP and Civil. Child links come straight from
 * `servicesNavigationGroups`, so this can never drift from the live nav and
 * never invents a capability list of its own; it only ever points at pages
 * that already exist.
 */
function ServiceGroupPage({ groupHref }: { groupHref: string }) {
  const { t } = useTranslation(['nav', 'common']);
  const group = servicesNavigationGroups.find((entry) => entry.href === groupHref);
  const title = group ? t(`nav:${group.i18nKey}`) : groupHref;
  return (
    <>
      <SEO title={title} description={t('common:pendingContent.notice')} path={groupHref} noIndex follow />
      <PagePlaceholder
        eyebrow={t('nav:services')}
        title={title}
        description={t('common:pendingContent.notice')}
        links={group?.links.map((link) => ({ label: t(`nav:${link.i18nKey}`), href: link.href }))}
        actions={
          <>
            <ContactButton />
            <ParentLink label={t('nav:allServices')} href="/services" />
          </>
        }
      />
    </>
  );
}

export function MepPage() {
  return <ServiceGroupPage groupHref="/services/mep" />;
}

export function CivilPage() {
  return <ServiceGroupPage groupHref="/services/civil" />;
}

export function ModularPage() {
  // capabilities[1] = "Prefabricated MEP Modules"
  return <ManufacturingChildPage path="/services/manufacturing-prefabrication/modular" navKey="servicesList.modular" capabilityIndex={1} />;
}

export function CustomPage() {
  // capabilities[5] = "Custom Engineered Components"
  return <ManufacturingChildPage path="/services/manufacturing-prefabrication/custom" navKey="servicesList.custom" capabilityIndex={5} />;
}

export function TurnkeyDevelopmentsPage() {
  const { t } = useTranslation(['nav', 'common']);
  const title = t('nav:servicesGroups.turnkeyDevelopments');
  return (
    <>
      <SEO title={title} description={t('common:pendingContent.notice')} path="/services/turnkey-developments" noIndex follow />
      <PagePlaceholder
        eyebrow={t('nav:services')}
        title={title}
        description={t('common:pendingContent.notice')}
        actions={
          <>
            <ContactButton />
            <ParentLink label={t('nav:allServices')} href="/services" />
          </>
        }
      />
    </>
  );
}

export function CertificationTrainingPage() {
  const { t } = useTranslation(['nav', 'common']);
  const title = t('nav:certificationTraining');
  return (
    <>
      <SEO title={title} description={t('common:pendingContent.notice')} path="/certification-training" noIndex follow />
      <PagePlaceholder
        eyebrow={t('nav:about')}
        title={title}
        description={t('common:pendingContent.notice')}
        actions={
          <>
            <ContactButton />
            <ParentLink label={t('nav:qualitySafety')} href="/quality-safety" />
          </>
        }
      />
    </>
  );
}
