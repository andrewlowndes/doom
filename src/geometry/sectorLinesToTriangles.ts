import earcut from 'earcut';

import { WadMap } from "../interfaces/WadMap";
import { Triangle } from "../interfaces/Triangle";
import { Vertex } from '../interfaces/Vertex';

import { objectValues } from '../utils/objectValues';
import { subtract, angle } from "../utils/math";

interface Line {
  v1: number;
  v2: number;
}

type Strand = Array<Line>; 
type Strands = Array<Strand>;

type Sector = Array<Line>;
type Sectors = Array<Sector>;

type SharedVertices = Record<string, {
  v1: Array<Line>;
  v2: Array<Line>;
}>;

const determineSharedVertices = (lines: Array<Line>): SharedVertices => {
  const sharedVertices: SharedVertices = {};
  const visitedVertices: Record<number, number> = {};

  const checkVertex = (line: Line, prop: 'v1' | 'v2') => {
    const vertex = line[prop];
    
    if (vertex in sharedVertices) {
      sharedVertices[vertex][prop].push(line);
    } else {
      if (vertex in visitedVertices) {
        if (visitedVertices[vertex] == 2) {
          sharedVertices[vertex] = { v1: [], v2: [] };
          sharedVertices[vertex][prop].push(line);
          delete visitedVertices[vertex];
        } else {
          visitedVertices[vertex]++;
        }
      } else {
        visitedVertices[vertex] = 1;
      }
    }
  };
  
  for (const line of lines) {
    checkVertex(line, 'v1');
    checkVertex(line, 'v2');
  }
  
  return sharedVertices;
};

const groupsLinesIntoStrands = (lines: Array<Line>, sharedVertices: SharedVertices): Strands => {
  //produce strands from the lines skipping the shared vertices for now
  const remainingLines = Array.from(lines);
  const linesByV1: Record<number, Line> = {};
  const linesByV2: Record<number, Line> = {};
  
  remainingLines.forEach((line) => {
    linesByV1[line.v1] = line;
    linesByV2[line.v2] = line;
  });
  
  const strands: Strands = [];
  
  while (remainingLines.length) {
    const nextLine = remainingLines.pop()!;
    const newStrand: Strand = [nextLine];
    
    let testVertex = nextLine.v1;
    let testVertex2 = nextLine.v2;
    let testLine = linesByV2[testVertex];
    let testLine2 = linesByV1[testVertex2];

    while (testLine && !(testVertex in sharedVertices) && newStrand.indexOf(testLine) < 0) {
      newStrand.unshift(testLine);
      remainingLines.splice(remainingLines.indexOf(testLine), 1);
      testVertex = testLine.v1;
      testLine = linesByV2[testVertex];
    }
    
    while (testLine2 && !(testVertex2 in sharedVertices) && newStrand.indexOf(testLine2) < 0) {
      newStrand.push(testLine2);
      remainingLines.splice(remainingLines.indexOf(testLine2), 1);
      testVertex2 = testLine2.v2;
      testLine2 = linesByV1[testVertex2];
    }

    if (!testLine && !testLine2) {
      //sector is invalid! - try and 'fix' the sector by completing it
      newStrand.push({ v1: newStrand[newStrand.length - 1].v2, v2: newStrand[0].v1 });
    } else if (!testLine || !testLine2) {
      //strand is invalid! - try and 'fix' the sector by removing it
      continue
    }

    strands.push(newStrand);
  }
  
  return strands;
}

const mergeColinearStrandLines = (map: WadMap, strand: Strand): Array<Line> => {
  //simplify by merging joining lines that have the same direction
  const angles = strand.map((line) => {
    return angle(subtract(map.VERTEXES[line.v2], map.VERTEXES[line.v1]));
  });
  
  const lines = new Array<Line>();
  
  for (let i=0; i<strand.length;) {
    const line = strand[i];
    const lineAngle = angles[i];
    
    while (i < strand.length && angles[i] === lineAngle) {
      i++;
    }
    
    lines.push({
      v1: line.v1,
      v2: strand[i-1].v2
    });
  }
  
  return lines;
};

const strandsToSectors = (strands: Strands): Sectors => {
  const sectors: Sectors = [];
  const remainingStrands = Array.from(strands);

  remainingStrands.slice().reverse().forEach((strand, strandIndex, strandObj) => {
    const firstLine = strand[0];
    const lastLine = strand[strand.length-1];
    
    if (firstLine.v1 === lastLine.v2) {
      if (strand.length > 2) {
        sectors.push(strand);
      }
      
      remainingStrands.splice(strandObj.length - 1 - strandIndex, 1);
    }
  });

  //remove a singular connecting line that are used to bridge sectors (MAP19)
  if (remainingStrands.length < 2) {
    return sectors;
  }

  const strandsByV2: Record<number, Array<Strand>> = {};
  remainingStrands.forEach((strand) => {
    const v2 = strand[strand.length-1].v2;
    
    strandsByV2[v2] = strandsByV2[v2] || [];
    strandsByV2[v2].push(strand);
  });
  
  remainingStrands.sort((a, b) => {
    return a.length-b.length;
  });
  
  const completeStrandSectors = completeStrands(remainingStrands, strandsByV2);
  
  if (completeStrandSectors) {
    sectors.push(...completeStrandSectors);
  } else {
    throw new Error('Failed to create sectors :(');
  }

  return sectors;
};

//run through the strands and try and complete them, warning: mutates the provided params
const completeStrands = (remainingStrands: Strands, strandsByV2: Record<number, Array<Strand>>): Sectors | undefined => {
  const sectors: Sectors = [];
  
  while (remainingStrands.length) {
    const nextStrand = remainingStrands.shift()!;
    const lastPoint = nextStrand[nextStrand.length-1].v2;
    let firstPoint = nextStrand[0].v1;
    
    while (firstPoint !== lastPoint) {
      const possibleRoutes = strandsByV2[firstPoint];
      
      if (!possibleRoutes || !possibleRoutes.length) {
        //invalid, bail
        return;
      }
      
      if (possibleRoutes.length == 1) {
        remainingStrands.splice(remainingStrands.indexOf(possibleRoutes[0]), 1);
        delete strandsByV2[firstPoint];
        nextStrand.unshift(...possibleRoutes[0]);
        firstPoint = nextStrand[0].v1;
      } else {
        //try and complete the remaining strand for each route, one at a time and then add it on
        for (let routeIndex = 0; routeIndex < possibleRoutes.length; routeIndex++) {
          const possibleRoute = possibleRoutes[routeIndex];
          
          const testStrands = [ ...remainingStrands ];
          testStrands.splice(testStrands.indexOf(possibleRoute), 1);
          testStrands.unshift([ ...possibleRoute, ...nextStrand ]);
          
          const testStrandsByV2 = { ...strandsByV2 };
          testStrandsByV2[firstPoint] = [ ...testStrandsByV2[firstPoint] ];
          testStrandsByV2[firstPoint].splice(routeIndex, 1);
          
          //if the solution ahead is valid
          const completeSectors = completeStrands(testStrands, testStrandsByV2);
          
          if (completeSectors) {
            return [...sectors, ...completeSectors];
          }
        }
        
        //no solution here, bail
        return;
      }
    }
    
    sectors.push(nextStrand);
  }
  
  return sectors;
};

const sectorsToTriangles = (map: WadMap, sectors: Sectors): Array<Triangle> => {
  const outerPolygons = new Array<Array<number>>();
  const innerPolygons  = new Array<Array<number>>();
  
  sectors.forEach((lines) => {
    let sum = 0;
    let prevVertex = map.VERTEXES[lines[0].v1];
    const triPoints: Array<number> = [prevVertex.x, prevVertex.y];
    
    lines.forEach((line) => {
      const vertex = map.VERTEXES[line.v2];
      
      sum += (vertex.x - prevVertex.x) * (vertex.y + prevVertex.y);
      triPoints.push(vertex.x, vertex.y);
      prevVertex = vertex;
    });
    
    if (sum < 0) {
      innerPolygons.push(triPoints);
    } else {
      outerPolygons.push(triPoints);
    }
  });

  //now punch holes through each outer polygon
  const triangles = new Array<Triangle>();

  outerPolygons.forEach((outerPolygon, i) => {
    const vertices = Array.from(outerPolygon);
    
    const holeIndices = new Array<number>();
    innerPolygons.forEach((innerPolygon) => {
      holeIndices.push(vertices.length / 2);
      vertices.push(...innerPolygon);
    });
    
    const trianglesIndexes = earcut(vertices, holeIndices);
  
    const getVertexFromIndex = (index: number): Vertex => {
      const vertexIndex = index*2;
      return { x: vertices[vertexIndex], y: vertices[vertexIndex+1] };
    };
    
    for (let j=0; j<trianglesIndexes.length; j+=3) {
      triangles.push([
        getVertexFromIndex(trianglesIndexes[j]),
        getVertexFromIndex(trianglesIndexes[j+1]),
        getVertexFromIndex(trianglesIndexes[j+2])
      ]);
    }
  });
  
  return triangles;
};

const deduplicateLines = (lines: Array<Line>): Array<Line> => {
  return lines = objectValues(lines.reduce<Record<string, Line>>((acc, line) => {
    acc[line.v1 + ',' + line.v2] = line;
    return acc;
  }, {}));
};

export const sectorLinesToTriangles = (map: WadMap, lines: Array<Line>): Array<Triangle> => {
  const deduplicatedLines = deduplicateLines(lines);

  const sharedVertices = determineSharedVertices(deduplicatedLines);
  const strands = groupsLinesIntoStrands(deduplicatedLines, sharedVertices).map((strand) => mergeColinearStrandLines(map, strand));
  const sectors = strandsToSectors(strands).map((sector) => mergeColinearStrandLines(map, sector));

  return sectorsToTriangles(map, sectors);
};
