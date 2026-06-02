import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseData } from '../../lib/SupabaseDataProvider';
import { ErrorPanel } from '../../components/DataState';
import type { PlannedStop } from '../../data/plannedStops';
import { WebHeader } from './WebHeader';
import { WebStopList } from './WebStopList';
import { WebMapCanvas } from './WebMapCanvas';
import { WebBubble } from './WebBubble';
import { WebAddStopModal } from './WebAddStopModal';
import { WebHomeEditor } from './WebHomeEditor';
import { WebPlannerSkeleton } from './WebPlannerSkeleton';
import { WebToastLayer } from './WebToast';
import { WebPhotoLightbox } from './WebPhotoLightbox';
import { WebBookingSheet } from './WebBookingSheet';
import { DEFAULT_HOME, loadHome, saveHome, type HomeCity } from './homeCity';
import {
  addStop as addStopMut,
  editStopDates as editStopDatesMut,
  removeStop as removeStopMut,
  reorderStops as reorderStopsMut,
} from './tripMutations';
import type { Selection } from './types';

export function WebPlannerScreen() {
  const { data, loading, error } = useSupabaseData();
  const [localStops, setLocalStops] = useState<PlannedStop[] | null>(null);
  const [home, setHome] = useState<HomeCity>(() => {
    if (typeof window === 'undefined') return DEFAULT_HOME;
    return loadHome();
  });
  const [selection, setSelection] = useState<Selection>({ type: 'none' });
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [homeEditorOpen, setHomeEditorOpen] = useState(false);

  useEffect(() => {
    if (data && localStops === null) {
      setLocalStops(data.plannedStops);
    }
  }, [data, localStops]);

  useEffect(() => {
    saveHome(home);
  }, [home]);

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

  const stops = localStops ?? data.plannedStops;
  const places = data.places;

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
      <div className="hidden lg:flex h-dvh flex-col bg-cream">
        <WebHeader stops={stops} />
        <div className="flex-1 flex min-h-0">
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
          />
          <div className="flex-1 relative">
            <WebMapCanvas
              stops={stops}
              home={home}
              selection={selection}
              onSelect={setSelection}
            />
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
      <div className="flex lg:hidden h-dvh flex-col items-center justify-center p-xl text-center gap-md bg-cream">
        <p className="font-serif text-sub text-charcoal-70">
          Open on desktop (≥ 1024 px) to use the planner.
        </p>
        <Link
          to="/trip"
          className="text-small text-umber hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          Go to the mobile app →
        </Link>
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
