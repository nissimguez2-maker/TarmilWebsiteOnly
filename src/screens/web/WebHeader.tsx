import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import type { PlannedStop } from '../../data/plannedStops';
import { formatTripMonthRange } from './dateUtils';

const TRIP_TITLE_REGION = 'Brazil & Argentina';

type Props = {
  stops: PlannedStop[];
};

export function WebHeader({ stops }: Props) {
  const range = stops.length
    ? formatTripMonthRange(
        stops[0].arrivalDate,
        stops[stops.length - 1].departureDate,
      )
    : '';
  return (
    <header className="h-14 shrink-0 bg-cream border-b border-charcoal-15 flex items-center px-md gap-md">
      <span className="font-serif text-lede text-charcoal">Tarmil</span>
      <div className="flex-1 flex flex-col items-center leading-tight">
        <span className="meta-caps text-charcoal-70">Planned trip</span>
        <span className="font-serif text-lede text-charcoal">
          {TRIP_TITLE_REGION}
          {range && <span className="text-charcoal-70"> · {range}</span>}
        </span>
      </div>
      <div className="flex items-center gap-md">
        <button
          type="button"
          onClick={() => window.alert('Share link copied (mock)')}
          className="inline-flex items-center gap-xs text-small text-charcoal-70 hover:text-charcoal transition-colors duration-instant ease-out-quart motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          <Share2 size={14} strokeWidth={2} />
          Share
        </button>
        <Link
          to="/trip"
          className="text-small text-umber hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
        >
          Switch to App
        </Link>
        <div className="flex items-center gap-xs">
          <span className="text-small text-charcoal-70">Yotam</span>
          <span
            aria-hidden="true"
            className="h-8 w-8 rounded-full bg-charcoal text-cream font-serif text-small flex items-center justify-center"
          >
            Y
          </span>
        </div>
      </div>
    </header>
  );
}
