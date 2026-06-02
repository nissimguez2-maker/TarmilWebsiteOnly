/**
 * City -> ISO-3166 alpha-2 country code for the whole addable-city catalog, plus
 * code -> English country name. Drives the "Before you fly" surface (public
 * holidays via Nager.Date, currency/FX via REST Countries + Frankfurter, entry
 * reminders) and the concierge grounding facts. Cities added via free-text
 * search resolve to `undefined` and degrade gracefully (those rows just hide).
 */
export const CITY_COUNTRY_CODES: Record<string, string> = {
  // South America
  'rio-de-janeiro': 'BR',
  'foz-do-iguacu': 'BR',
  'sao-paulo': 'BR',
  buzios: 'BR',
  jericoacoara: 'BR',
  'buenos-aires': 'AR',
  mendoza: 'AR',
  'punta-del-este': 'UY',
  medellin: 'CO',
  cusco: 'PE',
  'la-paz': 'BO',
  // Asia + Caucasus
  bangkok: 'TH',
  'ko-pha-ngan': 'TH',
  hanoi: 'VN',
  goa: 'IN',
  kasol: 'IN',
  kathmandu: 'NP',
  tbilisi: 'GE',
};

/** ISO alpha-2 -> English country name, so notes read "…for Thailand" not "…for TH". */
export const COUNTRY_NAMES: Record<string, string> = {
  BR: 'Brazil',
  AR: 'Argentina',
  UY: 'Uruguay',
  CO: 'Colombia',
  PE: 'Peru',
  BO: 'Bolivia',
  TH: 'Thailand',
  VN: 'Vietnam',
  IN: 'India',
  NP: 'Nepal',
  GE: 'Georgia',
};

export function countryCodeFor(stopId: string): string | undefined {
  return CITY_COUNTRY_CODES[stopId];
}

export function countryNameFor(code?: string): string | undefined {
  if (!code) return undefined;
  return COUNTRY_NAMES[code.toUpperCase()];
}
