export const objectValues = <T extends object>(obj: T): Array<T[keyof T]> => {
  const values = new Array<T[keyof T]>();

  for (const key in obj) {
    values.push(obj[key]);
  }

  return values;
};
