import { createBuffer, createElementBuffer } from 'apl-easy-gl';

import { ThingBuffer } from "../interfaces/ThingBuffer";

export const createThing = (gl: WebGLRenderingContext): ThingBuffer => {
  return {
    position: createBuffer(gl, new Float32Array([
      0, -0.5, -0.5, //bottom left
      0, -0.5, 0.5, //bottom right
      0, 0.5, -0.5, //top left
      0, 0.5, 0.5 //top right
    ]), 3),
    uv: createBuffer(gl, new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ]), 2),
    indices: createElementBuffer(gl, new Uint16Array([
      0, 1, 2,
      2, 1, 3
    ]), 1)
  };
};
