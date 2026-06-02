// free-proxy — a cached, CORS-enabled GET gateway for a tiny WHITELIST of free
// public data APIs.
//
// Why this exists: some genuinely free, no-key data sources are CORS-blocked
// from the browser (e.g. Nager.Date public holidays). Rather than wire each one
// up separately, the website POSTs the upstream URL here; this function fetches
// it server-side, caches the JSON in memory, and replies with CORS headers so
// the browser can read it. Frankfurter FX is CORS-open and may be called
// directly by the client, but is whitelisted here too for a uniform fallback.
//
// Security: ONLY the explicit host whitelist below is reachable. Any other URL
// (or a non-http(s) scheme) is rejected with 400 — this is not an open proxy.
//
// Deploy:  supabase functions deploy free-proxy --project-ref ltlholyrdtzegyeosqqz
//          No secrets required (all upstreams are keyless + free).
//
// Deno runtime — not part of the app's TypeScript build (tsconfig is src-only).

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

// Allowed upstream hosts. Exact host match only (no suffix tricks).
const ALLOWED_HOSTS = new Set<string>(['date.nager.at', 'api.frankfurter.app']);

// In-memory cache. Edge functions are short-lived, so this is a best-effort
// warm-instance cache: a hit serves free, a miss falls through to the upstream.
const TTL_MS = 12 * 60 * 60 * 1000; // 12h — within the asked 6–24h window
type CacheEntry = { body: unknown; expires: number };
const cache = new Map<string, CacheEntry>();

/** Validate the requested URL against the whitelist. Returns a parsed URL or null. */
function safeUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  if (!ALLOWED_HOSTS.has(parsed.hostname)) return null;
  return parsed;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method-not-allowed' }, 405);

  let payload: { url?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'bad-json' }, 400);
  }

  const target = safeUrl(payload.url);
  if (!target) return json({ error: 'url-not-allowed' }, 400);

  const key = target.toString();
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expires > now) {
    return json(hit.body);
  }

  try {
    const res = await fetch(key, { headers: { Accept: 'application/json' } });
    if (!res.ok) return json({ error: 'upstream-error', status: res.status }, 502);
    const data = await res.json();
    cache.set(key, { body: data, expires: now + TTL_MS });
    return json(data);
  } catch {
    return json({ error: 'fetch-failed' }, 502);
  }
});
