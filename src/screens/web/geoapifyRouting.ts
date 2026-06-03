import { supabase } from '../../lib/supabaseClient';

/**
 * Geoapify driving-route client — calls the server-side `geoapify-route` Edge
 * Function, which holds the Geoapify key. The key is NEVER shipped to the
 * browser. When there is no Supabase backend, or the function returns no route,
 * this resolves to `null` so the caller falls back to its own estimate.
 *
 * Mirrors the in-memory cache + graceful-null pattern of the other clients.
 */

export type DriveRoute = {
  /** Estimated driving time, rounded to whole minutes. */
  minutes: number;
  /** Estimated driving distance, rounded to whole kilometres. */
  km: number;
};

const cache = new Map<string, Promise<DriveRoute | null>>();

function round3(n: number): string {
  return n.toFixed(3);
}

/**
 * Fetch a driving route between two coordinates via the server-side proxy.
 * Returns `null` when no backend is configured or no route comes back.
 */
export function fetchGeoapifyRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<DriveRoute | null> {
  if (!supabase) return Promise.resolve(null);

  const key = `${round3(fromLat)},${round3(fromLng)}>${round3(toLat)},${round3(toLng)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = invoke(fromLat, fromLng, toLat, toLng);
  cache.set(key, promise);
  // Drop nulls so a transient failure can retry later.
  promise.then((r) => {
    if (r === null) cache.delete(key);
  });
  promise.catch(() => cache.delete(key));
  return promise;
}

async function invoke(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<DriveRoute | null> {
  try {
    const { data, error } = await supabase!.functions.invoke('geoapify-route', {
      body: { fromLat, fromLng, toLat, toLng },
    });
    if (error) return null;
    const d = data as { minutes?: unknown; km?: unknown } | null;
    const minutes = d?.minutes;
    const km = d?.km;
    return typeof minutes === 'number' &&
      minutes > 0 &&
      typeof km === 'number' &&
      km > 0
      ? { minutes, km }
      : null;
  } catch {
    return null;
  }
}
