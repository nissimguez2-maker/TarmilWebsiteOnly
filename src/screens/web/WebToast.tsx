import { useEffect, useState } from 'react';

type Toast = {
  id: number;
  message: string;
  undo?: () => void;
};

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function showToast(message: string, undo?: () => void): void {
  const t: Toast = { id: nextId++, message, undo };
  toasts = [...toasts, t];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    emit();
  }, 5000);
}

function dismiss(id: number): void {
  toasts = toasts.filter((x) => x.id !== id);
  emit();
}

export function WebToastLayer() {
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);

  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-md end-md z-[3000] flex flex-col gap-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-charcoal text-cream rounded-full ps-md pe-sm py-sm shadow-panel flex items-center gap-md max-w-sm"
        >
          <span className="text-small">{t.message}</span>
          {t.undo && (
            <button
              type="button"
              onClick={() => {
                t.undo?.();
                dismiss(t.id);
              }}
              className="text-meta uppercase font-medium text-amber hover:text-cream transition-colors duration-instant ease-out-quart motion-reduce:transition-none focus-visible:outline-none focus-visible:underline"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
            className="text-charcoal-30 hover:text-cream text-small"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
