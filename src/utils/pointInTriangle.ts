import { Triangle } from './../interfaces/Triangle';
import { Vertex } from './../interfaces/Vertex';

export const pointInTriangle = (p: Vertex, triangle: Triangle): boolean => {
  const p0 = triangle[0]; 
  const p1 = triangle[1];
  const p2 = triangle[2];
  const dX = p.x - p2.x;
  const dY = p.y - p2.y;
  const dX21 = p2.x - p1.x;
  const dY12 = p1.y - p2.y;
  const D = dY12 * (p0.x - p2.x) + dX21 * (p0.y - p2.y);
  const s = dY12 * dX + dX21 * dY;
  const t = (p2.y - p0.y) * dX + (p0.x - p2.x) * dY;
  
  if (D < 0) {
    return s <= 0 && t <= 0 && s + t >= D;
  }
  
  return s >= 0 && t >= 0 && s + t <= D;
};
