/**
 * concierge — Tarmil's general travel assistant (open-world).
 *
 * Answers a traveler question from general travel knowledge, PREFERRING the live
 * trip facts in `ctx.facts` when they're relevant (currency/FX, weather, local
 * time, holidays, language, a visa status). It is a companion, not a closed
 * summarizer: it answers even when no fact was pre-loaded, and never invents
 * places, ratings, review counts, prices, or superlatives like "best" or "top".
 *
 * Sensitive topics (visa, entry, border, safety, health, vaccination, customs)
 * are answered as helpful ORIENTATION, never as an authoritative verdict: a
 * balanced picture plus a one-line "confirm with the official source", with the
 * official link returned in `sources` for the UI (Moffatt v. Air Canada).
 *
 * Every path is graceful. If the proxy is unavailable, or the reply is not
 * valid JSON in the expected shape, this resolves to `null`.
 *
 * Cache scheme: `concierge:${slug(question)}` — a slug of the question only.
 * Answers are grounded in `ctx`, so the caller should keep `ctx` stable for a
 * given question (e.g. the current trip) to keep cached answers coherent.
 */

import { aiText } from '../groqApi';

/** An official / external source the traveler should check. */
export type ConciergeSource = { label: string; url: string };

/** A grounded answer plus any official sources to verify against. */
export type ConciergeAnswer = { answer: string; sources: ConciergeSource[] };

const SYSTEM =
  'You are Tarmil, a warm, knowledgeable travel companion. Answer the traveler directly and usefully from your general travel knowledge: where to go, when to go, what to eat, neighborhoods, getting around, rough costs, culture, packing, itineraries. Be specific and genuinely helpful. NEVER refuse a question just because no fact was pre-loaded. ' +
  'When trip facts are provided below (currency and exchange rate, weather, local time, daylight, public holidays, language, a visa status), build on them and prefer them over a general guess. ' +
  'For SAFETY, VISA, ENTRY, or HEALTH questions: give a balanced, useful picture as orientation, and add ONE short sentence to confirm with the official government source. Speak as a helpful companion, NOT an official authority. Do not declare a definitive "it is safe" / "it is unsafe" verdict, and do not invent specific entry rules, fees, or vaccine mandates beyond what the provided facts support. ' +
  'Never invent or restate ratings, review counts, prices, or superlatives like "best", "top", or "#1". Prose only. ' +
  'Warm, active voice. Keep sentences to about 20 words or fewer, at most a few short paragraphs. Do not use em dashes. ' +
  'Reply with ONE JSON object and nothing else: {"answer": string, "sources": [{"label": string, "url": string}]}. ' +
  'Use "sources" for any official links you point to; use an empty array when you cite none. No commentary or code fences outside the JSON.';

/** Topics that must never get an authoritative answer (defense in depth). */
const SENSITIVE_PATTERN =
  /\b(visa|visas|entry|border|passport|customs|immigration|safety|safe|dangerous|crime|health|vaccin|vaccine|malaria|insurance)\b/i;

/** A neutral fallback pointer used when sensitive topics arrive with no sources. */
const TRAVEL_ADVISORY_SOURCE: ConciergeSource = {
  label: 'Official government travel advisories',
  url: 'https://www.iata.org/en/services/compliance/timatic/travel-documentation/',
};

/** Slugify a question into a stable, compact cache key segment. */
function slug(question: string): string {
  return question
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * Pull a JSON object out of a model reply that may be wrapped in prose or code
 * fences. Returns the parsed value, or `null` when nothing parses. Never throws.
 */
function parseJsonObject(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Validate and clean the model's `sources` array into real {label,url} pairs. */
function cleanSources(value: unknown): ConciergeSource[] {
  if (!Array.isArray(value)) return [];
  const out: ConciergeSource[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const entry = item as Record<string, unknown>;
    const url = typeof entry.url === 'string' ? entry.url.trim() : '';
    const label = typeof entry.label === 'string' ? entry.label.trim() : '';
    // Only accept http(s) links, so the model cannot smuggle in junk URLs.
    if (!/^https?:\/\//i.test(url) || label.length === 0) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ label, url });
    if (out.length >= 6) break;
  }
  return out;
}

/** Build the grounded prompt body from the caller's context. */
function buildUser(question: string, ctx: { cityNames: string[]; facts: string[] }): string {
  const cities = ctx.cityNames.filter((c) => typeof c === 'string' && c.trim().length > 0);
  const facts = ctx.facts.filter((f) => typeof f === 'string' && f.trim().length > 0);
  const cityLine = cities.length > 0 ? cities.join(', ') : '(none)';
  const factBlock =
    facts.length > 0 ? facts.map((f) => `- ${f.trim()}`).join('\n') : '(none yet)';
  return `Trip cities: ${cityLine}\n\nTrip facts you can rely on (prefer these over a guess):\n${factBlock}\n\nQuestion: ${question.trim()}`;
}

/**
 * Answer a traveler question, grounded strictly in `ctx`.
 *
 * Returns `null` when the proxy is unavailable or the reply is not valid JSON
 * in the expected shape. On success the `answer` is non-empty prose and
 * `sources` holds any official links to verify against (possibly empty). For
 * sensitive topics with no model-provided source, a neutral advisory pointer is
 * added so the traveler is always routed onward.
 */
export async function askConcierge(
  question: string,
  ctx: { cityNames: string[]; facts: string[] },
): Promise<ConciergeAnswer | null> {
  const trimmed = question.trim();
  if (trimmed.length === 0) return null;

  // Scope the cache to the trip's cities so the same question on a different
  // trip can't serve a stale, mis-grounded answer.
  const scope = slug(ctx.cityNames.join(',')) || 'trip';
  const raw = await aiText(`concierge:${scope}:${slug(trimmed)}`, SYSTEM, buildUser(trimmed, ctx), 320);
  if (!raw) return null;

  const obj = parseJsonObject(raw);
  if (!obj) return null;

  const answer = typeof obj.answer === 'string' ? obj.answer.trim() : '';
  if (answer.length === 0) return null;

  const sources = cleanSources(obj.sources);

  // Defense in depth: a sensitive question must always route onward, even if
  // the model returned no usable source link.
  if (sources.length === 0 && SENSITIVE_PATTERN.test(trimmed)) {
    sources.push(TRAVEL_ADVISORY_SOURCE);
  }

  return { answer, sources };
}
