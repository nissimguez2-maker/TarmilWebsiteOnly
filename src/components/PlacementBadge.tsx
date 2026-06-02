import clsx from 'clsx';
import type { PlacementTier } from '../data/places';

type Props = {
  tier?: PlacementTier;
  className?: string;
};

/**
 * Discloses a merchant's paid placement at the point of decision (Business &
 * Legal Strategy §6.1). "Tarmil Selection" is the earned premium tier (amber
 * warmth); "Sponsored" is plain paid placement, kept deliberately quiet but
 * legible. Renders nothing for non-paying public coverage.
 */
export function PlacementBadge({ tier, className }: Props) {
  if (!tier) return null;
  return (
    <span
      className={clsx(
        'meta-caps shrink-0',
        tier === 'selection' ? 'text-amber' : 'text-charcoal-55',
        className,
      )}
    >
      {tier === 'selection' ? 'Tarmil Selection' : 'Sponsored'}
    </span>
  );
}
