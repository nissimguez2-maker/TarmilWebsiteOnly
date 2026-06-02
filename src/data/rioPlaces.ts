/**
 * Rio de Janeiro places — curated set for the investor demo.
 *
 * SEED ONLY. Runtime data is read from the `places` table in Supabase. This
 * array feeds `scripts/seed-supabase.ts`; nothing in `src/` imports it at
 * runtime. Edit here, re-run the seed (or edit via the dashboard).
 *
 * Copy in the natural voice of a 22-year-old post-army backpacker
 * (sentence cap ~14 words). Coordinates verified against Google Maps.
 */

import type { Place } from './places';

export const rioPlaces: Place[] = [
  // ─── Beaches ──────────────────────────────────────────────────────────
  {
    id: 'copa-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Copacabana Beach',
    englishName: 'Copacabana Beach',
    category: 'beach',
    lat: -22.9711779,
    lng: -43.1825439,
    hebrewDescription: 'Huge beach with stalls, football games and nonstop life on the promenade.',
    englishDescription:
      'Huge beach with stalls, football games and nonstop life on the promenade.',
    rating: 4.7,
    friendsKnow: 12,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'M', friendName: 'Maya Levi', season: 'summer', year: 2024, durationLabel: 'a week' },
      { friendInitial: 'Y', friendName: 'Yael Abraham', season: 'winter', year: 2025, durationLabel: 'two weeks' },
    ],
  },
  {
    id: 'ipanema-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Ipanema Beach',
    englishName: 'Ipanema Beach',
    category: 'beach',
    lat: -22.9868585,
    lng: -43.2059651,
    hebrewDescription:
      'Slightly calmer, cleaner beach with crazy sunsets and a slightly wilder sea.',
    englishDescription:
      'Slightly calmer, cleaner beach with crazy sunsets and a slightly wilder sea.',
    rating: 4.8,
    friendsKnow: 11,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'R', friendName: 'Roi Ben Ami', season: 'autumn', year: 2025, durationLabel: 'a weekend' },
      { friendInitial: 'S', friendName: 'Shir Cohen', season: 'summer', year: 2024, durationLabel: 'a week' },
      { friendInitial: 'D', friendName: 'Daniel Shemesh', season: 'spring', year: 2025, durationLabel: 'a week' },
    ],
  },
  {
    id: 'leblon-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Leblon Beach',
    englishName: 'Leblon Beach',
    category: 'beach',
    lat: -22.9876212,
    lng: -43.2195852,
    hebrewDescription:
      'More upscale and quiet, feels like a north Tel Aviv neighborhood on the sea.',
    englishDescription:
      'More upscale and quiet, feels like a north Tel Aviv neighborhood on the sea.',
    rating: 4.5,
    friendsKnow: 6,
  },
  {
    id: 'barra-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Barra da Tijuca Beach',
    englishName: 'Barra da Tijuca Beach',
    category: 'beach',
    lat: -23.012043,
    lng: -43.365414,
    hebrewDescription:
      'Endless stretch of sand with good surf waves, feels less touristy.',
    englishDescription:
      'Endless stretch of sand with good surf waves, feels less touristy.',
    rating: 4.4,
    friendsKnow: 4,
  },
  {
    id: 'praia-vermelha',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Praia Vermelha',
    englishName: 'Praia Vermelha',
    category: 'beach',
    lat: -22.9531023,
    lng: -43.1663914,
    hebrewDescription:
      'Small beach under Sugarloaf with calm water, perfect chill escape from the crowds.',
    englishDescription:
      'Small beach under Sugarloaf with calm water, perfect chill escape from the crowds.',
    rating: 4.5,
    friendsKnow: 3,
  },
  {
    id: 'arpoador-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Arpoador Beach',
    englishName: 'Arpoador Beach',
    category: 'beach',
    lat: -22.9884128,
    lng: -43.2006988,
    hebrewDescription:
      "Strongest sunset spot, everyone claps when the sun disappears.",
    englishDescription:
      "Strongest sunset spot, everyone claps when the sun disappears.",
    rating: 4.8,
    friendsKnow: 9,
    tarmilPick: true,
  },
  {
    id: 'botafogo-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Botafogo Beach',
    englishName: 'Botafogo Beach',
    category: 'beach',
    lat: -22.9448788,
    lng: -43.1828477,
    hebrewDescription:
      'Not for swimming but insane bay and Sugarloaf views for Instagram shots.',
    englishDescription:
      'Not for swimming but insane bay and Sugarloaf views for Instagram shots.',
    rating: 4.3,
    friendsKnow: 5,
  },
  {
    id: 'flamengo-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Praia do Flamengo',
    englishName: 'Praia do Flamengo',
    category: 'beach',
    lat: -22.9369924,
    lng: -43.1706352,
    hebrewDescription:
      'Huge park by the beach with locals barbecuing, great for a morning run.',
    englishDescription:
      'Huge park by the beach with locals barbecuing, great for a morning run.',
    rating: 4.4,
    friendsKnow: 4,
  },
  {
    id: 'grumari-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Praia de Grumari',
    englishName: 'Praia de Grumari',
    category: 'beach',
    lat: -23.0470477,
    lng: -43.5264265,
    hebrewDescription:
      'Nature reserve with wild beach, feels like Brazil before Instagram.',
    englishDescription:
      'Nature reserve with wild beach, feels like Brazil before Instagram.',
    rating: 4.7,
    friendsKnow: 2,
    tarmilPick: true,
  },
  {
    id: 'joatinga-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Praia da Joatinga',
    englishName: 'Praia da Joatinga',
    category: 'beach',
    lat: -23.0103152,
    lng: -43.2968764,
    hebrewDescription:
      'Hidden between cliffs, small beach that feels secret even though everyone knows it.',
    englishDescription:
      'Hidden between cliffs, small beach that feels secret even though everyone knows it.',
    rating: 4.5,
    friendsKnow: 3,
  },
  {
    id: 'niteroi-icarai',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Praia de Icaraí',
    englishName: 'Praia de Icaraí',
    category: 'beach',
    lat: -22.9077803,
    lng: -43.1116486,
    hebrewDescription:
      'City beach in Niterói with great views of Rio from across the bay.',
    englishDescription:
      'City beach in Niterói with great views of Rio from across the bay.',
    rating: 4.2,
    friendsKnow: 2,
  },
  {
    id: 'buzios-geriba-beach',
    destinationId: 'buzios',
    hebrewName: 'Praia de Geribá',
    englishName: 'Praia de Geribá',
    category: 'beach',
    lat: -22.7691753,
    lng: -41.9485308,
    hebrewDescription:
      'Youthful Búzios beach with waves, music and all-day party vibes.',
    englishDescription:
      'Youthful Búzios beach with waves, music and all-day party vibes.',
    rating: 4.7,
    friendsKnow: 5,
    tarmilPick: true,
  },

  // ─── Hostels ──────────────────────────────────────────────────────────
  {
    id: 'discovery-hostel',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Discovery Hostel',
    englishName: 'Discovery Hostel',
    category: 'hostel',
    lat: -22.9192053,
    lng: -43.177984,
    hebrewDescription:
      'Homey hostel in Glória packed with Israelis on a budget and WhatsApp trip groups.',
    englishDescription:
      'Homey hostel in Glória packed with Israelis on a budget and WhatsApp trip groups.',
    rating: 4.6,
    friendsKnow: 14,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'D', friendName: 'Daniel Shemesh', season: 'autumn', year: 2024, durationLabel: 'two weeks' },
      { friendInitial: 'M', friendName: 'Maya Levi', season: 'summer', year: 2024, durationLabel: 'a week' },
    ],
  },
  {
    id: 'lemix-hostel',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Lemix Hostel',
    englishName: 'Lemix Hostel',
    category: 'hostel',
    lat: -22.9789846,
    lng: -43.189884,
    hebrewDescription:
      'Small Ipanema hostel a minute from the beach, lobby full of army stories.',
    englishDescription:
      'Small Ipanema hostel a minute from the beach, lobby full of army stories.',
    rating: 4.5,
    friendsKnow: 8,
  },
  {
    id: 'cabana-copa',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'CabanaCopa Hostel',
    englishName: 'CabanaCopa Hostel',
    category: 'hostel',
    lat: -22.9675353,
    lng: -43.181306,
    hebrewDescription:
      'Classic Copacabana hostel with big kitchen and someone always knows another good trek.',
    englishDescription:
      'Classic Copacabana hostel with big kitchen and someone always knows another good trek.',
    rating: 4.5,
    friendsKnow: 11,
    tarmilPick: true,
  },
  {
    id: 'leblon-beach-hostel',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Leblon Beach Hostel',
    englishName: 'Leblon Beach Hostel',
    category: 'hostel',
    lat: -22.9857573,
    lng: -43.2262613,
    hebrewDescription:
      'More pampered area, feels safe, perfect for a soft landing in Rio.',
    englishDescription:
      'More pampered area, feels safe, perfect for a soft landing in Rio.',
    rating: 4.4,
    friendsKnow: 4,
  },
  {
    id: 'mojo-hostel',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Mojo Hostel & Lounge',
    englishName: 'Mojo Hostel & Lounge',
    category: 'hostel',
    lat: -22.9822157,
    lng: -43.1984707,
    hebrewDescription:
      'Social Ipanema hostel with downstairs bar where Israelis team up for nights out.',
    englishDescription:
      'Social Ipanema hostel with downstairs bar where Israelis team up for nights out.',
    rating: 4.4,
    friendsKnow: 7,
  },
  {
    id: 'walk-on-beach',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Walk On The Beach Hostel',
    englishName: 'Walk On The Beach Hostel',
    category: 'hostel',
    lat: -22.9696407,
    lng: -43.1829379,
    hebrewDescription:
      'Simple but lively hostel near the sea, solid base before longer trips.',
    englishDescription:
      'Simple but lively hostel near the sea, solid base before longer trips.',
    rating: 4.3,
    friendsKnow: 6,
  },

  // ─── Cafés ────────────────────────────────────────────────────────────
  {
    id: 'confeitaria-colombo',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Confeitaria Colombo',
    englishName: 'Confeitaria Colombo',
    category: 'cafe',
    lat: -22.9056931,
    lng: -43.1794736,
    hebrewDescription:
      'Old-school downtown cafe, feels like time travel while you smash cake.',
    englishDescription:
      'Old-school downtown cafe, feels like time travel while you smash cake.',
    rating: 4.7,
    friendsKnow: 7,
    tarmilPick: true,
  },
  {
    id: 'cafe-seu-jorge',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Café do Seu Jorge Santa Teresa',
    englishName: 'Café do Seu Jorge Santa Teresa',
    category: 'cafe',
    lat: -22.9206463,
    lng: -43.1894906,
    hebrewDescription:
      'Tiny Santa Teresa cafe with green views, perfect for journaling backpack drama.',
    englishDescription:
      'Tiny Santa Teresa cafe with green views, perfect for journaling backpack drama.',
    rating: 4.6,
    friendsKnow: 4,
  },
  {
    id: 'curto-cafe',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Curto Café',
    englishName: 'Curto Café',
    category: 'cafe',
    lat: -22.9096614,
    lng: -43.1917843,
    hebrewDescription:
      'Cool pay-what-you-want spot where you decide how much your espresso costs.',
    englishDescription:
      'Cool pay-what-you-want spot where you decide how much your espresso costs.',
    rating: 4.5,
    friendsKnow: 3,
    tarmilPick: true,
  },
  {
    id: 'cafe-seleto-lapa',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Café Seleto Lapa',
    englishName: 'Café Seleto Lapa',
    category: 'cafe',
    lat: -22.9124491,
    lng: -43.178564,
    hebrewDescription:
      'Pre or post party coffee stop in Lapa full of backpackers from everywhere.',
    englishDescription:
      'Pre or post party coffee stop in Lapa full of backpackers from everywhere.',
    rating: 4.3,
    friendsKnow: 5,
  },
  {
    id: 'brooklyn-cafe',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Brooklyn Café',
    englishName: 'Brooklyn Café',
    category: 'cafe',
    lat: -22.9828879,
    lng: -43.1941013,
    hebrewDescription:
      'Neighborhood Ipanema cafe with New York vibe and solid wifi for planning routes.',
    englishDescription:
      'Neighborhood Ipanema cafe with New York vibe and solid wifi for planning routes.',
    rating: 4.5,
    friendsKnow: 4,
  },
  {
    id: 'bibi-sucos',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Bibi Sucos Copacabana',
    englishName: 'Bibi Sucos Copacabana',
    category: 'cafe',
    lat: -22.9680897,
    lng: -43.1808652,
    hebrewDescription:
      'Natural juices, açaí and sandwiches, quick fix after the beach hunger hits.',
    englishDescription:
      'Natural juices, açaí and sandwiches, quick fix after the beach hunger hits.',
    rating: 4.5,
    friendsKnow: 9,
  },

  // ─── Restaurants ──────────────────────────────────────────────────────
  {
    id: 'cafe-lamas',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Café Lamas',
    englishName: 'Café Lamas',
    category: 'restaurant',
    lat: -22.9317031,
    lng: -43.1819892,
    hebrewDescription:
      'Classic Brazilian joint where Israelis try feijoada and end up debating politics.',
    englishDescription:
      'Classic Brazilian joint where Israelis try feijoada and end up debating politics.',
    rating: 4.5,
    friendsKnow: 4,
  },
  {
    id: 'boteco-belmonte',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Boteco Belmonte Flamengo',
    englishName: 'Boteco Belmonte Flamengo',
    category: 'restaurant',
    lat: -22.9364568,
    lng: -43.1769614,
    hebrewDescription:
      'Brazilian bar restaurant with cold beers and pastéis where Israelis linger for hours.',
    englishDescription:
      'Brazilian bar restaurant with cold beers and pastéis where Israelis linger for hours.',
    rating: 4.4,
    friendsKnow: 6,
  },

  // ─── Bars ─────────────────────────────────────────────────────────────
  {
    id: 'sindicato-chopp',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Sindicato do Chopp Ipanema',
    englishName: 'Sindicato do Chopp Ipanema',
    category: 'bar',
    lat: -22.9834044,
    lng: -43.2055577,
    hebrewDescription:
      "Classic draft beer bar with occasional live music, good place to kick off the night.",
    englishDescription:
      "Classic draft beer bar with occasional live music, good place to kick off the night.",
    rating: 4.3,
    friendsKnow: 5,
  },
  {
    id: 'bar-astor-ipanema',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Bar Astor Ipanema',
    englishName: 'Bar Astor Ipanema',
    category: 'bar',
    lat: -22.9853562,
    lng: -43.2046247,
    hebrewDescription:
      'Beachfront bar with sunset views, cocktails pricey but the vibe pays for it.',
    englishDescription:
      'Beachfront bar with sunset views, cocktails pricey but the vibe pays for it.',
    rating: 4.4,
    friendsKnow: 6,
  },
  {
    id: 'lapa-steps-bar',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Bar da Boa Lapa',
    englishName: 'Bar da Boa Lapa',
    category: 'bar',
    lat: -22.9133971,
    lng: -43.1787404,
    hebrewDescription:
      'Classic warmup spot before the street parties with music, beers and random foreigners.',
    englishDescription:
      'Classic warmup spot before the street parties with music, beers and random foreigners.',
    rating: 4.3,
    friendsKnow: 7,
  },
  {
    id: 'leviano-bar',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Leviano Bar',
    englishName: 'Leviano Bar',
    category: 'bar',
    lat: -22.9123283,
    lng: -43.1784319,
    hebrewDescription:
      'Lapa bar with live bands and samba, easy place to meet people and dancers.',
    englishDescription:
      'Lapa bar with live bands and samba, easy place to meet people and dancers.',
    rating: 4.5,
    friendsKnow: 8,
  },
  {
    id: 'mureta-urca',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Mureta da Urca',
    englishName: 'Mureta da Urca',
    category: 'bar',
    lat: -22.9512391,
    lng: -43.1686204,
    hebrewDescription:
      'Sit on the wall with kiosk beer and perfect bay sunset views.',
    englishDescription:
      'Sit on the wall with kiosk beer and perfect bay sunset views.',
    rating: 4.7,
    friendsKnow: 6,
    tarmilPick: true,
  },
  {
    id: 'canastra-bar',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Canastra Bar',
    englishName: 'Canastra Bar',
    category: 'bar',
    lat: -22.9841219,
    lng: -43.2051636,
    hebrewDescription:
      'Ipanema wine bar, Tuesdays packed with Israelis and locals fresh from the beach.',
    englishDescription:
      'Ipanema wine bar, Tuesdays packed with Israelis and locals fresh from the beach.',
    rating: 4.6,
    friendsKnow: 9,
    tarmilPick: true,
  },

  // ─── Clubs ────────────────────────────────────────────────────────────
  {
    id: 'rio-scenarium',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Rio Scenarium',
    englishName: 'Rio Scenarium',
    category: 'club',
    lat: -22.9127148,
    lng: -43.1830503,
    hebrewDescription:
      "Huge three-floor samba club mixing tourists and locals dancing until stupid o'clock.",
    englishDescription:
      "Huge three-floor samba club mixing tourists and locals dancing until stupid o'clock.",
    rating: 4.6,
    friendsKnow: 8,
    tarmilPick: true,
  },
  {
    id: 'circo-voador',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Circo Voador',
    englishName: 'Circo Voador',
    category: 'club',
    lat: -22.9131533,
    lng: -43.1800298,
    hebrewDescription:
      'Open-air concert venue with rock, reggae and electronic nights, super young crowd.',
    englishDescription:
      'Open-air concert venue with rock, reggae and electronic nights, super young crowd.',
    rating: 4.5,
    friendsKnow: 7,
  },
  {
    id: 'fundicao-progresso',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Fundição Progresso',
    englishName: 'Fundição Progresso',
    category: 'club',
    lat: -22.9135688,
    lng: -43.1793293,
    hebrewDescription:
      'Massive warehouse for parties and shows, explodes every Carnival and most weekends.',
    englishDescription:
      'Massive warehouse for parties and shows, explodes every Carnival and most weekends.',
    rating: 4.4,
    friendsKnow: 6,
  },
  {
    id: 'fosfobox',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Fosfobox',
    englishName: 'Fosfobox',
    category: 'club',
    lat: -22.9691156,
    lng: -43.1812892,
    hebrewDescription:
      'Underground Copacabana club with techno and indie, feels a bit like south Tel Aviv.',
    englishDescription:
      'Underground Copacabana club with techno and indie, feels a bit like south Tel Aviv.',
    rating: 4.4,
    friendsKnow: 5,
  },

  // ─── Chabad ───────────────────────────────────────────────────────────
  {
    id: 'chabad-leblon',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Beit Lubavitch Chabad Rio de Janeiro',
    englishName: 'Beit Lubavitch Chabad Rio De Janeiro',
    category: 'chabad',
    lat: -22.9837226,
    lng: -43.2195597,
    hebrewDescription:
      'Main Chabad house, Shabbat meals packed with Israelis and students from everywhere.',
    englishDescription:
      'Main Chabad house, Shabbat meals packed with Israelis and students from everywhere.',
    rating: 4.7,
    friendsKnow: 9,
    tarmilPick: true,
  },
  {
    id: 'chabad-copa',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Beit Lubavitch Copacabana',
    englishName: 'Beit Lubavitch Copacabana',
    category: 'chabad',
    lat: -22.9673023,
    lng: -43.1866841,
    hebrewDescription:
      'Chabad near the beach, good spot to breathe some Judaism after a week of parties.',
    englishDescription:
      'Chabad near the beach, good spot to breathe some Judaism after a week of parties.',
    rating: 4.6,
    friendsKnow: 6,
  },

  // ─── Kosher ───────────────────────────────────────────────────────────
  {
    id: 'shaq-shuq',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Shaq Shuq',
    englishName: 'Shaq Shuq',
    category: 'kosher',
    lat: -22.9686483,
    lng: -43.1861939,
    hebrewDescription:
      'Kosher Copacabana spot with Israeli style home food for when you miss mom.',
    englishDescription:
      'Kosher Copacabana spot with Israeli style home food for when you miss mom.',
    rating: 4.5,
    friendsKnow: 7,
    tarmilPick: true,
  },
  {
    id: 'cib-kosher-bistro',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'CIB Kosher Bistro',
    englishName: 'CIB Kosher Bistro',
    category: 'kosher',
    lat: -22.968587,
    lng: -43.186254,
    hebrewDescription:
      'Kosher bistro inside the Jewish club, easy place to meet Israelis and local families.',
    englishDescription:
      'Kosher bistro inside the Jewish club, easy place to meet Israelis and local families.',
    rating: 4.4,
    friendsKnow: 5,
  },

  // ─── Landmarks ────────────────────────────────────────────────────────
  {
    id: 'cristo-redentor',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Christ the Redeemer',
    englishName: 'Christ the Redeemer',
    category: 'landmark',
    lat: -22.951916,
    lng: -43.2104872,
    hebrewDescription:
      "Rio's main icon, mandatory photo with arms stretched like the statue.",
    englishDescription:
      "Rio's main icon, mandatory photo with arms stretched like the statue.",
    rating: 4.7,
    friendsKnow: 13,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'T', friendName: 'Tom Friedman', season: 'autumn', year: 2025, durationLabel: 'a weekend' },
    ],
  },
  {
    id: 'sugarloaf',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Sugarloaf Mountain',
    englishName: 'Sugarloaf Mountain',
    category: 'landmark',
    lat: -22.9493486,
    lng: -43.1563408,
    hebrewDescription:
      'A 360-degree view mountain with a cable car ride and sunsets that look CGI fake.',
    englishDescription:
      'A 360-degree view mountain with a cable car ride and sunsets that look CGI fake.',
    rating: 4.7,
    friendsKnow: 9,
  },
  {
    id: 'lapa-arches',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Arcos da Lapa',
    englishName: 'Arcos da Lapa',
    category: 'landmark',
    lat: -22.91358,
    lng: -43.17902,
    hebrewDescription:
      'White aqueduct in Lapa that doubles as the meeting point for parties and blocos.',
    englishDescription:
      'White aqueduct in Lapa that doubles as the meeting point for parties and blocos.',
    rating: 4.5,
    friendsKnow: 8,
  },
  {
    id: 'selaron-steps',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Escadaria Selarón',
    englishName: 'Escadaria Selarón',
    category: 'landmark',
    lat: -22.9134394,
    lng: -43.179456,
    hebrewDescription:
      'Colorful tiled steps where everyone hunts for the Israel tile photo.',
    englishDescription:
      'Colorful tiled steps where everyone hunts for the Israel tile photo.',
    rating: 4.6,
    friendsKnow: 10,
    tarmilPick: true,
  },
  {
    id: 'parque-lage',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Parque Lage',
    englishName: 'Parque Lage',
    category: 'landmark',
    lat: -22.9682391,
    lng: -43.2102638,
    hebrewDescription:
      'Old mansion with a pool facing the forest, Instagram shots on full music-video level.',
    englishDescription:
      'Old mansion with a pool facing the forest, Instagram shots on full music-video level.',
    rating: 4.6,
    friendsKnow: 5,
  },
  {
    id: 'pedra-gavea',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Pedra da Gávea',
    englishName: 'Pedra da Gávea',
    category: 'landmark',
    lat: -23.0019858,
    lng: -43.2922647,
    hebrewDescription:
      'Hard hike with insane views of the city, Israelis always power up too fast.',
    englishDescription:
      'Hard hike with insane views of the city, Israelis always power up too fast.',
    rating: 4.7,
    friendsKnow: 4,
  },
  {
    id: 'dois-irmaos',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Morro Dois Irmãos',
    englishName: 'Morro Dois Irmãos',
    category: 'landmark',
    lat: -22.9994517,
    lng: -43.2341364,
    hebrewDescription:
      'Relatively short hike above Vidigal with crazy views over Ipanema and Leblon.',
    englishDescription:
      'Relatively short hike above Vidigal with crazy views over Ipanema and Leblon.',
    rating: 4.7,
    friendsKnow: 6,
  },
  {
    id: 'santa-teresa',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Santa Teresa neighborhood',
    englishName: 'Santa Teresa neighborhood',
    category: 'landmark',
    lat: -22.9229157,
    lng: -43.1901305,
    hebrewDescription:
      'Bohemian hill neighborhood with bars, graffiti and a cute yellow tram.',
    englishDescription:
      'Bohemian hill neighborhood with bars, graffiti and a cute yellow tram.',
    rating: 4.5,
    friendsKnow: 7,
  },
  {
    id: 'museu-amanha',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Museu do Amanhã',
    englishName: 'Museu do Amanhã',
    category: 'landmark',
    lat: -22.8930924,
    lng: -43.1796111,
    hebrewDescription:
      'Futuristic building on the water, chill sunset walk area by the port.',
    englishDescription:
      'Futuristic building on the water, chill sunset walk area by the port.',
    rating: 4.4,
    friendsKnow: 3,
  },
  {
    id: 'mac-niteroi',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'MAC Niterói',
    englishName: 'MAC Niterói',
    category: 'landmark',
    lat: -22.907042,
    lng: -43.1255708,
    hebrewDescription:
      "UFO-looking museum with ridiculous views back toward Rio's skyline.",
    englishDescription:
      "UFO-looking museum with ridiculous views back toward Rio's skyline.",
    rating: 4.5,
    friendsKnow: 3,
  },
  {
    id: 'mirante-dona-marta',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Mirante Dona Marta',
    englishName: 'Mirante Dona Marta',
    category: 'landmark',
    lat: -22.9404395,
    lng: -43.1964393,
    hebrewDescription:
      'Cheaper Cristo-style viewpoint with fewer lines and arguably better views.',
    englishDescription:
      'Cheaper Cristo-style viewpoint with fewer lines and arguably better views.',
    rating: 4.6,
    friendsKnow: 5,
  },
  {
    id: 'pedra-telegrafo',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Pedra do Telégrafo',
    englishName: 'Pedra do Telégrafo',
    category: 'landmark',
    lat: -23.0539217,
    lng: -43.0606362,
    hebrewDescription:
      'Famous rock for fake cliff-hanging photos, queue of hardcore Instagram warriors.',
    englishDescription:
      'Famous rock for fake cliff-hanging photos, queue of hardcore Instagram warriors.',
    rating: 4.4,
    friendsKnow: 4,
  },

  // ─── Kosher & Jewish-friendly (merchant tiers) ──────────────────────────
  {
    id: 'rio-kosher-grill',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Carioca Kosher Grill',
    englishName: 'Carioca Kosher Grill',
    category: 'kosher',
    lat: -22.9694,
    lng: -43.1858,
    hebrewDescription:
      'Glatt grill two blocks off Copacabana. Badatz-certified, books up on Thursdays.',
    englishDescription:
      'Glatt grill two blocks off Copacabana. Badatz-certified, books up on Thursdays.',
    rating: 4.6,
    friendsKnow: 7,
    paidPlacement: true,
    reservationUrl: 'https://wa.me/5521999990000',
  },
  {
    id: 'rio-shtetl-bakery',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Shtetl Bakery',
    englishName: 'Shtetl Bakery',
    category: 'kosher',
    lat: -22.9831,
    lng: -43.2049,
    hebrewDescription:
      'Tiny Ipanema bakery. Fresh challah on Fridays, queue starts before noon.',
    englishDescription:
      'Tiny Ipanema bakery. Fresh challah on Fridays, queue starts before noon.',
    rating: 4.9,
    friendsKnow: 9,
    tarmilPick: true,
  },
  {
    id: 'rio-beit-yaakov-synagogue',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Beit Yaakov Synagogue',
    englishName: 'Beit Yaakov Synagogue',
    category: 'synagogue',
    lat: -22.9726,
    lng: -43.1889,
    hebrewDescription:
      'Welcoming Copacabana shul. Shabbat services posted at the door, visitors fine.',
    englishDescription:
      'Welcoming Copacabana shul. Shabbat services posted at the door, visitors fine.',
    rating: 4.7,
    friendsKnow: 3,
  },
  {
    id: 'rio-mikveh-copacabana',
    destinationId: 'rio-de-janeiro',
    hebrewName: 'Copacabana Mikveh',
    englishName: 'Copacabana Mikveh',
    category: 'mikveh',
    lat: -22.9741,
    lng: -43.1903,
    hebrewDescription:
      'Clean, well-kept mikveh by appointment. Call ahead for evening hours.',
    englishDescription:
      'Clean, well-kept mikveh by appointment. Call ahead for evening hours.',
    rating: 4.5,
    friendsKnow: 2,
  },
];
