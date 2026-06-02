import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useSupabaseData } from '../../lib/SupabaseDataProvider';
import { ErrorPanel } from '../../components/DataState';
import type { PlannedStop } from '../../data/plannedStops';
import { WebHeader } from './WebHeader';
import { WebStopList } from './WebStopList';
// Mapbox GL is ~1.8 MB — lazy-load it so it doesn't block the planner's first
// paint; the chunk loads on demand behind a calm placeholder.
const WebMapCanvas = lazy(() =>
  import('./WebMapCanvas').then((m) => ({ default: m.WebMapCanvas })),
);
import { WebBubble } from './WebBubble';
import { WebAddStopModal } from './WebAddStopModal';
import { WebHomeEditor } from './WebHomeEditor';
import { WebPlannerSkeleton } from './WebPlannerSkeleton';
import { WebToastLayer } from './WebToast';
import { WebPhotoLightbox } from './WebPhotoLightbox';
import { WebBookingSheet } from './WebBookingSheet';
import { DEFAULT_HOME, loadHome, saveHome, type HomeCity } from './homeCity';
import { loadStops, saveStops } from './tripStorage';
import { ensureAnonUser, fetchServerTrip, pushServerTrip } from './tripSync';
import { routeCities, type StarterRoute } from './starterRoutes';
import {
  addStop as addStopMut,
  addRoute as addRouteMut,
  editStopDates as editStopDatesMut,
  removeStop as removeStopMut,
  reorderStops as reorderStopsMut,
} from './tripMutations';
import type { Selection } from './types';

export function WebPlannerScreen() {
  const { data, loading, error } = useSupabaseData();
  const [localStops, setLocalStops] = useState<PlannedStop[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadStops([]);
  });
  const [home, setHome] = useState<HomeCity>(() => {
    if (typeof window === 'undefined') return DEFAULT_HOME;
    return loadHome();
  });
  const [selection, setSelection] = useState<Selection>({ type: 'none' });
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [homeEditorOpen, setHomeEditorOpen] = useState(false);

  // Latest values for the async server sync (avoids stale closures).
  const localStopsRef = useRef(localStops);
  const homeRef = useRef(home);
  const serverReadyRef = useRef(false);
  useEffect(() => {
    localStopsRef.current = localStops;
  }, [localStops]);
  useEffect(() => {
    homeRef.current = home;
  }, [home]);

  // localStorage is the instant, offline-safe cache.
  useEffect(() => {
    saveStops(localStops);
  }, [localStops]);

  useEffect(() => {
    saveHome(home);
  }, [home]);

  // Supabase is the durable, server-side copy under an anonymous user (table
  // web_trips). On first load: if the server has a trip, it wins; otherwise we
  // seed it from local. Degrades silently to localStorage-only when Supabase is
  // unconfigured or anonymous sign-ins are disabled.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const uid = await ensureAnonUser();
      if (!uid || cancelled) return;
      const server = await fetchServerTrip();
      if (cancelled) return;
      if (server && server.stops.length > 0) {
        setLocalStops(server.stops);
        if (server.home) setHome(server.home);
      } else {
        await pushServerTrip(localStopsRef.current, homeRef.current);
      }
      serverReadyRef.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!serverReadyRef.current) return;
    const t = setTimeout(() => {
      void pushServerTrip(localStops, home);
    }, 800);
    return () => clearTimeout(t);
  }, [localStops, home]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (homeEditorOpen) {
        setHomeEditorOpen(false);
      } else if (addStopOpen) {
        setAddStopOpen(false);
      } else if (selection.type !== 'none') {
        setSelection({ type: 'none' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addStopOpen, homeEditorOpen, selection.type]);

  if (loading) return <WebPlannerSkeleton />;
  if (error || !data) return <ErrorPanel error={error} />;

  const stops = localStops;
  const places = data.places;

  const handleAddRoute = (route: StarterRoute) => {
    setLocalStops((prev) => addRouteMut(prev, routeCities(route)));
  };

  const handleReorder = (fromIdx: number, toIdx: number) => {
    setLocalStops((prev) =>
      reorderStopsMut(prev ?? stops, fromIdx, toIdx),
    );
  };
  const handleRemove = (id: string) => {
    setLocalStops((prev) => removeStopMut(prev ?? stops, id));
    if (selection.type === 'stop' && selection.stopId === id) {
      setSelection({ type: 'none' });
    }
    if (
      selection.type === 'leg' &&
      (selection.fromStopId === id || selection.toStopId === id)
    ) {
      setSelection({ type: 'none' });
    }
  };
  const handleEditDates = (
    id: string,
    arrivalIso: string,
    departureIso: string,
  ) => {
    setLocalStops((prev) =>
      editStopDatesMut(prev ?? stops, id, arrivalIso, departureIso),
    );
  };

  return (
    <>
      <div className="flex h-dvh flex-col bg-cream">
        <WebHeader stops={stops} />
        {/* Phone: stacked itinerary + map (view+book floor). md+ : 3-column desktop. */}
        <div className="flex-1 flex min-h-0 flex-col md:flex-row">
          <WebStopList
            stops={stops}
            home={home}
            selection={selection}
            onSelect={setSelection}
            onAddStop={() => setAddStopOpen(true)}
            onReorder={handleReorder}
            onRemoveStop={handleRemove}
            onEditDates={handleEditDates}
            onEditHome={() => setHomeEditorOpen(true)}
            onAddRoute={handleAddRoute}
          />
          <div className="flex-1 relative min-h-0">
            <Suspense fallback={<div className="absolute inset-0 bg-sand" />}>
              <WebMapCanvas
                stops={stops}
                home={home}
                selection={selection}
                onSelect={setSelection}
              />
            </Suspense>
            <WebBubble
              selection={selection}
              stops={stops}
              home={home}
              places={places}
              onClose={() => setSelection({ type: 'none' })}
            />
          </div>
        </div>
      </div>
      <WebAddStopModal
        open={addStopOpen}
        onClose={() => setAddStopOpen(false)}
        onAdd={(city) => setLocalStops((prev) => addStopMut(prev ?? stops, city))}
        existingStopIds={stops.map((s) => s.id)}
      />
      <WebHomeEditor
        open={homeEditorOpen}
        onClose={() => setHomeEditorOpen(false)}
        onPick={(h) => setHome(h)}
        currentName={home.nameEn}
      />
      <WebPhotoLightbox />
      <WebBookingSheet />
      <WebToastLayer />
    </>
  );
}
