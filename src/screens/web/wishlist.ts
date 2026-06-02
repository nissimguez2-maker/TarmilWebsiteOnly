import { useEffect, useState } from 'react';
import type { TransportOffer } from '../../data/mockTransport';

export type PlaceItem = {
  kind: 'place';
  id: string;
  placeId: string;
  stopId: string;
  placeName: string;
  category: string;
  status: 'saved' | 'reserved';
  addedAt: number;
};

export type TransitItem = {
  kind: 'transit';
  id: string;
  offerId: string;
  fromStopId: string;
  toStopId: string;
  offer: TransportOffer;
  addedAt: number;
};

export type WishItem = PlaceItem | TransitItem;

type State = { items: WishItem[] };

const STORAGE_KEY = 'tarmil:wishlist';

let state: State = loadInitial();
const listeners = new Set<() => void>();

function loadInitial(): State {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      return { items: parsed.items as WishItem[] };
    }
  } catch {
    // ignore parse errors
  }
  return { items: [] };
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function persist() {
  if (typeof window === 'undefined') return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, 150);
}

function emit() {
  state = { ...state };
  listeners.forEach((fn) => fn());
  persist();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function snapshot(): State {
  return state;
}

export function useWishlist(): State {
  const [, force] = useState(0);
  useEffect(() => {
    return subscribe(() => force((n) => n + 1));
  }, []);
  return state;
}

function placeId(stopId: string, placeKey: string): string {
  return `${stopId}::${placeKey}`;
}

function transitId(fromStopId: string, toStopId: string, offerId: string): string {
  return `${fromStopId}::${toStopId}::${offerId}`;
}

export function findPlace(stopId: string, placeKey: string): PlaceItem | undefined {
  const id = placeId(stopId, placeKey);
  return state.items.find(
    (i): i is PlaceItem => i.kind === 'place' && i.id === id,
  );
}

export function findTransit(
  fromStopId: string,
  toStopId: string,
  offerId: string,
): TransitItem | undefined {
  const id = transitId(fromStopId, toStopId, offerId);
  return state.items.find(
    (i): i is TransitItem => i.kind === 'transit' && i.id === id,
  );
}

export function placesForStop(stopId: string): PlaceItem[] {
  return state.items.filter(
    (i): i is PlaceItem => i.kind === 'place' && i.stopId === stopId,
  );
}

export function transitForLeg(
  fromStopId: string,
  toStopId: string,
): TransitItem[] {
  return state.items.filter(
    (i): i is TransitItem =>
      i.kind === 'transit' &&
      i.fromStopId === fromStopId &&
      i.toStopId === toStopId,
  );
}

export function countForStop(stopId: string): number {
  return placesForStop(stopId).length;
}

export function addPlace(input: {
  stopId: string;
  placeId: string;
  placeName: string;
  category: string;
  status: 'saved' | 'reserved';
}): PlaceItem {
  const id = placeId(input.stopId, input.placeId);
  const existingIndex = state.items.findIndex((i) => i.id === id);
  const item: PlaceItem = {
    kind: 'place',
    id,
    placeId: input.placeId,
    stopId: input.stopId,
    placeName: input.placeName,
    category: input.category,
    status: input.status,
    addedAt: Date.now(),
  };
  if (existingIndex >= 0) {
    state.items[existingIndex] = item;
  } else {
    state.items.push(item);
  }
  emit();
  return item;
}

export function removePlace(stopId: string, placeKey: string): void {
  const id = placeId(stopId, placeKey);
  const next = state.items.filter((i) => i.id !== id);
  if (next.length !== state.items.length) {
    state.items = next;
    emit();
  }
}

export function addTransit(input: {
  fromStopId: string;
  toStopId: string;
  offer: TransportOffer;
}): TransitItem {
  const id = transitId(input.fromStopId, input.toStopId, input.offer.id);
  const existingIndex = state.items.findIndex((i) => i.id === id);
  const item: TransitItem = {
    kind: 'transit',
    id,
    offerId: input.offer.id,
    fromStopId: input.fromStopId,
    toStopId: input.toStopId,
    offer: input.offer,
    addedAt: Date.now(),
  };
  if (existingIndex >= 0) {
    state.items[existingIndex] = item;
  } else {
    state.items.push(item);
  }
  emit();
  return item;
}

export function removeTransit(
  fromStopId: string,
  toStopId: string,
  offerId: string,
): void {
  const id = transitId(fromStopId, toStopId, offerId);
  const next = state.items.filter((i) => i.id !== id);
  if (next.length !== state.items.length) {
    state.items = next;
    emit();
  }
}

export function removeForStop(stopId: string): {
  places: number;
  transit: number;
} {
  let places = 0;
  let transit = 0;
  const next = state.items.filter((i) => {
    if (i.kind === 'place' && i.stopId === stopId) {
      places++;
      return false;
    }
    if (
      i.kind === 'transit' &&
      (i.fromStopId === stopId || i.toStopId === stopId)
    ) {
      transit++;
      return false;
    }
    return true;
  });
  if (places > 0 || transit > 0) {
    state.items = next;
    emit();
  }
  return { places, transit };
}
