import { useEffect, useState } from 'react';
import { fetchWikiSummary } from './wikiApi';
import { wikiTitleFor } from './cityWikiTitles';

function unsplash(id: string, w: number): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}

export const CITY_PHOTOS: Record<string, string[]> = {
  buzios: [
    unsplash('1508272319511-badf90d1cf27', 600),
    unsplash('1461598198498-686a2c168484', 600),
    unsplash('1508272961731-dc692d634a79', 600),
  ],
  'sao-paulo': [
    unsplash('1551736947-ca1f44a894e2', 600),
    unsplash('1579996887346-e2990cd8e033', 600),
    unsplash('1561592390-42c07289e9cb', 600),
  ],
  jericoacoara: [
    unsplash('1641517827875-2bb2f73339d4', 600),
    unsplash('1661692612848-37801f680815', 600),
    unsplash('1636651746051-d8dfe189d618', 600),
  ],
  'buenos-aires': [
    unsplash('1616959313137-186688889054', 600),
    unsplash('1537157377554-6ca66509503a', 600),
    unsplash('1525121970541-215e0e301bc2', 600),
  ],
  'punta-del-este': [
    unsplash('1764066531610-5457f1bc5419', 600),
    unsplash('1653918488348-17d2a707012f', 600),
    unsplash('1653898968886-a14171069047', 600),
  ],
  'rio-de-janeiro': [
    unsplash('1518639192441-8fce0a366e2e', 600),
    unsplash('1539053447282-6f32f2bddfed', 600),
    unsplash('1516306580123-e6e52b1b7b5f', 600),
  ],
  'foz-do-iguacu': [
    unsplash('1657386363865-f30779784410', 600),
    unsplash('1656615832862-c48d4eead43d', 600),
    unsplash('1656856747603-1777348793e6', 600),
  ],
  mendoza: [
    unsplash('1618100789816-86508e3f2275', 600),
    unsplash('1546863340-7e4e97e46f42', 600),
    unsplash('1690993444739-c75bef705568', 600),
  ],
};

export function cityPhotos(stopId: string): string[] {
  return CITY_PHOTOS[stopId] ?? [];
}

/**
 * Resolved Wikipedia-photo cache, keyed by stopId. Survives remounts so each
 * launch city fetches its lead image exactly once across the whole app.
 */
const wikiPhotoCache = new Map<string, string[]>();
/** In-flight requests, keyed by stopId, so concurrent consumers de-dupe. */
const wikiPhotoInflight = new Map<string, Promise<string[]>>();

/**
 * Resolve whether an image URL actually loads in the browser. Mirrors exactly
 * what an `<img>` does, so a URL that passes here is guaranteed renderable.
 * Wikimedia serves rescaled `/thumb/…` derivatives reliably but rate-limits
 * (HTTP 429) direct hits to original-resolution files — this lets us keep the
 * crisp original when it works and gracefully fall back when it doesn't.
 */
function loadable(url: string): Promise<boolean> {
  if (typeof Image === 'undefined') return Promise.resolve(true);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Resolve a city's Wikipedia lead image. Prefers the full original; falls back
 * to the thumbnail when the original won't load (e.g. a Wikimedia 429 on the
 * original-resolution file). Resilient: a null summary, no image, or a network
 * failure resolves to an empty array — never throws — and the empty result is
 * intentionally NOT cached so a transient failure can retry on a later mount.
 */
function resolveWikiPhotos(stopId: string, cityName: string): Promise<string[]> {
  const cached = wikiPhotoCache.get(stopId);
  if (cached) return Promise.resolve(cached);
  const inflight = wikiPhotoInflight.get(stopId);
  if (inflight) return inflight;

  const title = wikiTitleFor(stopId, cityName);
  const request = fetchWikiSummary(title)
    .then(async (summary) => {
      const original = summary?.originalImage;
      const thumbnail = summary?.thumbnail;
      let image: string | undefined;
      if (original && (await loadable(original))) image = original;
      else if (thumbnail && (await loadable(thumbnail))) image = thumbnail;
      else image = original ?? thumbnail; // last resort: let the <img> try
      const photos = image ? [image] : [];
      if (photos.length > 0) wikiPhotoCache.set(stopId, photos);
      return photos;
    })
    .catch(() => [])
    .finally(() => {
      wikiPhotoInflight.delete(stopId);
    });

  wikiPhotoInflight.set(stopId, request);
  return request;
}

/**
 * City photos for a planned stop. Curated Unsplash sets (the 8 South-America
 * cities) return immediately and unchanged — no fetch, no flicker. Every other
 * city resolves its hero image from Wikipedia on mount, returning `[]` until the
 * image is ready (consumers already render a placeholder for the empty case).
 */
export function useCityPhotos(stopId: string, cityName: string): string[] {
  const curated = CITY_PHOTOS[stopId];
  const [photos, setPhotos] = useState<string[]>(
    () => curated ?? wikiPhotoCache.get(stopId) ?? [],
  );

  useEffect(() => {
    if (CITY_PHOTOS[stopId]) {
      setPhotos(CITY_PHOTOS[stopId]);
      return;
    }
    const cached = wikiPhotoCache.get(stopId);
    if (cached) {
      setPhotos(cached);
      return;
    }
    let active = true;
    setPhotos([]);
    resolveWikiPhotos(stopId, cityName).then((resolved) => {
      if (active) setPhotos(resolved);
    });
    return () => {
      active = false;
    };
  }, [stopId, cityName]);

  return photos;
}
