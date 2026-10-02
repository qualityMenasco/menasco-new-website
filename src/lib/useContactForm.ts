import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { FormEvent } from 'react';
import { submitContactEnquiry, type ContactEnquiryType, type ContactFormData } from './contactApi';

export const CV_ACCEPTED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const CV_ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx';
export const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type ContactFieldErrors = Partial<
  Record<
    | 'fullName'
    | 'email'
    | 'phone'
    | 'country'
    | 'jobTitle'
    | 'subject'
    | 'message'
    | 'jobCode'
    | 'cv'
    | 'companyName'
    | 'projectName'
    | 'projectLocation'
    | 'projectValue'
    | 'projectType'
    | 'projectDescription',
    string
  >
>;

export interface ContactValidationMessages {
  fullName: string;
  email: string;
  emailInvalid: string;
  phone: string;
  country: string;
  jobTitle: string;
  subject: string;
  message: string;
  jobCode: string;
  cv: string;
  cvType: string;
  cvSize: string;
  companyName: string;
  projectName: string;
  projectLocation: string;
  projectValue: string;
  projectType: string;
  projectDescription: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Deliberately permissive — digits, spaces, +, -, (), at least 7 digits total. Not tied to any one country's format.
const PHONE_PATTERN = /^[0-9+()\s-]{7,20}$/;

/**
 * Shared enquiry-type + field state, validation and submit handling for the
 * Contact page — consumed by both the desktop and mobile page components so
 * neither can drift out of sync. Everything lives in one state object (not
 * three separate forms), so switching enquiry type never loses a value
 * already entered in a field shared across types.
 */
export function useContactForm(messages: ContactValidationMessages) {
  const [searchParams] = useSearchParams();

  // No default, and no URL/session/storage-based preselection — the enquiry
  // type is a deliberate choice the visitor must make by clicking a tab
  // (see EnquiryTypeTabs in ContactEnquiryForm) before the form appears.
  // Every visit starts unselected, including ?type=general/career/project
  // deep links — that query param is intentionally never read into state.
  const [enquiryType, setEnquiryTypeState] = useState<ContactEnquiryType | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');

  // General
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Career
  const [jobCode, setJobCode] = useState(() => searchParams.get('job') ?? '');
  const [cv, setCv] = useState<File | null>(null);

  // Project
  const [companyName, setCompanyName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [projectValue, setProjectValue] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Honeypot — never rendered visibly; a filled value means a bot filled it.
  const [companyWebsite, setCompanyWebsite] = useState('');

  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Category-specific requirements differ (e.g. Phone/Country are required
  // only for Project), so a stale error from the previous category must not
  // linger after switching — otherwise a field can render as "(optional)"
  // while still showing a leftover red required-field error beneath it.
  function setEnquiryType(next: ContactEnquiryType) {
    setErrors({});
    setEnquiryTypeState(next);
  }

  // A deep-linked ?job=XXXX (e.g. from a job listing) still prefills the job
  // code field — but never the enquiry type itself; that stays a deliberate
  // click, see the enquiryType state above.
  useEffect(() => {
    const job = searchParams.get('job');
    if (job) setJobCode(job);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validateCv(file: File | null): string | undefined {
    if (!file) return messages.cv;
    if (!CV_ACCEPTED_TYPES.includes(file.type)) return messages.cvType;
    if (file.size > CV_MAX_SIZE_BYTES) return messages.cvSize;
    return undefined;
  }

  function validate(): ContactFieldErrors {
    const next: ContactFieldErrors = {};
    if (!fullName.trim()) next.fullName = messages.fullName;
    if (!email.trim()) next.email = messages.email;
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = messages.emailInvalid;

    // Phone/country are shown for every enquiry type but only Project makes
    // them mandatory — General and Career keep them optional, still format-
    // checking phone only when something was actually entered.
    if (!phone.trim()) {
      if (enquiryType === 'project') next.phone = messages.phone;
    } else if (!PHONE_PATTERN.test(phone.trim())) {
      next.phone = messages.phone;
    }
    if (enquiryType === 'project' && !country.trim()) next.country = messages.country;

    // Job Title / Position is shared across all three enquiry types and is
    // required in every one of them.
    if (!jobTitle.trim()) next.jobTitle = messages.jobTitle;

    if (enquiryType === 'general') {
      if (!subject.trim()) next.subject = messages.subject;
      if (!message.trim()) next.message = messages.message;
    }

    if (enquiryType === 'career') {
      if (!jobCode.trim()) next.jobCode = messages.jobCode;
      const cvError = validateCv(cv);
      if (cvError) next.cv = cvError;
    }

    if (enquiryType === 'project') {
      if (!companyName.trim()) next.companyName = messages.companyName;
      if (!projectName.trim()) next.projectName = messages.projectName;
      if (!projectLocation.trim()) next.projectLocation = messages.projectLocation;
      if (!projectValue.trim()) next.projectValue = messages.projectValue;
      if (!projectType.trim()) next.projectType = messages.projectType;
      if (!projectDescription.trim()) next.projectDescription = messages.projectDescription;
    }

    return next;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === 'submitting') return; // guard against duplicate submits
    // Belt-and-braces: the form UI never renders a submit path without an
    // enquiry type selected, but the submit handler itself must still refuse
    // to send — no silent "general" fallback — in case of a programmatic
    // submit, Enter-key submission, or any other way past the visible UI.
    if (!enquiryType) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('submitting');
    try {
      const payload: ContactFormData = {
        type: enquiryType,
        fullName,
        email,
        phone: phone || undefined,
        country: country || undefined,
        companyWebsite: companyWebsite || undefined,
        ...(enquiryType === 'general' && { company: company || undefined, jobTitle: jobTitle || undefined, subject, message }),
        ...(enquiryType === 'career' && { jobCode, jobTitle: jobTitle || undefined, message: message || undefined, cv }),
        ...(enquiryType === 'project' && {
          companyName,
          jobTitle: jobTitle || undefined,
          projectName: projectName || undefined,
          projectLocation: projectLocation || undefined,
          currency: projectValue ? currency : undefined,
          projectValue: projectValue || undefined,
          projectType,
          projectDescription,
        }),
      };
      const result = await submitContactEnquiry(payload);
      if (result.success) setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  function reset() {
    setFullName('');
    setEmail('');
    setPhone('');
    setCountry('');
    setCompany('');
    setJobTitle('');
    setSubject('');
    setMessage('');
    setJobCode('');
    setCv(null);
    setCompanyName('');
    setProjectName('');
    setProjectLocation('');
    setCurrency('AED');
    setProjectValue('');
    setProjectType('');
    setProjectDescription('');
    setErrors({});
    setStatus('idle');
  }

  return {
    enquiryType,
    setEnquiryType,
    fields: {
      fullName, setFullName,
      email, setEmail,
      phone, setPhone,
      country, setCountry,
      company, setCompany,
      jobTitle, setJobTitle,
      subject, setSubject,
      message, setMessage,
      jobCode, setJobCode,
      cv, setCv,
      companyName, setCompanyName,
      projectName, setProjectName,
      projectLocation, setProjectLocation,
      currency, setCurrency,
      projectValue, setProjectValue,
      projectType, setProjectType,
      projectDescription, setProjectDescription,
      companyWebsite, setCompanyWebsite,
    },
    errors,
    status,
    handleSubmit,
    reset,
  };
}
