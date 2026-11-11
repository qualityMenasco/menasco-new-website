/**
 * Dubai, Riyadh, Cairo and London verified from menascouae.com (Contact page)
 * — 2026-07-20. Denver, Amman and Damascus added 2026-11-11 on the client's
 * instruction (city only; address and phone not yet published).
 * Do not edit addresses/phones without re-confirming against the live site.
 */
export interface OfficeLocation {
  id: string;
  label: string;
  country: string;
  city: string;
  /** Omitted until published — every surface renders "Pending" instead. */
  address?: string;
  phone?: string;
  /** Contact email shown for this office; omitted where none has been published. */
  email?: string;
  isHeadquarters?: boolean;
  /** Real-world coordinates (WGS84), used to place the office on the globe view. */
  lat: number;
  lng: number;
}

/** The one general inbox — every office currently lists it. */
const GENERAL_EMAIL = 'info@menascouae.com';

export const officeLocations: OfficeLocation[] = [
  {
    id: 'dubai',
    label: 'Dubai, Head Office',
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: 'MMC Building, Al Jaddaf, Dubai, United Arab Emirates',
    phone: '+971 4 261 1164',
    email: GENERAL_EMAIL,
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
    email: GENERAL_EMAIL,
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
    email: GENERAL_EMAIL,
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
    email: GENERAL_EMAIL,
    lat: 51.5074,
    lng: -0.1278,
  },
  // Amman and Damascus use city-level coordinates until their addresses are published.
  {
    id: 'usa',
    label: 'Denver Office',
    country: 'United States',
    city: 'Denver',
    // Address supplied by the client 2026-11-11 (Centennial, Denver metro).
    address: '6373 S Racine Cir, Centennial, Colorado 80111, United States',
    email: GENERAL_EMAIL,
    lat: 39.6013,
    lng: -104.8458,
  },
  {
    id: 'jordan',
    label: 'Amman Office',
    country: 'Jordan',
    city: 'Amman',
    email: GENERAL_EMAIL,
    lat: 31.9454,
    lng: 35.9284,
  },
  {
    id: 'syria',
    label: 'Damascus Office',
    country: 'Syria',
    city: 'Damascus',
    email: GENERAL_EMAIL,
    lat: 33.5138,
    lng: 36.2765,
  },
];

export const primaryContact = {
  email: GENERAL_EMAIL,
  dubaiPhonePrimary: '+971 4 261 1164',
  dubaiPhoneSecondary: '+971 4 261 1167',
};

export const regionalCountries = Array.from(new Set(officeLocations.map((location) => location.country)));
