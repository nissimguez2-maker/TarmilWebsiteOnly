import type {
  TransportLeg,
  TransportMode,
  TransportOffer,
} from '../../data/mockTransport';
import type { PlannedStop } from '../../data/plannedStops';

type Zone = 'south-america' | 'europe' | 'north-america' | 'asia' | 'mena' | 'oceania' | 'africa' | 'global';

const TRAIN_FRIENDLY_ZONES: Set<Zone> = new Set(['europe', 'asia']);

// Carriers are curated to operators that ship a brand mark in
// `operatorBrand.ts` (simple-icons), so every flight row renders a real logo.
// Region lists lean on carriers that genuinely serve the zone.
const FLIGHT_PROVIDERS: Record<Zone, string[]> = {
  'south-america': ['Copa Airlines', 'Avianca', 'Aeroméxico', 'American Airlines', 'United', 'Delta'],
  europe: ['Lufthansa', 'Air France', 'KLM', 'British Airways', 'Iberia', 'Ryanair', 'EasyJet', 'Wizz Air', 'Norwegian'],
  'north-america': ['Delta', 'American Airlines', 'United', 'JetBlue', 'Air Canada'],
  asia: ['ANA', 'JAL', 'Singapore Airlines', 'Air China', 'Air India', 'IndiGo', 'AirAsia'],
  mena: ['Emirates', 'Qatar Airways', 'Turkish Airlines', 'Saudia'],
  oceania: ['Qantas', 'Singapore Airlines', 'Emirates', 'AirAsia'],
  africa: ['Ethiopian Airlines', 'Qatar Airways', 'Turkish Airlines', 'Emirates'],
  global: ['Air France', 'British Airways', 'Lufthansa', 'KLM', 'Iberia', 'Emirates', 'Qatar Airways', 'Turkish Airlines', 'Delta', 'United', 'Singapore Airlines'],
};

const BUS_PROVIDERS: Record<Zone, string[]> = {
  'south-america': ['Buser', 'Cometa', '1001', 'Plataforma10', 'Andesmar', 'Flecha Bus', 'Crucero del Norte'],
  europe: ['FlixBus', 'BlaBlaBus', 'Eurolines', 'National Express', 'ALSA', 'MarinoBus'],
  'north-america': ['Greyhound', 'Megabus', 'FlixBus', 'BoltBus'],
  asia: ['Kintetsu Bus', 'Willer Express', 'Kobus', 'AnGel Express'],
  mena: ['SuperJet', 'Blue Bus', 'GoBus'],
  oceania: ['Greyhound Australia', 'Premier Motor Service', 'InterCity'],
  africa: ['Intercape', 'Translux', 'Greyhound SA'],
  global: ['FlixBus', 'BlaBlaBus'],
};

// European rail leans on the three operators with brand marks (Deutsche
// Bahn, SNCF, ÖBB). Other zones keep descriptive names — they fall back to a
// clean rail-glyph tile, still paired with a booking-platform button.
const TRAIN_PROVIDERS: Record<Zone, string[]> = {
  'south-america': [],
  europe: ['Deutsche Bahn', 'SNCF', 'ÖBB'],
  'north-america': ['Amtrak', 'VIA Rail'],
  asia: ['JR Shinkansen', 'China Railway G', 'KTX', 'Taiwan HSR'],
  mena: ['Egyptian National Railways', 'Turkish State Railways'],
  oceania: ['NSW TrainLink', 'KiwiRail'],
  africa: ['ONCF Al Boraq', 'South African Railways'],
  global: ['Deutsche Bahn', 'SNCF'],
};

const FERRY_PROVIDERS: Record<Zone, string[]> = {
  'south-america': ['Buquebus', 'Colonia Express', 'Seacat Colonia'],
  europe: ['Stena Line', 'DFDS', 'Brittany Ferries', 'Grimaldi Lines', 'Tirrenia'],
  'north-america': ['BC Ferries', 'Washington State Ferries'],
  asia: ['Shin Nihonkai', 'Cosco Ferry', 'Star Ferry'],
  mena: ['Egyptian Ferry Services'],
  oceania: ['Interislander', 'Spirit of Tasmania'],
  africa: ['African Express Lines'],
  global: ['Stena Line', 'DFDS'],
};

const TRANSFER_PROVIDERS = [
  'Direct shuttle',
  'Private van',
  'Door-to-door transfer',
];

function zoneFor(lat: number, lng: number): Zone {
  if (lat >= -60 && lat <= 14 && lng >= -82 && lng <= -34) return 'south-america';
  if (lat >= 12 && lat <= 36 && lng >= -18 && lng <= 65) return 'mena';
  if (lat >= 35 && lat <= 72 && lng >= -25 && lng <= 45) return 'europe';
  if (lat >= 24 && lat <= 72 && lng >= -170 && lng <= -50) return 'north-america';
  if (lat >= -10 && lat <= 55 && lng >= 60 && lng <= 150) return 'asia';
  if (lat >= -50 && lat <= 0 && lng >= 110 && lng <= 180) return 'oceania';
  if (lat >= -35 && lat <= 38 && lng >= -20 && lng <= 60) return 'africa';
  return 'global';
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function seededPick<T>(arr: T[], seed: number, salt = 0): T {
  if (arr.length === 0) {
    throw new Error('seededPick on empty array');
  }
  return arr[(seed + salt) % arr.length];
}

function seededFloat(seed: number, salt = 0): number {
  const s = (seed + salt * 7919) >>> 0;
  return (s & 0xffffff) / 0xffffff;
}

const FERRY_PAIRS: Array<[string, string]> = [
  ['buenos-aires', 'punta-del-este'],
  ['buenos-aires', 'colonia-del-sacramento'],
  ['buzios', 'rio-de-janeiro'],
];

function hasFerryRoute(a: PlannedStop, b: PlannedStop): boolean {
  const pair: [string, string] = [a.id, b.id];
  const sorted = pair.slice().sort();
  return FERRY_PAIRS.some(
    (p) => {
      const ps = p.slice().sort();
      return ps[0] === sorted[0] && ps[1] === sorted[1];
    },
  );
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function addMinutes(hh: number, mm: number, totalMinutes: number): [number, number] {
  const t = hh * 60 + mm + Math.round(totalMinutes);
  const wrapped = ((t % (24 * 60)) + 24 * 60) % (24 * 60);
  return [Math.floor(wrapped / 60), wrapped % 60];
}

function fmtTime(h: number, m: number): string {
  return `${pad2(h)}:${pad2(m)}`;
}

function fmtDuration(totalMinutes: number): string {
  if (totalMinutes < 60) return `${Math.round(totalMinutes)}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes - h * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

type OfferDraft = {
  mode: TransportMode;
  provider: string;
  durationMin: number;
  price: number;
  stops: number;
  note?: string;
};

function generateMode(
  mode: TransportMode,
  zone: Zone,
  distanceKm: number,
  seed: number,
  offerIndex: number,
): OfferDraft | null {
  const baseSeed = seed + offerIndex * 31;
  const jitter = seededFloat(baseSeed, 11);

  if (mode === 'flight') {
    const providers = FLIGHT_PROVIDERS[zone].length
      ? FLIGHT_PROVIDERS[zone]
      : FLIGHT_PROVIDERS.global;
    const provider = seededPick(providers, baseSeed, 1);
    const flightMin = distanceKm / 800 * 60 + 90;
    const stops = distanceKm > 3500 ? (jitter < 0.4 ? 1 : 2) : distanceKm > 1500 ? (jitter < 0.5 ? 0 : 1) : 0;
    const layoverMin = stops * (90 + Math.floor(jitter * 90));
    const durationMin = flightMin + layoverMin;
    const price = Math.round(distanceKm * 0.13 + 75 + jitter * 120);
    // `stops` is rendered on its own in the card; don't echo it into `note`
    // too (that produced "1 stop · 1 stop").
    return { mode, provider, durationMin, price, stops };
  }
  if (mode === 'bus') {
    const providers = BUS_PROVIDERS[zone].length
      ? BUS_PROVIDERS[zone]
      : BUS_PROVIDERS.global;
    const provider = seededPick(providers, baseSeed, 2);
    const durationMin = (distanceKm / 65) * 60 + 30 + jitter * 60;
    const price = Math.round(distanceKm * 0.045 + 12 + jitter * 25);
    return { mode, provider, durationMin, price, stops: 0 };
  }
  if (mode === 'train') {
    const providers = TRAIN_PROVIDERS[zone];
    if (providers.length === 0) return null;
    const provider = seededPick(providers, baseSeed, 3);
    const p = provider.toLowerCase();
    const highSpeed = ['shinkansen', 'tgv', 'ave', 'ice', 'sncf', 'deutsche bahn', 'hsr', 'ktx', 'al boraq', 'freccia', 'italo'];
    const speed = highSpeed.some((k) => p.includes(k)) ? 200 : 100;
    const durationMin = (distanceKm / speed) * 60 + 20;
    const price = Math.round(distanceKm * 0.10 + 20 + jitter * 40);
    return { mode, provider, durationMin, price, stops: 0 };
  }
  if (mode === 'ferry') {
    const providers = FERRY_PROVIDERS[zone].length
      ? FERRY_PROVIDERS[zone]
      : FERRY_PROVIDERS.global;
    const provider = seededPick(providers, baseSeed, 4);
    const durationMin = (distanceKm / 35) * 60 + 60;
    const price = Math.round(distanceKm * 0.22 + 28 + jitter * 35);
    return { mode, provider, durationMin, price, stops: 0 };
  }
  // transfer
  const provider = seededPick(TRANSFER_PROVIDERS, baseSeed, 5);
  const durationMin = (distanceKm / 80) * 60 + 20;
  const price = Math.round(distanceKm * 0.45 + 18 + jitter * 30);
  return { mode, provider, durationMin, price, stops: 0 };
}

function pickModesForDistance(
  distanceKm: number,
  zone: Zone,
  hasFerry: boolean,
): { mode: TransportMode; count: number }[] {
  if (distanceKm < 80) {
    return [
      { mode: 'transfer', count: 1 },
      { mode: 'bus', count: 1 },
    ];
  }
  if (distanceKm < 250) {
    const out: { mode: TransportMode; count: number }[] = [
      { mode: 'bus', count: 2 },
      { mode: 'transfer', count: 1 },
    ];
    if (hasFerry) out.push({ mode: 'ferry', count: 1 });
    if (TRAIN_FRIENDLY_ZONES.has(zone)) out.push({ mode: 'train', count: 1 });
    return out;
  }
  if (distanceKm < 1500) {
    const out: { mode: TransportMode; count: number }[] = [
      { mode: 'flight', count: 2 },
      { mode: 'bus', count: 1 },
    ];
    if (hasFerry) out.push({ mode: 'ferry', count: 1 });
    if (TRAIN_FRIENDLY_ZONES.has(zone)) out.push({ mode: 'train', count: 1 });
    return out;
  }
  if (distanceKm < 4000) {
    const out: { mode: TransportMode; count: number }[] = [
      { mode: 'flight', count: 3 },
    ];
    if (TRAIN_FRIENDLY_ZONES.has(zone) && distanceKm < 2500) {
      out.push({ mode: 'train', count: 1 });
    }
    return out;
  }
  return [{ mode: 'flight', count: 3 }];
}

function assignBadges(
  offers: TransportOffer[],
): TransportOffer[] {
  if (offers.length === 0) return offers;
  const byPrice = [...offers].sort((a, b) => a.price - b.price);
  const byDuration = [...offers].sort((a, b) => durationMinFromLabel(a.durationLabel) - durationMinFromLabel(b.durationLabel));
  const cheapest = byPrice[0]?.id;
  const fastest = byDuration[0]?.id;
  const directFlight = offers.find((o) => o.mode === 'flight' && o.stops === 0);
  const recommended = directFlight ??
    offers.find((o) => o.mode === 'flight') ??
    offers.find((o) => o.mode === 'train') ??
    offers[0];
  const easiest =
    offers.find((o) => o.mode === 'transfer') ??
    offers.find((o) => o.mode === 'ferry' && o.stops === 0) ??
    offers.find((o) => o.mode === 'flight' && o.stops === 0);

  return offers.map((o) => {
    if (o.id === cheapest) return { ...o, badge: 'cheapest' };
    if (o.id === fastest) return { ...o, badge: 'fastest' };
    if (recommended && o.id === recommended.id) return { ...o, badge: 'recommended' };
    if (easiest && o.id === easiest.id) return { ...o, badge: 'easiest' };
    return o;
  });
}

function durationMinFromLabel(label: string): number {
  const hMatch = label.match(/(\d+)h/);
  const mMatch = label.match(/(\d+)m/);
  return (hMatch ? parseInt(hMatch[1], 10) * 60 : 0) + (mMatch ? parseInt(mMatch[1], 10) : 0);
}

function inferLegType(offers: TransportOffer[]): TransportLeg['legType'] {
  const modes = new Set(offers.map((o) => o.mode));
  if (modes.has('flight') && modes.size > 1) return 'mixed';
  if (modes.has('flight')) return 'flight';
  if (modes.has('train')) return 'mixed';
  if (modes.has('ferry') && modes.has('bus')) return 'mixed';
  return 'bus';
}

export function generateLeg(
  from: PlannedStop,
  to: PlannedStop,
  travelDateIso: string,
): TransportLeg {
  const distanceKm = haversineKm(from.lat, from.lng, to.lat, to.lng);
  const zone = zoneFor((from.lat + to.lat) / 2, (from.lng + to.lng) / 2);
  const hasFerry = hasFerryRoute(from, to);
  const modeMix = pickModesForDistance(distanceKm, zone, hasFerry);
  const baseSeed = hashString(`${from.id}|${to.id}|${travelDateIso}`);

  const offers: TransportOffer[] = [];
  let offerIdx = 0;
  for (const { mode, count } of modeMix) {
    for (let i = 0; i < count; i++) {
      const draft = generateMode(mode, zone, distanceKm, baseSeed, offerIdx);
      if (!draft) {
        offerIdx++;
        continue;
      }
      const departHourBase =
        mode === 'flight'
          ? 6 + (offerIdx * 3) % 14
          : mode === 'bus'
            ? 7 + offerIdx * 4
            : mode === 'train'
              ? 7 + offerIdx * 3
              : mode === 'ferry'
                ? 8 + offerIdx * 3
                : 9 + offerIdx * 2;
      const depHour = ((departHourBase + Math.floor(seededFloat(baseSeed, offerIdx) * 3)) % 22);
      const depMinute = (Math.floor(seededFloat(baseSeed, offerIdx + 99) * 4) * 15) % 60;
      const [arrHour, arrMinute] = addMinutes(depHour, depMinute, draft.durationMin);
      offers.push({
        id: `${from.id}-${to.id}-${mode}-${offerIdx}`,
        fromStopId: from.id,
        toStopId: to.id,
        mode,
        provider: draft.provider,
        departureTime: fmtTime(depHour, depMinute),
        arrivalTime: fmtTime(arrHour, arrMinute),
        durationLabel: fmtDuration(draft.durationMin),
        price: draft.price,
        currency: 'USD',
        badge: null,
        stops: draft.stops,
        note: draft.note,
      });
      offerIdx++;
    }
  }

  const badged = assignBadges(offers);
  return {
    fromStopId: from.id,
    toStopId: to.id,
    travelDate: travelDateIso,
    legType: inferLegType(badged),
    offers: badged,
  };
}
