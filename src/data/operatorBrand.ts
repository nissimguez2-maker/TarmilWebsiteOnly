import {
  siAircanada,
  siAirasia,
  siAirchina,
  siAirindia,
  siAirfrance,
  siAeromexico,
  siAmericanairlines,
  siAna,
  siAvianca,
  siBritishairways,
  siCopaairlines,
  siDelta,
  siDeutschebahn,
  siEasyjet,
  siEmirates,
  siEthiopianairlines,
  siIberia,
  siIndigo,
  siJapanairlines,
  siJetblue,
  siKlm,
  siLufthansa,
  siNorwegian,
  siObb,
  siQantas,
  siQatarairways,
  siRyanair,
  siSaudia,
  siSingaporeairlines,
  siSncf,
  siTurkishairlines,
  siUnitedairlines,
  siWizzair,
  type SimpleIcon,
} from 'simple-icons';

/**
 * Per-operator brand identity for the /web Transport panel.
 *
 * Resolution is layered for fidelity + resilience:
 *   1. `iata` → a full-colour airline logo from Kiwi's public CDN (the same
 *      asset set travel apps use). This is what makes the cards read real.
 *   2. `mono` → a monochrome simple-icons mark in the brand colour, used when
 *      a carrier has no IATA logo (rail brands) or if the CDN image fails to
 *      load at runtime.
 *   3. (in the component) initials / a mode glyph when we have neither.
 *
 * Brand hexes are data, never Tailwind classes — they only ever feed an
 * inline `<svg fill>`, matching the carve-out the Mapbox heatmap uses.
 */

/** Strip diacritics + non-alphanumerics: "Aerolíneas Argentinas" → "aerolineasargentinas". */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

type OperatorEntry = {
  title: string;
  /** IATA code → full-colour Kiwi CDN logo. Airlines only. */
  iata?: string;
  /** simple-icons export, for the monochrome fallback mark. */
  icon?: SimpleIcon;
};

/**
 * Normalised provider string → operator identity. Several spellings can map
 * to one entry (e.g. "JAL" and "Japan Airlines"). Keep this list aligned with
 * the provider pools in `transportGenerator.ts`.
 */
const OPERATORS: Record<string, OperatorEntry> = {
  // ── Americas ──
  copaairlines: { title: 'Copa Airlines', iata: 'CM', icon: siCopaairlines },
  avianca: { title: 'Avianca', iata: 'AV', icon: siAvianca },
  aeromexico: { title: 'Aeroméxico', iata: 'AM', icon: siAeromexico },
  americanairlines: { title: 'American Airlines', iata: 'AA', icon: siAmericanairlines },
  united: { title: 'United', iata: 'UA', icon: siUnitedairlines },
  delta: { title: 'Delta', iata: 'DL', icon: siDelta },
  jetblue: { title: 'JetBlue', iata: 'B6', icon: siJetblue },
  aircanada: { title: 'Air Canada', iata: 'AC', icon: siAircanada },
  // ── Europe ──
  lufthansa: { title: 'Lufthansa', iata: 'LH', icon: siLufthansa },
  airfrance: { title: 'Air France', iata: 'AF', icon: siAirfrance },
  klm: { title: 'KLM', iata: 'KL', icon: siKlm },
  britishairways: { title: 'British Airways', iata: 'BA', icon: siBritishairways },
  iberia: { title: 'Iberia', iata: 'IB', icon: siIberia },
  ryanair: { title: 'Ryanair', iata: 'FR', icon: siRyanair },
  easyjet: { title: 'easyJet', iata: 'U2', icon: siEasyjet },
  wizzair: { title: 'Wizz Air', iata: 'W6', icon: siWizzair },
  norwegian: { title: 'Norwegian', iata: 'DY', icon: siNorwegian },
  // ── Asia / Pacific ──
  ana: { title: 'ANA', iata: 'NH', icon: siAna },
  allnipponairways: { title: 'ANA', iata: 'NH', icon: siAna },
  jal: { title: 'Japan Airlines', iata: 'JL', icon: siJapanairlines },
  japanairlines: { title: 'Japan Airlines', iata: 'JL', icon: siJapanairlines },
  singaporeairlines: { title: 'Singapore Airlines', iata: 'SQ', icon: siSingaporeairlines },
  airchina: { title: 'Air China', iata: 'CA', icon: siAirchina },
  airindia: { title: 'Air India', iata: 'AI', icon: siAirindia },
  indigo: { title: 'IndiGo', iata: '6E', icon: siIndigo },
  airasia: { title: 'AirAsia', iata: 'AK', icon: siAirasia },
  qantas: { title: 'Qantas', iata: 'QF', icon: siQantas },
  // ── MENA / Africa ──
  emirates: { title: 'Emirates', iata: 'EK', icon: siEmirates },
  qatarairways: { title: 'Qatar Airways', iata: 'QR', icon: siQatarairways },
  turkishairlines: { title: 'Turkish Airlines', iata: 'TK', icon: siTurkishairlines },
  saudia: { title: 'Saudia', iata: 'SV', icon: siSaudia },
  ethiopianairlines: { title: 'Ethiopian Airlines', iata: 'ET', icon: siEthiopianairlines },
  // ── Rail (no IATA — monochrome mark only) ──
  deutschebahn: { title: 'Deutsche Bahn', icon: siDeutschebahn },
  sncf: { title: 'SNCF', icon: siSncf },
  obb: { title: 'ÖBB', icon: siObb },
};

export type OperatorBrand = {
  title: string;
  /** IATA code for the full-colour CDN logo, when the operator is an airline. */
  iata?: string;
  /** Monochrome fallback mark. */
  mono?: { hex: string; path: string };
};

export function resolveOperatorBrand(provider: string): OperatorBrand | null {
  const entry = OPERATORS[normalize(provider)];
  if (!entry) return null;
  return {
    title: entry.title,
    iata: entry.iata,
    mono: entry.icon
      ? { hex: `#${entry.icon.hex}`, path: entry.icon.path }
      : undefined,
  };
}

/** Full-colour airline logo from Kiwi's public CDN, keyed by IATA code. */
export function airlineLogoUrl(iata: string, size = 128): string {
  return `https://images.kiwi.com/airlines/${size}x${size}/${iata}.png`;
}
