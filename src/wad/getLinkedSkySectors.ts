import { skyFlats } from '../constants/WadInfo';
import { WadMap } from '../interfaces/WadMap';

export interface LinkedSector {
  sectorIndex: number;
  height: number;
}

export interface LinkedSkySectors {
  ceilings: Record<number, LinkedSector>;
  floors: Record<number, LinkedSector>;
}

const mergeGroupedSectors = (map: WadMap, skySectorsBySector: Record<string, Array<string>>): Array<Set<string>> => {
  map.LINEDEFS.forEach((lineDef) => {
    if (lineDef.sidenum[0] !== -1 && lineDef.sidenum[1] !== -1) {
      const sectorNumber = String(map.SIDEDEFS[lineDef.sidenum[0]].sector),
        otherSectorNumber = String(map.SIDEDEFS[lineDef.sidenum[1]].sector);
      
      if (sectorNumber in skySectorsBySector && otherSectorNumber in skySectorsBySector) {
        skySectorsBySector[sectorNumber].push(otherSectorNumber);
        skySectorsBySector[otherSectorNumber].push(sectorNumber);
      }
    }
  });

  const linkedSkySectorsList = new Array<Set<string>>();

  for (let sectorNumber in skySectorsBySector) {
    if (!(skySectorsBySector.hasOwnProperty(sectorNumber))) {
      continue;
    }

    let connectedSectors = skySectorsBySector[sectorNumber];

    let i = 0;
    while (i < connectedSectors.length) {
      const connectedSector = connectedSectors[i];
      if (skySectorsBySector.hasOwnProperty(connectedSector)) {
        connectedSectors = [...connectedSectors, ...(skySectorsBySector[connectedSector].filter((newItem) => connectedSectors.indexOf(newItem) < 0))];
        delete skySectorsBySector[connectedSector];
      }
      i++;
    }

    connectedSectors.push(sectorNumber);
    linkedSkySectorsList.push(new Set(connectedSectors));
  }

  return linkedSkySectorsList;
};

export const getLinkedSkySectors = (map: WadMap): LinkedSkySectors => {
  const skySectorsBySector: Record<string, Array<string>> = {};
  const floorskySectorsBySector: Record<string, Array<string>> = {};
    
  map.SECTORS.forEach((sector, i) => {
    if (skyFlats.indexOf(sector.ceilingpic) >= 0) {
      skySectorsBySector[String(i)] = new Array<string>();
    }
    if (skyFlats.indexOf(sector.floorpic) >= 0) {
      floorskySectorsBySector[String(i)] = new Array<string>();
    }
  });

  const linkedSkySectorsList = mergeGroupedSectors(map, skySectorsBySector);
  const linkedFloorSkySectorsList = mergeGroupedSectors(map, floorskySectorsBySector);
  
  const ceilings: Record<number, LinkedSector> = {};

  linkedSkySectorsList.forEach((linkedSkySectors, sectorIndex) => {
    const height = Array.from(linkedSkySectors).reduce((acc, sector) => {
      return Math.max(acc, map.SECTORS[parseInt(sector, 10)].ceilingheight);
    }, 0);

    linkedSkySectors.forEach((sector) => {
      ceilings[parseInt(sector, 10)] = { sectorIndex, height };
    });
  });

  const floors: Record<number, LinkedSector> = {};

  linkedFloorSkySectorsList.forEach((linkedSkySectors, sectorIndex) => {
    const height = Array.from(linkedSkySectors).reduce((acc, sector) => {
      return Math.min(acc, map.SECTORS[parseInt(sector, 10)].floorheight);
    }, 0);

    linkedSkySectors.forEach((sector) => {
      floors[parseInt(sector, 10)] = { sectorIndex, height };
    });
  });

  return {
    ceilings,
    floors
  };
};
