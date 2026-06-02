import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { type Place, derivePlacementTier } from '../data/places';
import type { PlannedStop } from '../data/plannedStops';
import { rioPlaces } from '../data/rioPlaces';
import { globalPlaces } from '../data/globalPlaces';

/**
 * Prototype data provider.
 *
 * The website phase has **no backend** — trips live in localStorage (managed
 * inside the planner) and curated places come from in-repo seed data. This
 * replaces the app's Supabase-backed provider; account sync, server-side
 * persistence and ratings are deferred (see CLAUDE.md scope).
 *
 * The original `useSupabaseData()` surface is kept intact so the planner needs
 * no changes: `{ data: { places, plannedStops }, loading, error }`. The name is
 * retained for this extraction pass; the data layer is reshaped in a later
 * phase.
 */
export type TripData = {
  places: Place[];
  plannedStops: PlannedStop[];
};

type ContextValue = {
  data: TripData | null;
  loading: boolean;
  error: Error | null;
};

const Context = createContext<ContextValue | null>(null);

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    // Curated seed places load instantly; the itinerary starts empty so the
    // planner opens on its first-run blank state (quick-start lands in W2).
    setData({
      // Disclose the merchant tier at read time (no schema change): earned
      // "Tarmil Selection" and paid "Sponsored" both surface; organic stays.
      places: [...rioPlaces, ...globalPlaces].map((p) => ({
        ...p,
        placementTier: p.placementTier ?? derivePlacementTier(p),
      })),
      plannedStops: [],
    });
    setLoading(false);
  }, []);

  return (
    <Context.Provider value={{ data, loading, error }}>
      {children}
    </Context.Provider>
  );
}

export function useSupabaseData(): ContextValue {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error('useSupabaseData must be used within SupabaseDataProvider');
  }
  return ctx;
}
