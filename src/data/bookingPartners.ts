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
 * `deeplinkTemplate` is filled + marked by `bookingLink.ts` (real city + dates +
 * pax, plus the Travelpayouts marker + sub_id) and opened on tap. Tokens:
 * {city} {checkIn} {checkOut} {from} {to} {date} {pax}. Brand hexes are data,
 * only ever fed to an inline `<svg fill>` or a wordmark colour, never a class.
 */

export type BookingPartner = {
  id: string;
  name: string;
  hex: string;
  /** simple-icons path `d`, or null → render a branded text wordmark. */
  logoPath: string | null;
  /** Deeplink template; marker + sub_id are appended by bookingLink.ts. Empty = "book direct" (no link). */
  deeplinkTemplate: string;
};

export const STAY_PARTNERS: BookingPartner[] = [
  {
    id: 'booking',
    name: 'Booking.com',
    hex: `#${siBookingdotcom.hex}`,
    logoPath: siBookingdotcom.path,
    deeplinkTemplate:
      'https://www.booking.com/searchresults.html?ss={city}&checkin={checkIn}&checkout={checkOut}&group_adults={pax}',
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    hex: `#${siAirbnb.hex}`,
    logoPath: siAirbnb.path,
    deeplinkTemplate:
      'https://www.airbnb.com/s/{city}/homes?checkin={checkIn}&checkout={checkOut}&adults={pax}',
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
      'https://www.expedia.com/Flights-Search?leg1=from:{from},to:{to},departure:{date}',
  },
  {
    id: 'tripcom',
    name: 'Trip.com',
    hex: `#${siTripdotcom.hex}`,
    logoPath: siTripdotcom.path,
    deeplinkTemplate:
      'https://www.trip.com/flights/{from}-to-{to}/?ddate={date}',
  },
];

/**
 * Tours & activities partners — the #2 franchise line (~27% of modeled revenue).
 * Surfaced via the city panel's "Things to do" strip → the booking sheet. The
 * deeplink is a CITY SEARCH: the traveler browses REAL experiences on the
 * marketplace. Tarmil never invents a specific tour / price / rating — the
 * honesty firewall (and the category's hallucination trap) forbids it.
 */
export const TOUR_PARTNERS: BookingPartner[] = [
  {
    id: 'getyourguide',
    name: 'GetYourGuide',
    hex: '#FF5533',
    logoPath: null,
    deeplinkTemplate: 'https://www.getyourguide.com/s/?q={city}',
  },
  {
    id: 'viator',
    name: 'Viator',
    hex: '#328E7E',
    logoPath: null,
    deeplinkTemplate: 'https://www.viator.com/searchResults/all?text={city}',
  },
];
