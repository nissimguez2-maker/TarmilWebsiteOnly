/**
 * Curated places outside the user's current city — for planned destinations.
 *
 * SEED ONLY. Runtime data is read from the `places` table in Supabase. This
 * array feeds `scripts/seed-supabase.ts`; nothing in `src/` imports it at
 * runtime.
 *
 * Each entry's `destinationId` points to a `planned_stops.id`. Coordinates
 * verified against Google Maps. Kept as a separate file from rioPlaces.ts
 * for curator convenience — runtime treats them as one unified `places` set.
 */

import type { Place } from './places';

export const globalPlaces: Place[] = [
  // ─── Búzios ─────────────────────────────────────────────────────────
  {
    id: 'buzios-ferradura',
    destinationId: 'buzios',
    hebrewName: 'Praia da Ferradura',

    englishName: 'Praia da Ferradura',
    category: 'beach',
    lat: -22.768,
    lng: -41.892,
    hebrewDescription: 'Sheltered horseshoe beach, calm water, a respite from party-Búzios.',

    englishDescription: 'Sheltered horseshoe beach, calm water, a respite from party-Búzios.',
    rating: 4.7,
    friendsKnow: 2,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'R', friendName: 'Roi Ben Ami', season: 'summer', year: 2025, durationLabel: 'a week' },
    ],
  },
  {
    id: 'buzios-geriba-hostel',
    destinationId: 'buzios',
    hebrewName: 'Geribá Beach Hostel',

    englishName: 'Geribá Beach Hostel',
    category: 'hostel',
    lat: -22.776,
    lng: -41.91,
    hebrewDescription: 'Hostel near the surf beach, classic Brazil vibe.',

    englishDescription: 'Hostel near the surf beach, classic Brazil vibe.',
    rating: 4.3,
    friendsKnow: 1,
  },

  // ─── São Paulo ───────────────────────────────────────────────────────
  {
    id: 'o-de-casa-hostel',
    destinationId: 'sao-paulo',
    hebrewName: 'Ô de Casa Hostel',

    englishName: 'Ô de Casa Hostel',
    category: 'hostel',
    lat: -23.5558422,
    lng: -46.6939196,
    hebrewDescription: 'Classic Vila Madalena backpacker hostel, loaded with Israelis pre-north trip.',

    englishDescription: 'Classic Vila Madalena backpacker hostel, loaded with Israelis pre-north trip.',
    rating: 4.5,
    friendsKnow: 7,
    tarmilPick: true,
  },
  {
    id: 'soul-hostel',
    destinationId: 'sao-paulo',
    hebrewName: 'Soul Hostel',

    englishName: 'Soul Hostel',
    category: 'hostel',
    lat: -23.5585757,
    lng: -46.6527892,
    hebrewDescription: 'Close to Paulista and metro, cheap comfortable base for errands in the city.',

    englishDescription: 'Close to Paulista and metro, cheap comfortable base for errands in the city.',
    rating: 4.2,
    friendsKnow: 3,
  },
  {
    id: 'brazilodge-hostel',
    destinationId: 'sao-paulo',
    hebrewName: 'Brazilodge All Suites Hostel',

    englishName: 'Brazilodge All Suites Hostel',
    category: 'hostel',
    lat: -23.5870006,
    lng: -46.6404154,
    hebrewDescription: 'Organized Vila Mariana hostel, less party, more rest and supermarkets.',

    englishDescription: 'Organized Vila Mariana hostel, less party, more rest and supermarkets.',
    rating: 4.3,
    friendsKnow: 2,
  },
  {
    id: 'casa-azul-hostel',
    destinationId: 'sao-paulo',
    hebrewName: 'Hostel Casa Azul São Paulo',

    englishName: 'Hostel Casa Azul São Paulo',
    category: 'hostel',
    lat: -23.5896517,
    lng: -46.6401486,
    hebrewDescription: 'Quieter option with comfy rooms after a heavy Paulista night.',

    englishDescription: 'Quieter option with comfy rooms after a heavy Paulista night.',
    rating: 4.4,
    friendsKnow: 1,
  },
  {
    id: 'sova-rest',
    destinationId: 'sao-paulo',
    hebrewName: 'Sová Comida Judaica',

    englishName: 'Sová Comida Judaica',
    category: 'restaurant',
    lat: -23.5683922,
    lng: -46.6586425,
    hebrewDescription: 'Jewish-Israeli food spot and bakery, gives strong Dizengoff pedestrian vibes.',

    englishDescription: 'Jewish-Israeli food spot and bakery, gives strong Dizengoff pedestrian vibes.',
    rating: 4.5,
    friendsKnow: 5,
    tarmilPick: true,
  },
  {
    id: 'beit-cafe',
    destinationId: 'sao-paulo',
    hebrewName: 'Beit Café',

    englishName: 'Beit Café',
    category: 'cafe',
    lat: -23.524751,
    lng: -46.6334203,
    hebrewDescription: 'Cafe restaurant with Israel style food, Hebrew everywhere in Bom Retiro.',

    englishDescription: 'Cafe restaurant with Israel style food, Hebrew everywhere in Bom Retiro.',
    rating: 4.4,
    friendsKnow: 4,
  },
  {
    id: 'emporium-brasil-israel',
    destinationId: 'sao-paulo',
    hebrewName: 'Emporium Brasil Israel',

    englishName: 'Emporium Brasil Israel',
    category: 'restaurant',
    lat: -23.5242507,
    lng: -46.6362702,
    hebrewDescription: 'Kosher style deli with schnitzel, challahs and Israeli snacks for the backpack.',

    englishDescription: 'Kosher style deli with schnitzel, challahs and Israeli snacks for the backpack.',
    rating: 4.3,
    friendsKnow: 3,
  },
  {
    id: 'bubbeleh-delishop',
    destinationId: 'sao-paulo',
    hebrewName: 'Bubbeleh Delishop',

    englishName: 'Bubbeleh Delishop',
    category: 'restaurant',
    lat: -23.5668962,
    lng: -46.6902668,
    hebrewDescription: 'Israeli spot in Pinheiros serving hummus, falafel and sabich with Tel Aviv vibe.',

    englishDescription: 'Israeli spot in Pinheiros serving hummus, falafel and sabich with Tel Aviv vibe.',
    rating: 4.6,
    friendsKnow: 6,
  },
  {
    id: 'armazem-muszkat',
    destinationId: 'sao-paulo',
    hebrewName: 'Armazém Muszkat',

    englishName: 'Armazém Muszkat',
    category: 'restaurant',
    lat: -23.5876151,
    lng: -46.6778192,
    hebrewDescription: "Family style Jewish kitchen, feels like dropping into a Friday dinner at your aunt's.",

    englishDescription: "Family style Jewish kitchen, feels like dropping into a Friday dinner at your aunt's.",
    rating: 4.5,
    friendsKnow: 2,
  },
  {
    id: 'jardins-cafe',
    destinationId: 'sao-paulo',
    hebrewName: 'Café Girondino Jardins',

    englishName: 'Café Girondino Jardins',
    category: 'cafe',
    lat: -23.5654028,
    lng: -46.6598287,
    hebrewDescription: 'Chill cafe near Paulista with good wifi to sort flights and bus chaos.',

    englishDescription: 'Chill cafe near Paulista with good wifi to sort flights and bus chaos.',
    rating: 4.2,
    friendsKnow: 2,
  },
  {
    id: 'vila-madalena-cafe',
    destinationId: 'sao-paulo',
    hebrewName: 'Coffee Lab Vila Madalena',

    englishName: 'Coffee Lab Vila Madalena',
    category: 'cafe',
    lat: -23.555085,
    lng: -46.6909603,
    hebrewDescription: 'Hipster cafe where locals and backpackers share the bar and absurdly good coffee.',

    englishDescription: 'Hipster cafe where locals and backpackers share the bar and absurdly good coffee.',
    rating: 4.7,
    friendsKnow: 4,
    tarmilPick: true,
  },
  {
    id: 'boteco-belmonte-sp',
    destinationId: 'sao-paulo',
    hebrewName: 'Boteco São Conrado Pinheiros',

    englishName: 'Boteco São Conrado Pinheiros',
    category: 'restaurant',
    lat: -23.5678129,
    lng: -46.6942112,
    hebrewDescription: 'Typical Brazilian boteco with cold beers and pastéis after wandering Pinheiros.',

    englishDescription: 'Typical Brazilian boteco with cold beers and pastéis after wandering Pinheiros.',
    rating: 4.3,
    friendsKnow: 3,
  },
  {
    id: 'bar-samba',
    destinationId: 'sao-paulo',
    hebrewName: 'Bar Samba',

    englishName: 'Bar Samba',
    category: 'bar',
    lat: -23.5592179,
    lng: -46.6917343,
    hebrewDescription: 'Lively Vila Madalena samba bar where Israelis try to keep up with the steps.',

    englishDescription: 'Lively Vila Madalena samba bar where Israelis try to keep up with the steps.',
    rating: 4.6,
    friendsKnow: 5,
    tarmilPick: true,
  },
  {
    id: 'vila-do-samba',
    destinationId: 'sao-paulo',
    hebrewName: 'Vila do Samba',

    englishName: 'Vila do Samba',
    category: 'club',
    lat: -23.508894,
    lng: -46.6634272,
    hebrewDescription: 'Huge samba venue with tables and shows, Carnival feeling without leaving São Paulo.',

    englishDescription: 'Huge samba venue with tables and shows, Carnival feeling without leaving São Paulo.',
    rating: 4.5,
    friendsKnow: 3,
  },
  {
    id: 'batman-alley',
    destinationId: 'sao-paulo',
    hebrewName: 'Beco do Batman',

    englishName: 'Beco do Batman',
    category: 'landmark',
    lat: -23.5579407,
    lng: -46.6894228,
    hebrewDescription: 'Colorful graffiti alley where backpackers grind endless Instagram shoots.',

    englishDescription: 'Colorful graffiti alley where backpackers grind endless Instagram shoots.',
    rating: 4.5,
    friendsKnow: 8,
    tarmilPick: true,
  },
  {
    id: 'avenida-paulista',
    destinationId: 'sao-paulo',
    hebrewName: 'Avenida Paulista',

    englishName: 'Avenida Paulista',
    category: 'landmark',
    lat: -23.561414,
    lng: -46.6558817,
    hebrewDescription: 'Main avenue with museums, street shows and whole evenings of just wandering.',

    englishDescription: 'Main avenue with museums, street shows and whole evenings of just wandering.',
    rating: 4.4,
    friendsKnow: 9,
  },
  {
    id: 'masp-museum',
    destinationId: 'sao-paulo',
    hebrewName: 'MASP Art Museum',

    englishName: 'MASP Art Museum',
    category: 'landmark',
    lat: -23.5614145,
    lng: -46.6558817,
    hebrewDescription: 'Museum with the floating building and weekend antique market underneath.',

    englishDescription: 'Museum with the floating building and weekend antique market underneath.',
    rating: 4.6,
    friendsKnow: 5,
    tarmilPick: true,
  },
  {
    id: 'ibirapuera-park',
    destinationId: 'sao-paulo',
    hebrewName: 'Ibirapuera Park',

    englishName: 'Ibirapuera Park',
    category: 'landmark',
    lat: -23.5874166,
    lng: -46.6576342,
    hebrewDescription: "City's main park for runs, hammocks, picnics and just collapsing on the grass.",

    englishDescription: "City's main park for runs, hammocks, picnics and just collapsing on the grass.",
    rating: 4.7,
    friendsKnow: 6,
  },
  {
    id: 'se-cathedral',
    destinationId: 'sao-paulo',
    hebrewName: 'Catedral da Sé',

    englishName: 'Catedral da Sé',
    category: 'landmark',
    lat: -23.550305,
    lng: -46.6342493,
    hebrewDescription: "Central square stop to feel the city's rougher side for a bit.",

    englishDescription: "Central square stop to feel the city's rougher side for a bit.",
    rating: 4.0,
    friendsKnow: 2,
  },
  {
    id: 'municipal-market',
    destinationId: 'sao-paulo',
    hebrewName: 'Mercadão Municipal',

    englishName: 'Mercadão Municipal',
    category: 'landmark',
    lat: -23.5436867,
    lng: -46.6293688,
    hebrewDescription: 'Huge market with fruit juices and the iconic mortadella sandwich sample stop.',

    englishDescription: 'Huge market with fruit juices and the iconic mortadella sandwich sample stop.',
    rating: 4.4,
    friendsKnow: 3,
  },
  {
    id: 'pinacoteca',
    destinationId: 'sao-paulo',
    hebrewName: 'Pinacoteca de São Paulo',

    englishName: 'Pinacoteca de São Paulo',
    category: 'landmark',
    lat: -23.5343013,
    lng: -46.6338655,
    hebrewDescription: 'Chill art museum near Luz station, decent break from the street noise.',

    englishDescription: 'Chill art museum near Luz station, decent break from the street noise.',
    rating: 4.5,
    friendsKnow: 1,
  },
  {
    id: 'copan-building',
    destinationId: 'sao-paulo',
    hebrewName: 'Edifício Copan',

    englishName: 'Edifício Copan',
    category: 'landmark',
    lat: -23.5499196,
    lng: -46.645118,
    hebrewDescription: 'Iconic wavy building where Israelis hit the rooftop for downtown sunsets.',

    englishDescription: 'Iconic wavy building where Israelis hit the rooftop for downtown sunsets.',
    rating: 4.6,
    friendsKnow: 4,
    tarmilPick: true,
  },
  {
    id: 'mirante-9dejulho',
    destinationId: 'sao-paulo',
    hebrewName: 'Mirante 9 de Julho',

    englishName: 'Mirante 9 de Julho',
    category: 'landmark',
    lat: -23.5612117,
    lng: -46.6533337,
    hebrewDescription: 'Urban viewpoint just off Paulista with graffiti, coffee and occasional events.',

    englishDescription: 'Urban viewpoint just off Paulista with graffiti, coffee and occasional events.',
    rating: 4.4,
    friendsKnow: 2,
  },
  {
    id: 'altino-arantes',
    destinationId: 'sao-paulo',
    hebrewName: 'Farol Santander (Altino Arantes)',

    englishName: 'Farol Santander (Altino Arantes)',
    category: 'landmark',
    lat: -23.5452848,
    lng: -46.6346822,
    hebrewDescription: 'High floor viewpoint with 360 downtown views, perfect on a cloudy morning.',

    englishDescription: 'High floor viewpoint with 360 downtown views, perfect on a cloudy morning.',
    rating: 4.5,
    friendsKnow: 3,
  },
  {
    id: 'liberdade-gates',
    destinationId: 'sao-paulo',
    hebrewName: 'Liberdade Japanese District Gate',

    englishName: 'Liberdade Japanese District Gate',
    category: 'landmark',
    lat: -23.5564657,
    lng: -46.6352804,
    hebrewDescription: 'Gate into the Japanese neighborhood with street stalls and cheap Asian fast food.',

    englishDescription: 'Gate into the Japanese neighborhood with street stalls and cheap Asian fast food.',
    rating: 4.3,
    friendsKnow: 4,
  },
  {
    id: 'chabad-israelis-sp',
    destinationId: 'sao-paulo',
    hebrewName: 'Chabad for Israelis Rua Guararapes',

    englishName: 'Chabad for Israelis Rua Guararapes',
    category: 'chabad',
    lat: -23.6027566,
    lng: -46.6733152,
    hebrewDescription: "Chabad for Israelis with Hebrew talks and classic 'what after the trip' debates.",

    englishDescription: "Chabad for Israelis with Hebrew talks and classic 'what after the trip' debates.",
    rating: 4.5,
    friendsKnow: 4,
  },
  {
    id: 'beit-chabad-brasil',
    destinationId: 'sao-paulo',
    hebrewName: 'Beit Chabad do Brasil Jardins',

    englishName: 'Beit Chabad do Brasil Jardins',
    category: 'chabad',
    lat: -23.5628386,
    lng: -46.6691717,
    hebrewDescription: 'Central Chabad house with huge Friday kiddush and endless Shabbat meal invites.',

    englishDescription: 'Central Chabad house with huge Friday kiddush and endless Shabbat meal invites.',
    rating: 4.6,
    friendsKnow: 6,
    tarmilPick: true,
  },
  {
    id: 'beit-menachem',
    destinationId: 'sao-paulo',
    hebrewName: 'Beit Menachem Chabad Center',

    englishName: 'Beit Menachem Chabad Center',
    category: 'chabad',
    lat: -23.5578697,
    lng: -46.7046206,
    hebrewDescription: 'More chilled religious community, good if you want a minyan and family vibe.',

    englishDescription: 'More chilled religious community, good if you want a minyan and family vibe.',
    rating: 4.4,
    friendsKnow: 1,
  },
  {
    id: 'kosher-bom-retiro',
    destinationId: 'sao-paulo',
    hebrewName: 'Casa Kosher Bom Retiro',

    englishName: 'Casa Kosher Bom Retiro',
    category: 'kosher',
    lat: -23.5252129,
    lng: -46.6380537,
    hebrewDescription: 'Classic Jewish area joint, homestyle kosher food priced fine for hungry backpackers.',

    englishDescription: 'Classic Jewish area joint, homestyle kosher food priced fine for hungry backpackers.',
    rating: 4.3,
    friendsKnow: 2,
  },
  {
    id: 'sova-kosher',
    destinationId: 'sao-paulo',
    hebrewName: 'Sová Kosher Jardins',

    englishName: 'Sová Kosher Jardins',
    category: 'kosher',
    lat: -23.5683923,
    lng: -46.6586426,
    hebrewDescription: 'Kosher Sová version, ideal for schnitzel and mash after Carnival or red eye.',

    englishDescription: 'Kosher Sová version, ideal for schnitzel and mash after Carnival or red eye.',
    rating: 4.5,
    friendsKnow: 4,
  },
  {
    id: 'emporium-kosher',
    destinationId: 'sao-paulo',
    hebrewName: 'Emporium Brasil Israel Kosher',

    englishName: 'Emporium Brasil Israel Kosher',
    category: 'kosher',
    lat: -23.5242508,
    lng: -46.6362703,
    hebrewDescription: 'Kosher deli with takeaway dishes, everyone fills boxes before long night buses.',

    englishDescription: 'Kosher deli with takeaway dishes, everyone fills boxes before long night buses.',
    rating: 4.4,
    friendsKnow: 3,
  },

  // ─── Jericoacoara ────────────────────────────────────────────────────
  {
    id: 'jeri-hostel',
    destinationId: 'jericoacoara',
    hebrewName: 'Hostel Jericoacoara',

    englishName: 'Hostel Jericoacoara',
    category: 'hostel',
    lat: -2.7959621,
    lng: -40.5124022,
    hebrewDescription: 'Central Jeri hostel with hammocks and Israelis swapping army stories.',

    englishDescription: 'Central Jeri hostel with hammocks and Israelis swapping army stories.',
    rating: 4.4,
    friendsKnow: 5,
    tarmilPick: true,
  },
  {
    id: 'mandala-jeri',
    destinationId: 'jericoacoara',
    hebrewName: 'Mandala Hostel Jeri',

    englishName: 'Mandala Hostel Jeri',
    category: 'hostel',
    lat: -2.7965011,
    lng: -40.5130896,
    hebrewDescription: 'Social hostel with a small yard bar, base for dune and sandbuggy missions.',

    englishDescription: 'Social hostel with a small yard bar, base for dune and sandbuggy missions.',
    rating: 4.5,
    friendsKnow: 4,
  },
  {
    id: 'raiz-hostel-jeri',
    destinationId: 'jericoacoara',
    hebrewName: 'Raiz Hostel',

    englishName: 'Raiz Hostel',
    category: 'hostel',
    lat: -2.7972488,
    lng: -40.5131588,
    hebrewDescription: 'More party oriented hostel, music late, perfect if you came to move.',

    englishDescription: 'More party oriented hostel, music late, perfect if you came to move.',
    rating: 4.3,
    friendsKnow: 3,
  },
  {
    id: 'latapera-jeri',
    destinationId: 'jericoacoara',
    hebrewName: 'LaTaperaJeri',

    englishName: 'LaTaperaJeri',
    category: 'hostel',
    lat: -2.7960993,
    lng: -40.5128843,
    hebrewDescription: 'Chilled hostel, slightly calmer, good for a few nights recovering from the wind.',

    englishDescription: 'Chilled hostel, slightly calmer, good for a few nights recovering from the wind.',
    rating: 4.4,
    friendsKnow: 2,
  },
  {
    id: 'jeri-main-beach',
    destinationId: 'jericoacoara',
    hebrewName: 'Praia de Jericoacoara',

    englishName: 'Praia de Jericoacoara',
    category: 'beach',
    lat: -2.7959542,
    lng: -40.5122577,
    hebrewDescription: 'Main beach with kitesurf, chairs, caipirinhas and Israelis with mandolins.',

    englishDescription: 'Main beach with kitesurf, chairs, caipirinhas and Israelis with mandolins.',
    rating: 4.8,
    friendsKnow: 9,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'I', friendName: 'Itay Lotem', season: 'winter', year: 2024, durationLabel: 'a week' },
    ],
  },
  {
    id: 'duna-por-do-sol',
    destinationId: 'jericoacoara',
    hebrewName: 'Duna do Pôr do Sol',

    englishName: 'Duna do Pôr do Sol',
    category: 'landmark',
    lat: -2.7928708,
    lng: -40.5182913,
    hebrewDescription: 'Climb barefoot to the dune, everyone claps when the sun disappears.',

    englishDescription: 'Climb barefoot to the dune, everyone claps when the sun disappears.',
    rating: 4.8,
    friendsKnow: 8,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'H', friendName: 'Yotam Harari', season: 'autumn', year: 2024, durationLabel: 'a week' },
      { friendInitial: 'N', friendName: 'Noa Green', season: 'summer', year: 2023, durationLabel: 'two weeks' },
    ],
  },
  {
    id: 'pedra-furada',
    destinationId: 'jericoacoara',
    hebrewName: 'Pedra Furada',

    englishName: 'Pedra Furada',
    category: 'landmark',
    lat: -2.7999422,
    lng: -40.4891377,
    hebrewDescription: 'Famous rock arch with a queue for cheesy couple sunset photos.',

    englishDescription: 'Famous rock arch with a queue for cheesy couple sunset photos.',
    rating: 4.6,
    friendsKnow: 5,
  },
  {
    id: 'lagoon-paradise',
    destinationId: 'jericoacoara',
    hebrewName: 'Lagoa do Paraíso',

    englishName: 'Lagoa do Paraíso',
    category: 'landmark',
    lat: -2.8377854,
    lng: -40.4018151,
    hebrewDescription: 'Turquoise lagoon with hammocks in the water, full day of chilling and photos.',

    englishDescription: 'Turquoise lagoon with hammocks in the water, full day of chilling and photos.',
    rating: 4.7,
    friendsKnow: 6,
    tarmilPick: true,
  },
  {
    id: 'jeri-center-square',
    destinationId: 'jericoacoara',
    hebrewName: 'Praça Principal Jericoacoara',

    englishName: 'Praça Principal Jericoacoara',
    category: 'landmark',
    lat: -2.7949082,
    lng: -40.5121409,
    hebrewDescription: 'Sandy square of bars and stalls everyone crosses like five times a night.',

    englishDescription: 'Sandy square of bars and stalls everyone crosses like five times a night.',
    rating: 4.4,
    friendsKnow: 3,
  },
  {
    id: 'minha-moca-cafe',
    destinationId: 'jericoacoara',
    hebrewName: 'Minha Moça Café & Bistrô',

    englishName: 'Minha Moça Café & Bistrô',
    category: 'cafe',
    lat: -2.7961645,
    lng: -40.5129733,
    hebrewDescription: 'Comfort brunch spot with toasts, good coffee and decent wifi for booking next flights.',

    englishDescription: 'Comfort brunch spot with toasts, good coffee and decent wifi for booking next flights.',
    rating: 4.5,
    friendsKnow: 2,
  },
  {
    id: 'jeri-ju-cafe',
    destinationId: 'jericoacoara',
    hebrewName: 'Jeri Ju Café',

    englishName: 'Jeri Ju Café',
    category: 'cafe',
    lat: -2.7965452,
    lng: -40.5126408,
    hebrewDescription: 'Small main street cafe with smoothies, açaí and Israelis glued to laptops.',

    englishDescription: 'Small main street cafe with smoothies, açaí and Israelis glued to laptops.',
    rating: 4.3,
    friendsKnow: 1,
  },
  {
    id: 'cocoanuts-jeri',
    destinationId: 'jericoacoara',
    hebrewName: "Cocoa'nuts Jeri",

    englishName: "Cocoa'nuts Jeri",
    category: 'cafe',
    lat: -2.7967645,
    lng: -40.5124272,
    hebrewDescription: 'Over the top açaí bowls, perfect reward after a windy sand-in-eyes day.',

    englishDescription: 'Over the top açaí bowls, perfect reward after a windy sand-in-eyes day.',
    rating: 4.4,
    friendsKnow: 2,
  },
  {
    id: 'naturalmente-creperia',
    destinationId: 'jericoacoara',
    hebrewName: 'Naturalmente Creperia',

    englishName: 'Naturalmente Creperia',
    category: 'restaurant',
    lat: -2.7969214,
    lng: -40.5127604,
    hebrewDescription: 'Huge crepes right on the sand, sea view and mellow tunes into the night.',

    englishDescription: 'Huge crepes right on the sand, sea view and mellow tunes into the night.',
    rating: 4.5,
    friendsKnow: 3,
  },
  {
    id: 'do-bem-jeri',
    destinationId: 'jericoacoara',
    hebrewName: 'Do Bem Restaurante',

    englishName: 'Do Bem Restaurante',
    category: 'restaurant',
    lat: -2.7963628,
    lng: -40.5125087,
    hebrewDescription: 'Slightly healthier spot with bowls and fish for when you miss real veggies.',

    englishDescription: 'Slightly healthier spot with bowls and fish for when you miss real veggies.',
    rating: 4.4,
    friendsKnow: 2,
  },
  {
    id: 'nomads-jeri',
    destinationId: 'jericoacoara',
    hebrewName: "Nomad's Jeri",

    englishName: "Nomad's Jeri",
    category: 'bar',
    lat: -2.796611,
    lng: -40.5130402,
    hebrewDescription: 'Restobar with music and crowd, classic base before heading to the parties.',

    englishDescription: 'Restobar with music and crowd, classic base before heading to the parties.',
    rating: 4.3,
    friendsKnow: 3,
  },
  {
    id: 'maui-restobar',
    destinationId: 'jericoacoara',
    hebrewName: 'Maui Restobar',

    englishName: 'Maui Restobar',
    category: 'bar',
    lat: -2.7962322,
    lng: -40.5122937,
    hebrewDescription: 'Beachfront bar with jar cocktails and barefoot dancing in the sand.',

    englishDescription: 'Beachfront bar with jar cocktails and barefoot dancing in the sand.',
    rating: 4.4,
    friendsKnow: 2,
  },
  {
    id: 'forro-de-jangada',
    destinationId: 'jericoacoara',
    hebrewName: 'Forró da Jangada',

    englishName: 'Forró da Jangada',
    category: 'club',
    lat: -2.7969833,
    lng: -40.5129451,
    hebrewDescription: 'Forró party with live band, everyone learning steps from smiling locals.',

    englishDescription: 'Forró party with live band, everyone learning steps from smiling locals.',
    rating: 4.6,
    friendsKnow: 4,
    tarmilPick: true,
  },
  {
    id: 'caipi-street',
    destinationId: 'jericoacoara',
    hebrewName: 'Caipirinha Street Jeri',

    englishName: 'Caipirinha Street Jeri',
    category: 'bar',
    lat: -2.7954774,
    lng: -40.5123338,
    hebrewDescription: 'Line of street bars, cheap drinks, loud volume and hard sell to random Serbians.',

    englishDescription: 'Line of street bars, cheap drinks, loud volume and hard sell to random Serbians.',
    rating: 4.2,
    friendsKnow: 5,
  },
  {
    id: 'jeri-kite-point',
    destinationId: 'jericoacoara',
    hebrewName: 'Jericoacoara Kitesurf Spot',

    englishName: 'Jericoacoara Kitesurf Spot',
    category: 'landmark',
    lat: -2.7949174,
    lng: -40.5115971,
    hebrewDescription: 'Beach stretch full of kites in the sky, perfect sunset watching session.',

    englishDescription: 'Beach stretch full of kites in the sky, perfect sunset watching session.',
    rating: 4.7,
    friendsKnow: 4,
  },
  {
    id: 'jeri-main-drag',
    destinationId: 'jericoacoara',
    hebrewName: 'Rua Principal Jericoacoara',

    englishName: 'Rua Principal Jericoacoara',
    category: 'landmark',
    lat: -2.7962975,
    lng: -40.5126416,
    hebrewDescription: 'Sandy street lined with bars and restaurants, everything five minutes from your bed.',

    englishDescription: 'Sandy street lined with bars and restaurants, everything five minutes from your bed.',
    rating: 4.4,
    friendsKnow: 6,
  },
  {
    id: 'jeri-lighthouse',
    destinationId: 'jericoacoara',
    hebrewName: 'Farol de Jericoacoara',

    englishName: 'Farol de Jericoacoara',
    category: 'landmark',
    lat: -2.7915102,
    lng: -40.5052323,
    hebrewDescription: 'Easy climb with 360 views over dunes, sea and the tiny village.',

    englishDescription: 'Easy climb with 360 views over dunes, sea and the tiny village.',
    rating: 4.5,
    friendsKnow: 2,
  },

  // ─── Buenos Aires ───────────────────────────────────────────────────
  {
    id: 'iaacob-house',
    destinationId: 'buenos-aires',
    hebrewName: 'Iaacob House Hostel',

    englishName: 'Iaacob House Hostel',
    category: 'hostel',
    lat: -34.588755,
    lng: -58.4305307,
    hebrewDescription: 'Israeli house in Palermo, everything in Hebrew, feels like a Tel Aviv flatshare.',

    englishDescription: 'Israeli house in Palermo, everything in Hebrew, feels like a Tel Aviv flatshare.',
    rating: 4.6,
    friendsKnow: 5,
    tarmilPick: true,
  },
  {
    id: 'america-del-sur',
    destinationId: 'buenos-aires',
    hebrewName: 'America del Sur Hostel Buenos Aires',

    englishName: 'America del Sur Hostel Buenos Aires',
    category: 'hostel',
    lat: -34.617047,
    lng: -58.373967,
    hebrewDescription: 'Big San Telmo hostel full of backpackers, classic starting point for city exploring.',

    englishDescription: 'Big San Telmo hostel full of backpackers, classic starting point for city exploring.',
    rating: 4.5,
    friendsKnow: 7,
  },
  {
    id: 'milhouse-avenida',
    destinationId: 'buenos-aires',
    hebrewName: 'Milhouse Hostel Avenida',

    englishName: 'Milhouse Hostel Avenida',
    category: 'hostel',
    lat: -34.608909,
    lng: -58.3845742,
    hebrewDescription: 'Downtown party hostel with tours and bar, Israelis instantly fall for Buenos Aires.',

    englishDescription: 'Downtown party hostel with tours and bar, Israelis instantly fall for Buenos Aires.',
    rating: 4.4,
    friendsKnow: 8,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'T', friendName: 'Tom Friedman', season: 'autumn', year: 2025, durationLabel: 'a weekend' },
    ],
  },
  {
    id: 'rayuela-hostel',
    destinationId: 'buenos-aires',
    hebrewName: 'Rayuela Hostel Boutique',

    englishName: 'Rayuela Hostel Boutique',
    category: 'hostel',
    lat: -34.6142093,
    lng: -58.3769714,
    hebrewDescription: 'Smaller homely hostel, more intimate, kitchen chats run until 3am.',

    englishDescription: 'Smaller homely hostel, more intimate, kitchen chats run until 3am.',
    rating: 4.5,
    friendsKnow: 3,
  },
  {
    id: 'obelisco-ba',
    destinationId: 'buenos-aires',
    hebrewName: 'Obelisco de Buenos Aires',

    englishName: 'Obelisco de Buenos Aires',
    category: 'landmark',
    lat: -34.6037389,
    lng: -58.3815704,
    hebrewDescription: 'Central meeting point where everyone meets up before heading to Florida Street.',

    englishDescription: 'Central meeting point where everyone meets up before heading to Florida Street.',
    rating: 4.5,
    friendsKnow: 9,
  },
  {
    id: 'plaza-de-mayo',
    destinationId: 'buenos-aires',
    hebrewName: 'Plaza de Mayo',

    englishName: 'Plaza de Mayo',
    category: 'landmark',
    lat: -34.6080687,
    lng: -58.371029,
    hebrewDescription: 'Square by Casa Rosada with protests, politics and history in every corner.',

    englishDescription: 'Square by Casa Rosada with protests, politics and history in every corner.',
    rating: 4.4,
    friendsKnow: 6,
  },
  {
    id: 'puerto-madero',
    destinationId: 'buenos-aires',
    hebrewName: 'Puerto Madero Waterfront',

    englishName: 'Puerto Madero Waterfront',
    category: 'landmark',
    lat: -34.6075688,
    lng: -58.3627257,
    hebrewDescription: 'Modern riverfront for runs, photos and Puente de la Mujer cliché shots.',

    englishDescription: 'Modern riverfront for runs, photos and Puente de la Mujer cliché shots.',
    rating: 4.5,
    friendsKnow: 5,
  },
  {
    id: 'san-telmo-market',
    destinationId: 'buenos-aires',
    hebrewName: 'San Telmo Market',

    englishName: 'San Telmo Market',
    category: 'landmark',
    lat: -34.6171935,
    lng: -58.3737575,
    hebrewDescription: 'Sunday antique market with street music and endless stickers for your backpack.',

    englishDescription: 'Sunday antique market with street music and endless stickers for your backpack.',
    rating: 4.7,
    friendsKnow: 7,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'T', friendName: 'Tom Friedman', season: 'autumn', year: 2025, durationLabel: 'a weekend' },
      { friendInitial: 'D', friendName: 'Daniel Shemesh', season: 'winter', year: 2025, durationLabel: 'a weekend' },
    ],
  },
  {
    id: 'la-boca',
    destinationId: 'buenos-aires',
    hebrewName: 'Caminito La Boca',

    englishName: 'Caminito La Boca',
    category: 'landmark',
    lat: -34.6356129,
    lng: -58.3648435,
    hebrewDescription: 'Colorful street with tango shows, super touristy but great photos for army WhatsApp.',

    englishDescription: 'Colorful street with tango shows, super touristy but great photos for army WhatsApp.',
    rating: 4.3,
    friendsKnow: 8,
  },
  {
    id: 'recoleta-cemetery',
    destinationId: 'buenos-aires',
    hebrewName: 'Recoleta Cemetery',

    englishName: 'Recoleta Cemetery',
    category: 'landmark',
    lat: -34.5881979,
    lng: -58.3922895,
    hebrewDescription: 'Cemetery like a mini city, packed with wild stories, best done with a guide.',

    englishDescription: 'Cemetery like a mini city, packed with wild stories, best done with a guide.',
    rating: 4.6,
    friendsKnow: 5,
  },
  {
    id: 'palermo-parks',
    destinationId: 'buenos-aires',
    hebrewName: 'Bosques de Palermo',

    englishName: 'Bosques de Palermo',
    category: 'landmark',
    lat: -34.5692177,
    lng: -58.4146783,
    hebrewDescription: 'Lakes and lawns for runs and mate, feels like Park Hayarkon with extra tango.',

    englishDescription: 'Lakes and lawns for runs and mate, feels like Park Hayarkon with extra tango.',
    rating: 4.7,
    friendsKnow: 4,
    tarmilPick: true,
  },
  {
    id: 'plaza-serrano',
    destinationId: 'buenos-aires',
    hebrewName: 'Plaza Serrano (Plazoleta Cortázar)',

    englishName: 'Plaza Serrano (Plazoleta Cortázar)',
    category: 'landmark',
    lat: -34.5884091,
    lng: -58.4319339,
    hebrewDescription: 'Central Palermo square ringed by bars and vintage shops, everyone starts nights here.',

    englishDescription: 'Central Palermo square ringed by bars and vintage shops, everyone starts nights here.',
    rating: 4.4,
    friendsKnow: 6,
  },
  {
    id: 'avenida-corrientes',
    destinationId: 'buenos-aires',
    hebrewName: 'Avenida Corrientes',

    englishName: 'Avenida Corrientes',
    category: 'landmark',
    lat: -34.6033272,
    lng: -58.3894077,
    hebrewDescription: 'Theater and pizza avenue, classic night walk after a show or football match.',

    englishDescription: 'Theater and pizza avenue, classic night walk after a show or football match.',
    rating: 4.3,
    friendsKnow: 3,
  },
  {
    id: 'floralis-generica',
    destinationId: 'buenos-aires',
    hebrewName: 'Floralis Genérica',

    englishName: 'Floralis Genérica',
    category: 'landmark',
    lat: -34.5838726,
    lng: -58.3921822,
    hebrewDescription: 'Giant metal flower that opens by day, nice picnic plus quick museum hop.',

    englishDescription: 'Giant metal flower that opens by day, nice picnic plus quick museum hop.',
    rating: 4.5,
    friendsKnow: 3,
  },
  {
    id: 'palacio-barolo',
    destinationId: 'buenos-aires',
    hebrewName: 'Palacio Barolo',

    englishName: 'Palacio Barolo',
    category: 'landmark',
    lat: -34.6083272,
    lng: -58.3861246,
    hebrewDescription: 'Old building with night viewpoint where the guide ties everything to Dante.',

    englishDescription: 'Old building with night viewpoint where the guide ties everything to Dante.',
    rating: 4.6,
    friendsKnow: 2,
  },
  {
    id: 'palermo-soho-streets',
    destinationId: 'buenos-aires',
    hebrewName: 'Palermo Soho Streets',

    englishName: 'Palermo Soho Streets',
    category: 'landmark',
    lat: -34.5875653,
    lng: -58.4347911,
    hebrewDescription: 'Graffiti, designer shops and cocktail bars, basically Florentin on steroids.',

    englishDescription: 'Graffiti, designer shops and cocktail bars, basically Florentin on steroids.',
    rating: 4.6,
    friendsKnow: 7,
  },
  {
    id: 'avenida-9dejulio',
    destinationId: 'buenos-aires',
    hebrewName: 'Avenida 9 de Julio',

    englishName: 'Avenida 9 de Julio',
    category: 'landmark',
    lat: -34.6039323,
    lng: -58.3815703,
    hebrewDescription: 'Super wide avenue with the Obelisk, feels like the city never ends in depth.',

    englishDescription: 'Super wide avenue with the Obelisk, feels like the city never ends in depth.',
    rating: 4.4,
    friendsKnow: 4,
  },
  {
    id: 'chabad-recoleta',
    destinationId: 'buenos-aires',
    hebrewName: 'Chabad Recoleta Buenos Aires',

    englishName: 'Chabad Recoleta Buenos Aires',
    category: 'chabad',
    lat: -34.5889386,
    lng: -58.3939241,
    hebrewDescription: 'Chabad by Recoleta with Shabbat meals full of Israelis and Spanish speaking students.',

    englishDescription: 'Chabad by Recoleta with Shabbat meals full of Israelis and Spanish speaking students.',
    rating: 4.6,
    friendsKnow: 5,
  },
  {
    id: 'chabad-palermo',
    destinationId: 'buenos-aires',
    hebrewName: 'Chabad Palermo Buenos Aires',

    englishName: 'Chabad Palermo Buenos Aires',
    category: 'chabad',
    lat: -34.583861,
    lng: -58.432774,
    hebrewDescription: 'Neighborhood Chabad with minyanim, homely meals and endless invites for chagim.',

    englishDescription: 'Neighborhood Chabad with minyanim, homely meals and endless invites for chagim.',
    rating: 4.5,
    friendsKnow: 6,
    tarmilPick: true,
    friendVisits: [
      { friendInitial: 'I', friendName: 'Itay Lotem', season: 'autumn', year: 2024, durationLabel: 'two weeks' },
    ],
  },
  {
    id: 'chabad-downtown',
    destinationId: 'buenos-aires',
    hebrewName: 'Chabad Microcentro Buenos Aires',

    englishName: 'Chabad Microcentro Buenos Aires',
    category: 'chabad',
    lat: -34.6030183,
    lng: -58.3768422,
    hebrewDescription: 'Central Chabad spot, easy to pop in before or after walking the city.',

    englishDescription: 'Central Chabad spot, easy to pop in before or after walking the city.',
    rating: 4.4,
    friendsKnow: 3,
  },
  {
    id: 'eretz-cantina',
    destinationId: 'buenos-aires',
    hebrewName: 'Eretz Cantina Israelí',

    englishName: 'Eretz Cantina Israelí',
    category: 'kosher',
    lat: -34.5885669,
    lng: -58.4328682,
    hebrewDescription: 'Israeli Palermo restaurant with hummus, shawarma and Mizrahi music in the background.',

    englishDescription: 'Israeli Palermo restaurant with hummus, shawarma and Mizrahi music in the background.',
    rating: 4.5,
    friendsKnow: 4,
  },
  {
    id: 'hola-jacoba',
    destinationId: 'buenos-aires',
    hebrewName: 'Hola Jacoba',

    englishName: 'Hola Jacoba',
    category: 'kosher',
    lat: -34.6030554,
    lng: -58.4074125,
    hebrewDescription: 'Modern Jewish bistro with pastrami, cocktails and locals curious about Israel.',

    englishDescription: 'Modern Jewish bistro with pastrami, cocktails and locals curious about Israel.',
    rating: 4.4,
    friendsKnow: 2,
  },
  {
    id: 'murcielaga-kosher',
    destinationId: 'buenos-aires',
    hebrewName: 'Al Galope / Murciélaga Kosher',

    englishName: 'Al Galope / Murciélaga Kosher',
    category: 'kosher',
    lat: -34.5952153,
    lng: -58.3877842,
    hebrewDescription: 'Argentinian style kosher steak, finally proper asado without guilt.',

    englishDescription: 'Argentinian style kosher steak, finally proper asado without guilt.',
    rating: 4.6,
    friendsKnow: 4,
    tarmilPick: true,
  },
  {
    id: 'tucuman-kosher',
    destinationId: 'buenos-aires',
    hebrewName: 'Pizzería Tucumán Kosher',

    englishName: 'Pizzería Tucumán Kosher',
    category: 'kosher',
    lat: -34.6037746,
    lng: -58.4089151,
    hebrewDescription: 'Central kosher pizza, perfect cheap dinner solution after a museum marathon.',

    englishDescription: 'Central kosher pizza, perfect cheap dinner solution after a museum marathon.',
    rating: 4.3,
    friendsKnow: 3,
  },
  {
    id: 'sucath-david',
    destinationId: 'buenos-aires',
    hebrewName: 'Sucath David Bakery',

    englishName: 'Sucath David Bakery',
    category: 'kosher',
    lat: -34.6049089,
    lng: -58.402963,
    hebrewDescription: 'Kosher bakery with burekas, challahs and cakes to haul back to the hostel.',

    englishDescription: 'Kosher bakery with burekas, challahs and cakes to haul back to the hostel.',
    rating: 4.5,
    friendsKnow: 2,
  },

  // ─── Buenos Aires · kosher & Jewish-friendly (merchant tiers) ───────────
  {
    id: 'ba-once-parrilla',
    destinationId: 'buenos-aires',
    hebrewName: 'Parrilla Once Kosher',
    englishName: 'Parrilla Once Kosher',
    category: 'kosher',
    lat: -34.6093,
    lng: -58.4083,
    hebrewDescription:
      'Proper kosher asado in Once. Order the bife de chorizo, thank me later.',
    englishDescription:
      'Proper kosher asado in Once. Order the bife de chorizo, thank me later.',
    rating: 4.8,
    friendsKnow: 11,
    tarmilPick: true,
  },
  {
    id: 'ba-gran-templo-paso',
    destinationId: 'buenos-aires',
    hebrewName: 'Gran Templo Paso',
    englishName: 'Gran Templo Paso',
    category: 'synagogue',
    lat: -34.6086,
    lng: -58.4012,
    hebrewDescription:
      'Historic Once synagogue. Worth a visit; bring ID for the security desk.',
    englishDescription:
      'Historic Once synagogue. Worth a visit; bring ID for the security desk.',
    rating: 4.7,
    friendsKnow: 4,
  },
];
