import { useEffect, useState } from 'react';
import { Clock, Sun, Sunrise, Sunset, Wind } from 'lucide-react';
import { SourceCredit } from '../../components/SourceCredit';
import { fetchWeather, type WeatherSource } from './weatherApi';
import type { WeatherDay } from './cityWeather';
import { fetchSun, type SunTimes } from './sunApi';
import { fetchLocalTime, type LocalTime } from './timeApi';
import { aqiLabel, fetchAirQuality, type AirQuality } from './airQualityApi';

/**
 * LocalConditions — a calm "what's it like there" block for one planned stop.
 *
 * Bundles weather + sunrise/sunset + local time + air quality into a single,
 * quiet, skimmable sand panel. Designed to sit inside the "Before you fly" stop
 * card (one block per stop), under the stop's name/dates.
 *
 * Every line fetches independently and degrades gracefully: if a source returns
 * null / empty it simply omits its line — never a broken or empty state, never a
 * spinner wall. While the first fetches settle the panel shows a subtle sand
 * pulse; if nothing at all resolves, the whole block renders nothing.
 *
 * Sources (all keyless, CORS-open): Open-Meteo (weather + air quality),
 * sunrise-sunset.org, timeapi.io — credited together in one quiet line.
 */

type Props = {
  /** Destination latitude in decimal degrees. */
  lat: number;
  /** Destination longitude in decimal degrees. */
  lng: number;
  /** Arrival date, ISO `YYYY-MM-DD`. */
  arrivalDate: string;
  /** Departure date, ISO `YYYY-MM-DD`. */
  departureDate: string;
};

const ICON_SIZE = 14;
const ICON_STROKE = 1.75;

function isoNoon(iso: string): Date {
  return new Date(iso + 'T12:00:00');
}

function shiftIsoDays(iso: string, delta: number): string {
  const d = isoNoon(iso);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

/**
 * Format an ISO-8601 UTC instant as `HH:mm` in the destination's IANA zone.
 * Falls back to the viewer's local zone if the zone is unknown or invalid.
 */
function clockInZone(isoUtc: string, timeZone: string | null): string | null {
  const d = new Date(isoUtc);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...(timeZone ? { timeZone } : {}),
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  }
}

/** Human day length, e.g. `12h 28m` — omitted when not meaningful. */
function dayLengthLabel(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/** Whole-stay temperature span + the dominant sky, e.g. `typical 27°, mostly sunny`. */
function summarizeWeather(days: WeatherDay[]): string | null {
  if (days.length === 0) return null;
  const avgHigh = Math.round(
    days.reduce((sum, d) => sum + d.tempHighC, 0) / days.length,
  );
  const counts = days.reduce<Record<WeatherDay['condition'], number>>(
    (acc, d) => {
      acc[d.condition] = (acc[d.condition] ?? 0) + 1;
      return acc;
    },
    { sun: 0, 'partly-cloudy': 0, cloud: 0, rain: 0 },
  );
  const dominant = (Object.keys(counts) as WeatherDay['condition'][]).reduce(
    (best, key) => (counts[key] > counts[best] ? key : best),
    'sun',
  );
  const sky: Record<WeatherDay['condition'], string> = {
    sun: 'mostly sunny',
    'partly-cloudy': 'part cloud',
    cloud: 'mostly cloudy',
    rain: 'some rain',
  };
  return `typical ${avgHigh}°, ${sky[dominant]}`;
}

/** One calm row: a small charcoal icon + a skimmable line. */
function ConditionLine({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Sun;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-center gap-sm text-small text-charcoal-70">
      <Icon
        size={ICON_SIZE}
        strokeWidth={ICON_STROKE}
        className="shrink-0 text-charcoal-70"
        aria-hidden="true"
      />
      <span>
        <span className="text-charcoal-55">{label}</span>{' '}
        <span className="text-charcoal">{children}</span>
      </span>
    </p>
  );
}

export function LocalConditions({
  lat,
  lng,
  arrivalDate,
  departureDate,
}: Props) {
  // Weather window mirrors WeatherStrip: the stay padded by ±2 days.
  const fromIso = shiftIsoDays(arrivalDate, -2);
  const toIso = shiftIsoDays(departureDate, 2);
  // weatherApi keys its cache (and seasonal fallback) by a stop id; this block
  // only has coordinates, so derive a stable per-coordinate id.
  const coordId = `${lat.toFixed(3)},${lng.toFixed(3)}`;

  const [weather, setWeather] = useState<string | null>(null);
  const [weatherSource, setWeatherSource] = useState<WeatherSource | null>(null);
  const [sun, setSun] = useState<SunTimes | null>(null);
  const [time, setTime] = useState<LocalTime | null>(null);
  const [air, setAir] = useState<AirQuality | null>(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setWeather(null);
    setWeatherSource(null);
    setSun(null);
    setTime(null);
    setAir(null);
    setSettled(false);

    const tasks = [
      fetchWeather(coordId, lat, lng, fromIso, toIso).then((res) => {
        if (cancelled) return;
        setWeather(summarizeWeather(res.days));
        setWeatherSource(res.source);
      }),
      fetchSun(lat, lng, arrivalDate).then((res) => {
        if (!cancelled) setSun(res);
      }),
      fetchLocalTime(lat, lng).then((res) => {
        if (!cancelled) setTime(res);
      }),
      fetchAirQuality(lat, lng).then((res) => {
        if (!cancelled) setAir(res);
      }),
    ];

    Promise.allSettled(tasks).then(() => {
      if (!cancelled) setSettled(true);
    });

    return () => {
      cancelled = true;
    };
  }, [coordId, lat, lng, arrivalDate, fromIso, toIso]);

  // Sun times, shown in the destination's local zone when we have it.
  const zone = time?.timeZone ?? null;
  const sunriseLocal = sun ? clockInZone(sun.sunrise, zone) : null;
  const sunsetLocal = sun ? clockInZone(sun.sunset, zone) : null;
  const dayLength = sun ? dayLengthLabel(sun.dayLengthSec) : null;
  const hasSun = sunriseLocal != null && sunsetLocal != null;

  // Air quality: prefer the EU band label; show the AQI number when present.
  const airBand = air ? aqiLabel(air.euAqi) : null;
  const airAqi = air ? (air.euAqi ?? air.usAqi) : null;
  const hasAir = airBand != null || airAqi != null;

  const hasTime = time != null;
  // Weather summary is only meaningful with real data — the seasonal fallback
  // is omitted here (the full WeatherStrip already covers the estimate case).
  const hasWeather = weather != null && weatherSource != null && weatherSource !== 'fallback';

  const anyData = hasWeather || hasSun || hasTime || hasAir;

  // Loading: a subtle sand pulse, never a spinner. After everything settles
  // with nothing to show, render nothing at all.
  if (!settled && !anyData) {
    return (
      <div
        className="bg-shell border border-charcoal-15 rounded-2xl p-md animate-pulse"
        aria-hidden="true"
      >
        <div className="h-3 w-24 rounded-full bg-charcoal-08" />
        <div className="mt-sm h-3 w-40 rounded-full bg-charcoal-08" />
        <div className="mt-xs h-3 w-32 rounded-full bg-charcoal-08" />
      </div>
    );
  }
  if (!anyData) return null;

  return (
    <section
      aria-label="Local conditions"
      className="bg-shell border border-charcoal-15 rounded-2xl p-md flex flex-col gap-sm"
    >
      <p className="meta-caps text-charcoal-70">Local conditions</p>

      <div className="flex flex-col gap-xs">
        {hasWeather && (
          <ConditionLine icon={Sun} label="Weather">
            <span className="tnum">{weather}</span>
          </ConditionLine>
        )}

        {hasTime && (
          <ConditionLine icon={Clock} label="Local time">
            <span className="tnum">{time.time}</span>
            <span className="text-charcoal-55"> · {time.timeZone}</span>
          </ConditionLine>
        )}

        {hasSun && (
          <ConditionLine icon={Sunrise} label="Daylight">
            <span className="inline-flex items-center gap-xs">
              <span className="tnum">{sunriseLocal}</span>
              <Sunset
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                className="text-charcoal-70"
                aria-hidden="true"
              />
              <span className="tnum">{sunsetLocal}</span>
            </span>
            {dayLength && (
              <span className="text-charcoal-55">
                {' · '}
                <span className="tnum">{dayLength}</span> of light
              </span>
            )}
          </ConditionLine>
        )}

        {hasAir && (
          <ConditionLine icon={Wind} label="Air quality">
            {airBand ?? 'measured'}
            {airAqi != null && (
              <span className="text-charcoal-55">
                {' '}
                (AQI <span className="tnum">{Math.round(airAqi)}</span>)
              </span>
            )}
          </ConditionLine>
        )}
      </div>

      <SourceCredit>Conditions · Open-Meteo, sunrise-sunset, timeapi</SourceCredit>
    </section>
  );
}
