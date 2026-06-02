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
