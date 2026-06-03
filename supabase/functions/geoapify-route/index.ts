// geoapify-route — server-side drive routing via Geoapify.
//
// The Geoapify key is held SERVER-side (Supabase secret `GEOAPIFY_KEY`, or a
// deploy-time fallback set by the founder) — never in the browser bundle or git.
// POST { fromLat, fromLng, toLat, toLng } -> { minutes, km } | { minutes: null }.
// Graceful: no key, or any upstream failure, returns { minutes: null } so the
// client falls back to its straight-line estimate.
//
// Deploy:  supabase functions deploy geoapify-route
// Secret:  supabase secrets set GEOAPIFY_KEY=...   (route-planning key; free tier)
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

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ minutes: null }, 405);

  let p: { fromLat?: number; fromLng?: number; toLat?: number; toLng?: number };
  try {
    p = await req.json();
  } catch {
    return json({ minutes: null }, 400);
  }
  const fromLat = num(p.fromLat);
  const fromLng = num(p.fromLng);
  const toLat = num(p.toLat);
  const toLng = num(p.toLng);
  if (fromLat === null || fromLng === null || toLat === null || toLng === null) {
    return json({ minutes: null }, 400);
  }

  const key = Deno.env.get('GEOAPIFY_KEY');
  if (!key) return json({ minutes: null, reason: 'no-key' });

  try {
    const url =
      `https://api.geoapify.com/v1/routing?waypoints=${fromLat},${fromLng}|${toLat},${toLng}` +
      `&mode=drive&apiKey=${key}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return json({ minutes: null });
    const data = await res.json();
    const props = data?.features?.[0]?.properties;
    const seconds = num(props?.time);
    const meters = num(props?.distance);
    if (seconds === null || meters === null || seconds <= 0 || meters <= 0) {
      return json({ minutes: null });
    }
    return json({ minutes: Math.round(seconds / 60), km: Math.round(meters / 1000) });
  } catch {
    return json({ minutes: null });
  }
});
