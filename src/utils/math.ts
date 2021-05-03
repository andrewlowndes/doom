import { Vertex } from './../interfaces/Vertex';

export const roundToPow2 = (size: number): number => Math.pow(2, Math.ceil(Math.log(size) / Math.LN2));
export const angle = (v: Vertex) => Math.atan2(v.y, v.x);
export const subtract = (a: Vertex, b: Vertex): Vertex => ({ x: a.x - b.x, y: a.y - b.y });
