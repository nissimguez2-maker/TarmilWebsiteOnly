export type OsmPlace = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  cuisine?: string;
  website?: string;
  distanceMeters: number;
};

export type OsmCategory =
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'club'
  | 'landmark'
  | 'beach';

const TAG_QUERY: Record<OsmCategory, string> = {
  restaurant: 'node["amenity"="restaurant"]',
  cafe: 'node["amenity"="cafe"]',
  bar: 'node["amenity"="bar"]',
  club: 'node["amenity"="nightclub"]',
  landmark: '(node["tourism"="attraction"];node["tourism"="viewpoint"];node["historic"~"."];)',
  beach: 'node["natural"="beach"]',
};

const cache = new Map<string, Promise<OsmPlace[]>>();

export function fetchNearby(
  category: OsmCategory,
  lat: number,
  lng: number,
  radiusMeters = 2000,
  limit = 12,
): Promise<OsmPlace[]> {
  const key = `${category}|${lat.toFixed(3)}|${lng.toFixed(3)}|${radiusMeters}|${limit}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doFetch(category, lat, lng, radiusMeters, limit);
  cache.set(key, promise);
  promise.catch(() => cache.delete(key));
  return promise;
}

async function doFetch(
  category: OsmCategory,
  lat: number,
  lng: number,
  radiusMeters: number,
  limit: number,
): Promise<OsmPlace[]> {
  const base = TAG_QUERY[category];
  const query =
    category === 'landmark'
      ? `[out:json][timeout:15];(node["tourism"="attraction"](around:${radiusMeters},${lat},${lng});node["tourism"="viewpoint"](around:${radiusMeters},${lat},${lng}););out body ${limit};`
      : `[out:json][timeout:15];${base}(around:${radiusMeters},${lat},${lng});out body ${limit};`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];
    return elements
      .filter((el: any) => el.tags?.name && el.lat && el.lon)
      .map((el: any): OsmPlace => ({
        id: el.id,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
        cuisine: el.tags.cuisine,
        website: el.tags.website,
        distanceMeters: haversineMeters(lat, lng, el.lat, el.lon),
      }))
      .sort((a: OsmPlace, b: OsmPlace) => a.distanceMeters - b.distanceMeters)
      .slice(0, limit);
  } catch {
    return [];
  }
}

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
