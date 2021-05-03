export enum SectorKind {
  none = 'none',
  light = 'light',
  stairs = 'stairs',
  wind = 'wind',
  damage = 'damage',
  door = 'door',
  end = 'end',
  friction = 'friction',
  fog = 'fog',
  scroller = 'scroller',
  healing = 'healing',
  lightning = 'lightning',
  sky = 'sky',
  automap = 'automap',
  combo = 'combo',
  both = 'both',
  secret = 'secret'
}
export const enum Direction {
  north = 'north',
  east = 'east',
  south = 'south',
  west = 'west'
};

export const enum DiagonalDirection {
  northeast = 'northeast',
  northwest = 'northwest',
  southeast = 'southeast',
  southwest = 'southwest'
};

export interface SectorBase {
  id: number;
  kind: SectorKind;
  description?: string;
}

export interface SectorTypeNone extends SectorBase {
  kind: SectorKind.none;
}

export interface SectorTypeLight extends SectorBase {
  kind: SectorKind.light;
}

export interface SectorTypeStairs extends SectorBase {
  kind: SectorKind.stairs;
}

export interface SectorTypeWind extends SectorBase {
  kind: SectorKind.wind;
  direction: Direction;
  amount: number;
}

export interface SectorTypeDamage extends SectorBase {
  kind: SectorKind.damage;
}

export interface SectorTypeEnd extends SectorBase {
  kind: SectorKind.end;
}

export interface SectorTypeDoor extends SectorBase {
  kind: SectorKind.door;
}

export interface SectorTypeFriction extends SectorBase {
  kind: SectorKind.friction;
}

export interface SectorTypeFog extends SectorBase {
  kind: SectorKind.fog;
}

export interface SectorTypeScroller extends SectorBase {
  kind: SectorKind.scroller;
  direction?: Direction | DiagonalDirection;
  amount?: number;
}

export interface SectorTypeHealing extends SectorBase {
  kind: SectorKind.healing;
}

export interface SectorTypeLightning extends SectorBase {
  kind: SectorKind.lightning;
}

export interface SectorTypeSky extends SectorBase {
  kind: SectorKind.sky;
}

export interface SectorTypeAutomap extends SectorBase {
  kind: SectorKind.automap;
}

export interface SectorTypeCombo extends SectorBase {
  kind: SectorKind.combo;
}

export interface SectorTypeBoth extends SectorBase {
  kind: SectorKind.both;
}

export interface SectorTypeSecret extends SectorBase {
  kind: SectorKind.secret;
}

export type SectorType = 
  SectorTypeNone |
  SectorTypeLight |
  SectorTypeStairs |
  SectorTypeWind |
  SectorTypeDamage |
  SectorTypeDoor |
  SectorTypeEnd |
  SectorTypeFriction |
  SectorTypeFog |
  SectorTypeScroller |
  SectorTypeHealing |
  SectorTypeLightning |
  SectorTypeSky |
  SectorTypeAutomap |
  SectorTypeCombo |
  SectorTypeBoth |
  SectorTypeSecret;

export const SectorSpecials: Array<SectorType> = [
  { id: 0, kind: SectorKind.none, description: 'Normal' },

  { id: 1, kind: SectorKind.light, description: 'Blink random' },
  { id: 2, kind: SectorKind.light, description: 'Blink 0.5 second' },
  { id: 3, kind: SectorKind.light, description: 'Blink 1.0 second' },
  { id: 8, kind: SectorKind.light, description: 'Oscillates' },
  { id: 12, kind: SectorKind.light, description: 'Blink 0.5 second, synchronized' },
  { id: 13, kind: SectorKind.light, description: 'Blink 1.0 second, synchronized' },
  { id: 17, kind: SectorKind.light, description: 'Flickers randomly' },
  
  { id: 4, kind: SectorKind.both, description: '20% damage per second plus light blink 0.5 second' },
  
  { id: 5, kind: SectorKind.damage, description: '10% damage per second' },
  { id: 7, kind: SectorKind.damage, description: '5% damage per second' },
  { id: 16, kind: SectorKind.damage, description: '20% damage per second' },
  
  { id: 9, kind: SectorKind.secret, description: 'Secret area' },
  
  { id: 10, kind: SectorKind.door, description: '30 seconds after level start, ceiling closes like a door' },
  { id: 14, kind: SectorKind.door, description: '300 seconds after level start, ceiling opens like a door' },
  
  { id: 11, kind: SectorKind.end, description: '20% damage per second. When player dies, level ends' }
];

export const ExtendedSectorSpecials: Array<SectorType> = [
  { id: 0, kind: SectorKind.none, description: 'Normal' },
  
  { id: 26, kind: SectorKind.stairs, description: 'Mark sector to be used for building normal stairs' },
  { id: 27, kind: SectorKind.stairs, description: 'Mark sector to be used for building synchronized stairs' },
  
  { id: 40, kind: SectorKind.wind, direction: Direction.east, amount: 5 },
  { id: 41, kind: SectorKind.wind, direction: Direction.east, amount: 10 },
  { id: 42, kind: SectorKind.wind, direction: Direction.east, amount: 25 },
  { id: 43, kind: SectorKind.wind, direction: Direction.north, amount: 5 },
  { id: 44, kind: SectorKind.wind, direction: Direction.north, amount: 10 },
  { id: 45, kind: SectorKind.wind, direction: Direction.north, amount: 25 },
  { id: 46, kind: SectorKind.wind, direction: Direction.south, amount: 5 },
  { id: 47, kind: SectorKind.wind, direction: Direction.south, amount: 10 },
  { id: 48, kind: SectorKind.wind, direction: Direction.south, amount: 25 },
  { id: 49, kind: SectorKind.wind, direction: Direction.west, amount: 5 },
  { id: 50, kind: SectorKind.wind, direction: Direction.west, amount: 10 },
  { id: 51, kind: SectorKind.wind, direction: Direction.west, amount: 25 },
  
  { id: 68, kind: SectorKind.both, description: '20% damage per second plus light blink 0.5 second' },
  
  { id: 75, kind: SectorKind.end, description: '20% damage per second. When player dies, level ends' },
  
  { id: 74, kind: SectorKind.door, description: '30 seconds after level start, ceiling closes like a door' },
  { id: 78, kind: SectorKind.door, description: '300 seconds after level start, ceiling opens like a door' },
  
  { id: 79, kind: SectorKind.friction, description: 'Low friction' },
  
  { id: 1, kind: SectorKind.light, description: 'Phased light (use lightlevel between 0 and 63 for the starting phase)' },
  { id: 2, kind: SectorKind.light, description: 'Phased light sequence start (use types 3 and 4 in neighboring sectors)' },
  { id: 3, kind: SectorKind.light, description: 'Light sequence step (to be used alternatively with type 4 for a light sequence)' },
  { id: 4, kind: SectorKind.light, description: 'Light sequence step (to be used alternatively with type 3 for a light sequence)' },
  { id: 65, kind: SectorKind.light, description: 'Blink random' },
  { id: 66, kind: SectorKind.light, description: 'Blink 0.5 second' },
  { id: 67, kind: SectorKind.light, description: 'Blink 1.0 second' },
  { id: 72, kind: SectorKind.light, description: 'Oscillates' },
  { id: 76, kind: SectorKind.light, description: 'Blink 0.5 second, synchronized' },
  { id: 77, kind: SectorKind.light, description: 'Blink 1.0 second, synchronized' },
  { id: 81, kind: SectorKind.light, description: 'Flickers randomly' },
  
  { id: 84, kind: SectorKind.combo, description: '5% lava damage per second plus scroll east and light blink 0.5 second' },
  
  { id: 87, kind: SectorKind.fog, description: 'Sector uses outside fog even if the ceiling texture isn\'t the sky texture' },
  
  { id: 69, kind: SectorKind.damage, description: '10% damage per second' },
  { id: 71, kind: SectorKind.damage, description: '5% damage per second' },
  { id: 80, kind: SectorKind.damage, description: '20% damage per second' },
  { id: 82, kind: SectorKind.damage, description: '5% lava damage per second' },
  { id: 83, kind: SectorKind.damage, description: '8% lava damage per second' },
  { id: 85, kind: SectorKind.damage, description: '4% sludge damage per second' },
  { id: 105, kind: SectorKind.damage, description: '+2 increase to nukagecount' },
  { id: 115, kind: SectorKind.damage, description: 'Instant death: 999% damage every tic' },
  { id: 116, kind: SectorKind.damage, description: '+4 to nukagecount' },
  
  { id: 195, kind: SectorKind.automap, description: 'Hidden: sector texture is not shown on the textured automap' },
  
  { id: 196, kind: SectorKind.healing, description: 'Restores 1 hit point every 32 tics' },
  
  { id: 197, kind: SectorKind.lightning, description: 'Light level increases'},
  { id: 198, kind: SectorKind.lightning, description: 'Light level increases by up to 64 units during a lightning flash' },
  { id: 199, kind: SectorKind.lightning, description: 'Light level increases by up to 32 units during a lightning flash' },
  
  { id: 200, kind: SectorKind.sky, description: 'Use the secondary sky texture if the level doesn\'t use a double sky' },
  
  { id: 118, kind: SectorKind.scroller, description: 'Water current, angle and strength depend on sector tag value' },
  { id: 201, kind: SectorKind.scroller, direction: Direction.north, amount: 5 },
  { id: 202, kind: SectorKind.scroller, direction: Direction.north, amount: 10 },
  { id: 203, kind: SectorKind.scroller, direction: Direction.north, amount: 25 },
  { id: 204, kind: SectorKind.scroller, direction: Direction.east, amount: 5 },
  { id: 205, kind: SectorKind.scroller, direction: Direction.east, amount: 10 },
  { id: 206, kind: SectorKind.scroller, direction: Direction.east, amount: 25 },
  { id: 207, kind: SectorKind.scroller, direction: Direction.south, amount: 5 },
  { id: 208, kind: SectorKind.scroller, direction: Direction.south, amount: 10 },
  { id: 209, kind: SectorKind.scroller, direction: Direction.south, amount: 25 },
  { id: 210, kind: SectorKind.scroller, direction: Direction.west, amount: 5 },
  { id: 211, kind: SectorKind.scroller, direction: Direction.west, amount: 10 },
  { id: 212, kind: SectorKind.scroller, direction: Direction.west, amount: 25 },
  { id: 213, kind: SectorKind.scroller, direction: DiagonalDirection.northwest, amount: 5 },
  { id: 214, kind: SectorKind.scroller, direction: DiagonalDirection.northwest, amount: 10 },
  { id: 215, kind: SectorKind.scroller, direction: DiagonalDirection.northwest, amount: 25 },
  { id: 216, kind: SectorKind.scroller, direction: DiagonalDirection.northeast, amount: 5 },
  { id: 217, kind: SectorKind.scroller, direction: DiagonalDirection.northeast, amount: 10 },
  { id: 218, kind: SectorKind.scroller, direction: DiagonalDirection.northeast, amount: 25 },
  { id: 219, kind: SectorKind.scroller, direction: DiagonalDirection.southeast, amount: 5 },
  { id: 220, kind: SectorKind.scroller, direction: DiagonalDirection.southeast, amount: 10 },
  { id: 221, kind: SectorKind.scroller, direction: DiagonalDirection.southeast, amount: 25 },
  { id: 222, kind: SectorKind.scroller, direction: DiagonalDirection.southwest, amount: 5 },
  { id: 223, kind: SectorKind.scroller, direction: DiagonalDirection.southwest, amount: 10 },
  { id: 224, kind: SectorKind.scroller, direction: DiagonalDirection.southwest, amount: 25 },
  { id: 225, kind: SectorKind.scroller, direction: Direction.east, amount: 5 },
  { id: 226, kind: SectorKind.scroller, direction: Direction.east, amount: 10 },
  { id: 227, kind: SectorKind.scroller, direction: Direction.east, amount: 25 },
  { id: 228, kind: SectorKind.scroller, direction: Direction.east, amount: 30 },
  { id: 229, kind: SectorKind.scroller, direction: Direction.east, amount: 35 },
  { id: 230, kind: SectorKind.scroller, direction: Direction.north, amount: 5 },
  { id: 231, kind: SectorKind.scroller, direction: Direction.north, amount: 10 },
  { id: 232, kind: SectorKind.scroller, direction: Direction.north, amount: 25 },
  { id: 233, kind: SectorKind.scroller, direction: Direction.north, amount: 30 },
  { id: 234, kind: SectorKind.scroller, direction: Direction.north, amount: 35 },
  { id: 235, kind: SectorKind.scroller, direction: Direction.south, amount: 5 },
  { id: 236, kind: SectorKind.scroller, direction: Direction.south, amount: 10 },
  { id: 237, kind: SectorKind.scroller, direction: Direction.south, amount: 25 },
  { id: 238, kind: SectorKind.scroller, direction: Direction.south, amount: 30 },
  { id: 239, kind: SectorKind.scroller, direction: Direction.south, amount: 35 },
  { id: 240, kind: SectorKind.scroller, direction: Direction.west, amount: 5 },
  { id: 241, kind: SectorKind.scroller, direction: Direction.west, amount: 10 },
  { id: 242, kind: SectorKind.scroller, direction: Direction.west, amount: 25 },
  { id: 243, kind: SectorKind.scroller, direction: Direction.west, amount: 30 },
  { id: 244, kind: SectorKind.scroller, direction: Direction.west, amount: 35 },
];
