-- Server-side AI + content cache for the website's `ai-proxy` Edge Function.
-- ADDITIVE and isolated: does NOT touch `web_trips` or any native-app table.
--
-- Why this exists: the AI features (warm blurbs, NL search, concierge, planner)
-- must run behind a SERVER-held Groq key with a shared cache + a per-IP/day cap
-- — never the browser key (which would be extractable and uncapped). These two
-- tables are the runway; `ai-proxy` reads/writes them with the service role.

-- Shared output cache. Content is public + non-personal (city blurbs, etc.), so
-- it is world-readable; only the Edge Function (service role) ever writes it.
create table if not exists public.web_ai_cache (
  cache_key   text primary key,
  value       text        not null,
  kind        text        not null default 'ai',
  created_at  timestamptz not null default now(),
  expires_at  timestamptz                          -- null = never expires (blurbs)
);

alter table public.web_ai_cache enable row level security;

create policy "web_ai_cache: public read of unexpired rows"
  on public.web_ai_cache
  for select
  to anon, authenticated
  using (expires_at is null or expires_at > now());
-- No anon/authenticated write policies -> inserts/updates/deletes are service-role only.

-- Per-IP/day call counter that caps billed AI usage (cost + abuse control).
-- Touched only by the Edge Function (service role); no client access at all.
create table if not exists public.web_ai_usage (
  ip_hash text not null,
  day     date not null,
  count   int  not null default 0,
  primary key (ip_hash, day)
);

alter table public.web_ai_usage enable row level security;
-- No policies -> only the service role (which bypasses RLS) can read/write it.
