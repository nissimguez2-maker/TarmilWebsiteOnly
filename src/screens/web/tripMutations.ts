import type { PlannedStop } from '../../data/plannedStops';
import type { AddableCity } from './addableCities';

const TRANSIT_GAP_DAYS = 1;

function parseIsoNoon(iso: string): Date {
  return new Date(iso + 'T12:00:00');
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function recalculateChronology(
  stops: PlannedStop[],
  anchorArrivalIso: string,
): PlannedStop[] {
  if (stops.length === 0) return stops;
  let cursor = parseIsoNoon(anchorArrivalIso);
  return stops.map((stop) => {
    const arrival = new Date(cursor);
    const departure = new Date(cursor);
    departure.setDate(departure.getDate() + stop.nights);
    cursor = new Date(departure);
    cursor.setDate(cursor.getDate() + TRANSIT_GAP_DAYS);
    return {
      ...stop,
      arrivalDate: toIso(arrival),
      departureDate: toIso(departure),
    };
  });
}

export function reorderStops(
  stops: PlannedStop[],
  fromIdx: number,
  toIdx: number,
): PlannedStop[] {
  if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return stops;
  if (fromIdx >= stops.length || toIdx >= stops.length) return stops;
  const next = [...stops];
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return recalculateChronology(next, stops[0].arrivalDate);
}

export function addStop(
  stops: PlannedStop[],
  city: AddableCity,
): PlannedStop[] {
  const last = stops[stops.length - 1];
  const startDate = last
    ? (() => {
        const d = parseIsoNoon(last.departureDate);
        d.setDate(d.getDate() + TRANSIT_GAP_DAYS);
        return d;
      })()
    : new Date();
  const departure = new Date(startDate);
  departure.setDate(departure.getDate() + city.defaultNights);
  const newStop: PlannedStop = {
    id: city.id,
    nameEn: city.nameEn,
    nameHe: city.nameEn,
    type: 'city',
    lat: city.lat,
    lng: city.lng,
    arrivalDate: toIso(startDate),
    departureDate: toIso(departure),
    nights: city.defaultNights,
    privacy: 'friends',
  };
  return [...stops, newStop];
}

export function removeStop(stops: PlannedStop[], id: string): PlannedStop[] {
  const filtered = stops.filter((s) => s.id !== id);
  if (filtered.length === stops.length || filtered.length === 0) return filtered;
  return recalculateChronology(filtered, stops[0].arrivalDate);
}

export function editStopDates(
  stops: PlannedStop[],
  id: string,
  arrivalIso: string,
  departureIso: string,
): PlannedStop[] {
  return stops.map((s) => {
    if (s.id !== id) return s;
    const arrival = parseIsoNoon(arrivalIso);
    const departure = parseIsoNoon(departureIso);
    const nights = Math.max(1, daysBetween(arrival, departure));
    return {
      ...s,
      arrivalDate: arrivalIso,
      departureDate: departureIso,
      nights,
    };
  });
}
