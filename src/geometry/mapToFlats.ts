import { skyFlats } from '../constants/WadInfo';

import { FlatObject } from '../interfaces/FlatObject';
import { Triangle } from '../interfaces/Triangle';
import { WadMap } from '../interfaces/WadMap';

const createFlat = (triangles: Array<Triangle>, height: number, reverseOrientation?: boolean): Pick<FlatObject, 'position' | 'indices'> => {
  const flatPositions = new Array<number>();
  const flatIndices = new Array<number>();

  let posIndex = 0;
  
  triangles.forEach((triangle) => {
    const p1 = triangle[0];
    const p2 = triangle[1];
    const p3 = triangle[2];
    
    flatPositions.splice(flatPositions.length, 0,
      p1.x, height, -p1.y,
      p2.x, height, -p2.y,
      p3.x, height, -p3.y
    );
    
    if (reverseOrientation) {
      flatIndices.splice(flatIndices.length, 0, posIndex+2, posIndex+1, posIndex);
    } else {
      flatIndices.splice(flatIndices.length, 0, posIndex, posIndex+1, posIndex+2);
    }
    
    posIndex += 3;
  });
  
  return {
    position: new Float32Array(flatPositions),
    indices: new Uint16Array(flatIndices)
  };
};

export const mapToFlats = (map: WadMap, trianglesBySector: Record<number, Array<Triangle>>): Array<FlatObject> => {
  const flats = new Array<FlatObject>();

  map.SECTORS.forEach((sector, sectorIndex) => {
    const triangles = trianglesBySector[sectorIndex];

    if (!triangles) {
      return;
    }
    
    //lightIntensity = Math.sin(lightIntensity * 1.57); //different easing

    //we need to add the triangles to the ceiling and the floor
    if (sector.ceilingheight > sector.floorheight) {
      if (skyFlats.indexOf(sector.floorpic) < 0) {
        flats.push({
          sector,
          flatName: sector.floorpic,
          ...createFlat(triangles, sector.floorheight, false)
        });
      }

      if (skyFlats.indexOf(sector.ceilingpic) < 0) {
        flats.push({
          sector,
          flatName: sector.ceilingpic,
          ...createFlat(triangles, sector.ceilingheight, true)
        });
      }
    }
  });

  return flats;
}
