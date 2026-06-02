import type { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  children: ReactNode;
  /** Disable internal scroll (default: scrollable). Use for map screens that own their own viewport. */
  noScroll?: boolean;
  /** Additional className applied to the inner padded container. */
  className?: string;
};

/**
 * Every screen wraps its content in <Screen>. Provides:
 *  - safe-area top padding (important for the iOS notch in standalone mode)
 *  - ivory background
 *  - scroll behavior
 *
 * Bottom safe area is handled by <TabBar> instead, since it's the bottommost
 * element and persists across routes.
 */
export function Screen({ children, noScroll, className }: Props) {
  return (
    <div
      className={clsx(
        'flex-1 bg-cream',
        noScroll ? 'overflow-hidden' : 'overflow-y-auto',
        className,
      )}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {children}
    </div>
  );
}
