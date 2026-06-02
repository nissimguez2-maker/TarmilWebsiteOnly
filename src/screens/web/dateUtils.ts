function parseIsoNoon(iso: string): Date {
  return new Date(iso + 'T12:00:00');
}

export function formatShortDate(iso: string): string {
  return parseIsoNoon(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatLongDate(iso: string): string {
  return parseIsoNoon(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatStopRange(arrivalIso: string, departureIso: string): string {
  return `${formatShortDate(arrivalIso)} – ${formatShortDate(departureIso)}`;
}

export function formatTripMonthRange(
  firstArrivalIso: string,
  lastDepartureIso: string,
): string {
  const first = parseIsoNoon(firstArrivalIso);
  const last = parseIsoNoon(lastDepartureIso);
  const m = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short' });
  const firstM = m(first);
  const lastM = m(last);
  const monthSpan = firstM === lastM ? firstM : `${firstM}–${lastM}`;
  return `${monthSpan} ${last.getFullYear()}`;
}
