import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  ArrowRight,
  Bus,
  Car,
  Check,
  ChevronRight,
  CircleDollarSign,
  Plane,
  Ship,
  Train,
} from 'lucide-react';
import { OperatorMark } from '../../components/OperatorMark';
import type { PlannedStop } from '../../data/plannedStops';
import type { TransportOffer } from '../../data/mockTransport';
import { generateLeg } from './transportGenerator';
import { formatLongDate } from './dateUtils';
import {
  fetchDrivingRoute,
  formatDriveDuration,
  formatDriveKm,
} from './osrmApi';
import { findTransit, useWishlist } from './wishlist';
import { openBookingSheet } from './WebBookingSheet';

type Props = {
  fromStop: PlannedStop;
  toStop: PlannedStop;
  travelDate: string;
};

type Mode = TransportOffer['mode'];

const MODE_META: { mode: Mode; label: string; Icon: typeof Plane }[] = [
  { mode: 'flight', label: 'Flight', Icon: Plane },
  { mode: 'train', label: 'Train', Icon: Train },
  { mode: 'bus', label: 'Bus', Icon: Bus },
  { mode: 'ferry', label: 'Ferry', Icon: Ship },
  { mode: 'transfer', label: 'Transfer', Icon: Car },
  { mode: 'drive', label: 'Drive', Icon: Car },
];

export function WebTransportPanel({ fromStop, toStop, travelDate }: Props) {
  // Subscribe to wishlist changes for re-render.
  useWishlist();

  const leg = useMemo(
    () => generateLeg(fromStop, toStop, travelDate),
    [fromStop, toStop, travelDate],
  );

  const [drive, setDrive] = useState<TransportOffer | null>(null);
  useEffect(() => {
    let cancelled = false;
    setDrive(null);
    fetchDrivingRoute(fromStop.lat, fromStop.lng, toStop.lat, toStop.lng).then(
      (route) => {
        if (cancelled || !route) return;
        setDrive({
          id: `${fromStop.id}-${toStop.id}-drive`,
          fromStopId: fromStop.id,
          toStopId: toStop.id,
          mode: 'drive',
          provider: 'Drive yourself',
          departureTime: '—',
          arrivalTime: '—',
          durationLabel: formatDriveDuration(route.minutes),
          price: Math.round(route.km * 0.12),
          currency: 'USD',
          badge: null,
          stops: 0,
          note: `${formatDriveKm(route.km)} · fuel estimate`,
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [fromStop.id, toStop.id, fromStop.lat, fromStop.lng, toStop.lat, toStop.lng]);

  const allOffers = useMemo(
    () => (drive ? [...leg.offers, drive] : leg.offers),
    [leg, drive],
  );

  const availableModes = useMemo<Set<Mode>>(() => {
    return new Set(allOffers.map((o) => o.mode));
  }, [allOffers]);

  const [enabledModes, setEnabledModes] = useState<Set<Mode>>(availableModes);

  useEffect(() => {
    setEnabledModes(new Set(availableModes));
  }, [availableModes]);

  const toggleMode = (mode: Mode) => {
    setEnabledModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) next.delete(mode);
      else next.add(mode);
      return next;
    });
  };

  const visibleOffers = useMemo(() => {
    return allOffers.filter((o) => enabledModes.has(o.mode));
  }, [allOffers, enabledModes]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="shrink-0 px-md pt-md pb-sm border-b border-charcoal-15 flex flex-col gap-sm pe-12">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-xs font-serif text-sub text-charcoal leading-tight">
            <span>{fromStop.nameEn}</span>
            <ArrowRight size={16} strokeWidth={2} className="text-charcoal-70" />
            <span>{toStop.nameEn}</span>
          </div>
          <p className="text-small text-charcoal-70">
            {formatLongDate(leg.travelDate)}
          </p>
        </div>
        {availableModes.size > 1 && (
          <div className="flex flex-col gap-xs">
            <p className="meta-caps text-charcoal-70">Travel modes</p>
            <div className="flex gap-xs flex-wrap">
              {MODE_META.filter((m) => availableModes.has(m.mode)).map(
                ({ mode, label, Icon }) => {
                  const on = enabledModes.has(mode);
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => toggleMode(mode)}
                      aria-pressed={on}
                      className={clsx(
                        'inline-flex items-center gap-xs px-sm py-xs rounded-full border text-small transition-[background-color,border-color,color,opacity] duration-instant ease-out-quart motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                        on
                          ? 'bg-charcoal text-cream border-charcoal'
                          : 'bg-cream text-charcoal-70 border-charcoal-15 opacity-50 hover:opacity-100 hover:border-charcoal',
                      )}
                    >
                      <Icon size={12} strokeWidth={2} />
                      {label}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}
      </header>
      <div className="flex-1 overflow-y-auto p-md flex flex-col gap-sm">
        {visibleOffers.length === 0 ? (
          <EmptyOffers />
        ) : (
          visibleOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              fromStop={fromStop}
              toStop={toStop}
            />
          ))
        )}
      </div>
    </div>
  );
}

function EmptyOffers() {
  return (
    <div className="bg-sand border border-charcoal-15 rounded-2xl p-md text-center">
      <p className="text-small text-charcoal-70">
        No offers match the selected modes. Toggle a mode back on.
      </p>
    </div>
  );
}

function badgeColor(badge: NonNullable<TransportOffer['badge']>): string {
  if (badge === 'cheapest') return 'bg-clay text-cream';
  if (badge === 'fastest') return 'bg-charcoal text-cream';
  if (badge === 'easiest') return 'bg-clay text-charcoal';
  return 'bg-amber text-cream';
}

function OfferCard({
  offer,
  fromStop,
  toStop,
}: {
  offer: TransportOffer;
  fromStop: PlannedStop;
  toStop: PlannedStop;
}) {
  const booked = !!findTransit(fromStop.id, toStop.id, offer.id);
  const isDrive = offer.mode === 'drive';

  // Two-step: the card is a calm summary; tapping opens the detail + booking
  // sheet where the partner handoff lives (intent before commerce).
  const open = () =>
    openBookingSheet({ kind: 'transport', offer, fromStop, toStop });

  return (
    <button
      type="button"
      onClick={open}
      className={clsx(
        'w-full text-start rounded-2xl p-sm border flex flex-col gap-sm shadow-card transition-[border-color,box-shadow,transform] duration-instant ease-out-quart motion-reduce:transition-none',
        'hover:-translate-y-px hover:shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        booked
          ? 'bg-sand border-amber'
          : 'bg-sand border-charcoal-15 hover:border-charcoal-30',
      )}
    >
      <div className="flex items-start gap-sm">
        <OperatorMark size="md" provider={offer.provider} mode={offer.mode} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-sm">
            <p className="flex-1 min-w-0 truncate font-sans font-semibold text-lede text-charcoal">
              {offer.provider}
            </p>
            {offer.badge && (
              <span
                className={clsx(
                  'shrink-0 rounded-full px-sm py-xs text-meta uppercase font-medium tracking-wide',
                  badgeColor(offer.badge),
                )}
              >
                {offer.badge}
              </span>
            )}
          </div>
          {!isDrive ? (
            <p className="mt-px text-small text-charcoal-70 flex flex-wrap items-center gap-x-xs">
              <span className="tnum">{offer.departureTime}</span>
              <ArrowRight size={12} strokeWidth={2} className="text-charcoal-70" />
              <span className="tnum">{offer.arrivalTime}</span>
              <span className="text-charcoal-55 whitespace-nowrap">
                · {offer.durationLabel}
              </span>
            </p>
          ) : (
            <p className="mt-px text-small text-charcoal-70">
              {offer.durationLabel}
            </p>
          )}
          <p className="text-small text-charcoal-55">
            {isDrive
              ? 'Direct'
              : offer.stops === 0
                ? 'Direct'
                : `${offer.stops} ${offer.stops === 1 ? 'stop' : 'stops'}`}
            {offer.note && <> · {offer.note}</>}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-sm border-t border-charcoal-15 pt-sm">
        <p className="font-serif text-sub text-amber inline-flex items-baseline gap-xs whitespace-nowrap">
          {isDrive && (
            <CircleDollarSign
              size={14}
              strokeWidth={2}
              className="text-charcoal-30"
            />
          )}
          {offer.currency} {offer.price}
        </p>
        {booked ? (
          <span className="inline-flex items-center gap-xs text-meta uppercase font-medium text-sea">
            <Check size={12} strokeWidth={2} />
            In your trip
          </span>
        ) : (
          <span className="inline-flex items-center gap-xs text-meta uppercase font-medium text-charcoal-70">
            View
            <ChevronRight size={14} strokeWidth={2} />
          </span>
        )}
      </div>
    </button>
  );
}
