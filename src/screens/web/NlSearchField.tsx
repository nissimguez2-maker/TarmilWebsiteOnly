import { useId, useState } from 'react';
import { Search } from 'lucide-react';
import { parseSearchQuery } from './ai/nlSearch';
import type { PlaceCategory } from '../../data/places';

type Filters = {
  category?: PlaceCategory;
  keywords: string[];
  cityHint?: string;
};

type Props = {
  /** Called when the query parses into structured filters. */
  onFilters: (filters: Filters) => void;
  /** Called with the raw query when no usable parse comes back (keyword fallback). */
  onRaw: (query: string) => void;
};

/**
 * A brand-styled natural-language search field. On submit it asks
 * {@link parseSearchQuery} to turn free text ("cheap hostel near the beach")
 * into structured filters; a clean parse calls {@link Props.onFilters}, anything
 * else falls back to {@link Props.onRaw} keyword search. The parser returns real
 * filters, not generated prose, so no AI disclosure is needed here.
 *
 * Visually it mirrors the planner's existing search inputs — a quiet rounded
 * field with a leading magnifier, focus-within accent border, and an explicit
 * keyboard focus ring. Submitting on an empty field is a no-op.
 */
export function NlSearchField({ onFilters, onRaw }: Props) {
  const fieldId = useId();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length === 0 || busy) return;

    setBusy(true);
    // The parser is graceful: a null / unusable result means "no structured
    // intent", so we hand the raw text to the caller's keyword search instead.
    let filters: Filters | null = null;
    try {
      filters = await parseSearchQuery(q);
    } catch {
      filters = null;
    }
    setBusy(false);

    if (filters) {
      onFilters(filters);
    } else {
      onRaw(q);
    }
  };

  return (
    <form onSubmit={onSubmit} role="search" className="w-full">
      <label htmlFor={fieldId} className="sr-only">
        Search places
      </label>
      <div className="flex items-center gap-sm rounded-full border border-charcoal-15 bg-sand ps-sm pe-xs h-10 focus-within:border-amber transition-[border-color] duration-instant ease-out-quart motion-reduce:transition-none">
        <Search
          size={14}
          strokeWidth={2}
          className="shrink-0 text-charcoal-70"
          aria-hidden="true"
        />
        <input
          id={fieldId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search places — try 'beach hostel in Rio'"
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 rounded-full bg-transparent py-xs font-sans text-body text-charcoal outline-none placeholder:text-charcoal-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
        />
        {busy && (
          <span
            className="me-xs shrink-0 text-meta italic text-charcoal-70"
            aria-live="polite"
          >
            …
          </span>
        )}
      </div>
    </form>
  );
}
