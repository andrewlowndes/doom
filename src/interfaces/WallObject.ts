import { Sector } from "./Sector";

export interface WallObject {
  position: Float32Array;
  uv: Float32Array;
  indices: Uint16Array;
  sector?: Sector;
  texName?: string;
}
