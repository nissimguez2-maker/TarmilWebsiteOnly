/**
 * Sunrise / sunset client.
 *
 * Source: sunrise-sunset.org (keyless, CORS-open `Access-Control-Allow-Origin: *`,
 * verified responding). Returns ISO-8601 UTC times and a day length in seconds.
 *
 * Mirrors the in-memory cache + graceful-null pattern used by `weatherApi.ts`:
 * a failed fetch or empty payload resolves to `null` and never throws.
 */

export type SunTimes = {
  /** Sunrise as an ISO-8601 UTC timestamp (e.g. `2026-06-02T03:48:52+00:00`). */
  sunrise: string;
  /** Sunset as an ISO-8601 UTC timestamp. */
  sunset: string;
  /** Length of the day in seconds. */
  dayLengthSec: number;
};

const cache = new Map<string, Promise<SunTimes | null>>();

function round3(n: number): string {
  return n.toFixed(3);
}

/**
 * Fetch sunrise / sunset for a coordinate.
 *
 * @param lat Latitude in decimal degrees.
 * @param lng Longitude in decimal degrees.
 * @param dateISO Optional `YYYY-MM-DD`; defaults to `today`.
 * @returns The sun times, or `null` if the request fails or returns no data.
 */
export function fetchSun(
  lat: number,
  lng: number,
  dateISO?: string,
): Promise<SunTimes | null> {
  const date = dateISO ?? 'today';
  const key = `${round3(lat)}:${round3(lng)}:${date}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doFetch(lat, lng, date);
  cache.set(key, promise);
  promise.catch(() => cache.delete(key));
  return promise;
}

async function doFetch(
  lat: number,
  lng: number,
  date: string,
): Promise<SunTimes | null> {
  const url =
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}` +
    `&date=${encodeURIComponent(date)}&formatted=0`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results = data?.results;
    if (
      data?.status !== 'OK' ||
      !results ||
      typeof results.sunrise !== 'string' ||
      typeof results.sunset !== 'string' ||
      typeof results.day_length !== 'number'
    ) {
      return null;
    }
    return {
      sunrise: results.sunrise,
      sunset: results.sunset,
      dayLengthSec: results.day_length,
    };
  } catch {
    return null;
  }
}
