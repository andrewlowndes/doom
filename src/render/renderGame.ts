import { createContext, createRenderer, canvasToTexture, ShaderProgram, createProgram } from 'apl-easy-gl';
import { mat4, vec3 } from 'gl-matrix';

import { animatedFlatFps, animatedWallFps, animatedSpriteFps } from '../constants/WadInfo';
import { thingTypesById, ThingKind } from '../constants/ThingTypes';
import { playerHeight } from '../constants/GameInfo';

import { Triangle } from '../interfaces/Triangle';
import { Thing } from '../interfaces/Thing';
import { Sector } from '../interfaces/Sector';
import { AabbPointType } from '../interfaces/TriangleCache';
import { Wad } from '../interfaces/Wad';
import { WadMap } from '../interfaces/WadMap';
import { SpriteTexture } from '../interfaces/SpriteTexture';

import { angle } from '../utils/math';
import { insertAabbCacheItem } from '../utils/insertAabbCache';
import { findTrianglesAtPosition } from '../utils/findTrianglesAtPosition';
import { pointInTriangle } from '../utils/pointInTriangle';
import { freenavControls } from '../controls/freenavControls';
import { createMapBuffers, MapBuffers } from '../geometry/createBuffers';
import { drawWadAssets, WadAssets } from './drawWadAssets';

import wallsVert  from '../shaders/walls.vert';
import wallsFrag  from '../shaders/walls.frag';
import flatVert  from '../shaders/flat.vert';
import flatFrag  from '../shaders/flat.frag';
import skyVert  from  '../shaders/sky.vert';
import skyFrag  from '../shaders/sky.frag';
import thingsVert  from  '../shaders/things.vert';
import thingsFrag  from '../shaders/things.frag';

interface TriangleHashObject {
  triangle: Triangle;
  sector: Sector;
}

interface ThingSprite {
  sprite: SpriteTexture;
  mirror?: boolean;
}

type FramesByThingNameMap = Record<string, Record<number, Record<number, ThingSprite>>>;

export const renderGame = (canvas: HTMLCanvasElement) => {
  const gl = createContext(canvas, {}, [
    'EXT_frag_depth'
  ]);
  
  const projectionMatrix = mat4.create();
  const modelMatrix = mat4.create();
  const viewMatrix = mat4.create();
  const invViewMatrix = mat4.create();
  const modelViewMatrix = mat4.create();
  const modelViewProjMatrix = mat4.create();
  
  const camera = {
    pos: vec3.fromValues(800.0, 900.0, -100.0),
    lookAt: vec3.fromValues(800.0, 800.0, -200.0),
    up: vec3.fromValues(0.0, 1.0, 0.0),
    near: 0.1,
    far: 64000.0,
    fov: 45
  };

  const shaders = {
    walls: createProgram(gl, wallsVert, wallsFrag),
    flats: createProgram(gl, flatVert, flatFrag),
    sky: createProgram(gl, skyVert, skyFrag),
    things: createProgram(gl, thingsVert, thingsFrag)
  };

  let wad: Wad;
  let map: WadMap;
  let unbindControls: () => void;
  let buffers: MapBuffers;
  let animateFlatIndex: number;
  let animateWallIndex: number;
  let animateSpriteIndex: number;
  let sortedFramesByThingName: FramesByThingNameMap;
  let textures: {
    flats: Record<string, WebGLTexture>,
    walls: Record<string, WebGLTexture>,
    things: Record<string, WebGLTexture>
  };
  let sectorsByThing: Map<Thing, Sector>;
  let time = 0;
  let wadAssets: WadAssets;

  const loadWad = (newWad: Wad, newMap: WadMap) => {
    wad = newWad;
    wadAssets = drawWadAssets(wad);
    
    //update the things and set their directions and frames using the sprite assets
    const framesByThingName: FramesByThingNameMap = {};

    Object.keys(wad.sprites).forEach((spriteName) => {
      const thingName = spriteName.slice(0, 4);
      const sprite = wadAssets.spritesByName[spriteName];
      const frameChar = spriteName[4].charCodeAt(0);
      const direction = parseInt(spriteName[5], 10);
      const frames = framesByThingName[thingName] || {};

      framesByThingName[thingName] = frames;

      frames[direction] = frames[direction] || {};
      frames[direction][frameChar] = { sprite };

      //re-used for another
      if (spriteName.length > 6) {
        const frameChar2 = spriteName[6].charCodeAt(0);
        const direction2 = parseInt(spriteName[7], 10);
        
        frames[direction2] = frames[direction2] || {};
        frames[direction2][frameChar2] = { sprite, mirror: true };
      }
    });

    sortedFramesByThingName = Object.keys(framesByThingName).reduce<FramesByThingNameMap>((acc, thingName) => {
      const frames = framesByThingName[thingName];

      acc[thingName] = Object.keys(frames).map(parseFloat).reduce<Record<number, Array<ThingSprite>>>((acc2, directionNum) => {
        const directionFrames = frames[directionNum];

        acc2[directionNum] = Object.keys(directionFrames).map(parseFloat).sort().reduce<Array<ThingSprite>>((acc3, frameKey) => {
          acc3.push(directionFrames[frameKey]);
          return acc3;
        }, []);
        return acc2;
      }, {});
      return acc;
    }, {});

    textures = {
      flats: wadAssets.flats.reduce<Record<string, WebGLTexture>>((acc, flat) => {
        acc[flat.name] = canvasToTexture(gl, flat.graphics.canvas, {
          minFilter: gl.LINEAR,
          magFilter: gl.NEAREST,
          wrapS: gl.REPEAT,
          wrapT: gl.REPEAT
        });

        return acc;
      }, {}),
      walls: wadAssets.textures.reduce<Record<string, WebGLTexture>>((acc, texture) => {
        acc[texture.name] = canvasToTexture(gl, texture.graphics.canvas, {
          minFilter: texture.transparent ? gl.NEAREST : gl.LINEAR,
          magFilter: gl.NEAREST,
          wrapS: gl.REPEAT,
          wrapT: gl.REPEAT
        });

        return acc;
      }, {}),
      things: wadAssets.sprites.reduce<Record<string, WebGLTexture>>((acc, sprite) => {
        acc[sprite.name] = canvasToTexture(gl, sprite.graphics.canvas, {
          minFilter: gl.NEAREST,
          magFilter: gl.NEAREST,
          wrapS: gl.CLAMP_TO_EDGE,
          wrapT: gl.CLAMP_TO_EDGE
        });

        return acc;
      }, {})
    };

    loadMap(newMap);
  };

  const loadMap = (newMap: WadMap) => {
    map = newMap;

    //unload the previous map
    unbindControls?.();

    //load the new map
    buffers = createMapBuffers(gl, map, wadAssets.texturesByName);

    const playerStart = map.THINGS.filter((thing) => thing.type == 1)[0];
    const rotAngle = playerStart.angle / 180 * Math.PI;
    const playerMapPos = { x: playerStart.x, y: playerStart.y };

    const mapTriangleHash = { x: [], y: [] };

    //add each triangle in the sector to the 2d map hash
    map.SECTORS.forEach((_, sectorIndex) => {
      buffers.sectorTriangles[sectorIndex].forEach((triangle) => {
        const obj: TriangleHashObject = {
          triangle: triangle, 
          sector: map.SECTORS[sectorIndex]
        };

        insertAabbCacheItem<TriangleHashObject>(mapTriangleHash.x, { val: Math.min(triangle[0].x, triangle[1].x, triangle[2].x), type: AabbPointType.min, obj });
        insertAabbCacheItem<TriangleHashObject>(mapTriangleHash.x, { val: Math.max(triangle[0].x, triangle[1].x, triangle[2].x), type: AabbPointType.max, obj });
        insertAabbCacheItem<TriangleHashObject>(mapTriangleHash.y, { val: Math.min(triangle[0].y, triangle[1].y, triangle[2].y), type: AabbPointType.min, obj });
        insertAabbCacheItem<TriangleHashObject>(mapTriangleHash.y, { val: Math.max(triangle[0].y, triangle[1].y, triangle[2].y), type: AabbPointType.max, obj });
      });
    });

    sectorsByThing = new Map<Thing, Sector>();

    map.THINGS.forEach((thingObj: Thing) => {
      const thingTriangles = findTrianglesAtPosition<TriangleHashObject>(mapTriangleHash, { x: thingObj.x, y: thingObj.y });

      let thingSector: Sector | undefined;

      thingTriangles.items.some((item) => {
        if (pointInTriangle(thingObj, item.triangle)) {
          thingSector = item.sector;
          return true;
        }
      });

      if (!thingSector) {
        //oh no, no sector for this thing :P - must be an error in the map design
        console.error(thingObj);
        throw new Error('Could not find sector for thing');
      }

      sectorsByThing.set(thingObj, thingSector);
    });

    const sectorTriangles = findTrianglesAtPosition<TriangleHashObject>(mapTriangleHash, playerMapPos);

    let playerSector: Sector;

    sectorTriangles.items.some((item) => {
      if (pointInTriangle(playerMapPos, item.triangle)) {
        playerSector = item.sector;
        return true;
      }
    });

    const playerYPos = playerSector!.floorheight + playerHeight;

    vec3.set(camera.pos, playerStart.x, playerYPos, -playerStart.y);

    mat4.identity(viewMatrix);
    mat4.rotateY(viewMatrix, viewMatrix, Math.PI / 2 - rotAngle);
    mat4.translate(viewMatrix, viewMatrix, vec3.negate(vec3.create(), camera.pos));

    unbindControls = freenavControls(viewMatrix, canvas);
  };

  const resizeScene = () => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    mat4.perspective(projectionMatrix, camera.fov / 180 * Math.PI, gl.canvas.width / gl.canvas.height, camera.near, camera.far);
  };

  const drawScene = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //TODO: draw only what is visible in the scene to the player
    let shader: ShaderProgram;

    //things
    shader = shaders.things;

    gl.useProgram(shader.program);

    shader.setAttributes({
      aPosition: buffers.thing.position,
      aUv: buffers.thing.uv
    });

    map.THINGS.forEach((thingObj: Thing, thingIndex: number) => {
      const thingType = thingTypesById[thingObj.type];

      if (!thingType || !thingType.sprite || thingType.kind == undefined || thingType.kind === ThingKind.monster) {
        return;
      }

      const spriteObj = sortedFramesByThingName[thingType.sprite];

      const thingAngle = angle({ x: thingObj.x - camera.pos[0], y: -thingObj.y - camera.pos[2] });

      const thingSector = sectorsByThing.get(thingObj);

      if (!spriteObj || !thingSector) {
        return;
      }

      //TODO: use the direction to determine what sprite to show (only applicable for sprites with direction - monsters)
      const spriteFrames = spriteObj[0];

      const thingSprite = spriteFrames[(animateSpriteIndex + thingIndex) % Object.keys(spriteFrames).length]; //step through the frames, change the start offset for each so they appear more random

      const thingYPos = thingType.isFloater ? (thingSector.ceilingheight - thingSprite.sprite.height / 2) : (thingSector.floorheight + thingSprite.sprite.height / 2);

      mat4.identity(modelMatrix);
      mat4.translate(modelMatrix, modelMatrix, [thingObj.x, thingYPos, -thingObj.y]);
      mat4.rotateY(modelMatrix, modelMatrix, -thingAngle);
      mat4.scale(modelMatrix, modelMatrix, [1.0, thingSprite.sprite.height, thingSprite.sprite.width]);

      mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
      mat4.multiply(modelViewProjMatrix, projectionMatrix, modelViewMatrix);

      shader.setUniforms({
        shouldMirror: thingSprite.mirror,
        modelViewProj: modelViewProjMatrix,
        tex: textures.things[thingSprite.sprite.name],
        lightIntensity: thingSector.lightIntensity
      });

      buffers.thing.indices.draw();
    });

    //scene transforms
    mat4.identity(modelMatrix);
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
    mat4.multiply(modelViewProjMatrix, projectionMatrix, modelViewMatrix);

    //floor
    shader = shaders.flats;

    gl.useProgram(shader.program);

    shader.setUniforms({
      modelViewProj: modelViewProjMatrix
    });

    buffers.flats.forEach((flat) => {
      let flatName = flat.flatName;

      const animatedFlat = wad.animatedFlats[flatName];

      if (animatedFlat) {
        flatName = animatedFlat[animateFlatIndex % animatedFlat.length];
      }

      shader.setUniforms({
        tex: textures.flats[flatName],
        lightIntensity: flat.sector.lightIntensity
      });

      shader.setAttributes({
        aPosition: flat.position
      });

      flat.indices.draw();
    });

    //walls
    shader = shaders.walls;
    gl.useProgram(shader.program);

    shader.setUniforms({
      modelViewProj: modelViewProjMatrix
    });

    buffers.walls.forEach((wall) => {
      let textureName = wall.texName;

      const animatedTexture = wad.animatedTextures[textureName];

      if (animatedTexture) {
        textureName = animatedTexture[animateWallIndex % animatedTexture.length];
      }

      shader.setUniforms({
        tex: textures.walls[textureName],
        lightIntensity: wall.sector.lightIntensity,
        shouldClip: wadAssets.texturesByName[textureName].transparent
      });

      shader.setAttributes({
        aPosition: wall.position,
        aUv: wall.uv
      });

      wall.indices.draw();
    });

    //skys
    shader = shaders.sky,
      gl.useProgram(shader.program);

    shader.setUniforms({
      modelViewProj: modelViewProjMatrix
    });

    buffers.skys.forEach((sky) => {
      shader.setAttributes({
        aPosition: sky.position
      });

      sky.indices.draw();
    });
  };

  const renderer = createRenderer(() => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.BACK);

    //camera transform
    mat4.lookAt(viewMatrix, camera.pos, camera.lookAt, camera.up);

    //allow the user to navigate the scene by using first person controls
    unbindControls = freenavControls(viewMatrix, canvas);
  
    resizeScene();
  
    window.addEventListener('resize', () => {
      resizeScene();
    });
  }, (dt: number) => {
    time += dt;
  
    animateFlatIndex = Math.floor(time / (1000 / animatedFlatFps));
    animateWallIndex = Math.floor(time / (1000 / animatedWallFps));
    animateSpriteIndex = Math.floor(time / (1000 / animatedSpriteFps));
  
    mat4.invert(invViewMatrix, viewMatrix);
    vec3.set(camera.pos, invViewMatrix[12], invViewMatrix[13], invViewMatrix[14]);
  
    if (wad && map) {
      drawScene();
    }
  });
  
  renderer.start(window);

  return {
    loadWad,
    loadMap
  }
};
