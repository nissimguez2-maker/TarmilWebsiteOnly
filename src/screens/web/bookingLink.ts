import type { BookingPartner } from '../../data/bookingPartners';
import type { PlannedStop } from '../../data/plannedStops';
import { loadTripIntent } from './tripIntent';

/**
 * Booking deeplink builder — turns a partner template + the traveler's real trip
 * context into a marked, pre-filled affiliate link.
 *
 * The Travelpayouts MARKER is a PUBLIC affiliate id: it rides inside every
 * outbound booking link by design (it's how a commission is attributed), so it
 * is client-side config, NOT a server secret. `sub_id` is a free-form per-slot
 * tag so each placement's clicks can be read back in the Travelpayouts dashboard
 * (and reconciled against our own funnel events).
 *
 * NOTE for go-live: each partner's EXACT Travelpayouts deeplink format should be
 * confirmed against the Travelpayouts dashboard before launch — the structure
 * here (real city + dates + pax pre-fill, `marker` + `sub_id`, a real
 * `window.open`) is launch-ready; only the per-program base URL may need a tweak.
 * Nothing fires until the founder deploys.
 */
export const TRAVELPAYOUTS_MARKER = '735261';

/** Map the doorway's "who" to a sensible default occupancy (the partner page lets the user change it). */
function paxFromIntent(): number {
  const who = loadTripIntent()?.who;
  switch (who) {
    case 'solo':
      return 1;
    case 'pair':
      return 2;
    case 'friends':
      return 3;
    case 'family':
      return 4;
    default:
      return 2;
  }
}

function fill(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => tokens[k] ?? '');
}

function withMarker(url: string, subId: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}marker=${encodeURIComponent(TRAVELPAYOUTS_MARKER)}&sub_id=${encodeURIComponent(subId)}`;
}

/** A real, marked, date+pax-prefilled stay link — or null when the partner has no template (e.g. "book direct"). */
export function buildStayLink(partner: BookingPartner, stop: PlannedStop): string | null {
  if (!partner.deeplinkTemplate) return null;
  const url = fill(partner.deeplinkTemplate, {
    city: encodeURIComponent(stop.nameEn),
    checkIn: stop.arrivalDate,
    checkOut: stop.departureDate,
    pax: String(paxFromIntent()),
  });
  return withMarker(url, `stay-${stop.id}-${partner.id}`);
}

/** A real, marked, city-prefilled tours link — the traveler browses real experiences. */
export function buildTourLink(partner: BookingPartner, stop: PlannedStop): string | null {
  if (!partner.deeplinkTemplate) return null;
  const url = fill(partner.deeplinkTemplate, { city: encodeURIComponent(stop.nameEn) });
  return withMarker(url, `tour-${stop.id}-${partner.id}`);
}

/** A real, marked, date+pax-prefilled transport link — or null when the partner has no template. */
export function buildTransportLink(
  partner: BookingPartner,
  fromStop: PlannedStop,
  toStop: PlannedStop,
  date: string,
): string | null {
  if (!partner.deeplinkTemplate) return null;
  const url = fill(partner.deeplinkTemplate, {
    from: encodeURIComponent(fromStop.nameEn),
    to: encodeURIComponent(toStop.nameEn),
    date,
    pax: String(paxFromIntent()),
  });
  return withMarker(url, `transport-${fromStop.id}-${toStop.id}-${partner.id}`);
}
