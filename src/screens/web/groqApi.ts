import { supabase } from '../../lib/supabaseClient';

/**
 * Client for the server-side AI proxy (the `ai-proxy` Edge Function). The Groq
 * key lives ONLY on the server — this module never ships it or sees it. Two
 * local cache layers keep it cheap: an in-memory promise map (de-dupes
 * concurrent calls) and a localStorage layer (instant repeats on one device).
 * The Edge Function adds the shared cross-user cache + the per-IP/day spend cap.
 *
 * Every path is graceful: no backend, no key, an error, or the daily cap all
 * resolve to `null`, and callers fall back to the raw source text — the AI is a
 * garnish on a working surface, never load-bearing.
 */

const mem = new Map<string, Promise<string | null>>();
const PERSIST_PREFIX = 'tarmil:groq:';

function persistGet(cacheKey: string): string | null {
  try {
    return localStorage.getItem(PERSIST_PREFIX + cacheKey);
  } catch {
    return null;
  }
}

function persistSet(cacheKey: string, value: string): void {
  try {
    localStorage.setItem(PERSIST_PREFIX + cacheKey, value);
  } catch {
    // ignore quota errors
  }
}

/**
 * Run a cached AI text generation through the server-side proxy. `cacheKey`
 * must be deterministic for the input, so a given input is generated once and
 * then served from cache (locally and cross-user) forever.
 */
export async function aiText(
  cacheKey: string,
  system: string,
  user: string,
  maxTokens = 400,
): Promise<string | null> {
  const persisted = persistGet(cacheKey);
  if (persisted) return persisted;

  const memHit = mem.get(cacheKey);
  if (memHit) return memHit;

  if (!supabase) return null; // no backend configured → graceful fallback

  const promise = invokeProxy(cacheKey, system, user, maxTokens).then((text) => {
    if (text) persistSet(cacheKey, text);
    return text;
  });
  mem.set(cacheKey, promise);
  promise.catch(() => mem.delete(cacheKey));
  return promise;
}

async function invokeProxy(
  cacheKey: string,
  system: string,
  user: string,
  maxTokens: number,
): Promise<string | null> {
  try {
    const { data, error } = await supabase!.functions.invoke('ai-proxy', {
      body: { cacheKey, system, user, maxTokens },
    });
    if (error) return null;
    const text = (data as { text?: unknown } | null)?.text;
    return typeof text === 'string' && text.trim().length > 0 ? text.trim() : null;
  } catch {
    return null;
  }
}

const INTRO_SYSTEM =
  'You are a travel editor for a curated trip-planning app. Rewrite city descriptions so they read like editorial travel intros, not encyclopedia entries. Lead with what a traveler does there, the neighborhoods that matter, and the texture of daily life. Skip population figures, founding dates, area in km², and dry geographic facts. Active voice. Sentence cap 20 words. Four sentences maximum. Do not mention sources. Do not use em dashes. Do not start with the city name.';

/**
 * Rewrite a raw (Wikipedia) city paragraph into a warm editorial intro. Returns
 * `null` when the proxy is unavailable, so the caller keeps the raw text.
 */
export async function rewriteAsTravelIntro(
  cityName: string,
  rawText: string,
): Promise<string | null> {
  if (!rawText || rawText.length < 40) return null;
  return aiText(
    `intro:${cityName.toLowerCase()}`,
    INTRO_SYSTEM,
    `City: ${cityName}\n\nSource paragraph (rewrite this):\n${rawText}`,
  );
}
