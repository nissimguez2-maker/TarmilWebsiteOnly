/**
 * archetypes — the engine behind the "choose your trip" front door.
 *
 * From a short, structured trip {@link TripIntent} (region, who, budget, weeks),
 * this produces EXACTLY 3 distinct trip {@link TripArchetype}s — one each of
 * 'chill', 'classic', 'adventure' — that the traveler then picks between. Each
 * archetype is an ORDERED list of city ids drawn ONLY from {@link ADDABLE_CITIES}.
 *
 * Honesty / curation firewall: routes are built ONLY from the real curated
 * cities, never invented. The model contributes two things and nothing else:
 * (1) the ORDERED SELECTION of ids from a region-filtered pool we hand it, and
 * (2) warm editorial prose (title + rationale). Every id it returns is validated
 * against the catalog; unknown ids are dropped. The prose is forbidden from
 * inventing specifics — no ratings, no superlatives, no "best/#1/most popular",
 * no fabricated counts. Titles/rationales that smuggle those in are scrubbed.
 *
 * Distinctness is GUARANTEED structurally, not left to the model: the three
 * archetypes differ in shape — chill (fewer cities, slower, calmer picks),
 * classic (the canonical highlights loop), adventure (more cities, faster /
 * farther). After validation we reconcile the model's picks against these shape
 * targets so the trio always reads as three genuinely different trips.
 *
 * Every path is graceful and NEVER throws. If the proxy is unavailable, the
 * reply does not parse, or the model is weak, a deterministic rule-based picker
 * fills each archetype from the region pool. The function returns `null` only
 * when the region pool is too small (< 2 cities) or `aiText` fails AND the
 * fallback cannot assemble 3 usable archetypes.
 *
 * Cache scheme: `arch:${region}:${who}:${budget}:${weeks}` — derived from the
 * normalized intent, so the same intent reuses one generated result forever.
 */

import { aiText } from '../groqApi';
import { ADDABLE_CITIES, type AddableCity } from '../addableCities';
import { GLOBAL_CITIES, type CityRegion } from '../globalCities';

/** The mood of a trip. Order is fixed: chill, classic, adventure. */
export type TripVibe = 'chill' | 'classic' | 'adventure';

/**
 * Which continent to draw a trip from. 'any' = "surprise me": at draft time it
 * resolves to one real continent, so a single route never sprawls across the
 * globe (Lisbon → Tokyo → Cape Town) and stays a coherent, editable trip.
 */
export type TripRegion = CityRegion | 'any';

/** A short, structured trip brief the doorway collects from the traveler. */
export type TripIntent = {
  region: TripRegion;
  who: 'solo' | 'pair' | 'friends' | 'family';
  budget: 'shoestring' | 'mid' | 'comfort';
  /** Trip length in weeks, clamped to 1..6. */
  weeks: number;
};

/** One pickable trip — a vibe, warm copy, and an ordered list of real city ids. */
export type TripArchetype = {
  /** One of each vibe, returned in this order: chill, classic, adventure. */
  vibe: TripVibe;
  /** Warm editorial title, e.g. "The Slow Coast" (kept to ~4 words or fewer). */
  title: string;
  /** One warm line, active voice, <= ~14 words; no ratings/superlatives/social proof. */
  rationale: string;
  /** Ordered city ids, ALL members of ADDABLE_CITIES, distinct, length >= 2. */
  cityIds: string[];
};

/** The legal city ids, as a fast lookup set, computed once at module load. */
const CITY_ID_SET = new Set<string>(ADDABLE_CITIES.map((c) => c.id));

/** City id -> its continent, from the global catalog (computed once at load). */
const CITY_REGION = new Map<string, CityRegion>(
  GLOBAL_CITIES.map((c) => [c.id, c.region]),
);

/** Every concrete continent, used to resolve 'any' (surprise me). */
const ALL_REGIONS: readonly CityRegion[] = [
  'europe',
  'americas',
  'asia',
  'middle-east',
  'africa',
  'oceania',
];

/**
 * Resolve a requested region to a CONCRETE continent. 'any' picks one at random
 * so "surprise me" stays a single-continent (coherent) route and varies between
 * drafts; a concrete region passes through unchanged.
 */
function resolveRegion(region: TripRegion): CityRegion {
  if (region !== 'any') return region;
  return ALL_REGIONS[Math.floor(Math.random() * ALL_REGIONS.length)];
}

/**
 * Cities whose default pace leans calm / coastal — biased UP for 'chill' and
 * DOWN for 'adventure'. Grounded in the catalog's own blurbs (beaches, lagoons,
 * springs, wine-at-the-foot-of-the-Andes), never invented.
 */
const CALM_CITY_IDS: ReadonlySet<string> = new Set([
  'buzios',
  'jericoacoara',
  'punta-del-este',
  'ko-pha-ngan',
  'goa',
  'kasol',
  'mendoza',
]);

/**
 * Cities whose draw is altitude / trek / remote / far-flung — biased UP for
 * 'adventure'. Also grounded in catalog blurbs (Himalayan trailheads, highest
 * capital + Death Road, Inca launchpad for Machu Picchu, far-north dunes).
 */
const ADVENTURE_CITY_IDS: ReadonlySet<string> = new Set([
  'kathmandu',
  'la-paz',
  'cusco',
  'jericoacoara',
  'kasol',
  'hanoi',
]);

/** Per-vibe sizing knobs. Pace scales the cities-per-week density. */
const VIBE_SHAPE: Record<TripVibe, { pace: number; minCities: number; maxCities: number }> = {
  // Slower: fewer, longer stops.
  chill: { pace: 0.85, minCities: 2, maxCities: 5 },
  // The canonical highlights loop — the middle road.
  classic: { pace: 1.0, minCities: 3, maxCities: 6 },
  // Faster / farther: more stops, more ground covered.
  adventure: { pace: 1.25, minCities: 3, maxCities: 7 },
};

/** Vibe order is part of the contract: every consumer relies on chill→classic→adventure. */
const VIBE_ORDER: readonly TripVibe[] = ['chill', 'classic', 'adventure'] as const;

/** Clamp trip length to the supported 1..6 weeks (integer). */
function clampWeeks(weeks: number): number {
  if (!Number.isFinite(weeks)) return 2;
  return Math.min(6, Math.max(1, Math.round(weeks)));
}

/**
 * The effective minimum stop count for a vibe given the pool size. Normally each
 * vibe's own `minCities`, but in a TIGHT pool we let 'chill' drop to 2 so the
 * trio can still differ in shape: a 3-city pool then reads chill=2 < classic=3 =
 * adventure=3 instead of three identical 3-city lists. Distinctness must hold
 * structurally even when the catalog gives a region only a few cities.
 */
function effectiveMin(vibe: TripVibe, poolSize: number): number {
  const base = VIBE_SHAPE[vibe].minCities;
  // When the pool can't comfortably feed every vibe's natural floor, relax chill
  // toward the absolute floor of 2 so it stays the smallest, slowest option.
  if (vibe === 'chill' && poolSize <= VIBE_SHAPE.classic.minCities) return 2;
  return base;
}

/**
 * Roughly how many stops a route of `weeks` should hold at a given vibe pace,
 * clamped to that vibe's [min, max]. ~one stop per 4–5 nights, scaled by pace.
 * Used only to SIZE routes — never to invent cities.
 */
function targetCount(weeks: number, vibe: TripVibe, poolSize: number): number {
  const shape = VIBE_SHAPE[vibe];
  const min = effectiveMin(vibe, poolSize);
  // Tight pool: there's no room to express pace via stop COUNT, so pin chill to
  // its (relaxed) floor and let classic/adventure take the rest — the shapes
  // still separate (chill smaller than the other two) instead of collapsing.
  if (vibe === 'chill' && poolSize <= VIBE_SHAPE.classic.minCities) return min;
  const nights = weeks * 7;
  // Baseline ~4.5 nights per stop, then bend by the vibe's pace.
  const raw = Math.round((nights / 4.5) * shape.pace);
  const bounded = Math.min(shape.maxCities, Math.max(min, raw));
  // Can never ask for more cities than the pool actually holds.
  return Math.min(bounded, poolSize);
}

/** True when a city belongs to the given continent. */
function inRegion(city: AddableCity, region: CityRegion): boolean {
  return CITY_REGION.get(city.id) === region;
}

/**
 * The candidate pool for a (resolved, concrete) continent: catalog cities on
 * that continent. Order here is catalog order, which the rule-based fallback
 * then refines per vibe.
 */
function poolFor(region: CityRegion): AddableCity[] {
  return ADDABLE_CITIES.filter((c) => inRegion(c, region));
}

/** A compact catalog (`id (Name)`) for just the pooled cities, fed to the model. */
function poolCatalog(pool: AddableCity[]): string {
  return pool.map((c) => `${c.id} (${c.nameEn})`).join(', ');
}

const SYSTEM =
  'You design three distinct trip options for a trip planner by selecting from a fixed list of cities. ' +
  'You may ONLY use the city ids provided; never invent a city, id, or name. ' +
  'Return exactly three options with vibes "chill", "classic", and "adventure", in that order. ' +
  'Make them genuinely different in shape: chill picks fewer, calmer, slower stops; ' +
  'classic is the canonical highlights loop; adventure adds more stops and covers more ground (treks, remote, far). ' +
  'Each option needs at least two city ids, ordered as a sensible travel route, with no duplicates within an option. ' +
  'Reply with ONE JSON array of exactly three objects and nothing else, each: ' +
  '{"vibe":"chill","title":"...","rationale":"...","cityIds":["id1","id2"]}. ' +
  'Title: warm, four words or fewer. Rationale: one warm active-voice line, fourteen words or fewer. ' +
  'Invent no specifics in the prose: no ratings, no review counts, no prices, ' +
  'no superlatives such as "best", "top", "#1", or "most popular", no claims about crowds or who goes there. ' +
  'Output no dates, coordinates, nights, or code fences. Do not use em dashes.';

/** Normalize an intent into a stable, lowercase cache key fragment. */
function intentKey(intent: TripIntent): string {
  const weeks = clampWeeks(intent.weeks);
  return `${intent.region}:${intent.who}:${intent.budget}:${weeks}`;
}

/**
 * A single parsed-and-validated model option, before shape reconciliation.
 * `cityIds` here are already filtered to real, distinct catalog ids.
 */
type RawArchetype = { vibe: TripVibe; title: string; rationale: string; cityIds: string[] };

/**
 * Pull a JSON array out of a model reply that may be wrapped in prose or code
 * fences. Returns the parsed array, or `null` when nothing parses. Never throws.
 */
function parseJsonArray(raw: string): unknown[] | null {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Validate + dedupe a raw id list down to real catalog ids constrained to the pool. */
function cleanIds(value: unknown, poolIds: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const id = item.trim().toLowerCase();
    if (CITY_ID_SET.has(id) && poolIds.has(id) && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

/** Coerce an unknown model `vibe` field to a legal TripVibe, or null. */
function asVibe(value: unknown): TripVibe | null {
  if (value === 'chill' || value === 'classic' || value === 'adventure') return value;
  return null;
}

/**
 * Honesty scrub for model prose: strip em dashes, collapse whitespace, drop the
 * line entirely if it smuggles in a forbidden claim (ratings / superlatives /
 * social proof / fabricated counts). A dropped line becomes '' so the caller
 * substitutes safe deterministic copy. Also trims to a sane length.
 */
const FORBIDDEN_PROSE = /\b(best|top|#1|number one|most popular|must[- ]see|world[- ]class|rated|stars?|reviews?|popular|everyone|travelers love|loved by|cheapest|luxur)/i;

function cleanProse(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  const text = value
    .replace(/[—–]/g, ' ')
    .replace(/["`*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length === 0 || text.length > maxLen) return '';
  if (FORBIDDEN_PROSE.test(text)) return '';
  return text;
}

/** Map each parsed option by vibe (first occurrence wins), ignoring junk. */
function indexByVibe(arr: unknown[], poolIds: ReadonlySet<string>): Map<TripVibe, RawArchetype> {
  const byVibe = new Map<TripVibe, RawArchetype>();
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const vibe = asVibe(obj.vibe);
    if (!vibe || byVibe.has(vibe)) continue;
    byVibe.set(vibe, {
      vibe,
      title: cleanProse(obj.title, 48),
      rationale: cleanProse(obj.rationale, 120),
      cityIds: cleanIds(obj.cityIds, poolIds),
    });
  }
  return byVibe;
}

/**
 * Rank a region pool into the preferred pick order for one vibe. This is the
 * deterministic backbone that BOTH the fallback and the shape-reconciliation
 * step use, so distinctness never depends on the model.
 *
 * - chill: calm/coastal cities first, then by longer default stays.
 * - adventure: trek/remote cities first, then by farther/lower-frequency picks.
 * - classic: the catalog's own order (its canonical highlights sequence).
 *
 * A light budget/who bias nudges, never overrides: shoestring + family prefer
 * calmer, longer stays; friends + comfort tolerate a faster adventure shape.
 */
function rankedPool(pool: AddableCity[], vibe: TripVibe, intent: TripIntent): AddableCity[] {
  const calmLean = intent.budget === 'shoestring' || intent.who === 'family';
  const fastLean = intent.who === 'friends' || intent.budget === 'comfort';

  const score = (c: AddableCity): number => {
    let s = 0;
    if (vibe === 'chill') {
      if (CALM_CITY_IDS.has(c.id)) s += 10;
      if (ADVENTURE_CITY_IDS.has(c.id)) s -= 6;
      s += c.defaultNights; // longer-stay cities suit a slow trip
      if (calmLean && CALM_CITY_IDS.has(c.id)) s += 2;
    } else if (vibe === 'adventure') {
      if (ADVENTURE_CITY_IDS.has(c.id)) s += 10;
      if (CALM_CITY_IDS.has(c.id)) s -= 4;
      s += (5 - c.defaultNights); // shorter-stay cities suit a faster trip
      if (fastLean && ADVENTURE_CITY_IDS.has(c.id)) s += 2;
    } else {
      // classic: gentle pull toward the marquee anchors, otherwise catalog order.
      if (CALM_CITY_IDS.has(c.id)) s += 1;
    }
    return s;
  };

  // Stable sort: keep catalog order as the tiebreak (important for 'classic').
  return pool
    .map((c, i) => ({ c, i, s: score(c) }))
    .sort((a, b) => (b.s - a.s) || (a.i - b.i))
    .map((x) => x.c);
}

/** Deterministic, honesty-safe default copy when the model gives no usable prose. */
const DEFAULT_COPY: Record<TripVibe, { title: string; rationale: string }> = {
  chill: { title: 'The Slow Route', rationale: 'Fewer stops, longer stays, room to settle into each place.' },
  classic: { title: 'The Classic Loop', rationale: 'The headline cities, in an order that flows easily.' },
  adventure: { title: 'The Long Way', rationale: 'More ground, higher trails, and the stops further out.' },
};

/**
 * Reconcile one vibe's model output against its shape target, so the trio is
 * always genuinely distinct. We start from the model's valid picks (preserving
 * its order), then top up from the ranked pool toward `count`, then trim back to
 * `count` so chill stays smaller than adventure. Falls back to deterministic copy
 * whenever the model's prose was dropped by the honesty scrub.
 */
function reconcile(
  raw: RawArchetype | undefined,
  pool: AddableCity[],
  vibe: TripVibe,
  intent: TripIntent,
  count: number,
): TripArchetype | null {
  const shape = VIBE_SHAPE[vibe];
  const min = effectiveMin(vibe, pool.length);
  const want = Math.max(min, Math.min(shape.maxCities, count));

  // Seed with the model's validated, in-region ids (kept in its order).
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const id of raw?.cityIds ?? []) {
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  // Top up toward the target from the ranked pool (deterministic, distinct).
  if (ids.length < want) {
    for (const c of rankedPool(pool, vibe, intent)) {
      if (ids.length >= want) break;
      if (!seen.has(c.id)) {
        seen.add(c.id);
        ids.push(c.id);
      }
    }
  }

  // Trim back so vibe sizing holds (chill stays tighter than adventure).
  const sized = ids.slice(0, want);
  if (sized.length < 2) return null;

  // Order the final set. Adventure leads with its highest-ranked (further-out /
  // trek) stops, so even when a tight pool forces it to share a city set with
  // classic, the JOURNEY reads differently. Chill/classic follow catalog order
  // (clusters by country) for a geographically sensible loop.
  const ordered = vibe === 'adventure' ? orderForAdventure(sized, pool, intent) : orderByCatalog(sized);

  const fallbackCopy = DEFAULT_COPY[vibe];
  return {
    vibe,
    title: raw?.title || fallbackCopy.title,
    rationale: raw?.rationale || fallbackCopy.rationale,
    cityIds: ordered,
  };
}

/**
 * Guarantee three usable, DISTINCT archetypes from the region pool, with or
 * without the model. Each vibe is reconciled to its shape target; if any vibe
 * still cannot reach two cities, the whole result is unusable and we return null
 * (the caller treats null as "this region is too thin to offer a doorway").
 *
 * Distinctness is layered: chill is sized smaller than classic/adventure, so it
 * differs by LENGTH; adventure is ordered to lead with its further-out stops, so
 * it differs from classic by ROUTE even when a tight pool forces a shared city
 * set; and a final de-collision pass grows the bigger-shaped vibe by one extra
 * real city whenever the pool has a spare. The result is always three options
 * that read as genuinely different trips.
 */
function assemble(
  byVibe: Map<TripVibe, RawArchetype>,
  pool: AddableCity[],
  intent: TripIntent,
): TripArchetype[] | null {
  const weeks = clampWeeks(intent.weeks);
  const out: TripArchetype[] = [];

  for (const vibe of VIBE_ORDER) {
    const count = targetCount(weeks, vibe, pool.length);
    const archetype = reconcile(byVibe.get(vibe), pool, vibe, intent, count);
    if (!archetype) return null;
    out.push(archetype);
  }

  // Index-safe handles (the loop above guaranteed exactly three, in vibe order).
  const chill = out.find((a) => a.vibe === 'chill');
  const classic = out.find((a) => a.vibe === 'classic');
  const adventure = out.find((a) => a.vibe === 'adventure');
  if (!chill || !classic || !adventure) return null;

  // De-collision: in a tiny pool two vibes can land on the same set. Grow the
  // bigger-shaped vibe by one DISTINCT stop where the pool allows, so adventure
  // stays longest and classic differs from chill. Never invents — only pulls
  // another real, ranked, in-pool city.
  growApart(adventure, chill, pool, intent);
  growApart(adventure, classic, pool, intent);
  growApart(classic, chill, pool, intent);

  return out;
}

/**
 * If `bigger` and `smaller` hold the same set, append one more ranked, in-pool
 * city to `bigger` (when the pool has a spare), re-ordered geographically. A
 * no-op when the pool is exhausted — distinctness then rests on order/copy.
 */
function growApart(
  bigger: TripArchetype,
  smaller: TripArchetype,
  pool: AddableCity[],
  intent: TripIntent,
): void {
  if (!sameRoute(bigger, smaller)) return;
  if (pool.length <= bigger.cityIds.length) return;
  for (const c of rankedPool(pool, bigger.vibe, intent)) {
    if (!bigger.cityIds.includes(c.id)) {
      bigger.cityIds = orderByCatalog([...bigger.cityIds, c.id]);
      return;
    }
  }
}

/** Sort a set of city ids into catalog order (which clusters by country). */
function orderByCatalog(ids: string[]): string[] {
  return [...ids].sort(
    (a, b) =>
      ADDABLE_CITIES.findIndex((x) => x.id === a) - ADDABLE_CITIES.findIndex((x) => x.id === b),
  );
}

/**
 * Order an adventure route to lead with its further-out / trek stops (highest
 * adventure rank first), then fill in catalog order. Gives adventure a visibly
 * different JOURNEY from classic even when a tight pool forces the same city set.
 */
function orderForAdventure(ids: string[], pool: AddableCity[], intent: TripIntent): string[] {
  const rank = new Map<string, number>();
  rankedPool(pool, 'adventure', intent).forEach((c, i) => rank.set(c.id, i));
  return [...ids].sort((a, b) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0));
}

/** True when two archetypes hold the exact same set of cities (order-independent). */
function sameRoute(a: TripArchetype, b: TripArchetype): boolean {
  if (a.cityIds.length !== b.cityIds.length) return false;
  const set = new Set(a.cityIds);
  return b.cityIds.every((id) => set.has(id));
}

/**
 * Draft exactly three distinct, curated-grounded trip archetypes for an intent.
 *
 * Returns archetypes in fixed vibe order — chill, classic, adventure — each an
 * ordered list of real {@link ADDABLE_CITIES} ids (length >= 2). The model only
 * selects ids and writes warm prose; everything it returns is validated, and a
 * deterministic rule-based picker guarantees three usable options even when the
 * model is unavailable or weak.
 *
 * Resolves to `null` only when the region pool holds fewer than two cities, or
 * when both `aiText` fails AND the fallback cannot assemble three archetypes.
 * Never throws.
 */
export async function draftArchetypes(intent: TripIntent): Promise<TripArchetype[] | null> {
  // 'any' (surprise me) resolves to one real continent so the route stays
  // coherent; the rest of the function works off this concrete region.
  const region = resolveRegion(intent.region);
  const effective: TripIntent = {
    ...intent,
    region,
    weeks: clampWeeks(intent.weeks),
  };
  const pool = poolFor(region);
  // Too thin to offer a meaningful "choose your trip" — bail cleanly.
  if (pool.length < 2) return null;

  const poolIds = new Set<string>(pool.map((c) => c.id));
  const weeks = effective.weeks;
  const key = intentKey(effective);

  let byVibe = new Map<TripVibe, RawArchetype>();
  try {
    const raw = await aiText(
      `arch:${key}`,
      SYSTEM,
      `Available cities: ${poolCatalog(pool)}\n\n` +
        `Trip: region=${region}, who=${effective.who}, budget=${effective.budget}, weeks=${weeks}.\n` +
        'Design the three options now.',
      460,
    );
    if (raw) {
      const arr = parseJsonArray(raw);
      if (arr) byVibe = indexByVibe(arr, poolIds);
    }
  } catch {
    // Swallow: the deterministic fallback below covers a failed proxy call.
    byVibe = new Map<TripVibe, RawArchetype>();
  }

  // assemble() works whether byVibe is full, partial, or empty — the rule-based
  // picker tops up every vibe to its shape target from the region pool.
  return assemble(byVibe, pool, effective);
}
