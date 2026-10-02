import { useTranslation } from 'react-i18next';
import clients from '../../data/clients';
import { Section } from '../layout/Section';
import { Heading, Text } from '../typography/Typography';

const marqueeClients = [...clients, ...clients];

export function ClientsSection() {
  const { t } = useTranslation('about');

  return (
    <Section background="graphite" spacing="lg" className="overflow-hidden border-y border-white/10">
      <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center md:gap-12">
        <Heading level="h2" as="h3" theme="dark" className="whitespace-nowrap uppercase italic tracking-tight">
          {t('clients.heading')}
        </Heading>
        <Text variant="body-lg" theme="dark" className="max-w-xl text-balance">
          {t('clients.description')}
        </Text>
      </div>

      {/* Forced LTR — under dir="rtl" the max-content track sits flush-right instead of flush-left, breaking the translateX(-50%) loop; logos have no reading direction so isolating them here is safe. */}
      <div
        dir="ltr"
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-white py-10"
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent md:w-40"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent md:w-40"
          aria-hidden="true"
        />

        <div className="marquee-track flex min-w-max items-center gap-16 md:gap-24">
          {marqueeClients.map((client, index) => (
            <div key={`${client.name}-${index}`} className="flex h-20 w-48 shrink-0 items-center justify-center md:h-24 md:w-60">
              <img
                src={client.logo}
                alt={client.name}
                loading="lazy"
                decoding="async"
                className="max-h-full max-w-full object-contain"
                title={client.name}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .marquee-track {
          width: max-content;
          animation: marquee-scroll 32s linear infinite;
          will-change: transform;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }

        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Section>
  );
}

export default ClientsSection;
