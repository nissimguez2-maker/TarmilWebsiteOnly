import type { ReactNode } from 'react';
import clsx from 'clsx';

type Props = {
  /** Credit text, e.g. "© OpenStreetMap contributors" or "From Wikipedia · CC BY-SA". */
  children: ReactNode;
  /** Optional source URL — renders the credit as a focusable link to the source. */
  href?: string;
  className?: string;
};

/**
 * A quiet, attributed provenance line for third-party content (OSM, Wikipedia,
 * Open-Meteo…). Honest by default: visually subordinate to Tarmil's own voice,
 * never the editorial gold accent. Required wherever ODbL / CC BY-SA data shows.
 */
export function SourceCredit({ children, href, className }: Props) {
  const base = clsx('text-meta text-charcoal-55', className);
  if (!href) return <p className={base}>{children}</p>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        base,
        'inline-flex w-fit items-center underline underline-offset-2 hover:text-charcoal-70 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
      )}
    >
      {children}
    </a>
  );
}
