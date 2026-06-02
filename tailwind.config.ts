import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',

      // DA v0.3 palette
      cream: 'rgb(var(--cream-rgb) / <alpha-value>)',
      sand: 'rgb(var(--sand-rgb) / <alpha-value>)',
      linen: 'rgb(var(--linen-rgb) / <alpha-value>)',
      clay: 'rgb(var(--clay-rgb) / <alpha-value>)',
      blush: 'rgb(var(--blush-rgb) / <alpha-value>)',
      charcoal: {
        DEFAULT: 'rgb(var(--charcoal-rgb) / <alpha-value>)',
        70: 'var(--charcoal-70)',
        55: 'var(--charcoal-55)',
        30: 'var(--charcoal-30)',
        15: 'var(--charcoal-15)',
        8: 'var(--charcoal-08)',
      },
      umber: 'rgb(var(--umber-rgb) / <alpha-value>)',
      amber: {
        DEFAULT: 'rgb(var(--amber-rgb) / <alpha-value>)',
        85: 'var(--amber-85)',
        70: 'var(--amber-70)',
      },
      sea: 'rgb(var(--sea-rgb) / <alpha-value>)',
    },
    fontFamily: {
      // Aesop-style clean grotesque (Suisse Int'l look-alike) for ALL text.
      // The `serif` alias is kept so existing `font-serif` usages still resolve;
      // headlines are now the same grotesque at larger sizes/weights.
      serif: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
      sans: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      meta: ['8pt', { lineHeight: '1.5', letterSpacing: '0.18em' }],
      small: ['10pt', { lineHeight: '1.45' }],
      body: ['11pt', { lineHeight: '1.55' }],
      lede: ['14pt', { lineHeight: '1.4' }],
      sub: ['22pt', { lineHeight: '1.15', letterSpacing: '-0.018em' }],
      display: ['44pt', { lineHeight: '0.94', letterSpacing: '-0.035em' }],
      hero: ['92pt', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
    },
    extend: {
      // DA mm scale lives alongside the default Tailwind numeric spacing.
      // Putting it on `theme.spacing` directly used to wipe out the default
      // scale, which silently turned every `h-8`, `w-10`, `gap-2`, `p-1` into
      // a no-op — avatars and FABs lost their dimensions and Hebrew wrapped
      // character-per-line because flex siblings collapsed to min-content.
      spacing: {
        hair: '0.5mm',
        xs: '2mm',
        sm: '4mm',
        md: '8mm',
        lg: '14mm',
        xl: '22mm',
        xxl: '36mm',
        full: '100%',
        screen: '100dvh',
      },
      borderRadius: {
        device: '54px',
        notch: '20px',
      },
      maxWidth: {
        body: '130mm',
        lede: '110mm',
        caption: '90mm',
        quote: '100mm',
      },
      letterSpacing: {
        meta: '0.18em',
      },
      boxShadow: {
        device: '0 30px 80px -20px rgba(46, 36, 23, 0.4)',
        card: 'var(--shadow-card)',
        sheet: 'var(--shadow-sheet)',
        fab: 'var(--shadow-fab)',
        panel: 'var(--shadow-panel)',
      },
      transitionTimingFunction: {
        'out-quart': 'var(--ease-out-quart)',
      },
      transitionDuration: {
        instant: '140ms',
        considered: '280ms',
      },
      screens: {
        // default tailwind breakpoints (sm 640, md 768, lg 1024, xl 1280, 2xl 1536) preserved
      },
    },
  },
  plugins: [],
} satisfies Config;
