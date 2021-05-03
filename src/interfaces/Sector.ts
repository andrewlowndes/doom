export interface Sector {
  floorheight: number;
  ceilingheight: number;
  floorpic: string;
  ceilingpic: string;
  lightlevel: number;
  type: number;
  tag: number;
  
  lightIntensity?: number; //normalised light level
}
