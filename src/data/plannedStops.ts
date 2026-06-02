/**
 * The user's declared future route — an ordered list of cities/regions with
 * exact dates. Polarsteps-style planning grafted onto Tarmil's city-level
 * privacy model: planned stops are the user's private intent, but friends'
 * matching declarations surface as future overlaps with exact dates.
 *
 * SEED ONLY for the array below. Runtime data is read from the
 * `planned_stops` table in Supabase via SupabaseDataProvider, and mutated by
 * the hook's saveStop / removeStop / savePlaceToStop / resetDemo. The
 * `reset_demo_state()` SQL function (see migration 0012) restores the same
 * 5-stop seed below. Keep them in sync if you edit either side.
 */

export type PlannedStopPrivacy = 'private' | 'friends' | 'hidden';

export type PlannedStop = {
  id: string;
  nameHe: string;
  nameEn: string;
  type: 'city' | 'region';
  lat: number;
  lng: number;
  /** ISO yyyy-mm-dd. */
  arrivalDate: string;
  /** ISO yyyy-mm-dd. */
  departureDate: string;
  nights: number;
  privacy: PlannedStopPrivacy;
  note?: string;
  /** Cross-references entries in friendOverlaps. */
  friendOverlapIds?: string[];
  /** Place ids the user has saved to this destination. */
  savedPlaceIds?: string[];
};

/**
 * Demo route — Israeli backpacker narrative across Brazil + Argentina + Uruguay.
 * Each stop has a 1-day transit gap to the next so the calendar reads cleanly.
 */
export const plannedStops: PlannedStop[] = [
  {
    id: 'buzios',
    nameHe: 'Búzios',
    nameEn: 'Búzios',
    type: 'city',
    lat: -22.747,
    lng: -41.881,
    arrivalDate: '2026-10-28',
    departureDate: '2026-10-30',
    nights: 2,
    privacy: 'friends',
    note: 'Short beach run between Rio and São Paulo.',
    friendOverlapIds: ['roi-buzios'],
  },
  {
    id: 'sao-paulo',
    nameHe: 'São Paulo',
    nameEn: 'São Paulo',
    type: 'city',
    lat: -23.5505,
    lng: -46.6333,
    arrivalDate: '2026-11-01',
    departureDate: '2026-11-05',
    nights: 4,
    privacy: 'friends',
    note: 'Vila Madalena, Paulista, asado and a first beer of the night.',
    friendOverlapIds: ['shir-saopaulo'],
  },
  {
    id: 'jericoacoara',
    nameHe: 'Jericoacoara',
    nameEn: 'Jericoacoara',
    type: 'city',
    lat: -2.7959,
    lng: -40.5125,
    arrivalDate: '2026-11-07',
    departureDate: '2026-11-12',
    nights: 5,
    privacy: 'friends',
    note: 'Dunes, kitesurf and barefoot mornings.',
    friendOverlapIds: ['yotam-jericoacoara'],
  },
  {
    id: 'buenos-aires',
    nameHe: 'Buenos Aires',
    nameEn: 'Buenos Aires',
    type: 'city',
    lat: -34.6037,
    lng: -58.3816,
    arrivalDate: '2026-11-14',
    departureDate: '2026-11-19',
    nights: 5,
    privacy: 'friends',
    note: 'Palermo, San Telmo, tango, asado till midnight.',
    friendOverlapIds: ['moshe-buenosaires'],
  },
  {
    id: 'punta-del-este',
    nameHe: 'Punta del Este',
    nameEn: 'Punta del Este',
    type: 'city',
    lat: -34.9633,
    lng: -54.9476,
    arrivalDate: '2026-11-20',
    departureDate: '2026-11-23',
    nights: 3,
    privacy: 'friends',
    note: 'Uruguay coast finale — Casapueblo sunset, José Ignacio fish.',
    friendOverlapIds: ['dana-punta'],
  },
];
