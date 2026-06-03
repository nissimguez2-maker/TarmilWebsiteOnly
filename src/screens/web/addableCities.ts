import { GLOBAL_CITIES } from './globalCities';

export type AddableCity = {
  id: string;
  nameEn: string;
  lat: number;
  lng: number;
  defaultNights: number;
  blurb?: string;
};

export function slugifyId(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Hand-curated overlay for the original launch cities: a sensible default stay
 * and a warm, human one-liner. Everything else in the catalog gets these filled
 * in at runtime from the live-API stack (Wikipedia / OSM / weather / photos / AI),
 * keyed off the accurate coordinates in {@link GLOBAL_CITIES}. Keyed by the exact
 * ids the catalog reuses, so this content keeps linking after the global expansion.
 */
const CURATED: Record<string, { defaultNights: number; blurb: string }> = {
  'rio-de-janeiro': { defaultNights: 3, blurb: 'Christ, Copacabana, Sugarloaf, samba after midnight.' },
  'foz-do-iguacu': { defaultNights: 2, blurb: "Walk both sides of the Devil's Throat. Two days max." },
  mendoza: { defaultNights: 3, blurb: 'Argentine wine country at the foot of the Andes.' },
  'sao-paulo': { defaultNights: 3, blurb: "Endless city — art, food halls, Brazil's best nightlife." },
  'buenos-aires': { defaultNights: 4, blurb: 'Steak, tango, late dinners, European bones.' },
  'punta-del-este': { defaultNights: 2, blurb: "Uruguay's beach scene — summer sun and seafood." },
  buzios: { defaultNights: 2, blurb: 'Beach-hop the peninsula Brigitte Bardot made famous.' },
  jericoacoara: { defaultNights: 3, blurb: 'Dunes, lagoons, sunset on the sand — off the grid.' },
  bangkok: { defaultNights: 3, blurb: 'Street food, temples, rooftop bars — every SE-Asia trip starts here.' },
  'ko-pha-ngan': { defaultNights: 4, blurb: 'Full Moon Party on one coast, empty hammock beaches on the other.' },
  hanoi: { defaultNights: 3, blurb: 'Old Quarter chaos, egg coffee, and the gateway to Ha Long Bay.' },
  goa: { defaultNights: 4, blurb: "India's beach state — Anjuna sunsets, scooters, and trance markets." },
  kathmandu: { defaultNights: 3, blurb: 'Thamel, great stupas, and the trailhead for every Himalayan trek.' },
  kasol: { defaultNights: 4, blurb: 'Parvati Valley pine, hot springs, and the most Israeli corner of India.' },
  tbilisi: { defaultNights: 3, blurb: 'Sulfur baths, amber wine, and the coolest cheap capital on the trail.' },
  medellin: { defaultNights: 4, blurb: 'Eternal spring, metrocables, and salsa nights in Provenza.' },
  cusco: { defaultNights: 3, blurb: 'Inca stone, San Blas hills, and the launchpad for Machu Picchu.' },
  'la-paz': { defaultNights: 3, blurb: "The world's highest capital — cable cars, salt flats, Death Road." },
};

/** A sensible default stay for a city with no curated override. */
const DEFAULT_NIGHTS = 3;

/**
 * The full addable / draftable city universe — every catalog city as an
 * {@link AddableCity}, with the curated overlay applied. ~400 of the world's
 * best-known destinations across every continent, so the trip drafter, plan
 * search, and id resolution all span the globe (not the original 18-city trail).
 * Free-text search in the Add-Stop modal still resolves anything via OpenStreetMap.
 */
export const ADDABLE_CITIES: AddableCity[] = GLOBAL_CITIES.map((c) => {
  const curated = CURATED[c.id];
  return {
    id: c.id,
    nameEn: c.nameEn,
    lat: c.lat,
    lng: c.lng,
    defaultNights: curated?.defaultNights ?? DEFAULT_NIGHTS,
    ...(curated?.blurb ? { blurb: curated.blurb } : {}),
  };
});

/** Fast id -> city lookup over the whole catalog. */
const CITY_BY_ID = new Map<string, AddableCity>(ADDABLE_CITIES.map((c) => [c.id, c]));

/**
 * A small, globally-spread set of marquee cities shown as quick-pick "Suggested"
 * shortcuts in the Add-Stop modal — so the panel never dumps all ~400 rows.
 * Spans all six regions; anything not in the catalog is simply skipped.
 */
const SUGGESTED_IDS: readonly string[] = [
  // Europe
  'paris', 'rome', 'barcelona', 'lisbon', 'amsterdam', 'prague', 'reykjavik',
  // Americas
  'new-york', 'mexico-city', 'rio-de-janeiro', 'buenos-aires',
  // Asia
  'tokyo', 'kyoto', 'bangkok', 'hanoi', 'ubud',
  // Middle East
  'istanbul', 'dubai', 'jerusalem', 'petra',
  // Africa
  'cape-town', 'marrakesh', 'cairo',
  // Oceania
  'sydney', 'queenstown',
];

export const SUGGESTED_CITIES: AddableCity[] = SUGGESTED_IDS.map(
  (id) => CITY_BY_ID.get(id),
).filter((c): c is AddableCity => Boolean(c));
