import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';
import type { PlannedStop } from '../../data/plannedStops';
import type { Place } from '../../data/places';
import type { HomeCity } from './homeCity';
import type { Selection } from './types';
import { WebCityPanel } from './WebCityPanel';
import { WebTransportPanel } from './WebTransportPanel';

type Props = {
  selection: Selection;
  stops: PlannedStop[];
  home: HomeCity;
  places: Place[];
  onClose: () => void;
};

export function WebBubble({
  selection,
  stops,
  home,
  places,
  onClose,
}: Props) {
  const isOpen = selection.type !== 'none';
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnimateIn(false);
      return;
    }
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  if (selection.type === 'none') return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-md pointer-events-none z-[1000]"
      aria-hidden={false}
    >
      <div
        role="dialog"
        aria-modal="false"
        style={{ width: '440px', maxHeight: '100%' }}
        className={clsx(
          'bg-cream border border-charcoal-15 rounded-3xl shadow-panel flex flex-col pointer-events-auto relative overflow-hidden',
          'transition-[opacity,transform] duration-considered ease-out-quart motion-reduce:transition-none',
          'origin-center',
          animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-sm end-sm h-8 w-8 rounded-full flex items-center justify-center text-charcoal-70 hover:text-charcoal hover:bg-charcoal-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream z-10"
        >
          <X size={16} strokeWidth={2} />
        </button>
        {selection.type === 'stop' && selection.stopId !== 'home' && (
          <WebCityPanel
            stop={requireStop(stops, selection.stopId)}
            places={places.filter((p) => p.destinationId === selection.stopId)}
          />
        )}
        {selection.type === 'leg' && (() => {
          const fromStop = stopOrHome(stops, home, selection.fromStopId);
          const toStop = stopOrHome(stops, home, selection.toStopId);
          const travelDate =
            selection.fromStopId === 'home'
              ? stops[0]?.arrivalDate ?? new Date().toISOString().slice(0, 10)
              : fromStop.departureDate;
          return (
            <WebTransportPanel
              fromStop={fromStop}
              toStop={toStop}
              travelDate={travelDate}
            />
          );
        })()}
      </div>
    </div>
  );
}

function requireStop(stops: PlannedStop[], id: string): PlannedStop {
  const stop = stops.find((s) => s.id === id);
  if (!stop) {
    throw new Error(`Selection referenced missing stop ${id}`);
  }
  return stop;
}

function stopOrHome(
  stops: PlannedStop[],
  home: HomeCity,
  id: string,
): PlannedStop {
  if (id === 'home') {
    return {
      id: 'home',
      nameEn: home.nameEn,
      nameHe: home.nameEn,
      type: 'city',
      lat: home.lat,
      lng: home.lng,
      arrivalDate: stops[0]?.arrivalDate ?? '2026-01-01',
      departureDate:
        stops[stops.length - 1]?.departureDate ?? '2026-01-01',
      nights: 0,
      privacy: 'private',
    };
  }
  return requireStop(stops, id);
}
