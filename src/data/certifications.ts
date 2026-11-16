/** Verified from menascouae.com. No certificate numbers or issue dates are published — none are shown here. */
export interface Certification {
  name: string;
  scope: string;
  fileUrl?: string;
}

export const certifications: Certification[] = [
  { name: 'ISO 9001:2015', scope: 'Quality Management Systems', fileUrl: '/certificates/menasco-iso-9001-2015.pdf' },
  { name: 'ISO 14001:2015', scope: 'Environmental Management Systems', fileUrl: '/certificates/menasco-iso-14001-2015.pdf' },
  { name: 'ISO 45001:2018', scope: 'Occupational Health & Safety Management Systems', fileUrl: '/certificates/menasco-iso-45001-2018.pdf' },
];