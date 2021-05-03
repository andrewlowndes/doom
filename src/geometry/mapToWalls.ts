import { vec3 } from 'gl-matrix';

import { skyFlats } from '../constants/WadInfo';

import { WallObject } from '../interfaces/WallObject';
import { LineDef } from '../interfaces/LineDef';
import { WadMap } from '../interfaces/WadMap';
import { SideDef } from '../interfaces/SideDef';
import { Vertex } from '../interfaces/Vertex';
import { WallTexture } from '../interfaces/WallTexture';

import { firstObjectKey } from '../utils/firstObjectKey';

interface CreateWallProps {
  v1: Vertex;
  v2: Vertex;
  bottom: number;
  top: number;
  inverse: boolean;
  side: SideDef;
  texSize: WallTexture;
  drawFromTop?: boolean;
  bottomStart?: number;
}

const createWall = (props: CreateWallProps): WallObject => {
  const {
    v1, 
    v2, 
    bottom, 
    top, 
    inverse, 
    side, 
    texSize, 
    drawFromTop, 
    bottomStart
  } = props;

  const wallPositions = new Array<number>();
  const wallUvs = new Array<number>();
  const wallIndices = new Array<number>();
  
  wallPositions.splice(wallPositions.length, 0, 
    v1.x, bottom, -v1.y, //bottom left
    v2.x, bottom, -v2.y, //bottom right
    v1.x, top, -v1.y, //top left
    v2.x, top, -v2.y //top right
  );

  const wallWidth = (vec3.distance([v1.x, bottom, -v1.y], [v2.x, bottom, -v2.y]) / texSize.width),
    wallHeight = ((top - bottom) / texSize.height);
  
  let offsetX = side.xOffset / texSize.width, 
    offsetY = side.yOffset / texSize.height;
  
  if (!drawFromTop) {
    offsetY += (1 - wallHeight) - (bottomStart || 0);
  }

  let posIndex = 0;

  if (inverse) {
    wallUvs.splice(wallUvs.length, 0, 
      offsetX + wallWidth, offsetY + wallHeight,
      offsetX, offsetY + wallHeight,
      offsetX + wallWidth, offsetY,
      offsetX, offsetY
    );

    wallIndices.splice(wallIndices.length, 0, 
      posIndex+2, posIndex+1, posIndex,
      posIndex+3, posIndex+1, posIndex+2
    );
  } else {
    wallUvs.splice(wallUvs.length, 0, 
      offsetX, offsetY + wallHeight,
      offsetX + wallWidth, offsetY + wallHeight,
      offsetX, offsetY,
      offsetX + wallWidth, offsetY
    );

    wallIndices.splice(wallIndices.length, 0, 
      posIndex, posIndex+1, posIndex+2,
      posIndex+2, posIndex+1, posIndex+3
    );
  }

  return {
    position: new Float32Array(wallPositions),
    uv: new Float32Array(wallUvs),
    indices: new Uint16Array(wallIndices)
  };
}

const resolveTexName = (str: string): string | undefined => {
  return str !== '-' ? str : undefined;
};

const resolveSolidTexName = (strs: Array<string>, texturesByName: Record<string, WallTexture>): string | undefined => {
  for (let i=0; i<strs.length; i++) {
    const texName = resolveTexName(strs[i]);

    if (texName && !texturesByName[texName].transparent) {
      return texName;
    }
  }
};
  
const procesSideDef = (map: WadMap, sideDef: number, otherSideDef: number, lineDef: LineDef, texturesByName: Record<string, WallTexture>, inverse: boolean, defaultWall: string): Array<WallObject> => {
  const v1 = map.VERTEXES[lineDef.v1];
  const v2 = map.VERTEXES[lineDef.v2];
  const side = map.SIDEDEFS[sideDef];
  const sector = map.SECTORS[side.sector];
  
  let bottom = sector.floorheight;
  let top = sector.ceilingheight;

  const walls = new Array<WallObject>();

  if (otherSideDef===-1) {
    if (resolveTexName(side.midTexture)) {
      walls.push({
        sector,
        texName: side.midTexture,
        ...createWall({ v1, v2, bottom, top, inverse, side, texSize: texturesByName[side.midTexture], drawFromTop: !lineDef.flags.lowerUnpegged })
      });
    } else if (resolveTexName(side.bottomTexture)) {
      walls.push({
        sector,
        texName: side.bottomTexture,
        ...createWall({ v1, v2, bottom, top, inverse, side, texSize: texturesByName[side.bottomTexture], drawFromTop: !lineDef.flags.lowerUnpegged })
      });
    } else if (resolveTexName(side.topTexture)) {
      walls.push({
        sector,
        texName: side.topTexture,
        ...createWall({ v1, v2, bottom, top, inverse, side, texSize: texturesByName[side.topTexture], drawFromTop: lineDef.flags.upperUnpegged })
      });
    }

    return walls;
  }

  const otherSide = map.SIDEDEFS[otherSideDef];
  const otherSector = map.SECTORS[otherSide.sector];

  //TODO: if the sector ceiling height is lower than the other sector this ceiling is lower and there are no side-textures we need to place some sky  
  if (resolveTexName(side.midTexture)) {
    const midBottom = Math.max(sector.floorheight, otherSector.floorheight);
    const midTop = Math.min(sector.ceilingheight, otherSector.ceilingheight);

    walls.push({
      sector,
      texName: side.midTexture,
      ...createWall({ v1, v2, bottom: midBottom, top: midTop, inverse, side, texSize: texturesByName[side.midTexture], drawFromTop: !lineDef.flags.lowerUnpegged })
    });
  }

  //draw a lower wall if it is visible
  if (otherSector.floorheight > bottom) {
    const tex = resolveSolidTexName([
      side.bottomTexture, 
      side.topTexture, 
      side.midTexture, 
      otherSide.bottomTexture, 
      otherSide.topTexture, 
      otherSide.midTexture,
      defaultWall
    ], texturesByName);

    if (tex) {
      //for lower unpegged walls, need additional offset so the texture aligns with the wall height
      const bottomStart = lineDef.flags.lowerUnpegged ? ((top-bottom) - texturesByName[tex].height) / texturesByName[tex].height : 0;

      walls.push({
        sector,
        texName: tex,
        ...createWall({ v1, v2, bottom: sector.floorheight, top: otherSector.floorheight, inverse, side, texSize: texturesByName[tex], drawFromTop: !lineDef.flags.lowerUnpegged, bottomStart: -bottomStart })
      });
    }
  }

  //draw an upper wall if it is visible
  if (otherSector.ceilingheight < top && (skyFlats.indexOf(otherSector.ceilingpic) <0  || skyFlats.indexOf(sector.ceilingpic) < 0)) {
    let tex = resolveSolidTexName([
      side.topTexture, 
      side.bottomTexture, 
      side.midTexture, 
      otherSide.topTexture, 
      otherSide.bottomTexture, 
      otherSide.midTexture,
      defaultWall
    ], texturesByName);

    if (tex) {
      walls.push({
        sector,
        texName: tex,
        ...createWall({ v1, v2, bottom: otherSector.ceilingheight, top: sector.ceilingheight, inverse, side, texSize: texturesByName[tex], drawFromTop: lineDef.flags.upperUnpegged })
      });
    }
  }

  return walls;
}

export const mapToWalls = (map: WadMap, texturesByName: Record<string, WallTexture>): Array<WallObject> => {
  const walls = new Array<WallObject>();

  const defaultWall = 'BLAKWAL1' in texturesByName ? 'BLAKWAL1' : firstObjectKey(texturesByName)!;

  //now draw the walls
  map.LINEDEFS.forEach((lineDef) => {
    //line def (x/y pos)
    // - get right/left side-def from line def (tex pegging/offset for u/v)
    // - get sector from each side-def (height, z pos, ceiling and floor pos/tex, light)
    const sideResults = procesSideDef(map, lineDef.sidenum[0], lineDef.sidenum[1], lineDef, texturesByName, false, defaultWall);
    walls.splice(walls.length, 0, ...sideResults);

    if (lineDef.sidenum[1] !== -1) {
      const otherSideResults = procesSideDef(map, lineDef.sidenum[1], lineDef.sidenum[0], lineDef, texturesByName, true, defaultWall);
      walls.splice(walls.length, 0, ...otherSideResults);
    }
  });

  return walls;
};
