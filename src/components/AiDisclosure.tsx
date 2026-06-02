import clsx from 'clsx';

type Props = {
  /**
   * 'light' (default) — low-stakes generated prose (city intros, place blurbs):
   * "AI-generated · verify details".
   * 'official' — answers that can touch visa / entry / safety / health
   * (the concierge): "AI-generated · verify with official sources".
   */
  tone?: 'light' | 'official';
  className?: string;
};

/**
 * The honest, reusable "this was written by AI" disclosure. Quiet by default
 * (never the editorial gold accent), but always present on any AI-generated
 * surface — EU AI Act Art. 50 transparency + the Moffatt principle (we own the
 * model's answers). Use `tone="official"` wherever an answer could touch
 * visa / entry / safety / health, so it never reads as authoritative.
 */
export function AiDisclosure({ tone = 'light', className }: Props) {
  return (
    <p className={clsx('text-meta text-charcoal-55', className)}>
      {tone === 'official'
        ? 'AI-generated · verify with official sources'
        : 'AI-generated · verify details'}
    </p>
  );
}
