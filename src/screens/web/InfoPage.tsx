import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * "Sources & terms" — the one place every data credit and disclaimer lives, so
 * the planner surfaces stay clean. Reached by a single quiet header link. Plain,
 * warm copy; no new brand decisions. Attribution for the open data sources is
 * satisfied collectively here (CC BY-SA / ODbL credit a named, linked page).
 */

type LinkSource = { label: string; href: string };

const DATA_SOURCES: LinkSource[] = [
  { label: 'Maps & places — © OpenStreetMap contributors (ODbL)', href: 'https://www.openstreetmap.org/copyright' },
  { label: 'City information — Wikipedia (CC BY-SA)', href: 'https://en.wikipedia.org' },
  { label: 'Weather & air quality — Open-Meteo', href: 'https://open-meteo.com' },
  { label: 'Daylight — sunrise-sunset.org', href: 'https://sunrise-sunset.org' },
  { label: 'Local time — timeapi.io', href: 'https://timeapi.io' },
  { label: 'Public holidays — Nager.Date', href: 'https://date.nager.at' },
  { label: 'Currency rates — Frankfurter (ECB reference rates)', href: 'https://www.frankfurter.app' },
  { label: 'Country facts — REST Countries', href: 'https://restcountries.com' },
];

export function InfoPage() {
  return (
    <div className="min-h-dvh bg-cream text-charcoal">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-md border-b border-charcoal-15 bg-cream px-md">
        <Link
          to="/"
          className="inline-flex items-center gap-xs rounded-full px-sm py-xs text-meta uppercase tracking-wide text-charcoal-70 transition-colors duration-fast ease-out-quart motion-reduce:transition-none hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
          Back to planner
        </Link>
        <span className="ms-auto font-serif text-lede text-charcoal">Tarmil</span>
      </header>

      <main className="mx-auto flex max-w-body flex-col gap-xl px-md py-lg">
        <div className="flex flex-col gap-xs">
          <span className="meta-caps text-charcoal-55">Sources &amp; terms</span>
          <h1 className="font-serif text-sub leading-tight text-charcoal">
            Where our information comes from
          </h1>
          <p className="text-body text-charcoal-70">
            Tarmil is a trip planner built on open data and a little AI. This page
            gathers the credits and the honest caveats in one place, so the planner
            itself stays calm.
          </p>
        </div>

        <Section title="Data sources &amp; attributions">
          <p className="text-body text-charcoal-70">
            The planner is built on free, open data. We&apos;re grateful to these
            projects and credit them here:
          </p>
          <ul className="flex flex-col gap-xs">
            {DATA_SOURCES.map((s) => (
              <li key={s.href} className="text-body">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-umber underline decoration-charcoal-15 underline-offset-2 transition-colors duration-fast ease-out-quart motion-reduce:transition-none hover:decoration-umber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-small text-charcoal-55">
            Ratings shown from Google, Foursquare, or Tripadvisor are always labelled
            with their source and are never Tarmil&apos;s own editorial score.
          </p>
        </Section>

        <Section title="AI use &amp; limitations">
          <p className="text-body text-charcoal-70">
            Parts of city intros, trip starters, and the trip assistant are
            AI-generated. AI can be wrong. Treat it as a helpful starting point, not
            the last word.
          </p>
          <p className="text-body text-charcoal-70">
            For anything that matters — visas, entry rules, safety, health — confirm
            with the official source before you commit money or travel.
          </p>
        </Section>

        <Section title="Entry, visa &amp; safety">
          <p className="text-body text-charcoal-70">
            Entry and visa rules depend on your nationality, your passport, and your
            purpose, and they change often. Any visa status we show is guidance only.
          </p>
          <p className="text-body text-charcoal-70">
            Always confirm with the destination&apos;s official government or
            immigration source before you book. Tarmil never issues a binding visa or
            safety verdict.
          </p>
        </Section>

        <Section title="How places are labelled">
          <p className="text-body text-charcoal-70">
            <span className="font-medium text-charcoal">Tarmil Selection</span> means
            a place we&apos;d genuinely recommend.{' '}
            <span className="font-medium text-charcoal">Sponsored</span> means a paid
            placement. Either way, we tell you which.
          </p>
          <p className="text-body text-charcoal-70">
            Places that don&apos;t pay are never hidden — they appear normally
            alongside the rest. Some booking links are partner links: we may earn a
            commission, your price is unchanged, and non-partners are always shown.
          </p>
        </Section>

        <Section title="Terms">
          <p className="text-body text-charcoal-70">
            This is an early product. Trips are saved anonymously (no account), in
            English for now. Use it as a planning aid, verify the details that
            matter, and travel safely.
          </p>
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-sm border-t border-charcoal-15 pt-lg">
      <h2 className="font-serif text-lede leading-tight text-charcoal">{title}</h2>
      {children}
    </section>
  );
}
