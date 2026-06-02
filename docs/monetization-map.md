# Tarmil — Monetization Map (v1)

**Status:** PLAN. No app code changed. Every commission/cookie figure below is
program-stated, **directional, and must be re-confirmed in the live Travelpayouts
dashboard before wiring.** Synthesized from three specialist analyses (program
landscape · revenue model · placement/behavioral). Date: 2026-06-02.

> This supersedes, for the monetization surface, the prototype guardrail in
> `CLAUDE.md` that scoped booking as a visual-only mock with no affiliates/analytics.
> We are deliberately pivoting to real, disclosed affiliate monetization.

---

## 1. Thesis & governing rule

Tarmil earns when the traveler's journey is good enough that they **trust** it enough
to book through its links. **Revenue = trust × intent × timing — not surface count
or commission %.** The highest-converting asset already exists: the **dated
itinerary**. Once stops have dates and legs, Tarmil knows the exact city, dates,
route, and trip span a traveler will buy against — the richest affiliate context
there is.

**Governing rule:** *surface an offer only at the moment the traveler already feels
the need.* Never turn the planner into a storefront. Litmus test for any placement:
*"would a Tarmil curator recommend this to a friend, at this exact moment, for this
trip?"* If it only makes sense because it pays, it doesn't ship.

---

## 2. The economics — what actually earns

Modeled **per planned trip** (a user who builds a real itinerary), anchored to the
real seed data (5 cities / 19 nights). **EV = AOV × commission % × attach rate ×
units.** The two terms intuition underweights — **attach rate** and **units per
trip** — decide the ranking.

| Rank | Domain | Expected $/trip | Share | Why it lands here |
|---|---|---|---|---|
| 1 | **Accommodation** | $6.30 | 31% | Highest attach (everyone needs a bed) × real routed value. Volume beats rate. |
| 2 | **Tours & activities** | $5.46 | 27% | ~7% × **repeat impulse bookings across all 5 cities**. Units carry it. |
| 3 | Travel insurance | $2.34 | 12% | High take per policy; attach capped by Israeli insurer habit. |
| 4 | **Flights** | $2.16 | 11% | Huge AOV, but ~1.5% × low book-through (price-comparison leakage). |
| 5 | Attraction tickets | $2.02 | 10% | Same engine as tours, smaller AOV/units. |
| 6 | eSIM | $1.03 | 5% | High % on a tiny (~$18) base. |
| 7 | Transfers / car | $0.98 | 5% | Low attach for bus-hopping backpackers. |
| | **TOTAL / planned trip** | **~$20** | | conservative ~$6 · optimistic ~$57 · ≈ **$200K/yr at 10K planned trips** |

**eSIM vs flights, resolved:** flights win absolute dollars in every scenario
(~2× per trip, **~5× per sale**: ~$18 vs ~$3.60). eSIM's 20% headline sits on an
~$18 base — a mirage. **% × $ base, never % alone** — your instinct, quantified.
But *neither leads.*

**The franchise = Accommodation + Tours ≈ 58%.** Key correction to the intuitive
intent-ordering: **Tours is the hidden #2** — mid-commission compounding over many
bookings across many cities. They deserve **Tier-1 placement**, which "tours =
discretionary" thinking under-weights.

**The real ceiling = funnel completion × attach rate**, not domain mix. Attach is
the dominant lever and currently a *modeled guess* (see §8).

---

## 3. Integration vehicle — Travelpayouts (White Label / API path)

One **account → one `marker` (affiliate ID) + API token.** The marker rides every
deeplink/widget/API call for attribution; an optional **`sub_id`** tags
placement-level stats (e.g. `city=bangkok&slot=stay-strip`) — our clean per-slot
attribution hook.

**Approach: `marker` + deeplinks + selectively-styled widgets — NOT a full
White-Label takeover.** Keep the planner ours; place brand widgets/deeplinks at the
**decision moment** (booking sheet), because **"last cookie wins"** — our link must
be the last touch before purchase.

**Two hard constraints — do not trip on these:**
- ⚠️ **Hotellook is DEAD** (search ceased 2024; tracking ends Oct 2025). Do **not**
  build on its hotel API or White-Label hotel search. Route hotels through
  **Booking.com / Agoda / Trip.com / Hostelworld** widgets + deeplinks.
- ⚠️ **Aviasales real-time Flight Search API is GATED** (≥50K MAU + conversion
  thresholds + review). For now use the **open Flight *Data* API** (price-for-dates,
  calendars, cheapest routes) to *enrich* city/leg cards, and **deeplink the booking**
  to Aviasales / WayAway. Revisit the search API past 50K MAU.

**Verified (2026-06-02, live token):** the Flight **Data** API works — real
TLV→Bangkok ($1,096+) / TLV→Kathmandu ($348, 2 stops) prices + popular directions
from TLV — and static reference data (9,641 cities) is open. **Hotellook returns
404 — confirmed dead.** Distinction that matters: the **API token** (data /
enrichment) is *separate* from the affiliate **`marker`** (numeric ID that earns
commissions on deeplinks/widgets). We have the token; we still need the marker.
Both live in Netlify env vars at build time (`VITE_TRAVELPAYOUTS_TOKEN`,
`VITE_TRAVELPAYOUTS_MARKER`) — never committed.

---

## 4. The domain plan (program × economics × placement)

| Tier | Domain | Program (geo-fit) | Commission* | Integration | Surfaces at |
|---|---|---|---|---|---|
| **1** | **Accommodation** | Booking.com · **Hostelworld** (backpacker) · Agoda/Trip.com (Asia) | ~4% (verify net-of-cancel) | Widget + deeplink, **pre-filled with stop dates** | Itinerary stop (`StayStrip`, primary) + Stay tab (soft) |
| **2** | **Tours & activities** | GetYourGuide · Viator · **Klook (Asia)** · WeGoTrip (API) | ~7–10% | Deeplink/widgets; WeGoTrip API for native cards | City panel **See/Do** as curated cards |
| **1** | **Flights** | **WayAway (50% rev-share ≈ $6/flight)** > Aviasales (~1.1–1.5%) | low % / flat-ish | Data API price hints + **deeplink** | Transport legs (esp. home→first intl leg), `TransportBody` |
| 3 | Travel insurance | **EKTA** (20% of premium, ~$0.99/day) | ~20% | Deeplink/widget | "Before you fly" finalize checklist |
| 2 | Attraction tickets | Tiqets (8%) · Go City (3.4–6%) | 3–8% | Deeplink/widgets | Folded into See/Do with tours |
| 3 | eSIM | **Airalo** (~12%) | ~12% | Deeplink | "Before you fly" + cross-border moments |
| 3 | Transfers | **Kiwitaxi (50% of TP comm, up to ~$80/booking)** | rev-share | WL/widget/deeplink | Arrival seam (post-flight, in `TransportBody`) |
| 3 | Rail / bus | **12Go (SE Asia, 50% rev-share)** · Omio (Europe) | rev-share / ~6% | Widget + deeplink | Ground-transport legs |
| 3 | Car rental | DiscoverCars (up to 70%, **365-day cookie**) | high | Widget + deeplink | Where road trips apply (Georgia, parts of SA) |
| **DROP v1** | Events/concerts | TicketNetwork | 6–12.5% | — | US-centric, low backpacker fit; revisit later |

<sub>*Stated/directional — confirm in the dashboard.*</sub>

**Founder prioritization — FINAL (2026-06):** **T1 = Accommodation + Flights · T2 =
Tours + activities · T3 = eSIM + visa (iVisa, §4.1) + insurance + the long tail.**

### The tier is ONE of three axes — the "3D" model

A single linear tier collapsed three independent things, which is what made the
Flights-vs-Tours debate look like a conflict. It isn't:

| Domain | **Tier** (build priority) | **Stage** (where it surfaces) | **EV** (optimization intensity) |
|---|---|---|---|
| Accommodation | **T1** | dated stop | high |
| Flights | **T1** | transport leg | mid (leaky) |
| Tours / activities | T2 | city "dream" page | **high** |
| Attraction tickets | T2 | city page | mid |
| Insurance | T3 | finalize | mid |
| eSIM / visa | T3 | finalize | low |
| Transfers / rail / car | T3 | arrival leg | low |

- **Tier** decides what we wire **first + front-and-center** (the founder's call, final).
- **Stage** decides *where* each lives — and **Flights (transport leg) and Tours
  (city page) sit on different screens, so they never compete for the same slot.**
  This dissolves the audit's Flights-vs-Tours tension entirely.
- **EV** decides *how hard we tune conversion* — so **Tours is optimized aggressively
  even at T2** (it earns), and **Flights stays T1 but is instrumented** for its one
  weak spot, attach-leakage to Google Flights/Skyscanner: the handoff must be
  pre-filled, price-hinted (the validated Data API), one-tap, with a book-through
  kill-criterion.

### 4.1 Category gaps beyond Travelpayouts (we're open to other APIs)

| Gap | Reality | Recommended fill |
|---|---|---|
| **Restaurants / dining** | TP has no OpenTable-style program; restaurant *reservations* pay little **anywhere** | Keep dining as **curated content** (the Eat tab — honest value, not a revenue line). Monetize only where a real affiliate exists: **TheFork** (Tripadvisor-owned, strong in Europe, pays per seated diner) or the broad **Tripadvisor** affiliate. Do not over-invest. |
| **Visa services** | TP doesn't sell visas — but our visa-rules *enrichment* creates the intent | **iVisa affiliate** — monetize visa/eVisa processing right beside the (free) visa-rule info. A genuine bonus line tied to real need (India e-visa, Nepal on-arrival). Verify commission. |
| Luggage storage | moment-of-need on travel days | **Radical Storage** (direct affiliate) — low priority, only if it slots into a day view. |
| Lounges / fast-track | minor | Priority Pass / LoungeBuddy affiliates — low priority. |
| Ride-hailing (Uber/Bolt/Grab) | generally **no affiliate** | Not monetizable — link out only if useful. |

**Takeaway:** the only gap worth real attention is **visa (iVisa)** — it's a new
monetizable line, not just a fill. Restaurants stay a *trust/content* asset.

### 4.2 Handpicked affiliates — fame × payout (the "connect these" list)

Synthesis of two audits (brand fame/trust + cookie-adjusted *realized* payout).
For most categories fame and pay **align**; two needed a judgment call.

| Category | **Pick** | Also connect | Why |
|---|---|---|---|
| Accommodation — general | **Booking.com** | — | #1 brand in Israel + global; **~5% via Travelpayouts** (Bookinggeddon-safe). Fire the deeplink at the *last* tap to beat its session cookie. |
| Accommodation — backpacker | **Hostelworld** | — | The hostel brand **and 18–22%** — fame + pay aligned for the audience. |
| Accommodation — Asia | **Agoda** | Trip.com | High rate; **verify the TP cookie** (may be 1-day → use Trip.com's 7–30d). |
| Flights | **Skyscanner** | WayAway (cashback alt) | #3 site in Israel — the trusted click. WayAway pays more but is unknown; flights are a T1 *trust-play*, so the trusted name is the hero. |
| Tours | **GetYourGuide** | Klook (Asia), Viator | 8% + 30-day = cleanest payout + premium brand. Both axes agree. |
| Attraction tickets | **Tiqets** | GetYourGuide | Weak-brand category → payout picks Tiqets (8%/30d). |
| eSIM | **Airalo** | — | Leader + ~12% + TP-native (small $ — garnish). |
| Insurance | **EKTA** | SafetyWing (global) | No household name for Israelis (they buy local) → payout decides → EKTA (20%/premium, paid at policy start). |
| Visa | **iVisa** | — | Sole brand; **verify TP vs external network**. |
| Transfers | **Kiwitaxi** | — | Weak brand → TP-native, up to ~$80/booking. |
| Rail / bus | **12Go** (Asia) · **Omio** (EU) | — | Region-split; 12Go = the SE-Asia routes, on TP. |
| Car rental | **DiscoverCars** | — | Best cookie in the stack (**365-day**) + award-winning brand. Both axes agree. |

**Two judgment calls (fame vs pay):** **Flights → Skyscanner** (trusted click >
WayAway's higher-but-unknown payout; flights are a T1 trust-play). **Insurance →
EKTA** (weak-brand for Israelis → payout wins; SafetyWing carries the global segment).

**Connect-in-dashboard order:** **T1 now** — Booking.com, Hostelworld, Skyscanner ·
**T2** — GetYourGuide (+ Klook), Tiqets · **T3 later** — Airalo, iVisa, EKTA,
Kiwitaxi, 12Go (+ Omio), DiscoverCars.

**Don't / verify:** skip **Airbnb** (program closed 2021); don't hero
**WayAway/Aviasales** (unknown to the audience). Verify: Booking/Agoda **cookie
length**, **iVisa/Omio/Welcome-Pickups** TP availability, GYG 8%(TP)-vs-7%(Awin)
route. Note: **"Bookinggeddon" (2025) cut Booking's *direct* affiliates but
Travelpayouts is unaffected** — the marker route is the safe path.

---

## 5. Placement map (journey stage → offers)

| Stage | Surface (existing/new) | Offers | Intent | Timing logic |
|---|---|---|---|---|
| 0 · Route pick | `QuickStartEmpty` (existing) | **none** | — | protect the dream |
| 1 · City browsing | `PlaceCard`/tabs + `StayStrip` (existing) + **tours card (new variant)** | tours, tickets (**Tier-1**); soft accommodation | impulse/experiential | sell while dreaming |
| 2 · Itinerary build | `StayStrip`, `WishlistRow` reserved (existing) | **accommodation (primary)** | high/certain | dates unlock the bed |
| 3 · Per-leg transport | `LegRow`, `TransportBody` (existing); **transfer block (new)** | flights (primary); transfers (contextual) | high/certain | route creates the need |
| 4 · Trip finalize | **"Before you fly" (new)** in `TripOverviewCard`/overlay | eSIM, insurance + free passport/visa/holiday reminders | second-tier | peace-of-mind at trip-lock |

---

## 6. Free enrichment (keep 5 — curate, don't bloat)

Already wired: Open-Meteo, Wikipedia, Nominatim, REST Countries, Overpass, OSRM.

| API | Adds | Call |
|---|---|---|
| **ExchangeRate-API** (no key) | FX → show prices in ILS for the audience | **KEEP** — cache 24h |
| **Nager.Date** (no key) | Public holidays → closure warnings on dated stops | **KEEP** |
| **US State Dept advisories** | Neutral official safety signal | **KEEP** — frame as "official (US State Dept)", not Tarmil's opinion |
| **REST Countries** | Currency/language/region (pairs with FX) | **KEEP** (already in) |
| **Visa rules** (Passport-Index dataset, MIT) | Israeli-passport entry rules | **KEEP** — self-host; "verify with embassy" disclaimer |
| Paid visa/vaccine/risk APIs | — | **DROP** — link out instead |

---

## 7. Guardrails (the flywheel depends on these)

- Disclose every paid placement at the decision point — reuse `PlacementBadge`
  (Sponsored / Tarmil Selection) + the `PlacementExplainer` "What's this?".
- **Never suppress organic;** always show non-paying options alongside paid ones.
- **No fake urgency / scarcity / social proof** (consistent with the W13 honesty pass).
- Keep the **two-step pattern**: browse card shows the option → partner handoff lives
  in the detail sheet, after the user taps in (intent).
- **Pre-fill from real trip data** (dates/city/route) so offers are shortcuts, not pitches.
- Every offer **dismissible**; respect the "no" (don't re-surface a skipped eSIM).
- No interstitials, no confirm-shaming, no disguising an ad as neutral curation.

---

## 8. Attribution (a deliberate, scoped change)

Attach rate is the dominant revenue lever and currently **unmeasured**. To tune
revenue we need **light attribution**: `sub_id` per placement (Travelpayouts gives
per-slot stats) + minimal client events (link-shown, link-clicked). This
intentionally revisits the prototype's "no analytics / no booking instrumentation"
guardrail — now **in scope, scoped tightly to affiliate performance, not
surveillance.** Owned by the `conversion-tracking-specialist` agent at build time.

---

## 9. Architecture (build-ready; no account needed yet)

A thin **affiliate-link layer** — one module that builds marked links per brand
(`marker` + `sub_id`) from trip context (city, dates, span) — so adding/swapping
partners is **config, not code.** The current surfaces are already the right shape:
`WebBookingSheet` (stay+transport), `StayStrip`, `LegRow`/`TransportBody`,
`PlaceCard`. We flip cosmetic links → marked deeplinks, add the **tours card
variant** (Stage 1) and the **"Before you fly"** surface (Stage 4).

---

## 10. Roadmap

- **Phase 0 (now):** this map + the affiliate-link-layer design. *(No account needed.)*
- **Phase 1 (needs your marker):** **the 58% franchise** — accommodation deeplinks
  pre-filled from itinerary dates + tours cards at city level, under the marker, with
  `sub_id` + disclosure.
- **Phase 2:** flights (Data API hints + WayAway deeplink) + transfers + the
  "Before you fly" checklist (insurance + eSIM).
- **Phase 3:** free enrichment (FX, holidays, advisories, visa) + the attach-rate
  optimization loop (growth-hacker + conversion-tracking + financial-analyst).

---

## 11. Verify before / while building

1. **Real commission rates** in your Travelpayouts dashboard — especially
   accommodation **net-of-cancellation** (if ≤2.5%, Tours becomes #1).
2. Your **Travelpayouts `marker` + token** (from the "White Label / API" onboarding path).
3. **Audience mix** (solo/pairs vs groups) — shifts flights/accommodation AOV and ranking.

---

## 12. Sources

Travelpayouts API reference (travelpayouts.github.io/slate) · White Label & widgets
docs · Aviasales Flight Search API requirements · Hotellook closure FAQ · TP blogs
for tours/Kiwitaxi/DiscoverCars/Airalo/insurance(EKTA)/12Go · impact.com travel
programs · Free APIs: ExchangeRate-API, Nager.Date, US State Dept advisories,
Passport-Index dataset (MIT). Full link list in the research transcript.
