export type WikiSummary = {
  title: string;
  extract: string;
  thumbnail?: string;
  originalImage?: string;
};

const cache = new Map<string, Promise<WikiSummary | null>>();

export function fetchWikiSummary(title: string): Promise<WikiSummary | null> {
  if (!title) return Promise.resolve(null);
  const key = title.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doFetch(title);
  cache.set(key, promise);
  promise.then((r) => {
    if (r === null) cache.delete(key);
  });
  return promise;
}

async function doFetch(title: string): Promise<WikiSummary | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.extract) return null;
    return {
      title: data.title ?? title,
      extract: data.extract,
      thumbnail: data.thumbnail?.source,
      originalImage: data.originalimage?.source,
    };
  } catch {
    return null;
  }
}
