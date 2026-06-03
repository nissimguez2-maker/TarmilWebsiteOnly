import type { TripIntent } from './ai/archetypes';

/**
 * The traveler's trip "intent" (region / who / budget / weeks), captured by the
 * front-door questionnaire and reused to seed the doorway next time. Persists in
 * localStorage now (the instant cache); a future pass can ride the existing
 * `web_trips` row (anon-auth, RLS-scoped) so it follows the trip server-side.
 */
const KEY = 'tarmil:trip-intent';

export function loadTripIntent(): TripIntent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TripIntent) : null;
  } catch {
    return null;
  }
}

export function saveTripIntent(intent: TripIntent): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(intent));
  } catch {
    // ignore quota errors
  }
}
