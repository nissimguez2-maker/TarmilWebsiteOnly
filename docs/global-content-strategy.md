# Tarmil — Global Content Strategy (v1)

**Status:** PLAN. The **supply / content** layer — companion to `docs/monetization-map.md`
(the **demand / monetization** layer). Together they are the platform strategy:
*rich global content → engaged users → monetizable bookings.* Synthesized from
three specialist analyses (place-data landscape · content-cost economics · tiered
architecture). Date: 2026-06-02. All pricing/ToS are **directional — verify before
building** (§9).

---

## 1. The goal, and the one finding that reshapes it

**Goal:** serve quality places for **every city/place in the world** with a premium
feel — not just the ~17 curated hero cities.

**The make-or-break axis is *not* price — it's caching / storage ToS.** A "premium
feel for the whole world" requires pre-building and storing a curated content base.
That legally splits the field:

- **Cannot cache (display-time only):** Google Places, Yelp, TripAdvisor, Mapbox
  (temporary tier), TomTom, HERE. *(Google: you may persist only the `place_id`.)*
- **Can cache freely:** **Foursquare Open-Source Places (Apache-2.0), OSM/Overpass +
  Geoapify (ODbL), Wikidata/Wikipedia/Wikivoyage (CC0 / CC BY-SA), and Viator /
  Booking via affiliate ingest.**

→ **Build the world on the cacheable sources; keep the rich non-cacheable leaders
(Google/TripAdvisor) as thin, intent-gated, live garnish.** The founder's "Google
Places and resemblant" instinct is right on *richness*, wrong on *economics + law*.

---

## 2. The tiered stack

**T0 — Free, cacheable WORLD BASE (the "every place" skeleton):**
- **Foursquare Open-Source Places (Apache-2.0)** — 100M+ POIs, 200+ countries, free,
  cache/redistribute freely. **Bulk-ingest into Supabase** as the canonical skeleton
  (name, geo, category, links). This is what actually delivers "the whole world" at ~$0.
- **Wikidata + Wikipedia/Wikivoyage (CC0 / CC BY-SA)** — the premium **prose** layer
  (warm descriptions, city/place guides). Join via **Wikidata QID**. Makes the world
  feel *curated*, not a POI dump.
- **OSM/Overpass + Geoapify (ODbL)** — hours / categories / contact, cacheable. Use
  **Geoapify** (3k/day free, caching allowed) to avoid Overpass infra pain at scale.

**T1 — Free, cacheable INVENTORY-AS-CONTENT (richness + revenue in one — highest leverage):**
- **Viator** (tours: photos, descriptions, ratings) + **Booking.com Demand** (hotel
  descriptions, photo URLs). Free to affiliates, locally ingestable, **and** the
  Tier-1 revenue lines from the monetization map. One fetch fills See/Do + Stay tabs
  *and earns*. (Booking: **hot-link** photos, don't store them.)

**T2 — On-demand PREMIUM enrichment (live, intent-gated, NOT pre-cached):**
- **Foursquare Places live** (30-day cache OK) — ratings/photos/hours/price for a place
  the user actually opens.
- **Google Places (New)** — highest-intent moments only; display-time, store `place_id`
  only. A few hundred lookups per planned trip is affordable vs ~$20/trip; pre-caching
  the world here is not.
- **TripAdvisor Content** (5k/mo free) — Eat/attractions where TheFork/TA also monetizes.

**Drop / deprioritize:** **Yelp** (only ~32 countries — fails "whole world"),
**TomTom/HERE** as content (storage-restricted → geocoding fallback only), **Mapbox**
as a content base (keep for the map + live Search Box geocoding we already use).

---

## 3. The economics — affordable, but only one way

| Architecture | Content cost / visitor | vs ~$0.60 revenue/visitor | Verdict |
|---|---|---|---|
| Naive (Google for everything), cached | ~$0.61 (~$15/trip, ~77% of revenue) | ~0% margin | **Insolvent on any downside — rejected** |
| **Tiered/lazy (this stack)** | **~$0.01** | **+98% margin (1–3% of revenue)** | **The world is affordable** |

The app is **already ~90% the tiered architecture** (free Overpass lists + free
Wiki/Unsplash photos, cached). The danger isn't the current build — it's the
temptation to "upgrade" global cities to Google-everything. **Don't.** The whole
verdict pivots on the **visitor→planned-trip funnel** (assumed 4%, unmeasured) — the
cheap architecture survives being wrong about it; the expensive one doesn't. So:
**instrument the funnel before approving any paid-data spend.**

---

## 4. The architecture — curated-first, honesty-preserving

- **Four tiers, priority PER-FIELD (not per-record):** T1 curated hero (always wins,
  untouched) › T2-premium › T2-base › T4 inventory. A curated café with no photo may
  borrow one from Google; its **editorial rating is never overwritten**.
- **One unified `Place` shape** (extend, don't fork — all new fields optional → zero
  breakage). Per-source **normalizers** map every source up into `Place`; a pure
  **`mergePlaces`** de-dups (shared external ID, else name + ~75 m proximity) and
  resolves each field by priority.
- **🔒 The honesty firewall:** `ratingKind: 'editorial'` → the gold Tarmil star;
  `ratingKind: 'aggregate'` (Google/FSQ) → a quiet, attributed "4.4 · Google",
  **never the gold star.** This is how we ingest millions of global ratings without
  betraying the W13 "honest curation only" rule.
- **Tier-aware sort:** curated/selection first, enriched-global next, raw-OSM last —
  hero cities look identical to today.
- **Keys server-side:** paid tiers (Google / Foursquare / Travelpayouts) go through
  **one Supabase Edge Function** (`places-enrich`); free tiers stay client-direct.
  (`VITE_*` is public — secret keys cannot ship in the bundle.)
- **Shared cache:** a new `places_cache` Supabase table — **RLS read-only to clients,
  written only by the Edge Function service-role** (clients can't forge entries or run
  up the bill). Per-source ToS-compliant TTLs + stale-while-revalidate + a daily spend
  ceiling. Scope-clean: does **not** touch `web_trips` or any native table.
- **Graceful degradation:** every tier fails to the tier below; **worst case = today's
  experience.** Premium is always optional.

---

## 5. Caching / ToS — what is legal to store per source

| Source | Persist long-term? | Rule | Attribution |
|---|---|---|---|
| **Foursquare OS Places** | ✅ everything (Apache-2.0) | none | FSQ-OS notice |
| **OSM / Overpass / Geoapify** | ✅ everything (ODbL) | share-alike on a redistributed *DB* | "© OpenStreetMap contributors" |
| **Wikidata / Wikipedia / Wikivoyage** | ✅ (CC0 / CC BY-SA) | attribute prose; share-alike on text | "from Wikipedia/Wikivoyage, CC BY-SA" |
| **Viator** | ✅ ingest (per affiliate terms) | — | partner branding |
| **Booking.com Demand** | ⚠️ text yes; **hot-link photos, don't store** | — | partner branding |
| **Foursquare Places (live)** | ⚠️ up to **30 days** | delete on termination | "Powered by Foursquare" |
| **Google Places** | ❌ **`place_id` only** | display-time; refresh ≤30d; photos via proxy | "Powered by Google" |
| **TripAdvisor** | ❌ display-time only | logos + bubble ratings + link back | TA logo |
| **Yelp / TomTom / HERE / Mapbox(temp)** | ❌ | not a cache license | per terms |

Enforcement is **structural**: Google rows get a ≤30-day `expires_at`; client RLS
refuses expired rows; the Google normalizer is the single audited code path that
strips anything beyond the permitted window.

---

## 6. Integration seams (curated never regresses)

- **`src/data/places.ts`** — add optional provenance/enrichment fields (`source`,
  `refs`, `ratingKind`, `hours`, `gallery`, `priceLevel`, `attribution`, `enriched`).
- **`src/lib/SupabaseDataProvider.tsx`** — keep the eager curated load **exactly as-is**;
  ADD lazy `getCityPlaces(stop, tab)` (merged T1+T2+T4 per city) and `enrichPlace(place)`
  (lazy T2-premium on detail open).
- **`src/screens/web/WebCityPanel.tsx`** — three surgical edits: upgrade the OSM
  "Nearby" rows into first-class `PlaceCard`s from `getCityPlaces`; tier-aware sort;
  `PlaceCard` rating branch (editorial gold star vs quiet aggregate + attribution) +
  lazy `enrichPlace` on open; `StayStrip` gets real T4 inventory.
- **New:** `src/lib/content/{normalize,mergePlaces,categoryMap}.ts`; a `places_cache`
  Supabase table + a `places-enrich` Edge Function.
- **Bonus — the Jewish/kosher tab scales globally for free:** Overpass `religion=jewish`
  + Wikidata Chabad queries → `synagogue`/`chabad` everywhere (W12 at world scale).

---

## 7. Rollout (de-risked, each step independently shippable + revertible)

1. **Types + normalizers + `mergePlaces`** — no UI change; unit-test that curated
   output is byte-identical.
2. **Upgrade T0/T2 base** — `getCityPlaces` + OSM/Wikidata normalized into `PlaceCard`s;
   bulk-ingest the **Foursquare OS** world skeleton into Supabase. Free; long-tail
   cities get value immediately; hero cities visibly unchanged.
3. **`places_cache` + `places-enrich` Edge Function + T2-premium** (Foursquare-live
   first — friendlier ToS — then Google). Feature-flagged; disabled ⇒ exactly step 2.
4. **T1 inventory** (Viator / Booking) into Stay/Do — content **and** revenue.

---

## 8. How it ties to monetization (the flywheel)

- **Viator + Booking are both content (T1) and the monetization map's Tier-1 revenue
  lines** — the single highest-leverage move: one integration, content *plus* earnings.
- Rich global content → engaged users → more planned trips → more monetizable bookings.
- The same Edge Function + affiliate `marker` serves content **and** affiliate links.

---

## 9. Verify before building

- Google's **2026 per-SKU free quotas** + whether the legacy $200 credit fully sunset.
- Build the **persistent** base on **Foursquare OS (Apache-2.0, no limit)**, not the
  live API (30-day cap, and **v3 deprecates 2026-05-15** — use current Places).
- **Viator / GetYourGuide / Booking** content-ingest rights (per affiliate agreement;
  Booking = hot-link photos).
- **ODbL share-alike**: powering the UI from OSM/FSQ-OS is fine; *redistributing a
  derived database* carries obligations — a quick legal check at world scale.
- The **visitor→planned-trip funnel + attach rate** (instrument before any paid spend).

---

## 10. Sources

Google Places pricing + caching/attribution policy · Foursquare Places API + OS Places
(Apache-2.0, HuggingFace) + API License Agreement + v3-deprecation notice · TripAdvisor
Content API FAQ · Yelp Fusion pricing · Mapbox pricing · OpenTripMap · Wikivoyage dual
licensing / Wikimedia Enterprise · Geoapify pricing + Places docs · OSM Nominatim & API
usage policies · TomTom / HERE pricing · Viator Partner API technical guide · Booking.com
Demand API. (Full link list in the research transcript.)
