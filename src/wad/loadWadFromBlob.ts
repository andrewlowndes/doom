import { animatedFlatMap, animatedTextureMap } from './../constants/WadInfo';
import { difficulty } from '../constants/WadInfo';

import { Lump, LumpName } from './../interfaces/Lump';
import { Patch } from '../interfaces/Patch';
import { BlockMap } from '../interfaces/BlockMap';
import { Thing } from '../interfaces/Thing';
import { Segment } from '../interfaces/Segment';
import { Node } from '../interfaces/Node';
import { SSector } from '../interfaces/SSector';
import { Vertex } from '../interfaces/Vertex';
import { Sector } from '../interfaces/Sector';
import { SideDef } from '../interfaces/SideDef';
import { LineDef } from '../interfaces/LineDef';
import { Wad } from '../interfaces/Wad';

import { ByteReader } from '../classes/ByteReader';

enum LoadMode {
  normal,
  sprites,
  flat,
  map
};

const mapLumps = [
  LumpName.THINGS, 
  LumpName.LINEDEFS, 
  LumpName.SIDEDEFS, 
  LumpName.VERTEXES, 
  LumpName.SEGS, 
  LumpName.SSECTORS, 
  LumpName.NODES, 
  LumpName.SECTORS, 
  LumpName.REJECT, 
  LumpName.BLOCKMAP, 
  LumpName.BEHAVIOR
];

export const loadWadFromUrl = async (url: string): Promise<Wad> => {
  const result = await fetch(url);
  return loadWadFromBlob(await result.arrayBuffer());
};

export const loadWadFromBlob = (arrayBuffer: ArrayBuffer): Wad => {
  //now parse the wad file like any other file type
  const byteReader = new ByteReader(arrayBuffer);

  //read the header of the wad file
  const wadinfo: Wad = {
    indentification: '',
    lumpInfo: [],
    lumpHash: {},

    playpal: [],
    colormap: [],
    enddoom: [],
    pnames: [],

    textures: {},
    sprites: {},
    flats: {},
    maps: {},

    animatedFlats: {},
    animatedTextures: {}
  };

  wadinfo.indentification = byteReader.readASCII(4);

  const numLumps = byteReader.readInt32();
  const infotableofs = byteReader.readInt32();

  //read the lump info (directory)
  byteReader.setIndex(infotableofs);

  let mode = LoadMode.normal;

  //we need to figure out if this is a standard wad or an extended wad
  let isExtended = false;

  let filepos: number;
  let size: number;
  let lumpName: string;
  let lumpData: any;
  let newLump: Lump;
  let mapName: string;

  const animatedFlatStartNames = Object.keys(animatedFlatMap);
  const animatedFlatEndNames = animatedFlatStartNames.map<string>((item) => animatedFlatMap[item]);

  const animatedTextureStartNames = Object.keys(animatedTextureMap);
  const animatedTextureEndNames = animatedTextureStartNames.map<string>((item) => animatedTextureMap[item]);

  let animatedFlatKey: string | undefined;
  let animatedTextureKey: string | undefined;

  for (let j = 0; j < numLumps; j++) {
    filepos = byteReader.readInt32();
    size = byteReader.readInt32();
    lumpName = byteReader.readASCII(8).trim().toUpperCase();

    //extract the data into a hash now rather than later
    lumpData = arrayBuffer.slice(filepos, filepos + size);
    newLump = {
      name: lumpName as LumpName,
      data: lumpData
    };

    if (lumpName === LumpName.BEHAVIOR) {
      isExtended = true;
    }

    wadinfo.lumpInfo.push(newLump);
  }

  //now proccess the lumps
  wadinfo.lumpInfo.forEach((lump) => {
    lumpName = lump.name;
    lumpData = lump.data;

    //based on the current mode and the lump name decide what to do with the data
    switch (lumpName) {
      case LumpName.FF_START: 
      case LumpName.F_START: 
      case LumpName.F1_START: 
      case LumpName.F2_START: 
      case LumpName.F3_START:
        mode = LoadMode.flat;
        return;
      case LumpName.SS_START: 
      case LumpName.S_START:
        mode = LoadMode.sprites;
        return;
      case LumpName.P_START: 
      case LumpName.P1_START: 
      case LumpName.P2_START: 
      case LumpName.P3_START:
      case LumpName.FF_END: 
      case LumpName.F_END: 
      case LumpName.F1_END: 
      case LumpName.F2_END: 
      case LumpName.F3_END:
      case LumpName.SS_END: 
      case LumpName.S_END:
      case LumpName.P_END: 
      case LumpName.P1_END: 
      case LumpName.P2_END: 
      case LumpName.P3_END:
        mode = LoadMode.normal;
        return;
    }

    //handle maps too
    if (lumpName.match(/^E[0-9]M[0-9]$/) || lumpName.match(/^MAP[0-9][0-9]$/)) {
      mapName = lumpName;
      wadinfo.maps[mapName] = {
        THINGS: [],
        VERTEXES: [],
        LINEDEFS: [],
        SIDEDEFS: [],
        SECTORS: []
      };
      mode = LoadMode.map;
      return;
    }

    if (mode == LoadMode.map && !mapLumps.includes(lumpName as LumpName)) {
      mode = LoadMode.normal;
    }

    //parse all of the data in the lumps and load them into object structures that are useful
    const lumpDataReader = new ByteReader(lumpData);

    switch (lumpName) {
      //handle some special lumps like textures, audio, intro, demos, help, outro
      case LumpName.PLAYPAL: {
        //convert the built-in palette into a rgb array for better access
        const palette = new Array<[number, number, number]>();
        for (let i = 0; i < 256; i++) {
          const r = lumpDataReader.readUint8();
          const g = lumpDataReader.readUint8();
          const b = lumpDataReader.readUint8();

          palette.push([r, g, b]);
        }

        wadinfo.playpal = palette;

        break;
      }
      case LumpName.COLORMAP:
        wadinfo.colormap = lumpData;
        break;
      case LumpName.ENDDOOM: {
        wadinfo.enddoom = lumpData;
        break;
      }
      case LumpName.PNAMES: {
        const numPatches = lumpDataReader.readInt32();

        const pnames = new Array<string>();
        for (let i = 0; i < numPatches; i++) {
          pnames.push(lumpDataReader.readASCII(8).trim().toUpperCase());
        }

        wadinfo.pnames = pnames;

        break;
      }
      case LumpName.TEXTURES:
      case LumpName.TEXTURE1:
      case LumpName.TEXTURE2: {
        //build up the texture by using the offset provided to lookup data in the patches
        const numTextures = lumpDataReader.readInt32();

        const texOffsets = new Array<number>();
        for (let i = 0; i < numTextures; i++) {
          texOffsets.push(lumpDataReader.readInt32());
        }

        for (let i = 0; i < texOffsets.length; i++) {
          const texOffset = texOffsets[i];
          lumpDataReader.setIndex(texOffset);

          const texName = lumpDataReader.readASCII(8);
          lumpDataReader.skip(4);
          const texWidth = lumpDataReader.readInt16();
          const texHeight = lumpDataReader.readInt16();
          lumpDataReader.skip(4);

          const numPatches = lumpDataReader.readInt16();

          const patches = new Array<Patch>();
          for (let k = 0; k < numPatches; k++) {
            const originX = lumpDataReader.readInt16();
            const originY = lumpDataReader.readInt16();
            const patchIndex = lumpDataReader.readInt16();

            lumpDataReader.skip(4);

            patches.push({
              originX: originX,
              originY: originY,
              patchIndex: patchIndex
            });
          }

          if (animatedTextureKey === undefined) {
            if (animatedTextureStartNames.indexOf(texName) >= 0) {
              animatedTextureKey = texName;
              wadinfo.animatedTextures[animatedTextureKey] = [texName];
            }
          } else {
            wadinfo.animatedTextures[animatedTextureKey].push(texName);
            wadinfo.animatedTextures[texName] = wadinfo.animatedTextures[animatedTextureKey];

            if (animatedTextureEndNames.indexOf(texName) >= 0) {
              animatedTextureKey = undefined;
            }
          }

          wadinfo.textures[texName] = {
            texName: texName,
            texWidth: texWidth,
            texHeight: texHeight,
            patches: patches
          };
        }

        break;
      }
      case LumpName.GENMIDI:
        wadinfo.genmidi = lumpData;
        break;
      case LumpName.DMXGUS:
        wadinfo.dmxgus = lumpData;
        break;
      case LumpName.DEMO1:
        wadinfo.demo1 = lumpData;
        break;
      case LumpName.DEMO2:
        wadinfo.demo2 = lumpData;
        break;
      case LumpName.DEMO3: {
        wadinfo.demo3 = lumpData;
        break;
      }
      case LumpName.BLOCKMAP: {
        const blockMap: BlockMap = {
          header: {
            x: lumpDataReader.readInt16(),
            y: lumpDataReader.readInt16(),
            columns: lumpDataReader.readInt16(),
            rows: lumpDataReader.readInt16()
          },
          blocks: []
        };

        const numBlocks = blockMap.header.columns * blockMap.header.rows;
        const blockIndexes = [];
        for (let i = 0; i < numBlocks; i++) {
          blockIndexes.push(lumpDataReader.readUint16());
        }

        for (let i = 0; i < blockIndexes.length; i++) {
          lumpDataReader.setIndex(blockIndexes[i] * 2 + 2); //skip the first 0x0000 entry

          //keep reading the line definition indexes for the current block
          const block = new Array<number>();
          let lineIndex;

          //keep reading the line definition indexes until we hit the end token
          while ((lineIndex = lumpDataReader.readUint16()) != 0xFFFF) {
            block.push(lineIndex);
          }

          blockMap.blocks.push(block);
        }

        lumpData = blockMap;

        break;
      }
      case LumpName.VERTEXES: {
        const vertexes = new Array<Vertex>();

        while (lumpDataReader.hasMore()) {
          vertexes.push({
            x: lumpDataReader.readInt16(),
            y: lumpDataReader.readInt16()
          });
        }

        lumpData = vertexes;
        break;
      }
      case LumpName.SECTORS: {
        const sectors = new Array<Sector>();

        while (lumpDataReader.hasMore()) {
          const newSector: Sector = {
            floorheight: lumpDataReader.readInt16(),
            ceilingheight: lumpDataReader.readInt16(),
            floorpic: lumpDataReader.readASCII(8),
            ceilingpic: lumpDataReader.readASCII(8),
            lightlevel: lumpDataReader.readInt16(),
            type: lumpDataReader.readInt16(),
            tag: lumpDataReader.readInt16()
          };

          newSector.lightIntensity = newSector.lightlevel / 255;

          sectors.push(newSector);
        }

        lumpData = sectors;
        break;
      }
      case LumpName.SIDEDEFS: {
        const sideDefs = new Array<SideDef>();

        while (lumpDataReader.hasMore()) {
          sideDefs.push({
            xOffset: lumpDataReader.readInt16(),
            yOffset: lumpDataReader.readInt16(),
            topTexture: lumpDataReader.readASCII(8).toUpperCase().trim(),
            bottomTexture: lumpDataReader.readASCII(8).toUpperCase().trim(),
            midTexture: lumpDataReader.readASCII(8).toUpperCase().trim(),
            sector: lumpDataReader.readInt16()
          });
        }

        lumpData = sideDefs;
        break;
      }
      case LumpName.LINEDEFS: {
        const lineDefs = new Array<LineDef>();

        while (lumpDataReader.hasMore()) {
          const v1 = lumpDataReader.readInt16();
          const v2 = lumpDataReader.readInt16();
          const flags = lumpDataReader.readBytesAsBits(2);

          let lineDef: LineDef;

          if (isExtended) {
            lineDef = {
              v1,
              v2,
              flags: {
                impassible: Boolean(flags[0]),
                blockMonsters: Boolean(flags[1]),
                twoSided: Boolean(flags[2]),
                upperUnpegged: Boolean(flags[3]),
                lowerUnpegged: Boolean(flags[4]),
                secret: Boolean(flags[5]),
                blockSound: Boolean(flags[6]),
                notOnMap: Boolean(flags[7]),
                alreadyOnMap: Boolean(flags[8]),
                activateAgain: Boolean(flags[9]),
                activatePlayer: Boolean(flags[10] && !flags[11] && !flags[12]),
                activateMonster: Boolean(!flags[10] && flags[11] && !flags[12]),
                activateHit: Boolean(flags[10] && flags[11]),
                activateBumped: Boolean(!flags[10] && !flags[11] && flags[12]),
                activateShotThrough: Boolean(flags[10] && flags[12]),
                activatePlayerPassthrough: Boolean(flags[11] && flags[12]),
                activatePlayerMonster: Boolean(flags[13]),
                blockAll: Boolean(flags[15])
              },
              special: lumpDataReader.readUint8(),
              arg1: lumpDataReader.readUint8(),
              arg2: lumpDataReader.readUint8(),
              arg3: lumpDataReader.readUint8(),
              arg4: lumpDataReader.readUint8(),
              arg5: lumpDataReader.readUint8(),
              sidenum: [lumpDataReader.readInt16(), lumpDataReader.readInt16()]
            };
          } else {
            lineDef = {
              v1,
              v2,
              flags: {
                impassible: !!flags[0],
                blockMonsters: !!flags[1],
                twoSided: !!flags[2],
                upperUnpegged: !!flags[3],
                lowerUnpegged: !!flags[4],
                secret: !!flags[5],
                blockSound: !!flags[6],
                notOnMap: !!flags[7],
                alreadyOnMap: !!flags[8]
              },
              special: lumpDataReader.readInt16(),
              tag: lumpDataReader.readInt16(),
              sidenum: [lumpDataReader.readInt16(), lumpDataReader.readInt16()]
            };
          }

          lineDefs.push(lineDef);
        }

        lumpData = lineDefs;

        break;
      }
      case LumpName.SSECTORS: {
        const ssectors = new Array<SSector>();

        while (lumpDataReader.hasMore()) {
          ssectors.push({
            numsegs: lumpDataReader.readInt16(),
            firstseg: lumpDataReader.readInt16()
          });
        }

        lumpData = ssectors;
        break;
      }
      case LumpName.NODES: {
        const nodes = new Array<Node>();

        while (lumpDataReader.hasMore()) {
          nodes.push({
            x: lumpDataReader.readInt16(),
            y: lumpDataReader.readInt16(),
            dx: lumpDataReader.readInt16(),
            dy: lumpDataReader.readInt16(),
            bbox: [
              [lumpDataReader.readInt16(), lumpDataReader.readInt16(), lumpDataReader.readInt16(), lumpDataReader.readInt16()],
              [lumpDataReader.readInt16(), lumpDataReader.readInt16(), lumpDataReader.readInt16(), lumpDataReader.readInt16()]
            ],
            children: [lumpDataReader.readInt16(), lumpDataReader.readInt16()],
          });
        }

        lumpData = nodes;
        break;
      }
      case LumpName.SEGS: {
        const segs = new Array<Segment>();

        while (lumpDataReader.hasMore()) {
          segs.push({
            v1: lumpDataReader.readInt16(),
            v2: lumpDataReader.readInt16(),
            angle: lumpDataReader.readInt16(),
            linedef: lumpDataReader.readInt16(),
            side: lumpDataReader.readInt16(),
            offset: lumpDataReader.readInt16()
          });
        }

        lumpData = segs;
        break;
      }
      case LumpName.REJECT: {
        break;
      }
      case LumpName.THINGS: {
        const things = new Array<Thing>();

        if (isExtended) {
          while (lumpDataReader.hasMore()) {
            const thingId = lumpDataReader.readInt16();
            const x = lumpDataReader.readInt16();
            const y = lumpDataReader.readInt16();
            const startHeight = lumpDataReader.readInt16();
            const angle = lumpDataReader.readInt16();
            const type = lumpDataReader.readInt16();
            const flags = lumpDataReader.readBytesAsBits(2);

            const thing = {
              x,
              y,
              angle,
              type,
              flags: {
                difficulty: flags[0] ? difficulty.easy : flags[1] ? difficulty.intermediate : difficulty.hard,
                isDeaf: !!flags[3],
                isDormant: !!flags[4],
                class1Only: !!flags[5],
                class2Only: !!flags[6],
                class3Only: !!flags[7],
                hideInSingleplayer: !!flags[9] || !!flags[10],
                hideInCoop: !!flags[8] || !!flags[10],
                hideInDeathmatch: !!flags[8] || !!flags[9]
              },
              thingId,
              startHeight,
              action: lumpDataReader.readUint8(),
              arg1: lumpDataReader.readUint8(),
              arg2: lumpDataReader.readUint8(),
              arg3: lumpDataReader.readUint8(),
              arg4: lumpDataReader.readUint8(),
              arg5: lumpDataReader.readUint8(),
            };

            things.push(thing);
          }
        } else {
          while (lumpDataReader.hasMore()) {
            const x = lumpDataReader.readInt16();
            const y = lumpDataReader.readInt16();
            const angle = lumpDataReader.readInt16();
            const type = lumpDataReader.readInt16();
            const flags = lumpDataReader.readBytesAsBits(2);

            const thing = {
              x,
              y,
              angle,
              type,
              flags: {
                difficulty: flags[0] ? difficulty.easy : flags[1] ? difficulty.intermediate : difficulty.hard,
                isDeaf: !!flags[3],
                hideInSingleplayer: !!flags[4],
                hideInDeathmatch: !!flags[5],
                hideInCoop: !!flags[6],
                friendly: !!flags[7]
              }
            };

            things.push(thing);
          }
        }

        lumpData = things;
        break;
      }
      default: {
        break;
      }
    }

    switch (mode) {
      case LoadMode.normal: {
        wadinfo.lumpHash[lumpName] = lumpData;
        break;
      }
      case LoadMode.sprites: {
        wadinfo.sprites[lumpName] = lumpData;
        break;
      }
      case LoadMode.flat: {
        if (animatedFlatKey === undefined) {
          if (animatedFlatStartNames.indexOf(lumpName) >= 0) {
            animatedFlatKey = lumpName;
            wadinfo.animatedFlats[animatedFlatKey] = [lumpName];
          }
        } else {
          wadinfo.animatedFlats[animatedFlatKey].push(lumpName);
          wadinfo.animatedFlats[lumpName] = wadinfo.animatedFlats[animatedFlatKey];

          if (animatedFlatEndNames.indexOf(lumpName) >= 0) {
            animatedFlatKey = undefined;
          }
        }

        wadinfo.flats[lumpName] = lumpData;
        break;
      }
      case LoadMode.map: {
        wadinfo.maps[mapName][lumpName] = lumpData;
        break;
      }
    }
  });

  return wadinfo;
};
