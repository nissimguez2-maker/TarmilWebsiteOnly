import { useId, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/Button';
import { draftRoute } from './ai/planDraft';

type Props = {
  /** Receives an ordered list of ADDABLE_CITIES ids when a draft comes back. */
  onDraft: (cityIds: string[]) => void;
  /** Parent-driven busy state (e.g. while it applies the draft). */
  loading?: boolean;
};

/**
 * A one-shot route drafter. The traveler describes a trip in plain words
 * ("2 weeks, Andes, hiking + good coffee") and {@link draftRoute} returns an
 * ordered list of known-city ids the parent can drop into the plan. It is a
 * starting point, not an authority — the result is fully editable afterwards.
 *
 * The affordance carries a quiet `meta-caps` "AI DRAFT" tag, so its nature is
 * honest without shouting. It dissolves after one shot rather than holding a
 * conversation. {@link draftRoute} returns real city ids (not generated prose),
 * so no AI prose disclosure is rendered; only the label flags it as a draft.
 */
export function PlanDraftBox({ onDraft, loading }: Props) {
  const fieldId = useId();
  const hintId = useId();
  const [brief, setBrief] = useState('');
  const [busy, setBusy] = useState(false);
  const [missed, setMissed] = useState(false);

  const working = busy || loading === true;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = brief.trim();
    if (text.length === 0 || working) return;

    setMissed(false);
    setBusy(true);
    // Graceful: a null result (proxy down, no matching cities) just shows a calm
    // nudge to try different words — never an error or an empty list downstream.
    let ids: string[] | null = null;
    try {
      ids = await draftRoute(text);
    } catch {
      ids = null;
    }
    setBusy(false);

    if (ids && ids.length > 0) {
      onDraft(ids);
      setBrief('');
    } else {
      setMissed(true);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-sm rounded-2xl border border-charcoal-15 bg-sand p-md"
    >
      <div className="flex items-center gap-xs">
        <Sparkles
          size={14}
          strokeWidth={2}
          className="shrink-0 text-charcoal-70"
          aria-hidden="true"
        />
        <span className="meta-caps text-charcoal-70">AI draft</span>
      </div>

      <label htmlFor={fieldId} className="text-small leading-snug text-charcoal-70">
        Describe your trip and we&apos;ll sketch a first route to edit.
      </label>

      <div className="flex items-center gap-sm">
        <input
          id={fieldId}
          type="text"
          value={brief}
          onChange={(e) => {
            setBrief(e.target.value);
            if (missed) setMissed(false);
          }}
          placeholder="2 weeks, Andes, hiking + good coffee"
          autoComplete="off"
          aria-describedby={missed ? hintId : undefined}
          className="min-w-0 flex-1 rounded-full border border-charcoal-15 bg-cream px-md py-sm font-sans text-body text-charcoal placeholder:text-charcoal-70 transition-[border-color] duration-instant ease-out-quart motion-reduce:transition-none hover:border-charcoal-30 focus:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
        />
        <Button
          type="submit"
          variant="olive"
          size="sm"
          disabled={working || brief.trim().length === 0}
        >
          {working ? 'Sketching…' : 'Draft'}
        </Button>
      </div>

      {missed && (
        <p id={hintId} className="text-small text-charcoal-70" aria-live="polite">
          Couldn&apos;t map that to our cities yet. Try naming a region or vibe.
        </p>
      )}
    </form>
  );
}
