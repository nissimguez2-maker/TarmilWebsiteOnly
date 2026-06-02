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
];
