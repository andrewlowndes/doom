//safety 'while' loop with boundary for easy debugging
export const limitedWhile = (whileFunc: () => boolean | void, callFunc: () => boolean | void, limit: number = 1000, limitHitFunc?: () => void) => {
  let numCalls = 0;
  
  while (whileFunc() && numCalls <= limit) {
    if (callFunc() === false) {
      break;
    }
    
    numCalls++;
  }
  
  if (numCalls >= limit && limitHitFunc) {
    limitHitFunc();
  }
};
