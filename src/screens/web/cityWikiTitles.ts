export const CITY_WIKI_TITLES: Record<string, string> = {
  buzios: 'Armação dos Búzios',
  'sao-paulo': 'São Paulo',
  jericoacoara: 'Jericoacoara',
  'buenos-aires': 'Buenos Aires',
  'punta-del-este': 'Punta del Este',
  'rio-de-janeiro': 'Rio de Janeiro',
  'foz-do-iguacu': 'Foz do Iguaçu',
  mendoza: 'Mendoza, Argentina',
};

export function wikiTitleFor(stopId: string, fallback: string): string {
  return CITY_WIKI_TITLES[stopId] ?? fallback;
}
