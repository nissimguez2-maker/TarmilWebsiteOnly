import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  BedDouble,
  Bookmark,
  Check,
  ChevronRight,
  Cloud,
  CloudRain,
  CloudSun,
  ExternalLink,
  Star,
  Sun,
  Users,
} from 'lucide-react';
import { Button } from '../../components/Button';
import { PlacementBadge } from '../../components/PlacementBadge';
import type { PlannedStop } from '../../data/plannedStops';
import type { FriendVisit, Place, PlaceCategory } from '../../data/places';
import { cityDescription, CITY_DESCRIPTIONS } from './cityCopy';
import { rewriteAsTravelIntro } from './groqApi';
import { cityPhotos } from './cityPhotos';
import type { WeatherCondition, WeatherDay } from './cityWeather';
import { fetchWeather, type WeatherSource } from './weatherApi';
import { formatStopRange } from './dateUtils';
import { fetchWikiSummary, type WikiSummary } from './wikiApi';
import { wikiTitleFor } from './cityWikiTitles';
import { fetchCountry, type CountryInfo } from './countryApi';
import { countryCodeFor } from './cityCountries';
import {
  fetchNearby,
  type OsmCategory,
  type OsmPlace,
} from './overpassApi';
import { openLightbox } from './WebPhotoLightbox';
import { openBookingSheet } from './WebBookingSheet';
import {
  addPlace,
  findPlace,
  removePlace,
  useWishlist,
} from './wishlist';
import { showToast } from './WebToast';

type Props = {
  stop: PlannedStop;
  places: Place[];
};

const RESERVABLE: PlaceCategory[] = [
  'hostel',
  'restaurant',
  'cafe',
  'bar',
  'club',
  'kosher',
];

function isReservable(category: PlaceCategory): boolean {
  return RESERVABLE.includes(category);
}

type TabId = 'overview' | 'stay' | 'eat' | 'drink' | 'see' | 'religious';

type SubFilter = { label: string; category: PlaceCategory | 'all' };

const TABS: { id: TabId; label: string; categories: PlaceCategory[] }[] = [
  { id: 'overview', label: 'Overview', categories: [] },
  { id: 'stay', label: 'Stay', categories: ['hostel'] },
  { id: 'eat', label: 'Eat', categories: ['restaurant', 'cafe'] },
  { id: 'drink', label: 'Drink', categories: ['bar', 'club'] },
  { id: 'see', label: 'See', categories: ['landmark', 'beach'] },
  {
    id: 'religious',
    label: 'Religious',
    categories: ['chabad', 'synagogue', 'mikveh', 'kosher'],
  },
];

const SUB_FILTERS: Record<TabId, SubFilter[]> = {
  overview: [],
  stay: [],
  eat: [
    { label: 'All', category: 'all' },
    { label: 'Restaurants', category: 'restaurant' },
    { label: 'Cafés', category: 'cafe' },
  ],
  drink: [
    { label: 'All', category: 'all' },
    { label: 'Bars', category: 'bar' },
    { label: 'Clubs', category: 'club' },
  ],
  see: [
    { label: 'All', category: 'all' },
    { label: 'Landmarks', category: 'landmark' },
    { label: 'Beaches', category: 'beach' },
  ],
  religious: [
    { label: 'All', category: 'all' },
    { label: 'Chabad', category: 'chabad' },
    { label: 'Synagogues', category: 'synagogue' },
    { label: 'Mikvaot', category: 'mikveh' },
    { label: 'Kosher', category: 'kosher' },
  ],
};

function tabOsmCategory(
  tabId: TabId,
  subFilter: PlaceCategory | 'all',
): OsmCategory | null {
  if (subFilter !== 'all') {
    if (
      subFilter === 'restaurant' ||
      subFilter === 'cafe' ||
      subFilter === 'bar' ||
      subFilter === 'club' ||
      subFilter === 'landmark' ||
      subFilter === 'beach'
    ) {
      return subFilter;
    }
    return null;
  }
  if (tabId === 'eat') return 'restaurant';
  if (tabId === 'drink') return 'bar';
  if (tabId === 'see') return 'landmark';
  return null;
}

export function WebCityPanel({ stop, places }: Props) {
  useWishlist();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activeSub, setActiveSub] = useState<PlaceCategory | 'all'>('all');

  useEffect(() => {
    setActiveTab('overview');
    setActiveSub('all');
  }, [stop.id]);

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;
  const subFilters = SUB_FILTERS[activeTab];

  return (
    <div className="flex flex-col h-full min-h-0">
      <CityHeader stop={stop} />
      <StayStrip stop={stop} />

      <nav className="shrink-0 px-md pt-sm border-b border-charcoal-15 flex flex-col gap-sm">
        <div className="flex gap-xs overflow-x-auto -mx-md px-md pb-xs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setActiveSub('all');
              }}
              className={clsx(
                'shrink-0 font-sans text-small px-sm py-xs rounded-full border transition-[background-color,border-color,color] duration-instant ease-out-quart motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                activeTab === tab.id
                  ? 'bg-charcoal text-cream border-charcoal'
                  : 'bg-charcoal-8 text-charcoal-70 border-transparent hover:bg-charcoal-15 hover:text-charcoal',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {subFilters.length > 0 && (
          <div className="flex gap-xs overflow-x-auto -mx-md px-md pb-sm">
            {subFilters.map((sub) => (
              <button
                key={sub.category}
                type="button"
                onClick={() => setActiveSub(sub.category)}
                className={clsx(
                  'shrink-0 text-meta uppercase px-sm py-xs rounded-full border transition-[background-color,border-color,color] duration-instant ease-out-quart motion-reduce:transition-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                  activeSub === sub.category
                    ? 'bg-amber text-cream border-amber'
                    : 'bg-charcoal-8 text-charcoal-70 border-transparent hover:text-amber',
                )}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="flex-1 overflow-y-auto p-md">
        {activeTab === 'overview' ? (
          <OverviewTab stop={stop} />
        ) : (
          <PlacesList
            places={filterAndSortPlaces(
              places,
              activeTabDef.categories,
              activeSub,
            )}
            emptyLabel={activeTabDef.label.toLowerCase()}
            osmCategory={tabOsmCategory(activeTab, activeSub)}
            stop={stop}
          />
        )}
      </div>
    </div>
  );
}

function flagEmoji(code: string): string {
  if (!code || code.length !== 2) return '';
  const A = 0x1f1e6;
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map((c) => A + c.charCodeAt(0) - 65),
  );
}

function CityHeader({ stop }: { stop: PlannedStop }) {
  const [country, setCountry] = useState<CountryInfo | null>(null);
  const code = countryCodeFor(stop.id);

  useEffect(() => {
    setCountry(null);
    if (!code) return;
    let cancelled = false;
    fetchCountry(code).then((c) => {
      if (!cancelled) setCountry(c);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const flag = country?.flag || flagEmoji(code ?? '');
  const meta = [
    country?.currencyCode,
    country?.language,
    country?.timezone ? `UTC${country.timezone}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <header className="shrink-0 px-md pt-md pb-sm border-b border-charcoal-15 flex flex-col gap-xs pe-12">
      <h2 className="font-serif text-sub text-charcoal leading-tight">
        {stop.nameEn}
      </h2>
      <p className="text-small text-charcoal-70">
        {formatStopRange(stop.arrivalDate, stop.departureDate)} ·{' '}
        {stop.nights} {stop.nights === 1 ? 'night' : 'nights'}
      </p>
      {(flag || meta) && (
        <p className="text-small text-charcoal-70 inline-flex items-center gap-xs">
          {flag && <span aria-hidden="true">{flag}</span>}
          {meta && <span className="tnum">{meta}</span>}
        </p>
      )}
    </header>
  );
}

/**
 * Per-stop accommodation hero — the set-apart monetizer. Pinned under the city
 * header (above the browse tabs) so every stop opens with a clear, calm "sort
 * your stay" step. Tapping opens the two-step booking sheet (Booking.com /
 * Airbnb / Hostelworld), prefilled with this stop's dates.
 */
function StayStrip({ stop }: { stop: PlannedStop }) {
  return (
    <div className="shrink-0 px-md pt-sm">
      <button
        type="button"
        onClick={() => openBookingSheet({ kind: 'stay', stop })}
        className="group w-full text-start flex items-center gap-sm rounded-2xl border border-charcoal-15 bg-sand ps-sm pe-sm py-sm shadow-card transition-[border-color,box-shadow,transform] duration-instant ease-out-quart motion-reduce:transition-none hover:-translate-y-px hover:shadow-panel hover:border-charcoal-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <span className="shrink-0 h-10 w-10 rounded-xl bg-cream border border-charcoal-15 flex items-center justify-center text-charcoal">
          <BedDouble size={18} strokeWidth={1.75} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-serif text-lede text-charcoal leading-tight">
            Where you're staying
          </span>
          <span className="block text-small text-charcoal-70">
            {stop.nights} {stop.nights === 1 ? 'night' : 'nights'} · find a
            place for your dates
          </span>
        </span>
        <span className="shrink-0 inline-flex items-center gap-xs rounded-full bg-charcoal text-cream text-small px-sm py-xs group-hover:bg-charcoal-70 transition-colors duration-instant ease-out-quart motion-reduce:transition-none">
          Find a stay
          <ChevronRight size={14} strokeWidth={2} />
        </span>
      </button>
    </div>
  );
}

function filterAndSortPlaces(
  places: Place[],
  tabCategories: PlaceCategory[],
  subFilter: PlaceCategory | 'all',
): Place[] {
  const inTab = places.filter((p) => tabCategories.includes(p.category));
  const filtered =
    subFilter === 'all' ? inTab : inTab.filter((p) => p.category === subFilter);
  return [...filtered].sort((a, b) => {
    const friendsDiff = b.friendsKnow - a.friendsKnow;
    if (friendsDiff !== 0) return friendsDiff;
    return b.rating - a.rating;
  });
}

function OverviewTab({ stop }: { stop: PlannedStop }) {
  const hardcodedText = cityDescription(stop.id);
  const hasHardcoded = stop.id in CITY_DESCRIPTIONS;
  const wikiTitle = wikiTitleFor(stop.id, stop.nameEn);
  const [wiki, setWiki] = useState<WikiSummary | null>(null);
  const [wikiLoading, setWikiLoading] = useState(!hasHardcoded);
  const [polished, setPolished] = useState<string | null>(null);

  useEffect(() => {
    setWiki(null);
    setPolished(null);
    if (hasHardcoded) {
      setWikiLoading(false);
      return;
    }
    setWikiLoading(true);
    let cancelled = false;
    fetchWikiSummary(wikiTitle).then(async (res) => {
      if (cancelled) return;
      setWiki(res);
      setWikiLoading(false);
      if (res?.extract) {
        const rewritten = await rewriteAsTravelIntro(stop.nameEn, res.extract);
        if (!cancelled && rewritten) setPolished(rewritten);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [hasHardcoded, wikiTitle, stop.nameEn]);

  const curatedPhotos = cityPhotos(stop.id);
  const heroPhoto = wiki?.originalImage ?? wiki?.thumbnail;
  const photos = useMemo(() => {
    if (curatedPhotos.length > 0) return curatedPhotos;
    return heroPhoto ? [heroPhoto] : [];
  }, [curatedPhotos, heroPhoto]);

  const description = hasHardcoded
    ? hardcodedText
    : (polished ?? wiki?.extract ?? stop.note ?? '');

  return (
    <div className="flex flex-col gap-md">
      {photos.length > 0 && (
        <PhotoGrid photos={photos} cityName={stop.nameEn} />
      )}
      {wikiLoading && !description && (
        <div className="h-16 rounded-2xl bg-sand animate-pulse" />
      )}
      {description && (
        <div className="flex flex-col gap-xs">
          <p className="font-sans text-body text-charcoal leading-relaxed">
            {description}
          </p>
        </div>
      )}
      <WeatherStrip stop={stop} />
    </div>
  );
}

function PhotoGrid({
  photos,
  cityName,
}: {
  photos: string[];
  cityName: string;
}) {
  const cols = Math.min(photos.length, 3);
  return (
    <div
      className={clsx(
        'grid gap-sm',
        cols === 3 && 'grid-cols-3',
        cols === 2 && 'grid-cols-2',
        cols === 1 && 'grid-cols-1',
      )}
    >
      {photos.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => openLightbox(photos, i, cityName)}
          aria-label={`Open ${cityName} photo ${i + 1}`}
          className={clsx(
            'relative rounded-xl overflow-hidden bg-gradient-to-br from-clay to-sand transition-[transform] duration-instant ease-out-quart motion-reduce:transition-none hover:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
            cols === 1 ? 'aspect-video' : 'aspect-square',
          )}
        >
          <img
            src={src}
            alt={`${cityName} photo ${i + 1}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}

function weatherIcon(condition: WeatherCondition) {
  if (condition === 'sun') return Sun;
  if (condition === 'partly-cloudy') return CloudSun;
  if (condition === 'rain') return CloudRain;
  return Cloud;
}

function WeatherStrip({ stop }: { stop: PlannedStop }) {
  const arrivalDate = new Date(stop.arrivalDate + 'T12:00:00');
  const departureDate = new Date(stop.departureDate + 'T12:00:00');
  const from = new Date(arrivalDate);
  from.setDate(from.getDate() - 2);
  const to = new Date(departureDate);
  to.setDate(to.getDate() + 2);
  const fromIso = from.toISOString().slice(0, 10);
  const toIso = to.toISOString().slice(0, 10);

  const [days, setDays] = useState<WeatherDay[]>([]);
  const [source, setSource] = useState<WeatherSource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWeather(stop.id, stop.lat, stop.lng, fromIso, toIso).then((res) => {
      if (cancelled) return;
      setDays(res.days);
      setSource(res.source);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [stop.id, stop.lat, stop.lng, fromIso, toIso]);

  if (loading) {
    return (
      <div className="bg-sand border border-charcoal-15 rounded-2xl p-md min-h-[120px] flex items-center justify-center">
        <p className="text-small text-charcoal-70 italic">Loading forecast…</p>
      </div>
    );
  }
  if (days.length === 0) return null;

  const arrival = arrivalDate.getTime();
  const departure = departureDate.getTime();

  return (
    <div className="bg-sand border border-charcoal-15 rounded-2xl p-md flex flex-col gap-sm">
      <div className="flex items-center justify-between">
        <p className="meta-caps text-charcoal-70">Forecast</p>
        <p className="text-meta italic text-charcoal-70">
          ± 2 days · trip days highlighted
        </p>
      </div>
      <div className="flex gap-xs overflow-x-auto -mx-md px-md pb-xs">
        {days.map((day) => {
          const ts = new Date(day.isoDate + 'T12:00:00').getTime();
          const inTrip = ts >= arrival && ts <= departure;
          return (
            <WeatherDayCard
              key={day.isoDate}
              day={day}
              highlighted={inTrip}
            />
          );
        })}
      </div>
      <p className="text-meta italic text-charcoal-70 text-center">
        {sourceLabel(source)}
      </p>
    </div>
  );
}

function sourceLabel(source: WeatherSource | null): string {
  if (source === 'forecast') return 'Updated today';
  if (source === 'archive') return 'Historical pattern';
  if (source === 'archive-shifted') return 'Seasonal average';
  return 'Seasonal estimate';
}

function WeatherDayCard({
  day,
  highlighted,
}: {
  day: WeatherDay;
  highlighted: boolean;
}) {
  const Icon = weatherIcon(day.condition);
  const date = new Date(day.isoDate + 'T12:00:00');
  const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dateNum = date.getDate();
  return (
    <div
      className={clsx(
        'shrink-0 w-14 flex flex-col items-center gap-xs rounded-xl py-sm border transition-colors',
        highlighted
          ? 'bg-cream border-amber shadow-card'
          : 'bg-linen/60 border-transparent',
      )}
    >
      <p
        className={clsx(
          'text-meta uppercase tracking-wider',
          highlighted ? 'text-amber' : 'text-charcoal-70',
        )}
      >
        {dayLabel}
      </p>
      <p
        className={clsx(
          'text-small font-serif tnum',
          highlighted ? 'text-charcoal' : 'text-charcoal-70',
        )}
      >
        {dateNum}
      </p>
      <Icon
        size={20}
        strokeWidth={1.5}
        className={highlighted ? 'text-charcoal-70' : 'text-charcoal-55'}
      />
      <div className="flex flex-col items-center leading-none">
        <p
          className={clsx(
            'text-small font-serif tnum',
            highlighted ? 'text-charcoal' : 'text-charcoal-70',
          )}
        >
          {day.tempHighC}°
        </p>
        <p className="text-meta tnum text-charcoal-70">{day.tempLowC}°</p>
      </div>
    </div>
  );
}

function PlacesList({
  places,
  emptyLabel,
  osmCategory,
  stop,
}: {
  places: Place[];
  emptyLabel: string;
  osmCategory: OsmCategory | null;
  stop: PlannedStop;
}) {
  return (
    <div className="flex flex-col gap-md">
      {places.length > 0 ? (
        <div className="flex flex-col gap-sm">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} stop={stop} />
          ))}
        </div>
      ) : (
        !osmCategory && (
          <div className="bg-sand border border-charcoal-15 rounded-2xl p-md text-center">
            <p className="font-serif text-lede text-charcoal">
              Tarmil curators are working on this one
            </p>
            <p className="text-small text-charcoal-70 mt-xs">
              New {emptyLabel} places will land here soon.
            </p>
          </div>
        )
      )}
      {osmCategory && (
        <NearbyOsmList
          key={`${stop.id}-${osmCategory}`}
          category={osmCategory}
          lat={stop.lat}
          lng={stop.lng}
          curatedCount={places.length}
        />
      )}
    </div>
  );
}

function NearbyOsmList({
  category,
  lat,
  lng,
  curatedCount,
}: {
  category: OsmCategory;
  lat: number;
  lng: number;
  curatedCount: number;
}) {
  const [items, setItems] = useState<OsmPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    fetchNearby(category, lat, lng).then((r) => {
      if (cancelled) return;
      setItems(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [category, lat, lng]);

  if (loading) {
    return (
      <div className="flex flex-col gap-sm">
        <p className="meta-caps text-charcoal-70">Nearby</p>
        <div className="h-10 rounded-xl bg-sand animate-pulse" />
        <div className="h-10 rounded-xl bg-sand animate-pulse" />
      </div>
    );
  }
  if (items.length === 0) {
    if (curatedCount === 0) {
      return (
        <p className="text-small text-charcoal-70 text-center py-xl">
          No nearby spots indexed for this area yet.
        </p>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-sm">
      <p className="meta-caps text-charcoal-70">Nearby</p>
      {items.map((item) => (
        <NearbyOsmRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function NearbyOsmRow({ item }: { item: OsmPlace }) {
  const link = `https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}&zoom=18`;
  const distance =
    item.distanceMeters < 1000
      ? `${item.distanceMeters} m`
      : `${(item.distanceMeters / 1000).toFixed(1)} km`;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener"
      className="group flex items-center gap-sm rounded-xl border border-charcoal-15 bg-cream px-sm py-xs hover:border-amber transition-[border-color] duration-instant ease-out-quart motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      <div className="flex-1 min-w-0">
        <p className="font-sans text-body text-charcoal truncate">{item.name}</p>
        <p className="text-meta uppercase text-charcoal-70">
          {distance}
          {item.cuisine && <> · {item.cuisine.replace(/_/g, ' ')}</>}
        </p>
      </div>
      <ExternalLink
        size={12}
        strokeWidth={2}
        className="shrink-0 text-charcoal-70 group-hover:text-amber"
      />
    </a>
  );
}

function PlaceCard({
  place,
  stop,
}: {
  place: Place;
  stop: PlannedStop;
}) {
  const existing = findPlace(stop.id, place.id);
  const status = existing?.status ?? null;
  const reservable = isReservable(place.category);

  const onSave = () => {
    if (status === 'saved') {
      removePlace(stop.id, place.id);
      showToast(`${place.englishName} removed`, () => {
        addPlace({
          stopId: stop.id,
          placeId: place.id,
          placeName: place.englishName,
          category: place.category,
          status: 'saved',
        });
      });
      return;
    }
    addPlace({
      stopId: stop.id,
      placeId: place.id,
      placeName: place.englishName,
      category: place.category,
      status: 'saved',
    });
    showToast(`${place.englishName} saved to ${stop.nameEn}`, () => {
      removePlace(stop.id, place.id);
    });
  };

  const onReserve = () => {
    if (status === 'reserved') {
      removePlace(stop.id, place.id);
      showToast(`${place.englishName} removed`, () => {
        addPlace({
          stopId: stop.id,
          placeId: place.id,
          placeName: place.englishName,
          category: place.category,
          status: 'reserved',
        });
      });
      return;
    }
    addPlace({
      stopId: stop.id,
      placeId: place.id,
      placeName: place.englishName,
      category: place.category,
      status: 'reserved',
    });
    showToast(`${place.englishName} reserved for ${stop.nameEn}`, () => {
      removePlace(stop.id, place.id);
    });
  };

  return (
    <article className="bg-cream rounded-2xl p-sm flex flex-col gap-sm shadow-card ring-1 ring-charcoal-08 transition-[transform,box-shadow] duration-instant ease-out-quart motion-reduce:transition-none hover:shadow-fab hover:-translate-y-px">
      <div className="flex gap-sm">
        <PlaceThumbnail src={place.imageUrl} name={place.englishName} />
        <div className="flex-1 min-w-0 flex flex-col gap-xs">
          <h4 className="font-serif text-lede text-charcoal leading-tight">
            {place.englishName}
          </h4>
          <div className="flex items-center gap-sm flex-wrap">
            <span className="inline-flex items-center gap-xs text-small text-amber">
              <Star size={12} strokeWidth={2} fill="currentColor" />
              {place.rating.toFixed(1)}
            </span>
            {place.friendsKnow > 0 && (
              <FriendCluster
                count={place.friendsKnow}
                visits={place.friendVisits}
              />
            )}
            <span className="text-meta uppercase text-charcoal-70">
              {place.category}
            </span>
            <PlacementBadge tier={place.placementTier} />
          </div>
        </div>
      </div>
      <DescriptionWithMore text={place.englishDescription} />
      <div className="flex justify-end gap-sm">
        <Button variant="ghost" size="sm" onClick={onSave}>
          {status === 'saved' ? (
            <>
              <Check size={12} strokeWidth={2} className="text-sea" />
              Saved
            </>
          ) : (
            <>
              <Bookmark size={12} strokeWidth={2} />
              Save
            </>
          )}
        </Button>
        {reservable && (
          <Button variant="sea" size="sm" onClick={onReserve}>
            {status === 'reserved' ? (
              <>
                <Check size={12} strokeWidth={2} />
                Reserved
              </>
            ) : (
              'Reserve'
            )}
          </Button>
        )}
      </div>
    </article>
  );
}

function FriendCluster({
  count,
  visits,
}: {
  count: number;
  visits?: FriendVisit[];
}) {
  const initials = (visits ?? []).slice(0, 3);
  return (
    <span className="inline-flex items-center gap-xs text-small text-charcoal-70">
      {initials.length > 0 ? (
        <span className="flex items-center -space-x-2">
          {initials.map((v, i) => (
            <span
              key={`${v.friendInitial}-${i}`}
              aria-hidden="true"
              className="h-5 w-5 rounded-full bg-charcoal text-cream text-meta font-medium flex items-center justify-center border border-cream"
              title={v.friendName}
            >
              {v.friendInitial}
            </span>
          ))}
        </span>
      ) : (
        <Users size={12} strokeWidth={2} />
      )}
      {count}
    </span>
  );
}

function PlaceThumbnail({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-16 w-16 rounded-xl object-cover shrink-0"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="h-16 w-16 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-clay to-sand text-charcoal-70 font-serif text-sub"
    >
      {name.charAt(0)}
    </div>
  );
}

function DescriptionWithMore({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const long = text.length > 110;
  return (
    <div className="text-small text-charcoal-70">
      <p className={expanded || !long ? '' : 'line-clamp-2'}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-meta uppercase text-umber mt-xs hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      )}
    </div>
  );
}
