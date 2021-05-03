import { ColourPalette } from '../interfaces/ColourPalette';

import { flatSize } from '../constants/WadInfo';

import { ByteReader } from '../classes/ByteReader';

export const drawFlat = (data: ArrayBuffer, colourPalette: ColourPalette): CanvasRenderingContext2D => {
  //when a flat name is selected, render a preview of the raw data in the canvas
  const flatCanvas = document.createElement('canvas');
  const flatContext = flatCanvas.getContext('2d');

  if (!flatContext) {
    throw new Error('Could not create 2d canvas');
  }

  flatCanvas.width = flatSize;
  flatCanvas.height = flatSize;

  const flatData = new ByteReader(data);
  const size = flatSize * flatSize;
  const imgData = flatContext.getImageData(0, 0, flatSize, flatSize);
  const pixels = imgData.data;

  for (let i=0, pix=0; i<size; i++) {
    const pixData = flatData.readUint8();
    const rgb = colourPalette[pixData];
    
    //convert the 256 colours to 32bit
    pixels[pix++] = rgb[0];
    pixels[pix++] = rgb[1];
    pixels[pix++] = rgb[2];
    pixels[pix++] = 255;
  }

  flatContext.putImageData(imgData, 0, 0);
  return flatContext;
};
