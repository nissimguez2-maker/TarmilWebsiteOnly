# Tarmil — Session Handoff (continue here in a fresh discussion)

**Why this exists:** the prior chat got long + laggy. Paste this as the opening
message of a new Claude Code discussion (the repo + `CLAUDE.md` come with it), or
just say: *"Read `docs/session-handoff.md` + `CLAUDE.md`, then start the queued task."*

---

## What Tarmil is (60 sec)
Web desktop **trip-planner**, pivoting from a finished prototype to a real
**monetization + global-content platform**. Vite/React 18/TS-strict/Tailwind.
Live: **tarmil-planner.netlify.app** (deploys from `main` via Netlify). Trips persist
to **Supabase** (anon auth, table `web_trips` only). Dev branch:
**`claude/stoic-pascal-oil4l`** → ship by fast-forwarding `main` (founder-approved).
English-only. Audience skews **Israeli backpackers** + a growing global base.

## Decided + committed (read these docs for depth)
- `docs/monetization-map.md` — affiliate revenue via **Travelpayouts**; the **3D
  tiering** (§4.2); **handpicked affiliates** (§4.2) + catalog-verified rates (§4.3);
  placement map.
- `docs/global-content-strategy.md` — serve every city worldwide via a tiered,
  cacheable stack (curated hero + Foursquare-OS/OSM/Wikidata free base + intent-gated
  Google/FSQ-live + Viator/Booking inventory-as-content); the honesty firewall.
- `docs/platform-audit.md` — the **5-lens audit** (UI/UX · journey · finance · data ·
  legal-IL) → verdict, cross-lens convergences, pre-launch legal blockers, the
  dependency-ordered build sequence.

**Tiering (FINAL, founder call):** **T1 = Accommodation + Flights · T2 = Tours ·
T3 = eSIM/visa/insurance/long-tail.** The **3D model**: *Tier* (build priority) ×
*Stage* (where it surfaces in the journey) × *EV* (how hard we optimize). Flights &
Tours live on different screens, so they never compete; Tours is optimized hard at T2.

**Handpicked affiliates (fame × payout):** Booking.com + **Hostelworld** (accommodation),
**Skyscanner** (flights — over the better-paying-but-unknown WayAway), **GetYourGuide**
(+Klook for Asia) (tours), Tiqets, **Airalo** (eSIM), **EKTA 25%** (insurance), iVisa,
Kiwitaxi (or Welcome Pickups), 12Go/Omio, DiscoverCars. New value-add line:
**flight-delay compensation (AirHelp / Compensair)**.

**AI decision (LOCKED, not yet built or documented in its own doc):** four features —
**conversational planner · smart per-place blurbs/recs · natural-language search ·
concierge Q&A** — bundled as one intelligent layer. Engine = **cheap managed models
(Groq / Gemini Flash)**, **cache all non-interactive outputs**, **premium model
(Claude/GPT) as a selective fallback** for the hardest reasoning only.

**Code shipped to dev:** the **Place-model foundation** (`src/data/places.ts`) — purely
additive provenance/enrichment fields; the **honesty firewall by construction**
(third-party scores live in a separate `aggregateRating` slot, so they can never render
as the editorial gold `rating`/star); `hebrewName`/`hebrewDescription` now optional.
Zero behavior change; typecheck + build green.

## Keys / facts
- **Travelpayouts marker: `735261`** — public (rides in every link), client-side OK →
  env `VITE_TRAVELPAYOUTS_MARKER`.
- **TP flight Data API token** — provided in the prior session; **sensitive → server-side
  only** (an Edge Function), per the audit. Not committed; re-obtain from founder.
- **Supabase:** project `tarmil-mockup` (`ltlholyrdtzegyeosqqz`, eu-central-1). Touch
  **only `web_trips`**; never the native app tables.

## Current blocker (waiting on the founder / Travelpayouts)
- **TP is reviewing the Project (~a few days)** before affiliate links activate. Booking
  confirmed at **5%** (promo to 2026-06-30).
- **The unlock:** once approved (or if "Generate links" reveals a format during review),
  the founder pastes **one sample Booking affiliate link** → then build the affiliate-link
  layer *precisely* (marker + per-slot `sub_id` for attribution + pre-filled deeplinks
  with the stop's real dates). **Do NOT guess the TP link format before seeing a sample.**
- Founder skipped **TP "Drive"** (auto-link JS) — correct for a structured app; we build
  controlled links ourselves.

## Build sequence (from the audit)
- **Step 0 — scaffolding (unblocked, in progress):** ✅ data-model foundation. Remaining:
  (a) decide the **lightweight tracking + consent approach** (privacy-sensitive, EU+IL —
  needs a founder nod); (b) funnel/attach **instrumentation** (the audit's hard gate
  before any paid spend); (c) **EU consent gate**; (d) a reusable **inline affiliate-
  disclosure** component ("we may earn a commission" at every handoff); (e) **AI
  provenance labels**.
- **Step 1 —** the free **Accommodation + Tours** franchise under the marker (pre-filled,
  disclosed, content-confidence-gated). First real attach data.
- **Step 2 —** the **"Before you fly" finalize surface** (doesn't exist yet) + T3 +
  grounded AI concierge + blurbs.
- **Step 3 —** premium content enrichment only after funnel/attach + a cache-cost meter
  justify it; server-side keys + a hard spend cap.
- **Pre-launch legal blockers:** publish privacy/terms pages; EU consent gate; AI
  "verify visa/safety" disclaimer; ODbL segregation of OSM-derived data.

## How we work
- Obey `CLAUDE.md`: warm-minimal-premium brand, **logical CSS only**, focus rings,
  **no `100vh`**, honesty/disclosure, English-only.
- Delegate to the specialist agents in `.claude/agents/`. For big reviews use the
  **parallel agents → chairman synthesis** pattern (launch in one message, wait for all,
  then reconcile into one verdict + tag cross-domain flags).
- Honesty non-negotiables: disclosed affiliates, **no fabricated social proof**, aggregate
  ratings never shown as Tarmil's editorial star.

---

## ▶ QUEUED TASK — start here

**Audit the AI features + the non-monetizable / free "value" APIs that improve the user
journey — for the traveler AND for us** (deeper journey → trust + attachment → indirectly
more affiliate clicks; NOT direct revenue). Use the **parallel agents → chairman** format.

**Lineup (≥4 — the founder asked for finance + UI/UX + Legal + back-end, plus more):**
- **financial-analyst** — per-feature/API cost (AI tokens, quotas) vs journey value; what's
  free; keep total non-content opex tiny; ROI ranking.
- **ux-researcher** — does each feature deepen the journey, and where exactly does it live?
- **ui-designer** — how AI + enrichment surfaces fit the warm-minimal frame without
  feeling bolted-on (reuse existing shells; one restrained accent; no glow).
- **backend-architect** — API/data/caching architecture; the cheap-AI + output-cache plan;
  server-side keys; failure/degradation modes.
- **general-purpose (Legal — Israel-based)** — AI disclaimers (*Moffatt v. Air Canada*),
  data/consent, third-party API ToS, EU AI Act Art. 50.
- *(optional)* **ai-engineer** — concrete implementation: RAG over places, prompt + cache
  design, model routing (Groq/Flash → premium fallback).

**Brief each on:** the 4 locked AI features + the engine decision; the existing **free API
pile** (Open-Meteo weather, Wikipedia/Wikivoyage, REST Countries, Nominatim, Overpass,
OSRM, FX rates, public holidays, visa dataset) **+ candidate value-adds** (e.g. richer
maps, transit, currency, safety/advisory, packing, offline) — judged purely on **journey
value + attachment + indirect conversion, not direct revenue**. Have each **tag cross-
domain flags**. Then synthesize a **chairman's verdict** and commit a new doc
(`docs/ai-and-content-features.md`) + update the build sequence.

**Then resume the build** when the founder returns with the sample Booking link (→
affiliate-link layer) or a nod on the tracking/consent approach (→ instrumentation).
