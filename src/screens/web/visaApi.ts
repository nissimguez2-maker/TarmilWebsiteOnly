import { VISA_MATRIX } from '../../data/visaMatrix';

/**
 * Human visa/entry status for a `passport` (ISO-2 home country) entering `dest`
 * (ISO-2), from the bundled open passport-index snapshot (MIT). Guidance-grade
 * ONLY: always shown with a "verify with the official source" disclaimer, and
 * the concierge may relay it but never as authoritative (Moffatt v. Air Canada).
 * Returns null when the passport or destination isn't in the dataset.
 */
export function visaFor(passport?: string, dest?: string): string | null {
  if (!passport || !dest) return null;
  const cell = VISA_MATRIX[passport.toUpperCase()]?.[dest.toUpperCase()];
  if (!cell || !cell.status) return null;
  return visaLabel(cell.status, cell.days);
}

function visaLabel(status: string, days?: number): string {
  const s = status.toLowerCase();
  const d = days != null ? ` (${days} days)` : '';
  if (s.includes('visa free')) return `visa-free${d}`;
  if (s.includes('on arrival')) return `visa on arrival${d}`;
  if (s.includes('e-visa') || s.includes('evisa')) return `e-visa${d}`;
  if (s === 'eta') return `ETA — electronic travel authorization${d}`;
  if (s.includes('no admission')) return 'entry not currently permitted';
  if (s.includes('visa required') || s === 'visa') return 'visa required in advance';
  if (/^\d+$/.test(status)) return `visa-free (${status} days)`;
  return status;
}
