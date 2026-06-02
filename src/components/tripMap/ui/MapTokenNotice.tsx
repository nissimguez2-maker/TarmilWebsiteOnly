import { MapPin } from 'lucide-react';

/**
 * Shown in place of the map when VITE_MAPBOX_TOKEN is unset. Mapbox GL hard-
 * requires a token to initialise, so rather than crash we explain the one
 * step needed to light up the Apple-style map.
 */
export function MapTokenNotice() {
  return (
    <div className="tarmil-map flex h-full w-full items-center justify-center bg-cream">
      <div className="mx-lg flex max-w-xs flex-col items-center gap-sm text-center">
        <MapPin
          className="h-8 w-8 text-charcoal-30"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="font-serif text-lede text-charcoal">
          Map needs a Mapbox token
        </p>
        <p className="text-small text-charcoal-55">
          Set <code className="text-charcoal-70">VITE_MAPBOX_TOKEN</code> in your
          environment to load the Apple-style map.
        </p>
      </div>
    </div>
  );
}
