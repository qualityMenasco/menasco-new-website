import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { SectionThemeContext } from '../../lib/theme-context';
import { Container } from '../layout/Container';
import { Row } from '../layout/Stack';
import { Eyebrow, Heading, Text, type HeadingLevelStyle } from '../typography/Typography';
import { ButtonLink } from '../ui/Button';
import { cn } from '../../lib/utils';
import type { HeadingLevel, IconComponent } from '../../types';

export interface CtaBandAction {
  label: ReactNode;
  /** Canonical (English) path or external URL — ButtonLink/SmartLink localises internal paths. */
  href: string;
  /** Optional icon override. Primary defaults to a trailing arrow; secondary has none. */
  trailingIcon?: IconComponent;
  leadingIcon?: IconComponent;
  download?: string;
}

export interface CtaBandProps {
  eyebrow?: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
  primary: CtaBandAction;
  secondary?: CtaBandAction;
  /** Visual heading scale. Defaults to `h2`. */
  headingLevel?: HeadingLevelStyle;
  /** Semantic heading tag. Defaults to `h2`. */
  headingAs?: HeadingLevel;
  id?: string;
  className?: string;
}

/**
 * The site's closing brand CTA band — the same dark brand gradient used by
 * AboutFinalCTA / LeadershipProfileCTA and the service sub-pages. One primary
 * action (solid, light-on-dark) plus an optional outline secondary action.
 */
export function CtaBand({
  eyebrow,
  heading,
  description,
  primary,
  secondary,
  headingLevel = 'h2',
  headingAs = 'h2',
  id,
  className,
}: CtaBandProps) {
  return (
    <SectionThemeContext.Provider value="dark">
      <section
        id={id}
        className={cn('bg-gradient-to-br from-brand-800 via-brand-900 to-ink py-16 md:py-24', className)}
      >
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            {eyebrow && (
              <Eyebrow theme="dark" className="mb-4">
                {eyebrow}
              </Eyebrow>
            )}
            <Heading level={headingLevel} as={headingAs} theme="dark">
              {heading}
            </Heading>
            {description && (
              <Text variant="body-lg" theme="dark" className="mt-5 text-brand-100">
                {description}
              </Text>
            )}
            <Row space="md" justify="center" wrap className="mt-8">
              <ButtonLink
                href={primary.href}
                download={primary.download}
                variant="secondary"
                size="lg"
                theme="dark"
                leadingIcon={primary.leadingIcon}
                trailingIcon={primary.leadingIcon ? primary.trailingIcon : (primary.trailingIcon ?? ArrowRight)}
              >
                {primary.label}
              </ButtonLink>
              {secondary && (
                <ButtonLink
                  href={secondary.href}
                  download={secondary.download}
                  variant="outline"
                  size="lg"
                  theme="dark"
                  leadingIcon={secondary.leadingIcon}
                  trailingIcon={secondary.trailingIcon}
                >
                  {secondary.label}
                </ButtonLink>
              )}
            </Row>
          </div>
        </Container>
      </section>
    </SectionThemeContext.Provider>
  );
}
