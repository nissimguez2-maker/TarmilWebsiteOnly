import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Bus, Car, Plane, Ship, Train } from 'lucide-react';
import type { TransportOffer } from '../data/mockTransport';
import { airlineLogoUrl, resolveOperatorBrand } from '../data/operatorBrand';

type Props = {
  provider: string;
  mode: TransportOffer['mode'];
  size?: 'sm' | 'md' | 'lg';
};

/**
 * The operator's brand mark on a white tile, three layers deep so it always
 * lands well:
 *   1. full-colour airline logo from the CDN (`airlineLogoUrl`),
 *   2. on load failure → the monochrome simple-icons mark in brand colour,
 *   3. with neither → a generic mode glyph (Plane / Bus / Ferry / Train / Car).
 *
 * The white rounded tile is the booking-app convention (Skyscanner / Hopper /
 * Polarsteps) — it normalises logos of wildly different aspect ratios into one
 * calm, consistent frame.
 */

const SIZES = {
  sm: { box: 'h-8 w-8', pad: 'p-1', svg: 'h-4 w-4', icon: 15 },
  md: { box: 'h-10 w-10', pad: 'p-1.5', svg: 'h-5 w-5', icon: 18 },
  lg: { box: 'h-12 w-12', pad: 'p-2', svg: 'h-6 w-6', icon: 22 },
} as const;

function modeIcon(mode: TransportOffer['mode']) {
  if (mode === 'flight') return Plane;
  if (mode === 'train') return Train;
  if (mode === 'bus') return Bus;
  if (mode === 'ferry') return Ship;
  return Car;
}

export function OperatorMark({ provider, mode, size = 'md' }: Props) {
  const brand = resolveOperatorBrand(provider);
  const { box, pad, svg, icon } = SIZES[size];

  // Reset the CDN attempt whenever the operator changes (the component is
  // reused across legs by list position).
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [brand?.iata]);

  const tile = clsx(
    'shrink-0 inline-flex items-center justify-center overflow-hidden rounded-xl bg-cream border border-charcoal-15',
    box,
  );

  // 1 — full-colour airline logo.
  if (brand?.iata && !imgFailed) {
    return (
      <span className={tile}>
        <img
          src={airlineLogoUrl(brand.iata)}
          alt={`${brand.title} logo`}
          className={clsx('h-full w-full object-contain', pad)}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  // 2 — monochrome brand mark.
  if (brand?.mono) {
    return (
      <span className={tile} aria-hidden>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={svg}>
          <title>{brand.title}</title>
          <path d={brand.mono.path} fill={brand.mono.hex} />
        </svg>
      </span>
    );
  }

  // 3 — generic mode glyph.
  const Icon = modeIcon(mode);
  return (
    <span className={clsx(tile, 'text-charcoal-70')} aria-hidden>
      <Icon size={icon} strokeWidth={1.75} />
    </span>
  );
}
