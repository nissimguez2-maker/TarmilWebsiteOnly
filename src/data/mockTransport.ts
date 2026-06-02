/**
 * Static mock transport offers between consecutive planned stops, used only by
 * the /web desktop planner. This is the single file under src/data/* that is
 * imported at runtime — every other data file in here is seed-only and read
 * back through SupabaseDataProvider.
 */

export type TransportMode =
  | 'flight'
  | 'bus'
  | 'ferry'
  | 'transfer'
  | 'train'
  | 'drive';

export type TransportOffer = {
  id: string;
  fromStopId: string;
  toStopId: string;
  mode: TransportMode;
  provider: string;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  price: number;
  currency: 'USD' | 'BRL' | 'ARS';
  badge: 'cheapest' | 'fastest' | 'easiest' | 'recommended' | null;
  stops: number;
  note?: string;
};

export type TransportLeg = {
  fromStopId: string;
  toStopId: string;
  travelDate: string;
  legType: 'flight' | 'bus' | 'mixed';
  offers: TransportOffer[];
};

export const mockTransportLegs: TransportLeg[] = [
  {
    fromStopId: 'buzios',
    toStopId: 'sao-paulo',
    travelDate: '2026-10-31',
    legType: 'mixed',
    offers: [
      {
        id: 'buzios-sp-bus',
        fromStopId: 'buzios',
        toStopId: 'sao-paulo',
        mode: 'bus',
        provider: 'Rodoviária do Rio',
        departureTime: '07:00',
        arrivalTime: '13:30',
        durationLabel: '6h 30m',
        price: 28,
        currency: 'USD',
        badge: 'cheapest',
        stops: 1,
        note: 'Transfer in Rio.',
      },
      {
        id: 'buzios-sp-van',
        fromStopId: 'buzios',
        toStopId: 'sao-paulo',
        mode: 'transfer',
        provider: 'Direct transfer van',
        departureTime: '08:00',
        arrivalTime: '13:00',
        durationLabel: '5h',
        price: 55,
        currency: 'USD',
        badge: 'easiest',
        stops: 0,
      },
      {
        id: 'buzios-sp-flight',
        fromStopId: 'buzios',
        toStopId: 'sao-paulo',
        mode: 'flight',
        provider: 'LATAM via GIG',
        departureTime: '09:00',
        arrivalTime: '11:00',
        durationLabel: '2h',
        price: 110,
        currency: 'USD',
        badge: 'fastest',
        stops: 1,
        note: '+2h transfer to GIG.',
      },
    ],
  },
  {
    fromStopId: 'sao-paulo',
    toStopId: 'jericoacoara',
    travelDate: '2026-11-06',
    legType: 'flight',
    offers: [
      {
        id: 'sp-jeri-latam',
        fromStopId: 'sao-paulo',
        toStopId: 'jericoacoara',
        mode: 'flight',
        provider: 'LATAM GRU → FOR + transfer',
        departureTime: '06:00',
        arrivalTime: '14:00',
        durationLabel: '8h total',
        price: 145,
        currency: 'USD',
        badge: 'recommended',
        stops: 1,
        note: '+4h transfer from Fortaleza.',
      },
      {
        id: 'sp-jeri-gol',
        fromStopId: 'sao-paulo',
        toStopId: 'jericoacoara',
        mode: 'flight',
        provider: 'Gol via BSB',
        departureTime: '07:30',
        arrivalTime: '16:00',
        durationLabel: '8h 30m',
        price: 98,
        currency: 'USD',
        badge: 'cheapest',
        stops: 2,
      },
      {
        id: 'sp-jeri-azul',
        fromStopId: 'sao-paulo',
        toStopId: 'jericoacoara',
        mode: 'flight',
        provider: 'Azul direct + transfer',
        departureTime: '08:00',
        arrivalTime: '11:45',
        durationLabel: '3h 45m flight',
        price: 175,
        currency: 'USD',
        badge: 'fastest',
        stops: 0,
        note: '+3h transfer.',
      },
    ],
  },
  {
    fromStopId: 'jericoacoara',
    toStopId: 'buenos-aires',
    travelDate: '2026-11-13',
    legType: 'flight',
    offers: [
      {
        id: 'jeri-ba-latam',
        fromStopId: 'jericoacoara',
        toStopId: 'buenos-aires',
        mode: 'flight',
        provider: 'LATAM via GRU',
        departureTime: '05:00',
        arrivalTime: '16:30',
        durationLabel: '11h 30m',
        price: 310,
        currency: 'USD',
        badge: 'recommended',
        stops: 1,
      },
      {
        id: 'jeri-ba-gol',
        fromStopId: 'jericoacoara',
        toStopId: 'buenos-aires',
        mode: 'flight',
        provider: 'Gol via BSB + GRU',
        departureTime: '06:00',
        arrivalTime: '18:00',
        durationLabel: '12h',
        price: 215,
        currency: 'USD',
        badge: 'cheapest',
        stops: 2,
      },
      {
        id: 'jeri-ba-azul',
        fromStopId: 'jericoacoara',
        toStopId: 'buenos-aires',
        mode: 'flight',
        provider: 'Azul via VCP',
        departureTime: '07:30',
        arrivalTime: '17:00',
        durationLabel: '9h 30m',
        price: 390,
        currency: 'USD',
        badge: 'fastest',
        stops: 1,
      },
      {
        id: 'jeri-ba-copa',
        fromStopId: 'jericoacoara',
        toStopId: 'buenos-aires',
        mode: 'flight',
        provider: 'Copa via BOG',
        departureTime: '09:00',
        arrivalTime: '20:00',
        durationLabel: '11h',
        price: 285,
        currency: 'USD',
        badge: 'easiest',
        stops: 1,
      },
    ],
  },
  {
    fromStopId: 'buenos-aires',
    toStopId: 'punta-del-este',
    travelDate: '2026-11-20',
    legType: 'mixed',
    offers: [
      {
        id: 'ba-punta-buquebus',
        fromStopId: 'buenos-aires',
        toStopId: 'punta-del-este',
        mode: 'ferry',
        provider: 'Buquebus direct',
        departureTime: '08:00',
        arrivalTime: '11:30',
        durationLabel: '3h 30m',
        price: 95,
        currency: 'USD',
        badge: 'recommended',
        stops: 0,
      },
      {
        id: 'ba-punta-bus',
        fromStopId: 'buenos-aires',
        toStopId: 'punta-del-este',
        mode: 'bus',
        provider: 'Bus via Colonia',
        departureTime: '07:00',
        arrivalTime: '13:00',
        durationLabel: '6h',
        price: 32,
        currency: 'USD',
        badge: 'cheapest',
        stops: 1,
      },
      {
        id: 'ba-punta-seacat',
        fromStopId: 'buenos-aires',
        toStopId: 'punta-del-este',
        mode: 'ferry',
        provider: 'Seacat ferry',
        departureTime: '09:30',
        arrivalTime: '12:45',
        durationLabel: '3h 15m',
        price: 110,
        currency: 'USD',
        badge: 'fastest',
        stops: 0,
      },
    ],
  },
];

export function findLeg(
  fromStopId: string,
  toStopId: string,
): TransportLeg | undefined {
  return mockTransportLegs.find(
    (l) => l.fromStopId === fromStopId && l.toStopId === toStopId,
  );
}
