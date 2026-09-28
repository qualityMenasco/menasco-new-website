import { getLocaleFromPath } from './locale';

/**
 * Shared contact-enquiry submission layer — used by both the desktop and
 * mobile Contact pages so validation/payload shape can never drift between
 * them. `type` distinguishes the three enquiry kinds, which get distinct
 * subjects and field sets (see buildSubject/buildFields below) but all
 * currently deliver to the same MENASCO inbox via Web3Forms.
 */

export type ContactEnquiryType = 'general' | 'career' | 'project';

export interface ContactFormData {
  type: ContactEnquiryType;
  // Shared contact details
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  // General
  company?: string;
  jobTitle?: string;
  subject?: string;
  message?: string;
  // Career
  jobCode?: string;
  cv?: File | null;
  // Project
  companyName?: string;
  projectName?: string;
  projectLocation?: string;
  currency?: string;
  projectValue?: string;
  projectType?: string;
  projectDescription?: string;
  /** Honeypot — real users never fill this in; non-empty means a bot did. */
  companyWebsite?: string;
}

// NOTE: this is intentionally api.w3forms.com, not api.web3forms.com — the
// generated embed code from this MENASCO account's actual W3Forms dashboard
// uses this exact host. The two are not interchangeable: api.web3forms.com
// validates access_key as a legacy UUID and rejects newer `w3f_`-prefixed
// keys with a 400 ("Invalid form_id/access_key format. Must be a valid
// UUID."), which is exactly the failure this endpoint was changed to fix.
const WEB3FORMS_ENDPOINT = 'https://api.w3forms.com/submit';
const NOT_PROVIDED = 'Not provided';

function fallback(value: string | undefined): string {
  return value && value.trim() ? value : NOT_PROVIDED;
}

function formatLanguage(locale: 'en' | 'ar'): 'English' | 'Arabic' {
  return locale === 'ar' ? 'Arabic' : 'English';
}

function formatProjectValue(currency: string | undefined, projectValue: string | undefined): string {
  if (!projectValue) return NOT_PROVIDED;
  return currency ? `${currency} ${projectValue}` : projectValue;
}

function buildSubject(data: ContactFormData): string {
  const fullName = data.fullName.trim() || 'N/A';

  if (data.type === 'career') {
    const jobCode = data.jobCode?.trim() || 'N/A';
    return `[MENASCO Website] Career Enquiry - ${jobCode} - ${fullName}`;
  }

  if (data.type === 'project') {
    const companyName = data.companyName?.trim() || 'N/A';
    return `[MENASCO Website] Project Enquiry - ${companyName} - ${fullName}`;
  }

  return `[MENASCO Website] General Enquiry - ${fullName}`;
}

/**
 * Builds the human-readable, type-specific field set that becomes the body
 * of the email Web3Forms sends — only the fields relevant to the submitted
 * enquiry type, never a mix of all three forms' fields.
 */
function buildFields(data: ContactFormData, language: 'en' | 'ar'): Record<string, string> {
  const shared = {
    'Enquiry Type': data.type === 'general' ? 'General' : data.type === 'career' ? 'Career' : 'Project',
    'Full Name': data.fullName,
    'Email Address': data.email,
    'Phone Number': fallback(data.phone),
    'Country / Region': fallback(data.country),
  };

  if (data.type === 'general') {
    return {
      ...shared,
      'Company / Organization': fallback(data.company),
      'Job Title / Position': fallback(data.jobTitle),
      Subject: data.subject ?? NOT_PROVIDED,
      Message: data.message ?? NOT_PROVIDED,
      Language: formatLanguage(language),
    };
  }

  if (data.type === 'career') {
    return {
      ...shared,
      'Current Job Title / Position': fallback(data.jobTitle),
      'Job Code': data.jobCode ?? NOT_PROVIDED,
      'Message / Additional Information': fallback(data.message),
      Language: formatLanguage(language),
    };
  }

  // project
  return {
    ...shared,
    'Job Title / Position': fallback(data.jobTitle),
    'Company Name': data.companyName ?? NOT_PROVIDED,
    'Project Name': fallback(data.projectName),
    'Project Location': fallback(data.projectLocation),
    'Project Type': data.projectType ?? NOT_PROVIDED,
    'Expected Project Value': formatProjectValue(data.currency, data.projectValue),
    'Project Description / Scope': data.projectDescription ?? NOT_PROVIDED,
    Language: formatLanguage(language),
  };
}

interface Web3FormsResponse {
  success: boolean;
  message?: string;
}

/**
 * Submits an enquiry directly to Web3Forms (https://web3forms.com) — no
 * backend of our own is involved; Web3Forms itself handles delivery to the
 * MENASCO inbox configured against VITE_WEB3FORMS_ACCESS_KEY. Resolves only
 * once Web3Forms's own response confirms `success: true`; throws otherwise
 * so callers' existing try/catch (see useContactForm.ts's handleSubmit)
 * surfaces the error state without needing any changes on their end.
 *
 * `cv` is deliberately never sent — file upload transmission isn't
 * implemented yet (see CvUploadField.tsx's own on-page disclosure), so this
 * never pretends to attach something that was never actually transmitted.
 */
export async function submitContactEnquiry(formData: ContactFormData): Promise<{ success: true }> {
  if (formData.companyWebsite) {
    // Honeypot tripped — behave as if it succeeded so a bot gets no signal,
    // but never actually submit anything.
    return { success: true };
  }

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    // eslint-disable-next-line no-console
    console.error('[contact] VITE_WEB3FORMS_ACCESS_KEY is not configured.');
    throw new Error('The enquiry could not be sent at this time.');
  }

  const language = getLocaleFromPath(window.location.pathname);

  const body = {
    access_key: accessKey,
    subject: buildSubject(formData),
    from_name: 'MENASCO Website',
    // This service's reply-to behavior is triggered by a field literally
    // named `email` (confirmed against this account's own generated embed
    // code, which has no separate replyto field at all) — sent alongside
    // the human-readable "Email Address" field from buildFields() below,
    // which is what actually renders in the email body. `replyto` is also
    // sent as a harmless, documented alternate name in case it's honored
    // too; neither collides with any of buildFields()'s own field names.
    email: formData.email,
    replyto: formData.email,
    // This service's honeypot field name — confirmed against the generated
    // embed code, which uses `_gotcha` rather than `botcheck`. Always empty
    // from a real submission through this UI; our own `companyWebsite`
    // decoy field above is the actual first line of defense and already
    // short-circuits before this point if tripped.
    _gotcha: '',
    ...buildFields(formData, language),
  };

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  let result: Web3FormsResponse | undefined;
  try {
    result = (await response.json()) as Web3FormsResponse;
  } catch {
    // Response wasn't JSON — fall through to the generic failure below.
  }

  if (!response.ok || !result?.success) {
    throw new Error('The enquiry could not be sent at this time.');
  }

  return { success: true };
}
