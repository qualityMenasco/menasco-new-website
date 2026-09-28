import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Info } from 'lucide-react';
import { FormField } from './FormField';
import { EnquiryTypeTabs } from './EnquiryTypeTabs';
import { CvUploadField } from './CvUploadField';
import { CurrencyAmountField } from './CurrencyAmountField';
import { ContactSuccessMessage } from './ContactSuccessMessage';
import { Eyebrow, Text } from '../typography/Typography';
import { Button } from '../ui/Button';
import { projectCategoryList } from '../../data/projectCategories';
import { useContactForm } from '../../lib/useContactForm';

/** Uppercase field-group label with a hairline divider, matching the ASCII "CONTACT DETAILS ----" layout from the design brief. */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Eyebrow as="h3" className="border-b border-gray-200 pb-2">
      {children}
    </Eyebrow>
  );
}

const twoCol = 'grid grid-cols-1 gap-3 sm:grid-cols-2';

/**
 * The full General / Career / Project enquiry form — shared verbatim by the
 * desktop and mobile Contact pages (see ContactPage.tsx on each side) so
 * fields, validation, and copy can never drift between breakpoints. Layout
 * is pure responsive Tailwind (`sm:grid-cols-2`), not a separate
 * desktop/mobile implementation, since the only real difference between
 * breakpoints here is column count.
 *
 * The enquiry type genuinely starts unselected (see useContactForm) — the
 * visitor must deliberately pick General/Career/Project from the tabs. The
 * form itself stays visible the whole time (so the page reads as complete
 * rather than empty): before a choice is made it renders the General field
 * layout as a locked preview — every control natively `disabled`, not just
 * dimmed with CSS — and `handleSubmit` refuses to run without a real,
 * explicitly-selected `enquiryType` regardless of what the UI shows.
 */
export function ContactEnquiryForm() {
  const { t } = useTranslation('contact');
  const messages = {
    fullName: t('validation.fullName'),
    email: t('validation.email'),
    emailInvalid: t('validation.emailInvalid'),
    phone: t('validation.phone'),
    subject: t('validation.subject'),
    message: t('validation.message'),
    jobCode: t('validation.jobCode'),
    cv: t('validation.cv'),
    cvType: t('validation.cvType'),
    cvSize: t('validation.cvSize'),
    companyName: t('validation.companyName'),
    projectType: t('validation.projectType'),
    projectDescription: t('validation.projectDescription'),
  };
  const { enquiryType, setEnquiryType, fields, errors, status, handleSubmit, reset } = useContactForm(messages);
  const reducedMotion = useReducedMotion();

  if (status === 'success' && enquiryType) {
    return <ContactSuccessMessage enquiryType={enquiryType} onSendAnother={reset} />;
  }

  // `enquiryType` itself stays strictly null until the visitor clicks a tab —
  // `displayType` only decides which field layout the locked preview shows
  // (always the General set) and is never read by validation or submission.
  const locked = enquiryType === null;
  const displayType = enquiryType ?? 'general';

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Honeypot — hidden from sighted and screen-reader users alike; a real visitor never fills this in. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company-website">Company Website</label>
        <input
          id="company-website"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={fields.companyWebsite}
          onChange={(e) => fields.setCompanyWebsite(e.target.value)}
        />
      </div>

      <EnquiryTypeTabs value={enquiryType} onChange={setEnquiryType} />

      {locked && (
        <div className="flex items-start gap-2 rounded-sm border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-small text-brand-700">
          <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>{t('selectTypePrompt')}</span>
        </div>
      )}

      <motion.div
        key={String(enquiryType)}
        initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-3">
          <SectionLabel>{displayType === 'general' ? t('sections.personalDetails') : t('sections.contactDetails')}</SectionLabel>
          <div className={twoCol}>
            <FormField disabled={locked} label={t('fields.fullName')} name="fullName" autoComplete="name" required value={fields.fullName} onChange={(e) => fields.setFullName(e.target.value)} error={errors.fullName} />
            <FormField disabled={locked} type="email" dir="ltr" label={t('fields.email')} name="email" autoComplete="email" required value={fields.email} onChange={(e) => fields.setEmail(e.target.value)} error={errors.email} />
          </div>
          <div className={twoCol}>
            <FormField disabled={locked} type="tel" dir="ltr" label={t('fields.phone')} name="phone" autoComplete="tel" optional={t('fields.optional')} value={fields.phone} onChange={(e) => fields.setPhone(e.target.value)} error={errors.phone} />
            <FormField disabled={locked} label={t('fields.country')} name="country" autoComplete="country-name" optional={t('fields.optional')} value={fields.country} onChange={(e) => fields.setCountry(e.target.value)} />
          </div>

          {displayType === 'general' && (
            <div className={twoCol}>
              <FormField disabled={locked} label={t('fields.company')} name="company" autoComplete="organization" optional={t('fields.optional')} value={fields.company} onChange={(e) => fields.setCompany(e.target.value)} />
              <FormField disabled={locked} label={t('fields.jobTitle')} name="jobTitle" autoComplete="organization-title" optional={t('fields.optional')} value={fields.jobTitle} onChange={(e) => fields.setJobTitle(e.target.value)} />
            </div>
          )}

          {(displayType === 'career' || displayType === 'project') && (
            <div className={twoCol}>
              <FormField disabled={locked} label={t('fields.jobTitle')} name="jobTitle" autoComplete="organization-title" optional={t('fields.optional')} value={fields.jobTitle} onChange={(e) => fields.setJobTitle(e.target.value)} />
            </div>
          )}
        </div>

        {displayType === 'general' && (
          <div className="flex flex-col gap-3">
            <SectionLabel>{t('sections.enquiry')}</SectionLabel>
            <FormField disabled={locked} label={t('fields.subject')} name="subject" required value={fields.subject} onChange={(e) => fields.setSubject(e.target.value)} error={errors.subject} />
            <FormField disabled={locked} as="textarea" label={t('fields.message')} name="message" required value={fields.message} onChange={(e) => fields.setMessage(e.target.value)} error={errors.message} />
          </div>
        )}

        {displayType === 'career' && (
          <div className="flex flex-col gap-3">
            <SectionLabel>{t('sections.careerDetails')}</SectionLabel>
            <FormField
              disabled={locked}
              label={t('fields.jobCode')}
              name="jobCode"
              required
              helperText={t('fields.jobCodeHelper')}
              value={fields.jobCode}
              onChange={(e) => fields.setJobCode(e.target.value)}
              error={errors.jobCode}
            />
            <FormField disabled={locked} as="textarea" label={t('fields.message')} name="message" optional={t('fields.optional')} value={fields.message} onChange={(e) => fields.setMessage(e.target.value)} />
            <CvUploadField value={fields.cv} onChange={fields.setCv} error={errors.cv} />
          </div>
        )}

        {displayType === 'project' && (
          <>
            <div className="flex flex-col gap-3">
              <SectionLabel>{t('sections.companyDetails')}</SectionLabel>
              <FormField disabled={locked} label={t('fields.companyName')} name="companyName" autoComplete="organization" required value={fields.companyName} onChange={(e) => fields.setCompanyName(e.target.value)} error={errors.companyName} />
            </div>

            <div className="flex flex-col gap-3">
              <SectionLabel>{t('sections.projectDetails')}</SectionLabel>
              <div className={twoCol}>
                <FormField disabled={locked} label={t('fields.projectName')} name="projectName" optional={t('fields.optional')} value={fields.projectName} onChange={(e) => fields.setProjectName(e.target.value)} />
                <FormField disabled={locked} label={t('fields.projectLocation')} name="projectLocation" optional={t('fields.optional')} value={fields.projectLocation} onChange={(e) => fields.setProjectLocation(e.target.value)} />
              </div>
              <div className={twoCol}>
                <FormField disabled={locked} as="select" label={t('fields.projectType')} name="projectType" required value={fields.projectType} onChange={(e) => fields.setProjectType(e.target.value)} error={errors.projectType}>
                  <option value="" disabled>
                    {t('fields.projectTypePlaceholder')}
                  </option>
                  {projectCategoryList.map((category) => (
                    <option key={category.slug} value={category.title}>
                      {category.title}
                    </option>
                  ))}
                </FormField>
                <CurrencyAmountField currency={fields.currency} onCurrencyChange={fields.setCurrency} amount={fields.projectValue} onAmountChange={fields.setProjectValue} />
              </div>
              <FormField
                disabled={locked}
                as="textarea"
                label={t('fields.projectDescription')}
                name="projectDescription"
                required
                helperText={t('fields.projectDescriptionHelper')}
                value={fields.projectDescription}
                onChange={(e) => fields.setProjectDescription(e.target.value)}
                error={errors.projectDescription}
              />
            </div>
          </>
        )}

        {status === 'error' && (
          <Text variant="small" className="font-medium text-error" role="alert">
            {t('submitError')}
          </Text>
        )}

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Text variant="small" muted>
            {t('requiredNote')}
          </Text>
          <Button type="submit" variant="primary" size="lg" trailingIcon={ArrowRight} disabled={locked} loading={status === 'submitting'} className="w-full sm:w-auto">
            {t(`submit.${displayType}`)}
          </Button>
        </div>
      </motion.div>
    </form>
  );
}
