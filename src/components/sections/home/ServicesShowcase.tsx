import { useId, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ProfessionalList } from '../../content/ProfessionalList';
import { ButtonLink } from '../../ui/Button';
import { SmartLink } from '../../../lib/SmartLink';
import { cn } from '../../../lib/utils';
import { serviceI18nKeys, servicePagePreviews, showcaseDisplayGroups, showcaseGroupChildren, isDataCentresLeaf } from '../../../data/services';
import { dataCentreServiceLink } from '../../../data/navigation';

/** A group's preview when it's opened: its own umbrella page, matching the "About" row that opens highlighted. */
const firstPreviewLeaf = (group: (typeof showcaseDisplayGroups)[number]) => group.leaves.find((leaf) => leaf.href === group.href) ?? group.leaves[0] ?? null;

/** Default right-panel content before the user expands/selects anything — the first group's umbrella page (today, MEP), not a hardcoded slug, so it stays correct if the taxonomy order ever changes. */
const defaultLeafHref = showcaseDisplayGroups[0] ? firstPreviewLeaf(showcaseDisplayGroups[0])?.href ?? null : null;

export function ServicesShowcase() {
  const { t, i18n } = useTranslation(['home', 'services', 'nav', 'common']);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const [selectedHref, setSelectedHref] = useState<string | null>(defaultLeafHref);
  const reducedMotion = useReducedMotion();
  const uid = useId();

  const selectedLeaf = selectedHref ? showcaseDisplayGroups.flatMap((g) => g.leaves).find((leaf) => leaf.href === selectedHref) ?? null : null;
  const selectedIsDataCentres = selectedLeaf ? isDataCentresLeaf(selectedLeaf) : false;
  const selectedUmbrella = selectedLeaf ? servicePagePreviews[selectedLeaf.href] ?? null : null;
  const selectedService = selectedUmbrella ? null : selectedLeaf?.service ?? null;
  const selectedServiceKey = selectedService ? (serviceI18nKeys[selectedService.slug] ?? selectedService.slug) : null;
  const selectedName = selectedIsDataCentres
    ? t(`nav:${dataCentreServiceLink.i18nKey}`)
    : selectedServiceKey
      ? t(`services:items.${selectedServiceKey}.name`)
      : selectedLeaf
        ? t(`nav:${selectedLeaf.i18nKey}`)
        : '';
  const selectedCapabilities = selectedServiceKey
    ? (t(`services:items.${selectedServiceKey}.capabilities`, { returnObjects: true, defaultValue: selectedService!.capabilities }) as string[])
    : [];
  // Modular and Custom have no capabilities list in their page copy.
  const selectedUmbrellaCapabilities = selectedUmbrella && i18n.exists(`services:${selectedUmbrella.copyKey}.capabilities`)
    ? (t(`services:${selectedUmbrella.copyKey}.capabilities`, { returnObjects: true }) as { title: string }[])
    : [];

  const toggleGroup = (group: (typeof showcaseDisplayGroups)[number]) => {
    if (expandedGroupKey === group.key) {
      setExpandedGroupKey(null);
      return;
    }
    setExpandedGroupKey(group.key);
    const previewLeaf = firstPreviewLeaf(group);
    if (previewLeaf) setSelectedHref(previewLeaf.href);
  };

  return (
    // Its own full padding + edge fade, like every other homepage section
    // boundary, so it reads as a distinct section from About MENASCO above
    // (both are warmwhite).
    <Section background="warmwhite" spacing="lg" edgeFade>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[5fr_4fr] md:items-stretch md:gap-10">
        {/* Left column: heading, the service list, then the CTA directly
            beneath the list. */}
        <div className="flex flex-col">
          <Stack space="lg">
            <Stack space="sm">
              <Eyebrow>{t('home:servicesShowcase.eyebrow')}</Eyebrow>
              <Heading level="h2" as="h3" className="max-w-3xl">
                {t('home:servicesShowcase.heading')}
              </Heading>
              <Text variant="body-lg" className="max-w-2xl">
                {t('home:servicesShowcase.description')}
              </Text>
            </Stack>

            {/* Collapsed by default — only the 5 top-level categories show
                initially. The whole row toggles its dropdown and sets the
                right-hand preview; every item inside the dropdown is a direct
                link to its page. Collapsed panels stay in the DOM (hidden, not unmounted) so
                those links remain in the page for crawlers. */}
            <nav aria-label={t('home:servicesShowcase.eyebrow')} className="flex flex-col">
              {showcaseDisplayGroups.map((group) => {
                const children = showcaseGroupChildren(group);
                const isExpanded = expandedGroupKey === group.key;
                const groupName = t(`nav:${group.i18nKey}`);
                const childrenId = `${uid}-children-${group.key}`;
                return (
                  <div key={group.key} className="border-t border-gray-200">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={childrenId}
                      onClick={() => toggleGroup(group)}
                      className="flex w-full items-center justify-between gap-4 py-3.5 text-start font-display text-h4 font-semibold text-ink transition-colors duration-base hover:text-brand-600"
                    >
                      <span className="min-w-0">{groupName}</span>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className={cn('shrink-0 transition-transform duration-base', isExpanded && 'rotate-180')}
                      />
                    </button>

                    <motion.div
                      id={childrenId}
                      initial={false}
                      animate={isExpanded ? { height: 'auto', opacity: 1, visibility: 'visible' } : { height: 0, opacity: 0, transitionEnd: { visibility: 'hidden' } }}
                      transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col pb-2">
                        <SmartLink
                          href={group.href!}
                          aria-current={selectedHref === group.href ? 'true' : undefined}
                          className={cn(
                            'flex min-h-11 items-center py-2.5 ps-5 text-start text-body font-medium transition-colors duration-base',
                            selectedHref === group.href ? 'text-brand-600' : 'text-gray-500 hover:text-ink',
                          )}
                        >
                          {t('home:servicesShowcase.aboutService', { name: groupName, defaultValue: 'About {{name}}' })}
                        </SmartLink>
                        {children.map((leaf) => {
                          const leafServiceKey = leaf.service ? (serviceI18nKeys[leaf.service.slug] ?? leaf.service.slug) : null;
                          const leafName = leafServiceKey ? t(`services:items.${leafServiceKey}.name`) : t(`nav:${leaf.i18nKey}`);
                          return (
                            <SmartLink
                              key={leaf.href}
                              href={leaf.href}
                              className="flex min-h-11 items-center py-2.5 ps-5 text-start text-body font-medium text-gray-500 transition-colors duration-base hover:text-ink"
                            >
                              {leafName}
                            </SmartLink>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </nav>
          </Stack>
          {/* Sits directly under the list rather than pinned to the column's
              bottom, which left a large dead gap above it. */}
          <div className="mt-8 flex flex-wrap justify-start gap-3">
            <ButtonLink href="/services" variant="primary" trailingIcon={ArrowRight}>
              {t('home:servicesShowcase.cta')}
            </ButtonLink>
            {/* Moved here from About MENASCO; outlined so the services CTA stays primary. */}
            <ButtonLink href="/about" variant="outline">
              {t('home:companyIntro.cta')}
            </ButtonLink>
          </div>
        </div>

        <div className="group relative flex flex-col overflow-hidden rounded-md border border-gray-200 transition-colors duration-base ease-engineered hover:border-gray-400 md:sticky md:top-28 md:min-h-[26rem] md:self-start">
          {selectedLeaf && (
            <SmartLink
              href={selectedLeaf.href}
              aria-label={t('home:servicesShowcase.viewService', { name: selectedName })}
              className="absolute inset-0 z-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            />
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={selectedLeaf?.href ?? 'default'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              className="flex h-full flex-col"
            >
              {!selectedLeaf ? (
                <div className="flex flex-1 flex-col justify-center gap-2 p-6 md:p-7">
                  <Text variant="body-lg">{t('home:servicesShowcase.description')}</Text>
                </div>
              ) : selectedIsDataCentres ? (
                <>
                  <div className="aspect-[16/9] shrink-0 overflow-hidden bg-gray-100">
                    <img
                      src="/data-center-poster.jpg"
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-base ease-engineered group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                    <Text variant="body-lg">{t('services:dataCenter.hero.description')}</Text>
                  </div>
                </>
              ) : selectedService ? (
                <>
                  <div className="aspect-[16/9] shrink-0 overflow-hidden bg-gray-100">
                    <img
                      src={selectedService.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-base ease-engineered group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                    <Text variant="body-lg">{t(`services:items.${selectedServiceKey}.shortDescription`)}</Text>
                    <ProfessionalList
                      variant="divided"
                      gap="sm"
                      items={selectedCapabilities.slice(0, 4).map((capability) => ({ title: capability }))}
                    />
                  </div>
                </>
              ) : selectedUmbrella ? (
                <>
                  <div className="aspect-[16/9] shrink-0 overflow-hidden bg-gray-100">
                    <img
                      src={selectedUmbrella.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-base ease-engineered group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                    <Text variant="body-lg">{t(`services:${selectedUmbrella.copyKey}.seo.description`)}</Text>
                    {selectedUmbrellaCapabilities.length > 0 && (
                      <ProfessionalList
                        variant="divided"
                        gap="sm"
                        items={selectedUmbrellaCapabilities.slice(0, 4).map((capability) => ({ title: capability.title }))}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col justify-center gap-2 p-6 md:p-7">
                  <Text variant="body-lg" className="font-semibold text-ink">
                    {selectedName}
                  </Text>
                  <Text variant="small" muted>
                    {t('common:pendingContent.notice')}
                  </Text>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
