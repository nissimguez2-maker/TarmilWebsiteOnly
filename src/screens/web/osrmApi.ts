import { fetchGeoapifyRoute } from './geoapifyRouting';

export type DrivingRoute = {
  minutes: number;
  km: number;
};

const cache = new Map<string, Promise<DrivingRoute | null>>();

export function fetchDrivingRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<DrivingRoute | null> {
  const key = `${fromLat.toFixed(3)},${fromLng.toFixed(3)};${toLat.toFixed(3)},${toLng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doFetch(fromLat, fromLng, toLat, toLng);
  cache.set(key, promise);
  promise.catch(() => cache.delete(key));
  return promise;
}

export async function fetchDrivingMinutes(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<number | null> {
  const route = await fetchDrivingRoute(fromLat, fromLng, toLat, toLng);
  return route?.minutes ?? null;
}

async function doFetch(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<DrivingRoute | null> {
  // Real road routing when a Geoapify key is configured (origin-locked, free
  // tier); otherwise the public OSRM attempt, then a straight-line estimate.
  const geo = await fetchGeoapifyRoute(fromLat, fromLng, toLat, toLng);
  if (geo) return geo;
  const live = await fetchOsrm(fromLat, fromLng, toLat, toLng);
  if (live) return live;
  // OSRM's public demo server is CORS-blocked from the browser AND ToS-restricted
  // for production, so cross-origin calls effectively always fail. Until a real
  // routing provider is wired (a server-side proxy or paid API — a cost call),
  // fall back to a straight-line estimate for plausibly-drivable legs so the
  // drive-time still renders; intercontinental legs (> ~1500 km) stay null.
  return estimateRoute(fromLat, fromLng, toLat, toLng);
}

async function fetchOsrm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<DrivingRoute | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false&alternatives=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (
      data?.code !== 'Ok' ||
      !Array.isArray(data.routes) ||
      data.routes.length === 0
    ) {
      return null;
    }
    const seconds = data.routes[0].duration;
    const meters = data.routes[0].distance;
    if (
      typeof seconds !== 'number' ||
      seconds <= 0 ||
      typeof meters !== 'number' ||
      meters <= 0
    ) {
      return null;
    }
    return {
      minutes: Math.round(seconds / 60),
      km: Math.round(meters / 1000),
    };
  } catch {
    return null;
  }
}

/** Straight-line drive estimate — the resilient fallback when live routing is
 *  unavailable. Bounded to plausibly-drivable legs so ocean/flight legs stay
 *  null rather than showing an absurd "drive". */
function estimateRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): DrivingRoute | null {
  const straightKm = haversineKm(fromLat, fromLng, toLat, toLng);
  if (!(straightKm > 0) || straightKm > 1500) return null;
  const km = Math.round(straightKm * 1.3); // road-winding factor over straight line
  const minutes = Math.round((km / 75) * 60); // ~75 km/h intercity average
  return { minutes, km };
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDriveDuration(minutes: number): string {
  if (minutes < 90) return `~${Math.round(minutes)}m drive`;
  const hours = minutes / 60;
  if (hours < 24) return `~${Math.round(hours)}h drive`;
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours - days * 24);
  return remHours > 0
    ? `~${days}d ${remHours}h drive`
    : `~${days}d drive`;
}

export function formatDriveKm(km: number): string {
  if (km < 100) return `${km} km`;
  return `${km.toLocaleString('en-US')} km`;
}
