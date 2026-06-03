import { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, Coins, ShieldAlert, X } from 'lucide-react';
import { SourceCredit } from '../../components/SourceCredit';
import type { PlannedStop } from '../../data/plannedStops';
import { countryCodeFor, countryNameFor } from './cityCountries';
import { fetchCountry } from './countryApi';
import { fetchPublicHolidays, holidaysInRange } from './holidaysApi';
import { fetchFxRate } from './fxApi';
import { entryReminder } from './entryNote';
import { visaFromIsrael } from './visaApi';
import { ConciergeBox } from './ConciergeBox';
import { LocalConditions } from './LocalConditions';
import { fetchLocalTime } from './timeApi';
import { fetchSun } from './sunApi';
import { fetchAirQuality, aqiLabel } from './airQualityApi';

type Props = {
  stops: PlannedStop[];
  /** Display name of the traveler's home country — drives entry notes + FX quote. */
  homeCountryName?: string;
  onClose: () => void;
};

/**
 * Map a home-country display name to its ISO-4217 quote currency. The website is
 * Israel-first, so an unknown / absent home resolves to ILS — matching the
 * "≈ X ILS" framing of the currency line. (Free data, no hardcoded rates.)
 */
const HOME_CURRENCY: Record<string, string> = {
  israel: 'ILS',
  'united states': 'USD',
  'united kingdom': 'GBP',
  france: 'EUR',
  germany: 'EUR',
  spain: 'EUR',
  italy: 'EUR',
  netherlands: 'EUR',
  canada: 'CAD',
  australia: 'AUD',
};

function homeCurrencyFor(name?: string): string {
  if (!name) return 'ILS';
  return HOME_CURRENCY[name.trim().toLowerCase()] ?? 'ILS';
}

/**
 * Gather real, free per-stop facts (currency + live FX, language, timezone,
 * public holidays in range, entry reminder) into plain sentences the concierge
 * is grounded on. The model answers ONLY from these — so "what currency / is
 * anything closed / what's the timezone" become answerable, while visa/safety
 * stay deferred until a real source is wired. All sources are cached + graceful.
 */
function useTripFacts(
  stops: PlannedStop[],
  homeCurrency: string,
  homeCountryName?: string,
): string[] {
  const [facts, setFacts] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: string[] = [];
      for (const stop of stops) {
        out.push(
          `${stop.nameEn}: staying ${stop.arrivalDate} to ${stop.departureDate} (${stop.nights} nights).`,
        );
        const [lt, sun, air] = await Promise.all([
          fetchLocalTime(stop.lat, stop.lng),
          fetchSun(stop.lat, stop.lng, stop.arrivalDate),
          fetchAirQuality(stop.lat, stop.lng),
        ]);
        if (lt) out.push(`Local time in ${stop.nameEn}: ${lt.time} (${lt.timeZone}).`);
        if (sun)
          out.push(
            `${stop.nameEn} has about ${Math.round(sun.dayLengthSec / 3600)} hours of daylight around your dates.`,
          );
        if (air && air.euAqi != null)
          out.push(
            `Air quality in ${stop.nameEn}: ${aqiLabel(air.euAqi) ?? 'unknown'} (EU AQI ${air.euAqi}).`,
          );
        const code = countryCodeFor(stop.id);
        if (!code) continue;
        const info = await fetchCountry(code);
        if (info?.currencyCode) {
          if (info.currencyCode !== homeCurrency) {
            const rate = await fetchFxRate(info.currencyCode, homeCurrency);
            out.push(
              rate != null
                ? `${stop.nameEn} (${code}) uses ${info.currencyCode}${info.currencyName ? ` (${info.currencyName})` : ''}; 1 ${info.currencyCode} is about ${formatRate(rate)} ${homeCurrency}.`
                : `${stop.nameEn} (${code}) uses ${info.currencyCode}.`,
            );
          } else {
            out.push(`${stop.nameEn} uses ${info.currencyCode}, the same as home.`);
          }
        }
        if (info?.language) {
          out.push(`${stop.nameEn}: main language ${info.language}; local timezone UTC${info.timezone}.`);
        }
        if (info?.callingCode || info?.drivingSide) {
          const bits: string[] = [];
          if (info.callingCode) bits.push(`calling code ${info.callingCode}`);
          if (info.drivingSide) bits.push(`they drive on the ${info.drivingSide}`);
          out.push(`${stop.nameEn}: ${bits.join('; ')}.`);
        }
        const year = Number(stop.arrivalDate.slice(0, 4));
        const inRange = holidaysInRange(
          await fetchPublicHolidays(code, year),
          stop.arrivalDate,
          stop.departureDate,
        );
        if (inRange.length > 0) {
          out.push(
            `Public holidays in ${stop.nameEn} during the stay: ${inRange
              .map((h) => `${h.name} on ${h.date}`)
              .join('; ')} (some places may close).`,
          );
        }
        if (homeCountryName?.trim().toLowerCase() === 'israel') {
          const visa = visaFromIsrael(code);
          if (visa)
            out.push(
              `Israeli passport entering ${countryNameFor(code) ?? code}: ${visa}. Guidance only — verify with the embassy.`,
            );
        }
        if (homeCountryName) {
          const note = entryReminder(homeCountryName, countryNameFor(code) ?? code);
          if (note) out.push(note);
        }
      }
      if (!cancelled) setFacts(out);
    })().catch(() => {
      if (!cancelled) setFacts([]);
    });
    return () => {
      cancelled = true;
    };
  }, [stops, homeCurrency, homeCountryName]);
  return facts;
}

/**
 * "Before you fly" — a calm, skimmable finalize overlay. For each stop it surfaces
 * only real, free data: public holidays falling inside the stay (Nager.Date),
 * a live currency line to the traveler's home currency (Frankfurter), and a
 * disclaimed entry reminder. Anything that doesn't resolve is simply hidden —
 * never a broken or empty row. A trip concierge sits at the foot.
 *
 * Modal mechanics mirror WebBookingSheet: centered scrim, Escape-to-close (with
 * stopPropagation so the planner's global handler doesn't also fire), a focus
 * trap, and focus restored to the opener on close.
 */
export function WebBeforeYouFly({ stops, homeCountryName, onClose }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const homeCurrency = homeCurrencyFor(homeCountryName);
  const facts = useTripFacts(stops, homeCurrency, homeCountryName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Focus into the panel on open, trap Tab, restore focus to the opener on close.
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusables()[0]?.focus();
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onTab);
    return () => {
      document.removeEventListener('keydown', onTab);
      openerRef.current?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-start justify-center overflow-y-auto bg-charcoal/50 p-lg backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(560px, 100%)' }}
        className="my-auto flex flex-col rounded-2xl bg-cream shadow-fab"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-md rounded-t-2xl border-b border-charcoal-15 bg-cream/95 px-lg py-md backdrop-blur">
          <div className="flex flex-col gap-px">
            <span className="meta-caps text-charcoal-70">Before you fly</span>
            <h2
              id={titleId}
              className="font-serif text-sub leading-tight text-charcoal"
            >
              A few things worth knowing
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal-8 text-charcoal transition-colors duration-instant ease-out-quart motion-reduce:transition-none hover:bg-charcoal-15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </header>

        <div className="flex flex-col gap-md px-lg py-lg">
          {stops.length === 0 ? (
            <p className="text-small text-charcoal-70">
              Add a stop to your trip to see holidays, currency, and entry notes
              here.
            </p>
          ) : (
            stops.map((stop) => (
              <StopCard
                key={stop.id}
                stop={stop}
                homeCurrency={homeCurrency}
                homeCountryName={homeCountryName}
              />
            ))
          )}

          <ConciergeBox stops={stops} facts={facts} />
        </div>
      </div>
    </div>
  );
}

function StopCard({
  stop,
  homeCurrency,
  homeCountryName,
}: {
  stop: PlannedStop;
  homeCurrency: string;
  homeCountryName?: string;
}) {
  const code = countryCodeFor(stop.id);

  return (
    <article className="flex flex-col gap-sm rounded-2xl bg-sand p-md ring-1 ring-charcoal-15">
      <h3 className="font-serif text-lede leading-tight text-charcoal">
        {stop.nameEn}
      </h3>
      <HolidayLines stop={stop} countryCode={code} />
      <CurrencyLine countryCode={code} homeCurrency={homeCurrency} />
      <EntryLine countryCode={code} homeCountryName={homeCountryName} />
      <LocalConditions
        lat={stop.lat}
        lng={stop.lng}
        arrivalDate={stop.arrivalDate}
        departureDate={stop.departureDate}
      />
    </article>
  );
}

type Holiday = { date: string; localName: string; name: string };

function HolidayLines({
  stop,
  countryCode,
}: {
  stop: PlannedStop;
  countryCode?: string;
}) {
  const [holidays, setHolidays] = useState<Holiday[] | null>(null);

  useEffect(() => {
    if (!countryCode) {
      setHolidays(null);
      return;
    }
    let cancelled = false;
    const year = Number(stop.arrivalDate.slice(0, 4));
    fetchPublicHolidays(countryCode, year)
      .then((list) => {
        if (cancelled) return;
        const inRange = holidaysInRange(
          list,
          stop.arrivalDate,
          stop.departureDate,
        );
        setHolidays(inRange);
      })
      .catch(() => {
        if (!cancelled) setHolidays(null);
      });
    return () => {
      cancelled = true;
    };
  }, [countryCode, stop.arrivalDate, stop.departureDate]);

  // Hide the line entirely when there's nothing real to show — never an empty state.
  if (!holidays || holidays.length === 0) return null;

  return (
    <div className="flex items-start gap-sm">
      <CalendarDays
        size={14}
        strokeWidth={2}
        className="mt-px shrink-0 text-charcoal-70"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        <p className="meta-caps text-charcoal-70">
          Public holidays during your stay
        </p>
        <ul className="flex flex-col gap-px">
          {holidays.map((h) => (
            <li key={`${h.date}-${h.name}`} className="text-small text-charcoal">
              <span className="tnum text-charcoal-70">
                {formatHolidayDate(h.date)}
              </span>{' '}
              · {h.name}
              {h.localName && h.localName !== h.name && (
                <span className="text-charcoal-70"> ({h.localName})</span>
              )}
            </li>
          ))}
        </ul>
        <SourceCredit href="https://date.nager.at">
          Holiday dates · Nager.Date
        </SourceCredit>
      </div>
    </div>
  );
}

function CurrencyLine({
  countryCode,
  homeCurrency,
}: {
  countryCode?: string;
  homeCurrency: string;
}) {
  const [money, setMoney] = useState<{
    code: string;
    name: string;
    rate: number | null;
  } | null>(null);

  useEffect(() => {
    if (!countryCode) {
      setMoney(null);
      return;
    }
    let cancelled = false;
    fetchCountry(countryCode)
      .then(async (info) => {
        const code = info?.currencyCode;
        // Skip only when unknown or identical to the home currency.
        if (!code || code === homeCurrency) {
          if (!cancelled) setMoney(null);
          return;
        }
        const rate = await fetchFxRate(code, homeCurrency);
        if (!cancelled) {
          setMoney({ code, name: info?.currencyName ?? '', rate: rate ?? null });
        }
      })
      .catch(() => {
        if (!cancelled) setMoney(null);
      });
    return () => {
      cancelled = true;
    };
  }, [countryCode, homeCurrency]);

  if (!money) return null;

  return (
    <div className="flex items-start gap-sm">
      <Coins
        size={14}
        strokeWidth={2}
        className="mt-px shrink-0 text-charcoal-70"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        <p className="text-small text-charcoal">
          {money.name ? `${money.name} (${money.code})` : money.code}
          {money.rate != null && (
            <>
              {' · '}
              <span className="tnum">1 {money.code}</span> ≈{' '}
              <span className="tnum">{formatRate(money.rate)}</span> {homeCurrency}
            </>
          )}
        </p>
        {money.rate != null && (
          <SourceCredit href="https://www.frankfurter.app">
            Exchange rate · Frankfurter
          </SourceCredit>
        )}
      </div>
    </div>
  );
}

function EntryLine({
  countryCode,
  homeCountryName,
}: {
  countryCode?: string;
  homeCountryName?: string;
}) {
  const [destName, setDestName] = useState<string | null>(null);

  // entryReminder needs the destination country *name*; resolve it from the
  // stop's ISO code. (REST Countries' "flag" field is an emoji, not a name, so
  // we don't have a name there — fall back to the code so the note still reads.)
  useEffect(() => {
    setDestName(countryNameFor(countryCode) ?? countryCode ?? null);
  }, [countryCode]);

  if (!homeCountryName || !destName) return null;
  const isIsraeli = homeCountryName.trim().toLowerCase() === 'israel';
  const visa = isIsraeli ? visaFromIsrael(countryCode) : null;
  const note = entryReminder(homeCountryName, destName);
  if (!note && !visa) return null;

  return (
    <div className="flex items-start gap-sm">
      <ShieldAlert
        size={14}
        strokeWidth={2}
        className="mt-px shrink-0 text-charcoal-70"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-xs">
        {visa ? (
          <>
            <p className="text-small text-charcoal">
              <span className="meta-caps text-charcoal-70">Israeli passport</span> ·{' '}
              {visa}
            </p>
            <p className="text-meta text-charcoal-55">
              Guidance only · verify with {destName}'s official immigration site
              before booking.
            </p>
          </>
        ) : (
          note && <p className="text-small leading-relaxed text-charcoal">{note}</p>
        )}
      </div>
    </div>
  );
}

function formatHolidayDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatRate(rate: number): string {
  // Small rates (e.g. 0.27) want more precision than large ones (e.g. 1280).
  if (rate >= 100) return rate.toFixed(0);
  if (rate >= 1) return rate.toFixed(2);
  return rate.toFixed(3);
}
