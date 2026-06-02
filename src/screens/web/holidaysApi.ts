import { supabase } from '../../lib/supabaseClient';

/**
 * Public-holidays helper. Fetches a country's public holidays for a year from
 * Nager.Date THROUGH the server-side `free-proxy` Edge Function — Nager.Date is
 * CORS-blocked from the browser, so the proxy fetches it and adds CORS headers.
 *
 * Every path is graceful: no Supabase client, a proxy error, a malformed
 * payload, or a missing country code all resolve to `[]`. Holidays are a
 * value-add hint on the itinerary (e.g. "a public holiday falls in your stay"),
 * never load-bearing — the planner works fine without them.
 *
 * Caching: an in-memory promise map keyed by `${countryCode}:${year}` de-dupes
 * concurrent calls and serves instant repeats within a session.
 */

export type Holiday = {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  /** Holiday name in the country's local language. */
  localName: string;
  /** Holiday name in English. */
  name: string;
};

const NAGER_BASE = 'https://date.nager.at/api/v3/PublicHolidays';

const cache = new Map<string, Promise<Holiday[]>>();

/**
 * Public holidays for a country + year. `countryCode` is an ISO 3166-1 alpha-2
 * code (e.g. `BR`, `IL`). Returns `[]` on any failure or when the backend is
 * unavailable — callers must tolerate an empty list.
 */
export function fetchPublicHolidays(
  countryCode: string,
  year: number,
): Promise<Holiday[]> {
  const cc = (countryCode ?? '').trim().toUpperCase();
  if (!cc || !Number.isFinite(year)) return Promise.resolve([]);

  const key = `${cc}:${year}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const promise = doFetch(cc, Math.trunc(year));
  cache.set(key, promise);
  // Drop empty results so a transient failure can be retried later.
  promise.then((list) => {
    if (list.length === 0) cache.delete(key);
  });
  promise.catch(() => cache.delete(key));
  return promise;
}

async function doFetch(cc: string, year: number): Promise<Holiday[]> {
  if (!supabase) return []; // no backend configured → graceful fallback

  const url = `${NAGER_BASE}/${year}/${encodeURIComponent(cc)}`;
  try {
    const { data, error } = await supabase.functions.invoke('free-proxy', {
      body: { url },
    });
    if (error) return [];
    if (!Array.isArray(data)) return [];
    return data
      .map(normalizeHoliday)
      .filter((h): h is Holiday => h !== null);
  } catch {
    return [];
  }
}

function normalizeHoliday(row: unknown): Holiday | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const date = typeof r.date === 'string' ? r.date : '';
  if (!date) return null;
  const name = typeof r.name === 'string' ? r.name : '';
  const localName = typeof r.localName === 'string' ? r.localName : name;
  return { date, localName, name: name || localName };
}

/**
 * Filter a holiday list to those that fall within `[startISO, endISO]`
 * inclusive (both `YYYY-MM-DD`). Comparison is lexical, which is correct for
 * zero-padded ISO dates. Returns `[]` for an empty or invalid range.
 */
export function holidaysInRange(
  list: Holiday[],
  startISO: string,
  endISO: string,
): Holiday[] {
  if (!Array.isArray(list) || list.length === 0) return [];
  if (!startISO || !endISO) return [];
  const lo = startISO <= endISO ? startISO : endISO;
  const hi = startISO <= endISO ? endISO : startISO;
  return list.filter((h) => h.date >= lo && h.date <= hi);
}
