import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useContactForm, type ContactValidationMessages } from './useContactForm';

const messages: ContactValidationMessages = {
  fullName: 'fullName required',
  email: 'email required',
  emailInvalid: 'email invalid',
  phone: 'phone required',
  country: 'country required',
  jobTitle: 'jobTitle required',
  subject: 'subject required',
  message: 'message required',
  jobCode: 'jobCode required',
  cv: 'cv required',
  cvType: 'cv type invalid',
  cvSize: 'cv too large',
  companyName: 'companyName required',
  projectName: 'projectName required',
  projectLocation: 'projectLocation required',
  projectValue: 'projectValue required',
  projectType: 'projectType required',
  projectDescription: 'projectDescription required',
};

function setup() {
  return renderHook(() => useContactForm(messages), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

/** Submits via the hook's own handler so `validate()` runs exactly as the real form triggers it. */
function submit(result: ReturnType<typeof setup>['result']) {
  act(() => {
    result.current.handleSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
  });
}

describe('useContactForm — General enquiry', () => {
  it('blocks submission when Job Title / Position is empty', () => {
    const { result } = setup();
    act(() => result.current.setEnquiryType('general'));
    act(() => result.current.fields.setFullName('Jane Doe'));
    act(() => result.current.fields.setEmail('jane@example.com'));
    act(() => result.current.fields.setSubject('Hello'));
    act(() => result.current.fields.setMessage('A message'));
    submit(result);
    expect(result.current.errors.jobTitle).toBe('jobTitle required');
  });

  it('passes once Job Title / Position is filled', () => {
    const { result } = setup();
    act(() => result.current.setEnquiryType('general'));
    act(() => result.current.fields.setFullName('Jane Doe'));
    act(() => result.current.fields.setEmail('jane@example.com'));
    act(() => result.current.fields.setJobTitle('Procurement Manager'));
    act(() => result.current.fields.setSubject('Hello'));
    act(() => result.current.fields.setMessage('A message'));
    submit(result);
    expect(result.current.errors.jobTitle).toBeUndefined();
  });
});

describe('useContactForm — Career enquiry', () => {
  function fillCommon(result: ReturnType<typeof setup>['result']) {
    act(() => result.current.setEnquiryType('career'));
    act(() => result.current.fields.setFullName('Jane Doe'));
    act(() => result.current.fields.setEmail('jane@example.com'));
    act(() => result.current.fields.setJobCode('ENG-100'));
    act(() => result.current.fields.setCv(new File(['x'], 'cv.pdf', { type: 'application/pdf' })));
  }

  it('blocks submission when Job Title is empty', () => {
    const { result } = setup();
    fillCommon(result);
    submit(result);
    expect(result.current.errors.jobTitle).toBe('jobTitle required');
  });

  it('passes once Job Title is filled', () => {
    const { result } = setup();
    fillCommon(result);
    act(() => result.current.fields.setJobTitle('Site Engineer'));
    submit(result);
    expect(result.current.errors.jobTitle).toBeUndefined();
  });
});

describe('useContactForm — Project enquiry: every displayed field is required', () => {
  function fillAll(result: ReturnType<typeof setup>['result']) {
    act(() => result.current.setEnquiryType('project'));
    act(() => result.current.fields.setFullName('Jane Doe'));
    act(() => result.current.fields.setEmail('jane@example.com'));
    act(() => result.current.fields.setPhone('+971500000000'));
    act(() => result.current.fields.setCountry('UAE'));
    act(() => result.current.fields.setJobTitle('Development Director'));
    act(() => result.current.fields.setCompanyName('Acme Developments'));
    act(() => result.current.fields.setProjectName('Acme Tower'));
    act(() => result.current.fields.setProjectLocation('Dubai'));
    act(() => result.current.fields.setProjectValue('100000000'));
    act(() => result.current.fields.setProjectType('Residential / Commercial'));
    act(() => result.current.fields.setProjectDescription('A mixed-use tower.'));
  }

  const cases: Array<[keyof ReturnType<typeof setup>['result']['current']['errors'], (r: ReturnType<typeof setup>['result']) => void]> = [
    ['fullName', (r) => act(() => r.current.fields.setFullName(''))],
    ['email', (r) => act(() => r.current.fields.setEmail(''))],
    ['phone', (r) => act(() => r.current.fields.setPhone(''))],
    ['country', (r) => act(() => r.current.fields.setCountry(''))],
    ['jobTitle', (r) => act(() => r.current.fields.setJobTitle(''))],
    ['companyName', (r) => act(() => r.current.fields.setCompanyName(''))],
    ['projectName', (r) => act(() => r.current.fields.setProjectName(''))],
    ['projectLocation', (r) => act(() => r.current.fields.setProjectLocation(''))],
    ['projectValue', (r) => act(() => r.current.fields.setProjectValue(''))],
    ['projectType', (r) => act(() => r.current.fields.setProjectType(''))],
    ['projectDescription', (r) => act(() => r.current.fields.setProjectDescription(''))],
  ];

  it.each(cases)('blocks submission when %s is left empty while every other field is valid', (field, clearField) => {
    const { result } = setup();
    fillAll(result);
    clearField(result);
    submit(result);
    expect(result.current.errors[field]).toBeTruthy();
  });

  it('passes validation once every field is filled', () => {
    const { result } = setup();
    fillAll(result);
    submit(result);
    expect(result.current.errors).toEqual({});
  });
});

describe('useContactForm — category switching', () => {
  it('does not require Project-only fields when General is selected', () => {
    const { result } = setup();
    act(() => result.current.setEnquiryType('general'));
    act(() => result.current.fields.setFullName('Jane Doe'));
    act(() => result.current.fields.setEmail('jane@example.com'));
    act(() => result.current.fields.setJobTitle('Manager'));
    act(() => result.current.fields.setSubject('Hello'));
    act(() => result.current.fields.setMessage('A message'));
    submit(result);
    expect(result.current.errors.companyName).toBeUndefined();
    expect(result.current.errors.projectName).toBeUndefined();
    expect(result.current.errors.phone).toBeUndefined();
    expect(result.current.errors.country).toBeUndefined();
  });

  it('clears a shared field\'s stale error immediately on switching type, before any new submit', () => {
    // Project makes Phone/Country required; General/Career keep them optional.
    // A stale red error must not linger under a field that now renders as optional.
    const { result } = setup();
    act(() => result.current.setEnquiryType('project'));
    submit(result); // everything empty — phone/country errors get set
    expect(result.current.errors.phone).toBeTruthy();
    expect(result.current.errors.country).toBeTruthy();

    act(() => result.current.setEnquiryType('career'));
    expect(result.current.errors.phone).toBeUndefined();
    expect(result.current.errors.country).toBeUndefined();
  });

  it('replaces the error set entirely on each new submit rather than merging across types', () => {
    const { result } = setup();
    act(() => result.current.setEnquiryType('project'));
    submit(result); // project submit with everything empty
    expect(result.current.errors.companyName).toBeTruthy();

    act(() => result.current.setEnquiryType('general'));
    act(() => result.current.fields.setFullName('Jane Doe'));
    act(() => result.current.fields.setEmail('jane@example.com'));
    act(() => result.current.fields.setJobTitle('Manager'));
    act(() => result.current.fields.setSubject('Hello'));
    act(() => result.current.fields.setMessage('A message'));
    submit(result);
    expect(result.current.errors.companyName).toBeUndefined();
  });
});
