# CLAUDE.md — Tarmil Website (Prototype)

Guardrails for any agent working in this repo. Read this before writing code.

Tarmil's website is the **desktop trip planner extracted from the Tarmil app and
re-skinned** into a standalone web product. This repo is the **prototype** phase:
the *experience* only. Keep the app building and TypeScript-strict clean at all
times.

## What this is (and isn't)

- **In scope (prototype):** the planner experience — cities, map, city/transit
  bubbles, itinerary, wishlist, a *visual-only* booking mock, the disclosed
  merchant model, curated content for 10–12 cities with live-API fallback.
- **Out of scope — do NOT build:** real accounts, server-side trip persistence,
  shareable trip URLs, OG/meta cards, analytics + booking instrumentation, SEO
  pages, real affiliate booking, Hebrew/RTL UI, and the entire native app +
  social / forums / ping / tools surfaces. Trips live in **localStorage** only.
- **Booking is a visual mock** — no event tracking, no real deeplinks.

## Stack

Vite 5 · React 18 · TypeScript (strict) · Tailwind 3.4 · React Router 6 ·
Mapbox GL (with a graceful no-token fallback). Live free APIs stay wired:
Open-Meteo, Wikipedia, Nominatim, REST Countries, Overpass, OSRM, optional Groq.
Deploy target: Netlify. English only.

## Brand: warm-minimal-premium

Identity is "warm words in a minimal, premium frame." Keep the structural
discipline; the palette and type below are the warm-minimal restyle.

### Color — named tokens only, never raw hex in components

All colors are defined as named tokens in `src/brand/tokens.css` and mapped in
`tailwind.config.ts`. **Components reference tokens (Tailwind classes / CSS
variables) — never literal hex.** Working palette (designer finalizes later):

| Role | Working value |
|---|---|
| Background | `#E8E2D6` |
| Primary text | `#1F1F1C` |
| Secondary text | `#4B4A45` / `#5F5B53` |
| Dividers / subtle UI | `#C8C1B5` |
| Warm accents | `#8A3F08` / `#B86613` |
| Olive accents | `#566B2F` / `#70823B` |
| Near-black detail | `#11110F` |

### Type — Inter, self-hosted, understated

- **Inter only**, self-hosted. Regular/light weights — no heavy bold by default.
- Fraunces / Frank Ruhl Libre and the old serif/editorial type are **gone**.
- **7 type sizes only.** Use the named scale tokens; never an off-scale size.

### Spacing — the scale, nothing off-scale

Use the named spacing-scale tokens. Don't hand-roll one-off pixel values.

## CSS discipline (carried over, non-negotiable)

- **Logical CSS utilities only** — no physical `left`/`right` (`ml-`/`mr-`,
  `pl-`/`pr-`, `text-left/right`, etc.). Use the `start`/`end` logical
  equivalents so a later Hebrew/RTL flip stays cheap.
- **Focus rings on every interactive element.** Visible keyboard focus, always.
- **No `100vh`** — use `dvh`-based units / layout that survives mobile chrome.
- Keep contrast WCAG-reasonable on the warm background.

## Disclosure / merchant model (core — keep)

- Two badges: paid **"Sponsored"** and earned **"Tarmil Selection."**
- Seeded **demo** placements this phase (no real money).
- **Non-paying places are never suppressed** — organic places appear normally
  alongside sponsored ones.
- A one-tap **"What's this?"** explainer describes the model in plain, warm copy,
  visually quiet by default.

## Social proof — honest only

- Show **curated editorial star ratings** (Tarmil's honest curation score).
- **No fabricated user / save counts.** Save-counts stay hidden until real data
  exists. The old fake "friends know this place" avatar cluster is removed.

## Voice / copy rules

- Warmer, more human — but keep the mechanics: sentences **≤ ~28 words (prefer
  ~14)**, active voice.
- **Banned:** "synergy", "leverage" (verb), "ecosystem", "play" (noun).
- Warm words in a minimal premium frame; not corporate.

## i18n readiness

English only this phase. Don't hard-code direction; keep strings centralized
enough that a future Hebrew pass is a translation job, not a refactor. Do **not**
build Hebrew/RTL now.

## Designer escalations (don't invent — working values are fine for the prototype)

Final logo / wordmark, exact hex lock, licensed typeface, photography rule.
