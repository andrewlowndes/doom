export interface Node {
  x: number;
  y: number;
  dx: number;
  dy: number;
  bbox: [
    [number, number, number, number],
    [number, number, number, number]
  ],
  children: [number, number],
}