export const firstObjectValue = <T extends object = object>(obj: T): T[keyof T] | undefined => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return obj[key];
    }
  }
};
