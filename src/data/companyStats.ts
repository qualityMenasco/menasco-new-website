import type { VerificationStatus } from '../types/content';
import { regionalCountries } from './locations';

export const foundingYear = 1994;

export interface CompanyStat {
  id: string;
  value: string;
  label: string;
  verificationStatus: VerificationStatus;
}

/**
 * The completed-project count was supplied directly for this section rather
 * than sourced from menascouae.com (which doesn't publish it) — see
 * conversation history for provenance. Years of experience and country count
 * are derived from verified facts (founding year, confirmed offices) and
 * update automatically as those change.
 */
export const companyStats: CompanyStat[] = [
  {
    id: 'projects',
    value: '100+',
    label: 'Projects Successfully Delivered',
    verificationStatus: 'verified',
  },
  {
    id: 'years',
    value: `${new Date().getFullYear() - foundingYear}+`,
    label: 'Years of Engineering Excellence',
    verificationStatus: 'verified',
  },
  {
    id: 'countries',
    value: `${regionalCountries.length}`,
    label: 'Countries of Operation',
    verificationStatus: 'verified',
  },
];
