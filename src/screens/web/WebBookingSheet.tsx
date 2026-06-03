import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronRight, X } from 'lucide-react';
import { Button } from '../../components/Button';
import { OperatorMark } from '../../components/OperatorMark';
import {
  STAY_PARTNERS,
  TRANSPORT_PARTNERS,
  type BookingPartner,
} from '../../data/bookingPartners';
import type { PlannedStop } from '../../data/plannedStops';
import type { TransportOffer } from '../../data/mockTransport';
import { formatStopRange } from './dateUtils';
import {
  addTransit,
  findTransit,
  isStaySorted,
  removeTransit,
  setStaySorted,
  useWishlist,
} from './wishlist';
import { showToast } from './WebToast';
import { buildStayLink, buildTransportLink } from './bookingLink';
import { track } from './track';

/**
 * Two-step booking sheet. The browsing card shows the option; this sheet —
 * opened only when the user taps in (intent) — carries the detail and the
 * 3rd-party handoff. Partners are a calm, disclosed choice, never a push.
 *
 * Imperative singleton, mirroring `showToast` / `openLightbox`: call
 * `openBookingSheet(target)` from anywhere; `<WebBookingSheet/>` is mounted
 * once at the planner root.
 */

export type BookingTarget =
  | { kind: 'stay'; stop: PlannedStop }
  | {
      kind: 'transport';
      offer: TransportOffer;
      fromStop: PlannedStop;
      toStop: PlannedStop;
    };

let current: BookingTarget | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function openBookingSheet(target: BookingTarget): void {
  current = target;
  emit();
}

export function closeBookingSheet(): void {
  current = null;
  emit();
}

export function WebBookingSheet() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Consume Escape so the planner's global handler doesn't also close the
      // city panel underneath — just dismiss the sheet. Document phase fires
      // before the window-level handler, so stopPropagation reaches it.
      if (e.key === 'Escape' && current) {
        e.stopPropagation();
        closeBookingSheet();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const isOpen = current !== null;

  // Modal focus management: focus into the sheet on open, trap Tab within it,
  // and restore focus to whatever opened it on close.
  useEffect(() => {
    if (!isOpen) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onTab);
    return () => {
      document.removeEventListener('keydown', onTab);
      openerRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-charcoal/40 flex items-center justify-center p-md"
      onClick={closeBookingSheet}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-sheet-title"
        style={{ width: 'min(400px, 100%)', maxHeight: '100%' }}
        className="bg-cream border border-charcoal-15 rounded-3xl shadow-panel flex flex-col overflow-hidden relative"
      >
        <button
          type="button"
          onClick={closeBookingSheet}
          aria-label="Close"
          className="absolute top-sm end-sm h-8 w-8 rounded-full flex items-center justify-center text-charcoal-70 hover:text-charcoal hover:bg-charcoal-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream z-10"
        >
          <X size={16} strokeWidth={2} />
        </button>
        {current.kind === 'stay' ? (
          <StayBody stop={current.stop} />
        ) : (
          <TransportBody
            offer={current.offer}
            fromStop={current.fromStop}
            toStop={current.toStop}
          />
        )}
      </div>
    </div>
  );
}

function StayBody({ stop }: { stop: PlannedStop }) {
  useWishlist();
  const sorted = isStaySorted(stop.id);
  // Funnel: the sheet reaching open is real accommodation intent.
  useEffect(() => {
    track('booking_sheet_open', { kind: 'stay', stopId: stop.id, nights: stop.nights });
  }, [stop.id, stop.nights]);
  const onToggleSorted = () => {
    const next = !sorted;
    setStaySorted(stop.id, next);
    showToast(
      next ? `${stop.nameEn} stay marked sorted` : `${stop.nameEn} stay unmarked`,
    );
  };
  return (
    <div className="flex flex-col min-h-0">
      <header className="shrink-0 px-md pt-md pb-sm flex flex-col gap-xs pe-12">
        <p id="booking-sheet-title" className="meta-caps text-charcoal-70">
          Where you're staying
        </p>
        <h2 className="font-serif text-sub text-charcoal leading-tight">
          {stop.nameEn}
        </h2>
        <p className="text-small text-charcoal-70">
          {formatStopRange(stop.arrivalDate, stop.departureDate)} ·{' '}
          {stop.nights} {stop.nights === 1 ? 'night' : 'nights'}
        </p>
      </header>
      <div className="flex-1 overflow-y-auto px-md pb-md flex flex-col gap-sm">
        <p className="text-small text-charcoal-70">
          Find a place to stay for your dates.
        </p>
        {STAY_PARTNERS.map((p) => (
          <PartnerRow
            key={p.id}
            partner={p}
            href={buildStayLink(p, stop)}
            eventProps={{ partnerId: p.id, slot: 'stay-strip', kind: 'stay', stopId: stop.id, nights: stop.nights }}
          />
        ))}
        {/* User-asserted "sorted" — so the readiness ledger ticks honestly whether
            they booked here or already had it. Mirrors transport's "add to trip". */}
        <Button
          variant={sorted ? 'primary' : 'ghost'}
          fullWidth
          onClick={onToggleSorted}
        >
          {sorted ? (
            <>
              <Check size={14} strokeWidth={2} />
              Stay sorted for {stop.nameEn}
            </>
          ) : (
            'I’ve sorted this stay'
          )}
        </Button>
        <Disclosure />
      </div>
    </div>
  );
}

function TransportBody({
  offer,
  fromStop,
  toStop,
}: {
  offer: TransportOffer;
  fromStop: PlannedStop;
  toStop: PlannedStop;
}) {
  useWishlist();
  const added = !!findTransit(fromStop.id, toStop.id, offer.id);
  const isDrive = offer.mode === 'drive';
  useEffect(() => {
    track('booking_sheet_open', { kind: 'transport', fromStopId: fromStop.id, toStopId: toStop.id });
  }, [fromStop.id, toStop.id]);

  const onToggle = () => {
    if (added) {
      removeTransit(fromStop.id, toStop.id, offer.id);
      showToast(`${offer.provider} removed from trip`);
    } else {
      addTransit({ fromStopId: fromStop.id, toStopId: toStop.id, offer });
      showToast(`${offer.provider} added to your trip`);
    }
  };

  return (
    <div className="flex flex-col min-h-0">
      <header className="shrink-0 px-md pt-md pb-sm flex flex-col gap-sm pe-12">
        <p id="booking-sheet-title" className="meta-caps text-charcoal-70">
          Getting there
        </p>
        <div className="flex items-center gap-xs font-serif text-sub text-charcoal leading-tight">
          <span>{fromStop.nameEn}</span>
          <ArrowRight size={16} strokeWidth={2} className="text-charcoal-70" />
          <span>{toStop.nameEn}</span>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-md pb-md flex flex-col gap-md">
        <div className="flex items-center gap-sm rounded-2xl bg-sand border border-charcoal-15 p-sm">
          <OperatorMark size="md" provider={offer.provider} mode={offer.mode} />
          <div className="flex-1 min-w-0">
            <p className="font-sans font-semibold text-body text-charcoal truncate">
              {offer.provider}
            </p>
            {!isDrive ? (
              <p className="text-small text-charcoal-70 flex flex-wrap items-center gap-x-xs">
                <span className="tnum">{offer.departureTime}</span>
                <ArrowRight size={11} strokeWidth={2} />
                <span className="tnum">{offer.arrivalTime}</span>
                <span className="text-charcoal-55 whitespace-nowrap">
                  · {offer.durationLabel} ·{' '}
                  {offer.stops === 0
                    ? 'Direct'
                    : `${offer.stops} ${offer.stops === 1 ? 'stop' : 'stops'}`}
                </span>
              </p>
            ) : (
              <p className="text-small text-charcoal-70">
                {offer.durationLabel}
              </p>
            )}
          </div>
          <p className="font-serif text-lede text-amber whitespace-nowrap">
            {offer.currency} {offer.price}
          </p>
        </div>

        <Button variant="primary" fullWidth onClick={onToggle}>
          {added ? (
            <>
              <Check size={14} strokeWidth={2} />
              Added to your trip
            </>
          ) : (
            'Add to my trip'
          )}
        </Button>

        <div className="flex flex-col gap-sm">
          <p className="meta-caps text-charcoal-70">Book with</p>
          {!isDrive && (
            <PartnerRow
              partner={{
                id: 'direct',
                name: `${offer.provider} direct`,
                hex: '#1F1F1C', // mirrors the --charcoal token (no Tailwind class available for this data field)
                logoPath: null,
                deeplinkTemplate: '',
              }}
              operatorProvider={offer.provider}
              operatorMode={offer.mode}
            />
          )}
          {TRANSPORT_PARTNERS.map((p) => (
            <PartnerRow
              key={p.id}
              partner={p}
              href={buildTransportLink(p, fromStop, toStop, fromStop.departureDate)}
              eventProps={{ partnerId: p.id, slot: 'transport', kind: 'transport', fromStopId: fromStop.id, toStopId: toStop.id }}
            />
          ))}
        </div>
        <Disclosure />
      </div>
    </div>
  );
}

/**
 * A calm full-width partner row — logo, name, chevron. A tap fires the
 * `book_handoff` event and opens the real marked, pre-filled deeplink in a new
 * tab. Partners with no template ("book direct") fall back to a calm toast.
 */
function PartnerRow({
  partner,
  href,
  eventProps,
  operatorProvider,
  operatorMode,
}: {
  partner: BookingPartner;
  href?: string | null;
  eventProps?: Record<string, unknown>;
  operatorProvider?: string;
  operatorMode?: TransportOffer['mode'];
}) {
  const onClick = () => {
    if (href) {
      // The conversion event — fired before navigating away.
      track('book_handoff', eventProps);
      window.open(href, '_blank', 'noopener');
    } else {
      showToast(`Booking ${partner.name} opens at launch`);
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-sm rounded-2xl border border-charcoal-15 bg-cream ps-sm pe-md py-sm shadow-card transition-[border-color,box-shadow,transform] duration-instant ease-out-quart motion-reduce:transition-none hover:border-charcoal-30 hover:shadow-panel hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      {operatorProvider ? (
        <OperatorMark
          size="sm"
          provider={operatorProvider}
          mode={operatorMode ?? 'flight'}
        />
      ) : (
        <PartnerLogo partner={partner} />
      )}
      <span className="flex-1 min-w-0 text-start">
        <span className="block font-sans font-medium text-body text-charcoal truncate">
          {partner.name}
        </span>
        <span className="block text-meta uppercase text-charcoal-55">
          Book on this site
        </span>
      </span>
      <ChevronRight
        size={16}
        strokeWidth={2}
        className="shrink-0 text-charcoal-55 group-hover:text-charcoal-70"
      />
    </button>
  );
}

function PartnerLogo({ partner }: { partner: BookingPartner }) {
  return (
    <span
      className="shrink-0 inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-cream border border-charcoal-15"
      aria-hidden
    >
      {partner.logoPath ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path d={partner.logoPath} fill={partner.hex} />
        </svg>
      ) : (
        <span
          className="font-serif font-bold text-small leading-none"
          style={{ color: partner.hex }}
        >
          {partner.name.charAt(0)}
        </span>
      )}
    </span>
  );
}

function Disclosure() {
  return (
    <p className="text-meta text-charcoal-55 leading-relaxed pt-xs">
      Partner links. We may earn a commission — your price is unchanged, and
      non-partners are always shown.
    </p>
  );
}
