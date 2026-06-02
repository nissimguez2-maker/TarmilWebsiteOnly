import { VISA_FROM_ISRAEL } from '../../data/visaFromIsrael';

/**
 * Human visa/entry status for an ISRAELI passport entering `destCode` (ISO-2),
 * from the bundled open passport-index snapshot (MIT). Guidance-grade ONLY:
 * always shown with a "verify with the official source" disclaimer, and the
 * concierge may relay it but never as authoritative (Moffatt v. Air Canada).
 * Returns null when the destination isn't in the dataset.
 */
export function visaFromIsrael(destCode?: string): string | null {
  if (!destCode) return null;
  const cell = VISA_FROM_ISRAEL[destCode.toUpperCase()];
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
