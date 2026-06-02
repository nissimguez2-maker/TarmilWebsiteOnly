export type HomeCity = {
  id: 'home';
  nameEn: string;
  lat: number;
  lng: number;
  countryCode?: string;
};

const STORAGE_KEY = 'tarmil:home';

export const DEFAULT_HOME: HomeCity = {
  id: 'home',
  nameEn: 'Tel Aviv',
  lat: 32.0853,
  lng: 34.7818,
  countryCode: 'IL',
};

export function loadHome(): HomeCity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HOME;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.nameEn === 'string' &&
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number'
    ) {
      return {
        id: 'home',
        nameEn: parsed.nameEn,
        lat: parsed.lat,
        lng: parsed.lng,
        countryCode: parsed.countryCode,
      };
    }
  } catch {
    // ignore parse errors, fall through to default
  }
  return DEFAULT_HOME;
}

export function saveHome(home: HomeCity): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nameEn: home.nameEn,
        lat: home.lat,
        lng: home.lng,
        countryCode: home.countryCode,
      }),
    );
  } catch {
    // ignore quota errors
  }
}
