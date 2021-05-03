import { Sprite } from '../interfaces/Sprite';

export const createSpriteIndex = (spriteNames: Array<string>): Record<string, Sprite> => {
  const spriteFrames: Record<string, Sprite> = {};

  if (spriteNames.length) {
    for (let i=0; i<spriteNames.length; i++) {
      const spriteName = spriteNames[i];
      const realSpriteName = spriteName.slice(0, 4);
      
      if (!(realSpriteName in spriteFrames)) {
        spriteFrames[realSpriteName] = {};
      }
      
      const dir = spriteName[4],
      frameNum = parseInt(spriteName[5], 10);
      
      //add the direction and frame numbers to the table
      if (!(frameNum in spriteFrames[realSpriteName])) {
        spriteFrames[realSpriteName][frameNum] = {};
      }
      
      spriteFrames[realSpriteName][frameNum][dir] = spriteName;
      
      if (spriteName.length>6) {
        const dir2 = spriteName[6];
        const frameNum2 = parseInt(spriteName[7], 10);
        
        if (!(frameNum2 in spriteFrames[realSpriteName])) {
          spriteFrames[realSpriteName][frameNum2] = {};
        }
        
        spriteFrames[realSpriteName][frameNum2][dir2] = spriteName;
      }
    }
  }

  return spriteFrames;
};
