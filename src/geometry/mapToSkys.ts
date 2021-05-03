import { createBuffer, createElementBuffer } from 'apl-easy-gl';

import { skyFlats } from '../constants/WadInfo';

import type { WadMap } from '../interfaces/WadMap';
import type { SkyBuffer } from "../interfaces/SkyBuffer";
import type { SideDef } from "../interfaces/SideDef";
import type { Sector } from "../interfaces/Sector";
import type { LineDef } from '../interfaces/LineDef';
import type { Triangle } from '../interfaces/Triangle';
import type { Vertex } from '../interfaces/Vertex';

import type { LinkedSkySectors } from '../wad/getLinkedSkySectors';

const createSkyFlat = (gl: WebGLRenderingContext, height: number, triangles: Array<Triangle>, reverseOrientation?: boolean): SkyBuffer => {
  const skyPositions = new Array<number>();
  const skyIndices = new Array<number>();

  let posIndex = 0;
  
  triangles.forEach((triangle) => {
    const p1 = triangle[0],
      p2 = triangle[1],
      p3 = triangle[2];
    
    skyPositions.splice(skyPositions.length, 0, 
      p1.x, height, -p1.y,
      p2.x, height, -p2.y,
      p3.x, height, -p3.y
    );
    
    if (reverseOrientation) {
      skyIndices.splice(skyIndices.length, 0, posIndex+2, posIndex+1, posIndex);
    } else {
      skyIndices.splice(skyIndices.length, 0, posIndex, posIndex+1, posIndex+2);
    }
    
    posIndex += 3;
  });
  
  return {
    position: createBuffer(gl, new Float32Array(skyPositions), 3),
    indices: createElementBuffer(gl, new Uint16Array(skyIndices), 1),
  };
}

const createSkyWall = (gl: WebGLRenderingContext, v1: Vertex, v2: Vertex, bottomPos: number, topPos: number, backface: boolean): SkyBuffer => {
  //render the inverse with a sky to negate it
  const position = [
    v1.x, bottomPos, -v1.y, //bottom left
    v2.x, bottomPos, -v2.y, //bottom right
    v1.x, topPos, -v1.y, //top left
    v2.x, topPos, -v2.y //top right
  ];

  let indices = new Array<number>();

  let posIndex = 0;

  if (backface) {
    indices = [
      posIndex+2, posIndex+1, posIndex,
      posIndex+3, posIndex+1, posIndex+2
    ];
  } else {
    indices = [
      posIndex, posIndex+1, posIndex+2,
      posIndex+2, posIndex+1, posIndex+3
    ];
  }

  return {
    indices: createElementBuffer(gl, new Uint16Array(indices), 1),
    position: createBuffer(gl, new Float32Array(position), 3)
  };
};

const procesSideDef = (gl: WebGLRenderingContext, map: WadMap, sideDef: number, otherSideDef: number, lineDef: LineDef, linkedSkySectors: LinkedSkySectors, inverse?: boolean): Array<SkyBuffer> => {
  const v1 = map.VERTEXES[lineDef.v1];
  const v2 = map.VERTEXES[lineDef.v2];
  const side = map.SIDEDEFS[sideDef];
  const sector = map.SECTORS[side.sector];
  
  let otherSide: SideDef | undefined;
  let otherSector: Sector | undefined;

  if (otherSideDef !== -1) {
    otherSide = map.SIDEDEFS[otherSideDef];
    otherSector = map.SECTORS[otherSide.sector];
  }
  
  const skys = new Array<SkyBuffer>();
  
  if (skyFlats.indexOf(sector.ceilingpic) >= 0) {
    const linkedSkySector = linkedSkySectors.ceilings[side.sector];

    if (linkedSkySector.height !== sector.ceilingheight && (!otherSector || skyFlats.indexOf(otherSector.ceilingpic) < 0 || linkedSkySector.sectorIndex !== linkedSkySectors.ceilings[otherSide!.sector].sectorIndex)) {
      skys.push(createSkyWall(gl, v1, v2, sector.ceilingheight, linkedSkySector.height, Boolean(inverse)));
    }
  }

  if (skyFlats.indexOf(sector.floorpic) >= 0) {
    const linkedFloorSector = linkedSkySectors.floors[side.sector];

    if (linkedFloorSector.height !== sector.floorheight && (!otherSector || skyFlats.indexOf(otherSector.floorpic) < 0 || linkedFloorSector.sectorIndex !== linkedSkySectors.floors[otherSide!.sector].sectorIndex)) {
      skys.push(createSkyWall(gl, v1, v2, sector.floorheight, linkedFloorSector.height, !inverse));
    }
  }

  return skys;
};

export const mapToSkys = (gl: WebGLRenderingContext, map: WadMap, trianglesBySector: Record<number, Array<Triangle>>, linkedSkySectors: LinkedSkySectors): Array<SkyBuffer> => {
  const skys = new Array<SkyBuffer>();

  map.LINEDEFS.forEach((lineDef) => {
    const sideResults = procesSideDef(gl, map, lineDef.sidenum[0], lineDef.sidenum[1], lineDef, linkedSkySectors);
    skys.splice(skys.length, 0, ...sideResults);

    if (lineDef.sidenum[1] !== -1) {
      const otherSideResults = procesSideDef(gl, map, lineDef.sidenum[1], lineDef.sidenum[0], lineDef, linkedSkySectors, true);
      skys.splice(skys.length, 0, ...otherSideResults);
    }
  });

  map.SECTORS.forEach((sector, sectorIndex) => {
    const triangles = trianglesBySector[sectorIndex];

    if (!triangles) {
      return;
    }

    const floorSector = linkedSkySectors.floors[sectorIndex];
    const ceilingSector = linkedSkySectors.ceilings[sectorIndex];

    //we need to add the triangles to the ceiling and the floor
    const skyCeiling = skyFlats.indexOf(sector.ceilingpic) >= 0;
    const skyFloor = skyFlats.indexOf(sector.floorpic) >= 0;

    if (sector.ceilingheight > sector.floorheight) {
      if (skyFloor) {
        skys.push(createSkyFlat(gl, floorSector.height, triangles, false));
      }

      if (skyCeiling) {
        skys.push(createSkyFlat(gl, ceilingSector.height, triangles, true));
      }
    } else if (skyCeiling) {
      skys.push(createSkyFlat(gl, sector.floorheight, triangles, false));
      skys.push(createSkyFlat(gl, ceilingSector.height, triangles, true));
    } else if (skyFloor) {
      skys.push(createSkyFlat(gl, floorSector.height, triangles, false));
      skys.push(createSkyFlat(gl, sector.ceilingheight, triangles, true));
    }
  });

  return skys;
};
