import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Section } from '../../layout/Section';
import { Stack } from '../../layout/Stack';
import { Eyebrow, Heading, Text } from '../../typography/Typography';
import { ProfessionalList } from '../../content/ProfessionalList';
import { ButtonLink } from '../../ui/Button';
import { SmartLink } from '../../../lib/SmartLink';
import { cn } from '../../../lib/utils';
import { services } from '../../../data/services';

/** How long each service stays active before auto-advancing. Change this one constant to retune the pace. */
const AUTO_ROTATE_INTERVAL = 5000;

const serviceKeys: Record<string, string> = {
  mechanical: 'mechanical',
  electrical: 'electrical',
  plumbing: 'plumbing',
  'fire-protection': 'fireProtection',
  'bim-digital-engineering': 'bimDigitalEngineering',
  'manufacturing-prefabrication': 'manufacturingPrefabrication',
};

/**
 * Numbered, image-led service navigator — deliberately not six identical
 * cards. Auto-advances through the list until the user selects one
 * (click or keyboard), at which point it stays put permanently for the
 * rest of the session. Swap for a different ServicesShowcase variant by
 * changing the import in HomePage.tsx.
 */
export function ServicesShowcase() {
  const { t } = useTranslation(['home', 'services']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const uid = useId();

  const active = services[activeIndex];
  const activeKey = serviceKeys[active.slug] ?? active.slug;
  const activeName = t(`services:items.${activeKey}.name`);
  const activeCapabilities = t(`services:items.${activeKey}.capabilities`, {
    returnObjects: true,
    defaultValue: active.capabilities,
  }) as string[];

  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const shouldAutoRotate = !hasUserSelected && !isHovered && !isFocusedWithin && !reducedMotion && isTabVisible;

  useEffect(() => {
    if (!shouldAutoRotate) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % services.length);
    }, AUTO_ROTATE_INTERVAL);
    return () => window.clearInterval(interval);
  }, [shouldAutoRotate]);

  const selectService = (index: number) => {
    setActiveIndex(index);
    setHasUserSelected(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = services.length;
    let target: number | null = null;
    if (event.key === 'ArrowDown') target = (index + 1) % count;
    else if (event.key === 'ArrowUp') target = (index - 1 + count) % count;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = count - 1;
    if (target !== null) {
      event.preventDefault();
      selectService(target);
      tabRefs.current[target]?.focus();
    }
  };

  return (
    <Section background="warmwhite" spacing="lg" edgeFade>
      <div
        className="grid grid-cols-1 items-start gap-8 md:grid-cols-[5fr_4fr] md:items-stretch md:gap-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsFocusedWithin(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsFocusedWithin(false);
        }}
      >
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

          <ul role="tablist" aria-label="MENASCO services" className="flex flex-col border-t border-gray-200">
            {services.map((service, index) => {
              const isActive = index === activeIndex;
              const key = serviceKeys[service.slug] ?? service.slug;
              const tabId = `${uid}-tab-${service.id}`;
              const panelId = `${uid}-panel-${service.id}`;
              return (
                <li key={service.id} className="relative border-b border-gray-200">
                  <button
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    role="tab"
                    id={tabId}
                    aria-selected={isActive}
                    aria-controls={panelId}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectService(index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    className={cn(
                      'group flex w-full items-start gap-4 py-5 text-start transition-colors duration-base',
                      isActive ? 'text-ink' : 'text-gray-500 hover:text-ink',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 font-display text-small font-semibold tabular-nums transition-colors duration-base',
                        isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-brand-600',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">
                      <span
                        className={cn(
                          'block font-display text-h4 font-semibold transition-colors duration-base',
                          isActive ? 'text-ink' : 'text-gray-500 group-hover:text-ink',
                        )}
                      >
                        {t(`services:items.${key}.name`)}
                      </span>
                    </span>
                  </button>
                  {isActive && shouldAutoRotate && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-gray-200" aria-hidden="true">
                      <motion.span
                        key={`${service.id}-${activeIndex}`}
                        className="block h-full bg-brand-600"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: AUTO_ROTATE_INTERVAL / 1000, ease: 'linear' }}
                      />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Stack>

        <div className="group relative flex h-full flex-col overflow-hidden rounded-md border border-gray-200 transition-all duration-[220ms] ease-out hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
          <SmartLink
            href={`/services/${active.slug}`}
            aria-label={t('home:servicesShowcase.viewService', { name: activeName })}
            className="absolute inset-0 z-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={active.id}
              role="tabpanel"
              id={`${uid}-panel-${active.id}`}
              aria-labelledby={`${uid}-tab-${active.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              className="flex h-full flex-col"
            >
              <div className="aspect-[16/9] shrink-0 overflow-hidden bg-gray-100">
                <img
                  src={active.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-[220ms] ease-out group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                <Text variant="body-lg">{t(`services:items.${activeKey}.shortDescription`)}</Text>
                <ProfessionalList
                  variant="check"
                  gap="sm"
                  items={activeCapabilities.slice(0, 4).map((capability) => ({ title: capability }))}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 flex justify-start">
        <ButtonLink href="/services" variant="primary" trailingIcon={ArrowRight}>
          {t('home:servicesShowcase.cta')}
        </ButtonLink>
      </div>
    </Section>
  );
}
