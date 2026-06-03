/**
 * concierge — a grounded trip-question answerer.
 *
 * Answers a traveler question STRICTLY from facts the caller supplies in
 * `ctx.facts` and the planned `ctx.cityNames`. It is a summarizer over given
 * context, not a knowledge base: if the answer is not in the provided facts, it
 * says so and points the traveler to official sources. It never invents places,
 * ratings, review counts, prices, or superlatives like "best" or "top".
 *
 * Sensitive topics (visa, entry, border, safety, health, vaccination, customs)
 * are NEVER answered authoritatively. For those it gives a short, careful
 * summary and routes to official sources, returned in `sources` for the UI.
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
  'You are a warm, knowledgeable trip concierge. Use the facts provided to answer the traveler directly and usefully. ' +
  'When a fact answers the question (a visa status, a public holiday, an exchange rate, the local time, weather, the language), STATE IT plainly and helpfully. Do not dodge a question you have a fact for. ' +
  'For visa, entry, safety, or health topics: give the answer from the facts, then add ONE short sentence to confirm with the official source. Never refuse outright when a relevant fact is provided. ' +
  'Only when no provided fact is relevant: say briefly what you do not have, and suggest the official source to check. ' +
  'Never invent specifics that are not in the facts, and never invent or restate ratings, review counts, prices, or superlatives like "best" or "top". Prose only. ' +
  'Warm, active voice. Keep sentences to about 20 words or fewer, a few sentences at most. Do not use em dashes. ' +
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
    facts.length > 0 ? facts.map((f) => `- ${f.trim()}`).join('\n') : '(no facts provided)';
  return `Trip cities: ${cityLine}\n\nFacts you may use (and nothing else):\n${factBlock}\n\nQuestion: ${question.trim()}`;
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
