import { Patch } from './Patch';

export interface Texture {
  texName: string;
  texWidth: number;
  texHeight: number;
  patches: Array<Patch>;
}
