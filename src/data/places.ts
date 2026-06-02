/**
 * Place — a curated venue (beach, hostel, café, bar, etc.) anchored to one
 * destination (city or region). Mirrors the `places` table in Supabase.
 *
 * Every place belongs to exactly one destination. Today's destinations are
 * `rio-de-janeiro`, `sao-paulo`, `buenos-aires`, `jericoacoara`, `buzios`.
 * `destination_id` matches `planned_stops.id` for cities the user plans to
 * visit; for the user's *current* city (Rio) it's a free-standing string.
 */

export type PlaceCategory =
  | 'beach'
  | 'hostel'
  | 'cafe'
  | 'restaurant'
  | 'bar'
  | 'club'
  | 'chabad'
  | 'kosher'
  | 'synagogue'
  | 'mikveh'
  | 'landmark';

/**
 * Merchant placement, disclosed to the traveler. Two honest badges:
 *  - 'selection' — "Tarmil Selection": earned through Tarmil's own curation,
 *                  never paid for. The warm editorial endorsement.
 *  - 'sponsored' — "Sponsored": a business paid to appear. Always disclosed.
 * Undefined = organic coverage — shown normally, never suppressed for not paying.
 *
 * Derived at read time by `derivePlacementTier` (applied in SupabaseDataProvider)
 * from the `tarmilPick` / `paidPlacement` flags — no schema change. Payment is
 * disclosed first: a paid place reads "Sponsored" even if also a pick, so
 * "Tarmil Selection" stays a purely earned signal.
 */
export type PlacementTier = 'sponsored' | 'selection';

/** Read-time tier: disclose payment first, then earned curation, else organic. */
export function derivePlacementTier(p: {
  tarmilPick?: boolean;
  paidPlacement?: boolean;
}): PlacementTier | undefined {
  if (p.paidPlacement) return 'sponsored';
  if (p.tarmilPick) return 'selection';
  return undefined;
}

export type Place = {
  id: string;
  destinationId: string;
  hebrewName: string;
  englishName: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  hebrewDescription: string;
  englishDescription: string;
  /** Curated editorial star rating, 1–5 — Tarmil's honest curation score. */
  rating: number;
  /** Earned "Tarmil Selection" status (seed/DB: `tarmil_pick`). */
  tarmilPick?: boolean;
  /**
   * Disclosed merchant tier, derived from `tarmilPick` / `paidPlacement` at
   * read time. The sanctioned field for UI badges and ranking.
   */
  placementTier?: PlacementTier;
  /** Public phone number for direct contact. Optional. */
  phone?: string;
  /** Reservation / contact URL — `tel:`, `https://wa.me/...`, or external link. */
  reservationUrl?: string;
  /** Hero image (CDN URL). Falls back to a warm-sand gradient on the card. */
  imageUrl?: string;
  /**
   * v0.3 paid-placement flag — true for curated businesses surfaced in the
   * Around me tab. Existing seed places stay false; only the new business
   * directory entries opt in.
   */
  paidPlacement?: boolean;
};
