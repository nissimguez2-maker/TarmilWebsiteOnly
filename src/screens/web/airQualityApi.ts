/**
 * Air-quality client.
 *
 * Source: air-quality-api.open-meteo.com (keyless, CORS-open
 * `Access-Control-Allow-Origin: *`, verified responding). Reads the current
 * European AQI, US AQI, and PM2.5 for a coordinate.
 *
 * Mirrors the in-memory cache + graceful-null pattern used by `weatherApi.ts`:
 * a failed fetch or empty payload resolves to `null` and never throws.
 */

export type AirQuality = {
  /** European AQI (0–100+), or `null` if unavailable. */
  euAqi: number | null;
  /** US AQI (0–500), or `null` if unavailable. */
  usAqi: number | null;
  /** PM2.5 concentration in μg/m³, or `null` if unavailable. */
  pm25: number | null;
};

const cache = new Map<string, Promise<AirQuality | null>>();

function round2(n: number): string {
  return n.toFixed(2);
}

/** Coerce an API value to a finite number, else `null`. */
function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Fetch the current air quality for a coordinate.
 *
 * @param lat Latitude in decimal degrees.
 * @param lng Longitude in decimal degrees.
 * @returns The air quality, or `null` if the request fails or returns no data.
 */
export function fetchAirQuality(
  lat: number,
  lng: number,
): Promise<AirQuality | null> {
  const key = `${round2(lat)}:${round2(lng)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doFetch(lat, lng);
  cache.set(key, promise);
  promise.catch(() => cache.delete(key));
  return promise;
}

async function doFetch(lat: number, lng: number): Promise<AirQuality | null> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=european_aqi,us_aqi,pm2_5`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const current = data?.current;
    if (!current) return null;
    return {
      euAqi: num(current.european_aqi),
      usAqi: num(current.us_aqi),
      pm25: num(current.pm2_5),
    };
  } catch {
    return null;
  }
}

/**
 * Map a European AQI value to a plain English band label.
 *
 * Bands: good (≤20), fair (≤40), moderate (≤60), poor (≤80),
 * very poor (≤100), extremely poor (>100).
 *
 * @param euAqi The European AQI value, or `null`.
 * @returns The band label, or `null` if no value is given.
 */
export function aqiLabel(euAqi: number | null): string | null {
  if (euAqi === null) return null;
  if (euAqi <= 20) return 'good';
  if (euAqi <= 40) return 'fair';
  if (euAqi <= 60) return 'moderate';
  if (euAqi <= 80) return 'poor';
  if (euAqi <= 100) return 'very poor';
  return 'extremely poor';
}
