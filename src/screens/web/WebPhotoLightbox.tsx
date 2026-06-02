import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type State = { photos: string[]; index: number; cityName: string } | null;

let state: State = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function openLightbox(
  photos: string[],
  index: number,
  cityName: string,
): void {
  if (!photos.length) return;
  state = { photos, index, cityName };
  emit();
}

export function closeLightbox(): void {
  state = null;
  emit();
}

export function WebPhotoLightbox() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (!state) return;
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (e.key === 'ArrowRight' && state.index < state.photos.length - 1) {
        state = { ...state, index: state.index + 1 };
        emit();
      }
      if (e.key === 'ArrowLeft' && state.index > 0) {
        state = { ...state, index: state.index - 1 };
        emit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  if (!state) return null;
  const { photos, index, cityName } = state;
  const goPrev = () => {
    if (state && state.index > 0) {
      state = { ...state, index: state.index - 1 };
      emit();
    }
  };
  const goNext = () => {
    if (state && state.index < state.photos.length - 1) {
      state = { ...state, index: state.index + 1 };
      emit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3500] bg-charcoal/90 flex items-center justify-center p-xl"
      role="dialog"
      aria-modal="true"
      onClick={closeLightbox}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          closeLightbox();
        }}
        aria-label="Close"
        className="absolute top-md end-md h-10 w-10 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
      >
        <X size={20} strokeWidth={2} />
      </button>
      {index > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Previous photo"
          className="absolute start-md top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Next photo"
          className="absolute end-md top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      )}
      <figure
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-md max-w-5xl max-h-[88dvh]"
      >
        <img
          src={photos[index]}
          alt={`${cityName} photo ${index + 1}`}
          className="max-w-full max-h-[80dvh] object-contain rounded-xl"
        />
        <figcaption className="text-center text-cream text-small">
          <span className="font-serif">{cityName}</span>
          <span className="text-charcoal-30 ms-sm">
            {index + 1} / {photos.length}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
