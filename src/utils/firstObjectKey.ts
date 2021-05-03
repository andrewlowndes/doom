export const firstObjectKey = <T extends object = object>(obj: T): keyof T | undefined => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return key;
    }
  }
};
