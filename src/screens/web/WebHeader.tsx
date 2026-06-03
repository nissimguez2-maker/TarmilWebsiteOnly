import { Link } from 'react-router-dom';
import type { PlannedStop } from '../../data/plannedStops';
import { formatTripMonthRange } from './dateUtils';

type Props = {
  stops: PlannedStop[];
};

/**
 * Presentational header: the brand mark plus an honest, derived trip summary.
 * No fabricated user, no mock Share, no dead app link — the planner is the
 * whole site, and trips are anonymous this phase.
 */
export function WebHeader({ stops }: Props) {
  const hasTrip = stops.length > 0;
  const range = hasTrip
    ? formatTripMonthRange(
        stops[0].arrivalDate,
        stops[stops.length - 1].departureDate,
      )
    : '';
  const route =
    stops.length > 1
      ? `${stops[0].nameEn} → ${stops[stops.length - 1].nameEn}`
      : hasTrip
        ? stops[0].nameEn
        : '';
  return (
    <header className="h-14 shrink-0 bg-cream border-b border-charcoal-15 flex items-center px-md gap-md">
      <span className="flex-1 font-serif text-lede text-charcoal">Tarmil</span>
      <div className="min-w-0 flex flex-col items-center leading-tight">
        {hasTrip ? (
          <>
            <span className="meta-caps text-charcoal-70">Planned trip</span>
            <span className="max-w-full truncate font-serif text-lede text-charcoal">
              {route}
              {range && <span className="text-charcoal-70"> · {range}</span>}
            </span>
          </>
        ) : (
          <span className="meta-caps text-charcoal-70">Trip planner</span>
        )}
      </div>
      <div className="flex flex-1 justify-end">
        <Link
          to="/info"
          className="rounded-full px-sm py-xs text-meta uppercase tracking-wide text-charcoal-55 transition-colors duration-fast ease-out-quart motion-reduce:transition-none hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Sources &amp; terms
        </Link>
      </div>
    </header>
  );
}
