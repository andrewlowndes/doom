import { Sector } from "./Sector";

export interface FlatObject {
  sector: Sector;
  flatName: string;
  position: Float32Array;
  indices: Uint16Array;
}
