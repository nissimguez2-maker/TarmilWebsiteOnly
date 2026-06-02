import type { StyleSpecification } from 'mapbox-gl';

/**
 * Apple-Maps-like Mapbox GL style.
 *
 * The brief asks for a map that reads like Apple Maps: soft light-blue water,
 * a warm near-white land, gentle greens for parks, hairline boundaries, and
 * clean grotesque labels — NOT the pink/beige raster the mock shipped before.
 *
 * It is a self-contained vector style built on Mapbox Streets v8, so the look
 * lives in source (no Studio round-trip) and the palette below is the single
 * knob to tweak. Labels use Mapbox's hosted DIN Pro (closest free stand-in for
 * Apple's San Francisco), falling back per-glyph to Arial Unicode.
 *
 * Requires a Mapbox token (free tier). When unset, the map components render a
 * graceful placeholder instead of initialising Mapbox GL (which hard-requires
 * a token).
 */

export const MAPBOX_TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN ?? '').trim();
export const hasMapboxToken = MAPBOX_TOKEN.length > 0;

/** Apple-Maps-calibrated palette. Tweak here; both surfaces inherit it. */
const apple = {
  land: '#F4F2EC', // warm near-white — Apple's land in light mode
  water: '#A7D6F0', // soft light blue — the hero colour
  waterway: '#9FCFEC',
  grass: '#D5E7BE', // soft park green
  wood: '#C7DEAC',
  parkOutline: '#C2D9A4',
  sand: '#EFE7D2',
  building: '#ECE7DC',
  buildingOutline: '#E2DBCB',
  roadFill: '#FFFFFF',
  roadCasing: '#E6E0D3',
  motorway: '#FBE2AE', // warm tan highways, Apple-style
  motorwayCasing: '#EBC983',
  boundaryCountry: '#C9BCA9',
  boundaryState: '#D9CFBE',
  labelCity: '#37332C',
  labelCountry: '#544A39',
  labelState: '#8A8068',
  labelWater: '#5E97B5',
  labelHalo: '#F7F4ED',
  cityDot: '#9A8E78',
} as const;

const FONT = ['DIN Pro Medium', 'Arial Unicode MS Regular'];
const FONT_REG = ['DIN Pro Regular', 'Arial Unicode MS Regular'];
const FONT_ITALIC = ['DIN Pro Italic', 'Arial Unicode MS Regular'];

// One worldview so borders/labels aren't drawn twice.
const WORLDVIEW = ['match', ['get', 'worldview'], ['all', 'US'], true, false];

const NAME = ['coalesce', ['get', 'name_en'], ['get', 'name']];

/**
 * Build the style fresh on each map init (cheap; keeps it immutable per map).
 * Cast once at the boundary — the runtime is validated by Mapbox's own style
 * parser, and we keep the expression arrays readable rather than fighting the
 * style-spec tuple types inline.
 */
export function buildAppleMapStyle(): StyleSpecification {
  const style = {
    version: 8,
    name: 'Tarmil — Apple-like',
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: {
      streets: {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8',
      },
    },
    sprite: 'mapbox://sprites/mapbox/streets-v12',
    layers: [
      // ── Land base ──────────────────────────────────────────────────
      {
        id: 'land',
        type: 'background',
        paint: { 'background-color': apple.land },
      },

      // ── Greenery ───────────────────────────────────────────────────
      {
        id: 'national-park',
        type: 'fill',
        source: 'streets',
        'source-layer': 'landuse_overlay',
        filter: ['==', ['get', 'class'], 'national_park'],
        paint: { 'fill-color': apple.wood, 'fill-opacity': 0.5 },
      },
      {
        id: 'parks',
        type: 'fill',
        source: 'streets',
        'source-layer': 'landuse',
        filter: [
          'match',
          ['get', 'class'],
          ['park', 'pitch', 'cemetery', 'golf_course', 'grass', 'wood', 'scrub'],
          true,
          false,
        ],
        paint: { 'fill-color': apple.grass, 'fill-opacity': 0.7 },
      },
      {
        id: 'sand',
        type: 'fill',
        source: 'streets',
        'source-layer': 'landuse',
        filter: ['==', ['get', 'class'], 'sand'],
        paint: { 'fill-color': apple.sand },
      },

      // ── Water ──────────────────────────────────────────────────────
      {
        id: 'water',
        type: 'fill',
        source: 'streets',
        'source-layer': 'water',
        paint: { 'fill-color': apple.water },
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'streets',
        'source-layer': 'waterway',
        paint: {
          'line-color': apple.waterway,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8,
            0.6,
            14,
            2.2,
          ],
        },
      },

      // ── Buildings (high zoom only) ─────────────────────────────────
      {
        id: 'building',
        type: 'fill',
        source: 'streets',
        'source-layer': 'building',
        minzoom: 14,
        filter: ['==', ['get', 'extrude'], 'true'],
        paint: {
          'fill-color': apple.building,
          'fill-outline-color': apple.buildingOutline,
          'fill-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            15.5,
            0.9,
          ],
        },
      },

      // ── Roads: casing then fill ────────────────────────────────────
      {
        id: 'road-casing-major',
        type: 'line',
        source: 'streets',
        'source-layer': 'road',
        minzoom: 5,
        filter: [
          'match',
          ['get', 'class'],
          ['motorway', 'trunk', 'primary'],
          true,
          false,
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': [
            'match',
            ['get', 'class'],
            'motorway',
            apple.motorwayCasing,
            apple.roadCasing,
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5,
            0.8,
            10,
            3.5,
            14,
            9,
          ],
        },
      },
      {
        id: 'road-major',
        type: 'line',
        source: 'streets',
        'source-layer': 'road',
        minzoom: 5,
        filter: [
          'match',
          ['get', 'class'],
          ['motorway', 'trunk', 'primary'],
          true,
          false,
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': [
            'match',
            ['get', 'class'],
            'motorway',
            apple.motorway,
            apple.roadFill,
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6,
            0.6,
            10,
            2.4,
            14,
            6.5,
          ],
        },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: 'streets',
        'source-layer': 'road',
        minzoom: 12,
        filter: [
          'match',
          ['get', 'class'],
          ['secondary', 'tertiary', 'street', 'street_limited', 'service'],
          true,
          false,
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': apple.roadFill,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            0.5,
            16,
            4,
          ],
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            0,
            13,
            1,
          ],
        },
      },

      // ── Administrative boundaries ──────────────────────────────────
      {
        id: 'boundary-state',
        type: 'line',
        source: 'streets',
        'source-layer': 'admin',
        minzoom: 4,
        filter: [
          'all',
          ['==', ['get', 'admin_level'], 1],
          ['==', ['get', 'maritime'], 'false'],
          WORLDVIEW,
        ],
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': apple.boundaryState,
          'line-dasharray': [3, 2],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            0.5,
            10,
            1.2,
          ],
        },
      },
      {
        id: 'boundary-country',
        type: 'line',
        source: 'streets',
        'source-layer': 'admin',
        filter: [
          'all',
          ['==', ['get', 'admin_level'], 0],
          ['==', ['get', 'maritime'], 'false'],
          WORLDVIEW,
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': apple.boundaryCountry,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2,
            0.6,
            6,
            1.2,
            12,
            1.8,
          ],
        },
      },

      // ── Labels: water (italic, blue) ───────────────────────────────
      {
        id: 'label-water',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'natural_label',
        filter: [
          'match',
          ['get', 'class'],
          ['ocean', 'sea', 'bay', 'strait', 'gulf'],
          true,
          false,
        ],
        layout: {
          'text-field': NAME,
          'text-font': FONT_ITALIC,
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            1,
            12,
            5,
            18,
          ],
          'text-letter-spacing': 0.1,
          'text-max-width': 8,
          'text-line-height': 1.3,
        },
        paint: {
          'text-color': apple.labelWater,
          'text-halo-color': apple.water,
          'text-halo-width': 0.6,
          'text-halo-blur': 1,
        },
      },

      // ── Labels: country ────────────────────────────────────────────
      {
        id: 'label-country',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'place_label',
        filter: ['==', ['get', 'class'], 'country'],
        layout: {
          'text-field': NAME,
          'text-font': FONT,
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            2,
            13,
            5,
            18,
            8,
            22,
          ],
          'text-letter-spacing': 0.04,
          'text-max-width': 7,
          'text-padding': 6,
          'symbol-sort-key': 0,
        },
        paint: {
          'text-color': apple.labelCountry,
          'text-halo-color': apple.labelHalo,
          'text-halo-width': 1.4,
        },
      },

      // ── Labels: state / province ───────────────────────────────────
      {
        id: 'label-state',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'place_label',
        minzoom: 4,
        maxzoom: 9,
        filter: ['==', ['get', 'class'], 'state'],
        layout: {
          'text-field': NAME,
          'text-font': FONT_REG,
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            10,
            8,
            13,
          ],
          'text-letter-spacing': 0.05,
          'text-max-width': 7,
          'text-transform': 'uppercase',
        },
        paint: {
          'text-color': apple.labelState,
          'text-halo-color': apple.labelHalo,
          'text-halo-width': 1,
        },
      },

      // ── Labels: settlements (city dot + name) ──────────────────────
      {
        id: 'settlement-dot',
        type: 'circle',
        source: 'streets',
        'source-layer': 'place_label',
        minzoom: 4,
        filter: [
          'all',
          ['==', ['get', 'class'], 'settlement'],
          ['<=', ['get', 'symbolrank'], 11],
        ],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            1.6,
            10,
            3,
          ],
          'circle-color': apple.cityDot,
          'circle-stroke-color': apple.labelHalo,
          'circle-stroke-width': 1,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6,
            1,
            11,
            0,
          ],
        },
      },
      {
        id: 'label-settlement',
        type: 'symbol',
        source: 'streets',
        'source-layer': 'place_label',
        minzoom: 3,
        filter: [
          'all',
          ['==', ['get', 'class'], 'settlement'],
          [
            '<=',
            ['get', 'symbolrank'],
            ['step', ['zoom'], 5, 4, 7, 6, 9, 8, 11, 10, 13],
          ],
        ],
        layout: {
          'text-field': NAME,
          'text-font': FONT,
          'symbol-sort-key': ['get', 'symbolrank'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3,
            11,
            8,
            14,
            14,
            18,
          ],
          'text-max-width': 7,
          'text-offset': [0, 0.1],
          'text-anchor': [
            'step',
            ['zoom'],
            'center',
            7,
            'left',
          ],
          'text-radial-offset': ['step', ['zoom'], 0, 7, 0.6],
        },
        paint: {
          'text-color': apple.labelCity,
          'text-halo-color': apple.labelHalo,
          'text-halo-width': 1.3,
          'text-halo-blur': 0.4,
        },
      },
    ],
  };

  return style as unknown as StyleSpecification;
}
