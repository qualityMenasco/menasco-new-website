/**
 * Verified from menascouae.com (Contact page) — 2026-07-20.
 * Do not edit addresses/phones without re-confirming against the live site.
 */
export interface OfficeLocation {
  id: string;
  label: string;
  country: string;
  city: string;
  address: string;
  phone?: string;
  isHeadquarters?: boolean;
  /** Real-world coordinates (WGS84), used to place the office on the globe view. */
  lat: number;
  lng: number;
}

export const officeLocations: OfficeLocation[] = [
  {
    id: 'dubai',
    label: 'Dubai, Head Office',
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: 'MMC Building, Al Jaddaf, Dubai, United Arab Emirates',
    phone: '+971 4 261 1164',
    isHeadquarters: true,
    lat: 25.2048,
    lng: 55.2708,
  },
  {
    id: 'riyadh',
    label: 'Riyadh, MENASCO KSA',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    address: 'Tahliah St, As Sulimaniyah, Riyadh 12223, Saudi Arabia',
    lat: 24.7136,
    lng: 46.6753,
  },
  {
    id: 'cairo',
    label: 'Cairo, MENASCO Misr',
    country: 'Egypt',
    city: 'Cairo',
    address: '78 Al Multaqa Al Arabi Street, Sayed Anbar, Sheraton Airport, Al Nozha District, Cairo Governorate, Egypt',
    phone: '+20 127 002 0272',
    lat: 30.0444,
    lng: 31.2357,
  },
  {
    id: 'london',
    label: 'London Office',
    country: 'United Kingdom',
    city: 'London',
    address: '16 Upper Woburn Place, London WC1H 0BS, United Kingdom',
    phone: '+44 20 7396 1000',
    lat: 51.5074,
    lng: -0.1278,
  },
];

export const primaryContact = {
  email: 'info@menascouae.com',
  dubaiPhonePrimary: '+971 4 261 1164',
  dubaiPhoneSecondary: '+971 4 261 1167',
};

export const regionalCountries = Array.from(new Set(officeLocations.map((location) => location.country)));
