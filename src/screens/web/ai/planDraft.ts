/**
 * planDraft — seed an editable trip draft from a free-text brief.
 *
 * Given something like "two weeks across South America, beaches then mountains",
 * this returns an ORDERED list of city ids drawn ONLY from {@link ADDABLE_CITIES}.
 * The model picks and orders known cities; it never invents a place, and it
 * never emits dates, coordinates, nights, ratings, prices, or prose. The result
 * is a starting point the traveler then edits — it is NOT authoritative.
 *
 * Every path is graceful. If the proxy is unavailable, the reply is not a valid
 * JSON array, or no returned id matches a real city, this resolves to `null` and
 * the caller can fall back to manual city picking.
 *
 * Cache scheme: `plan:${normalizedBrief}` — the normalized (lowercased, single-
 * spaced) brief, so equivalent briefs share one cached draft forever.
 */

import { aiText } from '../groqApi';
import { ADDABLE_CITIES } from '../addableCities';

/** The legal city ids, as a fast lookup set, computed once at module load. */
const CITY_ID_SET = new Set<string>(ADDABLE_CITIES.map((c) => c.id));

/** A compact catalog (`id — name`) injected so the model only picks real ids. */
const CITY_CATALOG = ADDABLE_CITIES.map((c) => `${c.id} (${c.nameEn})`).join(', ');

const SYSTEM =
  'You draft a route for a trip planner by selecting from a fixed list of cities. ' +
  'You may ONLY use the city ids provided. Never invent a city or id. ' +
  'Reply with ONE JSON array of city id strings in travel order and nothing else, for example ["bangkok","hanoi"]. ' +
  'Pick only cities that fit the brief; order them sensibly. Include no duplicates. ' +
  'Do not output names, dates, coordinates, nights, ratings, prices, superlatives, commentary, or code fences. Do not use em dashes.';

/** Normalize a brief so equivalent phrasings collapse to one cache key. */
function normalizeBrief(brief: string): string {
  return brief.trim().toLowerCase().replace(/\s+/g, ' ');
}

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

/**
 * Draft an ordered route as a list of {@link ADDABLE_CITIES} ids.
 *
 * Every returned id is validated against the real city set; unknown ids are
 * dropped and duplicates collapse to first occurrence. Returns `null` when the
 * proxy is unavailable, the reply is not a JSON array, or no id is valid.
 */
export async function draftRoute(brief: string): Promise<string[] | null> {
  const normalized = normalizeBrief(brief);
  if (normalized.length === 0) return null;

  const raw = await aiText(
    `plan:${normalized}`,
    SYSTEM,
    `Available cities: ${CITY_CATALOG}\n\nBrief: ${normalized}`,
    220,
  );
  if (!raw) return null;

  const arr = parseJsonArray(raw);
  if (!arr) return null;

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const item of arr) {
    if (typeof item !== 'string') continue;
    const id = item.trim().toLowerCase();
    if (CITY_ID_SET.has(id) && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids.length > 0 ? ids : null;
}
