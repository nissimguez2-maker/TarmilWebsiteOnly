import { ADDABLE_CITIES, type AddableCity } from './addableCities';

/**
 * Curated starter routes for the first-run empty state. Each is a hand-picked
 * sequence of cities we have real curated data for (photos, copy, country) —
 * not arbitrary global cities. One tap drops the whole route into the trip.
 */
export type StarterRoute = {
  id: string;
  title: string;
  /** One-line reason this route is worth doing. */
  reason: string;
  /** City whose photo fronts the card. */
  heroCityId: string;
  /** Ordered city ids; must exist in ADDABLE_CITIES. */
  cityIds: string[];
};

export const STARTER_ROUTES: StarterRoute[] = [
  {
    id: 'brazil-argentina-classic',
    title: 'Brazil → Argentina classic',
    reason: 'The big-hitter loop — beaches, the falls, and tango.',
    heroCityId: 'rio-de-janeiro',
    cityIds: ['rio-de-janeiro', 'foz-do-iguacu', 'buenos-aires', 'mendoza'],
  },
  {
    id: 'brazil-highlights',
    title: 'Brazil highlights',
    reason: 'Sun, samba, and the Iguaçu falls — all in one country.',
    heroCityId: 'buzios',
    cityIds: ['rio-de-janeiro', 'buzios', 'sao-paulo', 'foz-do-iguacu'],
  },
];

/** Resolve a route's city ids to AddableCity objects (skips any unknown id). */
export function routeCities(route: StarterRoute): AddableCity[] {
  return route.cityIds
    .map((id) => ADDABLE_CITIES.find((c) => c.id === id))
    .filter((c): c is AddableCity => Boolean(c));
}

/** Total nights across a route's cities. */
export function routeNights(route: StarterRoute): number {
  return routeCities(route).reduce((sum, c) => sum + c.defaultNights, 0);
}
