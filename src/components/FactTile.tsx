import type { ReactNode } from 'react';

/**
 * One sub-boxed fact inside a card: an icon-chip + caps label on top, then an
 * emphasized value block. Sits on `cream` inside a `paper` card so the inset
 * step (~1.15:1) reads as a real, perceptible sub-box — the thing the flat
 * "blobs of text" were missing. Callers render nothing when there's no data, so
 * a tile is never empty.
 */
export function FactTile({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-xs rounded-xl bg-cream p-sm ring-1 ring-charcoal-15">
      <div className="flex items-center gap-xs">
        {icon}
        <span className="meta-caps text-charcoal-55">{label}</span>
      </div>
      <div className="flex flex-col gap-xs text-body leading-snug text-charcoal">
        {children}
      </div>
    </div>
  );
}
