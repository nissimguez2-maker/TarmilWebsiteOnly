import { useEffect, useId, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Button } from '../../components/Button';
import { ADDABLE_CITIES } from './addableCities';
import { useCityPhotos } from './cityPhotos';
import {
  draftArchetypes,
  type TripArchetype,
  type TripIntent,
  type TripRegion,
  type TripVibe,
} from './ai/archetypes';

/**
 * TripDoorway — the warm front door of the planner.
 *
 * Two acts, never a chat and never a long form:
 *  1. a three-tap "let's shape your trip" intent step (where / who / budget,
 *     plus a small length control), then
 *  2. a calm GALLERY of three editable AI-drafted trips, each rendered in the
 *     existing RouteCard anatomy (hero photo → vibe → title → rationale → city
 *     chain → nights). Cards differ by CONTENT, not chrome.
 *
 * Honesty is built in: one quiet "AI draft · fully editable" line sits above the
 * row, no fabricated social proof, no "most popular". Every state degrades
 * gracefully — a calm sand-pulse while drafting, and a friendly fallback to the
 * manual route flow when {@link draftArchetypes} returns null.
 */

type Props = {
  /** Chosen trip → drops into the editable planner. */
  onPick: (cityIds: string[], meta: { vibe: string; title: string }) => void;
  /** So the parent can persist + instrument the captured intent. */
  onIntentChange?: (intent: TripIntent) => void;
  /** "I'll build it myself" → the parent shows the manual fallback. */
  onSkip: () => void;
  /** Funnel events: 'doorway_step', 'options_shown', 'option_picked'. */
  onEvent?: (name: string, props?: Record<string, unknown>) => void;
};

/* ── Intent vocabulary ──────────────────────────────────────────────────────
 * Local option tables typed against the imported contract unions, so the chip
 * values always map cleanly onto the TripIntent the drafter consumes. The label
 * is what the traveler reads; the value is what the model receives.
 * ─────────────────────────────────────────────────────────────────────────── */

type Option<T> = { value: T; label: string };

// Who / budget value vocabularies are derived straight from TripIntent, so the
// chip values can never drift from the contract the drafter validates against.
type WhoValue = TripIntent['who'];
type BudgetValue = TripIntent['budget'];

// Continents now, not the original backpacker trail — the catalog spans the
// globe. "Surprise me" maps to the contract's 'any' region, which the drafter
// resolves to one real continent so the trip stays coherent; the reader-facing
// label stays warm, the value stays a legal TripRegion.
const REGIONS: ReadonlyArray<Option<TripRegion>> = [
  { value: 'europe', label: 'Europe' },
  { value: 'americas', label: 'Americas' },
  { value: 'asia', label: 'Asia' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'africa', label: 'Africa' },
  { value: 'oceania', label: 'Oceania' },
  { value: 'any', label: 'Surprise me' },
];

const WHO: ReadonlyArray<Option<WhoValue>> = [
  { value: 'solo', label: 'Solo' },
  { value: 'pair', label: 'Pair' },
  { value: 'friends', label: 'Friends' },
  { value: 'family', label: 'Family' },
];

const BUDGET: ReadonlyArray<Option<BudgetValue>> = [
  { value: 'shoestring', label: 'Shoestring' },
  { value: 'mid', label: 'Comfortable' },
  { value: 'comfort', label: 'Treat yourself' },
];

const WEEKS: readonly number[] = [1, 2, 3, 4];

/** Sensible defaults — the door opens with a complete, editable intent. */
const DEFAULT_REGION: TripRegion = 'europe';
const DEFAULT_WHO: WhoValue = 'pair';
const DEFAULT_BUDGET: BudgetValue = 'mid';
const DEFAULT_WEEKS = 3;

/**
 * The quiet meta-caps label for each vibe. Typed as a total map over the closed
 * TripVibe union, so the compiler guarantees every vibe has a label and the
 * lookup can never miss — no runtime fallback needed.
 */
const VIBE_LABEL: Record<TripVibe, string> = {
  chill: 'Chill',
  classic: 'Classic',
  adventure: 'Adventure',
};

type Phase = 'intent' | 'loading' | 'choosing' | 'empty';

export function TripDoorway({
  onPick,
  onIntentChange,
  onSkip,
  onEvent,
}: Props) {
  const [step, setStep] = useState(0); // 0 where · 1 who · 2 budget
  const [intent, setIntent] = useState<TripIntent>({
    region: DEFAULT_REGION,
    who: DEFAULT_WHO,
    budget: DEFAULT_BUDGET,
    weeks: DEFAULT_WEEKS,
  });
  const [phase, setPhase] = useState<Phase>('intent');
  const [archetypes, setArchetypes] = useState<TripArchetype[]>([]);

  const TOTAL_STEPS = 3;

  // Fire a step event whenever the intent step changes (mounts on the first too).
  useEffect(() => {
    if (phase !== 'intent') return;
    onEvent?.('doorway_step', { step: step + 1 });
  }, [step, phase, onEvent]);

  const patch = (next: Partial<TripIntent>) =>
    setIntent((prev) => ({ ...prev, ...next }));

  const beginDrafting = async (finalIntent: TripIntent) => {
    onIntentChange?.(finalIntent);
    setPhase('loading');
    let drafts: TripArchetype[] | null = null;
    try {
      drafts = await draftArchetypes(finalIntent);
    } catch {
      drafts = null;
    }
    if (drafts && drafts.length > 0) {
      setArchetypes(drafts);
      setPhase('choosing');
    } else {
      setPhase('empty');
    }
  };

  const advance = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }
    void beginDrafting(intent);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <section
      aria-label="Choose your trip"
      className="mx-md my-md flex flex-col gap-md"
    >
      {phase === 'intent' && (
        <IntentStep
          step={step}
          totalSteps={TOTAL_STEPS}
          intent={intent}
          onPatch={patch}
          onNext={advance}
          onBack={back}
          onSkip={onSkip}
        />
      )}

      {phase === 'loading' && <DraftingState />}

      {phase === 'choosing' && (
        <Gallery
          archetypes={archetypes}
          onPick={onPick}
          onSkip={onSkip}
          onEvent={onEvent}
        />
      )}

      {phase === 'empty' && <EmptyState onSkip={onSkip} />}
    </section>
  );
}

/* ── Act 1 · intent ─────────────────────────────────────────────────────── */

function IntentStep({
  step,
  totalSteps,
  intent,
  onPatch,
  onNext,
  onBack,
  onSkip,
}: {
  step: number;
  totalSteps: number;
  intent: TripIntent;
  onPatch: (next: Partial<TripIntent>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const groupLabelId = useId();
  const isLast = step === totalSteps - 1;

  return (
    <div className="flex flex-col gap-md">
      <header className="flex items-start justify-between gap-sm">
        <div className="flex flex-col gap-xs">
          <ProgressDots total={totalSteps} current={step} />
          <h2 className="font-serif text-sub text-charcoal leading-tight">
            Let&apos;s shape your trip
          </h2>
          <p className="text-small text-charcoal-70">
            Three quick taps. You can change anything later.
          </p>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="shrink-0 rounded text-meta uppercase tracking-wide text-charcoal-55 hover:text-charcoal transition-colors duration-instant ease-out-quart motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Skip
        </button>
      </header>

      <fieldset className="flex flex-col gap-sm border-0 p-0 m-0">
        <legend id={groupLabelId} className="meta-caps text-charcoal-70">
          {step === 0 ? 'Where to' : step === 1 ? "Who's going" : 'Budget'}
        </legend>

        {step === 0 && (
          <ChipGroup
            ariaLabelledby={groupLabelId}
            options={REGIONS}
            selected={intent.region}
            onSelect={(region) => onPatch({ region })}
          />
        )}
        {step === 1 && (
          <ChipGroup
            ariaLabelledby={groupLabelId}
            options={WHO}
            selected={intent.who}
            onSelect={(who) => onPatch({ who })}
          />
        )}
        {step === 2 && (
          <ChipGroup
            ariaLabelledby={groupLabelId}
            options={BUDGET}
            selected={intent.budget}
            onSelect={(budget) => onPatch({ budget })}
          />
        )}
      </fieldset>

      <LengthControl
        weeks={intent.weeks}
        onChange={(weeks) => onPatch({ weeks })}
      />

      <div className="flex items-center justify-between gap-sm pt-xs">
        {step > 0 ? (
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span aria-hidden />
        )}
        <Button variant="olive" size="sm" onClick={onNext}>
          {isLast ? 'Show me trips' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

/** Progress dots — ●●○. Decorative; the heading carries the real label. */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <span className="flex items-center gap-xs" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            'block h-1.5 w-1.5 rounded-full transition-colors duration-instant ease-out-quart motion-reduce:transition-none',
            i <= current ? 'bg-charcoal' : 'bg-charcoal-15',
          )}
        />
      ))}
    </span>
  );
}

/** A row of single-select pills reusing the app's pill grammar. */
function ChipGroup<T extends string | number>({
  options,
  selected,
  onSelect,
  ariaLabelledby,
}: {
  options: ReadonlyArray<Option<T>>;
  selected: T;
  onSelect: (value: T) => void;
  ariaLabelledby: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={ariaLabelledby}
      className="flex flex-wrap gap-sm"
    >
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(opt.value)}
            className={clsx(
              'rounded-full px-md py-sm text-small font-medium leading-none',
              'transition-[background-color,color] duration-instant ease-out-quart motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
              isSelected
                ? 'bg-amber text-cream'
                : 'bg-charcoal-8 text-charcoal hover:bg-charcoal-15',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Small length control — 1 / 2 / 3 / 4+ weeks. */
function LengthControl({
  weeks,
  onChange,
}: {
  weeks: number;
  onChange: (weeks: number) => void;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-xs">
      <span id={labelId} className="meta-caps text-charcoal-70">
        How long
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="inline-flex w-fit rounded-full bg-charcoal-8 p-1"
      >
        {WEEKS.map((w) => {
          const isSelected = w === weeks;
          const label = w === 4 ? '4+ weeks' : `${w} ${w === 1 ? 'week' : 'weeks'}`;
          return (
            <button
              key={w}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              onClick={() => onChange(w)}
              className={clsx(
                'rounded-full px-sm py-xs text-small font-medium leading-none tnum',
                'transition-[background-color,color] duration-instant ease-out-quart motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                isSelected
                  ? 'bg-amber text-cream'
                  : 'text-charcoal-70 hover:text-charcoal',
              )}
            >
              {w === 4 ? '4+' : w}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Act 2 · the gallery ────────────────────────────────────────────────── */

function Gallery({
  archetypes,
  onPick,
  onSkip,
  onEvent,
}: {
  archetypes: TripArchetype[];
  onPick: (cityIds: string[], meta: { vibe: string; title: string }) => void;
  onSkip: () => void;
  onEvent?: (name: string, props?: Record<string, unknown>) => void;
}) {
  // Fire exactly once when the gallery mounts (the three cards have rendered).
  // Empty deps is deliberate: the Gallery is remounted per draft, so mount IS
  // the "options shown" moment — we don't want a re-fire on prop identity churn.
  useEffect(() => {
    onEvent?.('options_shown', { count: archetypes.length });
  }, []);

  return (
    <div className="flex flex-col gap-md">
      <header className="flex flex-col gap-xs">
        <h2 className="font-serif text-sub text-charcoal leading-tight">
          Three trips to start from
        </h2>
        {/* "AI-drafted" woven into the copy keeps EU-AI-Act transparency without a
            separate disclaimer line; the full AI notice lives on the /info page. */}
        <p className="text-small text-charcoal-70">
          AI-drafted starting points. Pick one and shape every stop, date, and
          order yourself.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-md md:grid-cols-3">
        {archetypes.map((archetype, i) => (
          <li key={`${archetype.title}-${i}`} className="flex">
            <ArchetypeCard
              archetype={archetype}
              onPick={onPick}
              onEvent={onEvent}
            />
          </li>
        ))}
      </ul>

      <DescribeYourselfLink onSkip={onSkip} />
    </div>
  );
}

/** One trip in the gallery — the RouteCard anatomy, differentiated by content. */
function ArchetypeCard({
  archetype,
  onPick,
  onEvent,
}: {
  archetype: TripArchetype;
  onPick: (cityIds: string[], meta: { vibe: string; title: string }) => void;
  onEvent?: (name: string, props?: Record<string, unknown>) => void;
}) {
  const cities = useMemo(
    () =>
      archetype.cityIds
        .map((id) => ADDABLE_CITIES.find((c) => c.id === id))
        .filter((c): c is (typeof ADDABLE_CITIES)[number] => Boolean(c)),
    [archetype.cityIds],
  );

  const nights = useMemo(
    () => cities.reduce((sum, c) => sum + c.defaultNights, 0),
    [cities],
  );

  const firstCity = cities[0];
  const photo = useCityPhotos(firstCity?.id ?? '', firstCity?.nameEn ?? '')[0];
  const cityChain = cities.map((c) => c.nameEn).join(' · ');
  const vibe = VIBE_LABEL[archetype.vibe];

  const handlePick = () => {
    onEvent?.('option_picked', { vibe: archetype.vibe });
    onPick(archetype.cityIds, {
      vibe: archetype.vibe,
      title: archetype.title,
    });
  };

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-charcoal-15 bg-sand shadow-card transition-[transform,box-shadow,border-color] duration-instant ease-out-quart motion-reduce:transition-none hover:-translate-y-px hover:border-amber hover:shadow-panel">
      <span className="block h-32 w-full overflow-hidden bg-charcoal-8">
        {photo && (
          <img
            src={photo}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </span>

      <div className="flex flex-1 flex-col gap-xs p-md">
        <span className="meta-caps text-charcoal-55">{vibe}</span>
        <h3 className="font-serif text-lede text-charcoal leading-tight">
          {archetype.title}
        </h3>
        <p className="text-small text-charcoal-70">{archetype.rationale}</p>

        {cityChain && (
          <p className="truncate meta-caps text-charcoal-55" title={cityChain}>
            {cityChain}
          </p>
        )}

        <p className="text-meta uppercase tracking-wide text-charcoal-55 tnum">
          {cities.length} {cities.length === 1 ? 'stop' : 'stops'}
          {nights > 0 && (
            <>
              <span className="text-charcoal-30"> · </span>
              {nights} {nights === 1 ? 'night' : 'nights'}
            </>
          )}
        </p>

        <div className="mt-auto pt-sm">
          <Button variant="olive" size="sm" fullWidth onClick={handlePick}>
            Use this trip
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ── States · loading / empty ───────────────────────────────────────────── */

/** Calm sand pulse while the drafter works — three card silhouettes, no spinner. */
function DraftingState() {
  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-xs">
        <h2 className="font-serif text-sub text-charcoal leading-tight">
          Sketching three trips…
        </h2>
        <p className="text-small text-charcoal-70" aria-live="polite">
          Shaping a few routes that fit. One moment.
        </p>
      </div>
      <ul
        className="grid grid-cols-1 gap-md md:grid-cols-3"
        aria-hidden="true"
      >
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="overflow-hidden rounded-2xl border border-charcoal-15 bg-sand animate-pulse motion-reduce:animate-none"
          >
            <span className="block h-32 w-full bg-charcoal-8" />
            <div className="flex flex-col gap-sm p-md">
              <span className="block h-2 w-1/3 rounded-full bg-charcoal-8" />
              <span className="block h-3 w-3/4 rounded-full bg-charcoal-15" />
              <span className="block h-2 w-full rounded-full bg-charcoal-8" />
              <span className="block h-2 w-2/3 rounded-full bg-charcoal-8" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Graceful fallback when no drafts come back — route the traveler onward warmly. */
function EmptyState({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="flex flex-col items-start gap-sm rounded-2xl border border-charcoal-15 bg-sand p-md">
      <h2 className="font-serif text-lede text-charcoal leading-tight">
        Couldn&apos;t draft trips just now
      </h2>
      <p className="text-small text-charcoal-70">
        No worries — start from a curated route instead and shape it from there.
      </p>
      <Button variant="olive" size="sm" onClick={onSkip}>
        Start from a route
      </Button>
    </div>
  );
}

/** The quiet bottom affordance — never the hero. */
function DescribeYourselfLink({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="pt-xs">
      <button
        type="button"
        onClick={onSkip}
        className="rounded text-meta uppercase tracking-wide text-charcoal-55 hover:text-charcoal transition-colors duration-instant ease-out-quart motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Or describe your trip yourself
      </button>
    </div>
  );
}
