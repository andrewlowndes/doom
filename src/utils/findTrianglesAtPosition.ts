import { Vertex } from '../interfaces/Vertex';
import { AabbCache, AabbPointType } from '../interfaces/TriangleCache';
import { binarySearchClosestIndex } from './binarySearchClosestIndex';

export interface AabbCachePosition<T> {
  closestX: number | undefined; 
  closestY: number | undefined; 
  items: Array<T>
}

export const findTrianglesAtPosition = <T>(cache: AabbCache<T>, pos: Vertex): AabbCachePosition<T> => {
  const closestX = binarySearchClosestIndex(cache.x, (obj) => pos.x - obj.val);
  const closestY = binarySearchClosestIndex(cache.y, (obj) => pos.y - obj.val);
  
  //find all of the 'min' entries but no 'max' entries up to the index
  const xPolygons = new Set<T>();
  
  if (closestX !== undefined) {
    for (let i=0; i <= closestX; i++) {
      const xObj = cache.x[i];
      
      if (xObj.type === AabbPointType.min) {
        xPolygons.add(xObj.obj);
      } else {
        xPolygons.delete(xObj.obj);
      }
    }
  }
  
  const yPolygons = new Set<T>();

  if (closestY !== undefined) {
    for (let i=0; i <= closestY; i++) {
      const yObj = cache.y[i];
      
      if (yObj.type === AabbPointType.min) {
        yPolygons.add(yObj.obj);
      } else {
        yPolygons.delete(yObj.obj);
      }
    }
  }
  
  return { closestX, closestY, items: [...xPolygons].filter((item) => yPolygons.has(item)) };
};
