/**
 * Local-time-by-coordinate client.
 *
 * Source: timeapi.io (keyless, CORS-open `Access-Control-Allow-Origin: *`,
 * verified responding). Resolves the IANA time zone and current wall-clock
 * time for a coordinate.
 *
 * Mirrors the in-memory cache + graceful-null pattern used by `weatherApi.ts`:
 * a failed fetch or empty payload resolves to `null` and never throws. The
 * cache is keyed by coordinate only; the in-memory map is short-lived per
 * page session, so a brief staleness on the wall-clock time is acceptable.
 */

export type LocalTime = {
  /** Current local time, `HH:mm` (e.g. `22:19`). */
  time: string;
  /** Local date, `MM/DD/YYYY` as returned by the API (e.g. `06/02/2026`). */
  date: string;
  /** IANA time-zone identifier (e.g. `Europe/Paris`). */
  timeZone: string;
  /** Whether daylight saving time is currently active. */
  dstActive: boolean;
};

const cache = new Map<string, Promise<LocalTime | null>>();

function round3(n: number): string {
  return n.toFixed(3);
}

/**
 * Fetch the current local time for a coordinate.
 *
 * @param lat Latitude in decimal degrees.
 * @param lng Longitude in decimal degrees.
 * @returns The local time, or `null` if the request fails or returns no data.
 */
export function fetchLocalTime(
  lat: number,
  lng: number,
): Promise<LocalTime | null> {
  const key = `${round3(lat)}:${round3(lng)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doFetch(lat, lng);
  cache.set(key, promise);
  promise.catch(() => cache.delete(key));
  return promise;
}

async function doFetch(lat: number, lng: number): Promise<LocalTime | null> {
  const url =
    `https://timeapi.io/api/time/current/coordinate` +
    `?latitude=${lat}&longitude=${lng}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (
      !data ||
      typeof data.time !== 'string' ||
      typeof data.date !== 'string' ||
      typeof data.timeZone !== 'string' ||
      typeof data.dstActive !== 'boolean'
    ) {
      return null;
    }
    return {
      time: data.time,
      date: data.date,
      timeZone: data.timeZone,
      dstActive: data.dstActive,
    };
  } catch {
    return null;
  }
}
