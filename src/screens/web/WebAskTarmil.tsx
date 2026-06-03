import { useEffect, useState } from 'react';
import { MessageCircleQuestion, X } from 'lucide-react';
import type { PlannedStop } from '../../data/plannedStops';
import { ConciergeBox } from './ConciergeBox';
import { track } from './track';

/**
 * Ask Tarmil — the in-planner conversational companion. A calm bottom-end
 * launcher that opens a panel hosting the (open-world) concierge, so the
 * traveler can ask anything — "is São Paulo safe at night?", "best time for
 * Kyoto?" — without leaving the planner. It answers and grounds; it NEVER voices
 * the monetized stay/tour pick (the human-curated cards own booking). Non-modal,
 * Escape-to-close, so it sits beside the plan rather than blocking it.
 */
export function WebAskTarmil({ stops }: { stops: PlannedStop[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Ask Tarmil"
          className="fixed z-[1500] end-md bottom-[calc(env(safe-area-inset-bottom,0px)+4.75rem)] w-[min(380px,calc(100vw-2rem))] max-h-[70dvh] overflow-y-auto rounded-2xl border border-charcoal-15 bg-cream p-md shadow-panel"
        >
          <div className="flex items-center justify-between gap-sm pb-sm">
            <span className="meta-caps text-charcoal-70">Ask Tarmil</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-charcoal-55 transition-colors duration-fast ease-out-quart motion-reduce:transition-none hover:bg-charcoal-8 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
          <ConciergeBox stops={stops} />
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => {
            if (!o) track('ask_tarmil_open');
            return !o;
          });
        }}
        aria-label="Ask Tarmil"
        aria-expanded={open}
        className="fixed z-[1500] end-md bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] inline-flex items-center gap-xs rounded-full bg-charcoal px-md py-sm text-cream shadow-fab transition-[transform,background-color] duration-fast ease-out-quart motion-reduce:transition-none hover:bg-charcoal-70 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <MessageCircleQuestion size={18} strokeWidth={2} />
        <span className="text-small font-medium">Ask Tarmil</span>
      </button>
    </>
  );
}
