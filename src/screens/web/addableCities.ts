export type AddableCity = {
  id: string;
  nameEn: string;
  lat: number;
  lng: number;
  defaultNights: number;
  blurb?: string;
};

export function slugifyId(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const ADDABLE_CITIES: AddableCity[] = [
  {
    id: 'rio-de-janeiro',
    nameEn: 'Rio de Janeiro',
    lat: -22.9068,
    lng: -43.1729,
    defaultNights: 3,
    blurb: 'Christ, Copacabana, Sugarloaf, samba after midnight.',
  },
  {
    id: 'foz-do-iguacu',
    nameEn: 'Foz do Iguaçu',
    lat: -25.6953,
    lng: -54.4367,
    defaultNights: 2,
    blurb: "Walk both sides of the Devil's Throat. Two days max.",
  },
  {
    id: 'mendoza',
    nameEn: 'Mendoza',
    lat: -32.8908,
    lng: -68.8272,
    defaultNights: 3,
    blurb: 'Argentine wine country at the foot of the Andes.',
  },
  {
    id: 'sao-paulo',
    nameEn: 'São Paulo',
    lat: -23.5558,
    lng: -46.6396,
    defaultNights: 3,
    blurb: "Endless city — art, food halls, Brazil's best nightlife.",
  },
  {
    id: 'buenos-aires',
    nameEn: 'Buenos Aires',
    lat: -34.6037,
    lng: -58.3816,
    defaultNights: 4,
    blurb: 'Steak, tango, late dinners, European bones.',
  },
  {
    id: 'punta-del-este',
    nameEn: 'Punta del Este',
    lat: -34.9583,
    lng: -54.95,
    defaultNights: 2,
    blurb: "Uruguay's beach scene — summer sun and seafood.",
  },
  {
    id: 'buzios',
    nameEn: 'Búzios',
    lat: -22.7469,
    lng: -41.8817,
    defaultNights: 2,
    blurb: 'Beach-hop the peninsula Brigitte Bardot made famous.',
  },
  {
    id: 'jericoacoara',
    nameEn: 'Jericoacoara',
    lat: -2.7956,
    lng: -40.5137,
    defaultNights: 3,
    blurb: 'Dunes, lagoons, sunset on the sand — off the grid.',
  },
  {
    id: 'bangkok',
    nameEn: 'Bangkok',
    lat: 13.7563,
    lng: 100.5018,
    defaultNights: 3,
    blurb: 'Street food, temples, rooftop bars — every SE-Asia trip starts here.',
  },
  {
    id: 'ko-pha-ngan',
    nameEn: 'Ko Pha Ngan',
    lat: 9.7319,
    lng: 100.0136,
    defaultNights: 4,
    blurb: 'Full Moon Party on one coast, empty hammock beaches on the other.',
  },
  {
    id: 'hanoi',
    nameEn: 'Hanoi',
    lat: 21.0278,
    lng: 105.8342,
    defaultNights: 3,
    blurb: 'Old Quarter chaos, egg coffee, and the gateway to Ha Long Bay.',
  },
  {
    id: 'goa',
    nameEn: 'Goa',
    lat: 15.5853,
    lng: 73.744,
    defaultNights: 4,
    blurb: "India's beach state — Anjuna sunsets, scooters, and trance markets.",
  },
  {
    id: 'kathmandu',
    nameEn: 'Kathmandu',
    lat: 27.7172,
    lng: 85.324,
    defaultNights: 3,
    blurb: 'Thamel, great stupas, and the trailhead for every Himalayan trek.',
  },
  {
    id: 'kasol',
    nameEn: 'Kasol',
    lat: 32.0107,
    lng: 77.3152,
    defaultNights: 4,
    blurb: 'Parvati Valley pine, hot springs, and the most Israeli corner of India.',
  },
  {
    id: 'tbilisi',
    nameEn: 'Tbilisi',
    lat: 41.7151,
    lng: 44.8271,
    defaultNights: 3,
    blurb: 'Sulfur baths, amber wine, and the coolest cheap capital on the trail.',
  },
  {
    id: 'medellin',
    nameEn: 'Medellín',
    lat: 6.2442,
    lng: -75.5812,
    defaultNights: 4,
    blurb: 'Eternal spring, metrocables, and salsa nights in Provenza.',
  },
  {
    id: 'cusco',
    nameEn: 'Cusco',
    lat: -13.5319,
    lng: -71.9675,
    defaultNights: 3,
    blurb: 'Inca stone, San Blas hills, and the launchpad for Machu Picchu.',
  },
  {
    id: 'la-paz',
    nameEn: 'La Paz',
    lat: -16.4897,
    lng: -68.1193,
    defaultNights: 3,
    blurb: "The world's highest capital — cable cars, salt flats, Death Road.",
  },
];
