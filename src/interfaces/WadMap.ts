import { Sector } from './Sector';
import { SideDef } from './SideDef';
import { LineDef } from './LineDef';
import { Vertex } from './Vertex';
import { Thing } from './Thing';

export interface WadMap {
  THINGS: Array<Thing>;
  VERTEXES: Array<Vertex>;
  LINEDEFS: Array<LineDef>;
  SIDEDEFS: Array<SideDef>;
  SECTORS: Array<Sector>;
  [key: string]: any;
}
