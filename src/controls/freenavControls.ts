import { vec3, mat4 } from 'gl-matrix';

export interface KeyAction {
  keys: Array<number>;
  action: (moveVec: vec3) => void;
}

export const freenavControls = (viewMatrix: mat4, dom: HTMLCanvasElement): () => void => {
  let moveId: number;
  let shouldStop = false;

  const right = vec3.create();
  const up = vec3.create();
  const forward = vec3.create();
  const invViewMatrix = mat4.create();
  const pos = vec3.create();
  const negPos = vec3.create();
  const moveVec = vec3.create();
  const startPos = { x: 0, y: 0 };
  const deltaPos = { x: 0, y: 0 };
  const moveSpeed = 5;
  const moveExtraVec = vec3.create();
  const moveKeys: Array<KeyAction> = [
    { //forward
      keys: [87],
      action: (moveVec: vec3) => {
        extractView();
        vec3.scale(moveExtraVec, forward, moveSpeed);
        vec3.add(moveVec, moveVec, moveExtraVec);
      }
    },
    { //back
      keys: [83],
      action: (moveVec: vec3) => {
        extractView();
        vec3.scale(moveExtraVec, forward, -moveSpeed);
        vec3.add(moveVec, moveVec, moveExtraVec);
      }
    },
    { //left
      keys: [65],
      action: (moveVec: vec3) => {
        extractView();
        vec3.scale(moveExtraVec, right, moveSpeed);
        vec3.add(moveVec, moveVec, moveExtraVec);
      }
    },
    { //right
      keys: [68],
      action: (moveVec: vec3) => {
        extractView();
        vec3.scale(moveExtraVec, right, -moveSpeed);
        vec3.add(moveVec, moveVec, moveExtraVec);
      }
    },
    { //up
      keys: [32],
      action: (moveVec: vec3) => {
        extractView();
        vec3.scale(moveExtraVec, up, -moveSpeed);
        vec3.add(moveVec, moveVec, moveExtraVec);
      }
    },
    { //down
      keys: [17, 67],
      action: (moveVec: vec3) => {
        extractView();
        vec3.scale(moveExtraVec, up, moveSpeed);
        vec3.add(moveVec, moveVec, moveExtraVec);
      }
    }
  ];

  const moveKeysByKey: Record<string, KeyAction> = {};
  const moveKeyDown: Array<KeyAction> = [];
  const moveKeyPressed: Record<string, boolean> = {};

  const extractPosition = () => {
    mat4.invert(invViewMatrix, viewMatrix);
    vec3.set(pos, invViewMatrix[12], invViewMatrix[13], invViewMatrix[14]);
    vec3.negate(negPos, pos);
  };

  const extractView = () => {
    vec3.set(right, viewMatrix[0], viewMatrix[4], viewMatrix[8]);
    vec3.set(up, viewMatrix[1], viewMatrix[5], viewMatrix[9]);
    vec3.set(forward, viewMatrix[2], viewMatrix[6], viewMatrix[10]);
  };

  const move = () => {
    moveId = requestAnimationFrame(move);

    if (!shouldStop && moveKeyDown.length) {
      vec3.set(moveVec, 0, 0, 0);
      
      moveKeyDown.forEach((moveKey) => {
        moveKey.action(moveVec);
      });
      
      vec3.subtract(pos, pos, moveVec);
      vec3.negate(negPos, pos);
      mat4.translate(viewMatrix, viewMatrix, moveVec);
    }
  };
  
  const mouseMove = (e: MouseEvent) => {
    deltaPos.x = (e.pageX - startPos.x) / dom.width;
    deltaPos.y = (e.pageY - startPos.y) / dom.height;
    
    //TODO: limit the angle of rotation when we rotate around y (need to ensure the up direction remains up)
    
    extractView();
    mat4.translate(viewMatrix, viewMatrix, pos);
    mat4.rotateY(viewMatrix, viewMatrix, deltaPos.x*Math.PI);
    
    extractView();
    mat4.rotate(viewMatrix, viewMatrix, deltaPos.y*Math.PI, right);
    mat4.translate(viewMatrix, viewMatrix, negPos);
    
    startPos.x = e.pageX;
    startPos.y = e.pageY;
  };
  
  const mouseUp = () => {
    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('mouseup', mouseUp);
  };
  
  const keyDown = (e: KeyboardEvent) => {
    if (!moveKeyPressed.hasOwnProperty(e.which) && 
      moveKeysByKey.hasOwnProperty(e.which) && 
      moveKeyDown.indexOf(moveKeysByKey[e.which]) < 0) {
        moveKeyPressed[e.which] = true;
        moveKeyDown.push(moveKeysByKey[e.which]);
    }
  };
  
  const keyUp = (e: KeyboardEvent) => {
    if (moveKeyPressed.hasOwnProperty(e.which) && moveKeysByKey.hasOwnProperty(e.which)) {
      delete moveKeyPressed[e.which];
      
      const obj = moveKeysByKey[e.which];
      const index = moveKeyDown.indexOf(obj);
      
      if (index>=0) {
        moveKeyDown.splice(index, 1);
      }
    }
  };

  const startMove = (e: MouseEvent) => {
    startPos.x = e.pageX;
    startPos.y = e.pageY;
    
    extractPosition();
    
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
  };
  
  moveKeys.forEach((moveKey) => {
    moveKey.keys.forEach((key) => {
      moveKeysByKey[key] = moveKey;
    });
  });
  
  moveId = requestAnimationFrame(move);
  
  dom.addEventListener('mousedown', startMove);
  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);

  return () => {
    shouldStop = true;

    cancelAnimationFrame(moveId);
    
    dom.removeEventListener('mousedown', startMove);
    window.removeEventListener('mousemove', mouseMove);
    window.removeEventListener('mouseup', mouseUp);
    window.removeEventListener('keydown', keyDown);
    window.removeEventListener('keyup', keyUp);
  };
};
