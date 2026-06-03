# Tarmil — UX / Journey / Monetization Strategy Audit (7-lens synthesis)

**Status:** Chairman synthesis of seven parallel agency lenses — UX Researcher, UX Architect,
UI Designer, Product Manager, Growth Hacker, Behavioral Nudge Engine, Trend Researcher —
each grounded in the live code. Date: 2026-06. Founder-approved build plan (all phases,
incl. the structural front-end restructure). This doc is the source of truth for the work.

## Verdict (near-unanimous)

The planner is the **right spine and well-built** (strong token discipline, honest disclosure,
a clean data layer). But three structural truths surfaced from every angle:

1. **It's a trip-*finishing* tool wearing the clothes of a trip-*dreaming* tool.** It's excellent
   at sequence → date → finalize, and thin exactly where the backpacker spends 80% of their
   energy: **dream + shortlist**. The cold-start (`QuickStartEmpty`) assumes the user already
   knows their route; the post-army traveler arrives with *vibe + constraints*, not a route name.
2. **The revenue path is neither wired nor measured.** The booking handoff is still a cosmetic
   toast (`WebBookingSheet`), there is **zero funnel instrumentation**, origin is silently
   defaulted (it prices flights), and dating (which unlocks accommodation pre-fill) is buried.
3. **The founder's three instincts are all correct** (the stats box, personalization, the 3-trips
   vision) — see verdicts.

## The unifying insight

Every lens converged on one fix: a **3-option "choose your trip" doorway** at the front.
It converts *"blank planner, I don't know where to go"* into *"pick one of three"* — the
decision-comfort sweet spot — it **is** the personalization capture, and (the money part) each
option is bookable cities, so it **front-loads the affiliate surface** and **ignites a dated
itinerary** (the only artifact that monetizes). Front door fills the funnel; the dated-trip
booking handoff drains it into commission. They are one funnel.

**The engine already ships:** `draftRoute()` returns ordered city-ids and `addRoute()` builds a
dated itinerary today — so the doorway is `draftRoute ×3` + a card UI = **medium effort.**

## The critical correction (content reality)

There are **18 curated, clustered cities** (`addableCities.ts`). So the options cannot be
*"totally different destinations"* yet — that yields "the same trip three times" and breaks trust
at the front door. Ship **3 distinctly-*shaped* trips — "The Chill One / The Classic /
The Adventure"** (deeper-fewer / canonical / faster-more, budget-tiered), differing on the axes the
user actually chose (vibe · pace · budget). Geographic variety unlocks automatically as the
catalog grows. The options **must be grounded in real curated cities (the honesty firewall), not a
free-form LLM** — which is also the moat: ~9 of 10 AI itineraries today contain a major error and
~1 in 4 recommend a closed business (Trend lens, 2026 sources).

## The founder's three questions — verdicts

- **Stats box (days/legs/nights, `TripOverviewCard`):** too big + partly vanity. **Cut "legs"**
  (planner jargon, zero user action), **keep nights + date-span**, and convert the tally into a
  forward-looking **"readiness ledger"** — *"3/5 stops have a stay · 2 legs need transport ·
  dates set"* — so every gap is an honest, well-timed booking moment (goal-gradient). Never render
  zeros on empty. Structurally it belongs in the trip-focus context column (Phase 2).
- **Personalization settings:** **do NOT build a settings page** (cold infrastructure nobody
  fills). Capture it **in-flow as a 3-tap step that *is* the questionnaire** — order
  **Vibe → Who's going → Budget** (chips, defaults, one-tap skip, progress dots). The fields that
  pay: vibe, who/group, budget, length (+ origin, dates). **Age/kids are noise for the post-army
  core** — encode "kids" silently via *Who's going → Family* (relevant only for the global/family
  base later). Persist as `TripIntent` on the existing `web_trips` row (jsonb) + local cache.
- **The 3-trips vision:** **BUILD — the single highest-leverage move.** Front door, not in-planner;
  funnels into the editable planner. Exactly **3** options (1 = no agency, 5+ = overload), labeled
  by identity, ordered **by user-fit only — never commission**, no decoy/strawman, no fabricated
  social proof. `PlanDraftBox` becomes the "or describe it yourself" fallback; concierge untouched.
  Ship it **instrumented** or not at all.

## Key cross-lens convergences (≥5 lenses)

| Theme | Convergence |
|---|---|
| 3-trip doorway | Build it; front door; editable draft; reuse `draftRoute`/`addRoute`; grounded in curated cities; instrumented |
| Personalization | In-flow 3-tap capture, not a settings page; kids/age = noise for the core; persist on `web_trips` |
| Stats box | Shrink + repurpose to a forward "readiness/next-action" line; cut "legs"; keep nights |
| Revenue spine | Instrument the funnel (P0); confirm origin; first-class dating; budget-tier the stay deeplink; finalize = the celebrated finish line + T3 |
| Structure | Dock the floating city panel into a real 3rd column; route-split `/` → `/plan` → `/trip/ready` + `/preferences`; incremental, data core untouched |
| Honesty/legal | Grounded options; no fake social proof; privacy/terms + consent gate before tracking + preference data; firewall holds through personalized re-sort |

## The plan (founder-approved: all phases)

**Phase 0 — quick wins (S).** Stats box → readiness line (cut "legs"); FX shown **ILS → foreign,
2 decimals** + a default-ILS **changeable home-currency** selector; quiet the olive "Before you
fly" CTA, keep "Add stop" prominent.

**Phase 1 — the 3-trip doorway (M, the bet).** 3-tap Vibe→Who→Budget → 3 archetype `RouteCard`s
(grounded in curated cities) → pick → drops into the editable planner; demote `PlanDraftBox`;
persist `TripIntent`; instrument the funnel (questionnaire→options→pick→dated).

**Phase 1.5 — revenue plumbing (M, parallel; some founder-gated).** Privacy/terms pages + EU/IL
consent gate; budget-tier the accommodation deeplink; confirm origin; first-class dating.
*(Real affiliate handoff still needs the founder's Travelpayouts sample link.)*

**Phase 2 — structural (M).** Dock the city/transit panel into a real 3rd column (stop occluding
the map); route-split `/` discover → `/plan` plan → `/trip/ready` finalize + a `/preferences`
drawer; relocate the trip summary + concierge into a `trip`-focus context column. Incremental,
additive routing; reuse `tripMutations`/`tripStorage`/`tripSync`/`wishlist`/`WebCityPanel`/
`WebTransportPanel` unchanged.

**Phase 3 — deeper (L, later).** A "shortlist / considering" layer (park cities as *maybes* before
committing dates — UX's top comfort fix, a data-model change); vibe→tours surfacing (after
budget-tiering proves the attach link); a return-loop nudge as the trip date nears.

## Guardrails (non-negotiable)

- Options ordered by user-fit **never by commission**; no decoy trips; no fabricated social proof;
  grounded in real curated cities. The editorial gold star renders only from Tarmil's `rating`;
  Sponsored/Selection badges survive any personalized re-sort.
- Personalization data stays trip-shaping only, anon-auth, behind the privacy/consent work.
- Honor the brand: warm-minimal, logical CSS, focus rings, no `100vh`, English-only.
