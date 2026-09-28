import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../layout/Section';
import { Stack } from '../../../layout/Stack';
import { Eyebrow, Heading } from '../../../typography/Typography';
import { ButtonLink } from '../../../ui/Button';
import { FeaturedProjectPanel } from '../../../projects/FeaturedProjectPanel';
import { projects } from '../../../../data/projects';
import { projectCategories } from '../../../../data/projectCategories';
import { getProjectImage } from '../../../../data/images';
import { translateProjectLocation } from '../../../../lib/projectLocation';

const categoryKeys: Record<string, string> = {
  'residential-commercial': 'residentialCommercial',
  hotels: 'hospitality',
  'landmark-entertainment': 'landmarkEntertainment',
  'advanced-technical-facilities': 'advancedTechnicalFacilities',
};

const vela = projects.find((project) => project.slug === 'vela-by-omniyat')!;
// Was 'saudi-f1-track' — that project was renamed "Qiddiya" (see
// src/data/projects.ts), which also changed its slug.
const qiddiya = projects.find((project) => project.slug === 'qiddiya')!;

/**
 * Homepage's Projects section — a compact introduction to the portfolio via
 * exactly two flagship projects, side by side on desktop. Each panel's
 * "View Project" links to that project's own detail page; the single
 * "Explore Projects" button at the end of the section is the one shared
 * path to the full Project Categories page.
 */
export function FeaturedProjectsEditorial() {
  const { t } = useTranslation(['home', 'projects']);
  const categoryLabel = (slug: string) => t(`projects:categories.${categoryKeys[slug] ?? slug}.title`);
  const projectDescription = (slug: string, fallback: string) => {
    const key = `projects:items.${slug}.description`;
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  return (
    <Section background="stone" spacing="md" edgeFade>
      <Stack space="md">
        <Stack space="sm" className="max-w-2xl">
          <Eyebrow>{t('home:featuredProjects.eyebrow')}</Eyebrow>
          <Heading level="h2" as="h3">{t('home:featuredProjects.heading')}</Heading>
        </Stack>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-8">
          <FeaturedProjectPanel
            title={vela.title}
            category={categoryLabel(vela.category!)}
            location={translateProjectLocation(t, vela.location)}
            description={projectDescription(vela.slug, vela.description || 'A landmark waterfront residential development, engineered by MENASCO.')}
            image="/assets/projects/vela/frames/frame-001.jpg"
            imageAlt="VELA by Omniyat"
            viewProjectHref={`/projects/${vela.slug}`}
            showVerificationBadge={vela.verificationStatus === 'pending'}
          />

          <FeaturedProjectPanel
            title={qiddiya.title}
            category={categoryLabel(qiddiya.category!)}
            location={translateProjectLocation(t, qiddiya.location)}
            description={projectDescription(qiddiya.slug, qiddiya.description || 'A landmark motorsport and entertainment destination.')}
            image={getProjectImage(qiddiya.heroImage || undefined, qiddiya.slug)}
            imageAlt={qiddiya.title}
            viewProjectHref={`/projects/${qiddiya.slug}`}
            showVerificationBadge={qiddiya.verificationStatus === 'pending'}
          />
        </div>

        <div className="flex justify-end">
          <ButtonLink href="/projects/categories" variant="primary" trailingIcon={ArrowRight}>
            {t('home:featuredProjects.cta')}
          </ButtonLink>
        </div>
      </Stack>
    </Section>
  );
}
