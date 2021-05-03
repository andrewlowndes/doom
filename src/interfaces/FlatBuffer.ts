import { Buffer, ElementBuffer } from 'apl-easy-gl';
import { Sector } from './Sector';

export interface FlatBuffer {
  position: Buffer;
  indices: ElementBuffer;
  flatName: string;
  sector: Sector;
}
