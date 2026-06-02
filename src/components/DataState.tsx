import { RotateCw } from 'lucide-react';
import { Screen } from './Screen';

/**
 * Loading and error placeholders shared across every screen that pulls
 * from SupabaseDataProvider. Centred on the device frame, ivory on ivory,
 * with motion that respects prefers-reduced-motion via the global
 * @media block in index.css.
 *
 * The DA brand pass hasn't speced loading / error vocabulary yet — these
 * are the working defaults.
 */

export function LoadingPanel() {
  return (
    <Screen>
      <div
        role="status"
        aria-live="polite"
        className="flex h-full flex-col items-center justify-center gap-md p-md"
      >
        <span className="flex h-10 w-10 items-center justify-center">
          <span
            aria-hidden
            className="h-2 w-2 animate-ping rounded-full bg-amber"
          />
        </span>
        <span className="meta-caps text-charcoal-55">Loading</span>
      </div>
    </Screen>
  );
}

export function ErrorPanel({ error }: { error: Error | null }) {
  return (
    <Screen>
      <div
        role="alert"
        className="flex h-full flex-col items-center justify-center gap-md p-md text-center"
      >
        <p className="font-serif text-sub leading-tight text-charcoal">
          We couldn't connect.
        </p>
        {error?.message && (
          <p className="max-w-body text-small leading-snug text-charcoal-55">
            {error.message}
          </p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="meta-caps inline-flex items-center gap-2 rounded-full px-md py-2 text-amber transition-colors duration-instant ease-out-quart hover:text-amber-85 active:text-amber-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <RotateCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Try again
        </button>
      </div>
    </Screen>
  );
}
