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
    blurb: "Argentine wine country at the foot of the Andes.",
  },
];
