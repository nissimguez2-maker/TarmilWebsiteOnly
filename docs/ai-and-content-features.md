# Tarmil — AI & Free-Content Features (chairman synthesis)

**Status:** Audit of the AI layer + the non-monetizable "value" APIs that deepen the
journey. Read-only; no app code changed. Date: 2026-06-02. Six specialist lenses ran
in parallel, each aware of the others and tagging cross-domain flags; this is the
chairman's reconciliation. Companion to `docs/platform-audit.md` (the 5-lens platform
audit) — this one zooms into the *free-value + intelligence* layer.

**The frame (deliberate):** every item here is judged on **journey value +
attachment + *indirect* conversion** — a deeper, more trustworthy plan that earns more
affiliate clicks *later* — **not** direct revenue. These are the layers that make the
planner worth opening.

| Lens | Agent |
|---|---|
| Financial (cost vs journey value) | financial-analyst |
| User journey | ux-researcher |
| UI / brand fit | ui-designer |
| Backend / data / caching | backend-architect |
| Legal — Israel-based (EU+IL) | general-purpose (research) |
| AI implementation | ai-engineer |

Audited: the 4 locked AI features + engine decision; the wired free-API pile
(Open-Meteo, Wikipedia, Nominatim, Overpass, OSRM, REST Countries); and proposed
value-adds, including a fresh scan of public-API directories.

---

## Verdict (unanimous)

**The AI + content plan is sound and cheap — the intelligence layer lands at well
under 1% of revenue and the free APIs are genuinely free.** Every lens independently
reached the same shape: **ship per-place blurbs first** (extend the one AI function
that already works), ride the same cache for a few near-free factual value-adds
(holidays, currency), and treat the conversational planner + concierge as *later,
higher-stakes* features that depend on infrastructure and a finalize surface that do
not exist yet.

The risk is **not** the features. It is **two missing foundations and one missing
room**, all of which must exist before the interactive AI ships:

1. **No server-side AI/cache tier exists.** The Groq key ships in the browser bundle
   and there is no shared cache — so today the "free-at-scale" thesis is *false*
   (every visitor re-pays for the same blurb) and a leaked key could burn the entire
   annual AI budget in a day. **One fix — a capped Edge Function + a shared cache —
   closes the biggest cost-risk, the biggest cost-waste, and the data-governance hole
   at once.** It is the hard gate.
2. **The honesty + legal controls are unbuilt** — no "AI-generated, verify" label, no
   source attribution anywhere (an ODbL/CC-BY breach that exists *today*), and the
   gold editorial star still renders unconditionally.
3. **The "Before you fly" finalize surface doesn't exist** — and it is the home for
   the concierge, visa, currency and the whole T3 tier. Three lenses put it on their
   critical path.

Get those three in place and the sequence is safe, measurable, and nearly free.

---

## Convergences — where ≥2 lenses agreed (highest-confidence must-fixes)

| # | Finding | Lenses | The integrated fix |
|---|---|---|---|
| 1 | **Client-side Groq key + no shared cache.** `groqApi.ts:7` reads `VITE_GROQ_API_KEY` in the bundle (extractable → uncapped billing abuse); caching is per-browser, so every new visitor re-generates identical blurbs. | Finance · Backend · Legal · UX · UI | **One `ai-chat` Edge Function** holding the key server-side, with a **per-IP/day cap** and a **no-retain** vendor endpoint, writing to a **shared `web_places_cache`** table. This is the single highest-leverage move in the audit — it makes "free-at-scale" true, caps abuse, and lets us strip PII + inject grounding. **Nothing AI ships to production before it — including blurbs.** |
| 2 | **Honesty firewall isn't enforced.** `PlaceCard` renders the gold `Star` unconditionally (`WebCityPanel.tsx:753`); the blurb prompt could also *write* a third-party rating into prose. | UI · AI-eng · Legal · Data | Gate the gold star on a required `ratingKind: 'editorial'`; render aggregates quiet + attributed (`4.4 · Google`, never a star). **And forbid the blurb prompt from emitting any rating/superlative** — enforce the firewall at *both* the prompt and render layers. Legal control, not styling. |
| 3 | **No "AI-generated — verify" label, no citations.** | Legal · UI · UX · AI-eng | One reusable, quiet label on **every** AI surface (discharges *Moffatt v. Air Canada* + EU AI Act Art. 50, Aug 2026). For visa/safety/health it is **non-dismissible** and the answer **routes to the official source**, never adjudicates. Concierge answers render cited source links. |
| 4 | **The "Before you fly" finalize surface doesn't exist.** Closest anchor is `TripOverviewCard` (`WebStopList.tsx:496`). | UX · UI · Finance | It is the home for concierge + visa + currency + the entire T3 tier (eSIM/insurance) and the trust-capture moment. **Design it once, jointly.** Keep free reminders visually separated from paid rows — "if you want," never "you need to." |
| 5 | **Attribution is mandatory and entirely missing — a breach that exists today.** | Legal · UI | Render **"© OpenStreetMap contributors"** wherever OSM data shows (Nominatim/Overpass/OSRM), **"from Wikipedia, CC BY-SA"** + link on Wiki-sourced/rewritten blurbs and per-image, and the Open-Meteo CC-BY credit. Reuse the quiet `text-meta` provenance grammar the weather strip already uses. |
| 6 | **Stable, merge-invariant `Place.id` is a precondition.** | AI-eng · UX · Backend | `blurb:${place.id}` is "cached forever" and saved trips store `placeId` — if an id changes on re-ingest, the blurb mis-attaches *and* saved places rot. The stable-id invariant (data-audit #1) gates blurb caching and trip integrity alike. |
| 7 | **Concierge is blocked on a grounding corpus that isn't in the code.** visa/safety/advisory data is doc-only, never in `src/`. | AI-eng · Legal · UX | Wire the **official free feeds first** (Passport-Index visa dataset, US State Dept advisories, Nager.Date). An ungrounded concierge answering visa/safety questions *is* the Moffatt liability. |
| 8 | **The OSM trio breaches ToS now and won't scale.** OSRM's demo server prohibits production use; Nominatim sends no `User-Agent` and ignores the ≤1 req/s cap; Overpass runs per-tab from the browser. | Legal · Backend · Finance | Move all three **server-side + cached**; replace with a production-licensed provider (**Geoapify** — free tier, CORS-OK, caching permitted) before commercial scale. OSRM is the urgent one (a clear ToS breach for a monetizing product). |

---

## The AI layer — 4 features, reconciled

The engine decision (cheap Groq/Flash workhorse · cache all non-interactive outputs ·
premium model as a *selective* fallback) is **financially and architecturally
correct** — modeled at **~$1.4–1.6 K/yr** total even with live features, comfortably
inside the 1–3%-of-revenue content budget. The premium fallback must be **rare,
triggered only by validation-failure / dense-constraint / explicit action — never
"a nicer answer" — and hard-capped.** All four features split cleanly into
*cacheable-and-near-free* vs *interactive-and-billable*:

1. **Per-place + city blurbs — BUILD-NOW (ship first).** Extends the proven
   `rewriteAsTravelIntro`: the model **rewrites grounded source text** (curated
   `englishDescription` / Wikipedia extract), never invents, and emits **prose only —
   no ratings** (firewall). Cache `blurb:${place.id}` **forever** → bounded by distinct
   places, not traffic. This is what turns scraped OSM long-tail rows into
   curated-feeling recommendations worth saving — the single highest journey-value
   move, and the codebase is already shaped for it. *Prereq: move behind the Edge
   Function before production scale; carry the AI label + Wikipedia attribution.*

2. **Natural-language search — BUILD-LATER (second).** Generates a **query, not an
   answer**: free text → **validated JSON filter params** (against the `PlaceCategory`
   / city enums) that the *existing* filter applies; unmappable → fall back to today's
   Nominatim search. Results must land on the **plannable** surface
   (`WebAddStopModal` / filtered `PlaceCard`s), never a prose bubble. Cheap and
   shared-cacheable, but gated on the Edge Function.

3. **Conversational planner — BUILD-LATER (one-shot draft, NOT a chat).** A full chat
   UI is the one thing that **cannot** fit the warm-minimal frame and risks
   *delegating away* the ownership that drives attachment. The reconciled design: a
   **single "describe your trip" input on `QuickStartEmpty`** that emits an **ordered
   list of `ADDABLE_CITIES` ids only** (code supplies dates/coords via `addRoute`),
   drops an **editable draft** into the normal itinerary, then disappears. Manual
   planner stays the source of truth. The one feature with real per-turn cost — cap
   turns + tokens; premium fallback only for dense, conflicting constraints.

4. **Concierge Q&A — BUILD-LATER (last; gated).** Highest trust *and* highest
   liability. Lives **inline on the finalize surface** (reuse the `PlacementExplainer`
   popover shell, never a floating chat). Answers **only from injected grounding**
   (curated places + official feeds), renders **cited links + a non-dismissible
   "verify with official sources" label**, and is **never authoritative on
   visa/entry/safety/health** — it routes to the source. Blocked until (a) the
   finalize surface exists and (b) the official feeds are wired.

---

## The free value-API layer — reconciled

Treatment template for every signal: the existing **`WeatherStrip`** — a quiet block,
a `meta-caps` heading, one `amber` highlight, a single italic provenance line. No new
chrome, no glow, attribution rendered.

**Wired today (keep — with fixes):**

- **Open-Meteo** — exemplary journey design; **needs the commercial tier + CC-BY
  credit** once monetizing (the keyless tier is non-commercial). Cache forecast ~1 h,
  archive forever.
- **Wikipedia** — load-bearing (feeds the blurb AI); **needs CC BY-SA attribution**;
  prefer curated copy, AI-rewrite only the long-tail fallback path.
- **Nominatim / Overpass / OSRM** — keep the *function*, **re-architect**: server-side,
  cached, attributed, real `User-Agent` + throttle; replace with Geoapify before scale.
  OSRM's production ban makes it the urgent one.
- **REST Countries** — clear; add a fallback host / vendored ISO dataset for resilience.

**Proposed + scanned candidates (judged on journey value, with provider picks):**

| Value-add | Provider pick (auth · CORS · license) | Verdict | Why |
|---|---|---|---|
| **Public holidays** | **Nager.Date** (no key · CORS-blocked → server-side · open) | **BUILD-NOW** | "Your saved museum is closed on arrival day" — a *save-the-trip* insight on the dated itinerary, the highest-converting asset. ~$0. |
| **Currency / FX** | **Frankfurter** (no key · **CORS-OK** · ECB data) | **BUILD-NOW/LATER** | Prices-in-₪ for the Israeli core; one line in `CityHeader`. Cache 24 h; "indicative rates" caveat. (Preferred over ExchangeRate-API, now key-gated.) |
| **Visa rules** | **Passport-Index** dataset (MIT · static) | **BUILD-LATER** | Soothes the central pre-trip anxiety; sits beside iVisa as honest free value. **Disclaimer-gated** (Moffatt); AI may read but never override it. |
| **Travel advisories** | **US State Dept** (public domain) | **BUILD-LATER** | Real peace-of-mind; **neutral "official" framing only**, never Tarmil's opinion or AI-editorialized. Concierge grounding feed first. |
| **Air quality** | **Open-Meteo Air-Quality** (no key · same provider) | **BUILD-LATER** | Trivial add for Asia/India routes; quiet comfort signal. |
| **Daylight / golden hour** | **Sunrise-Sunset** (no key · CORS-OK) | **BUILD-LATER** | Quiet per-dated-stop signal; low priority, low cost. |
| **Landmark seed content** | **World Wonders API** (free/open) | **BUILD-LATER** | Seeds the global-content tier + grounds blurbs/concierge for long-tail cities. |
| **Richer prose** | **Wikivoyage** (CC BY-SA) | **BUILD-LATER** | A *content source for blurbs*, not its own UI; same attribution as Wikipedia. |
| **Geocoding/POI infra** | **Geoapify** (free key · CORS-OK · caching allowed) | **INFRA** | The server-side replacement for the OSM-demo trio (#8), not a user feature. |
| Richer maps / transit | — | **DEFER** | In-trip need; this phase is a pre-trip desktop planner. |
| Packing lists | — | **CUT → fold into concierge** | A static checklist is chrome; weather + a concierge question answer it better. |
| Offline | — | **DEFER** | In-trip capability; localStorage already covers pre-trip resilience. |

---

## Master verdict table

Reconciled across all six lenses. Rank = build order within the AI+content layer.

| Rank | Item | Verdict | Reconciled rationale |
|---|---|---|---|
| — | **`ai-chat` Edge Function + `web_places_cache` + per-IP cap** | **BUILD-NOW (gate)** | Prerequisite for *all* AI. Server key, shared cache (TTL + `verified_at` freshness), no-retain endpoint, PII minimization. (Convergence #1.) |
| — | **Honesty + legal scaffolding** | **BUILD-NOW (gate)** | `ratingKind` firewall (prompt + render), the reusable "AI — verify" label, attribution lines, consent gate, `/privacy` + `/terms`. (Conv. #2/#3/#5.) |
| 1 | **AI: per-place + city blurbs** | **BUILD-NOW** | Extends `rewriteAsTravelIntro`; rewrites grounded text, prose-only, cache forever. Highest journey value, lowest risk. |
| 2 | **API: public holidays** (Nager.Date) | **BUILD-NOW** | Closure warnings on dated stops; ~$0; server-side (CORS). |
| 3 | **API: currency / FX** (Frankfurter) | **BUILD-NOW** | Prices-in-₪; one `CityHeader` line; cache 24 h; indicative-rate caveat. |
| 4 | **APIs: Wikipedia / Open-Meteo / REST Countries / OSRM** | **KEEP + fix** | Add attribution + (Open-Meteo) commercial tier; keep graceful fallbacks. |
| 5 | **AI: natural-language search** | **BUILD-LATER** | Validated filter params → plannable results; needs the Edge Function. |
| 6 | **The "Before you fly" finalize surface** | **BUILD-LATER (unlocks 7–9)** | The missing room for concierge + visa + T3. Design once, jointly. (Conv. #4.) |
| 7 | **API: visa dataset** (Passport-Index) | **BUILD-LATER** | Disclaimer-gated honest free value beside iVisa; on the finalize surface. |
| 8 | **AI: conversational planner** | **BUILD-LATER** | One-shot route draft → editable itinerary; **chat UI is CUT**. Manual planner stays source of truth. |
| 9 | **AI: concierge Q&A** | **BUILD-LATER (last)** | Grounded + cited + labeled; never authoritative on visa/safety. Blocked on the finalize surface + the official feeds. |
| 10 | **APIs: advisories / air quality / sunrise / Wikivoyage / World Wonders** | **BUILD-LATER** | Quiet garnish + concierge grounding; attributed; low cost. |
| 11 | **Re-architect OSM trio → Geoapify, server-side** | **BUILD-LATER (before scale)** | ToS + scale fix; OSRM is the urgent ToS breach. (Conv. #8.) |
| — | **Premium-model fallback** | **DEFER until measured** | Enable in Step 3, metered + capped; trigger on validation-fail / dense constraints only. |
| — | **Vector store · whole-world bulk ingest · paid visa/risk APIs · richer maps/transit · offline · packing** | **DEFER / CUT** | Premature infra or wrong phase; ~150 curated places fit in a prompt — no vector store for v1. |

---

## Reconciled build sequence (slots into `docs/platform-audit.md` Step 0–3)

- **Step 0 — Foundations (free, unblocks everything):** the `ai-chat` Edge Function
  (server key + per-IP/day cap + no-retain endpoint + PII minimization) · the shared
  `web_places_cache` (TTL + `verified_at` freshness) · the stable-id + `ratingKind`
  data invariants · the reusable **"AI-generated — verify"** label · **attribution
  lines** · the **EU/IL consent gate** + `/privacy` + `/terms`. Most of this overlaps
  the platform audit's own Step 0.
- **Step 1 — First value (~free):** **blurbs** behind the Edge Function (cached
  forever, firewall-safe, attributed) + the two near-free factual value-adds that ride
  the same cache — **public holidays** (closure warnings) and **currency/FX**
  (prices-in-₪). First real engagement signal at ~$0.
- **Step 2 — The finalize surface + structured AI:** build **"Before you fly"** · ship
  **NL search** (validated params → plannable results) · wire the **official feeds**
  (visa, advisories) as grounding *and* disclosed free value.
- **Step 3 — The draft + the concierge:** the **one-shot conversational planner** ·
  the **grounded, cited concierge** on the finalize surface · **premium fallback**
  enabled, metered + capped · deeper enrichment (Wikivoyage, air quality, sunrise,
  World Wonders) as quiet garnish.

---

## Open decisions for the founder

1. **No-train / zero-retention contractual tier** for Groq + Gemini + the premium
   fallback vendor — a **ship-blocker** for any feature whose prompt carries trip data.
2. **The cost dials:** the per-IP/day cap value and the premium-fallback budget ceiling
   (finance can't size them without a founder nod).
3. **Commercial subscriptions:** Open-Meteo (weather) and a geocoding/POI provider
   (Geoapify) to replace the OSM demo servers before scale.
4. **Lawyer engagements** (also flagged in the platform audit): `/privacy` + `/terms`,
   the **ODbL conveyance boundary** (caching/merging OSM is fine; *redistributing* a
   derived DB is not), the **CC BY-SA rewrite-derivative** stance, the **cross-border
   transfer basis** (SCCs/DPF, IL/EU→US vendors), and **visa/safety disclaimer**
   wording.

---

## Sources

The six lens reports (financial, ux-researcher, ui-designer, backend-architect,
legal-research, ai-engineer), 2026-06-02 · the live code (`groqApi.ts`,
`WebCityPanel.tsx`, `WebStopList.tsx`, the six API clients, `places.ts`,
`SupabaseDataProvider.tsx`) · `docs/platform-audit.md` · `docs/monetization-map.md` ·
`docs/global-content-strategy.md` · public-API directories (public-apis,
freepublicapis, publicapis.dev) for the value-add scan (Frankfurter, Nager.Date,
Open-Meteo Air-Quality, Sunrise-Sunset, Geoapify, World Wonders).
