import type { ReactNode } from 'react';

/**
 * A small tinted, rounded-square frame around a category icon — the "graphics"
 * layer that turns a bare glyph into a scannable, colour-coded token. Always
 * paired with a real text label, so it is decorative and carries aria-hidden.
 * Tints use the brand accent tokens at low alpha (never raw hex).
 */
export type IconChipTone = 'amber' | 'olive' | 'umber' | 'neutral';

const TONE: Record<IconChipTone, string> = {
  amber: 'bg-amber/10 text-amber',
  olive: 'bg-olive/10 text-olive',
  umber: 'bg-umber/10 text-umber',
  neutral: 'bg-charcoal-8 text-charcoal-70',
};

export function IconChip({
  tone = 'neutral',
  children,
}: {
  tone?: IconChipTone;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}
