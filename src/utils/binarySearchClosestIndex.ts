
export const binarySearchClosestIndex = <T>(arr: Array<T>, compareFunc: (item: T, arr: Array<T>, index: number) => number): number | undefined => {
  if (!arr.length) {
    return;
  }
  
  const numSteps = Math.ceil(Math.log(arr.length) / Math.LN2);
  
  let low = 0;
  let high = arr.length;
  let diff: number;
  let mid: number;
  let compValue: number;
  
  for (let i=0; i<numSteps; i++) {
    diff = high - low;
    mid = Math.floor(low + diff / 2);
    compValue = compareFunc(arr[mid], arr, mid);
    
    if (compValue > 0) {
      low = mid;
    } else if (compValue < 0) {
      high = mid;
    } else {
      low = mid;
      break;
    }
  }
      
  //get the highest index for duplicate entries
  do {
    low++;
  } while (low < arr.length && !compareFunc(arr[low], arr, low));
  
  return low-1;
};
