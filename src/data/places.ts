/**
 * Place — a venue (beach, hostel, café, bar, landmark…) anchored to one
 * destination (city). The curated seed (`source: 'curated'`, the default) lives
 * in `rioPlaces.ts` + `globalPlaces.ts` and is loaded at runtime by
 * SupabaseDataProvider as `[...rioPlaces, ...globalPlaces]`.
 *
 * `destinationId` matches an addable-city / planned-stop id. As the platform
 * scales worldwide, places also arrive from non-curated sources (OSM, Wikidata,
 * Google, Foursquare, Travelpayouts), normalized up into this same shape with
 * curated always winning the merge. The provenance + enrichment fields below all
 * default to "curated-shaped", so existing seed data is unchanged.
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

/**
 * Origin of a place record. Absent ⇒ 'curated' (back-compat: all seed data).
 */
export type PlaceSource =
  | 'curated'
  | 'osm'
  | 'wikidata'
  | 'google'
  | 'foursquare'
  | 'travelpayouts';

/** Cross-source external IDs — join keys for de-dup, enrichment, and ToS retention. */
export type PlaceRefs = {
  /** OSM element, e.g. "node/123" (ODbL — free to store). */
  osmId?: string;
  /** Wikidata QID, e.g. "Q243" (CC0). */
  wikidataId?: string;
  /** Google place_id — the ONLY Google field we may persist long-term. */
  googlePlaceId?: string;
  /** Foursquare fsq_id. */
  fsqId?: string;
};

/**
 * A third-party AGGREGATE rating, kept in its own slot so it can NEVER be
 * rendered as Tarmil's editorial gold star (`rating`). The honesty firewall by
 * construction: editorial = `rating`; third-party = here, shown quiet + attributed.
 */
export type AggregateRating = {
  value: number;
  source: 'google' | 'foursquare' | 'tripadvisor';
  count?: number;
};

export type Place = {
  id: string;
  destinationId: string;
  /** Hebrew name + description are optional — non-curated global sources are
   *  English-only, and the UI is English-only this phase (i18n-ready). */
  hebrewName?: string;
  englishName: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  hebrewDescription?: string;
  englishDescription: string;
  /**
   * Tarmil's editorial star rating, 1–5 — the honest curation score, and the
   * ONLY rating that renders as the gold star. Third-party aggregate scores go
   * in `aggregateRating`, never here (the honesty firewall, by construction).
   */
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

  // ── Provenance & enrichment (the global-content layer) ──────────────────────
  // All optional; absent ⇒ a curated, editorial-rated place (the seed default),
  // so existing data is unchanged and TypeScript-strict stays clean.
  /** Record origin. Absent ⇒ 'curated' (originated in the in-repo seed). */
  source?: PlaceSource;
  /** Cross-source external IDs (de-dup + enrichment + the stable-id contract). */
  refs?: PlaceRefs;
  /** Third-party aggregate rating — rendered quiet + attributed, never the gold star. */
  aggregateRating?: AggregateRating;
  /** Required source attribution to display (e.g. "© OpenStreetMap contributors"). */
  attribution?: string;
  /** Opening hours, normalized weekday → string. */
  hours?: Partial<
    Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', string>
  >;
  /** Price level 1–4 (Google/Foursquare convention). */
  priceLevel?: 1 | 2 | 3 | 4;
  /** Extra gallery images beyond the hero `imageUrl`. */
  gallery?: string[];
  /** True once premium (Google/Foursquare) enrichment has been merged in. */
  enriched?: boolean;
  /** ISO timestamp of last premium enrichment — drives cache TTL / refresh. */
  enrichedAt?: string;
  /** ISO timestamp this place was last seen in a source — freshness vs. closures. */
  verifiedAt?: string;
};
