import {
  siAirbnb,
  siBookingdotcom,
  siExpedia,
  siTripdotcom,
} from 'simple-icons';

/**
 * Booking partners for the two-step booking sheet (stays + transport).
 *
 * The operator (airline / hostel brand) is *who carries or hosts you*; a
 * partner is *where you book*. Partners surface only inside the detail sheet —
 * after the user has shown intent — never on the browsing card. That two-step
 * keeps the commerce calm and disclosed, matching the Sponsored / Tarmil
 * Selection merchant model.
 *
 * Links are COSMETIC today: `deeplinkTemplate` is a launch-ready placeholder
 * (swap the affiliate id, wire `window.open`) — nothing navigates yet. Brand
 * hexes are data, only ever fed to an inline `<svg fill>` or a wordmark
 * colour, never a Tailwind class.
 */

export type BookingPartner = {
  id: string;
  name: string;
  hex: string;
  /** simple-icons path `d`, or null → render a branded text wordmark. */
  logoPath: string | null;
  /** Cosmetic, launch-ready deeplink. Tokens: {city} {checkIn} {checkOut} {from} {to} {date}. */
  deeplinkTemplate: string;
};

export const STAY_PARTNERS: BookingPartner[] = [
  {
    id: 'booking',
    name: 'Booking.com',
    hex: `#${siBookingdotcom.hex}`,
    logoPath: siBookingdotcom.path,
    deeplinkTemplate:
      'https://www.booking.com/searchresults.html?ss={city}&checkin={checkIn}&checkout={checkOut}&aid=PLACEHOLDER',
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    hex: `#${siAirbnb.hex}`,
    logoPath: siAirbnb.path,
    deeplinkTemplate:
      'https://www.airbnb.com/s/{city}/homes?checkin={checkIn}&checkout={checkOut}',
  },
  {
    // No simple-icon for Hostelworld — rendered as a branded wordmark.
    id: 'hostelworld',
    name: 'Hostelworld',
    hex: '#F0531C',
    logoPath: null,
    deeplinkTemplate:
      'https://www.hostelworld.com/search?search_keywords={city}&from={checkIn}&to={checkOut}',
  },
];

/**
 * Transport partners shown *after* the airline's own "Book direct" row (the
 * sheet builds that row from the offer's operator mark). These are the
 * cross-airline aggregators.
 */
export const TRANSPORT_PARTNERS: BookingPartner[] = [
  {
    id: 'expedia',
    name: 'Expedia',
    hex: `#${siExpedia.hex}`,
    logoPath: siExpedia.path,
    deeplinkTemplate:
      'https://www.expedia.com/Flights-Search?leg1=from:{from},to:{to},departure:{date}&aid=PLACEHOLDER',
  },
  {
    id: 'tripcom',
    name: 'Trip.com',
    hex: `#${siTripdotcom.hex}`,
    logoPath: siTripdotcom.path,
    deeplinkTemplate:
      'https://www.trip.com/flights/{from}-to-{to}/?ddate={date}&allianceid=PLACEHOLDER',
  },
];
