export const CITY_COUNTRY_CODES: Record<string, string> = {
  buzios: 'BR',
  'sao-paulo': 'BR',
  jericoacoara: 'BR',
  'rio-de-janeiro': 'BR',
  'foz-do-iguacu': 'BR',
  'buenos-aires': 'AR',
  mendoza: 'AR',
  'punta-del-este': 'UY',
};

export function countryCodeFor(stopId: string): string | undefined {
  return CITY_COUNTRY_CODES[stopId];
}
