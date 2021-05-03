import { createBuffer, createElementBuffer } from "apl-easy-gl";

import type { FlatBuffer } from "../interfaces/FlatBuffer";
import type { WadMap } from "../interfaces/WadMap";
import type { SkyBuffer } from "../interfaces/SkyBuffer";
import type { ThingBuffer } from "../interfaces/ThingBuffer";
import type { Triangle } from "../interfaces/Triangle";
import type { Vertex } from "../interfaces/Vertex";
import type { WallBuffer } from "../interfaces/WallBuffer";
import type { WallTexture } from "../interfaces/WallTexture";

import { getLineDefsBySector } from "../wad/getLineDefsBySector";
import { getLinkedSkySectors } from "../wad/getLinkedSkySectors";
import { createThing } from "./createThing";
import { mapToFlats } from "./mapToFlats";
import { mapToSkys } from "./mapToSkys";
import { mapToWalls } from "./mapToWalls";
import { sectorLinesToTriangles } from "./sectorLinesToTriangles";

export interface MapBuffers {
  sectorTriangles: Record<number, Array<Triangle>>;
  flats: Array<FlatBuffer>;
  walls: Array<WallBuffer>;
  skys: Array<SkyBuffer>;
  thing: ThingBuffer;
}

export const createMapBuffers = (gl: WebGLRenderingContext, map: WadMap, texturesByName: Record<string, WallTexture>): MapBuffers => {
  const linkedSkySectors = getLinkedSkySectors(map);
  const lineDefsBySector = getLineDefsBySector(map);

  const sectorTriangles = map.SECTORS.reduce<Record<number, Array<Triangle>>>((acc, _, sectorIndex) => {
    try {
      if (lineDefsBySector[sectorIndex]) {
        acc[sectorIndex] = sectorLinesToTriangles(map, lineDefsBySector[sectorIndex]);
      }
    } catch (e) {
      console.log(`Could not create triangles for map, Sector: ${sectorIndex}`);
      console.log(JSON.stringify(lineDefsBySector[sectorIndex]));

      const vertexesById: Record<number, Vertex> = {};

      lineDefsBySector[sectorIndex].forEach((line) => {
        vertexesById[line.v1] = map.VERTEXES[line.v1];
        vertexesById[line.v2] = map.VERTEXES[line.v2];
      });

      console.log(JSON.stringify(vertexesById));
    }

    return acc;
  }, {});


  //create 3d triangle objects out of the flats and walls for intersections testing
  const flats = mapToFlats(map, sectorTriangles);
  const walls = mapToWalls(map, texturesByName);

  return {
    sectorTriangles,
    flats: flats.map((flat) => ({
      position: createBuffer(gl, flat.position, 3),
      indices: createElementBuffer(gl, flat.indices, 1),
      flatName: flat.flatName,
      sector: flat.sector
    })),
    walls: walls.map((wall) => ({
      position: createBuffer(gl, wall.position, 3),
      uv: createBuffer(gl, wall.uv, 2),
      indices: createElementBuffer(gl, wall.indices, 1),
      texName: wall.texName!,
      sector: wall.sector!
    })),
    skys: mapToSkys(gl, map, sectorTriangles, linkedSkySectors),
    thing: createThing(gl)
  };
};
