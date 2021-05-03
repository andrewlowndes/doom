import { ByteReader } from '../classes/ByteReader';
import { ColourPalette } from '../interfaces/ColourPalette';

export const drawPatch = (patchLump: ArrayBuffer, colourPalette: ColourPalette): CanvasRenderingContext2D => {
  const patchData = new ByteReader(patchLump);
  
  //the patch is a standard 'doom image'
  const patchWidth = patchData.readUint16();
  const patchHeight = patchData.readUint16();
  patchData.skip(4); //patchXOffset, patchYOffset

  const patchCanvas = document.createElement('canvas');
  const patchContext = patchCanvas.getContext('2d')!;

  patchCanvas.width = patchWidth;
  patchCanvas.height = patchHeight;

  patchContext.clearRect(0, 0, patchWidth, patchHeight);
  const imgData = patchContext.getImageData(0, 0, patchWidth, patchHeight);
  const pixels = imgData.data;
  
  //column info
  const colOffsets: Array<number> = [];
  for (let i=0; i<patchWidth; i++) {
    colOffsets.push(patchData.readUint32());
  }
  
  //now draw the patch
  for (let i=0; i<colOffsets.length; i++) {
    patchData.setIndex(colOffsets[i]);
    
    let yPos = 0;
    
    while (yPos<patchHeight) {
      const yOffset = patchData.readUint8();
      
      if (yOffset==255) {
        break;
      }
      
      const numPixels = patchData.readUint8();
      
      patchData.skip(1);
      
      for (let j=0; j<numPixels; j++) {
        const pixData = patchData.readUint8();
        const rgb = colourPalette[pixData];
        
        let pixIndex = (i+(yOffset+j)*patchWidth)*4;
        
        pixels[pixIndex++] = rgb[0];
        pixels[pixIndex++] = rgb[1];
        pixels[pixIndex++] = rgb[2];
        pixels[pixIndex] = 255;
      }
      
      patchData.skip(1);
      
      yPos = yOffset+numPixels;
    }
  }
  
  patchContext.putImageData(imgData, 0, 0);

  return patchContext;
};
