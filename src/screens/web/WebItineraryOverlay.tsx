import { useEffect } from 'react';
import clsx from 'clsx';
import { X, Home, Plane, Train, Ship, Bus, Car } from 'lucide-react';
import type { PlannedStop } from '../../data/plannedStops';
import type { HomeCity } from './homeCity';
import { generateLeg } from './transportGenerator';
import { cityPhotos } from './cityPhotos';
import { placesForStop, useWishlist } from './wishlist';
import { formatStopRange, formatShortDate } from './dateUtils';

type Props = {
  open: boolean;
  onClose: () => void;
  stops: PlannedStop[];
  home: HomeCity;
};

function homeStop(home: HomeCity, dateIso: string): PlannedStop {
  return {
    id: 'home',
    nameEn: home.nameEn,
    nameHe: home.nameEn,
    type: 'city',
    lat: home.lat,
    lng: home.lng,
    arrivalDate: dateIso,
    departureDate: dateIso,
    nights: 0,
    privacy: 'private',
  };
}

function modeIcon(mode: string) {
  if (mode === 'flight') return Plane;
  if (mode === 'train') return Train;
  if (mode === 'ferry') return Ship;
  if (mode === 'drive') return Car;
  return Bus;
}

/**
 * Dedicated full-itinerary overlay (the "bigger view" off the compact sidebar).
 * Spacious, scrollable timeline showing every stop with its photo, dates,
 * nights, saved places, and the recommended transport between legs.
 */
export function WebItineraryOverlay({ open, onClose, stops, home }: Props) {
  useWishlist();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const first = stops[0];
  const last = stops[stops.length - 1];
  const hs = homeStop(home, first?.arrivalDate ?? '2026-01-01');
  const dateSpan =
    first && last
      ? `${formatShortDate(first.arrivalDate)} – ${formatShortDate(last.departureDate)}`
      : 'Your trip';
  const nights = stops.reduce((sum, s) => sum + s.nights, 0);

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-start justify-center overflow-y-auto bg-charcoal/50 p-lg backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full itinerary"
    >
      <div
        className="my-auto w-full max-w-3xl rounded-2xl bg-cream shadow-fab"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-md rounded-t-2xl border-b border-charcoal-15 bg-cream/95 px-lg py-md backdrop-blur">
          <div className="flex flex-col gap-px">
            <span className="meta-caps text-charcoal-70">Full itinerary</span>
            <h2 className="font-serif text-sub leading-tight text-charcoal">
              {dateSpan}
            </h2>
            <span className="text-small text-charcoal-70 tnum">
              {stops.length} stops · {nights} nights
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close itinerary"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal-8 text-charcoal transition-colors duration-instant ease-out-quart hover:bg-charcoal-15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </header>

        <div className="flex flex-col gap-sm px-lg py-lg">
          <Endpoint home={home} variant="departure" />
          {stops.map((stop, i) => (
            <div key={stop.id} className="flex flex-col gap-sm">
              <TransportLeg from={i === 0 ? hs : stops[i - 1]} to={stop} />
              <DetailStop stop={stop} index={i + 1} />
            </div>
          ))}
          {last && <TransportLeg from={last} to={hs} />}
          <Endpoint home={home} variant="return" />
        </div>
      </div>
    </div>
  );
}

function Endpoint({
  home,
  variant,
}: {
  home: HomeCity;
  variant: 'departure' | 'return';
}) {
  return (
    <div className="flex items-center gap-md">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-charcoal text-cream">
        <Home size={16} strokeWidth={2} />
      </span>
      <div className="flex flex-col">
        <span className="meta-caps text-charcoal-70">
          {variant === 'departure' ? 'Departure' : 'Return'}
        </span>
        <span className="font-serif text-lede text-charcoal">{home.nameEn}</span>
      </div>
    </div>
  );
}

function TransportLeg({ from, to }: { from: PlannedStop; to: PlannedStop }) {
  const leg = generateLeg(from, to, from.departureDate);
  const offer = leg.offers.find((o) => o.badge === 'recommended') ?? leg.offers[0];
  if (!offer) return null;
  const Icon = modeIcon(offer.mode);
  return (
    <div className="ms-5 flex items-center gap-md border-s border-dashed border-charcoal-15 ps-md">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sea/10 text-sea">
        <Icon size={14} strokeWidth={2} />
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-sm gap-y-px text-small text-charcoal-70">
        <span className="font-medium text-charcoal">{offer.provider}</span>
        {offer.mode !== 'drive' && (
          <span className="tnum">
            {offer.departureTime} → {offer.arrivalTime}
          </span>
        )}
        <span className="tnum text-charcoal-55">
          {offer.currency} {offer.price}
        </span>
      </div>
    </div>
  );
}

function DetailStop({ stop, index }: { stop: PlannedStop; index: number }) {
  const photo = cityPhotos(stop.id)[0];
  const saved = placesForStop(stop.id);
  return (
    <article className="overflow-hidden rounded-2xl bg-sand ring-1 ring-charcoal-15">
      <div className="flex gap-md p-md">
        <span className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-clay to-sand">
          {photo && (
            <img
              src={photo}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <div className="flex items-center gap-sm">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber text-meta font-semibold tnum text-cream">
              {index}
            </span>
            <h3 className="font-serif text-sub leading-tight text-charcoal">
              {stop.nameEn}
            </h3>
          </div>
          <p className="text-small text-charcoal-70 tnum">
            {formatStopRange(stop.arrivalDate, stop.departureDate)} · {stop.nights}{' '}
            {stop.nights === 1 ? 'night' : 'nights'}
          </p>
        </div>
      </div>
      {saved.length > 0 && (
        <div className="mx-md mb-md flex flex-col gap-xs border-t border-charcoal-08 pt-sm">
          {saved.map((item) => (
            <div key={item.id} className="flex items-center gap-sm text-small">
              <span className="min-w-0 flex-1 truncate text-charcoal">
                {item.placeName}
              </span>
              <span
                className={clsx(
                  'shrink-0 rounded-full px-sm py-px text-meta font-medium uppercase',
                  item.status === 'saved'
                    ? 'bg-charcoal-8 text-charcoal-70'
                    : 'bg-amber text-cream',
                )}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
