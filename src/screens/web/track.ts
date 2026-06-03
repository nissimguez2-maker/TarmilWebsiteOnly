/**
 * Lightweight funnel-event hook. Today it is a SAFE no-op sink: it buffers events
 * in memory and (in dev) logs them, so the funnel is instrumented from day one
 * without any tracking firing. Phase 1.5 wires `flush` to a consented, capped
 * server event endpoint — behind the EU/IL consent gate — so no affiliate/usage
 * event leaves the browser before consent.
 *
 * Funnel points (doorway → planner → finalize → booking) call `track()` now;
 * activating the sink later is a one-place change here, not a re-instrumentation.
 */

export type TrackEvent = {
  name: string;
  props?: Record<string, unknown>;
  at: number;
};

const buffer: TrackEvent[] = [];

export function track(name: string, props?: Record<string, unknown>): void {
  buffer.push({ name, props, at: Date.now() });
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[track]', name, props ?? {});
  }
}

/** Drain buffered events (Phase 1.5: POST to the consented event endpoint). */
export function drainEvents(): TrackEvent[] {
  return buffer.splice(0);
}
