import { useEffect, useState } from 'react';
import { Home, Loader2, Search, X } from 'lucide-react';
import clsx from 'clsx';
import { searchNominatim, type NominatimResult } from './nominatimApi';
import type { HomeCity } from './homeCity';

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (home: HomeCity) => void;
  currentName: string;
};

export function WebHomeEditor({ open, onClose, onPick, currentName }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      searchNominatim(q).then((r) => {
        setResults(r);
        setLoading(false);
      });
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-charcoal/40 flex items-center justify-center p-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '440px' }}
        className="bg-cream border border-charcoal-15 rounded-3xl shadow-panel p-md flex flex-col gap-md relative max-h-[80dvh]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-sm end-sm h-8 w-8 rounded-full flex items-center justify-center text-charcoal-70 hover:text-charcoal hover:bg-charcoal-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <X size={16} strokeWidth={2} />
        </button>
        <div className="flex flex-col gap-xs pe-12">
          <p className="meta-caps text-charcoal-70">Home</p>
          <h2 className="font-serif text-sub text-charcoal leading-tight">
            Where do you fly from?
          </h2>
          <p className="text-small text-charcoal-70">
            Currently {currentName}. The trip starts and ends here.
          </p>
        </div>
        <label className="flex items-center gap-sm rounded-full bg-sand border border-charcoal-15 px-sm h-10 focus-within:border-amber transition-[border-color] duration-instant ease-out-quart motion-reduce:transition-none">
          <Search size={14} strokeWidth={2} className="text-charcoal-70 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tel Aviv, New York, London…"
            autoFocus
            className="flex-1 bg-transparent outline-none text-body text-charcoal placeholder:text-charcoal-70"
          />
          {loading && (
            <Loader2
              size={14}
              strokeWidth={2}
              className="text-charcoal-70 animate-spin"
            />
          )}
        </label>
        <div className="flex flex-col gap-sm overflow-y-auto min-h-0">
          {query.trim().length < 2 && (
            <p className="text-small text-charcoal-70 text-center py-md">
              Search any city to set as your home base.
            </p>
          )}
          {query.trim().length >= 2 && !loading && results.length === 0 && (
            <p className="text-small text-charcoal-70 text-center py-md">
              No matches. Try a different spelling.
            </p>
          )}
          {results.map((r, i) => (
            <ResultRow
              key={`${r.lat}-${r.lng}-${i}`}
              result={r}
              onPick={() => {
                onPick({
                  id: 'home',
                  nameEn: r.name,
                  lat: r.lat,
                  lng: r.lng,
                  countryCode: r.countryCode || undefined,
                });
                onClose();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function flagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const A = 0x1f1e6;
  const codes = countryCode
    .toUpperCase()
    .split('')
    .map((c) => A + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codes);
}

function ResultRow({
  result,
  onPick,
}: {
  result: NominatimResult;
  onPick: () => void;
}) {
  const flag = flagEmoji(result.countryCode);
  const subtitle =
    result.country ||
    result.displayName.split(',').slice(1).join(', ').trim();
  return (
    <button
      type="button"
      onClick={onPick}
      className={clsx(
        'group w-full text-start rounded-2xl border bg-cream p-sm flex gap-sm items-center transition-[border-color,background-color] duration-instant ease-out-quart motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        'border-charcoal-15 hover:border-amber hover:bg-sand',
      )}
    >
      <span
        aria-hidden="true"
        className="shrink-0 h-12 w-12 rounded-xl bg-sand flex items-center justify-center text-display"
      >
        {flag || <Home size={20} strokeWidth={2} className="text-charcoal-70" />}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-xs">
        <h3 className="font-serif text-lede text-charcoal leading-tight truncate">
          {result.name}
        </h3>
        <p className="text-small text-charcoal-70 truncate">{subtitle}</p>
      </div>
      <span className="text-meta uppercase text-amber">Set as home</span>
    </button>
  );
}
