export type Selection =
  | { type: 'none' }
  | { type: 'stop'; stopId: string }
  | { type: 'leg'; fromStopId: string; toStopId: string };
