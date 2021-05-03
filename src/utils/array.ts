export const last = <T = any>(arr: Array<T>): T => arr[arr.length-1];
export const first = <T = any>(arr: Array<T>): T => arr[0];
export const contains = <T = any>(arr: Array<T>, item: T): boolean => arr.indexOf(item) >= 0;
export const intersects = <T = any>(a: Array<T>, b: Array<T>): boolean => a.some((i) => b.indexOf(i) >= 0);
