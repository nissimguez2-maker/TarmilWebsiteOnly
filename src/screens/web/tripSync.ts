import type { PlannedStop } from '../../data/plannedStops';
import type { HomeCity } from './homeCity';
import { supabase } from '../../lib/supabaseClient';

const TABLE = 'web_trips';

export type ServerTrip = { stops: PlannedStop[]; home: HomeCity | null };

/**
 * Ensure an anonymous auth session exists; returns the user id, or `null` if
 * Supabase isn't configured or anonymous sign-ins are disabled on the project.
 * All failures are swallowed — the planner then runs localStorage-only.
 */
export async function ensureAnonUser(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) return sessionData.session.user.id;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Fetch the current anon user's stored trip, or `null` if none / unavailable. */
export async function fetchServerTrip(): Promise<ServerTrip | null> {
  if (!supabase) return null;
  try {
    // RLS limits the result to the caller's own row (user_id = auth.uid()).
    const { data, error } = await supabase
      .from(TABLE)
      .select('stops, home')
      .maybeSingle();
    if (error || !data) return null;
    return {
      stops: Array.isArray(data.stops) ? (data.stops as PlannedStop[]) : [],
      home: (data.home as HomeCity | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Upsert the current anon user's trip. No-op if Supabase/session unavailable. */
export async function pushServerTrip(
  stops: PlannedStop[],
  home: HomeCity,
): Promise<void> {
  if (!supabase) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;
    await supabase
      .from(TABLE)
      .upsert(
        { user_id: userId, stops, home, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
  } catch {
    // ignore — localStorage remains the durable local copy
  }
}
