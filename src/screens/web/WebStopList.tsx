import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { CSS } from '@dnd-kit/utilities';
import {
  Bed,
  Bus,
  Car,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Coffee,
  GripVertical,
  Home,
  Landmark,
  MapPin,
  Maximize2,
  Music,
  Pencil,
  Plane,
  Plus,
  Ship,
  Sparkles,
  Train,
  Trash2,
  Utensils,
  UtensilsCrossed,
  Waves,
  Wine,
  X,
} from 'lucide-react';
import { Button } from '../../components/Button';
import type { PlannedStop } from '../../data/plannedStops';
import type { HomeCity } from './homeCity';
import { generateLeg } from './transportGenerator';
import { fetchDrivingMinutes, formatDriveDuration } from './osrmApi';
import { formatShortDate, formatStopRange } from './dateUtils';
import { cityPhotos } from './cityPhotos';
import {
  placesForStop,
  removePlace,
  removeTransit,
  transitForLeg,
  useWishlist,
  type PlaceItem,
  type TransitItem,
} from './wishlist';
import { showToast } from './WebToast';
import { WebRemoveStopConfirm } from './WebRemoveStopConfirm';
import { WebItineraryOverlay } from './WebItineraryOverlay';
import type { Selection } from './types';

type Props = {
  stops: PlannedStop[];
  home: HomeCity;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onAddStop: () => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onRemoveStop: (id: string) => void;
  onEditDates: (id: string, arrivalIso: string, departureIso: string) => void;
  onEditHome: () => void;
};

export function WebStopList({
  stops,
  home,
  selection,
  onSelect,
  onAddStop,
  onReorder,
  onRemoveStop,
  onEditDates,
  onEditHome,
}: Props) {
  useWishlist();
  const [detailOpen, setDetailOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());
  const prevCounts = useRef<Record<string, number>>({});

  useEffect(() => {
    setExpandedStops((prev) => {
      let next = prev;
      let changed = false;
      for (const stop of stops) {
        const count = placesForStop(stop.id).length;
        const prevCount = prevCounts.current[stop.id] ?? 0;
        if (count > prevCount && !prev.has(stop.id)) {
          if (!changed) {
            next = new Set(prev);
            changed = true;
          }
          next.add(stop.id);
        }
        prevCounts.current[stop.id] = count;
      }
      return changed ? next : prev;
    });
  });

  const toggleExpand = (id: string) => {
    setExpandedStops((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [pendingRemove, setPendingRemove] = useState<{
    stopId: string;
    placeCount: number;
    transitCount: number;
  } | null>(null);

  const requestRemoveStop = (stopId: string) => {
    const places = placesForStop(stopId).length;
    const transit = stops.length
      ? stops.reduce((sum, s) => {
          if (s.id === stopId) return sum;
          return (
            sum +
            transitForLeg(stopId, s.id).length +
            transitForLeg(s.id, stopId).length
          );
        }, 0)
      : 0;
    if (places === 0 && transit === 0) {
      onRemoveStop(stopId);
      showToast('Stop removed');
      return;
    }
    setPendingRemove({ stopId, placeCount: places, transitCount: transit });
  };

  const confirmRemove = () => {
    if (!pendingRemove) return;
    onRemoveStop(pendingRemove.stopId);
    showToast('Stop and its saved items removed');
    setPendingRemove(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = stops.findIndex((s) => s.id === active.id);
    const toIdx = stops.findIndex((s) => s.id === over.id);
    if (fromIdx === -1 || toIdx === -1) return;
    onReorder(fromIdx, toIdx);
    showToast('Trip reordered');
  };

  const homeStop = homeAsStop(home, stops[0]?.arrivalDate ?? '2026-01-01');
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];
  const isDepartureSelected =
    !!firstStop &&
    selection.type === 'leg' &&
    selection.fromStopId === 'home' &&
    selection.toStopId === firstStop.id;
  const isReturnSelected =
    !!lastStop &&
    selection.type === 'leg' &&
    selection.fromStopId === lastStop.id &&
    selection.toStopId === 'home';

  return (
    <aside className="w-96 shrink-0 border-e border-charcoal-15 bg-cream overflow-y-auto min-h-0 py-md flex flex-col gap-md">
      <TripOverviewCard stops={stops} home={home} />
      <div>
        <div className="flex items-center justify-between px-md mb-md">
          <p className="meta-caps text-charcoal-70">Itinerary</p>
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="inline-flex items-center gap-1 rounded-full bg-charcoal-8 px-sm py-1 text-meta uppercase tracking-wide text-charcoal-70 transition-colors duration-instant ease-out-quart motion-reduce:transition-none hover:bg-charcoal-15 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <Maximize2 size={11} strokeWidth={2} aria-hidden />
            Full view
          </button>
        </div>
        <div className="flex flex-col px-md">
          <HomeRow
            home={home}
            variant="departure"
            hasNext={stops.length > 0}
            onEdit={onEditHome}
          />
          {firstStop && (
            <LegRow
              from={homeStop}
              to={firstStop}
              selected={isDepartureSelected}
              onClick={() =>
                onSelect({
                  type: 'leg',
                  fromStopId: 'home',
                  toStopId: firstStop.id,
                })
              }
            />
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[]}
          >
            <SortableContext
              items={stops.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <ol className="flex flex-col gap-xs">
              {stops.map((stop, i) => {
                const next = stops[i + 1];
                const isStopSelected =
                  selection.type === 'stop' && selection.stopId === stop.id;
                const isLegSelected =
                  !!next &&
                  selection.type === 'leg' &&
                  selection.fromStopId === stop.id &&
                  selection.toStopId === next.id;
                return (
                  <li key={stop.id} className="flex flex-col">
                    <SortableStopRow
                      stop={stop}
                      index={i + 1}
                      hasNext={!!next || stops.length > 0}
                      selected={isStopSelected}
                      canRemove={stops.length > 1}
                      expanded={expandedStops.has(stop.id)}
                      onToggleExpand={() => toggleExpand(stop.id)}
                      onClick={() =>
                        onSelect({ type: 'stop', stopId: stop.id })
                      }
                      onRemove={() => requestRemoveStop(stop.id)}
                      onEditDates={(a, d) => {
                        onEditDates(stop.id, a, d);
                        showToast('Dates updated');
                      }}
                    />
                    {next && (
                      <LegRow
                        from={stop}
                        to={next}
                        selected={isLegSelected}
                        onClick={() =>
                          onSelect({
                            type: 'leg',
                            fromStopId: stop.id,
                            toStopId: next.id,
                          })
                        }
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </SortableContext>
        </DndContext>
          {lastStop && (
            <LegRow
              from={lastStop}
              to={homeStop}
              selected={isReturnSelected}
              onClick={() =>
                onSelect({
                  type: 'leg',
                  fromStopId: lastStop.id,
                  toStopId: 'home',
                })
              }
            />
          )}
          <HomeRow
            home={home}
            variant="return"
            hasNext={false}
            onEdit={onEditHome}
          />
        </div>
      </div>
      <div className="px-md mx-md pt-md border-t border-charcoal-08">
        <Button variant="ghost" size="sm" fullWidth onClick={onAddStop}>
          <Plus size={14} strokeWidth={2} />
          Add stop
        </Button>
      </div>
      <WebRemoveStopConfirm
        open={!!pendingRemove}
        stopName={
          pendingRemove
            ? stops.find((s) => s.id === pendingRemove.stopId)?.nameEn ?? 'this stop'
            : ''
        }
        placeCount={pendingRemove?.placeCount ?? 0}
        transitCount={pendingRemove?.transitCount ?? 0}
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
      <WebItineraryOverlay
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        stops={stops}
        home={home}
      />
    </aside>
  );
}

function homeAsStop(home: HomeCity, dateIso: string): PlannedStop {
  return {
    id: 'home',
    nameEn: home.nameEn,
    nameHe: home.nameEn,
    type: 'city',
    lat: home.lat,
    lng: home.lng,
    arrivalDate: dateIso,
    departureDate: dateIso,
    nights: 0,
    privacy: 'private',
  };
}

function HomeRow({
  home,
  variant,
  hasNext,
  onEdit,
}: {
  home: HomeCity;
  variant: 'departure' | 'return';
  hasNext: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="group flex gap-sm w-full">
      <div className="shrink-0 w-8 flex flex-col items-center">
        <span
          aria-hidden="true"
          className="h-8 w-8 rounded-full bg-charcoal text-cream flex items-center justify-center shrink-0"
        >
          <Home size={14} strokeWidth={2} />
        </span>
        {hasNext && (
          <div className="w-px flex-1 border-s border-dashed border-charcoal-15 mt-xs" />
        )}
      </div>
      <div className="flex-1 min-w-0 rounded-2xl px-md py-sm group-hover:bg-charcoal-8 transition-[background-color] duration-instant ease-out-quart motion-reduce:transition-none">
        <div className="flex items-start gap-sm">
          <div className="flex-1 min-w-0">
            <p className="meta-caps text-charcoal-70">
              {variant === 'departure' ? 'Departure' : 'Return'}
            </p>
            <h3 className="font-serif text-lede text-charcoal leading-tight truncate">
              {home.nameEn}
            </h3>
          </div>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Change home"
            title="Change home"
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-instant ease-out-quart h-6 w-6 rounded-full flex items-center justify-center text-charcoal-70 hover:text-amber hover:bg-charcoal-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <Pencil size={12} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TripOverviewCard({
  stops,
  home,
}: {
  stops: PlannedStop[];
  home: HomeCity;
}) {
  const legs = stops.length > 0 ? stops.length - 1 : 0;
  const nights = stops.reduce((sum, s) => sum + s.nights, 0);
  const first = stops[0];
  const last = stops[stops.length - 1];
  const dateSpan =
    first && last
      ? `${formatShortDate(first.arrivalDate)} – ${formatShortDate(last.departureDate)}`
      : '';
  const year = last
    ? new Date(last.departureDate + 'T12:00:00').getFullYear()
    : '';

  return (
    <article className="mx-md bg-sand border border-charcoal-15 rounded-2xl p-md flex flex-col gap-sm">
      <p className="meta-caps text-charcoal-70">Trip overview</p>
      <h2 className="font-serif text-lede text-charcoal">
        {dateSpan}
        {year && <span className="text-charcoal-70">, {year}</span>}
      </h2>
      <p className="text-small text-charcoal-70">
        From {home.nameEn} → back to {home.nameEn}
      </p>
      <dl className="grid grid-cols-3 gap-sm pt-sm border-t border-charcoal-15">
        <Stat label="Stops" value={stops.length} />
        <Stat label="Legs" value={legs} />
        <Stat label="Nights" value={nights} />
      </dl>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-xs">
      <dd className="font-serif text-sub text-charcoal tnum leading-none">
        {value}
      </dd>
      <dt className="text-small text-charcoal-70">{label}</dt>
    </div>
  );
}

type SortableStopRowProps = {
  stop: PlannedStop;
  index: number;
  hasNext: boolean;
  selected: boolean;
  canRemove: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onClick: () => void;
  onRemove: () => void;
  onEditDates: (arrivalIso: string, departureIso: string) => void;
};

function SortableStopRow(props: SortableStopRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'relative',
        isDragging && 'z-10 opacity-90 shadow-card rounded-2xl bg-cream',
      )}
    >
      <StopRow
        {...props}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

/** City photo thumbnail for a timeline stop. Real photo in prod; warm
    gradient fallback when the image is unavailable. */
function StopThumb({ stopId }: { stopId: string }) {
  const [ok, setOk] = useState(true);
  const photo = cityPhotos(stopId)[0];
  return (
    <span className="shrink-0 h-11 w-11 overflow-hidden rounded-xl bg-gradient-to-br from-clay to-sand ring-1 ring-charcoal-08">
      {photo && ok && (
        <img
          src={photo}
          alt=""
          loading="lazy"
          onError={() => setOk(false)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}

type StopRowProps = SortableStopRowProps & {
  dragAttributes: React.HTMLAttributes<HTMLButtonElement>;
  dragListeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
};

function StopRow({
  stop,
  index,
  hasNext,
  selected,
  canRemove,
  expanded,
  onToggleExpand,
  onClick,
  onRemove,
  onEditDates,
  dragAttributes,
  dragListeners,
  isDragging,
}: StopRowProps) {
  const [editing, setEditing] = useState(false);
  const savedItems = placesForStop(stop.id);
  const savedCount = savedItems.length;

  return (
    <div className="group flex gap-sm w-full text-start rounded-2xl">
      <div className="shrink-0 w-8 flex flex-col items-center">
        <button
          type="button"
          {...dragAttributes}
          {...dragListeners}
          aria-label={`Drag ${stop.nameEn}`}
          className={clsx(
            'h-8 w-8 rounded-full bg-amber text-cream font-serif text-body flex items-center justify-center shrink-0 relative',
            'cursor-grab active:cursor-grabbing touch-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
          )}
        >
          <span className="group-hover:opacity-0 transition-opacity duration-instant ease-out-quart">
            {index}
          </span>
          <GripVertical
            size={14}
            strokeWidth={2}
            className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-instant ease-out-quart pointer-events-none"
          />
        </button>
        {hasNext && (
          <div className="w-px flex-1 border-s border-dashed border-charcoal-15 mt-xs" />
        )}
      </div>
      <div
        className={clsx(
          'flex-1 min-w-0 rounded-2xl border px-md py-sm transition-[background-color,border-color] duration-instant ease-out-quart motion-reduce:transition-none',
          selected
            ? 'border-amber bg-sand'
            : 'border-charcoal-15 bg-sand/70 group-hover:border-charcoal-30 group-hover:bg-sand',
        )}
      >
        <div className="flex items-start gap-sm">
          <StopThumb stopId={stop.id} />
          <button
            type="button"
            onClick={onClick}
            className="flex-1 min-w-0 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-sm"
            disabled={isDragging}
          >
            <h3 className="font-serif text-lede text-charcoal leading-tight">
              {stop.nameEn}
            </h3>
            {!editing && (
              <div className="flex items-center gap-sm mt-xs flex-wrap">
                <p className="text-small text-charcoal-70 tnum">
                  {formatStopRange(stop.arrivalDate, stop.departureDate)}
                  <span className="text-charcoal-30"> · </span>
                  {stop.nights} {stop.nights === 1 ? 'night' : 'nights'}
                </p>
                {savedCount > 0 && (
                  <span
                    key={savedCount}
                    className="inline-flex items-center text-meta uppercase font-medium px-sm py-px rounded-full bg-charcoal-8 text-charcoal-70 animate-[bump_300ms_ease-out-quart_1]"
                    style={{
                      animation: 'tarmil-bump 300ms cubic-bezier(0.25,1,0.5,1)',
                    }}
                  >
                    {savedCount} saved
                  </span>
                )}
              </div>
            )}
          </button>
          <div className="flex flex-col gap-xs">
            <IconButton
              onClick={onToggleExpand}
              label={expanded ? 'Collapse wishlist' : 'Expand wishlist'}
              persistent
            >
              {expanded ? (
                <ChevronDown size={12} strokeWidth={2} />
              ) : (
                <ChevronRightIcon size={12} strokeWidth={2} />
              )}
            </IconButton>
            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-instant ease-out-quart flex flex-col gap-xs">
              <IconButton
                onClick={() => setEditing((v) => !v)}
                label={editing ? 'Cancel edit' : 'Edit dates'}
              >
                <Pencil size={12} strokeWidth={2} />
              </IconButton>
              {canRemove && (
                <IconButton onClick={onRemove} label={`Remove ${stop.nameEn}`}>
                  <Trash2 size={12} strokeWidth={2} />
                </IconButton>
              )}
            </div>
          </div>
        </div>
        {editing && (
          <DateEditor
            arrivalIso={stop.arrivalDate}
            departureIso={stop.departureDate}
            onSave={(a, d) => {
              onEditDates(a, d);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        )}
        {expanded && savedCount > 0 && (
          <div className="mt-sm pt-sm border-t border-charcoal-08 flex flex-col gap-xs">
            {savedItems.map((item) => (
              <WishlistRow
                key={item.id}
                item={item}
                onRemove={() => {
                  removePlace(item.stopId, item.placeId);
                  showToast(`${item.placeName} removed`);
                }}
              />
            ))}
          </div>
        )}
        {expanded && savedCount === 0 && (
          <p className="mt-sm pt-sm border-t border-charcoal-08 text-small text-charcoal-70 italic">
            No saved places yet for {stop.nameEn}.
          </p>
        )}
      </div>
    </div>
  );
}

function wishlistIcon(category: string): typeof MapPin {
  if (category === 'hostel') return Bed;
  if (category === 'restaurant') return Utensils;
  if (category === 'cafe') return Coffee;
  if (category === 'bar') return Wine;
  if (category === 'club') return Music;
  if (category === 'landmark') return Landmark;
  if (category === 'beach') return Waves;
  if (category === 'chabad') return Sparkles;
  if (category === 'kosher') return UtensilsCrossed;
  return MapPin;
}

function WishlistRow({
  item,
  onRemove,
}: {
  item: PlaceItem;
  onRemove: () => void;
}) {
  const Icon = wishlistIcon(item.category);
  return (
    <div className="group/wish flex items-center gap-sm py-xs px-xs rounded-xl hover:bg-charcoal-8 transition-[background-color] duration-instant ease-out-quart motion-reduce:transition-none">
      <span className="shrink-0 text-charcoal-70">
        <Icon size={12} strokeWidth={2} />
      </span>
      <span className="flex-1 min-w-0 text-small text-charcoal truncate">
        {item.placeName}
      </span>
      <span
        className={clsx(
          'shrink-0 text-meta uppercase font-medium px-sm py-px rounded-full',
          item.status === 'saved'
            ? 'bg-charcoal-8 text-charcoal-70'
            : 'bg-amber text-cream',
        )}
      >
        {item.status}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.placeName}`}
        className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-charcoal-70 hover:text-amber hover:bg-charcoal-8 opacity-0 group-hover/wish:opacity-100 focus-visible:opacity-100 transition-opacity duration-instant ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <X size={10} strokeWidth={2} />
      </button>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  persistent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  persistent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx(
        'h-6 w-6 rounded-full flex items-center justify-center text-charcoal-70 hover:text-amber hover:bg-charcoal-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        persistent && 'shrink-0',
      )}
    >
      {children}
    </button>
  );
}

function DateEditor({
  arrivalIso,
  departureIso,
  onSave,
  onCancel,
}: {
  arrivalIso: string;
  departureIso: string;
  onSave: (a: string, d: string) => void;
  onCancel: () => void;
}) {
  const [arrival, setArrival] = useState(arrivalIso);
  const [departure, setDeparture] = useState(departureIso);
  const arrivalDate = new Date(arrival + 'T12:00:00');
  const departureDate = new Date(departure + 'T12:00:00');
  const nights = Math.max(
    0,
    Math.round(
      (departureDate.getTime() - arrivalDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const valid = arrival && departure && nights >= 1;
  return (
    <div className="mt-md flex flex-col gap-md">
      <DateField label="Arrival" value={arrival} onChange={setArrival} />
      <DateField label="Departure" value={departure} onChange={setDeparture} />
      <p
        className={clsx(
          'text-small tnum',
          valid ? 'text-charcoal-70' : 'text-amber',
        )}
      >
        {valid
          ? `${nights} ${nights === 1 ? 'night' : 'nights'}`
          : 'Departure must be after arrival'}
      </p>
      <div className="flex gap-sm justify-end pt-xs border-t border-charcoal-08">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={() => valid && onSave(arrival, departure)}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex-1 flex flex-col gap-xs">
      <span className="meta-caps text-charcoal-70">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-xl px-sm bg-cream border border-charcoal-15 text-body text-charcoal focus:border-amber focus:outline-none transition-[border-color] duration-instant ease-out-quart"
      />
    </label>
  );
}

type LegRowProps = {
  from: PlannedStop;
  to: PlannedStop;
  selected: boolean;
  onClick: () => void;
};

function LegRow({ from, to, selected, onClick }: LegRowProps) {
  const leg = generateLeg(from, to, from.departureDate);
  const dominantMode = leg.offers.find((o) => o.badge === 'recommended')?.mode
    ?? leg.offers[0]?.mode
    ?? 'bus';
  const Icon =
    dominantMode === 'flight'
      ? Plane
      : dominantMode === 'train'
        ? Train
        : dominantMode === 'ferry'
          ? Ship
          : dominantMode === 'drive'
            ? Car
            : Bus;
  const modeLabel =
    dominantMode === 'flight'
      ? 'Flight'
      : dominantMode === 'train'
        ? 'Train'
        : dominantMode === 'ferry'
          ? 'Ferry'
          : dominantMode === 'drive'
            ? 'Drive'
            : 'Bus';
  const isGround = dominantMode === 'drive' || dominantMode === 'bus';
  const [driveMinutes, setDriveMinutes] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchDrivingMinutes(from.lat, from.lng, to.lat, to.lng).then((m) => {
      if (!cancelled) setDriveMinutes(m);
    });
    return () => {
      cancelled = true;
    };
  }, [from.lat, from.lng, to.lat, to.lng]);

  const bookings = transitForLeg(from.id, to.id);

  return (
    <div className="group flex gap-sm w-full items-stretch">
      <div className="shrink-0 w-8 flex flex-col items-center">
        <div className="h-3 w-px border-s border-dashed border-charcoal-15" />
        <div
          className={clsx(
            'h-6 w-6 rounded-full bg-cream border flex items-center justify-center shrink-0 transition-[border-color,color] duration-instant ease-out-quart motion-reduce:transition-none',
            selected
              ? 'border-amber text-amber'
              : 'border-charcoal-15 text-charcoal-70 group-hover:border-amber group-hover:text-amber',
          )}
        >
          <Icon size={12} strokeWidth={2} />
        </div>
        <div className="w-px flex-1 border-s border-dashed border-charcoal-15 min-h-3" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-xs py-xs">
        <button
          type="button"
          onClick={onClick}
          aria-label={`Transport from ${from.nameEn} to ${to.nameEn}`}
          className="flex items-center px-sm rounded-sm text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <span
            className={clsx(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-meta uppercase tracking-wide leading-none transition-colors duration-instant ease-out-quart motion-reduce:transition-none',
              selected
                ? 'border-amber bg-amber/10 text-amber'
                : 'border-charcoal-15 bg-cream text-charcoal-70 group-hover:border-amber group-hover:text-amber',
            )}
          >
            {isGround && driveMinutes !== null
              ? formatDriveDuration(driveMinutes)
              : modeLabel}
          </span>
        </button>
        {bookings.length > 0 && (
          <div className="flex flex-col gap-xs px-sm min-w-0">
            {bookings.map((b) => (
              <TransitBookingRow key={b.id} item={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TransitBookingRow({ item }: { item: TransitItem }) {
  const offer = item.offer;
  const Icon =
    offer.mode === 'flight'
      ? Plane
      : offer.mode === 'train'
        ? Train
        : offer.mode === 'ferry'
          ? Ship
          : offer.mode === 'bus'
            ? Bus
            : Plane;
  const onRemove = () => {
    removeTransit(item.fromStopId, item.toStopId, item.offerId);
    showToast(`${offer.provider} removed`);
  };
  return (
    <div className="group/booking flex items-center gap-sm py-sm px-sm rounded-xl bg-charcoal-8 hover:bg-charcoal-15 transition-[background-color] duration-instant ease-out-quart motion-reduce:transition-none min-w-0">
      <span className="shrink-0 text-amber">
        <Icon size={12} strokeWidth={2} />
      </span>
      <div className="flex-1 min-w-0 flex flex-col gap-px leading-tight">
        <p className="text-small font-medium text-charcoal truncate">
          {offer.provider}
        </p>
        <p className="text-meta text-charcoal-70 tnum truncate">
          {offer.mode !== 'drive' && (
            <>
              {offer.departureTime} → {offer.arrivalTime}
              <span className="text-charcoal-30"> · </span>
            </>
          )}
          {offer.currency} {offer.price}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${offer.provider} booking`}
        className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-charcoal-70 hover:text-amber hover:bg-cream opacity-0 group-hover/booking:opacity-100 focus-visible:opacity-100 transition-opacity duration-instant ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <X size={10} strokeWidth={2} />
      </button>
    </div>
  );
}
