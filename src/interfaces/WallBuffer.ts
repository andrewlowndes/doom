import { Sector } from './Sector';
import { Buffer, ElementBuffer } from 'apl-easy-gl';

export interface WallBuffer {
  indices: ElementBuffer;
  position: Buffer;
  uv: Buffer;
  texName: string;
  sector: Sector;
}
