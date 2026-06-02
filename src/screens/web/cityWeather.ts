export type WeatherCondition = 'sun' | 'partly-cloudy' | 'cloud' | 'rain';

export type WeatherDay = {
  isoDate: string;
  tempHighC: number;
  tempLowC: number;
  condition: WeatherCondition;
  precipPercent: number;
};

type CityBaseline = {
  tempHigh: number;
  tempLow: number;
  rainBias: number;
};

const CITY_BASELINE: Record<string, CityBaseline> = {
  buzios: { tempHigh: 27, tempLow: 20, rainBias: 0.2 },
  'sao-paulo': { tempHigh: 26, tempLow: 17, rainBias: 0.35 },
  jericoacoara: { tempHigh: 32, tempLow: 25, rainBias: 0.08 },
  'buenos-aires': { tempHigh: 25, tempLow: 16, rainBias: 0.3 },
  'punta-del-este': { tempHigh: 24, tempLow: 17, rainBias: 0.25 },
  'rio-de-janeiro': { tempHigh: 28, tempLow: 21, rainBias: 0.2 },
  'foz-do-iguacu': { tempHigh: 30, tempLow: 19, rainBias: 0.4 },
  mendoza: { tempHigh: 27, tempLow: 14, rainBias: 0.12 },
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function pickCondition(rand: number, rainBias: number): WeatherCondition {
  if (rand < rainBias) return 'rain';
  if (rand < rainBias + 0.2) return 'cloud';
  if (rand < rainBias + 0.55) return 'partly-cloudy';
  return 'sun';
}

export function cityWeatherRange(
  stopId: string,
  fromIso: string,
  toIso: string,
): WeatherDay[] {
  const baseline = CITY_BASELINE[stopId];
  if (!baseline) return [];
  const start = new Date(fromIso + 'T12:00:00');
  const end = new Date(toIso + 'T12:00:00');
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const out: WeatherDay[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    const seed = hashString(stopId + iso);
    const r1 = (seed & 0xffff) / 0xffff;
    const r2 = ((seed >> 16) & 0xff) / 0xff;
    const r3 = ((seed >> 24) & 0xff) / 0xff;
    const condition = pickCondition(r1, baseline.rainBias);
    const tempJitter = Math.round((r2 - 0.5) * 4);
    const tempHighC = baseline.tempHigh + tempJitter;
    const tempLowC = baseline.tempLow + Math.round((r3 - 0.5) * 3);
    const precipPercent =
      condition === 'rain'
        ? 60 + Math.round(r2 * 35)
        : condition === 'cloud'
          ? 30 + Math.round(r2 * 25)
          : condition === 'partly-cloudy'
            ? 10 + Math.round(r3 * 25)
            : Math.round(r3 * 10);
    out.push({
      isoDate: iso,
      tempHighC,
      tempLowC,
      condition,
      precipPercent,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
