import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'accent' | 'ghost' | 'sea';
type Size = 'sm' | 'md';

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Three variants:
 *  - primary : charcoal fill, cream text. Default for most CTAs.
 *  - accent  : umber fill, cream text. The strong/"vibrant" action. Use sparingly.
 *  - ghost   : transparent, charcoal text, hairline charcoal-15 border. Secondary actions.
 *
 * Sizes:
 *  - md (default) : h-lg (14mm) — main CTAs, sticky bottom actions, sheet primaries.
 *  - sm           : h-10 (40px) — inline secondary actions inside dense sheets.
 *
 * Motion: instant color transition, ease-out-quart, active scale 0.97
 * for tactile feedback (matches the rest of the app's interactive grammar).
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        // base
        'inline-flex items-center justify-center gap-2 rounded-full px-md',
        'font-sans text-body font-medium leading-none',
        'transition-[transform,background-color,border-color,box-shadow] duration-instant ease-out-quart',
        'motion-reduce:transition-none',
        'active:scale-[0.97]',
        'disabled:opacity-30 disabled:pointer-events-none disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        // size
        size === 'md' && 'h-lg',
        size === 'sm' && 'h-10',
        // variants
        variant === 'primary' &&
          'bg-charcoal text-cream shadow-card hover:bg-charcoal-70 active:bg-charcoal',
        variant === 'accent' &&
          'bg-umber text-cream shadow-fab hover:bg-umber/90 active:bg-umber',
        variant === 'sea' &&
          'bg-sea text-cream shadow-card hover:bg-sea/90 active:bg-sea',
        // tonal (soft-fill) secondary — modern, replaces the old hairline outline
        variant === 'ghost' &&
          'bg-charcoal-8 text-charcoal hover:bg-charcoal-15 active:bg-charcoal-15',
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  );
}
