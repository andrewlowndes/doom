import { Buffer, ElementBuffer } from 'apl-easy-gl';

export interface ThingBuffer {
  indices: ElementBuffer;
  position: Buffer;
  uv: Buffer;
}
