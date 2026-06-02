export const CITY_DESCRIPTIONS: Record<string, string> = {
  buzios:
    "Brigitte Bardot put Búzios on the map in the 60s and the peninsula has been quietly perfecting itself since. Twenty-three beaches in an hour's drive, cobbled lanes that empty after sunset, and the calmest water on the Rio coast. Days lean toward boats, snorkel masks, and long lunches; nights toward Rua das Pedras and second-bottle conversations. Stay in Geribá for waves, Ferradura for families, Centro for the walk-home dinners. Two days is the minimum; three feels right.",
  'sao-paulo':
    "Brazil's restless engine, with the best food in the southern hemisphere and the nightlife to keep pace. Skip the postcards. Eat through Vila Madalena and Pinheiros, drink standing on Rua Augusta, recover with brunch in Jardins. The art scene is world-class (MASP, Pinacoteca, the weekend galleries on Oscar Freire) and the kosher options are quietly excellent. Mornings are for cafés, afternoons for parks, nights for the hour-long Uber to a bar you'll remember.",
  jericoacoara:
    "Dunes that swallow the streetlights at night. Wind that bends the palms by mid-afternoon. Jeri is a national park you reach by jeep, with no paved streets and no streetlights by design. Days run on water: kitesurf at Preá, sandboard at Duna do Pôr do Sol, swim in the freshwater lagoons that stay warm past midnight. Eat caipirinhas-and-fish at the beach kiosks. Sleep with the windows open.",
  'buenos-aires':
    "A European capital with Latin lungs. Asado till midnight, tango at the milonga, breakfast at dawn. Palermo's tree-lined streets and Soho-style cafés contrast with San Telmo's antique fairs and crumbling-grand cobblestones. Recoleta for the cemetery and the bookstore inside an old theatre. La Boca for one careful afternoon. The peso situation is volatile, the steak is non-negotiable, the city stays up later than you will.",
  'punta-del-este':
    "Uruguay's coastal exhale after Argentina's noise. The town itself is part Miami, part Mediterranean, with high-rises along the Rambla and a marina full of yachts that don't pretend modesty. The real Punta is just east: Casapueblo's cliff at sunset, José Ignacio's barefoot fish restaurants, the long blank Atlantic beaches between them. Three days is enough for the rhythm; a fourth lets you skip a beach for a winery.",
  'rio-de-janeiro':
    'Rio earns its postcards the hard way: 6 km of Copacabana, the Christ statue, Sugarloaf at sunset, and the favela hills that make the city impossible to mistake for anywhere else. Santa Teresa for the bohemian afternoons, Lapa for the samba nights, Ipanema for the long sand walks. Skip the chain hotels; rent in Botafogo or Glória for the local price. The food is street-good, the music starts at 11 p.m., the ocean is always there.',
  'foz-do-iguacu':
    'Two days at the most famous waterfall on the continent. Walk the Brazilian side first for the panorama, the Argentine side the next morning for the Devil’s Throat catwalk that puts you inside the curtain. The town itself is functional; eat at Bufalo Branco, sleep at a hotel with a pool, fly in and out. Pack a poncho, bring a waterproof phone bag, save the dry shoes for after.',
  mendoza:
    'Argentina’s wine capital, sitting at the foot of the Andes with Aconcagua on the horizon. Days are for bodega tours in Luján de Cuyo and the Valle de Uco; the Catena, Zuccardi, and Salentein names recur for a reason. Nights are for Malbec on Aristides Villanueva. Add a day for white-water rafting on the Mendoza River or a long lunch at 1884 if you want to splurge. Three days is plenty; a fourth turns wine into a fog.',
};

export function cityDescription(stopId: string, fallback?: string): string {
  return CITY_DESCRIPTIONS[stopId] ?? fallback ?? '';
}
