/**
 * nlSearch — natural-language search PARAMETERIZER.
 *
 * Turns a free-text query like "cheap hostel near the beach in rio" into a
 * structured {@link SearchFilters} the caller can feed to its own keyword /
 * place search. The model ONLY parameterizes intent: it picks a known category,
 * pulls out keywords, and guesses a city hint. It never invents places,
 * ratings, prices, or results — those come from the caller's real data.
 *
 * Every path is graceful. If the proxy is unavailable, or the model returns
 * something that is not valid JSON in the expected shape, this resolves to
 * `null` and the caller falls back to plain keyword search.
 *
 * Cache scheme: `nlq:${normalizedQuery}` — the normalized (lowercased, single-
 * spaced) query, so equivalent phrasings share one cached parse forever.
 */

import { aiText } from '../groqApi';
import type { PlaceCategory } from '../../../data/places';

/** Structured search intent parsed from a free-text query. */
export type SearchFilters = {
  /** A known place category, only when the model maps cleanly to one. */
  category?: PlaceCategory;
  /** Free keywords to match against place name / description. Always present. */
  keywords: string[];
  /** A loose city name the query mentions, for the caller to resolve. */
  cityHint?: string;
};

/** The closed set of categories the model may choose. Anything else is dropped. */
const PLACE_CATEGORIES: readonly PlaceCategory[] = [
  'beach',
  'hostel',
  'cafe',
  'restaurant',
  'bar',
  'club',
  'chabad',
  'kosher',
  'synagogue',
  'mikveh',
  'landmark',
];

const CATEGORY_SET = new Set<string>(PLACE_CATEGORIES);

const SYSTEM =
  'You parse a traveler search query into structured filters for a trip planner. ' +
  'You only classify intent. You never invent places, results, ratings, review counts, prices, or superlatives like "best" or "top". ' +
  `Reply with ONE JSON object and nothing else: {"category": string|null, "keywords": string[], "cityHint": string|null}. ` +
  `"category" must be one of: ${PLACE_CATEGORIES.join(', ')}, or null if none fits. ` +
  '"keywords" is 1 to 5 short lowercase terms drawn from the query (no filler words). ' +
  '"cityHint" is a city name the query mentions, or null. ' +
  'Do not add commentary, code fences, or extra keys. Do not use em dashes.';

/** Normalize a query so equivalent phrasings collapse to one cache key. */
function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Pull a JSON object out of a model reply that may be wrapped in prose or code
 * fences. Returns the parsed value, or `null` when nothing parses. Never throws.
 */
function parseJsonObject(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Coerce an unknown into a clean string, or undefined when it is not usable. */
function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Build a deduped keyword list of short lowercase terms (max 5). */
function cleanKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const term = item.trim().toLowerCase();
    if (term.length === 0 || term.length > 40 || seen.has(term)) continue;
    seen.add(term);
    out.push(term);
    if (out.length >= 5) break;
  }
  return out;
}

/**
 * Parse a free-text search query into structured {@link SearchFilters}.
 *
 * Returns `null` when the AI proxy is unavailable or the reply is not valid
 * JSON in the expected shape, so the caller can fall back to keyword search.
 */
export async function parseSearchQuery(query: string): Promise<SearchFilters | null> {
  const normalized = normalizeQuery(query);
  if (normalized.length === 0) return null;

  const raw = await aiText(`nlq:${normalized}`, SYSTEM, `Query: ${normalized}`, 160);
  if (!raw) return null;

  const obj = parseJsonObject(raw);
  if (!obj) return null;

  const keywords = cleanKeywords(obj.keywords);

  const rawCategory = cleanString(obj.category)?.toLowerCase();
  const category =
    rawCategory && CATEGORY_SET.has(rawCategory)
      ? (rawCategory as PlaceCategory)
      : undefined;

  const cityHint = cleanString(obj.cityHint);

  // A parse with neither keywords, a category, nor a city hint is useless —
  // treat it as a failed parse so the caller falls back to keyword search.
  if (keywords.length === 0 && !category && !cityHint) return null;

  const filters: SearchFilters = { keywords };
  if (category) filters.category = category;
  if (cityHint) filters.cityHint = cityHint;
  return filters;
}
