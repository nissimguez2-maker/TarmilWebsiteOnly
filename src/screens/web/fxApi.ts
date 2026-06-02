import { supabase } from '../../lib/supabaseClient';

/**
 * Foreign-exchange helper. Returns the latest rate to convert one unit of
 * `base` into `quote`, from Frankfurter (ECB reference rates, free + keyless +
 * CORS-open). Frankfurter is reached directly from the browser; if that throws
 * (e.g. a CORS/network hiccup), it falls back to the server-side `free-proxy`.
 *
 * Every path is graceful: an unknown currency, a network error, or no backend
 * for the fallback all resolve to `null`. The rate is a convenience hint
 * ("≈ what your money is worth there"), never load-bearing — and it is an
 * indicative reference rate, not a transactable price.
 *
 * Caching: an in-memory promise map keyed by `${base}:${quote}` de-dupes
 * concurrent calls and serves instant repeats within a session.
 */

const FRANKFURTER_LATEST = 'https://api.frankfurter.app/latest';

const cache = new Map<string, Promise<number | null>>();

/**
 * Latest exchange rate: how many units of `quote` equal one unit of `base`.
 * Both are ISO 4217 codes (e.g. `USD`, `BRL`). `base === quote` returns `1`.
 * Returns `null` on any failure — callers must tolerate a missing rate.
 */
export function fetchFxRate(base: string, quote: string): Promise<number | null> {
  const from = (base ?? '').trim().toUpperCase();
  const to = (quote ?? '').trim().toUpperCase();
  if (!from || !to) return Promise.resolve(null);
  if (from === to) return Promise.resolve(1);

  const key = `${from}:${to}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const promise = doFetch(from, to);
  cache.set(key, promise);
  // Drop nulls so a transient failure can be retried later.
  promise.then((rate) => {
    if (rate === null) cache.delete(key);
  });
  promise.catch(() => cache.delete(key));
  return promise;
}

async function doFetch(from: string, to: string): Promise<number | null> {
  const url = `${FRANKFURTER_LATEST}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

  // 1) Direct call — Frankfurter is CORS-open.
  const direct = await fetchDirect(url, to);
  if (direct !== null) return direct;

  // 2) Fallback through the server-side proxy if the direct call failed.
  return fetchViaProxy(url, to);
}

async function fetchDirect(url: string, to: string): Promise<number | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return extractRate(await res.json(), to);
  } catch {
    return null;
  }
}

async function fetchViaProxy(url: string, to: string): Promise<number | null> {
  if (!supabase) return null; // no backend for the fallback → graceful null
  try {
    const { data, error } = await supabase.functions.invoke('free-proxy', {
      body: { url },
    });
    if (error) return null;
    return extractRate(data, to);
  } catch {
    return null;
  }
}

/** Pull `rates[to]` out of a Frankfurter `/latest` payload, validating shape. */
function extractRate(payload: unknown, to: string): number | null {
  if (!payload || typeof payload !== 'object') return null;
  const rates = (payload as { rates?: unknown }).rates;
  if (!rates || typeof rates !== 'object') return null;
  const rate = (rates as Record<string, unknown>)[to];
  return typeof rate === 'number' && Number.isFinite(rate) && rate > 0 ? rate : null;
}
