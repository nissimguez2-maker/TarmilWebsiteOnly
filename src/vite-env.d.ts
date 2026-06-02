/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Mapbox GL access token — powers the planner map. Optional: without it the
   * map shows a graceful "needs a token" placeholder instead of crashing.
   */
  readonly VITE_MAPBOX_TOKEN?: string;
  // Note: the Groq key is NO LONGER a client env var. AI runs server-side via
  // the `ai-proxy` Edge Function (Supabase secret `GROQ_API_KEY`), so the key is
  // never shipped to the browser. See src/screens/web/groqApi.ts.
  /** Supabase project URL — enables anonymous server-side trip storage + AI proxy. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon / publishable key (public, RLS-protected). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
