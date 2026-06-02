// ai-proxy — the website's single server-side AI gateway.
//
// Holds the Groq key SERVER-side (never the browser), caches every output in
// `web_ai_cache`, and caps billed calls per IP/day via `web_ai_usage`. All four
// AI features (blurbs, NL search, concierge, planner) call this one endpoint.
//
// Deploy:  supabase functions deploy ai-proxy --project-ref ltlholyrdtzegyeosqqz
// Secret:  supabase secrets set GROQ_API_KEY=...   (founder)
//          Until the secret is set, this returns { text: null } and the client
//          falls back to raw source text — no breakage, just no AI polish.
// Cap:     optional `AI_DAILY_CAP` secret (default 200 uncached calls/IP/day).
//
// Deno runtime — not part of the app's TypeScript build (tsconfig is src-only).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const DAILY_CAP = Number(Deno.env.get('AI_DAILY_CAP') ?? '200');

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

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ text: null }, 405);

  let payload: { cacheKey?: string; system?: string; user?: string; maxTokens?: number };
  try {
    payload = await req.json();
  } catch {
    return json({ text: null }, 400);
  }
  const { cacheKey, system, user, maxTokens = 400 } = payload;
  if (!cacheKey || !user) return json({ text: null }, 400);

  // No key configured -> graceful no-op; the client keeps the raw source text.
  const groqKey = Deno.env.get('GROQ_API_KEY');
  if (!groqKey) return json({ text: null, reason: 'no-key' });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  // 1) Shared cache hit -> serve free, no Groq call, no cap charge.
  const { data: cached } = await admin
    .from('web_ai_cache')
    .select('value, expires_at')
    .eq('cache_key', cacheKey)
    .maybeSingle();
  if (cached && (!cached.expires_at || new Date(cached.expires_at) > new Date())) {
    return json({ text: cached.value, cached: true });
  }

  // 2) Per-IP/day cap (cost + abuse). Hash the IP — never store it raw.
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const ipHash = await sha256(ip);
  const day = new Date().toISOString().slice(0, 10);
  const { data: usage } = await admin
    .from('web_ai_usage')
    .select('count')
    .eq('ip_hash', ipHash)
    .eq('day', day)
    .maybeSingle();
  const used = usage?.count ?? 0;
  if (used >= DAILY_CAP) return json({ text: null, reason: 'capped' });

  // 3) Call Groq with the SERVER-held key.
  let text: string | null = null;
  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: maxTokens,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: user },
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const t = data?.choices?.[0]?.message?.content;
      if (typeof t === 'string' && t.trim()) text = t.trim();
    }
  } catch {
    text = null;
  }

  // 4) Count the (uncached) billed attempt regardless of outcome.
  await admin
    .from('web_ai_usage')
    .upsert({ ip_hash: ipHash, day, count: used + 1 }, { onConflict: 'ip_hash,day' });

  // 5) Cache the result (blurbs never expire; callers can add expiry per kind).
  if (text) {
    await admin
      .from('web_ai_cache')
      .upsert({ cache_key: cacheKey, value: text, kind: 'ai' }, { onConflict: 'cache_key' });
  }
  return json({ text });
});
