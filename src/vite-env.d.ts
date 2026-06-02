/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Mapbox GL access token — powers the planner map. Optional: without it the
   * map shows a graceful "needs a token" placeholder instead of crashing.
   */
  readonly VITE_MAPBOX_TOKEN?: string;
  /**
   * Optional Groq API key — rewrites auto-pulled Wikipedia city intros into
   * warmer copy. Without it, intros fall back to raw Wikipedia text.
   */
  readonly VITE_GROQ_API_KEY?: string;
  /** Supabase project URL — enables anonymous server-side trip storage. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon / publishable key (public, RLS-protected). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
