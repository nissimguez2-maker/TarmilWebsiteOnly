import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { Info } from 'lucide-react';

/**
 * One-tap "What's this?" disclosure for the merchant model. Quiet by default —
 * a small text trigger that opens a non-modal popover explaining the two honest
 * badges (earned "Tarmil Selection" vs paid "Sponsored"). Keeps the commerce
 * disclosed in plain, warm words at the point of decision.
 */
export function PlacementExplainer({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={clsx('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-xs text-meta uppercase tracking-wide text-charcoal-55 hover:text-charcoal rounded-full px-xs py-0.5 transition-colors duration-instant motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <Info size={12} strokeWidth={2} aria-hidden="true" />
        What&apos;s this?
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
          tabIndex={-1}
          style={{ width: 'min(20rem, calc(100vw - 2rem))' }}
          className={clsx(
            'absolute end-0 top-full mt-xs z-20 text-start',
            'bg-cream border border-charcoal-15 rounded-2xl shadow-panel p-md',
            'flex flex-col gap-sm',
          )}
        >
          <h4
            id={`${panelId}-title`}
            className="text-small font-medium text-charcoal"
          >
            How we label places
          </h4>
          <p className="text-small text-charcoal-70 leading-snug">
            <span className="meta-caps text-amber">Tarmil Selection</span> —
            places we honestly recommend. Earned through our own curation, never
            paid for.
          </p>
          <p className="text-small text-charcoal-70 leading-snug">
            <span className="meta-caps text-charcoal-55">Sponsored</span> — a
            business paid to appear here. We always say so.
          </p>
          <p className="text-small text-charcoal-70 leading-snug">
            Everything else is here on merit. We never bury a place for not
            paying.
          </p>
        </div>
      )}
    </div>
  );
}
