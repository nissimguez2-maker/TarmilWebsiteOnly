import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { PlannedStop } from '../../data/plannedStops';
import type { HomeCity } from './homeCity';
import type { Selection } from './types';
import {
  MAPBOX_TOKEN,
  hasMapboxToken,
  buildAppleMapStyle,
} from '../../components/tripMap/appleMapStyle';
import { MapTokenNotice } from '../../components/tripMap/ui/MapTokenNotice';

mapboxgl.accessToken = MAPBOX_TOKEN;

// Mapbox's JS-driven motion can't see the CSS prefers-reduced-motion reset, so
// gate camera + line-draw on this explicitly.
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}
// One coherent camera duration (--motion-emphasis = 320ms), down from the old
// ad-hoc 1400ms that read as "slow/laggy".
const CAMERA_MS = 320;
function cameraMs(): number {
  return prefersReducedMotion() ? 0 : CAMERA_MS;
}

type Props = {
  stops: PlannedStop[];
  home: HomeCity;
  selection: Selection;
  onSelect: (s: Selection) => void;
};

type LngLat = [number, number];

type Leg = {
  id: number;
  fromId: string;
  toId: string;
  from: LngLat;
  to: LngLat;
};

/** Ordered legs: home → first stop → … → last stop → home. [lng, lat] order. */
function buildLegs(stops: PlannedStop[], home: HomeCity): Leg[] {
  if (stops.length === 0) return [];
  const H: LngLat = [home.lng, home.lat];
  const legs: Leg[] = [
    { id: 0, fromId: 'home', toId: stops[0].id, from: H, to: [stops[0].lng, stops[0].lat] },
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    legs.push({
      id: i + 1,
      fromId: stops[i].id,
      toId: stops[i + 1].id,
      from: [stops[i].lng, stops[i].lat],
      to: [stops[i + 1].lng, stops[i + 1].lat],
    });
  }
  const last = stops[stops.length - 1];
  legs.push({
    id: stops.length,
    fromId: last.id,
    toId: 'home',
    from: [last.lng, last.lat],
    to: H,
  });
  return legs;
}

function legsToGeoJSON(legs: Leg[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: legs.map((l) => ({
      type: 'Feature',
      id: l.id,
      properties: { fromId: l.fromId, toId: l.toId },
      geometry: { type: 'LineString', coordinates: [l.from, l.to] },
    })),
  };
}

/** Read a brand token as a concrete colour Mapbox can parse (no CSS vars on canvas). */
function cssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// The two pin ring states, hoisted so the selection effect can toggle a pin's
// box-shadow on the existing element (no marker rebuild). The box-shadow
// transition tweens the highlight; the global reduced-motion reset neutralizes it.
const MARKER_IDLE_RING = '0 2px 6px rgba(0,0,0,0.18)';
const MARKER_SELECTED_RING =
  '0 0 0 2px var(--cream), 0 0 0 5px var(--amber), 0 2px 6px rgba(0,0,0,0.18)';

function makeStopEl(index: number, selected: boolean, label?: string): HTMLDivElement {
  const el = document.createElement('div');
  const ring = selected ? MARKER_SELECTED_RING : MARKER_IDLE_RING;
  el.style.cssText = `position:relative;width:32px;height:32px;border-radius:9999px;background-color:var(--amber);display:flex;align-items:center;justify-content:center;color:white;font-family:'Inter Variable','Inter',system-ui,sans-serif;font-weight:600;font-size:14px;cursor:pointer;box-shadow:${ring};transition:box-shadow 200ms cubic-bezier(0.25,1,0.5,1);`;
  el.textContent = String(index + 1);
  if (label) {
    const l = document.createElement('div');
    l.style.cssText =
      "position:absolute;top:calc(100% + 4px);left:50%;transform:translateX(-50%);background-color:var(--cream);color:var(--charcoal);font-family:'Inter Variable','Inter',system-ui,sans-serif;font-weight:600;font-size:11px;line-height:1;padding:3px 7px;border-radius:9999px;box-shadow:0 1px 3px rgba(0,0,0,0.18);white-space:nowrap;pointer-events:none;";
    l.textContent = label;
    el.appendChild(l);
  }
  return el;
}

function makeHomeEl(): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText =
    'width:28px;height:28px;border-radius:9999px;background-color:var(--charcoal);display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 0 0 2px var(--cream), 0 0 0 4px var(--charcoal), 0 2px 6px rgba(0,0,0,0.18);';
  el.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 0-2-2h-0a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
  return el;
}

export function WebMapCanvas({ stops, home, selection, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const [zoom, setZoom] = useState(4);
  const showLabels = zoom >= 6;

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  const markersRef = useRef<mapboxgl.Marker[]>([]);
  // stopId -> pin element, so selection can re-style the existing pin in place.
  const stopElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const hoveredRef = useRef<number | null>(null);

  const legs = useMemo(() => buildLegs(stops, home), [stops, home]);

  // One-time map init.
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !hasMapboxToken) return;
    const initialCenter: LngLat = stops.length
      ? [stops[0].lng, stops[0].lat]
      : [home.lng, home.lat];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: buildAppleMapStyle(),
      center: initialCenter,
      zoom: 4,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      renderWorldCopies: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-right',
    );

    const handleZoom = () => setZoom(map.getZoom());
    map.on('zoomend', handleZoom);

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const features = map.getLayer('legs-line')
        ? map.queryRenderedFeatures(e.point, { layers: ['legs-line'] })
        : [];
      if (features.length) {
        const p = features[0].properties as { fromId: string; toId: string };
        onSelectRef.current({
          type: 'leg',
          fromStopId: p.fromId,
          toStopId: p.toId,
        });
      } else {
        onSelectRef.current({ type: 'none' });
      }
    };
    map.on('click', handleClick);

    // Delegated hover listeners activate once the layer exists.
    map.on('mousemove', 'legs-line', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features?.[0];
      if (!f || f.id == null) return;
      if (hoveredRef.current !== null) {
        map.setFeatureState(
          { source: 'legs', id: hoveredRef.current },
          { hover: false },
        );
      }
      hoveredRef.current = f.id as number;
      map.setFeatureState({ source: 'legs', id: f.id as number }, { hover: true });
    });
    map.on('mouseleave', 'legs-line', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredRef.current !== null) {
        map.setFeatureState(
          { source: 'legs', id: hoveredRef.current },
          { hover: false },
        );
      }
      hoveredRef.current = null;
    });

    map.on('load', () => {
      const amber = cssVar('--amber');
      const idle = cssVar('--charcoal-30');
      map.addSource('legs', { type: 'geojson', data: legsToGeoJSON([]) });
      map.addLayer({
        id: 'legs-line',
        type: 'line',
        source: 'legs',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            amber,
            ['boolean', ['feature-state', 'hover'], false],
            amber,
            idle,
          ],
          // Tween the highlight (was an instant snap → "abrupt").
          'line-color-transition': { duration: 200 },
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            3,
            ['boolean', ['feature-state', 'hover'], false],
            3,
            2,
          ],
          'line-width-transition': { duration: 200 },
          'line-opacity': 1,
          'line-opacity-transition': { duration: 420 },
          'line-dasharray': [2, 1.6],
        },
      } as mapboxgl.LayerSpecification);
      setStyleLoaded(true);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      setStyleLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the leg geometry in sync, and give the route a calm "draw" on change:
  // drop opacity to 0 then ramp to 1 so the line fades in over --motion-draw
  // instead of popping. Reduced-motion (and empty routes) just snap to full.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;
    const src = map.getSource('legs') as mapboxgl.GeoJSONSource | undefined;
    src?.setData(legsToGeoJSON(legs));
    if (legs.length > 0 && !prefersReducedMotion()) {
      map.setPaintProperty('legs-line', 'line-opacity', 0);
      requestAnimationFrame(() => {
        mapRef.current?.setPaintProperty('legs-line', 'line-opacity', 1);
      });
    } else {
      map.setPaintProperty('legs-line', 'line-opacity', 1);
    }
  }, [legs, styleLoaded]);

  // Selection → leg highlight (feature-state) + camera move.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;
    legs.forEach((l) => {
      const isSel =
        selection.type === 'leg' &&
        selection.fromStopId === l.fromId &&
        selection.toStopId === l.toId;
      map.setFeatureState({ source: 'legs', id: l.id }, { selected: isSel });
    });

    if (selection.type === 'stop') {
      const s = stops.find((x) => x.id === selection.stopId);
      if (s) map.flyTo({ center: [s.lng, s.lat], zoom: 9, duration: cameraMs() });
    } else if (selection.type === 'leg') {
      const from =
        selection.fromStopId === 'home'
          ? home
          : stops.find((x) => x.id === selection.fromStopId);
      const to =
        selection.toStopId === 'home'
          ? home
          : stops.find((x) => x.id === selection.toStopId);
      if (from && to) {
        const b = new mapboxgl.LngLatBounds();
        b.extend([from.lng, from.lat]);
        b.extend([to.lng, to.lat]);
        map.fitBounds(b, { padding: 80, duration: cameraMs() });
      }
    }
  }, [selection, legs, stops, home, styleLoaded]);

  // Reframe to fit home + all stops when the route changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded) return;
    const b = new mapboxgl.LngLatBounds();
    b.extend([home.lng, home.lat]);
    stops.forEach((s) => b.extend([s.lng, s.lat]));
    map.fitBounds(b, { padding: 60, duration: cameraMs() });
  }, [stops, home, styleLoaded]);

  // Markers (HTML overlays). Built from stops/home/labels ONLY — selection is
  // applied in the next effect by re-styling the existing pin, so tapping a pin
  // no longer tears down and rebuilds every marker (the old "laggy pin").
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    stopElsRef.current.clear();

    const homeEl = makeHomeEl();
    homeEl.title = `Home · ${home.nameEn}`;
    markersRef.current.push(
      new mapboxgl.Marker({ element: homeEl, anchor: 'center' })
        .setLngLat([home.lng, home.lat])
        .addTo(map),
    );

    stops.forEach((s, i) => {
      const el = makeStopEl(i, false, showLabels ? s.nameEn : undefined);
      el.title = s.nameEn;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectRef.current({ type: 'stop', stopId: s.id });
      });
      stopElsRef.current.set(s.id, el);
      markersRef.current.push(
        new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([s.lng, s.lat])
          .addTo(map),
      );
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      stopElsRef.current.clear();
    };
  }, [stops, home, showLabels]);

  // Apply selection by flipping the chosen pin's ring on the existing element —
  // a one-node style change, not a marker rebuild. Re-runs after a rebuild too
  // (stops in deps) so a fresh marker set picks the selection back up.
  useEffect(() => {
    stopElsRef.current.forEach((el, id) => {
      const selected = selection.type === 'stop' && selection.stopId === id;
      el.style.boxShadow = selected ? MARKER_SELECTED_RING : MARKER_IDLE_RING;
    });
  }, [selection, stops]);

  if (!hasMapboxToken) {
    return (
      <div className="absolute inset-0">
        <MapTokenNotice />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 isolate">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
