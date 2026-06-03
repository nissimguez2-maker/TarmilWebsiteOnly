import { aiText } from '../groqApi';
import type { TripIntent, TripRegion } from './archetypes';

/**
 * inferIntent — the cold-start "describe your trip" lane.
 *
 * Maps a free-text brief ("two weeks in Italy with the kids, relaxed") to a
 * structured {@link TripIntent} the existing archetype drafter consumes, so the
 * doorway's chat-style entry reuses the SAME honest engine as the chips (no new
 * trust surface for the AI to be wrong on — it only fills the same four fields).
 * Continent-granularity, matching the drafter; a specific country resolves to its
 * continent. Always resolves — falls back to a sensible default, never throws.
 */
const REGIONS = ['europe', 'americas', 'asia', 'middle-east', 'africa', 'oceania', 'any'];
const WHOS = ['solo', 'pair', 'friends', 'family'];
const BUDGETS = ['shoestring', 'mid', 'comfort'];

const FALLBACK: TripIntent = { region: 'any', who: 'pair', budget: 'mid', weeks: 2 };

const SYSTEM =
  "Extract a trip intent from the traveler's text. Reply with ONE JSON object and nothing else: " +
  '{"region":"...","who":"...","budget":"...","weeks":N}. ' +
  'region is the CONTINENT: one of europe, americas, asia, middle-east, africa, oceania ' +
  '(map any country or city to its continent), or "any" if unclear. ' +
  'who: solo, pair, friends, or family. budget: shoestring, mid, or comfort. weeks: integer 1 to 6. ' +
  'Infer sensibly; when the text is silent use who=pair, budget=mid, weeks=2, region=any. ' +
  'Output no prose, no code fences.';

function clampWeeks(n: unknown): number {
  const x = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(x)) return 2;
  return Math.min(6, Math.max(1, Math.round(x)));
}

export async function inferIntentFromBrief(brief: string): Promise<TripIntent> {
  const text = brief.trim();
  if (!text) return FALLBACK;
  try {
    const raw = await aiText(
      `infer:${text.toLowerCase().replace(/\s+/g, ' ').slice(0, 200)}`,
      SYSTEM,
      text,
      80,
    );
    if (!raw) return FALLBACK;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return FALLBACK;
    const obj = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const region =
      typeof obj.region === 'string' && REGIONS.includes(obj.region)
        ? (obj.region as TripRegion)
        : 'any';
    const who =
      typeof obj.who === 'string' && WHOS.includes(obj.who)
        ? (obj.who as TripIntent['who'])
        : 'pair';
    const budget =
      typeof obj.budget === 'string' && BUDGETS.includes(obj.budget)
        ? (obj.budget as TripIntent['budget'])
        : 'mid';
    return { region, who, budget, weeks: clampWeeks(obj.weeks) };
  } catch {
    return FALLBACK;
  }
}
