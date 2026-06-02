import { useEffect, useState } from 'react';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import clsx from 'clsx';
import {
  ADDABLE_CITIES,
  slugifyId,
  type AddableCity,
} from './addableCities';
import { cityPhotos } from './cityPhotos';
import { searchNominatim, type NominatimResult } from './nominatimApi';

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (city: AddableCity) => void;
  existingStopIds: string[];
};

export function WebAddStopModal({ open, onClose, onAdd, existingStopIds }: Props) {
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

  const trimmed = query.trim();
  const showResults = trimmed.length >= 2;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-charcoal/40 flex items-center justify-center p-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '480px' }}
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
          <p className="meta-caps text-charcoal-70">Add stop</p>
          <h2 className="font-serif text-sub text-charcoal leading-tight">
            Search any city
          </h2>
          <p className="text-small text-charcoal-70">
            Type a city name. We resolve it via OpenStreetMap.
          </p>
        </div>
        <label className="flex items-center gap-sm rounded-full bg-sand border border-charcoal-15 px-sm h-10 focus-within:border-amber transition-[border-color] duration-instant ease-out-quart motion-reduce:transition-none">
          <Search size={14} strokeWidth={2} className="text-charcoal-70 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tokyo, Lisbon, Cape Town…"
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
          {!showResults && (
            <>
              <p className="meta-caps text-charcoal-70">Suggested</p>
              {ADDABLE_CITIES.map((city) => (
                <SuggestedRow
                  key={city.id}
                  city={city}
                  disabled={existingStopIds.includes(city.id)}
                  onPick={() => {
                    onAdd(city);
                    onClose();
                  }}
                />
              ))}
            </>
          )}
          {showResults && !loading && results.length === 0 && (
            <p className="text-small text-charcoal-70 text-center py-md">
              No matches. Try a different spelling or add the country.
            </p>
          )}
          {showResults && results.length > 0 && (
            <>
              <p className="meta-caps text-charcoal-70">Results</p>
              {results.map((r, i) => {
                const id = slugifyId(`${r.name}-${r.countryCode || i}`);
                const disabled = existingStopIds.includes(id);
                return (
                  <NominatimRow
                    key={`${id}-${i}`}
                    result={r}
                    disabled={disabled}
                    onPick={() => {
                      onAdd({
                        id,
                        nameEn: r.name,
                        lat: r.lat,
                        lng: r.lng,
                        defaultNights: 3,
                      });
                      onClose();
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestedRow({
  city,
  disabled,
  onPick,
}: {
  city: AddableCity;
  disabled: boolean;
  onPick: () => void;
}) {
  const thumb = cityPhotos(city.id)[0];
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className={clsx(
        'group w-full text-start rounded-2xl border bg-sand p-sm flex gap-sm items-center transition-[border-color,background-color] duration-instant ease-out-quart motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        disabled
          ? 'border-charcoal-15 opacity-50 cursor-not-allowed'
          : 'border-charcoal-15 hover:border-amber',
      )}
    >
      <div className="shrink-0 h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-clay to-sand">
        {thumb && (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-xs">
        <h3 className="font-serif text-lede text-charcoal leading-tight">
          {city.nameEn}
        </h3>
        {city.blurb && (
          <p className="text-small text-charcoal-70 leading-snug line-clamp-1">
            {city.blurb}
          </p>
        )}
        <p className="text-meta uppercase text-charcoal-70">
          {disabled ? 'Already in trip' : `${city.defaultNights} night default`}
        </p>
      </div>
    </button>
  );
}

function flagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const A = 0x1f1e6;
  const codes = countryCode.toUpperCase().split('').map((c) => A + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codes);
}

function NominatimRow({
  result,
  disabled,
  onPick,
}: {
  result: NominatimResult;
  disabled: boolean;
  onPick: () => void;
}) {
  const flag = flagEmoji(result.countryCode);
  const subtitle = result.country || result.displayName.split(',').slice(1).join(', ').trim();
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className={clsx(
        'group w-full text-start rounded-2xl border bg-cream p-sm flex gap-sm items-center transition-[border-color,background-color] duration-instant ease-out-quart motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        disabled
          ? 'border-charcoal-15 opacity-50 cursor-not-allowed'
          : 'border-charcoal-15 hover:border-amber hover:bg-sand',
      )}
    >
      <span
        aria-hidden="true"
        className="shrink-0 h-12 w-12 rounded-xl bg-sand flex items-center justify-center text-display"
      >
        {flag || <MapPin size={20} strokeWidth={2} className="text-charcoal-70" />}
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-xs">
        <h3 className="font-serif text-lede text-charcoal leading-tight truncate">
          {result.name}
        </h3>
        <p className="text-small text-charcoal-70 truncate">{subtitle}</p>
      </div>
      <span className="text-meta uppercase text-amber">
        {disabled ? 'Added' : 'Add'}
      </span>
    </button>
  );
}
