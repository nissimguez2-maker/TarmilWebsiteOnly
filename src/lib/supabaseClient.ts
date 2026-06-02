import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client — or `null` when the env vars are absent.
 *
 * The website phase uses Supabase only for **anonymous, per-device trip
 * storage** (table `web_trips`, RLS-scoped to the anon auth user). When the env
 * vars aren't set — or anonymous sign-ins are disabled on the project — the app
 * runs in localStorage-only mode, so every call site must tolerate a null
 * client / failed sign-in.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null;
