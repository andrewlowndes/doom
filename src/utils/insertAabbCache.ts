import { AabbCacheItem } from './../interfaces/TriangleCache';
import { binarySearchClosestIndex } from './binarySearchClosestIndex';

export const insertAabbCacheItem = <T>(cache: Array<AabbCacheItem<T>>, newObj: AabbCacheItem<T>) => {
  const minIndex = binarySearchClosestIndex(cache, (obj) => newObj.val - obj.val);
    
  if (minIndex === undefined || newObj.val < cache[minIndex].val) {
    cache.unshift(newObj);
  } else {
    cache.splice(minIndex+1, 0, newObj);
  }
};
