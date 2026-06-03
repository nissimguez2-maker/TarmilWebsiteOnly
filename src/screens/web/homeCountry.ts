/**
 * The traveler's home country — drives their home currency (for FX) and their
 * passport (for the visa lookup). Default Israel (the core early audience) but
 * changeable, because Tarmil is for travelers worldwide (solo, couples,
 * families, any age). Persists in localStorage. Codes are ISO-3166 alpha-2 and
 * match the bundled visa matrix's passport keys.
 */
export type HomeCountry = { code: string; name: string; currency: string };

export const HOME_COUNTRIES: HomeCountry[] = [
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'AT', name: 'Austria', currency: 'EUR' },
  { code: 'BE', name: 'Belgium', currency: 'EUR' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'CL', name: 'Chile', currency: 'CLP' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'CO', name: 'Colombia', currency: 'COP' },
  { code: 'CZ', name: 'Czechia', currency: 'CZK' },
  { code: 'DK', name: 'Denmark', currency: 'DKK' },
  { code: 'FI', name: 'Finland', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'GR', name: 'Greece', currency: 'EUR' },
  { code: 'HU', name: 'Hungary', currency: 'HUF' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'IE', name: 'Ireland', currency: 'EUR' },
  { code: 'IL', name: 'Israel', currency: 'ILS' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR' },
  { code: 'MX', name: 'Mexico', currency: 'MXN' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD' },
  { code: 'NO', name: 'Norway', currency: 'NOK' },
  { code: 'PE', name: 'Peru', currency: 'PEN' },
  { code: 'PL', name: 'Poland', currency: 'PLN' },
  { code: 'PT', name: 'Portugal', currency: 'EUR' },
  { code: 'RO', name: 'Romania', currency: 'RON' },
  { code: 'RU', name: 'Russia', currency: 'RUB' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  { code: 'KR', name: 'South Korea', currency: 'KRW' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'SE', name: 'Sweden', currency: 'SEK' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF' },
  { code: 'TH', name: 'Thailand', currency: 'THB' },
  { code: 'TR', name: 'Türkiye', currency: 'TRY' },
  { code: 'UA', name: 'Ukraine', currency: 'UAH' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'US', name: 'United States', currency: 'USD' },
];

const KEY = 'tarmil:home-country';

export function loadHomeCountry(): string {
  try {
    return localStorage.getItem(KEY) || 'IL';
  } catch {
    return 'IL';
  }
}

export function saveHomeCountry(code: string): void {
  try {
    localStorage.setItem(KEY, code);
  } catch {
    // ignore quota errors
  }
}

export function homeCountryByCode(code: string): HomeCountry | undefined {
  return HOME_COUNTRIES.find((c) => c.code === code.toUpperCase());
}
