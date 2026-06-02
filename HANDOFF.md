# HANDOFF — Tarmil Website (read this first, alongside CLAUDE.md)

This file is the continuation brief for a new Claude Code session. The previous
session built and deployed the Tarmil website; this captures everything needed
to pick up seamlessly. **Read `CLAUDE.md` (guardrails) and this file before
writing code.**

---

## 0. What Tarmil is
The Tarmil website is the **desktop trip planner extracted from the Tarmil app**
(`src/screens/web/*` in the original repo) and re-skinned into a standalone web
product for **Israeli travelers planning trips abroad**. The planner *is* the
whole site (`/` loads it). This repo holds the prototype, now **deployed live**.

## 1. Current state — IT IS LIVE
- **Live URL:** https://tarmil-planner.netlify.app (map renders, photos load, themed routes work).
- **Repo:** `nissimguez2-maker/TarmilWebsiteOnly`. Branches **`main`** (deployed) and **`claude/youthful-bohr-HuOLm`** (dev) are at the same HEAD. Fresh git history (the app was extracted, not force-merged from the source repo).
- **Builds clean:** `npm install` → `npm run typecheck` (tsc, strict) → `npm run build` (tsc -b && vite build). Green.
- **Stack:** Vite 5 · React 18 · TypeScript strict · Tailwind 3.4 · React Router 6 · Mapbox GL · Supabase (anon storage) · self-hosted Inter. Deploy target Netlify. English only.

## 2. What's been done (commit history, newest first)
- `Update CLAUDE.md scope` — Supabase anon storage + Netlify deploy now in scope.
- `Supabase anonymous trip storage (client + sync layer)` — Part B.
- `Themed starter routes for first-run` — Part A (replaced 3 arbitrary cities).
- `Blank quick-start first load + localStorage trip resume` — W2.
- `Responsive shell: remove desktop-only gate, add phone view+book floor` — W3.
- `Fix WCAG contrast + focus gaps from a11y audit` — W17 remediation.
- `Rebrand to warm-minimal palette + self-hosted Inter` — W17.
- `Extract clean web-only planner app` — W1.
- `Add curated build/design/QA subagents` + `Add repo CLAUDE.md`.

## 3. Architecture & key files
- **Entry:** `src/main.tsx` → `src/routes.tsx` (only `/` = `WebPlannerScreen`; `/web`→`/`; `*`→`/`). The app/social/forums/tools surfaces were stripped in W1.
- **Orchestrator:** `src/screens/web/WebPlannerScreen.tsx` — owns `localStops` + `home` state, all stop handlers, and the storage effects.
- **Data provider:** `src/lib/SupabaseDataProvider.tsx` — a **lean local provider** (NOT the original 993-line Supabase one). Supplies `{ data: { places, plannedStops }, loading, error }`. `places` come from the local seed (`src/data/rioPlaces.ts` + `globalPlaces.ts`); `plannedStops` starts `[]`. (Name kept for minimal churn; it no longer talks to Supabase for places.)
- **Trip storage:** `src/screens/web/tripStorage.ts` (localStorage, key `tarmil:stops`) + `src/screens/web/homeCity.ts` (key `tarmil:home`). **Server sync:** `src/screens/web/tripSync.ts` (anon auth → `web_trips` upsert/fetch) + `src/lib/supabaseClient.ts` (null when env absent → localStorage-only). localStorage is the instant cache; Supabase is the durable copy.
- **Suggestions:** `src/screens/web/starterRoutes.ts` (curated multi-city routes) + `src/screens/web/addableCities.ts` (8 South-America cities with data). The first-run empty state (`QuickStartEmpty` in `src/screens/web/WebStopList.tsx`) shows route cards; one tap calls `addRoute` in `src/screens/web/tripMutations.ts`.
- **Brand/token layer:** `src/brand/tokens.css` (warm-minimal palette as named CSS vars + `--ink`), `tailwind.config.ts` (maps tokens; `serif`+`sans` both → Inter; 7-size `fontSize` scale; mm `spacing` scale), `src/index.css` (base type, focus, motion-reduce). **No raw hex in components.**
- **Live APIs (wired, free):** `src/screens/web/{weatherApi,wikiApi,nominatimApi,countryApi,overpassApi,osrmApi,groqApi}.ts`. Mapbox has a graceful no-token fallback (`src/components/tripMap/ui/MapTokenNotice.tsx`).

## 4. Infrastructure
### Netlify
- Site **`tarmil-planner`**, siteId **`2559d342-613c-4d19-bd9a-aff63feeb413`**, team slug `nissimguez2`.
- Deployed via a **direct deploy** (uploads repo, builds on Netlify) — **NOT** GitHub-linked, so it does **not** auto-deploy on push. To redeploy: call the Netlify MCP `deploy-site` (siteId) → it returns an `npx -y @netlify/mcp@latest --site-id ... --proxy-path "..."` command → run it in the repo root. (Optional: link the GitHub repo in the Netlify dashboard for continuous deploy from `main`.)
- Env vars already set on the site: `VITE_MAPBOX_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Retrieve values via Netlify MCP `manage-env-vars` `{ getAllEnvVars: true }`.
### Supabase
- Project **`tarmil-mockup`**, id **`ltlholyrdtzegyeosqqz`**, region `eu-central-1`, URL `https://ltlholyrdtzegyeosqqz.supabase.co`. Org `PolyGuez` (`gczfbwayhuxrdnfcweth`).
- Table **`public.web_trips`** created: `user_id uuid PK → auth.users`, `stops jsonb`, `home jsonb`, `updated_at`. RLS on, policies `auth.uid() = user_id`. (JSONB blob mirrors the client trip shape.)
- Get keys via Supabase MCP `get_publishable_keys` + `get_project_url`.
- ⚠️ **BLOCKER — anonymous sign-ins are DISABLED.** Server storage activates only once it's enabled at
  https://supabase.com/dashboard/project/ltlholyrdtzegyeosqqz/auth/providers → **Anonymous Sign-Ins → on**.
  Until then the app silently falls back to localStorage (still works). After enabling, **verify the round-trip** (anon session → `web_trips` upsert → resume on reload; confirm RLS isolation between two anon users).
- ⚠️ This project ALSO holds the original native app's tables (`places` 196 rows, `planned_stops`, `forums`, `place_saves`, …). **Do not touch those** — the website uses only `web_trips`. (Reading `places` from the DB is a future option for richer content, see W11.)
### Local env
- `.env.local` is **gitignored** (not in the fresh clone). Recreate it for local builds/verification with `VITE_MAPBOX_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (pull from Netlify `getAllEnvVars` or Supabase MCP). The Mapbox token is a public `pk.` token; the Supabase key is the public anon/publishable key.

## 5. Immediate priorities
1. **Enable Supabase anonymous sign-ins** (founder/dashboard) → then verify the server round-trip end-to-end.
2. (Optional) set up **continuous deploy** from GitHub `main` in the Netlify dashboard.
3. Resume the build-order roadmap (section 6).

## 6. Remaining roadmap (original kickoff W-items + new follow-ups)
- **W10** — verify the live data pipeline on the deploy (Open-Meteo / Wikipedia / Nominatim / REST Countries / Overpass / OSRM / optional Groq) now that it's on a real network.
- **W11** — curate the **10–12 launch cities**. Today only ~8 South-America cities have real data; the global set (Bangkok, Ko Pha Ngan, Hanoi, Goa, Kathmandu, Kasol/Manali, Tbilisi, Medellín, Cusco, La Paz/Uyuni) needs content. Then **expand themed routes** beyond South America.
- **W12** — kosher / Jewish-friendly data, quietly framed (equal tab, no nav emphasis).
- **W15** — seeded Sponsored / Tarmil Selection placements + one-tap "What's this?" disclosure explainer.
- **W13** — remove fake social proof (data still has `friendsKnow` / `friendVisits` on places) → curated editorial stars; no fabricated counts.
- **W9** — booking sheet stays a visual mock (no tracking) — polish only.
- **W4** — mobile full parity (touch drag-reorder + inline date edit on phone).
- **W18** — warmer voice pass + **header cleanup**: remove the dead "Switch to App", "Share", and the "Yotam" fake-user chip in `src/screens/web/WebHeader.tsx`.
- **W19** — hygiene/QA: logical-CSS/focus-ring/no-100vh sweep, strip stale "DA v0.3"/Hebrew comments, confirm zero app/social/tools code remains.

## 7. Guardrails (see CLAUDE.md for the full version)
Named tokens only / **no raw hex in components**; **logical CSS utilities only** (no physical `ml-/mr-/pl-/pr-/left/right`); **7 type sizes** + the mm spacing scale; **focus rings** on every interactive element; **no `100vh`** (use `dvh`); the **disclosed merchant model** (Sponsored + Tarmil Selection, non-payers never suppressed); **curated stars, no fabricated social numbers**; warm-human copy ≤~28 words (banned: "synergy", "leverage" verb, "ecosystem", "play" noun). Keep the app **building + TS-strict clean** at all times. **Accounts/login remain deferred** (anonymous storage only).

## 8. Agents — now native, USE THEM
After this session restart the 7 agents in `.claude/agents/` are invokable via the Agent tool `subagent_type`: **frontend-developer, rapid-prototyper, backend-architect, ui-designer, evidence-collector, reality-checker, accessibility-auditor**. Each has the repo guardrail appended. The founder explicitly wants these used — delegate implementation, design, and verification to them (e.g. `backend-architect` for any schema work, `accessibility-auditor` for contrast/focus audits, `frontend-developer` for UI). Built-ins `Explore` / `Plan` remain great for research/planning.

## 9. Build / verify commands
- `npm install` · `npm run typecheck` · `npm run build` · `npm run preview` (serves `dist` on :4173).
- **Playwright** is installed (chromium headless shell). For **live-site** screenshots use `browser.newContext({ ignoreHTTPSErrors: true })` — the sandbox MITMs TLS, so headless chromium otherwise rejects external certs (`ERR_CERT_AUTHORITY_INVALID`). For **local preview** waits, use `curl --retry 20 --retry-connrefused` (foreground `sleep` is blocked). Run helper `.mjs` scripts from inside the repo so node resolves `node_modules`, then delete them.

## 10. Gotchas / operational learnings
- **GitHub MCP** is scoped to `tarmilwebsiteonly` only. The **source app repo is public** at `https://github.com/nissimguez2-maker/Tarmil.git` — clone it to `/tmp` if you need the original code, Supabase schema, or `supabase/migrations` for reference.
- **Netlify MCP intermittently returns 502** (retryable) — retry; do `manage-env-vars` writes **one at a time** (parallel calls overload it); `deploy-site` returns a CLI command to run in the repo.
- **Supabase MCP cannot toggle auth settings** (anonymous sign-ins) — that's dashboard-only.
- Background **agents run async**; you're notified on completion. **Commit before ending a turn** — a stop-hook flags uncommitted changes.
- Push only to `claude/youthful-bohr-HuOLm` and `main` (founder-approved). The git remote is a local proxy scoped to this repo.
- The original `TARMIL1.MD` kickoff spec (full W1–W19 detail) lived in the uploads of the prior session, not the repo — this file + CLAUDE.md are the durable source of intent now.
