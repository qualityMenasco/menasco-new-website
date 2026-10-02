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
import { serviceI18nKeys, showcaseDisplayGroups, showcaseGroupChildren, isDataCentresLeaf } from '../../../data/services';
import { dataCentreServiceLink } from '../../../data/navigation';

/** Default right-panel content before the user expands/selects anything — the first leaf of the first group (today, Mechanical under MEP), not a hardcoded slug, so it stays correct if the taxonomy order ever changes. */
const defaultLeafHref = showcaseDisplayGroups[0]?.leaves[0]?.href ?? null;

export function ServicesShowcase() {
  const { t } = useTranslation(['home', 'services', 'nav', 'common']);
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
  const [selectedHref, setSelectedHref] = useState<string | null>(defaultLeafHref);
  const reducedMotion = useReducedMotion();
  const uid = useId();

  const selectedLeaf = selectedHref ? showcaseDisplayGroups.flatMap((g) => g.leaves).find((leaf) => leaf.href === selectedHref) ?? null : null;
  const selectedIsDataCentres = selectedLeaf ? isDataCentresLeaf(selectedLeaf) : false;
  const selectedService = selectedLeaf?.service ?? null;
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

  const toggleGroup = (group: (typeof showcaseDisplayGroups)[number]) => {
    const children = showcaseGroupChildren(group);
    if (expandedGroupKey === group.key) {
      setExpandedGroupKey(null);
      return;
    }
    setExpandedGroupKey(group.key);
    if (children.length > 0) setSelectedHref(children[0].href);
  };

  const selectChild = (href: string) => setSelectedHref(href);

  return (
    // joinTop: CompanyIntroduction directly above is also a warmwhite `lg`
    // section on the homepage — share one gap instead of 96px + 96px.
    <Section background="warmwhite" spacing="lg" edgeFade joinTop>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[5fr_4fr] md:items-stretch md:gap-10">
        {/* `md:items-stretch` on the grid lets this column stretch to the
            right card's height (the taller of the two in collapsed state);
            the CTA below is pushed to the bottom of that stretched space via
            `flex-1` + `items-end`, so it lines up with the card's bottom
            without being pinned/absolute. A min-h-free grid row on mobile
            (single column) makes this a no-op there, so the CTA just follows
            the content naturally. */}
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
                initially. A group only gets a chevron when it genuinely has
                subservices (derived from data, never hardcoded per category);
                the title itself is always a real link to that category's own
                page, kept as a separate control from the chevron so clicking
                the name never unexpectedly toggles the accordion instead of
                navigating. */}
            <nav aria-label={t('home:servicesShowcase.eyebrow')} className="flex flex-col">
              {showcaseDisplayGroups.map((group) => {
                const children = showcaseGroupChildren(group);
                const isExpandable = children.length > 0;
                const isExpanded = expandedGroupKey === group.key;
                const groupName = t(`nav:${group.i18nKey}`);
                const childrenId = `${uid}-children-${group.key}`;
                return (
                  <div key={group.key} className="border-t border-gray-200">
                    <div className="flex items-center">
                      <SmartLink
                        href={group.href!}
                        className="flex min-w-0 flex-1 items-center py-3.5 font-display text-h4 font-semibold text-ink transition-colors duration-base hover:text-brand-600"
                      >
                        {groupName}
                      </SmartLink>
                      {isExpandable && (
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={childrenId}
                          aria-label={t(isExpanded ? 'common:collapseSection' : 'common:expandSection', { name: groupName })}
                          onClick={() => toggleGroup(group)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center text-gray-500 transition-colors duration-base hover:text-brand-600"
                        >
                          <ChevronDown
                            size={18}
                            aria-hidden="true"
                            className={cn('transition-transform duration-base', isExpanded && 'rotate-180')}
                          />
                        </button>
                      )}
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpandable && isExpanded && (
                        <motion.div
                          id={childrenId}
                          initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col pb-2">
                            {children.map((leaf) => {
                              const leafServiceKey = leaf.service ? (serviceI18nKeys[leaf.service.slug] ?? leaf.service.slug) : null;
                              const leafName = leafServiceKey ? t(`services:items.${leafServiceKey}.name`) : t(`nav:${leaf.i18nKey}`);
                              const isSelected = selectedHref === leaf.href;
                              return (
                                <button
                                  key={leaf.href}
                                  type="button"
                                  aria-current={isSelected ? 'true' : undefined}
                                  onClick={() => selectChild(leaf.href)}
                                  className={cn(
                                    'flex min-h-11 items-center py-2.5 ps-5 text-start text-body font-medium transition-colors duration-base',
                                    isSelected ? 'text-brand-600' : 'text-gray-500 hover:text-ink',
                                  )}
                                >
                                  {leafName}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </Stack>
          <div className="mt-8 flex flex-1 items-end justify-start">
            <ButtonLink href="/services" variant="primary" trailingIcon={ArrowRight}>
              {t('home:servicesShowcase.cta')}
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
