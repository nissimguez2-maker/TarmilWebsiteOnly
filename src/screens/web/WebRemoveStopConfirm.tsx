import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../components/Button';

type Props = {
  open: boolean;
  stopName: string;
  placeCount: number;
  transitCount: number;
  onConfirm: () => void;
  onCancel: () => void;
};

export function WebRemoveStopConfirm({
  open,
  stopName,
  placeCount,
  transitCount,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  const items: string[] = [];
  if (placeCount > 0)
    items.push(`${placeCount} ${placeCount === 1 ? 'saved place' : 'saved places'}`);
  if (transitCount > 0)
    items.push(
      `${transitCount} transit ${transitCount === 1 ? 'booking' : 'bookings'}`,
    );
  const summary = items.join(' and ');

  return (
    <div
      className="fixed inset-0 z-[2000] bg-charcoal/40 flex items-center justify-center p-md"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '380px' }}
        className="bg-cream border border-charcoal-15 rounded-3xl shadow-panel p-md flex flex-col gap-md relative"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute top-sm end-sm h-8 w-8 rounded-full flex items-center justify-center text-charcoal-70 hover:text-charcoal hover:bg-charcoal-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <X size={16} strokeWidth={2} />
        </button>
        <div className="flex flex-col gap-xs pe-12">
          <p className="meta-caps text-amber inline-flex items-center gap-xs">
            <AlertTriangle size={12} strokeWidth={2} />
            Confirm removal
          </p>
          <h2 className="font-serif text-sub text-charcoal leading-tight">
            Remove {stopName}?
          </h2>
          <p className="text-small text-charcoal-70">
            This will also remove {summary}.
          </p>
        </div>
        <div className="flex justify-end gap-sm">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Keep stop
          </Button>
          <Button variant="accent" size="sm" onClick={onConfirm}>
            Remove anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
