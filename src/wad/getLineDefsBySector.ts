import { LineDef } from '../interfaces/LineDef';
import { WadMap } from '../interfaces/WadMap';
import { SectorLine } from "../interfaces/SectorLine";

export const getLineDefsBySector = (map: WadMap): Record<number, Array<SectorLine>> => {
  // - link the linedefs to a sector based on connected sectors and connected vertexes
  const sectorLines: Record<number, Array<SectorLine>> = {};
    
  const registerSector = (sector: number, inverse: boolean, lineDef: LineDef) => {
    if (!(sector in sectorLines)) {
      sectorLines[sector] = [];
    }
    
    sectorLines[sector].push({
      v1: (inverse ? lineDef.v2 : lineDef.v1),
      v2: (inverse ? lineDef.v1 : lineDef.v2)
    });
  };

  map.LINEDEFS.forEach((lineDef) => {
    const leftSide = lineDef.sidenum[0];
    const rightSide = lineDef.sidenum[1];
    const hasLeft = leftSide!=-1;
    const hasRight = rightSide!=-1;
    
    if (hasLeft && hasRight) {
      const leftSector = map.SIDEDEFS[leftSide].sector;
      const rightSector = map.SIDEDEFS[rightSide].sector;

      if (leftSector !== rightSector) {
        registerSector(leftSector, false, lineDef);
        registerSector(rightSector, true, lineDef);
      }
    } else if (hasLeft) {
      registerSector(map.SIDEDEFS[leftSide].sector, false, lineDef);
    } else if (hasRight) {
      registerSector(map.SIDEDEFS[rightSide].sector, true, lineDef);
    }
  });

  return sectorLines;
};
