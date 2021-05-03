export const enum AabbPointType {
  min,
  max
};

export interface AabbCacheItem<T> {
  obj: T;
  type: AabbPointType;
  val: number;
}

export interface AabbCache<T> {
  x: Array<AabbCacheItem<T>>;
  y: Array<AabbCacheItem<T>>;
}

export interface AabbCache3D<T> {
  x: Array<AabbCacheItem<T>>;
  y: Array<AabbCacheItem<T>>;
  z: Array<AabbCacheItem<T>>;
}
