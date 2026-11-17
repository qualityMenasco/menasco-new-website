import { useId, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ProfessionalList } from '../../content/ProfessionalList';
import { ButtonLink } from '../../ui/Button';
import { foundingYear } from '../../../data/companyStats';
import { SmartLink } from '../../../lib/SmartLink';
import { cn } from '../../../lib/utils';
import { serviceI18nKeys, servicePagePreviews, showcaseDisplayGroups, showcaseGroupChildren, isDataCentresLeaf } from '../../../data/services';
import { dataCentreServiceLink } from '../../../data/navigation';

/** A group's preview when it's opened: its own umbrella page, matching the "About" row that opens highlighted. */
const firstPreviewLeaf = (group: (typeof showcaseDisplayGroups)[number]) => group.leaves.find((leaf) => leaf.href === group.href) ?? group.leaves[0] ?? null;

/** Default right-panel content before the user expands/selects anything — the first group's umbrella page (today, MEP), not a hardcoded slug, so it stays correct if the taxonomy order ever changes. */
const defaultLeafHref = showcaseDisplayGroups[0] ? firstPreviewLeaf(showcaseDisplayGroups[0])?.href ?? null : null;

/** Home-specific preview copy (home:servicesShowcase.previews.*), keyed by each discipline's page. Takes precedence over the service pages' own SEO description/capabilities. */
const homePreviewKeys: Record<string, string> = {
  '/services/mep': 'mep',
  '/services/civil': 'civil',
  '/services/manufacturing-prefabrication': 'manufacturingPrefabrication',
  '/services/turnkey-developments': 'epc',
  '/services/data-centers': 'dataCenters',
};

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

  // The opened discipline's home preview copy, if it has one.
  const previewGroup = selectedHref ? showcaseDisplayGroups.find((g) => g.leaves.some((leaf) => leaf.href === selectedHref)) : null;
  const homePreviewKey = previewGroup?.href ? homePreviewKeys[previewGroup.href] : undefined;
  const homePreview = homePreviewKey && i18n.exists(`home:servicesShowcase.previews.${homePreviewKey}.description`)
    ? {
        description: t(`home:servicesShowcase.previews.${homePreviewKey}.description`),
        points: t(`home:servicesShowcase.previews.${homePreviewKey}.points`, { returnObjects: true }) as string[],
      }
    : null;

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
    // About MENASCO + What we deliver in one section (desktop), as a 2x2 grid:
    //   about text      | static photo
    //   service list    | preview snippet for the opened service
    // Each row's two cells are vertically centred on each other. (Replaces the
    // sticky right-hand preview, which didn't stick reliably.)
    <Section background="warmwhite" spacing="sm">
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 md:items-center">
        {/* Top left: About MENASCO. */}
        <Stack space="sm">
          <Eyebrow>{t('home:companyIntro.eyebrow')}</Eyebrow>
          <Heading level="h3" as="h3" className="max-w-3xl text-balance">
            {t('home:companyIntro.heading', { years: new Date().getFullYear() - foundingYear })}
          </Heading>
          <Text className="max-w-2xl">
            {t('home:companyIntro.description', { foundingYear })}
          </Text>
        </Stack>

        {/* Top right: one static photo. */}
        <div className="aspect-[16/9] overflow-hidden rounded-md bg-gray-100">
          <img
            src="/mechanical-plant-room.jpg"
            alt="Insulated chilled-water pipework, pumps and a fire-protection main in a MENASCO-installed mechanical plant room"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Bottom left: What we deliver, the service list (collapsed by
            default; the whole row toggles its dropdown and sets the preview;
            every item inside is a direct link; collapsed panels stay in the
            DOM for crawlers), then the two buttons. */}
        <div className="flex flex-col">
          <div className="mb-4 flex flex-col gap-1.5">
            <Eyebrow className="mb-0">{t('home:servicesShowcase.eyebrow')}</Eyebrow>
            <p className="font-display text-h4 font-medium tracking-tight text-gray-500">{t('home:servicesShowcase.heading')}</p>
          </div>
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
                    className="flex w-full items-center justify-between gap-4 py-2.5 text-start font-display text-body-lg font-semibold leading-snug text-ink transition-colors duration-base hover:text-brand-600"
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
                          'flex min-h-9 items-center py-1.5 ps-5 text-start text-body font-medium transition-colors duration-base',
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
                            className="flex min-h-9 items-center py-1.5 ps-5 text-start text-body font-medium text-gray-500 transition-colors duration-base hover:text-ink"
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
          <div className="mt-5 flex flex-wrap justify-start gap-3">
            <ButtonLink href="/services" variant="primary" trailingIcon={ArrowRight}>
              {t('home:servicesShowcase.cta')}
            </ButtonLink>
            <ButtonLink href="/about" variant="outline">
              {t('home:companyIntro.cta')}
            </ButtonLink>
          </div>
        </div>

        {/* Bottom right: the snippet for the opened service (text only, not a
            link), on a muted grey card that lifts on hover. */}
        <div className="relative grid overflow-hidden rounded-md border border-gray-200 bg-gray-100 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={selectedLeaf?.href ?? 'default'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.22, 0.61, 0.36, 1] }}
              className="col-start-1 row-start-1 flex flex-col"
            >
              {selectedLeaf && (
                <Eyebrow className="mb-0 px-6 pt-6">{selectedName}</Eyebrow>
              )}
              {homePreview ? (
                <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-2">
                  <Text>{homePreview.description}</Text>
                  <ProfessionalList variant="divided" gap="sm" items={homePreview.points.map((point) => ({ title: point }))} />
                </div>
              ) : !selectedLeaf ? (
                <div className="flex flex-1 flex-col justify-center gap-2 p-6">
                  <Text variant="body-lg">{t('home:servicesShowcase.description')}</Text>
                </div>
              ) : selectedIsDataCentres ? (
                <>
                  <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-2">
                    <Text>{t('services:dataCenter.hero.description')}</Text>
                  </div>
                </>
              ) : selectedService ? (
                <>
                  <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-2">
                    <Text>{t(`services:items.${selectedServiceKey}.shortDescription`)}</Text>
                    <ProfessionalList
                      variant="divided"
                      gap="sm"
                      items={selectedCapabilities.slice(0, 3).map((capability) => ({ title: capability }))}
                    />
                  </div>
                </>
              ) : selectedUmbrella ? (
                <>
                  <div className="flex flex-1 flex-col gap-3 px-6 pb-6 pt-2">
                    <Text>{t(`services:${selectedUmbrella.copyKey}.seo.description`)}</Text>
                    {selectedUmbrellaCapabilities.length > 0 && (
                      <ProfessionalList
                        variant="divided"
                        gap="sm"
                        items={selectedUmbrellaCapabilities.slice(0, 3).map((capability) => ({ title: capability.title }))}
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col justify-center gap-2 p-6">
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
