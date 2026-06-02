# Tarmil — Free / Open API Gaps & Sources (verified)

**Status:** Compiled from two parallel agents — a codebase API-gap audit (backend-architect)
and an "API-tester"-style web scan that **live-probed** each candidate for auth, CORS,
license, and response shape. Date: 2026-06-02. Goal: never show null where a completely
free / open source can fill it. Items marked ✅ DONE shipped in this session.

## How Tarmil plugs anything
- **Direct browser fetch** — only if CORS-open + keyless.
- **`free-proxy` Edge Function** — keyless but CORS-blocked: add the host to one whitelist line (`supabase/functions/free-proxy/index.ts`), 12 h cache.
- **Bundled static dataset** — slow-changing reference data (visa, plugs); zero calls, offline.
- **AI grounding** — pass real facts into `ConciergeBox` `facts[]` → `askConcierge` ctx. The model summarizes given facts, never authors them; never authoritative on visa/safety (Moffatt).
- `VITE_*` is public (browser bundle) → any **keyed** API must go server-side.

---

## The gap list → resolution

| Gap | Was (null/placeholder) | Resolution | Status |
|---|---|---|---|
| **Concierge had no facts** | Always "check official sources" | Wire holidays/FX/language/timezone/visa into `facts[]` | ✅ DONE |
| **Visa / entry (the flagship null)** | Static generic disclaimer only | **imorte/passport-index-data** (MIT, CORS-open, Feb-2026); bundled Israeli-passport row → entry line + concierge fact, disclaimed | ✅ DONE |
| **10 Asia/other cities had no country** | Empty "Before you fly" | Completed `cityCountries.ts` (all 18 cities + names) | ✅ DONE |
| **NL place search** | none | `NlSearchField` → AI filter params → tab+keyword filter, keyword fallback | ✅ DONE |
| **Holidays / FX** | worked for 8 cities only | now resolve for all 18 (country-code fix) | ✅ DONE |
| **Travel safety / advisories** | none | `travel-advisory.info` (free) **or** gov feeds → `free-proxy` | ⏳ TODO (verify cert off-sandbox) |
| **Air quality** | none | **Open-Meteo Air-Quality** — keyless, CORS-open, direct | ⏳ easy |
| **Daylight / golden hour** | none | **sunrise-sunset.org** — keyless, CORS-open, direct | ⏳ easy |
| **Local time + DST** | static TZ only | **timeapi.io** — keyless, CORS-open (avoid WorldTimeAPI, 503) | ⏳ easy |
| **Calling code · driving side · languages** | none | **REST Countries** already wired — add `idd`, `car.side` fields (zero new dep) | ⏳ trivial |
| **Emergency numbers** | none | `emergencynumberapi.com` `/data/all` once via `free-proxy` + cache; or MIT `BalestraPatrick/EmergencyAPI` | ⏳ low |
| **Plugs / voltage** | none | bundle a small hand-verified table (facts are public/IEC; `world-plugs` has no license) | ⏳ low |
| **Tap-water safety** | none | curated editorial table (no clean open yes/no dataset exists) | ⏳ editorial |
| **Place ratings / hours / photos** | typed but unpopulated | Foursquare-OS + OSM-hours + Wikidata → `aggregateRating`/`hours` via a `places-enrich` Edge Fn + cache (the global-content tier) | ⏳ bigger |
| **Drive routing** | OSRM demo CORS-blocked → straight-line estimate | **Geoapify** routing (free key, CORS, transit mode), origin-locked or server-side | ⏳ needs a key |
| **Blurb grounding** | thin OSM name only | Wikidata/Wikivoyage extract → `rewritePlaceBlurb` `context` | ⏳ medium |
| **Inter-city transit/fares** | mock | Travelpayouts Data API + deeplinks (monetization side) | ⏳ monetization |

---

## Verified free sources (the keepers)

- **Visa:** `imorte/passport-index-data` — raw JSON on GitHub, **MIT**, **CORS `*`**, updated Feb 2026, `data[passportISO2][destISO2] = {status, days}`. Bundled the Israel row (`src/data/visaFromIsrael.ts`).
- **Air quality:** `air-quality-api.open-meteo.com/v1/air-quality` — none/`*`, CC-BY. ⚠️ free tier is non-commercial (same caveat as our weather use — decide as we monetize; self-host is the clean path).
- **Sun:** `api.sunrise-sunset.org/json?...&formatted=0` — none/`*`, commercial-OK.
- **Time/DST:** `timeapi.io/api/time/current/coordinate` — none/`*`, returns `dstActive`.
- **REST Countries (wired):** `idd` (calling code), `car.side` (driving side), `languages`, `currencies`, `timezones` — free wins, no new dependency.
- **Emergency:** `emergencynumberapi.com` (keyless, **no CORS** → proxy; uneven data) or `BalestraPatrick/EmergencyAPI` (MIT, cleaner).
- **Routing:** **Geoapify** (free key, CORS, incl. transit) — the one place to spend a free key; OpenRouteService as a server-side fallback.
- **Safety:** `travel-advisory.info` (free aggregator) — **UNVERIFIED from our sandbox** (TLS-MITM blocked); confirm CORS/cert before shipping, else use gov feeds.

## Avoid
- WorldTimeAPI (503/abandoned) · OpenAQ (needs key) · LibreTranslate public host (rate-limited/AGPL) · `world-plugs` verbatim (no license) · most RapidAPI "advisory" listings (paid).

---

## Pluggability ranking (do next)
1. **Air quality + sunrise + time** — keyless, CORS-open, ~an afternoon; quiet garnish on the city/finalize surfaces.
2. **REST Countries extra fields** (calling code, driving side) — trivial, no new dep.
3. **Advisories** — verify `travel-advisory.info` off-sandbox, else gov feeds; add to `free-proxy`; concierge grounding + a quiet per-stop line.
4. **Emergency numbers + plugs** — fetch-once/bundle; concierge facts.
5. **Geoapify routing** — replaces the drive-time estimate (free key, origin-locked).
6. **Place enrichment tier** (Foursquare-OS/OSM-hours/Wikidata → ratings/hours/photos) — the big one; needs the `places-enrich` Edge Function + cache.

All free-data sources render with `SourceCredit` attribution; AI relays facts but never adjudicates visa/safety.
