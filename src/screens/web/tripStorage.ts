import type { PlannedStop } from '../../data/plannedStops';

/**
 * Trip stops persist in localStorage — the website phase has no backend, so a
 * returning visitor resumes their last trip from here. Mirrors the home-city
 * persistence in `homeCity.ts`. Returns `fallback` when nothing is saved or the
 * stored value is malformed.
 */
const STORAGE_KEY = 'tarmil:stops';

export function loadStops(fallback: PlannedStop[]): PlannedStop[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    const ok = parsed.every((s) => {
      const v = s as Partial<PlannedStop> | null;
      return (
        !!v &&
        typeof v === 'object' &&
        typeof v.id === 'string' &&
        typeof v.nameEn === 'string' &&
        typeof v.lat === 'number' &&
        typeof v.lng === 'number' &&
        typeof v.arrivalDate === 'string' &&
        typeof v.departureDate === 'string' &&
        typeof v.nights === 'number'
      );
    });
    return ok ? (parsed as PlannedStop[]) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStops(stops: PlannedStop[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stops));
  } catch {
    // ignore quota errors
  }
}
