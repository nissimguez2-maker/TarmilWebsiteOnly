export type CountryInfo = {
  flag: string;
  currencyCode: string;
  currencyName: string;
  language: string;
  timezone: string;
  /** International dialing code, e.g. "+66". Empty when unknown. */
  callingCode: string;
  /** Driving side: "left" | "right" (empty when unknown). */
  drivingSide: string;
};

const cache = new Map<string, Promise<CountryInfo | null>>();

export function fetchCountry(code2: string): Promise<CountryInfo | null> {
  const key = (code2 ?? '').toUpperCase();
  if (!key) return Promise.resolve(null);
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doFetch(key);
  cache.set(key, promise);
  promise.then((r) => {
    if (r === null) cache.delete(key);
  });
  return promise;
}

async function doFetch(code2: string): Promise<CountryInfo | null> {
  try {
    const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(code2)}?fields=flag,currencies,languages,timezones,idd,car`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    const currencies = row.currencies ?? {};
    const currencyCode = Object.keys(currencies)[0] ?? '';
    const currencyName = currencyCode ? (currencies[currencyCode]?.name ?? '') : '';
    const languages = row.languages ?? {};
    const language = (Object.values(languages)[0] as string) ?? '';
    const timezones = row.timezones ?? [];
    const timezone = (timezones[0] ?? '').replace('UTC', '').trim() || 'UTC';
    const idd = row.idd ?? {};
    const suffixes = Array.isArray(idd.suffixes) ? idd.suffixes : [];
    const callingCode =
      idd.root && suffixes.length === 1
        ? `${idd.root}${suffixes[0]}`
        : (idd.root ?? '');
    const drivingSide = row.car?.side ?? '';
    return {
      flag: row.flag ?? '',
      currencyCode,
      currencyName,
      language,
      timezone,
      callingCode,
      drivingSide,
    };
  } catch {
    return null;
  }
}
