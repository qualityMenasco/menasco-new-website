import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Section } from '../components/layout/Section';
import { Stack } from '../components/layout/Stack';
import { Eyebrow, Heading, Text } from '../components/typography/Typography';
import { SmartLink } from '../lib/SmartLink';

export interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional verified lead line shown above the description (e.g. an approved capability summary). */
  lead?: string;
  /** Child destinations — real, already-published pages this pending parent groups (e.g. a service group's individual services). Rendered as a hairline list above `actions`. */
  links?: { label: string; href: string }[];
  /** Onward links — keeps a content-pending page from being a dead end. */
  actions?: ReactNode;
}

/**
 * Shared stand-in for routes whose full content hasn't been published yet — keeps navigation, SEO, and layout consistent while content is pending.
 * The visible title is an h2 like every other page: the page's H1 is the active nav label (see DesktopNav / MobileBottomNav).
 */
export function PagePlaceholder({ eyebrow, title, description, lead, links, actions }: PagePlaceholderProps) {
  return (
    <Section spacing="lg" background="warmwhite">
      <Stack space="md" className="min-h-[40svh] justify-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading level="h1" as="h2">
          {title}
        </Heading>
        {lead && (
          <Text variant="body-lg" className="max-w-2xl text-ink">
            {lead}
          </Text>
        )}
        <Text variant="body-lg" muted className="max-w-2xl">
          {description}
        </Text>
        {links && links.length > 0 && (
          <ul role="list" className="max-w-2xl border-t border-gray-200">
            {links.map((link) => (
              <li key={link.href} className="border-b border-gray-200">
                <SmartLink
                  href={link.href}
                  className="group flex min-h-[44px] items-center justify-between gap-4 py-3 font-display text-body-lg font-semibold text-ink transition-colors duration-base hover:text-brand-600"
                >
                  {link.label}
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 text-gray-500 transition-colors duration-base group-hover:text-brand-600 rtl:rotate-180"
                  />
                </SmartLink>
              </li>
            ))}
          </ul>
        )}
        {actions && (
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap [&>*]:max-w-full [&>*]:whitespace-normal [&>*]:text-center">{actions}</div>
        )}
      </Stack>
    </Section>
  );
}
