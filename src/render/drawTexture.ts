import { Texture } from './../interfaces/Texture';
import { WallTexture } from '../interfaces/WallTexture';
import { Wad } from '../interfaces/Wad';

import { roundToPow2 } from '../utils/math';

//some doom textures actually contain transparency when they shouldn't (MAP30), use a threshold to determine if it should be transparent or not (in pixels)
const texturePixelsThreshold = 2;

export const drawTexture = (texture: Texture, wad: Wad, patchesByName: Record<string, CanvasRenderingContext2D>): WallTexture => {
  const textureCanvas = document.createElement('canvas');
  const textureContext = textureCanvas.getContext('2d')!;

  textureCanvas.width = texture.texWidth;
  textureCanvas.height = texture.texHeight;

  //draw the texture by drawing on the patches
  textureContext.clearRect(0, 0, texture.texWidth, texture.texHeight);
  const patches = texture.patches;

  for (let k=0; k<patches.length; k++) {
    const patch = patches[k];
    const patchName = wad.pnames[patch.patchIndex];
    
    textureContext.drawImage(patchesByName[patchName].canvas, patch.originX, patch.originY);
  }

  //determine if the texture is transparent or not
  const pixData = textureContext.getImageData(0, 0, textureCanvas.width, textureCanvas.height).data;
  let transparentPixels = 0;

  for (let i=3; i<pixData.length; i+=4) {
    if (pixData[i] === 0) {
      transparentPixels++;
    }
  }

  const transparent = transparentPixels >= texturePixelsThreshold;
  
  //to get around the noop webgl texture limit with repeat and mipmaps, scale the texture to match the width and height and store a scale
  const resizedCanvas = document.createElement('canvas');
  const resizedContext = resizedCanvas.getContext('2d')!;

  resizedCanvas.width = resizedCanvas.height = roundToPow2(Math.max(textureCanvas.width, textureCanvas.height));

  //fill in a solid colour if there should be no transparency
  if (!transparent && transparentPixels) {
    resizedContext.fillStyle = 'black';
    resizedContext.fillRect(0, 0, resizedCanvas.width, resizedCanvas.height);
  }

  resizedContext.imageSmoothingEnabled = false;
  resizedContext.drawImage(textureCanvas, 0, 0, resizedCanvas.width, resizedCanvas.height);

  return {
    name: '',
    graphics: resizedContext, 
    width: textureCanvas.width, 
    height: textureCanvas.height, 
    transparent
  };
};
