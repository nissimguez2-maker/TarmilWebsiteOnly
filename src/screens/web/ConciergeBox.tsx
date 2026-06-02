import { useId, useState } from 'react';
import { MessageCircleQuestion, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { AiDisclosure } from '../../components/AiDisclosure';
import { SourceCredit } from '../../components/SourceCredit';
import type { PlannedStop } from '../../data/plannedStops';
import { askConcierge } from './ai/concierge';

type Props = {
  stops: PlannedStop[];
  /** Optional grounding facts (holidays, currency lines…) the parent already has. */
  facts?: string[];
};

type Phase =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'answer'; answer: string; sources: { label: string; url: string }[] }
  | { kind: 'empty' };

/**
 * A one-shot trip concierge. Borrows the PlacementExplainer panel aesthetic — a
 * quiet bordered card, not a chat transcript. Asks `askConcierge` with the trip's
 * city names (plus any facts the parent passes) and renders the prose answer,
 * its cited sources, and a non-dismissible AI disclosure. Every empty / null /
 * sourceless path resolves to a calm "check official sources" nudge — it never
 * reads as authoritative.
 */
export function ConciergeBox({ stops, facts = [] }: Props) {
  const fieldId = useId();
  const answerId = useId();
  const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });

  const cityNames = stops.map((s) => s.nameEn).filter(Boolean);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (q.length === 0 || phase.kind === 'loading') return;
    setPhase({ kind: 'loading' });
    const res = await askConcierge(q, { cityNames, facts });
    if (!res || res.answer.trim().length === 0) {
      setPhase({ kind: 'empty' });
      return;
    }
    setPhase({ kind: 'answer', answer: res.answer, sources: res.sources ?? [] });
  };

  const loading = phase.kind === 'loading';

  return (
    <section
      aria-labelledby={`${fieldId}-label`}
      className="flex flex-col gap-sm rounded-2xl border border-charcoal-15 bg-sand p-md"
    >
      <div className="flex items-center gap-xs">
        <MessageCircleQuestion
          size={14}
          strokeWidth={2}
          className="shrink-0 text-charcoal-70"
          aria-hidden="true"
        />
        <h3 id={`${fieldId}-label`} className="meta-caps text-charcoal-70">
          Ask about your trip
        </h3>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-sm">
        <label htmlFor={fieldId} className="sr-only">
          Ask a question about your trip
        </label>
        <div className="flex items-center gap-sm">
          <input
            id={fieldId}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your trip…"
            autoComplete="off"
            aria-describedby={
              phase.kind === 'answer' || phase.kind === 'empty'
                ? answerId
                : undefined
            }
            className="min-w-0 flex-1 rounded-full border border-charcoal-15 bg-cream px-md py-sm font-sans text-body text-charcoal placeholder:text-charcoal-55 transition-[border-color] duration-instant ease-out-quart motion-reduce:transition-none hover:border-charcoal-30 focus:border-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          />
          <Button
            type="submit"
            variant="olive"
            size="sm"
            disabled={loading || question.trim().length === 0}
            aria-label="Ask"
          >
            <Send size={14} strokeWidth={2} aria-hidden="true" />
            Ask
          </Button>
        </div>
      </form>

      {loading && (
        <p className="text-small italic text-charcoal-70" aria-live="polite">
          Thinking it through…
        </p>
      )}

      {phase.kind === 'answer' && (
        <div id={answerId} className="flex flex-col gap-sm" aria-live="polite">
          <p className="whitespace-pre-line font-sans text-body leading-relaxed text-charcoal">
            {phase.answer}
          </p>
          {phase.sources.length > 0 && (
            <div className="flex flex-col gap-xs border-t border-charcoal-8 pt-sm">
              <p className="meta-caps text-charcoal-70">Sources</p>
              {phase.sources.map((s) => (
                <SourceCredit key={`${s.url}-${s.label}`} href={s.url}>
                  {s.label}
                </SourceCredit>
              ))}
            </div>
          )}
          {/* Non-dismissible: concierge answers can touch visa / entry / safety. */}
          <AiDisclosure tone="official" />
        </div>
      )}

      {phase.kind === 'empty' && (
        <div id={answerId} className="flex flex-col gap-xs" aria-live="polite">
          <p className="text-small leading-relaxed text-charcoal-70">
            No clear answer this time. For anything that matters — visas, entry
            rules, health — check the official sources for each country.
          </p>
          <AiDisclosure tone="official" />
        </div>
      )}
    </section>
  );
}
