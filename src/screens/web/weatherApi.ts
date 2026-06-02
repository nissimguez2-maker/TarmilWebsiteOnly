import { cityWeatherRange, type WeatherCondition, type WeatherDay } from './cityWeather';

export type WeatherSource = 'forecast' | 'archive-shifted' | 'archive' | 'fallback';

export type WeatherResult = {
  days: WeatherDay[];
  source: WeatherSource;
};

const FORECAST_HORIZON_DAYS = 14;

function mapWmoCode(code: number): WeatherCondition {
  if (code === 0 || code === 1) return 'sun';
  if (code === 2) return 'partly-cloudy';
  if (code === 3 || code === 45 || code === 48) return 'cloud';
  return 'rain';
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseIsoNoon(iso: string): Date {
  return new Date(iso + 'T12:00:00');
}

function shiftIsoYear(iso: string, deltaYears: number): string {
  const d = parseIsoNoon(iso);
  d.setFullYear(d.getFullYear() + deltaYears);
  return d.toISOString().slice(0, 10);
}

type Plan =
  | { kind: 'forecast'; from: string; to: string }
  | { kind: 'archive'; from: string; to: string; yearOffset: number };

function planFetch(fromIso: string, toIso: string): Plan {
  const today = parseIsoNoon(isoToday());
  const maxForecast = parseIsoNoon(isoToday());
  maxForecast.setDate(maxForecast.getDate() + FORECAST_HORIZON_DAYS);

  const fromDate = parseIsoNoon(fromIso);
  const toDate = parseIsoNoon(toIso);

  if (toDate < today) {
    return { kind: 'archive', from: fromIso, to: toIso, yearOffset: 0 };
  }
  if (fromDate >= today && toDate <= maxForecast) {
    return { kind: 'forecast', from: fromIso, to: toIso };
  }
  const targetYear = today.getFullYear() - 1;
  const yearOffset = targetYear - fromDate.getFullYear();
  return {
    kind: 'archive',
    from: shiftIsoYear(fromIso, yearOffset),
    to: shiftIsoYear(toIso, yearOffset),
    yearOffset,
  };
}

const cache = new Map<string, Promise<WeatherResult>>();

export function fetchWeather(
  stopId: string,
  lat: number,
  lng: number,
  fromIso: string,
  toIso: string,
): Promise<WeatherResult> {
  const key = `${lat}|${lng}|${fromIso}|${toIso}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const promise = doFetch(stopId, lat, lng, fromIso, toIso);
  cache.set(key, promise);
  promise.catch(() => cache.delete(key));
  return promise;
}

async function doFetch(
  stopId: string,
  lat: number,
  lng: number,
  fromIso: string,
  toIso: string,
): Promise<WeatherResult> {
  const plan = planFetch(fromIso, toIso);
  const base =
    plan.kind === 'forecast'
      ? 'https://api.open-meteo.com/v1/forecast'
      : 'https://archive-api.open-meteo.com/v1/archive';
  const dailyParams =
    plan.kind === 'forecast'
      ? 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max'
      : 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_hours';
  const url = `${base}?latitude=${lat}&longitude=${lng}&daily=${dailyParams}&timezone=auto&start_date=${plan.from}&end_date=${plan.to}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather fetch ${res.status}`);
    const data = await res.json();
    if (
      !data ||
      !data.daily ||
      !Array.isArray(data.daily.time) ||
      data.daily.time.length === 0
    ) {
      throw new Error('Empty weather payload');
    }

    const yearOffset = plan.kind === 'archive' ? plan.yearOffset : 0;
    const days: WeatherDay[] = data.daily.time.map((iso: string, i: number) => {
      const projectedIso =
        yearOffset !== 0 ? shiftIsoYear(iso, -yearOffset) : iso;
      const high = Math.round(data.daily.temperature_2m_max[i]);
      const low = Math.round(data.daily.temperature_2m_min[i]);
      const code = data.daily.weather_code[i];
      let precipPercent = 0;
      if (
        plan.kind === 'forecast' &&
        Array.isArray(data.daily.precipitation_probability_max)
      ) {
        precipPercent = data.daily.precipitation_probability_max[i] ?? 0;
      } else if (Array.isArray(data.daily.precipitation_hours)) {
        precipPercent = Math.min(
          100,
          Math.round((data.daily.precipitation_hours[i] ?? 0) * 5),
        );
      }
      return {
        isoDate: projectedIso,
        tempHighC: high,
        tempLowC: low,
        condition: mapWmoCode(code),
        precipPercent,
      };
    });

    const source: WeatherSource =
      plan.kind === 'forecast'
        ? 'forecast'
        : plan.yearOffset === 0
          ? 'archive'
          : 'archive-shifted';
    return { days, source };
  } catch (err) {
    return {
      days: cityWeatherRange(stopId, fromIso, toIso),
      source: 'fallback',
    };
  }
}
