export type NominatimResult = {
  displayName: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
};

const cache = new Map<string, Promise<NominatimResult[]>>();

export function searchNominatim(query: string): Promise<NominatimResult[]> {
  const q = query.trim();
  if (q.length < 2) return Promise.resolve([]);
  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doSearch(q);
  cache.set(key, promise);
  promise.catch(() => cache.delete(key));
  return promise;
}

async function doSearch(query: string): Promise<NominatimResult[]> {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '8');
    url.searchParams.set('accept-language', 'en');
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((row) => row.lat && row.lon && row.display_name)
      .map(
        (row): NominatimResult => ({
          displayName: row.display_name,
          name: row.name ?? row.display_name.split(',')[0]?.trim() ?? row.display_name,
          country: row.address?.country ?? '',
          countryCode: (row.address?.country_code ?? '').toUpperCase(),
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lon),
        }),
      );
  } catch {
    return [];
  }
}
