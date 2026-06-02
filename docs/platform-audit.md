# Tarmil — Platform Audit (5-lens synthesis)

**Status:** Audit of the platform plan before any build. Read-only; no app code
changed. Date: 2026-06-02. Five specialist lenses ran in parallel, each aware of
the others and tagging cross-domain flags; this is the chairman's reconciliation.

| Lens | Agent |
|---|---|
| UI/UX | ui-designer |
| User journey | ux-researcher |
| Financial | financial-analyst |
| Data (architecture/integrity) | backend-architect |
| Legal — Israel-based | general-purpose (research) |

Audited: the prototype→platform pivot, `docs/monetization-map.md` (incl. the
Flights→T1 re-tier), `docs/global-content-strategy.md`, the AI features + engine
decision, and the live code.

---

## Verdict (unanimous)

**The strategy is fundamentally sound and unusually well-reasoned — nothing needs
a teardown.** Every lens independently said the *architecture* is right: the
tiered/cacheable content stack is structurally **high-margin (87–96% at scale) and
never threatened by its own costs**; the disclosure model, honesty firewall, and
"surface offers only at the moment of felt need" are the correct, trust-led spine.

The risk is **not** the plan's direction. It is three things, all fixable *before*
we write feature code:
1. **Missing scaffolding** — legal (no privacy policy / consent / AI disclaimer) and
   measurement (the funnel + attach rates that drive *every* revenue number are
   unmeasured).
2. **Engineering invariants the prose glosses** — five data-integrity rules that,
   unbuilt, silently corrupt trips and rot the long tail.
3. **One strategic call to revisit** — Flights→Tier-1.

---

## The one decision only you can make: Flights → Tier-1

**Two independent lenses (journey + finance) pushed back on it.** Honest reconciliation:

- **The numbers (finance):** the map's own §2 EV ranks **Tours $5.46 > Flights $2.16** — leading the build with flights costs **~$3.30/planned-trip of expected value (~$33k/yr at 10k trips)** for the same prime placement, because flights have **low book-through** (the Skyscanner price-comparison reflex) and "last cookie wins" means a comparison tab *overwrites your cookie* right before purchase.
- **The journey (UX):** flight intent often peaks **before** someone opens a planner; worse, a single visibly-worse flight price teaches "*compare Tarmil elsewhere*," and that distrust **bleeds onto accommodation + tours where you actually earn.** Tours convert *inside* the dreaming flow with no comparison habit.
- **Your logic still holds (and the lenses grant it):** flights are the most *certain* need and the biggest single ticket — nailing the highest-stakes purchase builds trust that lifts every later attach. It's a different objective function (intent/ticket-size), not a wrong one.

**My recommendation (reconciles all three):** **Accommodation is the undisputed #1. Make Tours a true co-Tier-1 alongside Flights, and build Tours *first*** (it's free — Viator content doubles as the tours inventory — higher-EV, and leakage-proof). **Keep Flights prominent, but make the bet falsifiable:** instrument flight book-through and pre-commit a **kill-criterion** ("if book-through stays below X% after the pre-filled, price-hinted, one-tap handoff ships, demote flights to T2"). You lose nothing and you stop betting prime real estate on faith. **First, pull one number from the Travelpayouts dashboard: accommodation commission *net of cancellation* — if it's ≤2.5%, Tours becomes #1 outright** and the ordering should flip.

---

## Convergences — where ≥2 lenses agreed (highest-confidence must-fixes)

| # | Finding | Lenses | The integrated fix (do before build) |
|---|---|---|---|
| 1 | **Honesty firewall isn't real yet** — `PlaceCard` renders the gold star unconditionally; no `ratingKind` in types | UI · Data · Legal | Make `ratingKind` a **required discriminated field with the aggregate rating in a *separate slot* from editorial `rating`**, gate the gold star on `'editorial'`, render aggregates as a quiet attributed "4.4 · Google" — land type+UI+normalizer **atomically**, before any non-curated rating flows. It's a **legal control** (misleading-ad / fake-review law), not styling. |
| 2 | **"100M POIs into Supabase ≈ $0" is wrong** | Data · Finance | ~150–250 GB + indexes + compute is a real fixed cost the "1–3%" model omits. **Don't bulk-load the world** — lazy, on-demand per-city ingest (keep the table in low millions); add storage/compute as a separate cost line. |
| 3 | **Funnel + attach are unmeasured, yet drive a 9× revenue spread** | Finance · UX · Data | **Hard gate:** instrument the staged funnel (visit→city→stop→**dated** itinerary) + per-domain attach via `sub_id` **before any paid-data or premium-AI spend.** Revenue/visitor is only ~$0.50–0.80 — the funnel *is* the business model. (Needs the consent gate first — see Legal.) |
| 4 | **The "Before you fly" finalize surface doesn't exist** | UX · UI · Finance | It's where all of T3 (eSIM/insurance/visa) + AI concierge must live, and the trust-capture moment. **Design it before wiring any T3 offer.** Keep free reminders visually separated from paid rows; "if you want," never "you need to." |
| 5 | **`VITE_GROQ_API_KEY` ships in the browser bundle** | Finance · Data · Legal | Extractable → uncapped billing-abuse. **Route all *billed* AI through the `places-enrich` Edge Function** (server key + per-IP/day cap), same discipline as paid place-data. |
| 6 | **Affiliate disclosure is footer/explainer-only** | Legal · UI · UX | Add a **persistent, visible inline "we may earn a commission" micro-disclosure at every monetized handoff** (incl. organic-looking Booking deeplinks). The "What's this?" explainer *supplements*, never replaces it. |
| 7 | **Pre-fill is the trust mechanism, not a feature** | UX · Data | Deeplinks must open **already filtered to the city + the stop's real dates.** Acceptance test = "opens filtered," not "opens." No pre-fill ⇒ don't ship the slot. |
| 8 | **Offers on thin long-tail cities = "ad disguised as curation"** | UX · Finance · Data | **Gate offer *prominence* on content confidence** — curated/enriched city → full offers; raw-OSM long-tail → quiet, never hero. "Serve every city" needs *bookable* inventory (Viator/Booking), not just free prose, to earn. |
| 9 | **AI must enhance existing surfaces, never bolt on chrome** | UI · UX · Legal | Ship **blurbs first** (the proven `rewriteAsTravelIntro` pattern); **conversational planner = first-draft-only** (manual planner stays source of truth); **concierge = grounded + cited** to official visa/safety feeds, labeled "AI"; **NL search only once results are plannable.** One restrained accent, no glow. Every AI surface gets an "AI-generated — verify" label (legal + brand). |

---

## Pre-launch LEGAL blockers (Israel-based, EU + Israeli users)

The docs make *honest* decisions; the exposure is **missing scaffolding around them.** Genuine blockers for a commercial launch:

1. **No privacy policy / terms pages exist** — but personal data is processed (anon trip data, IP, click events) and tracking is coming into scope. **Israel's Amendment 13 (in force Aug 2025)** treats IP/cookies/geolocation as personal data with **explicit, granular consent**; GDPR + Google's API ToS independently require a published policy. → Publish `/privacy` + `/terms`; inventory every processor (Supabase, Netlify, Groq, Google, Foursquare, Travelpayouts…).
2. **EU consent gate** — ePrivacy requires opt-in **before** affiliate tracking/cookies fire (CNIL is fining hundreds of millions). → A geo-gated consent banner that blocks attribution events until consent. Anon trip storage is defensibly "strictly necessary"; affiliate tracking is not.
3. **AI visa/safety liability** (*Moffatt v. Air Canada*: the company owns its chatbot's wrong answers) → never let AI be authoritative for visa/entry/safety/health; keep those on the official feeds the docs already chose; label AI + "verify with official sources." EU AI Act Art. 50 transparency applies Aug 2026.
4. **ODbL share-alike** — powering the UI from OSM is fine; **bulk-ingesting + merging it and ever conveying that merged DB** could force you to open the derived database. → keep OSM-sourced fields **isolatable**, never expose a bulk export.
5. **LLM + partner ToS** — confirm Groq/Gemini no-train tier (prompts carry trip data), and that Booking photo hot-linking / Viator ingest rights are live in the signed agreements.

Lawyer needed for: the two policy docs, the ODbL conveyance boundary, the AI disclaimer scope, cross-border transfer basis (SCCs/DPF), and the Israeli DB-registration question. The *engineering* parts (consent gate, AI labels, inline disclosure, ToS compliance, firewall enforcement) we can build now.

---

## Data engineering invariants — must land FIRST, atomically (before any normalizer)

1. **Stable, merge-invariant `Place.id`** (e.g., `fsq:…` / `osm:…`, curated slug wins) — or every *saved* global place becomes a dangling reference in `web_trips` (saved items rot — worse than today).
2. **Category-aware, tiered de-dup** (not "name + 75 m", which false-merges 20–50 venues in dense cores) — normalized-name **AND** proximity, never across categories.
3. **Make `hebrewName`/`hebrewDescription` optional** — global sources are English-only; the model literally can't hold them otherwise.
4. **Widen `PlaceCategory`** (or add an `other` bucket + logged unmapped path) — 11 buckets can't carry a global feed.
5. **Freshness, not just TTL** — cacheable ≠ fresh; a venue that closed two years ago stays a confident card forever. Add `verified_at` + a re-validation cadence + an honest "may be out of date" signal.
   Plus: route Overpass server-side (the current per-tab browser call won't scale), define the spend-ceiling counter + at-cap behavior, and a `web_places_cache` name (not to collide with the native `places`).

---

## Recommended build sequence (respects every dependency above)

- **Step 0 — Scaffolding (free, unblocks everything):** the staged funnel + attach instrumentation · the EU consent gate · privacy/terms pages + AI labels · the data **model changes** (stable id, `ratingKind`, optional Hebrew, category, provenance) with the "curated output is semantically identical" regression test.
- **Step 1 — The free 58% franchise** under your `marker`: **Accommodation + Tours** (Viator content *is* the tours inventory), pre-filled + filtered, inline disclosure, firewall live, content-confidence-gated. This generates the **first real attach data** at ~$0 marginal cost.
- **Step 2 — Finalize surface + T3** (eSIM/insurance/visa) + **grounded AI concierge**; **blurbs** shipped here too.
- **Step 3 — Premium enrichment** (Google/Foursquare-live) **only after** the funnel/attach + cache-cost meter prove it pays; server-side keys + hard spend cap. Defer the literal whole-world ingest.
- **Flights:** wired in Step 1/2 as a price-hinted, one-tap, *falsifiable* handoff — not the hero.
- **AI + free-content layer:** sequenced in **`docs/ai-and-content-features.md`** — blurbs first (Step 1), NL search + the "Before you fly" finalize surface (Step 2), the one-shot planner + grounded concierge (Step 3); all behind the capped `ai-chat` Edge Function, with the "AI — verify" label + source attribution as Step-0 gates.

---

## Bottom line

You have a plan five independent experts call sound. **Don't change the strategy —
harden it.** Make three moves before feature code: **(1)** decide the Flights/Tours
Tier-1 question (my rec: Accommodation #1, Tours+Flights co-T1, build Tours first,
flights falsifiable); **(2)** build the *scaffolding* — instrumentation + the legal
basics — because the whole revenue case and your launch legality rest on it; **(3)**
land the data-model invariants atomically so the global layer can't corrupt the
curated one. Then Step 1 (the free Accommodation+Tours franchise) is a safe,
high-margin, measurable first ship.
